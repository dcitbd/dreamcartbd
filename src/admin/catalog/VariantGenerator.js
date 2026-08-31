/**
 * ============================================================================
 * DREAM CART BD — VARIANT MATRIX GENERATOR (VariantGenerator.js)
 * ============================================================================
 */

export const VariantGenerator = {
  render: (existingVariants = []) => {
    return `
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <input type="text" id="variant-input-options" placeholder="যেমন: Color (Red, Blue) | Size (M, L, XL)" class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none" />
          <button type="button" id="generate-matrix-btn" class="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-1.5">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-500"></i> ম্যাট্রিক্স তৈরি করুন
          </button>
        </div>

        <!-- Generated Variants Table -->
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table class="table-modern text-xs">
            <thead>
              <tr>
                <th>ভ্যারিয়েন্ট নাম</th>
                <th>SKU</th>
                <th>প্রাইস (৳)</th>
                <th>স্টক</th>
                <th>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody id="variants-table-body">
              ${existingVariants.length === 0 ? `
                <tr><td colspan="5" class="text-center py-6 text-slate-400">কোনো ভ্যারিয়েন্ট তৈরি করা হয়নি।</td></tr>
              ` : existingVariants.map(v => `
                <tr>
                  <td class="font-bold">${v.variant_name}</td>
                  <td class="font-mono">${v.sku || '-'}</td>
                  <td class="font-bold">৳${v.selling_price}</td>
                  <td>${v.stock}</td>
                  <td><button class="text-rose-500"><i data-lucide="trash" class="w-3.5 h-3.5"></i></button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};
