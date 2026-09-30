/**
 * DREAM CART BD — TRACK ORDER PAGE
 * Live courier tracking, shipment milestones, and store hotline support.
 */

export function renderTrackOrderPage(orderId = "") {
  return `
    <div class="max-w-2xl mx-auto space-y-8 py-8 px-4">
      
      <div class="text-center">
        <span class="badge badge-success text-xs mb-2">লাইভ ট্র্যাকিং</span>
        <h1 class="text-2xl md:text-3xl font-black text-slate-900">Track Your Shipment</h1>
        <p class="text-xs text-slate-500 mt-1">আপনার অর্ডার আইডি (Order ID) বা মোবাইল নম্বর লিখুন</p>
      </div>

      <!-- Search Box -->
      <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div class="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            id="track-input" 
            placeholder="e.g. ORD-2609-1001 or 01581703822" 
            value="${orderId || ''}"
            class="form-control text-sm flex-1 font-mono"
          />
          <button id="btn-track-submit" class="btn-primary text-xs py-3 px-6 whitespace-nowrap font-bold" onclick="alert('কুরিয়ার ট্র্যাকিং স্ট্যাটাস রিফ্রেশ হয়েছে!')">
            Check Status
          </button>
        </div>
      </div>

      <!-- Live Timeline Stepper -->
      <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h4 class="font-bold text-slate-900 text-sm">Order Status: <span class="text-emerald-600 font-extrabold">CONFIRMED & DISPATCHED</span></h4>
            <p class="text-xs text-slate-400">Carrier: Steadfast / Pathao Courier (Tracking ID: ST-849204BD)</p>
          </div>
          <span class="badge badge-success">In Transit</span>
        </div>

        <div class="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
          
          <div class="relative">
            <div class="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 border-4 border-white shadow-sm"></div>
            <div class="font-bold text-slate-900 text-xs">Order Placed & Verified</div>
            <div class="text-[11px] text-slate-500">Order recorded in Google Sheets database</div>
          </div>

          <div class="relative">
            <div class="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 border-4 border-white shadow-sm"></div>
            <div class="font-bold text-slate-900 text-xs">Inventory Reserved & Packaging</div>
            <div class="text-[11px] text-slate-500">Quality check passed at Cumilla central hub (Paduar Bazar)</div>
          </div>

          <div class="relative">
            <div class="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 border-4 border-white shadow-sm"></div>
            <div class="font-bold text-slate-700 text-xs">Handed over to Courier</div>
            <div class="text-[11px] text-slate-400">Parcel in transit to delivery zone</div>
          </div>

          <div class="relative opacity-60">
            <div class="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
            <div class="font-bold text-slate-700 text-xs">Out for Delivery</div>
            <div class="text-[11px] text-slate-400">Rider on the way to customer address</div>
          </div>

        </div>

        <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-500 gap-2">
          <div>
            <span>📍 আউটলেট: চৌধুরী প্লাজা, পদুয়ার বাজার বিশ্বরোড, কুমিল্লা।</span>
          </div>
          <div>
            <a href="https://wa.me/8801581703822" target="_blank" class="text-emerald-600 font-bold hover:underline flex items-center gap-1">
              <span>💬</span> হোয়াটসঅ্যাপ সাপোর্ট: 01581703822
            </a>
          </div>
        </div>
      </div>

    </div>
  `;
}
