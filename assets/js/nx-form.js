/* NX Solutions — onboarding contact form
   Renders into any element with [data-nx-form]. Three steps, visual
   selectors, synthesized success chime, EN/AR aware via <html lang>.

   To wire to your Zoho CRM Web-to-Lead form, fill the constants below.
   Until then the form runs in DEMO mode (logs payload, shows success).
*/

(function () {
  // ---------- Zoho CRM Web-to-Lead wiring ----------
  // Production-ready config from the form generated at
  // Setup → Channels → Web Forms (NX Website Leads Form).
  const ZOHO_ENDPOINT = 'https://crm.zoho.sa/crm/WebToLeadForm';
  const ZOHO_HIDDEN = {
    xnQsjsdp:      '36f4791acdeae3763cabf4060054bc5d64a461f3c2070ca9b0e586363277411f',
    xmIwtLD:       '57f9abfce5eb0339c8cb29cab7256fd07c9617d7bb7efc2911992a699b5ea084eae79b8c12ee8b80f7f5a7bce75ec1c4',
    actionType:    'TGVhZHM=',
    returnURL:     'null',
    zc_gad:        '',
    // Zoho honeypot — bots fill it, we leave it empty
    'aG9uZXlwb3Q': '',
  };
  // Internal field name → Zoho lead-field API name from the generated form.
  // (Note: Zoho uses spaces in some names, e.g. 'Last Name'.)
  const ZOHO_FIELD_MAP = {
    name:         'Last Name',
    email:        'Email',
    phone:        'Phone',
    company:      'Company',
    role:         'LEADCF10',    // Role
    sector:       'LEADCF12',    // Sector
    stage:        'LEADCF9',     // Company Stage
    service:      'LEADCF7',     // Service Interest
    time:         'LEADCF8',     // Best Time
    details:      'LEADCF11',    // Note (textarea)
    source_page:  'LEADCF1',     // Source Page
    utm_source:   'LEADCF2',     // UTM_Source
    utm_campaign: 'LEADCF3',     // UTM_Campaign
    utm_medium:   'LEADCF4',     // UTM_Medium
    referrer:     'LEADCF5',     // Referrer_URL
    language:     'LEADCF6',     // Lang_Code
  };
  // Picklist value mapping: internal value → Zoho picklist label.
  const ZOHO_VALUE_MAP = {
    stage: {
      pre:    'Pre-launch',
      live:   'live-platform',
      invest: 'Pre-investment',
    },
    service: {
      launch:  'launch',
      grow:    'grow',
      auto:    'automation',
      connect: 'connect',
      scale:   'scale',
      unsure:  'Not Sure',
    },
    time: {
      morning:   'Morning',
      noon:      'Noon',
      afternoon: 'Afternoon',
      evening:   'Evening',
      any:       'Any Time',
    },
  };
  // -----------------------------------------------------------

  const hosts = document.querySelectorAll('[data-nx-form]');
  if (!hosts.length) return;

  const lang = document.documentElement.lang === 'ar' ? 'ar' : 'en';
  const isRTL = document.documentElement.dir === 'rtl';

  // ---------- i18n ----------
  const S = {
    ar: {
      progress: 'الخطوة %s من %s',
      next: 'التالي', back: 'السابق', submit: 'إرسال الطلب', sending: 'جاري الإرسال…',

      s1Title: 'دعنا نتعرّف عليك',
      s1Sub: 'خطوة سريعة لنبدأ المحادثة.',
      lblName: 'الاسم الكامل', phName: 'اسمك الكامل',
      lblEmail: 'البريد الإلكتروني', phEmail: 'name@company.com',
      lblPhone: 'رقم الجوال', phPhone: '5XXXXXXXX',
      prefixPhone: '+966',

      s2Title: 'حدّثنا عن منشأتك',
      s2Sub: 'لنفهم سياقك واحتياجاتك بدقّة.',
      lblCompany: 'اسم المنشأة', phCompany: 'اسم شركتك',
      lblRole: 'دورك في المنشأة', phRole: 'مؤسس · مدير تقني · …', tagOptional: 'اختياري',
      lblSector: 'القطاع',
      lblStage: 'مرحلة منشأتك',

      s3Title: 'آخر خطوة',
      s3Sub: 'متى نتواصل معك، وأي خدمة تهمك؟',
      lblService: 'الخدمة التي تهمك',
      lblTime: 'الوقت المفضل للتواصل',
      lblDetails: 'تفاصيل إضافية', phDetails: 'أخبرنا أكثر عن مشروعك أو أهدافك…',

      sectors: [
        ['fintech',    'تقنية مالية'],
        ['proptech',   'عقارات'],
        ['healthtech', 'صحة'],
        ['insurtech',  'تأمين'],
        ['ecommerce',  'تجارة إلكترونية'],
        ['ondemand',   'حسب الطلب'],
        ['logistics',  'لوجستيات'],
        ['other',      'قطاع آخر'],
      ],
      stages: [
        ['pre',     'قبل الإطلاق',   'لدينا فكرة ونريد بناءها'],
        ['live',    'منصة قائمة',     'نطوّر ما هو موجود لدينا'],
        ['invest',  'تحضير لاستثمار', 'نستعد لجولة تمويلية'],
      ],
      services: [
        ['launch',  'NX Launch',  'بناء جديد من الصفر'],
        ['grow',    'NX Grow',    'تطوير وتحسين'],
        ['auto',    'NX 360',     'أتمتة العمليات'],
        ['connect', 'NX Connect', 'ربط حكومي'],
        ['scale',   'NX Scale',   'جاهزية استثمار'],
        ['unsure',  'غير متأكد',  'اقترحوا علينا'],
      ],
      times: [
        ['morning',   'صباحاً',   '9 – 12'],
        ['noon',      'ظهراً',    '12 – 3'],
        ['afternoon', 'عصراً',    '3 – 6'],
        ['evening',   'مساءً',    '6 – 9'],
        ['any',       'أي وقت',   'مناسبكم'],
      ],

      errRequired: 'هذا الحقل مطلوب',
      errEmail: 'بريد إلكتروني غير صحيح',
      errPhone: 'رقم جوال غير صحيح',
      errChoose: 'يرجى اختيار خيار',

      successTitle: 'تم استلام طلبك',
      successSub: 'نعمل على معالجة طلبك الآن، وسنتواصل معك في أقرب وقت ممكن.',
      successMeta: 'سيصلك تأكيد على بريدك الإلكتروني',
      successAgain: 'إرسال طلب آخر',

      failTitle: 'تعذّر إرسال الطلب',
      failSub: 'تحقق من اتصالك بالإنترنت وحاول مجدداً، أو راسلنا مباشرة على hello@nx.sa',
      failRetry: 'حاول مرة أخرى',
    },
    en: {
      progress: 'Step %s of %s',
      next: 'Next', back: 'Back', submit: 'Send request', sending: 'Sending…',

      s1Title: "Let's get to know you",
      s1Sub: "A quick intro to start the conversation.",
      lblName: 'Full name', phName: 'Your full name',
      lblEmail: 'Email', phEmail: 'name@company.com',
      lblPhone: 'Phone number', phPhone: '5XXXXXXXX',
      prefixPhone: '+966',

      s2Title: 'Tell us about your company',
      s2Sub: 'So we understand your context and needs.',
      lblCompany: 'Company name', phCompany: 'Your company',
      lblRole: 'Your role', phRole: 'Founder · CTO · …', tagOptional: 'optional',
      lblSector: 'Sector',
      lblStage: 'Company stage',

      s3Title: 'Last step',
      s3Sub: 'When can we reach you, and what interests you?',
      lblService: 'Service of interest',
      lblTime: 'Best time to contact you',
      lblDetails: 'Additional details', phDetails: 'Tell us more about your project or goals…',

      sectors: [
        ['fintech',    'FinTech'],
        ['proptech',   'PropTech'],
        ['healthtech', 'HealthTech'],
        ['insurtech',  'InsurTech'],
        ['ecommerce',  'E-Commerce'],
        ['ondemand',   'On-Demand'],
        ['logistics',  'Logistics'],
        ['other',      'Other'],
      ],
      stages: [
        ['pre',    'Pre-launch',          'We have an idea to build'],
        ['live',   'Live platform',       'We need to grow what we have'],
        ['invest', 'Preparing investment','We are preparing a round'],
      ],
      services: [
        ['launch',  'NX Launch',  'Build from scratch'],
        ['grow',    'NX Grow',    'Develop & improve'],
        ['auto',    'NX 360',     'Process automation'],
        ['connect', 'NX Connect', 'Government integration'],
        ['scale',   'NX Scale',   'Investment readiness'],
        ['unsure',  'Not sure',   'Suggest the right one'],
      ],
      times: [
        ['morning',   'Morning',   '9 – 12'],
        ['noon',      'Noon',      '12 – 3'],
        ['afternoon', 'Afternoon', '3 – 6'],
        ['evening',   'Evening',   '6 – 9'],
        ['any',       'Anytime',   'Your call'],
      ],

      errRequired: 'This field is required',
      errEmail: 'Invalid email',
      errPhone: 'Invalid phone number',
      errChoose: 'Please pick an option',

      successTitle: 'Request received',
      successSub: "We're processing your request and will be in touch as soon as possible.",
      successMeta: "A confirmation has been sent to your email",
      successAgain: 'Send another request',

      failTitle: 'Could not send the request',
      failSub: 'Check your connection and try again, or email us directly at hello@nx.sa',
      failRetry: 'Try again',
    },
  }[lang];

  // ---------- helpers ----------
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const $ = (sel, root) => (root||document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root||document).querySelectorAll(sel));

  // simple sector icon set (12x12-ish stroke svgs)
  const ICONS = {
    fintech:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/></svg>',
    proptech:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/></svg>',
    healthtech: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>',
    insurtech:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>',
    ecommerce:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6h15l-1.5 9h-12zM6 6L5 3H2M9 20a1 1 0 100 2 1 1 0 000-2zM18 20a1 1 0 100 2 1 1 0 000-2z"/></svg>',
    ondemand:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    logistics:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 7h13v9H1zM14 10h5l3 3v3h-8M5 19a2 2 0 100-4 2 2 0 000 4zM18 19a2 2 0 100-4 2 2 0 000 4z"/></svg>',
    other:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 5v14M5 12h14"/></svg>',

    pre:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg>',
    live:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 21h16M6 21V9l6-4 6 4v12M10 21v-6h4v6"/></svg>',
    invest: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 21l3-9 4-5 4 5 3 9M12 7V3M9 3h6"/></svg>',

    launch:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2l3 6 6 .8-4.5 4.3L18 20l-6-3.2L6 20l1.5-6.9L3 8.8 9 8z"/></svg>',
    grow:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 18l5-5 4 4 7-8M14 4h6v6"/></svg>',
    auto:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
    connect: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 12h6M12 9v6M5 5l4 4M19 5l-4 4M5 19l4-4M19 19l-4-4"/></svg>',
    scale:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>',
    unsure:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 0c0 2-2.5 2-2.5 4M12 17h.01"/></svg>',

    morning:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>',
    noon:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>',
    afternoon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 18a6 6 0 1112 0M2 18h20"/></svg>',
    evening:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 14A8 8 0 0110 4a8 8 0 1010 10z"/></svg>',
    any:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  };

  // ---------- success chime (Web Audio API, no asset) ----------
  let audioCtx;
  function chime() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      // D5 → A5 → D6 (pleasant uplift)
      const notes = [[587.33, 0, 0.35], [880.00, 0.10, 0.45], [1174.66, 0.22, 0.55]];
      notes.forEach(([f, s, d]) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        o.connect(g).connect(ctx.destination);
        g.gain.setValueAtTime(0, now + s);
        g.gain.linearRampToValueAtTime(0.18, now + s + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + s + d);
        o.start(now + s); o.stop(now + s + d);
      });
    } catch (e) { /* audio blocked, fine */ }
  }

  // ---------- UTM capture (sticky for the session) ----------
  function captureUTM() {
    const params = new URLSearchParams(location.search);
    const keys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'];
    const found = {};
    keys.forEach(k => { if (params.get(k)) found[k] = params.get(k); });
    if (Object.keys(found).length) {
      try { sessionStorage.setItem('nx_utm', JSON.stringify(found)); } catch (e) {}
    }
  }
  function getUTM() {
    try { return JSON.parse(sessionStorage.getItem('nx_utm') || '{}'); } catch (e) { return {}; }
  }
  captureUTM();

  // ---------- form renderer ----------
  function render(host) {
    const stages = S.stages, sectors = S.sectors, services = S.services, times = S.times;

    const opt = (group, key, label, sub) => `
      <button type="button" class="nxf-opt" data-group="${group}" data-value="${key}">
        <span class="nxf-opt-ic">${ICONS[key] || ''}</span>
        <span class="nxf-opt-tx">
          <b>${esc(label)}</b>
          ${sub ? `<span>${esc(sub)}</span>` : ''}
        </span>
      </button>
    `;

    host.innerHTML = `
      <form class="nxf" novalidate autocomplete="on">
        <div class="nxf-progress">
          <span class="nxf-progress-text" data-progress-text></span>
          <div class="nxf-progress-bar"><div class="nxf-progress-fill" data-progress-fill></div></div>
        </div>

        <div class="nxf-track" data-track>
          <!-- STEP 1 -->
          <div class="nxf-step" data-step="1">
            <div class="nxf-step-head">
              <h3>${esc(S.s1Title)}</h3>
              <p>${esc(S.s1Sub)}</p>
            </div>

            <div class="nxf-field">
              <label for="nxf-name">${esc(S.lblName)}</label>
              <input id="nxf-name" name="name" type="text" required placeholder="${esc(S.phName)}">
              <div class="nxf-error" data-error></div>
            </div>

            <div class="nxf-field">
              <label for="nxf-email">${esc(S.lblEmail)}</label>
              <input id="nxf-email" name="email" type="email" required inputmode="email" placeholder="${esc(S.phEmail)}">
              <div class="nxf-error" data-error></div>
            </div>

            <div class="nxf-field">
              <label for="nxf-phone">${esc(S.lblPhone)}</label>
              <div class="nxf-input-group">
                <span class="nxf-prefix">${esc(S.prefixPhone)}</span>
                <input id="nxf-phone" name="phone" type="tel" required inputmode="tel" placeholder="${esc(S.phPhone)}">
              </div>
              <div class="nxf-error" data-error></div>
            </div>

            <div class="nxf-nav">
              <button type="button" class="btn btn-primary" data-go="next">
                ${esc(S.next)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
            </div>
          </div>

          <!-- STEP 2 -->
          <div class="nxf-step" data-step="2" hidden>
            <div class="nxf-step-head">
              <h3>${esc(S.s2Title)}</h3>
              <p>${esc(S.s2Sub)}</p>
            </div>

            <div class="nxf-field">
              <label for="nxf-company">${esc(S.lblCompany)}</label>
              <input id="nxf-company" name="company" type="text" required placeholder="${esc(S.phCompany)}">
              <div class="nxf-error" data-error></div>
            </div>

            <div class="nxf-field">
              <label for="nxf-role">${esc(S.lblRole)} <span class="nxf-opt-tag">${esc(S.tagOptional)}</span></label>
              <input id="nxf-role" name="role" type="text" placeholder="${esc(S.phRole)}">
            </div>

            <div class="nxf-field">
              <label>${esc(S.lblSector)}</label>
              <div class="nxf-options nxf-options-grid">
                ${sectors.map(([k,l]) => opt('sector', k, l)).join('')}
              </div>
              <input type="hidden" name="sector" required>
              <div class="nxf-error" data-error></div>
            </div>

            <div class="nxf-field">
              <label>${esc(S.lblStage)}</label>
              <div class="nxf-options nxf-options-stack">
                ${stages.map(([k,l,s]) => opt('stage', k, l, s)).join('')}
              </div>
              <input type="hidden" name="stage" required>
              <div class="nxf-error" data-error></div>
            </div>

            <div class="nxf-nav">
              <button type="button" class="btn btn-ghost" data-go="back">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
                ${esc(S.back)}
              </button>
              <button type="button" class="btn btn-primary" data-go="next">
                ${esc(S.next)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
            </div>
          </div>

          <!-- STEP 3 -->
          <div class="nxf-step" data-step="3" hidden>
            <div class="nxf-step-head">
              <h3>${esc(S.s3Title)}</h3>
              <p>${esc(S.s3Sub)}</p>
            </div>

            <div class="nxf-field">
              <label>${esc(S.lblService)}</label>
              <div class="nxf-options nxf-options-stack">
                ${services.map(([k,l,s]) => opt('service', k, l, s)).join('')}
              </div>
              <input type="hidden" name="service" required>
              <div class="nxf-error" data-error></div>
            </div>

            <div class="nxf-field">
              <label>${esc(S.lblTime)}</label>
              <div class="nxf-options nxf-options-grid nxf-options-grid-tight">
                ${times.map(([k,l,s]) => opt('time', k, l, s)).join('')}
              </div>
              <input type="hidden" name="time" required>
              <div class="nxf-error" data-error></div>
            </div>

            <div class="nxf-field">
              <label for="nxf-details">${esc(S.lblDetails)} <span class="nxf-opt-tag">${esc(S.tagOptional)}</span></label>
              <textarea id="nxf-details" name="details" rows="3" placeholder="${esc(S.phDetails)}"></textarea>
            </div>

            <div class="nxf-nav">
              <button type="button" class="btn btn-ghost" data-go="back">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
                ${esc(S.back)}
              </button>
              <button type="submit" class="btn btn-primary" data-submit>
                <span data-submit-label>${esc(S.submit)}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- SUCCESS -->
        <div class="nxf-state nxf-success" hidden>
          <div class="nxf-check"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14 27l8 8 16-18"/></svg></div>
          <h3>${esc(S.successTitle)}</h3>
          <p>${esc(S.successSub)}</p>
          <span class="nxf-meta">${esc(S.successMeta)}</span>
          <button type="button" class="btn btn-ghost" data-reset>${esc(S.successAgain)}</button>
        </div>

        <!-- FAIL -->
        <div class="nxf-state nxf-fail" hidden>
          <div class="nxf-x"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" d="M18 18l16 16M34 18L18 34"/></svg></div>
          <h3>${esc(S.failTitle)}</h3>
          <p>${esc(S.failSub)}</p>
          <button type="button" class="btn btn-primary" data-retry>${esc(S.failRetry)}</button>
        </div>
      </form>
    `;

    bind(host);
  }

  // ---------- bind interactions ----------
  function bind(host) {
    const form  = $('form.nxf', host);
    const track = $('[data-track]', form);
    const pText = $('[data-progress-text]', form);
    const pFill = $('[data-progress-fill]', form);

    const steps = $$('.nxf-step', form);
    const total = steps.length;
    let cur = 1;

    function showStep(n) {
      cur = Math.max(1, Math.min(total, n));
      steps.forEach(s => { s.hidden = +s.dataset.step !== cur; });
      pText.textContent = S.progress.replace('%s', cur).replace('%s', total);
      pFill.style.width = (cur / total * 100) + '%';
      // soft scroll the form into view
      const top = host.getBoundingClientRect().top + scrollY;
      const navH = 80;
      if (top - navH < scrollY) scrollTo({ top: top - navH, behavior: 'smooth' });
    }
    showStep(1);

    // visual option cards
    form.addEventListener('click', e => {
      const opt = e.target.closest('.nxf-opt');
      if (!opt) return;
      const group = opt.dataset.group;
      const value = opt.dataset.value;
      $$(`.nxf-opt[data-group="${group}"]`, form).forEach(o => o.classList.remove('on'));
      opt.classList.add('on');
      const hidden = $(`input[name="${group}"]`, form);
      if (hidden) {
        hidden.value = value;
        clearError(hidden.closest('.nxf-field'));
      }
    });

    // nav buttons
    form.addEventListener('click', e => {
      const go = e.target.closest('[data-go]');
      if (!go) return;
      e.preventDefault();
      const dir = go.dataset.go;
      if (dir === 'next') {
        if (validateStep(cur)) showStep(cur + 1);
      } else if (dir === 'back') {
        showStep(cur - 1);
      }
    });

    // submit
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateStep(3)) return;
      await submit(form);
    });

    // reset / retry
    form.addEventListener('click', e => {
      if (e.target.closest('[data-reset]')) {
        // Recreate by re-rendering — simplest and safest.
        render(host);
      } else if (e.target.closest('[data-retry]')) {
        $('.nxf-fail', form).hidden = true;
        $('.nxf-track', form).hidden = false;
        $('.nxf-progress', form).hidden = false;
      }
    });
  }

  // ---------- validation ----------
  function setError(field, msg) {
    field.classList.add('err');
    const el = $('[data-error]', field);
    if (el) el.textContent = msg;
  }
  function clearError(field) {
    field && field.classList.remove('err');
    const el = field && $('[data-error]', field);
    if (el) el.textContent = '';
  }
  function validateStep(n) {
    const form = $('form.nxf');
    const step = $(`.nxf-step[data-step="${n}"]`, form);
    const fields = $$('.nxf-field', step);
    let ok = true;
    fields.forEach(f => {
      clearError(f);
      const input = $('input, textarea', f);
      if (!input || !input.hasAttribute('required')) return;
      const v = (input.value || '').trim();
      if (!v) {
        setError(f, input.type === 'hidden' ? S.errChoose : S.errRequired); ok = false; return;
      }
      if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        setError(f, S.errEmail); ok = false; return;
      }
      if (input.type === 'tel') {
        const digits = v.replace(/[^\d]/g, '');
        if (digits.length < 7 || digits.length > 12) { setError(f, S.errPhone); ok = false; return; }
      }
    });
    return ok;
  }

  // ---------- submit ----------
  async function submit(form) {
    const submitBtn = $('[data-submit]', form);
    const submitLbl = $('[data-submit-label]', form);
    submitBtn.disabled = true;
    if (submitLbl) submitLbl.textContent = S.sending;

    const data = collect(form);

    let ok = false;
    try {
      if (ZOHO_ENDPOINT) {
        const body = new FormData();
        Object.entries(ZOHO_HIDDEN).forEach(([k, v]) => body.append(k, v));
        Object.entries(data).forEach(([k, v]) => {
          if (v == null || v === '') return;
          const zKey = ZOHO_FIELD_MAP[k];
          if (!zKey) return; // skip fields not in Zoho web form
          const vm = ZOHO_VALUE_MAP[k];
          const mapped = vm && vm[v] != null ? vm[v] : v;
          body.append(zKey, mapped);
        });
        await fetch(ZOHO_ENDPOINT, { method: 'POST', body, mode: 'no-cors' });
        ok = true; // no-cors: assume success unless network failed
      } else {
        // DEMO: just simulate latency + log
        await new Promise(r => setTimeout(r, 1100));
        console.log('[nx-form demo] would POST to Zoho:', data);
        ok = true;
      }
    } catch (e) {
      console.warn('nx-form submit failed', e);
      ok = false;
    }

    submitBtn.disabled = false;
    if (submitLbl) submitLbl.textContent = S.submit;

    if (ok) showSuccess(form);
    else showFail(form);
  }

  function collect(form) {
    const fd = new FormData(form);
    const obj = {};
    fd.forEach((v, k) => { obj[k] = v; });
    const utm = getUTM();
    Object.assign(obj, {
      utm_source:   utm.utm_source   || '',
      utm_medium:   utm.utm_medium   || '',
      utm_campaign: utm.utm_campaign || '',
      source_page:  location.pathname,
      referrer:     document.referrer || '',
      language:     lang,
      source:       'Website',
    });
    return obj;
  }

  function showSuccess(form) {
    $('[data-track]', form).hidden = true;
    $('.nxf-progress', form).hidden = true;
    $('.nxf-success', form).hidden = false;
    chime();
  }
  function showFail(form) {
    $('[data-track]', form).hidden = true;
    $('.nxf-progress', form).hidden = true;
    $('.nxf-fail', form).hidden = false;
  }

  // ---------- boot ----------
  hosts.forEach(render);
})();
