export interface Product {
  id: string;
  name: string;
  category: 'Mart' | 'Fashion' | 'Beauty' | 'Gadgets' | 'Home' | 'Sports' | string;
  brand: string;
  price: number;
  oldPrice: number;
  stock: number;
  rating: number;
  reviewCount: number;
  emoji: string;
  color: string;
  flash: boolean;
  options?: string[];
  description: string;
  added: number;
  image?: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userId: string;
  rating: number;
  text: string;
  verified: boolean;
  date: number;
}

export interface CartItem {
  id: string;
  qty: number;
  opt?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  opt?: string;
  emoji: string;
  color: string;
}

export interface OrderHistoryStep {
  s: 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  t: number;
  note?: string;
}

export interface Order {
  id: string;
  uid: string;
  t: number;
  status: 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  hist: OrderHistoryStep[];
  items: OrderItem[];
  ship: {
    name: string;
    phone: string;
    district: string;
    address: string;
    note?: string;
  };
  pay: {
    method: 'Cash on Delivery' | 'bKash' | 'Nagad' | 'Rocket';
    trx?: string;
    sender?: string;
    status: string;
  };
  sub: number;
  disc: number;
  coupon?: string;
  ship_fee: number;
  total: number;
}

export interface User {
  id: string;
  name: string;
  login: string;
  pass: string;
  role: 'user' | 'admin';
  phone: string;
  address: string;
  district: string;
  joined: number;
}

export interface Settings {
  payNumber: string;
  phone: string;
  freeShip: number;
  nearFee: number;
  farFee: number;
}

export interface Coupon {
  code: string;
  type: 'pct' | 'flat' | 'ship';
  value?: number;
  max?: number;
  min?: number;
  desc: string;
}

export interface Message {
  id: string;
  name: string;
  phone: string;
  message: string;
  date: number;
}
