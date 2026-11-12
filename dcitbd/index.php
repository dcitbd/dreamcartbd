<?php
/**
 * DREAM CART BD — HIGH-SPEED PHP ENTRY POINT (dcitbd/index.php)
 * Preserves 100% of original 3D / interactive layout with Gzip & Ad Pixel Tracking.
 */
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/cache_engine.php';
require_once __DIR__ . '/../includes/pixel_tracker.php';

if (!headers_sent()) {
    if (extension_loaded('zlib') && !ini_get('zlib.output_compression')) {
        @ob_start('ob_gzhandler');
    }
    header('Content-Type: text/html; charset=UTF-8');
    header('X-Powered-By: DreamCartBD-Turbo-PHP-Python/' . DCBD_VERSION);
}
$_dcbd_settings = DcbdCacheEngine::getSiteSettings();
$_dcbd_pixel_head = DcbdPixelTracker::renderHeadScripts($_dcbd_settings);
$_dcbd_pixel_body = DcbdPixelTracker::renderBodyNoscript($_dcbd_settings);
?>
<!DOCTYPE html>
<html lang="bn" class="dark">
<head>
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="48x48" href="/public/icon/favicon-48x48.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/public/icon/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/public/icon/icon-192.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/public/icon/apple-touch-icon.png" />
  <link rel="canonical" href="https://dreamcartbd.com/dcitbd" />
  <meta name="description" content="ওয়েব ডেভেলপমেন্ট, ই-কমার্স অটোমেশন, সফটওয়্যার সলিউশন ও ২৪/৭ টেকনিক্যাল আইটি সার্ভিসেস — Dream Career IT Bangladesh (DCITBD)।" />
  <meta property="og:site_name" content="Dream Cart BD (ড্রিম কার্ট বিডি)" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="আইটি সার্ভিসেস (IT Services) — Dream Career IT Bangladesh | Dream Cart BD" />
  <meta property="og:description" content="ওয়েব ডেভেলপমেন্ট, ই-কমার্স অটোমেশন, সফটওয়্যার সলিউশন ও ২৪/৭ টেকনিক্যাল আইটি সার্ভিসেস — Dream Career IT Bangladesh (DCITBD)।" />
  <meta property="og:url" content="https://dreamcartbd.com/dcitbd" />
  <meta property="og:image" content="https://dreamcartbd.com/public/icon/og-banner.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://dreamcartbd.com/public/icon/og-banner.jpg" />
  <script src="/src/utils/interactiveHub.js"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dream Career IT Bangladesh | সিস্টেম ডেভেলপমেন্ট ও আপগ্রেড চলমান</title>
  <!-- Google Fonts: Hind Siliguri (Bengali) & Outfit (English/Accents) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
  <!-- Tailwind CSS 3.4.17 -->
  <script src="https://cdn.tailwindcss.com/3.4.17"></script>
  <!-- Three.js for 3D Background Engine -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            bengali: ['"Hind Siliguri"', 'sans-serif'],
            outfit: ['"Outfit"', 'sans-serif'],
          },
          colors: {
            brand: {
              50: '#f0fdf4',
              100: '#dcfce7',
              400: '#4ade80',
              500: '#22c55e',
              600: '#16a34a',
              accent: '#38bdf8',
              violet: '#818cf8',
              dark: '#050816',
            }
          },
          animation: {
            'spin-slow': 'spin 18s linear infinite',
            'float-slow': 'float 6s ease-in-out infinite',
            'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
          },
          keyframes: {
            float: {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-10px) rotate(1deg)' },
            },
            pulseGlow: {
              '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
              '50%': { opacity: '0.8', transform: 'scale(1.05)' },
            }
          }
        }
      }
    }
  </script>
  <style>
    body {
      font-family: 'Hind Siliguri', 'Outfit', sans-serif;
      background-color: #030712;
      color: #f3f4f6;
      overflow-x: hidden;
      perspective: 1200px;
    }
    /* 3D Glassmorphism Cards */
    .glass-card {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15);
      transform-style: preserve-3d;
      transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease, border-color 0.25s ease;
    }
    .glass-card:hover {
      border-color: rgba(56, 189, 248, 0.45);
      box-shadow: 0 35px 65px -15px rgba(14, 165, 233, 0.28), inset 0 1px 2px 0 rgba(255, 255, 255, 0.35);
    }
    .preserve-3d {
      transform-style: preserve-3d;
    }
    .translate-z-10 {
      transform: translateZ(28px);
    }
    .translate-z-20 {
      transform: translateZ(48px);
    }
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 7px;
    }
    ::-webkit-scrollbar-track {
      background: #030712;
    }
    ::-webkit-scrollbar-thumb {
      background: #1e293b;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #38bdf8;
    }
  </style>
<?= $_dcbd_pixel_head ?>
</head>
<body class="relative min-h-screen text-slate-100 selection:bg-brand-500 selection:text-white flex flex-col justify-between">
  <?= $_dcbd_pixel_body ?>

  <!-- 3D Canvas Background (Interactive Three.js) -->
  <div id="canvas-container" class="fixed inset-0 pointer-events-none z-0 opacity-80 transition-opacity duration-1000"></div>

  <!-- Radial Ambient Lighting -->
  <div class="fixed -top-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-[130px] pointer-events-none z-0"></div>
  <div class="fixed top-1/2 -right-40 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none z-0"></div>
  <div class="fixed -bottom-40 left-1/3 w-[28rem] h-[28rem] bg-emerald-600/15 rounded-full blur-[130px] pointer-events-none z-0"></div>

  <!-- Main Wrapper -->
  <div class="relative z-10 flex flex-col min-h-screen">

    <!-- Top Navigation / Brand Header -->
    <header class="w-full px-5 lg:px-12 py-5 flex items-center justify-between border-b border-white/10 bg-slate-950/40 backdrop-blur-md">
      <div class="flex items-center gap-3">
        <!-- 3D Geometric Brand Icon -->
        <div class="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-[2px] shadow-lg shadow-cyan-500/25 flex items-center justify-center group transform transition-transform hover:scale-105">
          <div class="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden">
            <svg class="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
        </div>
        <div>
          <h1 class="text-xl md:text-2xl font-outfit font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300">
            Dream Career IT
          </h1>
          <p class="text-xs text-slate-400 tracking-wider font-medium flex items-center gap-1.5">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            BANGLADESH • OFFICIAL PORTAL
          </p>
        </div>
      </div>

      <!-- Quick Action Controls -->
      <div class="flex items-center gap-3">
        <!-- Sound Effect Toggle -->
        <button id="soundToggleBtn" type="button" class="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-white/10 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 transition-all flex items-center gap-2" title="সাউন্ড ইফেক্ট অন/অফ">
          <span id="soundIcon">🔊</span>
          <span class="hidden sm:inline">সাউন্ড অন</span>
        </button>

        <!-- Helpline Direct Link -->
        <a id="navCallBtn" href="tel:01581703822" class="px-4 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5 shadow-sm">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
          <span class="hidden sm:inline">01581703822</span>
          <span class="sm:hidden">কল</span>
        </a>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 flex flex-col justify-center items-center">

      <!-- Hero Notice Badge & Developer Spotlight -->
      <div class="flex flex-wrap items-center justify-center gap-3 mb-5">
        <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-300 text-xs sm:text-sm font-medium backdrop-blur-md animate-float-slow shadow-lg shadow-amber-500/10">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span>সিস্টেম আপগ্রেড ও নতুন ফিচার ডেভেলপমেন্ট চলমান</span>
        </div>

        <!-- Developer Credit Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 text-cyan-300 text-xs sm:text-sm font-medium backdrop-blur-md">
          <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
          <span>ডেভেলপার: <strong>Jainal Abedin</strong></span>
        </div>
      </div>

      <!-- Main Headline with 3D Depth & Gradient -->
      <div class="text-center max-w-4xl mx-auto space-y-4">
        <h2 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none text-white">
          অত্যাধুনিক প্রযুক্তি নিয়ে ফিরছে <br class="hidden sm:block" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-emerald-400 drop-shadow-md">
            Dream Career IT Bangladesh
          </span>
        </h2>
        <p class="text-base sm:text-lg md:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
          সম্মানিত শিক্ষার্থী, কাস্টমার ও ক্লায়েন্টবৃন্দ, আমাদের প্ল্যাটফর্মকে আরও দ্রুতগতির, আধুনিক ও সহজে ব্যবহারের উপযোগী করতে নতুন সিস্টেম ডেভেলপমেন্ট কাজ চলমান রয়েছে। খুব শীঘ্রই আমরা নতুন রূপে ফিরছি!
        </p>
      </div>

      <!-- Interactive 3D Status Tilt Card -->
      <div class="w-full max-w-4xl mt-10 perspective-1000">
        <div id="mainHeroCard" class="glass-card rounded-3xl p-6 sm:p-10 relative overflow-hidden transition-all duration-300 cursor-pointer">
          <!-- Ambient Glow Border Inside Card -->
          <div class="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="relative z-10 preserve-3d">
            <!-- Progress Tracker Header -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 translate-z-10">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                  <svg class="w-5 h-5 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white flex items-center gap-2">
                    প্ল্যাটফর্ম ডেভেলপমেন্ট অগ্রগতি
                    <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Phase 3: Testing & Polish</span>
                  </h3>
                  <p class="text-xs text-slate-400">ডেভেলপমেন্ট তত্ত্বাবধানে: জয়নাল আবেদীন (Developer Jainal Abedin)</p>
                </div>
              </div>
              <div class="text-right">
                <span id="progressText" class="text-3xl font-outfit font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">88%</span>
                <span class="text-xs text-slate-400 block">সম্পন্ন হয়েছে</span>
              </div>
            </div>

            <!-- Dynamic Animated Progress Bar -->
            <div class="my-6 translate-z-10">
              <div class="w-full bg-slate-800/80 rounded-full h-4 p-0.5 border border-white/10 overflow-hidden shadow-inner">
                <div id="dynamicProgressBar" class="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 w-[88%] transition-all duration-1000 relative shadow-lg shadow-cyan-500/30">
                  <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div class="grid grid-cols-4 text-center mt-3 text-xs text-slate-400">
                <div class="text-emerald-400 font-medium">✓ UI/UX ডিজাইন</div>
                <div class="text-emerald-400 font-medium">✓ কোর্স ও ডাটাবেজ</div>
                <div class="text-cyan-400 font-semibold animate-pulse">⚙️ লাইভ টেস্টিং</div>
                <div class="text-slate-500">🚀 কাস্টমার রিলিজ</div>
              </div>
            </div>

            <!-- Live Launch Countdown Timer -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 translate-z-20">
              <div class="bg-slate-900/80 border border-white/5 rounded-2xl p-3 sm:p-4 text-center shadow-lg hover:border-cyan-500/30 transition-all">
                <div id="daysVal" class="text-2xl sm:text-4xl font-outfit font-black text-cyan-400">03</div>
                <div class="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">দিন (Days)</div>
              </div>
              <div class="bg-slate-900/80 border border-white/5 rounded-2xl p-3 sm:p-4 text-center shadow-lg hover:border-cyan-500/30 transition-all">
                <div id="hoursVal" class="text-2xl sm:text-4xl font-outfit font-black text-indigo-400">14</div>
                <div class="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">ঘণ্টা (Hours)</div>
              </div>
              <div class="bg-slate-900/80 border border-white/5 rounded-2xl p-3 sm:p-4 text-center shadow-lg hover:border-cyan-500/30 transition-all">
                <div id="minutesVal" class="text-2xl sm:text-4xl font-outfit font-black text-emerald-400">42</div>
                <div class="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">মিনিট (Mins)</div>
              </div>
              <div class="bg-slate-900/80 border border-white/5 rounded-2xl p-3 sm:p-4 text-center shadow-lg hover:border-cyan-500/30 transition-all">
                <div id="secondsVal" class="text-2xl sm:text-4xl font-outfit font-black text-amber-400">59</div>
                <div class="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">সেকেন্ড (Secs)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3D Feature Cards Grid -->
      <div class="w-full max-w-5xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">

        <!-- Card 1 -->
        <div class="glass-card rounded-2xl p-6 relative group transition-transform duration-300 hover:-translate-y-2">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-white mb-4 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <h4 class="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">আধুনিক আইটি কোর্স ও ট্রেনিং</h4>
          <p class="text-sm text-slate-300 leading-relaxed">
            ফুলস্ট্যাক ওয়েব ডেভেলপমেন্ট, পাইথন প্রোগ্রামিং ও ডিজিটাল স্কিল তৈরিতে Dream Career IT দিচ্ছে ইন্ডাস্ট্রি স্ট্যান্ডার্ড প্রশিক্ষণ।
          </p>
        </div>

        <!-- Card 2 -->
        <div class="glass-card rounded-2xl p-6 relative group transition-transform duration-300 hover:-translate-y-2">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-400 flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h4 class="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">স্মার্ট লার্নিং ড্যাশবোর্ড</h4>
          <p class="text-sm text-slate-300 leading-relaxed">
            রেকর্ডেড ও লাইভ ক্লাস, প্রজেক্ট ফাইল ডাউনলোড ও সরাসরি মেন্টর সাপোর্টের জন্য সম্পূর্ণ নতুন ড্যাশবোর্ড তৈরি হচ্ছে।
          </p>
        </div>

        <!-- Card 3 -->
        <div class="glass-card rounded-2xl p-6 relative group transition-transform duration-300 hover:-translate-y-2">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
          <h4 class="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">২৪/৭ সরাসরি সাপোর্ট</h4>
          <p class="text-sm text-slate-300 leading-relaxed">
            ভর্তি তথ্য, কোর্স সংক্রান্ত জিজ্ঞাসা বা আইটি সেবার প্রয়োজনে আমাদের ডেভেলপার ও সাপোর্ট টিমের সাথে সরাসরি যোগাযোগের সুযোগ।
          </p>
        </div>

      </div>

      <!-- Developer Profile & Direct Contact Card -->
      <div class="w-full max-w-4xl mt-10 glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div class="flex flex-col md:flex-row items-center gap-6 justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-xl shadow-cyan-500/20 flex items-center justify-center">
              <div class="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-cyan-400 text-2xl font-black font-outfit">
                JA
              </div>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-xl font-bold text-white font-outfit">Jainal Abedin</h4>
                <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Developer</span>
              </div>
              <p class="text-xs text-slate-300 mt-0.5">Dream Career IT Bangladesh • Lead Technical Specialist</p>
              <p class="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span>📞 <strong class="text-slate-200">01581703822</strong></span>
                <span>•</span>
                <span>✉️ <strong class="text-slate-200">jainal.dcitbd@gmail.com</strong></span>
              </p>
            </div>
          </div>

          <!-- Direct Developer Action Buttons -->
          <div class="flex items-center gap-3 w-full md:w-auto justify-end">
            <a 
              href="tel:01581703822" 
              class="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span>সরাসরি কল</span>
            </a>
            <a 
              href="https://wa.me/8801581703822?text=Hello%20Jainal%20Abedin,%20I%20am%20contacting%20regarding%20Dream%20Career%20IT%20Bangladesh" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Interactive "Get Notified" and Contact Section -->
      <div class="w-full max-w-3xl mt-12 glass-card rounded-3xl p-6 sm:p-8 text-center relative">
        <h4 class="text-xl sm:text-2xl font-bold text-white mb-2">ওয়েবসাইট চালু হওয়া মাত্রই নোটিফিকেশন পেতে চান?</h4>
        <p class="text-sm text-slate-300 mb-6 max-w-lg mx-auto">
          আপনার ইমেইল বা ফোন নম্বরটি জমা দিন। Dream Career IT Bangladesh লাইভ হওয়ামাত্রই আপনি আকর্ষণীয় ছাড় ও নোটিফিকেশন পাবেন।
        </p>

        <!-- Subscription Form -->
        <form id="notifyForm" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
          <input 
            type="text" 
            id="subscriberContact" 
            placeholder="আপনার ইমেইল অথবা মোবাইল নম্বর" 
            required 
            class="flex-1 px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm transition-all"
          >
          <button 
            type="submit" 
            id="notifySubmitBtn"
            class="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>আমাকে জানান</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
        </form>

        <!-- Stored Subscribers Badge -->
        <div id="subscriberCountWrapper" class="text-xs text-slate-400 flex items-center justify-center gap-2 mb-6">
          <span class="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>ইতিমধ্যে <strong id="subscriberCount" class="text-cyan-300 font-semibold font-outfit">265</strong> জন গ্রাহক অপেক্ষমাণ তালিকায় যুক্ত হয়েছেন</span>
        </div>

        <!-- Quick Reach Buttons (Emergency Contact / Admission Inquiry) -->
        <div class="border-t border-white/10 pt-6">
          <p class="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">যেকোনো তথ্য, কোর্স ভর্তি বা সহায়তায় সরাসরি যোগাযোগ করুন</p>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <!-- WhatsApp Chat -->
            <a 
              id="whatsappBtn" 
              href="https://wa.me/8801581703822?text=Hello%20Dream%20Career%20IT%20Bangladesh,%20I%20am%20interested%20in%20your%20services" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg>
              <span>WhatsApp: 01581703822</span>
            </a>

            <!-- Hotline Phone -->
            <a 
              id="phoneContactBtn" 
              href="tel:01581703822" 
              class="px-4 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span>কল: 01581703822</span>
            </a>

            <!-- Direct Mail Link -->
            <a 
              id="directMailLink" 
              href="mailto:jainal.dcitbd@gmail.com" 
              class="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span>ইমেইল পাঠান</span>
            </a>

            <!-- Copy Email Button -->
            <button 
              type="button" 
              id="copyEmailBtn" 
              class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
            >
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <span id="copyEmailText">ইমেইল কপি করুন</span>
            </button>
          </div>
        </div>

      </div>

    </main>

    <!-- Footer -->
    <footer class="w-full border-t border-white/10 bg-slate-950/60 backdrop-blur-md px-6 py-6 text-center text-xs text-slate-400">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p>© 2026 <strong class="text-slate-200">Dream Career IT Bangladesh</strong>. Developed by <strong class="text-cyan-300">Jainal Abedin</strong>. সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
        <div class="flex items-center gap-4 text-slate-400">
          <span class="hover:text-cyan-300 transition-colors cursor-pointer" id="supportModalTrigger">প্রাইভেসি পলিসি</span>
          <span>•</span>
          <span class="hover:text-cyan-300 transition-colors cursor-pointer" id="officeAddressTrigger">যোগাযোগ ও ঠিকানা</span>
          <span>•</span>
          <span class="hover:text-cyan-300 transition-colors cursor-pointer" id="faqTrigger">প্রশ্নোত্তর</span>
        </div>
      </div>
    </footer>

  </div>

  <!-- Interactive Modal for Info/Dialogs -->
  <div id="infoModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300">
    <div id="infoModalContent" class="glass-card max-w-md w-full rounded-2xl p-6 relative transform scale-95 transition-transform duration-300">
      <button id="modalCloseBtn" type="button" class="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <div id="modalBody" class="space-y-3">
        <!-- Injected via JavaScript -->
      </div>
    </div>
  </div>

  <!-- In-Page Toast Notification (Sandbox Safe - No alert()) -->
  <div id="toastNotification" class="fixed bottom-6 right-6 z-50 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900/95 border border-cyan-500/40 text-white shadow-2xl shadow-cyan-500/20 backdrop-blur-md">
    <div id="toastIcon" class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">✓</div>
    <div>
      <h5 id="toastTitle" class="text-xs font-bold text-cyan-300">সফল হয়েছে</h5>
      <p id="toastMessage" class="text-xs text-slate-300">আপনার তথ্য সংরক্ষিত হয়েছে।</p>
    </div>
  </div>

  <!-- Script: 3D Graphics (Three.js), Audio Synthesizer, 3D Tilt Card & State Logic -->
  <script>
    // --- 1 & 2. Shared Audio & Toast Controller initialized via interactiveHub.js ---
    // --- 3. Interactive Three.js 3D Background Engine ---
    (function initThreeBackground() {
      const container = document.getElementById('canvas-container');
      if (!container || typeof THREE === 'undefined') return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 32;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Central Rotating Glowing Icosahedron Structure
      const icoGeometry = new THREE.IcosahedronGeometry(13, 1);
      const icoMaterial = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      });
      const icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
      scene.add(icosahedron);

      // Inner Core Torus Knot
      const knotGeometry = new THREE.TorusKnotGeometry(6, 1.4, 64, 16);
      const knotMaterial = new THREE.MeshBasicMaterial({
        color: 0x818cf8,
        wireframe: true,
        transparent: true,
        opacity: 0.14,
      });
      const knot = new THREE.Mesh(knotGeometry, knotMaterial);
      scene.add(knot);

      // 3D Particle Constellation
      const particleCount = 280;
      const particleGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 85;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const particleMat = new THREE.PointsMaterial({
        size: 0.35,
        color: 0x4ade80,
        transparent: true,
        opacity: 0.65,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // Mouse Parallax Control
      let targetX = 0;
      let targetY = 0;
      let mouseX = 0;
      let mouseY = 0;

      window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.0008;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.0008;
      }, { passive: true });

      function animate() {
        requestAnimationFrame(animate);
        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        icosahedron.rotation.x += 0.002;
        icosahedron.rotation.y += 0.003;
        knot.rotation.x -= 0.003;
        knot.rotation.y -= 0.002;
        particles.rotation.y -= 0.0007;

        camera.position.x += (targetX * 20 - camera.position.x) * 0.05;
        camera.position.y += (-targetY * 20 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    })();

    // --- 4-8. Initialize Shared Interactive Hub Controller (Tilt, Countdown, Subscribe, Copy Email, Modals) ---
    window.initDcbdInteractiveHub({
      maxTilt: 8,
      scaleHover: '1.01, 1.01, 1.01',
      defaultSubCount: 265,
      subCountKey: 'dreamcareer_sub_count',
      subListKey: 'dreamcareer_subscribers',
      subToastTitle: 'ধন্যবাদ!',
      subToastMsg: 'Dream Career IT লাইভ হওয়ামাত্রই আপনার নম্বরে/ইমেইলে বিশেষ অফারসহ নোটিশ যাবে।',
      modals: {
        officeAddressTrigger: {
          title: 'Dream Career IT Bangladesh যোগাযোগ ও সাপোর্ট',
          body: '<p><strong>প্রতিষ্ঠান:</strong> Dream Career IT Bangladesh</p><p><strong>ডেভেলপার:</strong> Jainal Abedin</p><p><strong>মোবাইল / হটলাইন:</strong> 01581703822</p><p><strong>ইমেইল:</strong> jainal.dcitbd@gmail.com</p><p><strong>সেবা:</strong> আইটি ট্রেনিং, ওয়েব ও সফটওয়্যার সলিউশন, সমগ্র বাংলাদেশ।</p>'
        },
        supportModalTrigger: {
          title: 'প্রাইভেসি ও শিক্ষার্থী/গ্রাহক সুরক্ষা নীতি',
          body: '<p>Dream Career IT Bangladesh গ্রাহক ও শিক্ষার্থীদের তথ্যের সর্বোচ্চ গোপনীয়তা এবং সুরক্ষা নিশ্চিত করে।</p><p>সিস্টেম আপগ্রেড চলাকালীন পূর্ববর্তী সকল ডাটাবেজ ব্যাকআপ ও এনরোলমেন্ট রেকর্ড শতভাগ সুরক্ষিত রয়েছে।</p>'
        },
        faqTrigger: {
          title: 'সাধারণ প্রশ্নোত্তর (FAQ)',
          body: '<p><strong>প্রশ্ন: আপগ্রেড চলাকালীন নতুন ভর্তি বা প্রজেক্ট সংক্রান্ত যোগাযোগ করা যাবে?</strong><br>উত্তর: হ্যাঁ, সরাসরি ডেভেলপার জৈনাল আবেদীনের নম্বরে (01581703822) বা ইমেইলে (jainal.dcitbd@gmail.com) যোগাযোগ করে তথ্য ও সেবা নেওয়া যাবে।</p><p><strong>প্রশ্ন: বর্তমান শিক্ষার্থীদের রানিং ব্যাচের ক্লাস কি সচল রয়েছে?</strong><br>উত্তর: হ্যাঁ, নিয়মিত লাইভ ক্লাস ও মেন্টর সাপোর্ট শিডিউল অনুযায়ী চলছে।</p>'
        }
      }
    });
  </script>
</body>
</html>
