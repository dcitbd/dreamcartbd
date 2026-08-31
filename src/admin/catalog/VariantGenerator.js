/**
 * ============================================================================
 * DREAM CART BD — VARIANT MATRIX GENERATOR (VariantGenerator.js)
 * ============================================================================
 */

export const VariantGenerator = {
  render: (existingVariants = []) => {
    const variantsList = Array.isArray(existingVariants) ? existingVariants : [];

    return `
      <div class="space-y-4 font-bengali">
        <div class="flex items-center gap-3">
          <input type="text" id="variant-input-options" placeholder="যেমন: Color (Red, Blue) | Size (M, L, XL)" class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none text-slate-900 dark:text-white" />
          <button type="button" id="generate-matrix-btn" class="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-500"></i> ম্যাট্রিক্স তৈরি করুন
          </button>
        </div>

        <!-- Generated Variants Table -->
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table class="table-modern w-full text-xs text-left">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase">
                <th class="py-3 px-4">ভ্যারিয়েন্ট নাম</th>
                <th class="py-3 px-4">SKU</th>
                <th class="py-3 px-4">প্রাইস (৳)</th>
                <th class="py-3 px-4">স্টক</th>
                <th class="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody id="variants-table-body" class="divide-y divide-slate-100 dark:divide-slate-800">
              ${variantsList.length === 0 ? `
                <tr><td colspan="5" class="text-center py-6 text-slate-400">কোনো ভ্যারিয়েন্ট তৈরি করা হয়নি।</td></tr>
              ` : variantsList.map(v => `
                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${v.variant_name || v.name || 'ভ্যারিয়েন্ট'}</td>
                  <td class="py-3 px-4 font-mono text-slate-400">${v.sku || '-'}</td>
                  <td class="py-3 px-4 font-bold text-brand-600">৳${v.selling_price || v.price || 0}</td>
                  <td class="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">${v.stock || 0}</td>
                  <td class="py-3 px-4 text-right">
                    <button type="button" class="text-rose-500 hover:text-rose-600 p-1">
                      <i data-lucide="trash" class="w-3.5 h-3.5"></i>
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};

// গ্লোবাল উইন্ডোতে বাইন্ড করা
if (typeof window !== "undefined") {
  window.VariantGenerator = VariantGenerator;
}

// Default export যুক্ত করা হয়েছে
export default VariantGenerator;
