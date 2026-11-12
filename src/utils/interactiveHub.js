/**
 * DREAM CART BD — SHARED INTERACTIVE 3D HUB CONTROLLER (src/utils/interactiveHub.js)
 * Written once and reused across /dcitbd (IT Services) and /education (Learn & Build Career):
 * 1. F12 / DevTools / Console / View-Source / Right-Click Security Shield
 * 2. Web Audio API Synthesizer (playChime / playCelestialTone & Sound Toggle Button)
 * 3. In-Page Toast Notification Controller (showToast)
 * 4. 3D Mouse Perspective Tilt Card Effect (#mainHeroCard)
 * 5. Dynamic Live Countdown Timer (#daysVal, #hoursVal, #minutesVal, #secondsVal)
 * 6. LocalStorage Early-Access Subscription Handler (#notifyForm)
 * 7. Clipboard Copy Email Handler (#copyEmailBtn)
 * 8. Information Modal Controller (#infoModal, #officeAddressTrigger, #supportModalTrigger, #faqTrigger)
 */
(function() {
  // 1. Security Shield
  try {
    window.addEventListener('keydown', function(e) {
      var k = (e.key || '').toUpperCase(), c = e.keyCode || e.which;
      if (c === 123 || k === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C','K'].indexOf(k) !== -1) || ((e.ctrlKey || e.metaKey) && (k === 'U' || k === 'S' || c === 85))) {
        e.preventDefault(); e.stopPropagation(); return false;
      }
    }, true);
    document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; }, true);
  } catch (e) {}

  // 2. Shared Hub Initializer
  window.initDcbdInteractiveHub = function(config) {
    config = config || {};
    var soundEnabled = true;
    var audioCtx = null;

    function initAudio() {
      if (!audioCtx) {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
      }
    }

    function playTone(freq, type, duration) {
      freq = freq || 587.33;
      type = type || 'sine';
      duration = duration || 0.15;
      if (!soundEnabled) return;
      try {
        initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch (e) {}
    }

    window.playChime = playTone;
    window.playCelestialTone = playTone;

    // Toast Controller
    var toast = document.getElementById('toastNotification');
    var toastTitle = document.getElementById('toastTitle');
    var toastMessage = document.getElementById('toastMessage');
    var toastTimeout = null;

    function showToast(title, message, isSuccess) {
      if (isSuccess === undefined) isSuccess = true;
      if (!toast) return;
      if (toastTimeout) clearTimeout(toastTimeout);
      if (toastTitle) toastTitle.textContent = title;
      if (toastMessage) toastMessage.textContent = message;
      toast.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
      toast.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
      playTone(isSuccess ? 880 : 440, 'sine', 0.18);
      toastTimeout = setTimeout(function() {
        toast.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
        toast.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
      }, 4000);
    }
    window.showToast = showToast;

    // Sound Toggle Button
    var soundToggleBtn = document.getElementById('soundToggleBtn');
    var soundIcon = document.getElementById('soundIcon');
    if (soundToggleBtn && soundIcon) {
      soundToggleBtn.addEventListener('click', function() {
        soundEnabled = !soundEnabled;
        var labelSpan = soundToggleBtn.querySelector('span:last-child');
        if (soundEnabled) {
          soundIcon.textContent = '🔊';
          if (labelSpan) labelSpan.textContent = 'সাউন্ড অন';
          playTone(784, 'triangle', 0.2);
          showToast('সাউন্ড চালু', 'ইন্টারঅ্যাক্টিভ অডিও সক্রিয় করা হয়েছে।');
        } else {
          soundIcon.textContent = '🔇';
          if (labelSpan) labelSpan.textContent = 'সাউন্ড অফ';
          showToast('সাউন্ড বন্ধ', 'অডিও মিউট করা হয়েছে।');
        }
      });
    }

    // 3D Card Gyro / Mouse Perspective Tilt Effect
    var heroCard = document.getElementById('mainHeroCard');
    if (heroCard) {
      var maxTilt = config.maxTilt || 8;
      var scaleHover = config.scaleHover || '1.01, 1.01, 1.01';
      heroCard.addEventListener('mousemove', function(e) {
        var rect = heroCard.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = ((y - centerY) / centerY) * -maxTilt;
        var rotateY = ((x - centerX) / centerX) * maxTilt;
        heroCard.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(' + scaleHover + ')';
      });
      heroCard.addEventListener('mouseleave', function() {
        heroCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    }

    // Dynamic Live Countdown Timer
    (function initCountdown() {
      var targetTime = Date.now() + (3 * 24 * 60 * 60 * 1000) + (14 * 60 * 60 * 1000);
      var daysEl = document.getElementById('daysVal');
      var hoursEl = document.getElementById('hoursVal');
      var minutesEl = document.getElementById('minutesVal');
      var secondsEl = document.getElementById('secondsVal');

      function updateClock() {
        var diff = Math.max(0, targetTime - Date.now());
        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        var minutes = Math.floor((diff / (1000 * 60)) % 60);
        var seconds = Math.floor((diff / 1000) % 60);

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
      }
      updateClock();
      setInterval(updateClock, 1000);
    })();

    // Notification Subscription Form with LocalStorage
    var notifyForm = document.getElementById('notifyForm');
    var subscriberInput = document.getElementById('subscriberContact');
    var subscriberCount = document.getElementById('subscriberCount');
    if (notifyForm && subscriberInput && subscriberCount) {
      var currentCount = config.defaultSubCount || 265;
      var countKey = config.subCountKey || 'dreamcareer_sub_count';
      var listKey = config.subListKey || 'dreamcareer_subscribers';
      try {
        var savedCount = localStorage.getItem(countKey);
        if (savedCount) currentCount = parseInt(savedCount, 10);
        subscriberCount.textContent = currentCount;
      } catch (e) {}

      notifyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var val = subscriberInput.value.trim();
        if (!val) return;
        currentCount += 1;
        subscriberCount.textContent = currentCount;
        try {
          localStorage.setItem(countKey, currentCount);
          var list = JSON.parse(localStorage.getItem(listKey) || '[]');
          list.push({ contact: val, date: new Date().toISOString() });
          localStorage.setItem(listKey, JSON.stringify(list));
        } catch (err) {}
        subscriberInput.value = '';
        showToast(config.subToastTitle || 'ধন্যবাদ!', config.subToastMsg || 'আপনার তথ্য সংরক্ষিত হয়েছে।');
      });
    }

    // Copy Email with Fallback
    var copyEmailBtn = document.getElementById('copyEmailBtn');
    var copyEmailText = document.getElementById('copyEmailText');
    var officialEmail = config.officialEmail || 'jainal.dcitbd@gmail.com';
    if (copyEmailBtn && copyEmailText) {
      function handleCopied() {
        copyEmailText.textContent = 'কপি হয়েছে!';
        showToast('ইমেইল কপি সম্পন্ন', officialEmail + ' ক্লিপবোর্ডে কপি করা হয়েছে।');
        setTimeout(function() { copyEmailText.textContent = 'ইমেইল কপি করুন'; }, 3000);
      }
      function fallbackCopyText(text) {
        try {
          var tempInput = document.createElement('input');
          tempInput.value = text;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          handleCopied();
        } catch (e) {
          showToast('ইমেইল ঠিকানা', officialEmail);
        }
      }
      copyEmailBtn.addEventListener('click', function() {
        playTone(659, 'triangle', 0.15);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(officialEmail).then(handleCopied).catch(function() { fallbackCopyText(officialEmail); });
        } else {
          fallbackCopyText(officialEmail);
        }
      });
    }

    // Information Modal Handlers
    var infoModal = document.getElementById('infoModal');
    var infoModalContent = document.getElementById('infoModalContent');
    var modalCloseBtn = document.getElementById('modalCloseBtn');
    var modalBody = document.getElementById('modalBody');

    function openModal(title, htmlContent) {
      if (!infoModal || !modalBody) return;
      modalBody.innerHTML = '<h4 class="text-xl font-bold text-white mb-2 font-bangla">' + title + '</h4>' +
        '<div class="text-sm text-slate-300 space-y-2.5 leading-relaxed">' + htmlContent + '</div>';
      infoModal.classList.remove('opacity-0', 'pointer-events-none');
      infoModal.classList.add('opacity-100', 'pointer-events-auto');
      if (infoModalContent) {
        infoModalContent.classList.remove('scale-95');
        infoModalContent.classList.add('scale-100');
      }
      playTone(523, 'sine', 0.18);
    }

    function closeModal() {
      if (!infoModal) return;
      infoModal.classList.add('opacity-0', 'pointer-events-none');
      infoModal.classList.remove('opacity-100', 'pointer-events-auto');
      if (infoModalContent) {
        infoModalContent.classList.add('scale-95');
        infoModalContent.classList.remove('scale-100');
      }
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (infoModal) {
      infoModal.addEventListener('click', function(e) {
        if (e.target === infoModal) closeModal();
      });
    }

    var modals = config.modals || {};
    Object.keys(modals).forEach(function(triggerId) {
      var btn = document.getElementById(triggerId);
      if (btn) {
        btn.addEventListener('click', function() {
          openModal(modals[triggerId].title, modals[triggerId].body);
        });
      }
    });
  };
})();
