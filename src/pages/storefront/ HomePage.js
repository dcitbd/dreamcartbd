/**
 * ============================================================================
 * DREAM CART BD — HOMEPAGE (HomePage.js)
 * ============================================================================
 */

export function HomePage() {
    return `
    <div class="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-bengali">
        <!-- Hero Section -->
        <section class="relative bg-brand-600 dark:bg-slate-900 text-white py-20 px-6 text-center">
            <div class="max-w-4xl mx-auto space-y-4">
                <span class="inline-block px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold tracking-wide">
                    ✨ ড্রিম কার্ট বিডি-তে স্বাগতম
                </span>
                <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight">
                    আপনার বিশ্বস্ত স্মার্ট ডিজিটাল কমার্স প্ল্যাটফর্ম
                </h1>
                <p class="text-sm md:text-base text-brand-100 max-w-2xl mx-auto">
                    সেরা দামে প্রিমিয়াম পণ্য, আধুনিক গেজেট এবং নিরাপদ শপিং অভিজ্ঞতা।
                </p>
                <div class="pt-4 flex flex-wrap justify-center gap-3">
                    <a href="/products" class="px-6 py-3 rounded-xl bg-white text-brand-600 font-bold shadow-lg hover:bg-slate-100 transition-all text-sm">
                        পণ্যসমূহ দেখুন
                    </a>
                    <a href="/track-order" class="px-6 py-3 rounded-xl bg-brand-700 text-white font-bold border border-white/20 hover:bg-brand-800 transition-all text-sm">
                        অর্ডার ট্র্যাকিং
                    </a>
                </div>
            </div>
        </section>

        <!-- Features Grid -->
        <section class="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div class="w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 text-brand-600 flex items-center justify-center mb-4">
                    <i data-lucide="shield-check" class="w-5 h-5"></i>
                </div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">১০০% আসল পণ্য</h3>
                <p class="text-xs text-slate-500 mt-1">আমরা শতভাগ জেনুইন ও মানসম্মত পণ্যের নিশ্চয়তা প্রদান করি।</p>
            </div>

            <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div class="w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 text-brand-600 flex items-center justify-center mb-4">
                    <i data-lucide="truck" class="w-5 h-5"></i>
                </div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">দ্রুত ডেলিভারি</h3>
                <p class="text-xs text-slate-500 mt-1">দেশের যেকোনো প্রান্তে দ্রুততম সময়ে আপনার ঠিকানায় পণ্য পৌঁছে যায়।</p>
            </div>

            <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div class="w-10 h-10 rounded-xl bg-brand-50 dark:bg-slate-800 text-brand-600 flex items-center justify-center mb-4">
                    <i data-lucide="headphones" class="w-5 h-5"></i>
                </div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">ডেডিকেটেড সাপোর্ট</h3>
                <p class="text-xs text-slate-500 mt-1">যেকোনো প্রয়োজনে আমাদের সাপোর্ট টিম সবসময় আপনার পাশে রয়েছে।</p>
            </div>
        </section>
    </div>
    `;
}

export default HomePage;
