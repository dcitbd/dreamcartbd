/**
 * DREAM CART BD — ORDER SUCCESS PAGE
 * Complete order receipt with store contact, pickup details, and payment hotline.
 */

export function renderOrderSuccessPage(orderId = "ORD-2609-8472") {
  return `
    <div class="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
      
      <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-glow">
        ✓
      </div>

      <div>
        <span class="badge badge-success text-xs mb-2">Order Confirmed</span>
        <h1 class="text-2xl md:text-3xl font-black text-slate-900">আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!</h1>
        <p class="text-xs text-slate-500 mt-2">
          আপনার অর্ডারটি আমাদের সিস্টেমে সংরক্ষিত হয়েছে এবং দ্রুত ডেলিভারির জন্য প্রস্তুত করা হচ্ছে।
        </p>
      </div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-left space-y-3">
        <div class="flex justify-between items-center border-b border-slate-100 pb-3">
          <span class="text-xs text-slate-500">অর্ডার আইডি:</span>
          <span class="text-sm font-extrabold text-emerald-700 font-mono">${orderId}</span>
        </div>
        <div class="flex justify-between items-center border-b border-slate-100 pb-3">
          <span class="text-xs text-slate-500">পেমেন্ট মোড:</span>
          <span class="text-xs font-bold text-slate-800">Cash on Delivery (COD) / Verified Payment</span>
        </div>
        <div class="flex justify-between items-center border-b border-slate-100 pb-3">
          <span class="text-xs text-slate-500">আনুমানিক ডেলিভারি সময়:</span>
          <span class="text-xs font-bold text-slate-800">২ - ৩ কর্মদিবস (কুরিয়ার ট্র্যাকিং সহ)</span>
        </div>
        <div class="pt-2 text-xs text-slate-600 space-y-1">
          <p>📍 <strong>আমাদের ঠিকানা:</strong> চৌধুরী প্লাজা, নিচতলা, রুম #০৩, পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা-৩৫০০।</p>
          <p>📞 <strong>কাস্টমার সাপোর্ট:</strong> 01581703822 (WhatsApp) | 01818273838</p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="#/track?orderId=${orderId}" class="btn-primary text-xs py-3 px-6">
          ডেলিভারি ট্র্যাক করুন →
        </a>
        <a href="https://wa.me/8801581703822?text=Hello%20Dream%20Cart%20BD,%20I%20placed%20order%20${orderId}" target="_blank" class="btn-secondary text-xs py-3 px-6 bg-emerald-50 text-emerald-700 border-emerald-300">
          হোয়াটসঅ্যাপে কনফার্ম করুন
        </a>
        <a href="#/shop" class="btn-secondary text-xs py-3 px-6">
          আরও শপিং করুন
        </a>
      </div>

    </div>
  `;
}
