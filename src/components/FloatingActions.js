/**
 * DREAM CART BD — FLOATING FIXED ACTIONS DOCK (FloatingActions.js)
 * Implements:
 * - Desktop: Sleek floating dock with 4 vibrant brand buttons (Cart, WhatsApp, Call, Chat).
 * - Mobile: Collapsed under a single compact 48px floating launcher button positioned above the bottom bar.
 *   Tapping expands/collapses the speed-dial contact buttons.
 */

import { cartStore } from '../store/cartStore.js';

export function renderFloatingActions() {
  const cartCount = cartStore.getCount();

  return `
    <div id="floating-actions-dock">
      
      <!-- Collapsible Action Buttons Group (Desktop: always visible; Mobile: hidden until launcher tapped) -->
      <div id="floating-actions-items">
        
        <!-- 1. Floating Cart Button (Emerald) -->
        <div style="position: relative;">
          <button 
            id="btn-floating-cart" 
            class="floating-btn floating-btn-cart"
            title="আপনার কার্ট দেখুন"
            aria-label="View Cart"
            style="position: relative;"
          >
            <svg style="width: 20px; height: 20px; color: #fff;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <span id="floating-cart-badge" style="position: absolute; top: -5px; right: -5px; background: #fbbf24; color: #0f172a; font-weight: 900; font-size: 10px; min-width: 20px; height: 20px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; padding: 0 4px; border: 2px solid #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.2);" class="${cartCount > 0 ? 'animate-bounce' : ''}">
              ${cartCount}
            </span>
          </button>
        </div>

        <!-- 2. WhatsApp Button with Sub-Buttons (WhatsApp Green) -->
        <div style="position: relative;" id="wa-menu-group">
          <button 
            id="btn-floating-wa" 
            class="floating-btn floating-btn-wa"
            title="হোয়াটসঅ্যাপে চ্যাট করুন"
            aria-label="WhatsApp"
          >
            <svg style="width: 24px; height: 24px; color: #fff;" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.636-.363-.984-.407-1.89-1.282-2.39-2.029-.499-.747-.58-1.468-.58-1.865 0-.417.208-.667.348-.823.14-.156.312-.195.416-.195.104 0 .208.001.299.006.104.005.234-.04.364.271.144.348.49 1.196.532 1.281.042.085.069.185.014.296-.055.111-.083.18-.166.277-.083.097-.175.217-.25.291-.083.084-.17.175-.073.342.097.167.433.714.929 1.155.639.569 1.177.745 1.344.828.167.084.263.07.361-.042.097-.111.416-.486.527-.652.111-.167.222-.139.375-.083.153.055.97.458 1.137.541.167.083.277.125.319.194.042.07.042.404-.102.809z"/>
            </svg>
          </button>

          <!-- WhatsApp Sub-Menu Popup -->
          <div id="wa-sub-menu" class="hidden absolute right-14 bottom-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2.5 space-y-1.5 w-60 z-50 text-xs backdrop-blur-md">
            <div class="font-bold text-slate-800 dark:text-white px-2 py-1 text-[11px] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <span style="width: 8px; height: 8px; border-radius: 9999px; background: #25D366;"></span>
                হোয়াটসঅ্যাপে চ্যাট করুন:
              </span>
              <span style="font-size: 9px; color: #25D366; font-weight: bold; background: rgba(37, 211, 102, 0.1); padding: 2px 6px; border-radius: 4px;">সরাসরি</span>
            </div>
            <a href="https://wa.me/8801581703822?text=Hello%20Dream%20Cart%20BD" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 10px; text-decoration: none; color: #0f172a; font-weight: bold;" class="dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
              <span style="width: 26px; height: 26px; border-radius: 9999px; background: #25D366; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px;">💬</span>
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 12px;">01581703822</span>
                <span style="font-size: 10px; color: #64748b; font-weight: normal;">মাস্টার হেল্পলাইন</span>
              </div>
            </a>
            <a href="https://wa.me/8801818273838?text=Hello%20Dream%20Cart%20BD" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 10px; text-decoration: none; color: #0f172a; font-weight: bold;" class="dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
              <span style="width: 26px; height: 26px; border-radius: 9999px; background: #25D366; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px;">💬</span>
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 12px;">01818273838</span>
                <span style="font-size: 10px; color: #64748b; font-weight: normal;">অর্ডার ও ডেলিভারি ডেস্ক</span>
              </div>
            </a>
          </div>
        </div>

        <!-- 3. Phone Call Button with Sub-Buttons (Telecom Blue) -->
        <div style="position: relative;" id="call-menu-group">
          <button 
            id="btn-floating-call" 
            class="floating-btn floating-btn-call"
            title="সরাসরি ফোন কল করুন"
            aria-label="Call Us"
          >
            <svg style="width: 20px; height: 20px; color: #fff;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
          </button>

          <!-- Call Sub-Menu Popup -->
          <div id="call-sub-menu" class="hidden absolute right-14 bottom-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2.5 space-y-1.5 w-56 z-50 text-xs backdrop-blur-md">
            <div class="font-bold text-slate-800 dark:text-white px-2 py-1 text-[11px] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <span style="width: 8px; height: 8px; border-radius: 9999px; background: #0284c7;"></span>
                সরাসরি কল করুন:
              </span>
              <span style="font-size: 9px; color: #0284c7; font-weight: bold; background: rgba(2, 132, 199, 0.1); padding: 2px 6px; border-radius: 4px;">২৪/৭</span>
            </div>
            <a href="tel:01581703822" style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 10px; text-decoration: none; color: #0f172a; font-weight: bold;" class="dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
              <span style="width: 26px; height: 26px; border-radius: 9999px; background: #0284c7; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px;">📞</span>
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 12px;">01581703822</span>
                <span style="font-size: 10px; color: #64748b; font-weight: normal;">হটলাইন ১</span>
              </div>
            </a>
            <a href="tel:01818273838" style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 10px; text-decoration: none; color: #0f172a; font-weight: bold;" class="dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
              <span style="width: 26px; height: 26px; border-radius: 9999px; background: #0284c7; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px;">📞</span>
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 12px;">01818273838</span>
                <span style="font-size: 10px; color: #64748b; font-weight: normal;">হটলাইন ২</span>
              </div>
            </a>
          </div>
        </div>

        <!-- 4. Live Chat Button (Indigo) -->
        <div>
          <a 
            href="/chat" 
            id="btn-floating-chat"
            class="floating-btn floating-btn-chat"
            title="লাইভ চ্যাট সাপোর্ট"
            aria-label="Live Chat"
          >
            <svg style="width: 20px; height: 20px; color: #fff;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </a>
        </div>

      </div>

      <!-- Single Compact Floating Trigger Button for Mobile (Hidden on Desktop) -->
      <button 
        id="btn-floating-launcher" 
        class="floating-launcher-btn"
        title="যোগাযোগ ও সাহায্য"
        aria-label="Toggle Actions"
      >
        <span id="floating-launcher-icon" style="font-size: 22px; line-height: 1;">💬</span>
      </button>

    </div>
  `;
}
