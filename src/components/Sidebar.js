/**
 * ============================================================================
 * DREAM CART BD — ROLE-BASED SIDEBAR (Sidebar.js)
 * ============================================================================
 */

import { store } from "../js/store.js";

export const Sidebar = {
  render: (activeRoute = "/admin/dashboard") => {
    const currentUser = store?.state?.user || { name: "Admin", role: "super_admin" };
    const userName = currentUser.name || "Admin";
    const userRole = currentUser.role || "super_admin";
    const initialChar = userName.trim().charAt(0) || "A";

    const navItems = [
      { section: "কোর কন্ট্রোল", roles: ["super_admin", "admin"] },
      { label: "ড্যাশবোর্ড", icon: "layout-dashboard", path: "/admin/dashboard", roles: ["super_admin", "admin"] },
      
      { section: "ক্যাটালগ ও প্রোডাক্ট", roles: ["super_admin", "admin"] },
      { label: "প্রোডাক্ট তালিকা", icon: "package", path: "/admin/products", roles: ["super_admin", "admin"] },
      { label: "নতুন প্রোডাক্ট যোগ", icon: "plus-circle", path: "/admin/products/create", roles: ["super_admin", "admin"] },
      { label: "ক্যাটাগরি কন্ট্রোল", icon: "folder-tree", path: "/admin/categories", roles: ["super_admin", "admin"] },

      { section: "অর্ডার ও কুরিয়ার", roles: ["super_admin", "admin", "staff"] },
      { label: "মাস্টার অর্ডার্স", icon: "shopping-cart", path: "/admin/orders", roles: ["super_admin", "admin", "staff"] },
      { label: "কুরিয়ার ও ফ্রড চেক", icon: "shield-alert", path: "/admin/couriers", roles: ["super_admin", "admin"] },

      { section: "ইনভেন্টরি ও স্টক", roles: ["super_admin", "admin"] },
      { label: "স্টক লেজার", icon: "boxes", path: "/admin/inventory", roles: ["super_admin", "admin"] },
      { label: "সাপ্লায়ার ও PO", icon: "truck", path: "/admin/suppliers", roles: ["super_admin", "admin"] },

      { section: "পার্টনার পোর্টাল", roles: ["super_admin", "admin", "seller", "reseller", "wholesaler"] },
      { label: "সেলার ড্যাশবোর্ড", icon: "store", path: "/partner/seller", roles: ["super_admin", "seller"] },
      { label: "রিসেলার হাব", icon: "users", path: "/partner/reseller", roles: ["super_admin", "reseller"] },
      { label: "হোলসেল পোর্টাল", icon: "building", path: "/partner/wholesale", roles: ["super_admin", "wholesaler"] },

      { section: "সিস্টেম ও অটোমেশন", roles: ["super_admin"] },
      { label: "বাল্ক এক্সেল টুলস", icon: "file-spreadsheet", path: "/admin/system/bulk", roles: ["super_admin"] },
      { label: "গ্লোবাল সেটিংস", icon: "settings", path: "/admin/settings", roles: ["super_admin"] },
      { label: "অডিট ট্রেইল", icon: "history", path: "/admin/audit", roles: ["super_admin"] }
    ];

    return `
    <aside class="w-64 min-h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 font-bengali">
      
      <!-- User Profile Header -->
      <div class="p-6 border-b border-slate-800 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white font-bold shadow">
          ${initialChar}
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-bold text-white truncate">${userName}</h4>
          <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-500/20 text-brand-400 uppercase tracking-wider">
            ${userRole}
          </span>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        ${navItems.map(item => {
          if (item.section) {
            return `<div class="px-3 pt-5 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">${item.section}</div>`;
          }
          const isActive = activeRoute === item.path;
          return `
            <a href="${item.path}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20 font-semibold' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }">
              <i data-lucide="${item.icon}" class="w-4 h-4"></i>
              <span>${item.label}</span>
            </a>
          `;
        }).join("")}
      </nav>

      <!-- Bottom Sheet Sync & Logout -->
      <div class="p-4 border-t border-slate-800 space-y-2">
        <button onclick="window.SyncEngine && window.SyncEngine.forceSync ? window.SyncEngine.forceSync() : (window.store && window.store.showToast ? window.store.showToast('সিঙ্ক ইঞ্জিন রেডি হচ্ছে...', 'info') : alert('সিঙ্ক হচ্ছে...'))" class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors">
          <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> গুগল শীট সিঙ্ক
        </button>
        <button onclick="window.store && window.store.logout ? window.store.logout() : null; window.router && window.router.navigate ? window.router.navigate('/login') : (window.location.href = '/login');" class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 transition-colors">
          <i data-lucide="log-out" class="w-3.5 h-3.5"></i> লগআউট
        </button>
      </div>

    </aside>
    `;
  }
};

// গ্লোবাল উইন্ডোতে সেট করা
if (typeof window !== "undefined") {
  window.Sidebar = Sidebar;
}

// Default export যুক্ত করা হয়েছে
export default Sidebar;
