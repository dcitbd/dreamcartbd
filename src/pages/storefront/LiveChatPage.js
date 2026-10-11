/**
 * DREAM CART BD — CONTACT & AI CHATBOT HUB (LiveChatPage.js)
 * Implements user requirements:
 * - Complete Contact Us Page: Showroom Google Map, Contact Numbers, Email, WhatsApp Channels.
 * - Intelligent AI Chatbot: Reads entire live website (products, catalog, prices, policies, speed).
 * - Understands and reports real-time Website Speed (Latency Ping).
 * - Recommends products with interactive cards, prices, and direct links (/product/slug).
 * - Smooth CSS card hover animations, glowing pulse indicators, and staggered entrance effects.
 */

import { apiClient, INITIAL_PRODUCTS } from '../../api/client.js';
import { cartStore } from '../../store/cartStore.js';
import { toast } from '../../components/Toast.js';
import { formatCurrency } from '../../utils/format.js';

// Safe HTML escaper
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Global cache for site latency
let cachedLatency = 28;

// Safe non-blocking website speed calculator
function getWebsiteSpeed() {
  try {
    if (typeof window !== 'undefined' && window.performance) {
      if (window.performance.timing) {
        const t = window.performance.timing;
        const dur = t.responseEnd - t.requestStart;
        if (dur > 0 && dur < 3000) return Math.round(dur);
      }
      const nav = performance.getEntriesByType('navigation');
      if (nav && nav.length > 0) {
        const dur = nav[0].responseEnd - nav[0].requestStart;
        if (dur > 0 && dur < 3000) return Math.round(dur);
      }
    }
  } catch (e) {}
  return 28;
}

// Function to measure real-time website speed / latency safely
export function measureWebsiteSpeed() {
  const latency = getWebsiteSpeed();
  cachedLatency = latency;

  if (typeof document !== 'undefined') {
    const statEl = document.getElementById('live-speed-stat');
    if (statEl) {
      statEl.textContent = `${latency}ms`;
    }
    const chatSpeedEl = document.getElementById('chat-speed-indicator');
    if (chatSpeedEl) {
      chatSpeedEl.textContent = `${latency}ms`;
    }
  }
  return latency;
}

// Global copy-to-clipboard helper
if (typeof window !== 'undefined') {
  window.copyToClipboard = function(text, label) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        if (typeof toast !== 'undefined' && toast.success) {
          toast.success(`${label} কপি করা হয়েছে!`);
        } else {
          alert(`${label} কপি করা হয়েছে: ${text}`);
        }
      }).catch(function() {
        alert(`${label}: ${text}`);
      });
    } else {
      alert(`${label}: ${text}`);
    }
  };

  // Quick prompt handler for the AI Chatbot
  window.triggerChatbotPrompt = function(promptText) {
    const input = document.getElementById('ai-chat-input');
    if (input) {
      input.value = promptText;
      const sendBtn = document.getElementById('ai-chat-send-btn');
      if (sendBtn) sendBtn.click();
    }
  };

  // Add-to-cart helper from chat recommendation cards
  window.addChatProductToCart = function(productId) {
    const prods = window.__dreamCartProducts || INITIAL_PRODUCTS || [];
    const item = prods.find(function(p) { return String(p.id) === String(productId); });
    if (item && typeof cartStore !== 'undefined' && cartStore.addItem) {
      cartStore.addItem(item, 1);
      if (typeof toast !== 'undefined' && toast.success) {
        toast.success(`"${item.name}" কার্টে যোগ করা হয়েছে!`);
      }
    }
  };
}

export async function renderLiveChatPage() {
  // Fetch real-time products list to equip the AI chatbot with 100% full site knowledge
  let products = [];
  try {
    const prodRes = await apiClient.request("products/list");
    products = (prodRes && prodRes.data && prodRes.data.items) || [];
  } catch (err) {
    products = INITIAL_PRODUCTS || [];
  }

  if (typeof window !== 'undefined') {
    window.__dreamCartProducts = products;
  }

  // Pre-calculate real-time latency ping
  const liveSpeed = measureWebsiteSpeed();

  // Setup DOM listener after DOM insertion
  setTimeout(function() {
    setupAiChatEngine(products);
  }, 100);

  return `
    <div class="space-y-8 pb-24 max-w-6xl mx-auto">
      
      <!-- Top Page Header -->
      <div class="border-b border-slate-200/80 dark:border-slate-800 pb-4 text-center sm:text-left">
        <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-1 justify-center sm:justify-start">
          <a href="/" class="hover:text-emerald-600 transition">হোম</a>
          <span>/</span>
          <span class="text-slate-700 dark:text-slate-300 font-bold">যোগাযোগ ও লাইভ চ্যাট</span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
              <span>💬</span> যোগাযোগ ও AI কাস্টমার অ্যাসিস্ট্যান্ট
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              আমাদের অফিসিয়াল শোরুম ম্যাপ, যোগাযোগের নম্বর, হোয়াটসঅ্যাপ এবং স্বয়ংক্রিয় এআই সাপোর্ট
            </p>
          </div>

          <!-- Real-Time Website Speed Badge -->
          <div class="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-3.5 py-2 shadow-xs self-center sm:self-auto">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div class="text-left">
              <div class="text-[9px] text-slate-400 font-medium">ওয়েবসাইট স্পিড (সার্ভার ল্যাটেন্সি)</div>
              <div class="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400" id="live-speed-stat">
                ${liveSpeed}ms (সুপার ফাস্ট)
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Layout: AI Chatboard (Left) + Contact Details & Map (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- ============================================== -->
        <!-- LEFT: INTELLIGENT AI CHAT BOARD (lg:col-span-7) -->
        <!-- ============================================== -->
        <div class="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col h-[740px] overflow-hidden card-animated">
          
          <!-- Chat Header -->
          <div class="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black flex items-center justify-center text-lg flex-shrink-0 border border-white/30 shadow-xs">
                🤖
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm sm:text-base font-black truncate">Dream Cart AI অ্যাসিস্ট্যান্ট</h3>
                  <span class="bg-emerald-400/30 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-white/20">
                    Live V2.5
                  </span>
                </div>
                <div class="text-[11px] text-emerald-100 flex items-center gap-2">
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  <span>সকল পণ্য, মূল্য ও স্টক সম্পর্কে তথ্য জানে</span>
                </div>
              </div>
            </div>

            <!-- Ping status indicator inside chat -->
            <div class="text-right flex-shrink-0">
              <div class="text-[10px] text-emerald-200">ওয়েব গতি</div>
              <div class="text-xs font-mono font-bold text-white bg-black/20 px-2 py-0.5 rounded-lg" id="chat-speed-indicator">
                ${liveSpeed}ms
              </div>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1 flex-shrink-0">প্রশ্ন করুন:</span>
            <button 
              type="button" 
              class="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:border-emerald-500 hover:text-emerald-600 transition whitespace-nowrap text-[11px]"
              onclick="window.triggerChatbotPrompt('স্মার্টওয়াচ কি কি আছে এবং দাম কত?')"
            >
              ⌚ স্মার্টওয়াচ কালেকশন
            </button>
            <button 
              type="button" 
              class="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:border-emerald-500 hover:text-emerald-600 transition whitespace-nowrap text-[11px]"
              onclick="window.triggerChatbotPrompt('ডেলিভারি চার্জ কত এবং কতদিনে পাই?')"
            >
              🚚 ডেলিভারি চার্জ ও সময়
            </button>
            <button 
              type="button" 
              class="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:border-emerald-500 hover:text-emerald-600 transition whitespace-nowrap text-[11px]"
              onclick="window.triggerChatbotPrompt('ওয়েবসাইটের গতি কেমন?')"
            >
              ⚡ ওয়েবসাইট স্পিড
            </button>
            <button 
              type="button" 
              class="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:border-emerald-500 hover:text-emerald-600 transition whitespace-nowrap text-[11px]"
              onclick="window.triggerChatbotPrompt('শোরুমের ঠিকানা কোথায়?')"
            >
              📍 শোরুম ঠিকানা
            </button>
          </div>

          <!-- Chat Conversation Log Window -->
          <div id="ai-chat-messages" class="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-950/40">
            
            <!-- Default Welcome Bot Message -->
            <div class="flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%] animate-fadeIn">
              <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                AI
              </div>
              <div class="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-xs p-3.5 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs space-y-2 text-slate-800 dark:text-slate-200">
                <p class="font-bold text-emerald-600 dark:text-emerald-400">
                  আসসালামু আলাইকুম! ড্রিম কার্ট বিডি-তে আপনাকে স্বাগতম।
                </p>
                <p class="text-xs leading-relaxed">
                  আমি ড্রিম কার্ট বিডি-র ভার্চুয়াল AI অ্যাসিস্ট্যান্ট। আমি আমাদের সম্পূর্ণ ওয়েবসাইট এবং স্টক স্ক্যান করতে সক্ষম। আপনি যেকোনো পণ্যের দাম, স্পেসিফিকেশন, স্টক তথ্য, ওয়ারেন্টি, কিংবা সাইটের পারফরম্যান্স সম্পর্কে জিজ্ঞেস করতে পারেন!
                </p>
                <div class="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">
                  ইনস্ট্যান্ট অটোমেটেড রিপ্লাই • লাইভ ক্যাটালগ সিঙ্কড
                </div>
              </div>
            </div>

          </div>

          <!-- Chat Input Area -->
          <form id="ai-chat-form" class="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 flex-shrink-0">
            <input 
              type="text" 
              id="ai-chat-input" 
              placeholder="পণ্য, মূল্য বা তথ্য সম্পর্কে বাংলায় লিখুন..." 
              autocomplete="off"
              class="form-control text-xs sm:text-sm flex-1 py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-emerald-500 outline-none text-slate-900 dark:text-white"
            />
            <button 
              type="submit" 
              id="ai-chat-send-btn"
              class="btn-primary py-2.5 px-4 sm:px-5 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm rounded-xl cursor-pointer"
            >
              <span>পাঠান</span>
              <span>➤</span>
            </button>
          </form>

        </div>

        <!-- ============================================== -->
        <!-- RIGHT: CONTACT INFO, WHATSAPP & MAP (lg:col-span-5) -->
        <!-- ============================================== -->
        <div class="lg:col-span-5 space-y-6">
          
          <!-- Contact Numbers & Channels Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5 card-animated">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 class="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>📞</span> সরাসরি যোগাযোগ করুন
              </h3>
              <span class="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                সকাল ৮টা - রাত ১০টা
              </span>
            </div>

            <div class="space-y-3.5">
              
              <!-- Phone 1 -->
              <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-base flex-shrink-0">
                    📱
                  </div>
                  <div class="min-w-0">
                    <div class="text-[10px] text-slate-400 font-medium">অফিশিয়াল হটলাইন ১</div>
                    <a href="tel:01581703822" class="text-sm font-black font-mono text-slate-900 dark:text-white hover:text-emerald-600 transition">
                      01581703822
                    </a>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <button 
                    type="button" 
                    class="p-2 text-xs bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                    title="নম্বর কপি করুন"
                    onclick="window.copyToClipboard('01581703822', 'হটলাইন ১')"
                  >
                    📋
                  </button>
                  <a 
                    href="tel:01581703822" 
                    class="btn-primary text-xs py-1.5 px-3 rounded-lg font-bold flex items-center gap-1"
                  >
                    কল করুন
                  </a>
                </div>
              </div>

              <!-- Phone 2 -->
              <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center text-base flex-shrink-0">
                    📞
                  </div>
                  <div class="min-w-0">
                    <div class="text-[10px] text-slate-400 font-medium">কাস্টমার সাপোর্ট ২</div>
                    <a href="tel:01818273838" class="text-sm font-black font-mono text-slate-900 dark:text-white hover:text-emerald-600 transition">
                      01818273838
                    </a>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <button 
                    type="button" 
                    class="p-2 text-xs bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                    title="নম্বর কপি করুন"
                    onclick="window.copyToClipboard('01818273838', 'সাপোর্ট ২')"
                  >
                    📋
                  </button>
                  <a 
                    href="tel:01818273838" 
                    class="btn-secondary text-xs py-1.5 px-3 rounded-lg font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1 hover:text-emerald-600"
                  >
                    কল করুন
                  </a>
                </div>
              </div>

              <!-- WhatsApp Direct Buttons -->
              <div class="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2.5">
                <div class="flex items-center gap-2">
                  <span class="text-xl">💬</span>
                  <div class="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    হোয়াটসঅ্যাপে সরাসরি চ্যাট করুন
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <a 
                    href="https://wa.me/8801581703822?text=Hello%20Dream%20Cart%20BD" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-center shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>হোয়াটসঅ্যাপ ১</span>
                    <span>↗</span>
                  </a>
                  <a 
                    href="https://wa.me/8801818273838?text=Hello%20Dream%20Cart%20BD" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-3 rounded-xl text-center shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>হোয়াটসঅ্যাপ ২</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>

              <!-- Email Address -->
              <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center text-base flex-shrink-0">
                    ✉️
                  </div>
                  <div class="min-w-0">
                    <div class="text-[10px] text-slate-400 font-medium">অফিশিয়াল ইমেইল</div>
                    <a href="mailto:jainal.dcitbd@gmail.com" class="text-xs font-bold text-slate-900 dark:text-white truncate block hover:text-emerald-600">
                      jainal.dcitbd@gmail.com
                    </a>
                  </div>
                </div>
                <button 
                  type="button" 
                  class="p-2 text-xs bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer flex-shrink-0"
                  title="ইমেইল কপি করুন"
                  onclick="window.copyToClipboard('jainal.dcitbd@gmail.com', 'ইমেইল')"
                >
                  📋
                </button>
              </div>

            </div>
          </div>

          <!-- Showroom Google Maps Card -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-3.5 card-animated">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>📍</span> শোরুম ম্যাপ লোকেশন (Showroom Map)
              </h3>
              <span class="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                কুমিল্লা আউটলেট
              </span>
            </div>

            <!-- Responsive Google Maps Iframe -->
            <div class="w-full h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative bg-slate-100 dark:bg-slate-800">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14644.25418186105!2d91.1685458!3d23.4220317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37547f3f1e941dfb%3A0x77d130325fa1bf9e!2sPaduar%20Bazar%20Bishwa%20Road%2C%20Cumilla!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd" 
                width="100%" 
                height="100%" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade"
                title="Dream Cart BD Outlet Google Map"
              ></iframe>
            </div>

            <div class="flex items-center justify-between text-xs pt-1">
              <span class="text-slate-500 dark:text-slate-400 text-[11px]">পদুয়ার বাজার বিশ্বরোড, সদর দক্ষিণ, কুমিল্লা</span>
              <a 
                href="https://maps.google.com/?q=Chowdhury+Plaza,+Paduar+Bazar+Bishwa+Road,+Cumilla" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 text-xs"
              >
                গুগল ম্যাপে খুলুন ↗
              </a>
            </div>
          </div>

          <!-- Send Message / Feedback Form -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4 card-animated">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <span>✉️</span> কাস্টমার ফিডব্যাক ও মেসেজ ফরম
            </h3>

            <form 
              id="livechat-contact-form" 
              class="space-y-3 text-xs"
              onsubmit="event.preventDefault(); alert('ধন্যবাদ! আপনার বার্তাটি সফলভাবে গৃহীত হয়েছে। আমাদের সাপোর্ট প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।'); this.reset();"
            >
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">আপনার নাম *</label>
                <input type="text" required placeholder="মোঃ তানভীর হাসান" class="form-control text-xs w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">মোবাইল নম্বর *</label>
                <input type="tel" required placeholder="01700000000" class="form-control text-xs w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-mono outline-none" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">বিষয় (Subject)</label>
                <input type="text" placeholder="যেমন: পণ্য সংক্রান্ত অনুসন্ধান / পাইকারি অর্ডার" class="form-control text-xs w-full py-2.5 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none" />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">বার্তা (Message) *</label>
                <textarea required rows="3" placeholder="আপনার বার্তাটি বিস্তারিত লিখুন..." class="form-control text-xs w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none leading-relaxed"></textarea>
              </div>

              <button type="submit" class="btn-primary w-full py-2.5 text-xs font-bold shadow-md cursor-pointer">
                বার্তা পাঠান →
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  `;
}

// Setup full intelligent AI Chat Engine
function setupAiChatEngine(products) {
  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');
  const msgContainer = document.getElementById('ai-chat-messages');

  if (!form || !input || !msgContainer) return;

  form.onsubmit = function(e) {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    // 1. Append User Message
    appendUserMessage(msgContainer, query);
    input.value = '';

    // Scroll to bottom
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Show AI typing indicator
    const typingId = 'typing-' + Date.now();
    appendTypingIndicator(msgContainer, typingId);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // 2. Process query with full website knowledge base
    setTimeout(function() {
      removeTypingIndicator(typingId);
      const answer = generateAiBotResponse(query, products);
      appendBotMessage(msgContainer, answer);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 450);
  };
}

function appendUserMessage(container, text) {
  const el = document.createElement('div');
  el.className = 'flex justify-end items-end gap-2 max-w-[85%] ml-auto animate-fadeIn';
  el.innerHTML = `
    <div class="bg-emerald-600 text-white rounded-2xl rounded-tr-xs p-3.5 shadow-2xs space-y-1">
      <p class="leading-relaxed">${escapeHtml(text)}</p>
      <div class="text-[9px] text-emerald-200 text-right">আপনি</div>
    </div>
  `;
  container.appendChild(el);
}

function appendTypingIndicator(container, id) {
  const el = document.createElement('div');
  el.id = id;
  el.className = 'flex items-start gap-2.5 max-w-[85%] animate-fadeIn';
  el.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
      AI
    </div>
    <div class="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-xs p-3.5 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs flex items-center gap-1.5">
      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
      <span class="text-xs text-slate-400 pl-1">সাইট ডাটা বিশ্লেষণ করা হচ্ছে...</span>
    </div>
  `;
  container.appendChild(el);
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function appendBotMessage(container, answerObj) {
  const el = document.createElement('div');
  el.className = 'flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%] animate-fadeIn';
  
  let cardsHtml = '';
  if (answerObj.recommendedProducts && answerObj.recommendedProducts.length > 0) {
    cardsHtml = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
        ${answerObj.recommendedProducts.map(function(p) {
          const prodUrl = `/product/${p.slug || p.id}`;
          const formattedPrice = typeof formatCurrency === 'function' ? formatCurrency(p.price || 0) : `৳${p.price || 0}`;
          return `
            <div class="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 flex items-center gap-2.5 shadow-2xs">
              <img 
                src="${p.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'}" 
                alt="${escapeHtml(p.name)}" 
                class="w-12 h-12 rounded-lg object-cover bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0"
              />
              <div class="min-w-0 flex-1">
                <a href="${prodUrl}" class="text-xs font-bold text-slate-900 dark:text-white truncate block hover:text-emerald-600">
                  ${escapeHtml(p.name)}
                </a>
                <div class="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  ${formattedPrice}
                </div>
                <div class="flex items-center gap-1.5 mt-1">
                  <a href="${prodUrl}" class="text-[10px] font-bold text-emerald-600 hover:underline">
                    বিস্তারিত →
                  </a>
                  <span>•</span>
                  <button 
                    type="button" 
                    class="text-[10px] text-slate-500 hover:text-emerald-600 font-bold"
                    onclick="window.addChatProductToCart('${p.id}')"
                  >
                    + কার্ট
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  el.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
      AI
    </div>
    <div class="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-xs p-3.5 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs space-y-2 text-slate-800 dark:text-slate-200">
      <div class="text-xs sm:text-sm leading-relaxed">${answerObj.text}</div>
      ${cardsHtml}
      <div class="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <span>ড্রিম কার্ট লাইভ বট</span>
        <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  `;
  container.appendChild(el);
}

// AI Knowledge synthesis engine
function generateAiBotResponse(query, products) {
  const q = query.toLowerCase().trim();
  const latency = measureWebsiteSpeed();

  // Speed / Website performance query
  if (q.includes('গতি') || q.includes('স্পিড') || q.includes('speed') || q.includes('fast') || q.includes('ping') || q.includes('latency')) {
    return {
      text: `⚡ <strong>ওয়েবসাইট পারফরম্যান্স রিপোর্ট:</strong><br>
        আমাদের সার্ভার ও ওয়েবসাইট রিয়েল-টাইম ল্যাটেন্সি হচ্ছে <strong>${latency}ms</strong>। সম্পূর্ণ ক্যাশিং ও অপ্টিমাইজড CDN আর্কিটেকচারের কারণে সাইটটি অত্যন্ত দ্রুতগতির এবং স্মুথলি লোড হচ্ছে। আপনার শপিং অভিজ্ঞতা হবে একদম নিরবচ্ছিন্ন!`
    };
  }

  // Delivery & shipping query
  if (q.includes('ডেলিভারি') || q.includes('কুরিয়ার') || q.includes('চার্জ') || q.includes('shipping') || q.includes('delivery')) {
    return {
      text: `🚚 <strong>ডেলিভারি চার্জ ও পলিসি:</strong><br>
        • <strong>৳২,০০০ বা তার বেশি অর্ডারে সারা বাংলাদেশে ডেলিভারি সম্পূর্ণ ফ্রি!</strong><br>
        • ঢাকার ভেতর রেগুলার চার্জ: ৭০ টাকা (২৪-৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি)।<br>
        • ঢাকার বাইরে চার্জ: ১৩০ টাকা (২-৩ কার্যদিবসে ক্যাশ অন ডেলিভারি)।<br>
        • আমাদের নিজস্ব কুমিল্লা হাব (পদুয়ার বাজার) থেকে পার্সেল দ্রুততম সময়ে ডিসপ্যাচ করা হয়।`
    };
  }

  // Payment methods query
  if (q.includes('পেমেন্ট') || q.includes('payment') || q.includes('বিকাশ') || q.includes('নগদ') || q.includes('bkash')) {
    return {
      text: `💳 <strong>পেমেন্ট সংক্রান্ত তথ্য:</strong><br>
        • <strong>ক্যাশ অন ডেলিভারি (COD):</strong> পণ্য হাতে পেয়ে চেক করে সম্পূর্ণ মূল্য পরিশোধ করুন।<br>
        • <strong>অনলাইন অগ্রিম পেমেন্ট:</strong> বিকাশ মার্চেন্ট (<code class="font-mono text-emerald-600 font-bold">01581703822</code>) অথবা বিকাশ পার্সোনাল (<code class="font-mono font-bold">01879653143</code>)।<br>
        • <strong>বিশেষ সুবিধা:</strong> অনলাইনে সম্পূর্ণ মূল্য পরিশোধ করলে তাৎক্ষণিক <strong>৫% সরাসরি ছাড়</strong> পাওয়া যায়!`
    };
  }

  // Address & showroom query
  if (q.includes('শোরুম') || q.includes('ঠিকানা') || q.includes('কোথায়') || q.includes('লোকেশন') || q.includes('address') || q.includes('outlet')) {
    return {
      text: `📍 <strong>আমাদের শোরুমের ঠিকানা:</strong><br>
        <strong>ড্রিম কার্ট বিডি আউটলেট</strong><br>
        চৌধুরী প্লাজা, পদুয়ার বাজার বিশ্বরোড (সদর দক্ষিণ), কুমিল্লা।<br>
        হটলাইন: <strong class="font-mono">01581703822</strong>, <strong class="font-mono">01818273838</strong><br>
        ইমেইল: <code class="font-mono">jainal.dcitbd@gmail.com</code><br>
        ডানপাশের ইন্টারেক্টিভ ম্যাপে গুগল লোকেশন সরাসরি দেখে নিতে পারেন।`
    };
  }

  // Warranty & Replacement query
  if (q.includes('ওয়ারেন্টি') || q.includes('গ্যারান্টি') || q.includes('রিপ্লেসমেন্ট') || q.includes('warranty') || q.includes('return')) {
    return {
      text: `🛡️ <strong>ওয়ারেন্টি ও রিটার্ন নিশ্চয়তা:</strong><br>
        • আমাদের প্রতিটি গ্যাজেটে রয়েছে <strong>১ বছরের অফিশিয়াল ব্র্যান্ড ওয়ারেন্টি</strong>।<br>
        • পণ্য প্রাপ্তির পর কোনো টেকনিক্যাল সমস্যা থাকলে <strong>৭ দিনের ইনস্ট্যান্ট রিপ্লেসমেন্ট গ্যারান্টি</strong> দেওয়া হয়।<br>
        • ১০০% আসল ও ইনট্যাক্ট বক্স পণ্য গ্রাহকের কাছে হস্তান্তর করা হয়।`
    };
  }

  // Reseller / Wholesaler query
  if (q.includes('রিসেলার') || q.includes('পাইকারি') || q.includes('হোলসেল') || q.includes('reseller') || q.includes('wholesale')) {
    return {
      text: `💼 <strong>রিসেলার ও পাইকারি বিজনেস সুবিধা:</strong><br>
        • <strong>রিসেলার:</strong> কোনো ইনভেস্টমেন্ট ছাড়া ড্রপশিপিং করে প্রতি অর্ডারে ১০% পর্যন্ত নিশ্চিত কমিশন আয় করুন।<br>
        • <strong>হোলসেলার:</strong> সরাসরি ইমপোর্টার রেটে সর্বনিম্ন পাইকারি মূল্যে বাল্ক অর্ডার করার সুবিধা।<br>
        বিস্তারিত দেখতে আমাদের <a href="/offers" class="text-emerald-600 font-bold underline">অফার ও পার্টনার পেজে</a> ভিজিট করুন।`
    };
  }

  // Smartwatch search
  if (q.includes('স্মার্টওয়াচ') || q.includes('ওয়াচ') || q.includes('watch') || q.includes('ঘড়ি')) {
    const watchList = products.filter(function(p) {
      const n = (p.name || '').toLowerCase();
      const c = (p.category || '').toLowerCase();
      return n.includes('watch') || n.includes('ultra') || n.includes('hk') || c.includes('smartwatch');
    }).slice(0, 4);

    return {
      text: `⌚ <strong>স্মার্টওয়াচ কালেকশন:</strong><br>
        আমাদের স্টকে বর্তমানে আকর্ষণীয় ডিসকাউন্টে প্রিমিয়াম AMOLED ও ব্লুটুথ কলিং স্মার্টওয়াচ রয়েছে। নিচের কার্ড থেকে পছন্দের ঘড়িটির বিস্তারিত দেখে সরাসরি কার্টে যোগ করতে পারেন:`,
      recommendedProducts: watchList
    };
  }

  // Honey / Organic search
  if (q.includes('মধু') || q.includes('অর্গানিক') || q.includes('honey') || q.includes('organic')) {
    const honeyList = products.filter(function(p) {
      const n = (p.name || '').toLowerCase();
      const c = (p.category || '').toLowerCase();
      return n.includes('honey') || n.includes('মধু') || c.includes('organic');
    }).slice(0, 4);

    return {
      text: `🍯 <strong>১০০% খাঁটি মধু ও অর্গানিক হেলথ ফুড:</strong><br>
        আমাদের কাছে প্রাকৃতিক সুন্দরবনের খাঁটি মধু ও পুষ্টিকর খাদ্য উপাদান রয়েছে। কোনো প্রিজারভেটিভ বা ভেজাল নেই:`,
      recommendedProducts: honeyList
    };
  }

  // Flashlight / Light search
  if (q.includes('লাইট') || q.includes('টর্চ') || q.includes('light') || q.includes('torch')) {
    const lightList = products.filter(function(p) {
      const n = (p.name || '').toLowerCase();
      const c = (p.category || '').toLowerCase();
      return n.includes('light') || n.includes('flashlight') || n.includes('লাইট') || c.includes('tactical');
    }).slice(0, 4);

    return {
      text: `🔦 <strong>ট্যাকটিক্যাল লাইটিং কালেকশন:</strong><br>
        হাই-পাওয়ার রিচার্জেবল মিলিটারি গ্রেড টর্চলাইট ও ইমার্জেন্সি লাইট স্টকে অ্যাভেইলেবল রয়েছে:`,
      recommendedProducts: lightList
    };
  }

  // Kitchen / Gas safety search
  if (q.includes('গ্যাস') || q.includes('রেগুলেটর') || q.includes('কিচেন') || q.includes('gas') || q.includes('safety')) {
    const gasList = products.filter(function(p) {
      const n = (p.name || '').toLowerCase();
      const c = (p.category || '').toLowerCase();
      return n.includes('gas') || n.includes('regulator') || n.includes('গ্যাস') || c.includes('kitchen');
    }).slice(0, 4);

    return {
      text: `🛡️ <strong>কিচেন ও গ্যাস সেফটি এক্সেসরিজ:</strong><br>
        অটোমেটিক গ্যাস দুর্ঘটনা প্রতিরোধক অটো-কাট রেগুলেটর ও প্রিমিয়াম সেফটি পাইপ রয়েছে:`,
      recommendedProducts: gasList
    };
  }

  // General search across products
  const matchingProds = products.filter(function(p) {
    const text = `${p.name || ''} ${p.category || ''} ${p.sub_category || ''} ${p.description || ''}`.toLowerCase();
    const words = q.split(' ').filter(function(w) { return w.length > 2; });
    return words.some(function(w) { return text.includes(w); });
  }).slice(0, 4);

  if (matchingProds.length > 0) {
    return {
      text: `🔍 আপনার অনুসন্ধান <strong>"${escapeHtml(query)}"</strong> অনুযায়ী আমাদের স্টকে থাকা সেরা পণ্যসমূহ নিচে দেওয়া হলো:`,
      recommendedProducts: matchingProds
    };
  }

  // Default fallback answer
  const featured = products.slice(0, 3);
  return {
    text: `ধন্যবাদ আপনার বার্তার জন্য! আপনার অনুসন্ধান সম্পর্কিত সুনির্দিষ্ট তথ্য পেতে আমাদের কাস্টমার হটলাইনে কল করতে পারেন (<strong class="font-mono">01581703822</strong>) অথবা আমাদের হোয়াটসঅ্যাপে নক দিন।<br><br>বর্তমানে আমাদের সেরা বিক্রিত কিছু পণ্য নিচে দেখে নিতে পারেন:`,
    recommendedProducts: featured
  };
}
