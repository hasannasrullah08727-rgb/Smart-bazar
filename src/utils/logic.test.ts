import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatMoney,
  calcDiscount,
  isValidBdMobile,
  normalizeLogin,
  calcCoupon,
  calcShipping,
  generateOrderId,
  filterProducts,
} from './logic';
import { DEFAULT_COUPONS } from '../data/seedProducts';
import { Product } from '../types/store';

test('formatMoney formats Bangladeshi Taka with symbol', () => {
  assert.equal(formatMoney(850), '৳ 850');
  assert.equal(formatMoney(1500), '৳ 1,500');
  assert.equal(formatMoney(0), '৳ 0');
});

test('calcDiscount computes correct percentage', () => {
  assert.equal(calcDiscount(850, 1500), 43);
  assert.equal(calcDiscount(299, 600), 50);
  assert.equal(calcDiscount(1000, 1000), 0);
  assert.equal(calcDiscount(1200, 1000), 0);
});

test('isValidBdMobile validates Bangladeshi numbers strictly', () => {
  assert.equal(isValidBdMobile('01712345678'), true);
  assert.equal(isValidBdMobile('+8801812345678'), true);
  assert.equal(isValidBdMobile('8801912345678'), true);
  assert.equal(isValidBdMobile('01512-345678'), true);
  assert.equal(isValidBdMobile('01112345678'), false); // 011 is not a valid modern prefix
  assert.equal(isValidBdMobile('12345'), false);
  assert.equal(isValidBdMobile(''), false);
});

test('normalizeLogin trims and normalizes phone and email', () => {
  assert.equal(normalizeLogin('+8801712345678'), '01712345678');
  assert.equal(normalizeLogin(' 01712-345678 '), '01712345678');
  assert.equal(normalizeLogin(' User@Example.COM '), 'user@example.com');
});

test('calcCoupon evaluates WELCOME10, SAVE100 and minimum requirements', () => {
  // WELCOME10: 10% capped at 200
  const c1 = calcCoupon('WELCOME10', 1000, DEFAULT_COUPONS);
  assert.equal(c1.valid, true);
  assert.equal(c1.discount, 100);

  const c1Capped = calcCoupon('WELCOME10', 3000, DEFAULT_COUPONS);
  assert.equal(c1Capped.valid, true);
  assert.equal(c1Capped.discount, 200);

  // SAVE100: 100 off on 1000+
  const c2Fail = calcCoupon('SAVE100', 800, DEFAULT_COUPONS);
  assert.equal(c2Fail.valid, false);
  assert.equal(c2Fail.error, 'Minimum order ৳1000 required');

  const c2Pass = calcCoupon('SAVE100', 1200, DEFAULT_COUPONS);
  assert.equal(c2Pass.valid, true);
  assert.equal(c2Pass.discount, 100);

  // Invalid coupon
  const cInvalid = calcCoupon('NOTREAL', 1000, DEFAULT_COUPONS);
  assert.equal(cInvalid.valid, false);
  assert.equal(cInvalid.error, 'Invalid coupon code');
});

test('calcShipping evaluates near vs far districts and free shipping threshold', () => {
  const settings = { payNumber: '', phone: '', freeShip: 1500, nearFee: 60, farFee: 110 };

  // Near district (Dhaka) < 1500
  assert.equal(calcShipping(1000, 0, 'Dhaka', undefined, settings), 60);

  // Far district (Chattogram) < 1500
  assert.equal(calcShipping(1000, 0, 'Chattogram', undefined, settings), 110);

  // Over free shipping threshold (>= 1500)
  assert.equal(calcShipping(1500, 0, 'Chattogram', undefined, settings), 0);
  assert.equal(calcShipping(2000, 100, 'Khulna', undefined, settings), 0);

  // FREESHIP coupon
  assert.equal(calcShipping(500, 0, 'Chattogram', 'ship', settings), 0);
});

test('generateOrderId creates AS prefix format', () => {
  const id = generateOrderId();
  assert.match(id, /^AS[A-Z0-9]{6}\d{2}$/);
});

test('filterProducts filters by search tokens and category', () => {
  const mockProducts: Product[] = [
    {
      id: 'p1',
      name: 'Wireless Bluetooth Headphones Over Ear',
      category: 'Gadgets',
      brand: 'SoundMax',
      price: 850,
      oldPrice: 1500,
      stock: 25,
      rating: 4.5,
      reviewCount: 120,
      emoji: '🎧',
      color: '#90caf9',
      flash: true,
      description: 'great headphones',
      added: 1000,
    },
    {
      id: 'p2',
      name: "Men's Casual Cotton T-Shirt Full Sleeve",
      category: 'Fashion',
      brand: 'UrbanWear',
      price: 299,
      oldPrice: 600,
      stock: 0,
      rating: 4.2,
      reviewCount: 45,
      emoji: '👕',
      color: '#a5d6a7',
      flash: true,
      description: 'cotton shirt',
      added: 2000,
    },
  ];

  // Search by partial token
  const res1 = filterProducts(mockProducts, { query: 'bluetooth soundmax' });
  assert.equal(res1.length, 1);
  assert.equal(res1[0].id, 'p1');

  // Filter in-stock only
  const res2 = filterProducts(mockProducts, { inStockOnly: true });
  assert.equal(res2.length, 1);
  assert.equal(res2[0].id, 'p1');

  // Filter category
  const res3 = filterProducts(mockProducts, { category: 'Fashion' });
  assert.equal(res3.length, 1);
  assert.equal(res3[0].id, 'p2');
});
