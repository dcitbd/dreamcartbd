/**
 * DREAM CART BD — TERMS & PRIVACY PAGES (TermsPage.js)
 * Implements user requirements:
 * - Complete 34-section Terms & Conditions documentation
 * - Modern card-based UI with interactive hover animations and smooth entrance
 * - Ultra-high contrast typography for Light and Dark modes
 * - Interactive live search filter & Quick Navigation bar for rapid clause lookup
 * - Preserves both router exports: renderTermsPage & renderPrivacyPage
 */

export function renderTermsPage() {
  return `
    <!-- Scoped Styles for Modern Terms & Conditions Page -->
    <style id="terms-page-custom-styles">
      .tc-wrapper {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      }
      
      /* Card Entrance & Smooth Transitions */
      @keyframes tcSlideUp {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .tc-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 22px 24px;
        box-shadow: 0 4px 14px -2px rgba(0, 0, 0, 0.04);
        transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        animation: tcSlideUp 0.35s ease-out forwards;
      }
      .dark .tc-card {
        background: #0f172a;
        border-color: #1e293b;
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4);
      }
      .tc-card:hover {
        border-color: #10b981;
        box-shadow: 0 8px 24px -4px rgba(16, 185, 129, 0.15);
        transform: translateY(-2px);
      }

      /* Hero Header */
      .tc-hero {
        background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
        border: 1px solid #1e293b;
        border-radius: 20px;
        padding: 32px 28px;
        color: #ffffff;
        position: relative;
        overflow: hidden;
        margin-bottom: 20px;
      }
      .tc-hero-glow {
        position: absolute;
        top: -50px;
        right: -50px;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
        border-radius: 50%;
        filter: blur(35px);
        pointer-events: none;
      }

      /* Meta Chips */
      .tc-meta-chip {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        padding: 6px 12px;
        font-size: 11px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: #e2e8f0;
      }

      /* Quick Navigation Pills */
      .tc-nav-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 12px;
        border-radius: 9999px;
        font-size: 11px;
        font-weight: 700;
        background: #f1f5f9;
        color: #334155;
        border: 1px solid #e2e8f0;
        text-decoration: none;
        transition: all 0.18s ease;
        cursor: pointer;
        white-space: nowrap;
      }
      .dark .tc-nav-pill {
        background: #1e293b;
        color: #cbd5e1;
        border-color: #334155;
      }
      .tc-nav-pill:hover {
        background: #10b981;
        color: #ffffff;
        border-color: #10b981;
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
      }

      /* Section Header & Number Badges */
      .tc-sec-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f1f5f9;
      }
      .dark .tc-sec-header {
        border-bottom-color: #1e293b;
      }
      .tc-sec-badge {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #059669;
        font-weight: 800;
        font-size: 12.5px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .dark .tc-sec-badge {
        color: #34d399;
        background: rgba(16, 185, 129, 0.18);
        border-color: rgba(16, 185, 129, 0.4);
      }
      
      .tc-sec-title {
        font-size: 16px;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
        letter-spacing: -0.01em;
      }
      .dark .tc-sec-title {
        color: #ffffff;
      }

      .tc-sub-title {
        font-size: 13.5px;
        font-weight: 700;
        color: #059669;
        margin-top: 14px;
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .dark .tc-sub-title {
        color: #34d399;
      }

      .tc-content-text {
        font-size: 13px;
        line-height: 1.65;
        color: #334155;
        margin-bottom: 8px;
      }
      .dark .tc-content-text {
        color: #cbd5e1;
      }
      .tc-content-text:last-child {
        margin-bottom: 0;
      }

      /* Links */
      .tc-link {
        color: #059669;
        text-decoration: underline;
        text-underline-offset: 2px;
        transition: color 0.15s ease;
      }
      .dark .tc-link {
        color: #34d399;
      }
      .tc-link:hover {
        color: #10b981;
      }

      /* Custom Styled Lists */
      .tc-list {
        list-style: none;
        padding-left: 0;
        margin: 10px 0;
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .tc-list li {
        position: relative;
        padding-left: 20px;
        font-size: 12.5px;
        line-height: 1.55;
        color: #334155;
      }
      .dark .tc-list li {
        color: #cbd5e1;
      }
      .tc-list li::before {
        content: '✓';
        position: absolute;
        left: 0;
        top: 1px;
        color: #10b981;
        font-weight: 900;
        font-size: 11px;
      }

      .tc-num-list {
        list-style: none;
        padding-left: 0;
        margin: 10px 0;
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .tc-num-list li {
        font-size: 12.5px;
        line-height: 1.55;
        color: #334155;
      }
      .dark .tc-num-list li {
        color: #cbd5e1;
      }
      .tc-num-idx {
        font-weight: 800;
        color: #059669;
        margin-right: 4px;
      }
      .dark .tc-num-idx {
        color: #34d399;
      }
    </style>

    <div class="tc-wrapper max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-5">

      <!-- 1. Hero Header Card -->
      <div class="tc-hero">
        <div class="tc-hero-glow"></div>
        <div class="relative z-10">
          
          <div class="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <span>🛡️</span>
            <span>অফিসিয়াল নীতিমালা ও চুক্তিপত্র (Official Legal Terms)</span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Terms & Conditions
          </h1>
          
          <p class="text-slate-300 text-xs sm:text-sm font-medium mb-4 max-w-2xl leading-relaxed">
            Dream Cart BD — Smart Digital Commerce & Multi-Vendor Platform-এর সকল সেবা ব্যবহারের সাধারণ নিয়মাবলী ও আইনি নীতিমালা।
          </p>

          <!-- Metadata Chips Grid -->
          <div class="flex flex-wrap gap-2">
            <div class="tc-meta-chip">
              <span>🌐</span>
              <span><strong>ওয়েবসাইট:</strong> https://dreamcartbd.com/</span>
            </div>
            <div class="tc-meta-chip">
              <span>🏢</span>
              <span><strong>প্রতিষ্ঠান:</strong> Dream Cart BD</span>
            </div>
            <div class="tc-meta-chip">
              <span>📅</span>
              <span><strong>কার্যকর তারিখ:</strong> 11 October 2026</span>
            </div>
            <div class="tc-meta-chip">
              <span>🔄</span>
              <span><strong>সর্বশেষ আপডেট:</strong> 11 October 2026</span>
            </div>
            <div class="tc-meta-chip">
              <span>⚖️</span>
              <span><strong>আইন:</strong> বাংলাদেশ ভোক্তা অধিকার ও ডিজিটাল কমার্স আইন</span>
            </div>
          </div>

        </div>
      </div>

      <!-- 2. Interactive Quick Jump / Search Navigator -->
      <div class="tc-card p-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
          <div class="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 w-full sm:w-auto">
            <span>🧭</span>
            <span>দ্রুত খুঁজে নিন (Quick Jump / Search):</span>
          </div>
          <div class="w-full sm:w-64">
            <input 
              type="text" 
              id="tc-search-input" 
              placeholder="🔍 ধারা বা বিষয় খুঁজুন..." 
              class="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              oninput="(function(e){
                var term = e.target.value.toLowerCase().trim();
                var sections = document.querySelectorAll('.tc-section-card');
                sections.forEach(function(sec){
                  if(!term || sec.innerText.toLowerCase().includes(term)) {
                    sec.style.display = 'block';
                  } else {
                    sec.style.display = 'none';
                  }
                });
              })(event)"
            />
          </div>
        </div>

        <!-- Quick Jump Pills -->
        <div class="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          <a onclick="document.getElementById('sec-1')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">1. ভূমিকা</a>
          <a onclick="document.getElementById('sec-2')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">2. সংজ্ঞা</a>
          <a onclick="document.getElementById('sec-3')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">3. যোগ্যতা</a>
          <a onclick="document.getElementById('sec-5')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">5. পণ্য তথ্য</a>
          <a onclick="document.getElementById('sec-7')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">7. মূল্য ও ছাড়</a>
          <a onclick="document.getElementById('sec-8')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">8. অর্ডার</a>
          <a onclick="document.getElementById('sec-10')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">10. পেমেন্ট</a>
          <a onclick="document.getElementById('sec-11')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">11. ডেলিভারি</a>
          <a onclick="document.getElementById('sec-12')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">12. রিটার্ন</a>
          <a onclick="document.getElementById('sec-13')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">13. রিফান্ড</a>
          <a onclick="document.getElementById('sec-14')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">14. ওয়ারেন্টি</a>
          <a onclick="document.getElementById('sec-16')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">16. ভেন্ডর</a>
          <a onclick="document.getElementById('sec-17')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">17. পাইকারি/রিসেলার</a>
          <a onclick="document.getElementById('sec-30')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">30. প্রযোজ্য আইন</a>
          <a onclick="document.getElementById('sec-34')?.scrollIntoView({behavior:'smooth'})" class="tc-nav-pill">34. যোগাযোগ</a>
        </div>
      </div>

      <!-- 3. All 34 Sections Cards -->

      <!-- Section 1: Introduction -->
      <div class="tc-card tc-section-card" id="sec-1">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">1</span>
          <h2 class="tc-sec-title">Introduction</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Welcome to Dream Cart BD. These Terms & Conditions govern your access to and use of our website, online shopping services, product listings, ordering facilities, payment systems, delivery services, and any related features offered through our platform.</p>
          <p class="tc-content-text">Dream Cart BD is an online shopping platform designed to provide customers with convenient access to products across different categories. Depending on the product and applicable arrangements, products may be supplied directly by Dream Cart BD or by participating sellers, vendors, suppliers, or other authorized partners.</p>
          <p class="tc-content-text">By accessing our website, creating an account, placing an order, or using any service provided by Dream Cart BD, you agree to comply with these Terms & Conditions and our applicable Privacy Policy, Shipping Policy, Return & Refund Policy, and other published policies.</p>
          <p class="tc-content-text">If you do not agree with these terms, please discontinue using the relevant services.</p>
          <p class="tc-content-text">These terms are intended to operate in accordance with the applicable laws and regulations of Bangladesh, including applicable consumer protection and digital commerce requirements.</p>
        </div>
      </div>

      <!-- Section 2: Definitions -->
      <div class="tc-card tc-section-card" id="sec-2">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">2</span>
          <h2 class="tc-sec-title">Definitions</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">For the purposes of these Terms & Conditions:</p>
          <ul class="tc-list">
            <li><strong>Dream Cart BD, we, us, or our:</strong> Refers to the business operating the Dream Cart BD website and the services it provides.</li>
            <li><strong>Website or Platform:</strong> Refers to <a href="https://dreamcartbd.com/" target="_blank" class="tc-link">https://dreamcartbd.com/</a> and its associated online shopping features.</li>
            <li><strong>Customer, User, or You:</strong> Refers to any person who visits, registers on, or uses the platform.</li>
            <li><strong>Product:</strong> Refers to any physical or digital item listed for sale through the platform.</li>
            <li><strong>Seller or Vendor:</strong> Refers to an individual or business authorized to list or sell products through the platform.</li>
            <li><strong>Order:</strong> Refers to a customer's request to purchase one or more products.</li>
            <li><strong>Pre-Order:</strong> Refers to an order for a product that is not immediately available for dispatch and is expected to be supplied according to the disclosed availability or delivery arrangement.</li>
            <li><strong>Reseller:</strong> Refers to a person or business authorized to promote or sell products under a separate reseller arrangement.</li>
            <li><strong>Wholesaler:</strong> Refers to a customer or business purchasing products in bulk under applicable wholesale pricing and minimum-order conditions.</li>
            <li><strong>Business Day:</strong> Refers to a working day applicable to the relevant business or delivery service, excluding applicable holidays.</li>
          </ul>
        </div>
      </div>

      <!-- Section 3: Eligibility and Use of the Website -->
      <div class="tc-card tc-section-card" id="sec-3">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">3</span>
          <h2 class="tc-sec-title">Eligibility and Use of the Website</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">By using Dream Cart BD, you confirm that:</p>
          <ol class="tc-num-list">
            <li><span class="tc-num-idx">1.</span> You have the legal capacity to enter into a purchase agreement under applicable law.</li>
            <li><span class="tc-num-idx">2.</span> The information you provide is accurate, current, and complete.</li>
            <li><span class="tc-num-idx">3.</span> You will use the platform only for lawful purposes.</li>
            <li><span class="tc-num-idx">4.</span> You will not misuse the website, attempt unauthorized access, or interfere with its operation.</li>
            <li><span class="tc-num-idx">5.</span> You will not use false identities, fraudulent payment details, or misleading contact information.</li>
            <li><span class="tc-num-idx">6.</span> You will comply with these terms and all applicable laws.</li>
          </ol>
          <p class="tc-content-text">Users who are not legally capable of entering into a contract must use the platform with the involvement and consent of a parent, guardian, or other legally authorized person, where required by law.</p>
        </div>
      </div>

      <!-- Section 4: Account Registration and Security -->
      <div class="tc-card tc-section-card" id="sec-4">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">4</span>
          <h2 class="tc-sec-title">Account Registration and Security</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Certain features may require an account.</p>
          <p class="tc-content-text">When registering, customers must provide accurate information, including their name, mobile number, email address, and other details requested by the platform.</p>
          <p class="tc-content-text">Customers are responsible for:</p>
          <ul class="tc-list">
            <li>Keeping their login credentials confidential.</li>
            <li>Maintaining the accuracy of their account information.</li>
            <li>Not sharing account access with unauthorized persons.</li>
            <li>Informing Dream Cart BD promptly if they suspect unauthorized account activity.</li>
            <li>Ensuring that orders placed through their accounts are authorized.</li>
          </ul>
          <p class="tc-content-text">Dream Cart BD may restrict, suspend, or terminate accounts where there is reasonable evidence of fraud, abuse, impersonation, security threats, or repeated violations of these terms, subject to applicable law.</p>
          <p class="tc-content-text">We do not guarantee uninterrupted account access or the availability of every feature at all times.</p>
        </div>
      </div>

      <!-- Section 5: Product Listings and Information -->
      <div class="tc-card tc-section-card" id="sec-5">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">5</span>
          <h2 class="tc-sec-title">Product Listings and Information</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">We aim to provide clear and accurate product information, including:</p>
          <ul class="tc-list">
            <li>Product names and descriptions.</li>
            <li>Photographs and videos.</li>
            <li>Prices and available discounts.</li>
            <li>Product specifications, sizes, colors, and materials.</li>
            <li>Brand and model information, where applicable.</li>
            <li>Stock availability and preorder status.</li>
            <li>Delivery charges and applicable conditions.</li>
            <li>Warranty or service information, where applicable.</li>
          </ul>
          <p class="tc-content-text">Product images are provided for identification and illustration. Actual products may show minor variations in color, appearance, packaging, or presentation due to lighting, photography, manufacturing changes, or display settings.</p>
          <p class="tc-content-text">Such variations do not excuse material misrepresentation or the supply of a product substantially different from its description.</p>
          <p class="tc-content-text">Customers should carefully review product specifications, size, compatibility, quantity, color, and other relevant information before ordering.</p>
          <p class="tc-content-text">If a listing contains a material error or incomplete information, please contact our support team before placing the order.</p>
        </div>
      </div>

      <!-- Section 6: Product Availability and Stock -->
      <div class="tc-card tc-section-card" id="sec-6">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">6</span>
          <h2 class="tc-sec-title">Product Availability and Stock</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">All products are subject to availability unless expressly stated otherwise.</p>
          <p class="tc-content-text">A product appearing on the website does not necessarily mean that it is immediately available for dispatch.</p>
          <p class="tc-content-text">Availability may change because of:</p>
          <ul class="tc-list">
            <li>Changes in inventory.</li>
            <li>Supplier or manufacturer shortages.</li>
            <li>Unexpected demand.</li>
            <li>Inventory synchronization errors.</li>
            <li>Product discontinuation.</li>
            <li>Delivery or procurement restrictions.</li>
          </ul>
          <p class="tc-content-text">If a product becomes unavailable after an order is placed, we will inform the customer and discuss an appropriate solution, such as an alternative product, cancellation, or refund of the applicable amount already paid.</p>
          <p class="tc-content-text">We will not substitute a materially different product without the customer's agreement.</p>
        </div>
      </div>

      <!-- Section 7: Prices, Discounts, and Offers -->
      <div class="tc-card tc-section-card" id="sec-7">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">7</span>
          <h2 class="tc-sec-title">Prices, Discounts, and Offers</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">All product prices and charges will be displayed on the relevant product page or during checkout, as applicable.</p>
          <p class="tc-content-text">Prices may be shown in Bangladeshi Taka (BDT), unless otherwise stated.</p>
          <p class="tc-content-text">The final payable amount may include:</p>
          <ul class="tc-list">
            <li>Product price.</li>
            <li>Delivery or shipping charges.</li>
            <li>Applicable taxes or other legally required charges.</li>
            <li>Any additional service charge disclosed before the order is placed.</li>
          </ul>
          <p class="tc-content-text">Promotional prices, coupon codes, bundle offers, wholesale rates, and other discounts are subject to their published eligibility requirements and validity periods.</p>
          <div class="tc-sub-title"><span>📌</span> <span>7.1 Online Payment Discounts</span></div>
          <p class="tc-content-text">Where an online payment discount is advertised, it will apply only to eligible orders that satisfy the stated conditions.</p>
          <p class="tc-content-text">For example, an advertised 5% online payment discount will apply only where the relevant product, payment method, and promotional conditions qualify.</p>
          <p class="tc-content-text">Unless expressly stated otherwise, discounts cannot be combined with other promotions and cannot be exchanged for cash.</p>
          <div class="tc-sub-title"><span>📌</span> <span>7.2 Pricing Errors</span></div>
          <p class="tc-content-text">If a material pricing or calculation error is identified, Dream Cart BD will review the affected order and contact the customer where necessary.</p>
          <p class="tc-content-text">Any cancellation, correction, or refund will be handled in accordance with applicable law and the circumstances of the order. We will not use an error as a reason to disregard mandatory consumer rights.</p>
        </div>
      </div>

      <!-- Section 8: Order Placement and Confirmation -->
      <div class="tc-card tc-section-card" id="sec-8">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">8</span>
          <h2 class="tc-sec-title">Order Placement and Confirmation</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Customers may place orders through the available ordering features on the website.</p>
          <p class="tc-content-text">To place an order, customers should:</p>
          <ol class="tc-num-list">
            <li><span class="tc-num-idx">1.</span> Select the desired product.</li>
            <li><span class="tc-num-idx">2.</span> Choose the required quantity, size, color, or variation, where applicable.</li>
            <li><span class="tc-num-idx">3.</span> Add the product to the cart.</li>
            <li><span class="tc-num-idx">4.</span> Provide accurate delivery and contact information.</li>
            <li><span class="tc-num-idx">5.</span> Select an available payment method.</li>
            <li><span class="tc-num-idx">6.</span> Review the product price, delivery charge, discounts, and final payable amount.</li>
            <li><span class="tc-num-idx">7.</span> Submit the order.</li>
          </ol>
          <p class="tc-content-text">An order submission is a request to purchase and may require verification or confirmation before dispatch.</p>
          <p class="tc-content-text">An order confirmation message, order number, or notification does not guarantee immediate dispatch if the product is subject to stock verification, preorder arrangements, or other disclosed conditions.</p>
          <p class="tc-content-text">Dream Cart BD may contact the customer to verify an order, delivery address, product variation, or payment status.</p>
          <p class="tc-content-text">If we cannot fulfill an order, we will notify the customer and arrange an appropriate resolution in accordance with applicable law and our published policies.</p>
        </div>
      </div>

      <!-- Section 9: Order Cancellation -->
      <div class="tc-card tc-section-card" id="sec-9">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">9</span>
          <h2 class="tc-sec-title">Order Cancellation</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Customers should contact customer support as soon as possible if they wish to cancel an order.</p>
          <p class="tc-content-text">Cancellation may be possible before the order is processed, packed, handed over to the delivery partner, or dispatched, depending on its status.</p>
          <p class="tc-content-text">Once an order has been dispatched, cancellation may require a return or delivery refusal process.</p>
          <p class="tc-content-text">Dream Cart BD may cancel an order where:</p>
          <ul class="tc-list">
            <li>The product is unavailable.</li>
            <li>The delivery address is incomplete or cannot be verified.</li>
            <li>The customer cannot be reached after reasonable attempts.</li>
            <li>A payment is unsuccessful or cannot be verified.</li>
            <li>There is credible evidence of fraudulent activity.</li>
            <li>A supplier or delivery restriction prevents fulfillment.</li>
            <li>A material listing error affects the order.</li>
          </ul>
          <p class="tc-content-text">Where payment has already been received, any amount refundable because of cancellation will be processed under the applicable refund policy and legal requirements.</p>
          <p class="tc-content-text">Cancellation conditions will not remove rights that customers have under applicable law.</p>
        </div>
      </div>

      <!-- Section 10: Payment Methods -->
      <div class="tc-card tc-section-card" id="sec-10">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">10</span>
          <h2 class="tc-sec-title">Payment Methods</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Available payment methods may include, where enabled:</p>
          <ul class="tc-list">
            <li>Cash on Delivery (COD).</li>
            <li>Mobile Financial Services, such as bKash, Nagad, or Rocket.</li>
            <li>Debit and credit cards.</li>
            <li>Internet banking or bank transfer.</li>
            <li>Other payment methods displayed at checkout.</li>
          </ul>
          <p class="tc-content-text">The availability of a payment method may depend on the customer's location, order value, product type, or payment provider.</p>
          <div class="tc-sub-title"><span>📌</span> <span>10.1 Cash on Delivery</span></div>
          <p class="tc-content-text">For eligible COD orders, customers pay the applicable amount when the order is delivered.</p>
          <p class="tc-content-text">Customers should ensure that the order details and final payable amount are correct before accepting delivery.</p>
          <p class="tc-content-text">COD may not be available for every product, location, or order.</p>
          <div class="tc-sub-title"><span>📌</span> <span>10.2 Online Payments</span></div>
          <p class="tc-content-text">Customers must use authorized payment channels and provide accurate transaction information when requested.</p>
          <p class="tc-content-text">A payment will be treated as successful only when the relevant payment provider or authorized system confirms it.</p>
          <p class="tc-content-text">Customers should retain their transaction ID, payment receipt, or confirmation message until the order is completed.</p>
          <div class="tc-sub-title"><span>📌</span> <span>10.3 Failed, Duplicate, or Unrecognized Payments</span></div>
          <p class="tc-content-text">If a payment fails, is duplicated, remains pending, or is deducted without a confirmed order, customers should contact support with the relevant transaction information.</p>
          <p class="tc-content-text">We will investigate the issue and coordinate with the payment provider where necessary.</p>
          <p class="tc-content-text">Refund timing may depend on the payment provider, banking system, and applicable requirements.</p>
          <p class="tc-content-text"><strong>Dream Cart BD will not request a customer's payment PIN, password, or one-time password (OTP) for the purpose of issuing a refund.</strong></p>
        </div>
      </div>

      <!-- Section 11: Shipping and Delivery Policy -->
      <div class="tc-card tc-section-card" id="sec-11">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">11</span>
          <h2 class="tc-sec-title">Shipping and Delivery Policy</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Dream Cart BD aims to deliver eligible orders throughout Bangladesh, subject to service coverage and product restrictions.</p>
          <p class="tc-content-text">Delivery may be carried out by our own delivery arrangements or by third-party courier and logistics partners.</p>
          <div class="tc-sub-title"><span>📌</span> <span>11.1 Delivery Charges</span></div>
          <p class="tc-content-text">Delivery charges will be displayed during checkout or communicated to the customer before order confirmation.</p>
          <p class="tc-content-text">Where the applicable rate is BDT 130 for standard delivery, an additional BDT 20 per extra kilogram beyond the first kilogram may apply under the relevant shipping arrangement.</p>
          <p class="tc-content-text">These rates are illustrative of the applicable business arrangement and should be updated on the website whenever the actual shipping tariff changes.</p>
          <p class="tc-content-text">Additional charges, remote-area fees, oversized-product fees, or special handling costs will be disclosed before the customer commits to the order.</p>
          <div class="tc-sub-title"><span>📌</span> <span>11.2 Delivery Time</span></div>
          <p class="tc-content-text">Delivery time depends on the customer's location, product availability, order confirmation, courier operations, and other relevant circumstances.</p>
          <p class="tc-content-text">Where the applicable standard delivery estimate is 1–3 days, it should be understood as an estimate rather than a guaranteed delivery time unless expressly confirmed otherwise.</p>
          <p class="tc-content-text">Pre-order products may require additional procurement time. Any material difference in expected delivery time should be communicated to the customer.</p>
          <p class="tc-content-text">If a delivery delay becomes material, customers may contact support to obtain an updated status and discuss the available options.</p>
          <div class="tc-sub-title"><span>📌</span> <span>11.3 Delivery Address and Contact Information</span></div>
          <p class="tc-content-text">Customers must provide a complete and accurate delivery address, including:</p>
          <ul class="tc-list">
            <li>Recipient's name.</li>
            <li>Active mobile number.</li>
            <li>Division, district, and relevant area.</li>
            <li>Upazila, thana, or other applicable administrative area.</li>
            <li>Road, building, house number, landmark, or other necessary directions.</li>
          </ul>
          <p class="tc-content-text">Customers are responsible for promptly informing us of any address or phone-number changes before dispatch, where changes are still possible.</p>
          <div class="tc-sub-title"><span>📌</span> <span>11.4 Delivery Attempts</span></div>
          <p class="tc-content-text">Customers should remain reachable during the expected delivery period.</p>
          <p class="tc-content-text">If the delivery agent cannot reach the recipient or the address is incomplete, the courier may attempt redelivery or return the shipment according to its procedures.</p>
          <p class="tc-content-text">Any additional delivery charge resulting from a customer-requested change, failed delivery, or repeated attempt will be communicated where applicable and handled fairly.</p>
          <div class="tc-sub-title"><span>📌</span> <span>11.5 Inspection at Delivery</span></div>
          <p class="tc-content-text">Customers should inspect the external packaging and verify the received product as soon as reasonably possible.</p>
          <p class="tc-content-text">If the parcel appears damaged, opened, incomplete, or inconsistent with the order, customers should document the issue with photographs or videos and contact support promptly.</p>
          <p class="tc-content-text">Inspection procedures do not limit any statutory rights relating to defective, incorrect, or misrepresented products.</p>
        </div>
      </div>

      <!-- Section 12: Return and Exchange Policy -->
      <div class="tc-card tc-section-card" id="sec-12">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">12</span>
          <h2 class="tc-sec-title">Return and Exchange Policy</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Dream Cart BD seeks to resolve genuine product-related complaints fairly.</p>
          <p class="tc-content-text">Return or exchange requests may be considered where:</p>
          <ul class="tc-list">
            <li>The wrong product was delivered.</li>
            <li>The delivered product materially differs from its description.</li>
            <li>The product arrived damaged.</li>
            <li>A product has a manufacturing defect.</li>
            <li>An item or component is missing from the package.</li>
            <li>A return is otherwise required under applicable law or an advertised policy.</li>
          </ul>
          <p class="tc-content-text">Customers should contact support as soon as possible after discovering a problem and provide the order number, product details, a description of the issue, and supporting photographs or videos where relevant.</p>
          <div class="tc-sub-title"><span>📌</span> <span>12.1 Return Conditions</span></div>
          <p class="tc-content-text">Where appropriate, returned products should include their original packaging, accessories, manuals, tags, and other supplied components.</p>
          <p class="tc-content-text">Customers should not intentionally damage, modify, misuse, or dispose of a product before a complaint has been assessed, except where necessary for safety.</p>
          <p class="tc-content-text">We may request reasonable evidence to determine whether a problem is covered by the return policy.</p>
          <div class="tc-sub-title"><span>📌</span> <span>12.2 Products That May Have Restricted Returns</span></div>
          <p class="tc-content-text">For hygiene, safety, licensing, or product-specific reasons, certain products may be subject to additional return conditions. Examples may include:</p>
          <ul class="tc-list">
            <li>Personal-care and hygiene products.</li>
            <li>Sealed products that have been opened.</li>
            <li>Customized or made-to-order products.</li>
            <li>Digital licenses, activation keys, or software codes that have been activated or redeemed.</li>
            <li>Products damaged through misuse after delivery.</li>
          </ul>
          <p class="tc-content-text">These restrictions do not apply where a return, replacement, or refund is required by law or where the product was defective, incorrect, or materially misrepresented.</p>
          <div class="tc-sub-title"><span>📌</span> <span>12.3 Change of Mind</span></div>
          <p class="tc-content-text">A return request based solely on a change of mind, incorrect selection, or preference may be subject to the applicable product-specific policy.</p>
          <p class="tc-content-text">Any non-mandatory change-of-mind return conditions must be clearly communicated before purchase.</p>
        </div>
      </div>

      <!-- Section 13: Refund Policy -->
      <div class="tc-card tc-section-card" id="sec-13">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">13</span>
          <h2 class="tc-sec-title">Refund Policy</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Refunds will be considered in accordance with the circumstances of the order, the applicable Return & Refund Policy, and Bangladesh law.</p>
          <p class="tc-content-text">Refunds may be available where:</p>
          <ul class="tc-list">
            <li>An order is cancelled and payment has already been received.</li>
            <li>A paid product cannot be supplied.</li>
            <li>A valid return is approved.</li>
            <li>A duplicate or excess payment is confirmed.</li>
            <li>A product-related complaint qualifies for a refund.</li>
            <li>A refund is otherwise required by law.</li>
          </ul>
          <div class="tc-sub-title"><span>📌</span> <span>13.1 Refund Processing</span></div>
          <p class="tc-content-text">Once a refund is approved, it will be processed through an appropriate payment channel.</p>
          <p class="tc-content-text">Where possible, refunds may be returned through the original payment method. Alternative arrangements may be made where necessary and lawful.</p>
          <p class="tc-content-text">The processing period depends on the reason for the refund, payment provider, bank, and other relevant circumstances.</p>
          <p class="tc-content-text">Any legally applicable refund deadline will take precedence over an estimated processing time.</p>
          <div class="tc-sub-title"><span>📌</span> <span>13.2 Delivery Charges</span></div>
          <p class="tc-content-text">The treatment of delivery charges will depend on the reason for the return or cancellation and the applicable policy.</p>
          <p class="tc-content-text">Where the seller or platform is responsible for a wrong, defective, or materially misdescribed product, applicable delivery charges will be handled in accordance with the relevant legal obligations.</p>
          <p class="tc-content-text">For other return requests, the customer may be responsible for return shipping if this was clearly disclosed and is permitted by law.</p>
          <div class="tc-sub-title"><span>📌</span> <span>13.3 Refund Fraud</span></div>
          <p class="tc-content-text">False claims, fabricated evidence, altered receipts, or deliberate misuse of the refund process may result in an investigation and appropriate action, subject to applicable law.</p>
          <p class="tc-content-text">Nothing in this section prevents a customer from making a genuine complaint or exercising a lawful consumer right.</p>
        </div>
      </div>

      <!-- Section 14: Product Warranty and After-Sales Service -->
      <div class="tc-card tc-section-card" id="sec-14">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">14</span>
          <h2 class="tc-sec-title">Product Warranty and After-Sales Service</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">A warranty applies only where it is offered by the manufacturer, authorized supplier, seller, or Dream Cart BD and its terms are disclosed for the relevant product.</p>
          <p class="tc-content-text">Warranty conditions may specify:</p>
          <ul class="tc-list">
            <li>Warranty duration.</li>
            <li>Covered defects.</li>
            <li>Excluded damage.</li>
            <li>Required purchase documentation.</li>
            <li>Authorized service locations.</li>
            <li>Repair, replacement, or other available remedies.</li>
          </ul>
          <p class="tc-content-text">Customers should retain their invoice, order number, warranty card, and other relevant documents.</p>
          <p class="tc-content-text">Damage caused by misuse, unauthorized repair, accidents, improper installation, or failure to follow instructions may not be covered by a particular warranty, subject to the warranty terms and applicable law.</p>
          <p class="tc-content-text">Products without an expressly stated warranty should not be assumed to have a manufacturer warranty. However, the absence of a commercial warranty does not eliminate any mandatory rights or remedies under applicable law.</p>
        </div>
      </div>

      <!-- Section 15: Pre-Order and Special-Order Products -->
      <div class="tc-card tc-section-card" id="sec-15">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">15</span>
          <h2 class="tc-sec-title">Pre-Order and Special-Order Products</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Pre-order products may not be immediately available in our inventory.</p>
          <p class="tc-content-text">The product page or order confirmation should specify the expected availability or delivery period, where known.</p>
          <p class="tc-content-text">Customers should review any disclosed pre-order conditions before payment.</p>
          <p class="tc-content-text">If a pre-order cannot be fulfilled, Dream Cart BD will inform the customer and provide an appropriate resolution, including a refund where required.</p>
          <p class="tc-content-text">Any advance payment will be handled in accordance with applicable digital commerce requirements and the disclosed payment terms.</p>
        </div>
      </div>

      <!-- Section 16: Vendor and Multi-Vendor Marketplace Terms -->
      <div class="tc-card tc-section-card" id="sec-16">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">16</span>
          <h2 class="tc-sec-title">Vendor and Multi-Vendor Marketplace Terms</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Where third-party sellers are permitted to offer products through Dream Cart BD, the following principles apply.</p>
          <div class="tc-sub-title"><span>📌</span> <span>16.1 Vendor Responsibilities</span></div>
          <p class="tc-content-text">Each participating vendor is responsible for:</p>
          <ul class="tc-list">
            <li>Providing accurate product information.</li>
            <li>Maintaining reasonable inventory accuracy.</li>
            <li>Supplying authentic products and lawful goods.</li>
            <li>Disclosing material product conditions.</li>
            <li>Preparing and fulfilling orders according to agreed arrangements.</li>
            <li>Complying with applicable consumer protection, tax, licensing, and other legal requirements.</li>
            <li>Responding to legitimate product-related complaints.</li>
            <li>Respecting intellectual property and third-party rights.</li>
          </ul>
          <div class="tc-sub-title"><span>📌</span> <span>16.2 Seller Identification</span></div>
          <p class="tc-content-text">Where applicable, the platform may identify the seller responsible for a listing or order.</p>
          <p class="tc-content-text">Customers should review the seller details and product-specific conditions shown on the website.</p>
          <p class="tc-content-text">The allocation of responsibilities between Dream Cart BD, vendors, suppliers, and delivery partners does not remove any obligation that applicable law places on a particular party.</p>
          <div class="tc-sub-title"><span>📌</span> <span>16.3 Vendor Listings and Content</span></div>
          <p class="tc-content-text">Vendors must not upload misleading photographs, false specifications, unauthorized trademarks, counterfeit products, unlawful content, or prohibited items.</p>
          <p class="tc-content-text">Dream Cart BD may review, restrict, suspend, or remove listings that violate platform rules or applicable law.</p>
          <div class="tc-sub-title"><span>📌</span> <span>16.4 Vendor Payments and Commission</span></div>
          <p class="tc-content-text">Commission, settlement, payment schedules, returns, deductions, delivery costs, and other vendor financial arrangements will be governed by the applicable vendor agreement or separately published terms.</p>
          <p class="tc-content-text">No commission rate or settlement period should be assumed unless it has been expressly agreed or disclosed.</p>
          <div class="tc-sub-title"><span>📌</span> <span>16.5 Vendor Account Suspension</span></div>
          <p class="tc-content-text">Vendor accounts may be restricted or suspended for fraud, repeated customer complaints, failure to fulfill orders, counterfeit listings, manipulation of reviews, or other material violations.</p>
          <p class="tc-content-text">Where appropriate, the vendor may be given an opportunity to respond or correct the issue.</p>
        </div>
      </div>

      <!-- Section 17: Reseller and Wholesale Terms -->
      <div class="tc-card tc-section-card" id="sec-17">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">17</span>
          <h2 class="tc-sec-title">Reseller and Wholesale Terms</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Dream Cart BD may offer reseller or wholesale opportunities under separate eligibility, pricing, stock, and operational conditions.</p>
          <div class="tc-sub-title"><span>📌</span> <span>17.1 Reseller Responsibilities</span></div>
          <p class="tc-content-text">Resellers must:</p>
          <ul class="tc-list">
            <li>Provide accurate customer and order information.</li>
            <li>Communicate product details and prices correctly.</li>
            <li>Avoid misleading advertisements or unsupported product claims.</li>
            <li>Follow applicable order submission and payment procedures.</li>
            <li>Respect customer privacy.</li>
            <li>Avoid representing themselves as employees or authorized representatives beyond their actual authorization.</li>
          </ul>
          <p class="tc-content-text">Any commission, margin, or reseller benefit applies only where expressly agreed.</p>
          <div class="tc-sub-title"><span>📌</span> <span>17.2 Wholesale Orders</span></div>
          <p class="tc-content-text">Wholesale pricing may depend on the product, order quantity, minimum order quantity (MOQ), stock availability, and agreed delivery arrangements.</p>
          <p class="tc-content-text">Wholesale customers should obtain written confirmation of the final price, quantity, payment terms, and delivery conditions before completing an order.</p>
          <p class="tc-content-text">Wholesale purchases may be subject to separate return or exchange conditions where lawfully permitted. Mandatory consumer or contractual rights remain unaffected.</p>
          <div class="tc-sub-title"><span>📌</span> <span>17.3 Reseller and Wholesale Misconduct</span></div>
          <p class="tc-content-text">Fraudulent orders, false customer details, unauthorized price promises, payment manipulation, or misuse of confidential business information may result in suspension or termination of the relevant business arrangement.</p>
        </div>
      </div>

      <!-- Section 18: Prohibited Products and Activities -->
      <div class="tc-card tc-section-card" id="sec-18">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">18</span>
          <h2 class="tc-sec-title">Prohibited Products and Activities</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Users and vendors must not use Dream Cart BD to list, promote, sell, or purchase products or services prohibited by applicable law or by our platform rules.</p>
          <p class="tc-content-text">Prohibited activities include:</p>
          <ul class="tc-list">
            <li>Fraud, impersonation, and deceptive commercial practices.</li>
            <li>Counterfeit or unlawfully obtained goods.</li>
            <li>Unauthorized use of copyrighted material or trademarks.</li>
            <li>Attempts to bypass payment or security systems.</li>
            <li>Distribution of malware or malicious code.</li>
            <li>Unauthorized access to accounts or platform infrastructure.</li>
            <li>Manipulation of reviews, orders, prices, or promotional offers.</li>
            <li>Uploading unlawful, threatening, or abusive content.</li>
            <li>Any other activity that violates applicable law.</li>
          </ul>
          <p class="tc-content-text">Dream Cart BD may investigate credible reports and take proportionate action, including removing listings, restricting accounts, cancelling affected orders where lawful, or reporting suspected unlawful activity to the appropriate authority.</p>
        </div>
      </div>

      <!-- Section 19: Customer Reviews and User-Generated Content -->
      <div class="tc-card tc-section-card" id="sec-19">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">19</span>
          <h2 class="tc-sec-title">Customer Reviews and User-Generated Content</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Customers may be permitted to submit reviews, ratings, photographs, or other content.</p>
          <p class="tc-content-text">Users must ensure that their submissions are truthful, relevant, lawful, and based on genuine experiences where presented as customer reviews.</p>
          <p class="tc-content-text">Users must not post:</p>
          <ul class="tc-list">
            <li>False or fabricated reviews.</li>
            <li>Another person's private information without authorization.</li>
            <li>Abusive, discriminatory, threatening, or unlawful content.</li>
            <li>Copyrighted material without the necessary rights.</li>
            <li>Promotional spam or content intended to manipulate ratings.</li>
          </ul>
          <p class="tc-content-text">By submitting content, users grant Dream Cart BD permission to display and use that content for operating and promoting the relevant platform features, subject to applicable law and the Privacy Policy.</p>
          <p class="tc-content-text">Users retain any ownership rights they have in their original content. Any broader commercial use requiring additional consent will be handled as required by law.</p>
          <p class="tc-content-text">We may moderate or remove content that violates these terms, without guaranteeing that every review will be independently verified.</p>
        </div>
      </div>

      <!-- Section 20: Privacy and Personal Data -->
      <div class="tc-card tc-section-card" id="sec-20">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">20</span>
          <h2 class="tc-sec-title">Privacy and Personal Data</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Dream Cart BD may collect information necessary to provide its services, including:</p>
          <ul class="tc-list">
            <li>Name and contact information.</li>
            <li>Delivery and billing address.</li>
            <li>Order history and transaction references.</li>
            <li>Account and communication records.</li>
            <li>Information necessary to prevent fraud and secure the platform.</li>
            <li>Technical information collected through website operation, where applicable.</li>
          </ul>
          <p class="tc-content-text">We use personal information for legitimate operational purposes, including processing orders, arranging delivery, handling payments, providing customer support, preventing fraud, and meeting legal obligations.</p>
          <p class="tc-content-text">Information may be shared with relevant delivery providers, payment processors, authorized vendors, technical service providers, or public authorities where necessary and lawful.</p>
          <p class="tc-content-text">We do not intend to sell customers' personal information as a commercial product.</p>
          <p class="tc-content-text">Personal information will be handled in accordance with our Privacy Policy and applicable legal requirements. Access, retention, correction, deletion, and other rights will be addressed as applicable under the relevant law.</p>
          <p class="tc-content-text">Customers should review our Privacy Policy for more information about data collection, cookies, security, retention, and third-party services.</p>
        </div>
      </div>

      <!-- Section 21: Cookies and Website Technologies -->
      <div class="tc-card tc-section-card" id="sec-21">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">21</span>
          <h2 class="tc-sec-title">Cookies and Website Technologies</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">The website may use cookies or similar technologies to support:</p>
          <ul class="tc-list">
            <li>Shopping cart functionality.</li>
            <li>Account sessions.</li>
            <li>User preferences.</li>
            <li>Website performance and security.</li>
            <li>Analytics or other disclosed services, where enabled.</li>
          </ul>
          <p class="tc-content-text">Customers may be able to manage cookies through their browser settings. Disabling certain cookies may affect the functionality of some website features.</p>
          <p class="tc-content-text">Any consent requirements applicable to cookies or tracking technologies will be handled in accordance with the relevant law.</p>
        </div>
      </div>

      <!-- Section 22: Intellectual Property Rights -->
      <div class="tc-card tc-section-card" id="sec-22">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">22</span>
          <h2 class="tc-sec-title">Intellectual Property Rights</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Unless otherwise stated, the website's design, branding, original text, graphics, logos, software, layout, and other original materials are owned by or licensed to their respective rights holders.</p>
          <p class="tc-content-text">Users may access the website for personal shopping and legitimate business purposes authorized by Dream Cart BD.</p>
          <p class="tc-content-text">Users must not reproduce, redistribute, modify, commercially exploit, or misrepresent protected content without the necessary permission.</p>
          <p class="tc-content-text">Product photographs, trademarks, and other materials belonging to manufacturers, brands, vendors, or third parties remain subject to their respective rights.</p>
          <p class="tc-content-text">Nothing in these terms transfers ownership of intellectual property to a user.</p>
        </div>
      </div>

      <!-- Section 23: Website Availability and Technical Issues -->
      <div class="tc-card tc-section-card" id="sec-23">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">23</span>
          <h2 class="tc-sec-title">Website Availability and Technical Issues</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Dream Cart BD aims to keep the platform accessible and functional.</p>
          <p class="tc-content-text">However, temporary interruptions may occur because of:</p>
          <ul class="tc-list">
            <li>Maintenance or software updates.</li>
            <li>Hosting or network problems.</li>
            <li>Payment gateway outages.</li>
            <li>Security incidents.</li>
            <li>Third-party service failures.</li>
            <li>Events beyond our reasonable control.</li>
          </ul>
          <p class="tc-content-text">We may update, modify, suspend, or discontinue particular features where reasonably necessary.</p>
          <p class="tc-content-text">We will take reasonable steps to address material technical issues, but we do not guarantee uninterrupted access or error-free operation at all times.</p>
          <p class="tc-content-text">Technical limitations do not remove any obligations concerning confirmed orders, customer payments, or legal rights.</p>
        </div>
      </div>

      <!-- Section 24: Third-Party Services and External Links -->
      <div class="tc-card tc-section-card" id="sec-24">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">24</span>
          <h2 class="tc-sec-title">Third-Party Services and External Links</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">The website may connect to or provide links to third-party payment providers, courier services, manufacturers, vendors, social networks, or other websites.</p>
          <p class="tc-content-text">Those third parties may operate under their own terms and privacy policies.</p>
          <p class="tc-content-text">Dream Cart BD does not automatically control every third-party website or service. However, our use of a third party does not remove responsibilities that we have under applicable law or our own contractual commitments.</p>
          <p class="tc-content-text">Customers should review the applicable third-party terms before using external services.</p>
        </div>
      </div>

      <!-- Section 25: Limitation of Liability -->
      <div class="tc-card tc-section-card" id="sec-25">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">25</span>
          <h2 class="tc-sec-title">Limitation of Liability</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Dream Cart BD will be responsible for obligations imposed on it by applicable law and by its applicable contractual commitments.</p>
          <p class="tc-content-text">To the extent permitted by law, we are not responsible for indirect losses arising solely from circumstances outside our reasonable control, such as external network interruptions or third-party service outages.</p>
          <p class="tc-content-text">Nothing in these terms excludes or limits liability where such exclusion or limitation is prohibited by law, including applicable obligations relating to fraud, deliberate misconduct, or mandatory consumer protection rights.</p>
          <p class="tc-content-text">Where a third-party seller is responsible for a product, the allocation of responsibility will depend on the transaction, applicable agreements, and governing law.</p>
          <p class="tc-content-text">Nothing in this section should be interpreted as a blanket exemption from responsibility for a product, payment, delivery, or service that Dream Cart BD is legally required to provide.</p>
        </div>
      </div>

      <!-- Section 26: Indemnification -->
      <div class="tc-card tc-section-card" id="sec-26">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">26</span>
          <h2 class="tc-sec-title">Indemnification</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">To the extent permitted by applicable law, users and vendors may be responsible for losses, claims, or reasonable costs directly resulting from their unlawful conduct, fraud, infringement of third-party rights, or material breach of these terms.</p>
          <p class="tc-content-text">This provision does not apply to the extent that a loss was caused by Dream Cart BD's own conduct or where imposing such responsibility would be unlawful.</p>
        </div>
      </div>

      <!-- Section 27: Force Majeure -->
      <div class="tc-card tc-section-card" id="sec-27">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">27</span>
          <h2 class="tc-sec-title">Force Majeure</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">A party may experience delays or disruption caused by events beyond its reasonable control, including natural disasters, severe weather, civil emergencies, transport disruptions, widespread technical failures, or government restrictions.</p>
          <p class="tc-content-text">Where such an event affects an order or service, the affected party should take reasonable steps to reduce the impact and communicate material delays where appropriate.</p>
          <p class="tc-content-text">Force majeure does not automatically cancel a customer's right to a refund or another remedy where required by applicable law.</p>
        </div>
      </div>

      <!-- Section 28: Changes to These Terms -->
      <div class="tc-card tc-section-card" id="sec-28">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">28</span>
          <h2 class="tc-sec-title">Changes to These Terms</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Dream Cart BD may update these Terms & Conditions to reflect changes in its services, website features, business arrangements, security practices, or legal requirements.</p>
          <p class="tc-content-text">The revised version will be published on the website with an updated effective date or revision date.</p>
          <p class="tc-content-text">Material changes may be communicated through the website or other appropriate channels where necessary.</p>
          <p class="tc-content-text">Changes will not retrospectively remove rights that have already accrued to customers or override obligations that apply to an existing transaction.</p>
          <p class="tc-content-text">Continued use of the website after an update constitutes acceptance only to the extent permitted by applicable law and the circumstances of the change.</p>
        </div>
      </div>

      <!-- Section 29: Complaints and Dispute Resolution -->
      <div class="tc-card tc-section-card" id="sec-29">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">29</span>
          <h2 class="tc-sec-title">Complaints and Dispute Resolution</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Customers should contact Dream Cart BD support first if they have concerns regarding an order, payment, delivery, product, vendor, or refund.</p>
          <p class="tc-content-text">To help us investigate a complaint, please provide:</p>
          <ul class="tc-list">
            <li>Order number.</li>
            <li>Customer name and contact number.</li>
            <li>Product name.</li>
            <li>A clear description of the issue.</li>
            <li>Relevant payment or delivery information.</li>
            <li>Photographs, videos, or other supporting evidence where appropriate.</li>
          </ul>
          <p class="tc-content-text">We will review the complaint and aim to provide a reasonable response within an appropriate period.</p>
          <p class="tc-content-text">If the complaint cannot be resolved directly, customers may pursue remedies through the relevant consumer protection authority or other competent authority under applicable law.</p>
          <p class="tc-content-text">Nothing in these terms prevents customers from exercising their statutory rights or filing a lawful complaint.</p>
        </div>
      </div>

      <!-- Section 30: Governing Law and Jurisdiction -->
      <div class="tc-card tc-section-card" id="sec-30">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">30</span>
          <h2 class="tc-sec-title">Governing Law and Jurisdiction</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">These Terms & Conditions are intended to be governed by the laws of Bangladesh, to the extent applicable.</p>
          <p class="tc-content-text">Disputes will be addressed through good-faith communication and, where appropriate, the relevant legal or regulatory process.</p>
          <p class="tc-content-text">Any jurisdiction clause will be subject to mandatory legal provisions and the authority of the competent courts or tribunals.</p>
        </div>
      </div>

      <!-- Section 31: Severability -->
      <div class="tc-card tc-section-card" id="sec-31">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">31</span>
          <h2 class="tc-sec-title">Severability</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">If any provision of these terms is found invalid, unlawful, or unenforceable, that provision will be interpreted or limited to the extent legally permissible.</p>
          <p class="tc-content-text">The remaining provisions will continue to apply to the extent they remain valid and enforceable.</p>
        </div>
      </div>

      <!-- Section 32: No Waiver -->
      <div class="tc-card tc-section-card" id="sec-32">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">32</span>
          <h2 class="tc-sec-title">No Waiver</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">Failure to enforce a provision immediately does not automatically waive the right to enforce it later.</p>
          <p class="tc-content-text">Any waiver must be interpreted in accordance with applicable law and the circumstances in which it is given.</p>
        </div>
      </div>

      <!-- Section 33: Entire Agreement -->
      <div class="tc-card tc-section-card" id="sec-33">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">33</span>
          <h2 class="tc-sec-title">Entire Agreement</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">These Terms & Conditions, together with the applicable Privacy Policy, Shipping Policy, Return & Refund Policy, product-specific conditions, and any separately agreed vendor or reseller terms, govern the relevant use of Dream Cart BD.</p>
          <p class="tc-content-text">Where terms conflict, mandatory law will prevail. Any specific agreement or product condition will apply only to the extent it is valid, disclosed, and consistent with applicable law.</p>
        </div>
      </div>

      <!-- Section 34: Contact Information -->
      <div class="tc-card tc-section-card" id="sec-34">
        <div class="tc-sec-header">
          <span class="tc-sec-badge">34</span>
          <h2 class="tc-sec-title">Contact Information</h2>
        </div>
        <div class="tc-sec-body">
          <p class="tc-content-text">For questions, order assistance, complaints, returns, refunds, or other concerns, please contact Dream Cart BD through the following channels:</p>
          <p class="tc-content-text"><strong>Business:</strong> Dream Cart BD<br><strong>Website:</strong> <a href="https://dreamcartbd.com/" target="_blank" class="tc-link">https://dreamcartbd.com/</a><br><strong>WhatsApp / Mobile:</strong> <a href="tel:01581703822" class="tc-link font-bold">01581703822</a><br><strong>Alternative Contact:</strong> <a href="tel:01818273838" class="tc-link font-bold">01818273838</a><br><strong>Email:</strong> <a href="mailto:dreamcartbd.store@gmail.com" class="tc-link">dreamcartbd.store@gmail.com</a><br><strong>Additional Email:</strong> <a href="mailto:jainal.dcitbd@gmail.com" class="tc-link">jainal.dcitbd@gmail.com</a><br><strong>Additional Email:</strong> <a href="mailto:saiful05333@gmail.com" class="tc-link">saiful05333@gmail.com</a></p>
          <p class="tc-content-text">For further information, search for <strong>Dream Cart BD</strong> on Google.</p>
          <p class="tc-content-text">When contacting us about an existing order, please include your order number and the mobile number used when placing the order.</p>
        </div>
      </div>

      <!-- Section : Final Notice -->
      <div class="tc-card tc-section-card text-center" id="sec-final">
        <div class="tc-sec-header justify-center border-b-0 pb-0">
          <span class="tc-sec-badge">★</span>
          <h2 class="tc-sec-title">Final Notice</h2>
        </div>
        <div class="tc-sec-body mt-2">
          <p class="tc-content-text max-w-2xl mx-auto">By using Dream Cart BD and placing an order, you acknowledge that you have had the opportunity to review these Terms & Conditions and the policies applicable to your transaction.</p>
          <p class="tc-content-text max-w-2xl mx-auto">Dream Cart BD is committed to providing a transparent, reliable, and customer-focused online shopping experience while respecting the rights of customers, sellers, vendors, and other platform participants.</p>
          <div class="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            <strong class="text-sm text-emerald-600 dark:text-emerald-400 font-black">Dream Cart BD — Your Trusted Online Shopping Destination.</strong>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function renderPrivacyPage() {
  return `
    <!-- Scoped Styles for Privacy Policy Page -->
    <style id="privacy-page-custom-styles">
      .pp-wrapper {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      }
      .pp-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        padding: 26px 30px;
        box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.04);
      }
      .dark .pp-card {
        background: #0f172a;
        border-color: #1e293b;
        box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4);
      }
    </style>

    <div class="pp-wrapper max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-6">
      
      <!-- Privacy Hero -->
      <div class="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white">
        <div class="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
          🔒 ডেটা নিরাপত্তা ও গোপনীয়তা
        </div>
        <h1 class="text-2xl sm:text-3xl font-black mb-2">গোপনীয়তা নীতিমালা (Privacy Policy)</h1>
        <p class="text-slate-300 text-xs sm:text-sm">Dream Cart BD — আপনার তথ্যের সর্বোচ্চ নিরাপত্তা বজায় রাখতে প্রতিশ্রুতিবদ্ধ।</p>
      </div>

      <!-- Privacy Body Card -->
      <div class="pp-card text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed">
        <p><strong>১. তথ্য সংগ্রহ ও ব্যবহার:</strong> গ্রাহকের নাম, মোবাইল নম্বর ও ডেলিভারি ঠিকানা শুধুমাত্র পণ্য সরবরাহ, অর্ডার নিশ্চিতকরণ ও কাস্টমার সার্ভিসের প্রয়োজনে সংগ্রহ করা হয়।</p>
        <p><strong>২. ডেটা নিরাপত্তা:</strong> গ্রাহকের ব্যক্তিগত ও আর্থিক তথ্য অত্যন্ত বিশ্বস্তভাবে এনক্রিপ্ট করে সংরক্ষণ করা হয়। কোনো প্রকার বাণিজ্যিক লাভের জন্য তৃতীয় পক্ষের কাছে তথ্য বিক্রয় বা বিনিময় করা হয় না।</p>
        <p><strong>৩. কুকিজ পলিসি:</strong> ওয়েবসাইটের কার্যকারিতা ও শপিং কার্ট সেশন সক্রিয় রাখার জন্য প্রয়োজনীয় ব্রাউজার কুকিজ ব্যবহৃত হয়।</p>
        <p><strong>৪. যোগাযোগ:</strong> গোপনীয়তা সংক্রান্ত যেকোনো জিজ্ঞাসায় ইমেইল করুন: <a href="mailto:dreamcartbd.store@gmail.com" class="text-emerald-500 font-bold hover:underline">dreamcartbd.store@gmail.com</a></p>
      </div>

    </div>
  `;
}
