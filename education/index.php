<?php
/**
 * DREAM CART BD — HIGH-SPEED PHP ENTRY POINT (education/index.php)
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
  <link rel="canonical" href="https://dreamcartbd.com/education" />
  <meta name="description" content="ডিজিটাল স্কিল ডেভেলপমেন্ট, ফ্রিল্যান্সিং, ই-কমার্স বিজনেস ও আইটি প্রশিক্ষণের মাধ্যমে নিজের উজ্জ্বল ক্যারিয়ার গড়ুন — Dream Cart BD।" />
  <meta property="og:site_name" content="Dream Cart BD (ড্রিম কার্ট বিডি)" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="শিখুন ও ক্যারিয়ার গড়ুন (Learn & Build Career) — Dream Cart BD" />
  <meta property="og:description" content="ডিজিটাল স্কিল ডেভেলপমেন্ট, ফ্রিল্যান্সিং, ই-কমার্স বিজনেস ও আইটি প্রশিক্ষণের মাধ্যমে নিজের উজ্জ্বল ক্যারিয়ার গড়ুন — Dream Cart BD।" />
  <meta property="og:url" content="https://dreamcartbd.com/education" />
  <meta property="og:image" content="https://dreamcartbd.com/public/icon/og-banner.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://dreamcartbd.com/public/icon/og-banner.jpg" />
  <script src="/src/utils/interactiveHub.js"></script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>সার্বজনীন শিক্ষা ও জ্ঞান প্ল্যাটফর্ম | ডেভেলপমেন্ট কাজ চলমান</title>
  <!-- Google Fonts: Anek Bangla (Bengali Modern Serif/Sans) & Outfit (Modern Display) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anek+Bangla:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <!-- Tailwind CSS 3.4.17 -->
  <script src="https://cdn.tailwindcss.com/3.4.17"></script>
  <!-- Three.js for 3D Cosmic Celestial Engine -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            bangla: ['"Anek Bangla"', 'sans-serif'],
            outfit: ['"Outfit"', 'sans-serif'],
          },
          colors: {
            cosmos: {
              950: '#02040d',
              900: '#060c21',
              800: '#0c1840',
            },
            accent: {
              gold: '#fbbf24',
              emerald: '#10b981',
              cyan: '#06b6d4',
              violet: '#8b5cf6',
              rose: '#f43f5e',
            }
          },
          animation: {
            'orbit-slow': 'spin 30s linear infinite',
            'float-smooth': 'floating 5s ease-in-out infinite',
            'pulse-glow': 'pulsingGlow 3.5s ease-in-out infinite',
          },
          keyframes: {
            floating: {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' },
            },
            pulsingGlow: {
              '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
              '50%': { opacity: '0.85', transform: 'scale(1.04)' },
            }
          }
        }
      }
    }
  </script>
  <style>
    body {
      font-family: 'Anek Bangla', 'Outfit', sans-serif;
      background-color: #02040d;
      color: #f1f5f9;
      overflow-x: hidden;
      perspective: 1200px;
    }
    /* Cosmic Glassmorphism Cards */
    .cosmic-card {
      background: linear-gradient(135deg, rgba(12, 24, 64, 0.65) 0%, rgba(6, 12, 33, 0.8) 100%);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15);
      transform-style: preserve-3d;
      transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.28s ease, border-color 0.28s ease;
    }
    .cosmic-card:hover {
      border-color: rgba(56, 189, 248, 0.5);
      box-shadow: 0 35px 65px -15px rgba(6, 182, 212, 0.3), inset 0 1px 2px 0 rgba(255, 255, 255, 0.3);
    }
    .preserve-3d {
      transform-style: preserve-3d;
    }
    .translate-z-10 {
      transform: translateZ(25px);
    }
    .translate-z-20 {
      transform: translateZ(45px);
    }
    /* Custom Neon Glow Text */
    .glow-text {
      text-shadow: 0 0 25px rgba(56, 189, 248, 0.55);
    }
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 7px;
    }
    ::-webkit-scrollbar-track {
      background: #02040d;
    }
    ::-webkit-scrollbar-thumb {
      background: #1e293b;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #06b6d4;
    }
  </style>
<?= $_dcbd_pixel_head ?>
</head>
<body class="relative min-h-screen text-slate-100 selection:bg-cyan-500 selection:text-slate-950 flex flex-col justify-between">
  <?= $_dcbd_pixel_body ?>

  <!-- 3D Cosmic Celestial Background (Three.js Orbiting Planetary Rings & Particle Galaxy) -->
  <div id="canvas-container" class="fixed inset-0 pointer-events-none z-0 opacity-85 transition-opacity duration-1000"></div>

  <!-- Radial Aurora Lighting Overlays -->
  <div class="fixed -top-40 -left-40 w-[32rem] h-[32rem] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none z-0"></div>
  <div class="fixed top-1/3 -right-40 w-[30rem] h-[30rem] bg-cyan-600/20 rounded-full blur-[150px] pointer-events-none z-0"></div>
  <div class="fixed -bottom-40 left-1/4 w-[32rem] h-[32rem] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none z-0"></div>

  <!-- Main Container -->
  <div class="relative z-10 flex flex-col min-h-screen">

    <!-- Top Navigation / Platform Header -->
    <header class="w-full px-5 lg:px-12 py-5 flex items-center justify-between border-b border-white/10 bg-cosmos-950/60 backdrop-blur-md">
      <div class="flex items-center gap-3.5">
        <!-- 3D Polyhedral Knowledge Crest -->
        <div class="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-cyan-400 to-indigo-500 p-[2px] shadow-lg shadow-cyan-500/25 flex items-center justify-center transform transition-transform hover:scale-105">
          <div class="w-full h-full bg-cosmos-900 rounded-[14px] flex items-center justify-center overflow-hidden">
            <svg class="w-6 h-6 text-cyan-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
        </div>
        <div>
          <h1 class="text-xl md:text-2xl font-bangla font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-amber-200">
            জ্ঞানকোষ • শিক্ষা ও গবেষণা পোর্টাল
          </h1>
          <p class="text-xs text-slate-400 font-medium tracking-wide flex items-center gap-1.5">
            <span class="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            ইসলাম • প্রযুক্তি • মহাবিশ্ব • রাজনীতি • সার্বজনীন জ্ঞান
          </p>
        </div>
      </div>

      <!-- Header Controls -->
      <div class="flex items-center gap-3">
        <!-- Sound Effect Toggle -->
        <button id="soundToggleBtn" type="button" class="px-3.5 py-1.5 text-xs font-medium rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 transition-all flex items-center gap-2" title="সাউন্ড ইফেক্ট অন/অফ">
          <span id="soundIcon">🔊</span>
          <span class="hidden sm:inline">সাউন্ড অন</span>
        </button>

        <!-- Direct Hotline Link -->
        <a id="navCallBtn" href="tel:01581703822" class="px-4 py-1.5 text-xs font-semibold rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/35 transition-all flex items-center gap-1.5 shadow-sm">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
          <span>01581703822</span>
        </a>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col justify-center items-center">

      <!-- Status Holographic Pill -->
      <div class="mb-5 inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 text-cyan-300 text-xs sm:text-sm font-semibold backdrop-blur-md animate-float-smooth shadow-lg shadow-cyan-500/15">
        <span class="relative flex h-2.5 w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
        <span>সার্বজনীন জ্ঞানালয় প্ল্যাটফর্মের চূড়ান্ত ডেভেলপমেন্ট চলছে • শীঘ্রই উন্মোচন</span>
      </div>

      <!-- Main Catchy Title -->
      <div class="text-center max-w-4xl mx-auto space-y-4">
        <h2 class="text-3xl sm:text-5xl lg:text-6xl font-bangla font-black tracking-tight leading-tight text-white">
          মহাবিশ্ব থেকে প্রযুক্তি, নীতি থেকে ইসলাম <br class="hidden sm:block" />
          <span class="glow-text text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-300 to-indigo-300">
            এক প্ল্যাটফর্মে জ্ঞানের সকল দিগন্ত
          </span>
        </h2>
        <p class="text-base sm:text-lg md:text-xl text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
          সকল প্রকার শিক্ষা বিষয়ক প্রতিষ্ঠান ও জ্ঞানপিপাসুদের জন্য আমরা তৈরি করছি একটি বৈপ্লবিক নলেজ হাব। যেখানে ইসলাম, আইটি ও আধুনিক প্রযুক্তি, ভূ-রাজনীতি, মহাবিশ্ব ও সাধারণ শিক্ষার সমন্বিত ডেটাবেজ থাকবে সম্পূর্ণ উন্মুক্ত।
        </p>
      </div>

      <!-- Interactive 3D Status Tilt Card -->
      <div class="w-full max-w-4xl mt-10 perspective-1000">
        <div id="mainHeroCard" class="cosmic-card rounded-3xl p-6 sm:p-10 relative overflow-hidden transition-all duration-300 cursor-pointer">
          <!-- Ambient Radial Glows -->
          <div class="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="relative z-10 preserve-3d">
            <!-- Progress Tracker Header -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10 translate-z-10">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                  <svg class="w-5 h-5 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white flex items-center gap-2">
                    প্ল্যাটফর্ম সিস্টেম আর্কিটেকচার অগ্রগতি
                    <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Phase 4: Content & AI Sync</span>
                  </h3>
                  <p class="text-xs text-slate-400">ডেভেলপমেন্ট তত্ত্বাবধানে: <strong>Jainal Abedin</strong> (লিড সিস্টেম আর্কিটেক্ট)</p>
                </div>
              </div>
              <div class="text-right">
                <span id="progressText" class="text-3xl font-outfit font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-cyan-400">91%</span>
                <span class="text-xs text-slate-400 block">কার্যক্রম সম্পন্ন</span>
              </div>
            </div>

            <!-- Animated Progress Bar -->
            <div class="my-6 translate-z-10">
              <div class="w-full bg-slate-900/90 rounded-full h-4 p-0.5 border border-white/10 overflow-hidden shadow-inner">
                <div id="dynamicProgressBar" class="h-full rounded-full bg-gradient-to-r from-amber-500 via-cyan-500 to-indigo-500 w-[91%] transition-all duration-1000 relative shadow-lg shadow-cyan-500/30">
                  <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div class="grid grid-cols-4 text-center mt-3 text-xs text-slate-400">
                <div class="text-emerald-400 font-medium">✓ সার্বজনীন সিলেবাস</div>
                <div class="text-emerald-400 font-medium">✓ ক্লাউড ডেটাবেজ</div>
                <div class="text-cyan-400 font-semibold animate-pulse">⚙️ লাইভ ইন্টিগ্রেশন</div>
                <div class="text-slate-500">🚀 পাবলিক রিলিজ</div>
              </div>
            </div>

            <!-- Live Launch Countdown Timer -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 translate-z-20">
              <div class="bg-slate-900/80 border border-white/5 rounded-2xl p-3 sm:p-4 text-center shadow-lg hover:border-amber-500/30 transition-all">
                <div id="daysVal" class="text-2xl sm:text-4xl font-outfit font-black text-amber-400">03</div>
                <div class="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">দিন (Days)</div>
              </div>
              <div class="bg-slate-900/80 border border-white/5 rounded-2xl p-3 sm:p-4 text-center shadow-lg hover:border-cyan-500/30 transition-all">
                <div id="hoursVal" class="text-2xl sm:text-4xl font-outfit font-black text-cyan-400">14</div>
                <div class="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">ঘণ্টা (Hours)</div>
              </div>
              <div class="bg-slate-900/80 border border-white/5 rounded-2xl p-3 sm:p-4 text-center shadow-lg hover:border-indigo-500/30 transition-all">
                <div id="minutesVal" class="text-2xl sm:text-4xl font-outfit font-black text-indigo-400">42</div>
                <div class="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">মিনিট (Mins)</div>
              </div>
              <div class="bg-slate-900/80 border border-white/5 rounded-2xl p-3 sm:p-4 text-center shadow-lg hover:border-emerald-500/30 transition-all">
                <div id="secondsVal" class="text-2xl sm:text-4xl font-outfit font-black text-emerald-400">59</div>
                <div class="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">সেকেন্ড (Secs)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 6-Discipline Interactive Knowledge Cards Grid (Islam, IT, Tech, Politics, Cosmos, Others) -->
      <div class="w-full max-w-6xl mt-12">
        <div class="text-center mb-8">
          <h3 class="text-2xl sm:text-3xl font-bangla font-bold text-white">আমাদের সমন্বিত জ্ঞান ও শিক্ষা অনুষদসমূহ</h3>
          <p class="text-sm text-slate-400 mt-1">যে বিষয়গুলো নিয়ে আমাদের শিক্ষামূলক পোর্টাল আত্মপ্রকাশ করছে</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <!-- 1. Islam & Ethical Studies -->
          <div class="cosmic-card rounded-2xl p-6 group hover:-translate-y-2 transition-all duration-300 border-t-2 border-t-amber-400">
            <div class="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span class="text-2xl">🕌</span>
            </div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">ইসলাম ও মূল্যবোধ শিক্ষা</h4>
              <span class="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">ইসলামিক স্টাডিজ</span>
            </div>
            <p class="text-sm text-slate-300 leading-relaxed">
              সহীহ কুরআন ও হাদিসভিত্তিক নৈতিক শিক্ষা, ইসলামী ইতিহাস, ফিকহ ও আধুনিক যুগে মূল্যবোধ চর্চার বিশুদ্ধ উৎস ও কোর্স।
            </p>
          </div>

          <!-- 2. IT & Software -->
          <div class="cosmic-card rounded-2xl p-6 group hover:-translate-y-2 transition-all duration-300 border-t-2 border-t-cyan-400">
            <div class="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span class="text-2xl">💻</span>
            </div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">আইটি ও সফটওয়্যার বিজ্ঞান</h4>
              <span class="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">আইটি ও কোডিং</span>
            </div>
            <p class="text-sm text-slate-300 leading-relaxed">
              ফুলস্ট্যাক ডেভেলপমেন্ট, পাইথন, ডেটা স্ট্রাকচার, অ্যালগরিদম ও সফটওয়্যার ইঞ্জিনিয়ারিংয়ের হ্যান্ডস-অন একাডেমি।
            </p>
          </div>

          <!-- 3. Emerging Tech & AI -->
          <div class="cosmic-card rounded-2xl p-6 group hover:-translate-y-2 transition-all duration-300 border-t-2 border-t-indigo-400">
            <div class="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span class="text-2xl">⚡</span>
            </div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">আধুনিক প্রযুক্তি ও এআই</h4>
              <span class="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">AI ও রোবোটিক্স</span>
            </div>
            <p class="text-sm text-slate-300 leading-relaxed">
              আর্টিফিশিয়াল ইন্টেলিজেন্স, মেশিন লার্নিং, ক্লাউড কম্পিউটিং ও চতুর্থ শিল্প বিপ্লবের আধুনিক প্রযুক্তির গবেষণা ও লার্নিং।
            </p>
          </div>

          <!-- 4. Politics & Geopolitics -->
          <div class="cosmic-card rounded-2xl p-6 group hover:-translate-y-2 transition-all duration-300 border-t-2 border-t-rose-400">
            <div class="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span class="text-2xl">🌍</span>
            </div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">রাজনীতি ও ভূ-রাজনীতি</h4>
              <span class="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">আন্তর্জাতিক সম্পর্ক</span>
            </div>
            <p class="text-sm text-slate-300 leading-relaxed">
              আন্তর্জাতিক রাজনীতি, বৈশ্বিক কূটনীতি, রাষ্ট্রদর্শন ও ঐতিহাসিক ঘটনার বস্তুনিষ্ঠ ও তথ্যভিত্তিক বিশ্লেষণী পাঠশালা।
            </p>
          </div>

          <!-- 5. Cosmos & Astronomy -->
          <div class="cosmic-card rounded-2xl p-6 group hover:-translate-y-2 transition-all duration-300 border-t-2 border-t-purple-400">
            <div class="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span class="text-2xl">🌌</span>
            </div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">মহাবিশ্ব ও জ্যোতির্বিজ্ঞান</h4>
              <span class="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">কসমোলজি</span>
            </div>
            <p class="text-sm text-slate-300 leading-relaxed">
              সৌরজগৎ, গ্যালাক্সি, ব্ল্যাকহোল, কোয়ান্টাম ফিজিক্স ও কসমোলজির বিস্ময়কর রহস্য উন্মোচনে বৈজ্ঞানিক উপস্থাপনা।
            </p>
          </div>

          <!-- 6. General Sciences & Humanities -->
          <div class="cosmic-card rounded-2xl p-6 group hover:-translate-y-2 transition-all duration-300 border-t-2 border-t-emerald-400">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span class="text-2xl">📚</span>
            </div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">মানবিক ও সাধারণ বিজ্ঞান</h4>
              <span class="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">অন্যান্য শাখা</span>
            </div>
            <p class="text-sm text-slate-300 leading-relaxed">
              অর্থনীতি, সমাজবিজ্ঞান, ভাষা ও সাহিত্য, ক্যারিয়ার গাইডেন্স এবং জীবনমুখী ব্যবহারিক জ্ঞানের এক অনন্য সমাহার।
            </p>
          </div>

        </div>
      </div>

      <!-- Developer Profile & Direct Technical Communication Card -->
      <div class="w-full max-w-4xl mt-12 cosmic-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div class="flex flex-col md:flex-row items-center gap-6 justify-between">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-amber-400 p-0.5 shadow-xl shadow-cyan-500/20 flex items-center justify-center">
              <div class="w-full h-full bg-cosmos-900 rounded-[14px] flex items-center justify-center text-cyan-300 text-2xl font-black font-outfit">
                JA
              </div>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-xl font-bold text-white font-outfit">Jainal Abedin</h4>
                <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">Lead Developer & Architect</span>
              </div>
              <p class="text-xs text-slate-300 mt-0.5">শিক্ষা ও প্রযুক্তি বিষয়ক ডিজিটাল ইনফ্রাস্ট্রাকচার ডেভেলপমেন্ট</p>
              <p class="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                <span>📞 <strong class="text-slate-200">01581703822</strong></span>
                <span>•</span>
                <span>✉️ <strong class="text-slate-200">jainal.dcitbd@gmail.com</strong></span>
              </p>
            </div>
          </div>

          <!-- Direct Developer Quick Action Buttons -->
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
              href="https://wa.me/8801581703822?text=Hello%20Jainal%20Abedin,%20I%20am%20interested%20in%20the%20educational%20knowledge%20platform" 
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

      <!-- Subscription Notice & Early Access Sign-up -->
      <div class="w-full max-w-3xl mt-12 cosmic-card rounded-3xl p-6 sm:p-8 text-center relative">
        <h4 class="text-xl sm:text-2xl font-bangla font-bold text-white mb-2">প্ল্যাটফর্ম উন্মোচন মাত্রই ফ্রি আর্লি-অ্যাক্সেস পেতে চান?</h4>
        <p class="text-sm text-slate-300 mb-6 max-w-lg mx-auto">
          আপনার ইমেইল অথবা মোবাইল নম্বর জমা দিয়ে রাখুন। ওয়েবসাইট লাইভ হওয়া মাত্রই আপনাকে অগ্রাধিকার ভিত্তিতে নোটিফিকেশন পাঠানো হবে।
        </p>

        <!-- Subscription Form -->
        <form id="notifyForm" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
          <input 
            type="text" 
            id="subscriberContact" 
            placeholder="আপনার ইমেইল বা মোবাইল নম্বর দিন" 
            required 
            class="flex-1 px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm transition-all"
          >
          <button 
            type="submit" 
            id="notifySubmitBtn"
            class="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>আমাকে জানান</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
        </form>

        <!-- Subscriber Counter -->
        <div id="subscriberCountWrapper" class="text-xs text-slate-400 flex items-center justify-center gap-2 mb-6">
          <span class="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>ইতিমধ্যে <strong id="subscriberCount" class="text-cyan-300 font-semibold font-outfit">318</strong> জন শিক্ষার্থী ও শিক্ষক অপেক্ষমাণ তালিকায় যুক্ত হয়েছেন</span>
        </div>

        <!-- Direct Instant Actions -->
        <div class="border-t border-white/10 pt-6">
          <p class="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">জরুরি যোগাযোগ বা কারিগরি বিষয়ে সরাসরি যোগাযোগ</p>
          <div class="flex flex-wrap items-center justify-center gap-3">
            <!-- WhatsApp Chat -->
            <a 
              id="whatsappBtn" 
              href="https://wa.me/8801581703822?text=Hello%20Jainal%20Abedin,%20I%20am%20interested%20in%20your%20education%20platform" 
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
    <footer class="w-full border-t border-white/10 bg-cosmos-950/70 backdrop-blur-md px-6 py-6 text-center text-xs text-slate-400">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p>© 2026 <strong class="text-slate-200">সার্বজনীন শিক্ষা ও জ্ঞান পোর্টাল</strong>. Developed by <strong class="text-cyan-300">Jainal Abedin</strong>. সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
        <div class="flex items-center gap-4 text-slate-400">
          <span class="hover:text-cyan-300 transition-colors cursor-pointer" id="supportModalTrigger">ভিশন ও উদ্দেশ্য</span>
          <span>•</span>
          <span class="hover:text-cyan-300 transition-colors cursor-pointer" id="officeAddressTrigger">যোগাযোগ তথ্য</span>
          <span>•</span>
          <span class="hover:text-cyan-300 transition-colors cursor-pointer" id="faqTrigger">প্রশ্নোত্তর</span>
        </div>
      </div>
    </footer>

  </div>

  <!-- Interactive Modal for Info/Dialogs -->
  <div id="infoModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cosmos-950/85 backdrop-blur-md opacity-0 pointer-events-none transition-opacity duration-300">
    <div id="infoModalContent" class="cosmic-card max-w-lg w-full rounded-2xl p-6 relative transform scale-95 transition-transform duration-300">
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

  <!-- Script: 3D Celestial Engine (Three.js), Web Audio Synthesizer, 3D Tilt Card & Logic -->
  <script>
    // --- 1. Synthesized Audio (Web Audio API - Sandbox Safe) ---
    let soundEnabled = true;
    let audioCtx = null;

    function initAudio() {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          audioCtx = new AudioContext();
        }
      }
    }

    function playCelestialTone(freq = 659.25, type = 'sine', duration = 0.2) {
      if (!soundEnabled) return;
      try {
        initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    }

    const soundToggleBtn = document.getElementById('soundToggleBtn');
    const soundIcon = document.getElementById('soundIcon');
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        soundIcon.textContent = '🔊';
        soundToggleBtn.querySelector('span:last-child').textContent = 'সাউন্ড অন';
        playCelestialTone(880, 'triangle', 0.25);
        showToast('সাউন্ড চালু', 'ইন্টারঅ্যাক্টিভ অডিও অ্যাক্টিভ করা হয়েছে।');
      } else {
        soundIcon.textContent = '🔇';
        soundToggleBtn.querySelector('span:last-child').textContent = 'সাউন্ড অফ';
        showToast('সাউন্ড বন্ধ', 'অডিও মিউট করা হয়েছে।');
      }
    });

    // --- 2. In-Page Toast Controller ---
    const toast = document.getElementById('toastNotification');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    let toastTimeout = null;

    function showToast(title, message, isSuccess = true) {
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTitle.textContent = title;
      toastMessage.textContent = message;
      toast.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
      toast.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
      playCelestialTone(isSuccess ? 880 : 440, 'sine', 0.2);
      toastTimeout = setTimeout(() => {
        toast.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
        toast.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
      }, 4000);
    }

    // --- 3. 3D Cosmic Celestial Galaxy & Planetary Orbits (Three.js) ---
    (function initCelestialUniverse() {
      const container = document.getElementById('canvas-container');
      if (!container || typeof THREE === 'undefined') return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 36;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Celestial Group
      const universeGroup = new THREE.Group();
      scene.add(universeGroup);

      // Core Celestial Knowledge Sphere (Wireframe Dodecahedron)
      const coreGeo = new THREE.DodecahedronGeometry(11, 1);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      });
      const coreSphere = new THREE.Mesh(coreGeo, coreMat);
      universeGroup.add(coreSphere);

      // Orbital Planetary Ring 1 (Gold / Islam & Values)
      const ring1Geo = new THREE.RingGeometry(16, 16.3, 64);
      const ring1Mat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
      ring1.rotation.x = Math.PI / 3;
      ring1.rotation.y = Math.PI / 6;
      universeGroup.add(ring1);

      // Orbital Planetary Ring 2 (Emerald / Science & Tech)
      const ring2Geo = new THREE.RingGeometry(21, 21.3, 64);
      const ring2Mat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25,
      });
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
      ring2.rotation.x = -Math.PI / 4;
      ring2.rotation.y = Math.PI / 4;
      universeGroup.add(ring2);

      // Orbital Planetary Ring 3 (Indigo / Cosmos & Politics)
      const ring3Geo = new THREE.RingGeometry(26, 26.3, 64);
      const ring3Mat = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2,
      });
      const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
      ring3.rotation.x = Math.PI / 2.2;
      universeGroup.add(ring3);

      // Cosmic Starfield Particle Galaxy
      const starsCount = 420;
      const starsGeo = new THREE.BufferGeometry();
      const starPositions = new Float32Array(starsCount * 3);
      for (let i = 0; i < starsCount * 3; i++) {
        starPositions[i] = (Math.random() - 0.5) * 110;
      }
      starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      const starsMat = new THREE.PointsMaterial({
        size: 0.45,
        color: 0xa5f3fc,
        transparent: true,
        opacity: 0.7,
      });
      const starField = new THREE.Points(starsGeo, starsMat);
      scene.add(starField);

      // Mouse Parallax Effect
      let targetX = 0;
      let targetY = 0;
      let mouseX = 0;
      let mouseY = 0;

      window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) * 0.0009;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.0009;
      }, { passive: true });

      function animate() {
        requestAnimationFrame(animate);
        targetX += (mouseX - targetX) * 0.04;
        targetY += (mouseY - targetY) * 0.04;

        universeGroup.rotation.y += 0.002;
        universeGroup.rotation.x += 0.001;
        coreSphere.rotation.y -= 0.003;
        ring1.rotation.z += 0.002;
        ring2.rotation.z -= 0.0015;
        ring3.rotation.z += 0.001;
        starField.rotation.y -= 0.0005;

        camera.position.x += (targetX * 22 - camera.position.x) * 0.05;
        camera.position.y += (-targetY * 22 - camera.position.y) * 0.05;
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
      maxTilt: 9,
      scaleHover: '1.015, 1.015, 1.015',
      defaultSubCount: 318,
      subCountKey: 'universal_edu_sub_count',
      subListKey: 'universal_edu_subscribers',
      subToastTitle: 'অভিনন্দন!',
      subToastMsg: 'সার্বজনীন শিক্ষা প্ল্যাটফর্মের আর্লি-অ্যাক্সেস তালিকায় আপনার তথ্য যুক্ত হয়েছে।',
      modals: {
        officeAddressTrigger: {
          title: 'যোগাযোগ ও ডেভেলপার পরিচিতি',
          body: '<p><strong>প্ল্যাটফর্ম:</strong> সার্বজনীন শিক্ষা ও জ্ঞান পোর্টাল (Universal Education & Knowledge Network)</p><p><strong>লিড ডেভেলপার ও সিস্টেম আর্কিটেক্ট:</strong> Jainal Abedin</p><p><strong>মোবাইল / হটলাইন:</strong> 01581703822</p><p><strong>অফিসিয়াল ইমেইল:</strong> jainal.dcitbd@gmail.com</p><p><strong>বিষয়ভিত্তিক আওতা:</strong> ইসলাম, তথ্যপ্রযুক্তি, আধুনিক বিজ্ঞান, ভূ-রাজনীতি, মহাবিশ্ব ও জ্যোতির্বিজ্ঞান এবং সমাজ-বিজ্ঞান।</p>'
        },
        supportModalTrigger: {
          title: 'প্ল্যাটফর্মের ভিশন ও শিক্ষামূলক উদ্দেশ্য',
          body: '<p>আমাদের মূল উদ্দেশ্য হলো জ্ঞানের সকল শাখাকে আধুনিক প্রজন্মের জন্য এক ছাতার নিচে নিয়ে আসা।</p><p>এখানে একদিকে যেমন ইসলামের বিশুদ্ধ মূল্যবোধ ও ইতিহাস থাকবে, তেমনি থাকবে কোডিং, কৃত্রিম বুদ্ধিমত্তা (AI), আধুনিক বিজ্ঞান, বিশ্ব রাজনীতি এবং মহাবিশ্বের অপার রহস্য নিয়ে গবেষণাভিত্তিক আলোচনা।</p><p>সকল তথ্য ও পাঠ্যক্রম নিরপেক্ষ, বস্তুনিষ্ঠ এবং শিক্ষার্থীবান্ধব উপায়ে সাজানো হচ্ছে।</p>'
        },
        faqTrigger: {
          title: 'সাধারণ প্রশ্নোত্তর (FAQ)',
          body: '<p><strong>প্রশ্ন: এই প্ল্যাটফর্মে কি কি বিষয়ের কোর্স বা কনটেন্ট থাকবে?</strong><br>উত্তর: ইসলাম ও মূল্যবোধ, প্রোগ্রামিং ও আইটি, এআই ও প্রযুক্তি, রাজনীতি ও কূটনীতি, জ্যোতির্বিজ্ঞান ও মহাবিশ্ব সহ সার্বজনীন শিক্ষার পূর্ণাঙ্গ সংগ্রহশালা থাকবে।</p><p><strong>প্রশ্ন: ডেভেলপমেন্ট চলাকালীন কিভাবে যোগাযোগ করব?</strong><br>উত্তর: সরাসরি লিড ডেভেলপার জয়নাল আবেদীনের নম্বরে (01581703822) কল অথবা ইমেইলে (jainal.dcitbd@gmail.com) যোগাযোগ করতে পারেন।</p>'
        }
      }
    });
  </script>
</body>
</html>
