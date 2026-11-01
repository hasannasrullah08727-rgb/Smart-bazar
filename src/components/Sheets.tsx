import React, { useState } from 'react';
import { X, Star, Phone, MessageSquare, ShieldCheck, ChevronDown, Download } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DISTRICTS } from '../data/seedProducts';
import { isValidBdMobile } from '../utils/logic';

export const Sheets: React.FC = () => {
  const {
    activeSheet,
    sheetData,
    closeSheet,
    showToast,
    settings,
    sendMessage,
    currentUser,
    updateUserProfile,
    changeUserPassword,
    addReview,
  } = useStore();

  // Contact form state
  const [cName, setCName] = useState(currentUser?.name || '');
  const [cPhone, setCPhone] = useState(currentUser?.phone || '');
  const [cMsg, setCMsg] = useState('');

  // Profile state
  const [profName, setProfName] = useState(currentUser?.name || '');
  const [profPhone, setProfPhone] = useState(currentUser?.phone || '');
  const [profDistrict, setProfDistrict] = useState(currentUser?.district || 'Dhaka');
  const [profAddress, setProfAddress] = useState(currentUser?.address || '');

  // Password state
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');

  // Review state
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Filter state
  const [filterMin, setFilterMin] = useState<number | string>(sheetData?.minPrice || '');
  const [filterMax, setFilterMax] = useState<number | string>(sheetData?.maxPrice || '');
  const [filterRating, setFilterRating] = useState<number>(sheetData?.minRating || 0);
  const [filterInStock, setFilterInStock] = useState<boolean>(sheetData?.inStockOnly || false);

  if (!activeSheet) return null;

  return (
    <div
      id="sheet"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-fade-in"
      onClick={closeSheet}
    >
      <div
        className="bg-white w-full max-w-[600px] max-h-[85vh] rounded-t-2xl flex flex-col overflow-hidden shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#e0e0e0] shrink-0">
          <h3 className="font-bold text-base text-[#212121]">
            {activeSheet === 'help' && 'Help & Support'}
            {activeSheet === 'filter' && 'Filter Products'}
            {activeSheet === 'review' && 'Write a Review'}
            {activeSheet === 'editProfile' && 'Edit Profile & Address'}
            {activeSheet === 'changePassword' && 'Change Password'}
          </h3>
          <button
            onClick={closeSheet}
            className="p-1 text-gray-500 hover:text-black rounded-full hover:bg-gray-100"
            aria-label="Close sheet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* HELP & SUPPORT */}
          {activeSheet === 'help' && (
            <div className="space-y-4">
              <div className="bg-[#fff7f2] border border-[#f85606]/30 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#757575]">Customer Support Hotline</div>
                  <div className="text-base font-bold text-[#f85606]">{settings.phone}</div>
                </div>
                <a
                  href={`tel:${settings.phone}`}
                  className="bg-[#f85606] text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Now
                </a>
              </div>

              {/* FAQs */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#757575]">
                  Frequently Asked Questions
                </h4>
                <details className="border border-[#e0e0e0] rounded-lg p-3 group">
                  <summary className="font-medium text-sm text-[#212121] cursor-pointer flex items-center justify-between list-none">
                    <span>How do I place an order?</span>
                    <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-2 text-xs text-[#757575] leading-relaxed">
                    Browse items, tap Add to Cart or Buy Now, select delivery district and address at
                    checkout, pick Cash on Delivery or Mobile Banking (bKash/Nagad/Rocket), and confirm.
                  </p>
                </details>

                <details className="border border-[#e0e0e0] rounded-lg p-3 group">
                  <summary className="font-medium text-sm text-[#212121] cursor-pointer flex items-center justify-between list-none">
                    <span>Which payment methods are accepted?</span>
                    <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-2 text-xs text-[#757575] leading-relaxed">
                    Cash on Delivery, bKash, Nagad and Rocket. For mobile banking, transfer money to{' '}
                    <span className="font-semibold text-[#212121]">{settings.payNumber}</span> and
                    provide the Transaction ID during checkout.
                  </p>
                </details>

                <details className="border border-[#e0e0e0] rounded-lg p-3 group">
                  <summary className="font-medium text-sm text-[#212121] cursor-pointer flex items-center justify-between list-none">
                    <span>How can I track or cancel my order?</span>
                    <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-2 text-xs text-[#757575] leading-relaxed">
                    Navigate to Account &gt; My Orders or visit the Orders page. You can view
                    real-time status (Pending, Confirmed, Packed, Shipped, Delivered). Pending orders
                    can be cancelled with one click.
                  </p>
                </details>

                <details className="border border-[#e0e0e0] rounded-lg p-3 group">
                  <summary className="font-medium text-sm text-[#212121] cursor-pointer flex items-center justify-between list-none">
                    <span>What is the return policy?</span>
                    <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="mt-2 text-xs text-[#757575] leading-relaxed">
                    Unused products can be returned within 7 days of delivery. Reach out via the
                    contact form or customer hotline for quick processing.
                  </p>
                </details>
              </div>

              {/* Standalone DinStore.html download link */}
              <div className="bg-gray-50 border border-[#e0e0e0] rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#212121]">Single-File HTML Store</div>
                  <div className="text-[11px] text-[#757575]">Standalone DinStore.html (Firebase + offline)</div>
                </div>
                <a
                  href="/DinStore.html"
                  download="DinStore.html"
                  className="bg-gray-200 hover:bg-gray-300 text-[#212121] px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>

              {/* Contact Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!cName || !cPhone || !cMsg) {
                    showToast('Please fill all fields');
                    return;
                  }
                  sendMessage(cName, cPhone, cMsg);
                }}
                className="space-y-3 pt-2 border-t border-[#e0e0e0]"
              >
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#757575]">
                  Send Us a Message
                </h4>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
                  required
                />
                <input
                  type="tel"
                  placeholder="Your Phone Number"
                  value={cPhone}
                  onChange={(e) => setCPhone(e.target.value)}
                  className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
                  required
                />
                <textarea
                  rows={3}
                  placeholder="How can we help you?"
                  value={cMsg}
                  onChange={(e) => setCMsg(e.target.value)}
                  className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-[#f85606] hover:bg-[#d94a04] text-white font-bold py-2.5 rounded-lg text-sm transition-colors"
                >
                  Submit Message
                </button>
              </form>
            </div>
          )}

          {/* FILTER */}
          {activeSheet === 'filter' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1.5">
                  Price Range (৳)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filterMin}
                    onChange={(e) => setFilterMin(e.target.value)}
                    className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2 focus:border-[#f85606] outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filterMax}
                    onChange={(e) => setFilterMax(e.target.value)}
                    className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2 focus:border-[#f85606] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1.5">
                  Minimum Rating
                </label>
                <div className="flex gap-2">
                  {[0, 4, 3, 2].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFilterRating(r)}
                      className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
                        filterRating === r
                          ? 'bg-[#fff7f2] border-[#f85606] text-[#f85606] font-bold'
                          : 'border-[#e0e0e0] text-[#757575]'
                      }`}
                    >
                      {r === 0 ? 'Any' : `${r}★ & up`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="inStockOnly"
                  checked={filterInStock}
                  onChange={(e) => setFilterInStock(e.target.checked)}
                  className="w-4 h-4 text-[#f85606] rounded border-gray-300 focus:ring-[#f85606]"
                />
                <label htmlFor="inStockOnly" className="text-sm font-medium text-[#212121] cursor-pointer">
                  In Stock Only
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFilterMin('');
                    setFilterMax('');
                    setFilterRating(0);
                    setFilterInStock(false);
                    sheetData?.onApply?.({
                      minPrice: undefined,
                      maxPrice: undefined,
                      minRating: 0,
                      inStockOnly: false,
                    });
                    closeSheet();
                  }}
                  className="flex-1 border border-[#e0e0e0] text-[#757575] font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sheetData?.onApply?.({
                      minPrice: filterMin ? Number(filterMin) : undefined,
                      maxPrice: filterMax ? Number(filterMax) : undefined,
                      minRating: filterRating,
                      inStockOnly: filterInStock,
                    });
                    closeSheet();
                  }}
                  className="flex-1 bg-[#f85606] hover:bg-[#d94a04] text-white font-bold py-2.5 rounded-lg text-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* WRITE REVIEW */}
          {activeSheet === 'review' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1.5">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-[#212121] ml-2">
                    {rating} out of 5
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1.5">
                  Your Review
                </label>
                <textarea
                  rows={4}
                  placeholder="Share details of your experience with this item..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
                  required
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!reviewText.trim()) {
                    showToast('Please enter your review text');
                    return;
                  }
                  addReview(sheetData?.productId, rating, reviewText.trim());
                }}
                className="w-full bg-[#f85606] hover:bg-[#d94a04] text-white font-bold py-2.5 rounded-lg text-sm"
              >
                Submit Review
              </button>
            </div>
          )}

          {/* EDIT PROFILE */}
          {activeSheet === 'editProfile' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!profName.trim()) {
                  showToast('Enter your name');
                  return;
                }
                if (!isValidBdMobile(profPhone)) {
                  showToast('Enter a valid Bangladeshi mobile number');
                  return;
                }
                updateUserProfile(profName.trim(), profPhone.trim(), profDistrict, profAddress.trim());
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-semibold text-[#757575] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#757575] block mb-1">
                  Mobile Number (e.g. 01XXXXXXXXX)
                </label>
                <input
                  type="tel"
                  value={profPhone}
                  onChange={(e) => setProfPhone(e.target.value)}
                  className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#757575] block mb-1">District</label>
                <select
                  value={profDistrict}
                  onChange={(e) => setProfDistrict(e.target.value)}
                  className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none bg-white"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#757575] block mb-1">Default Address</label>
                <textarea
                  rows={2}
                  value={profAddress}
                  onChange={(e) => setProfAddress(e.target.value)}
                  placeholder="House, road, area, thana"
                  className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#f85606] hover:bg-[#d94a04] text-white font-bold py-2.5 rounded-lg text-sm mt-2"
              >
                Save Profile
              </button>
            </form>
          )}

          {/* CHANGE PASSWORD */}
          {activeSheet === 'changePassword' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (newPass.length < 6) {
                  showToast('New password must be at least 6 characters');
                  return;
                }
                await changeUserPassword(currPass, newPass);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-semibold text-[#757575] block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currPass}
                  onChange={(e) => setCurrPass(e.target.value)}
                  className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#757575] block mb-1">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#f85606] hover:bg-[#d94a04] text-white font-bold py-2.5 rounded-lg text-sm mt-2"
              >
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
