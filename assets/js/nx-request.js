/* ============================================================
   NX — product request form (window.NXRequest)

   A product page opts in with one element:

     <div data-nx-request
          data-service="plate-market"
          data-product="منصّة مزادات اللوحات المميّزة"
          data-product-en="Plate Auctions Platform"></div>

   …and any button that should open it:

     <button data-nx-request-open="trial">اطلب المنصّة</button>

   Mirrors [data-nx-form]'s idiom so a second solution is one line of
   markup, not a copy of the form.

   Every submission goes to BOTH destinations through window.NXLead
   (defined in nx-form.js, so the Zoho credentials and field map stay
   in exactly one file):
     • the NX Partners backend — the admin's Requests queue, which
       receives the request whether or not a partner code is present,
       with each form answer carried in `meta` so the admin sees the
       form the way the CRM does;
     • Zoho CRM — the same web-to-lead path the site contact form uses.

   The partner code is prefilled from window.NX.getRef() (URL → cookie
   → localStorage) and stays editable, so a client who was given a code
   by hand can type it and still have the referral counted.
   ============================================================ */
(function () {
  'use strict';

  var host = document.querySelector('[data-nx-request]');
  if (!host) return;

  var ar = document.documentElement.lang === 'ar';
  var d = host.dataset;
  var SERVICE = d.service || '';
  var PRODUCT = (ar ? d.product : (d.productEn || d.product)) || '';

  var T = ar ? {
    title: 'اطلب ' + (PRODUCT || 'المنتج'),
    sub: 'اترك بياناتك ويتواصل معك فريق NX خلال يوم عمل واحد لعرض المنصّة والاتفاق على إطلاقها باسمك.',
    close: 'إغلاق النموذج',
    name: 'الاسم الكامل', namePh: 'اسمك الكامل',
    phone: 'رقم الجوال', phonePh: '05XXXXXXXX',
    email: 'البريد الإلكتروني', emailPh: 'name@company.com',
    company: 'اسم المنشأة', companyPh: 'اسم نشاطك',
    kind: 'ما الذي تريده الآن؟',
    note: 'تفاصيل تساعدنا', notePh: 'حجم نشاطك، أو أي سؤال يهمّك…',
    ref: 'كود المسوّق', refPh: 'اتركه فارغاً إن لم يكن لديك كود',
    refHint: 'إن وصلك هذا المنتج عن طريق أحد شركاء NX، اكتب كوده هنا لتُحتسب الإحالة له.',
    refFound: 'وصلتنا إحالتك من الشريك «%s» — سنحتسب الطلب له. يمكنك تعديل الكود أو مسحه.',
    optional: '— اختياري',
    send: 'أرسل الطلب', sending: 'جاري الإرسال…',
    legal: 'نستخدم بياناتك للتواصل بخصوص طلبك فقط — لا نطلب أي معلومات دفع أو بطاقات.',
    doneTitle: 'وصلنا طلبك',
    doneMsg: 'سجّلنا طلبك ووصل لفريق NX. نتواصل معك خلال يوم عمل واحد على الرقم الذي تركته.',
    doneRef: 'سجّلنا طلبك ووصل لفريق NX، ونُسبت الإحالة للشريك «%s». نتواصل معك خلال يوم عمل واحد.',
    errRequired: 'هذا الحقل مطلوب',
    errPhone: 'أدخل رقم جوال سعودي صحيح',
    errEmail: 'بريد إلكتروني غير صحيح',
    lblRequest: 'طلب', lblKind: 'نوع الطلب', lblNote: 'ملاحظات العميل', lblRef: 'كود الإحالة',
    kinds: { demo: 'عرض مباشر للمنصّة', trial: 'نسخة تجريبية باسمي', pricing: 'الأسعار والباقات', custom: 'تخصيص المنصّة لنشاطي' },
  } : {
    title: 'Request ' + (PRODUCT || 'this product'),
    sub: 'Leave your details and the NX team will reach you within one business day to walk you through the platform and launch it under your name.',
    close: 'Close the form',
    name: 'Full name', namePh: 'Your full name',
    phone: 'Mobile number', phonePh: '05XXXXXXXX',
    email: 'Email', emailPh: 'name@company.com',
    company: 'Company name', companyPh: 'Your business',
    kind: 'What would you like first?',
    note: 'Anything that helps us', notePh: 'The size of your business, or any question…',
    ref: 'Partner code', refPh: 'Leave empty if you have no code',
    refHint: 'If an NX partner introduced you to this product, enter their code so the referral is credited to them.',
    refFound: 'You were referred by partner “%s” — we will credit them. You can edit or clear the code.',
    optional: '— optional',
    send: 'Send request', sending: 'Sending…',
    legal: 'We use your details only to follow up on this request — we never ask for payment or card information.',
    doneTitle: 'We have your request',
    doneMsg: 'Your request reached the NX team. We will call you on the number you left within one business day.',
    doneRef: 'Your request reached the NX team, and the referral was credited to partner “%s”. We will be in touch within one business day.',
    errRequired: 'This field is required',
    errPhone: 'Enter a valid Saudi mobile number',
    errEmail: 'Invalid email address',
    lblRequest: 'Request', lblKind: 'Request type', lblNote: 'Client notes', lblRef: 'Referral code',
    kinds: { demo: 'A live walkthrough', trial: 'A trial under my name', pricing: 'Pricing and plans', custom: 'Tailoring it to my business' },
  };

  var KIND_KEYS = (d.kinds || 'demo,trial,pricing,custom').split(',')
    .map(function (k) { return k.trim(); }).filter(function (k) { return T.kinds[k]; });

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  // ---------- markup ----------
  var box = document.createElement('div');
  box.className = 'nxr';
  box.id = 'nx-request';
  box.hidden = true;
  box.innerHTML =
    '<div class="nxr-bx" role="dialog" aria-modal="true" aria-labelledby="nxr-h">' +
      '<button class="nxr-x" type="button" data-nxr-close aria-label="' + esc(T.close) + '">&#10005;</button>' +
      '<div data-nxr-pane>' +
        '<h3 id="nxr-h">' + esc(T.title) + '</h3>' +
        '<p class="nxr-sub">' + esc(T.sub) + '</p>' +
        '<form novalidate data-nxr-form>' +
          '<div class="nxr-two">' +
            fld('name', 'text', T.name, T.namePh, { autocomplete: 'name' }) +
            fld('phone', 'tel', T.phone, T.phonePh, { autocomplete: 'tel', dir: 'ltr', inputmode: 'tel' }) +
          '</div>' +
          '<div class="nxr-two">' +
            fld('email', 'email', T.email, T.emailPh, { autocomplete: 'email', dir: 'ltr', inputmode: 'email' }) +
            fld('company', 'text', T.company + ' <i>' + esc(T.optional) + '</i>', T.companyPh, { autocomplete: 'organization', raw: true }) +
          '</div>' +
          (KIND_KEYS.length ? '<div class="nxr-fld"><label for="nxr-kind">' + esc(T.kind) + '</label>' +
            '<select id="nxr-kind" name="kind">' + KIND_KEYS.map(function (k) {
              return '<option value="' + esc(k) + '">' + esc(T.kinds[k]) + '</option>';
            }).join('') + '</select></div>' : '') +
          '<div class="nxr-fld"><label for="nxr-note">' + esc(T.note) + ' <i>' + esc(T.optional) + '</i></label>' +
            '<textarea id="nxr-note" name="note" placeholder="' + esc(T.notePh) + '"></textarea></div>' +
          '<div class="nxr-ref nxr-fld">' +
            '<label for="nxr-ref">' + esc(T.ref) + ' <i>' + esc(T.optional) + '</i></label>' +
            '<input id="nxr-ref" name="ref" type="text" dir="ltr" placeholder="' + esc(T.refPh) + '">' +
            '<div class="nxr-hint" data-nxr-hint>' + esc(T.refHint) + '</div>' +
          '</div>' +
          '<button class="nxr-send" type="submit" data-nxr-send>' + esc(T.send) + '</button>' +
          '<p class="nxr-legal">' + esc(T.legal) + '</p>' +
        '</form>' +
      '</div>' +
      '<div class="nxr-done" data-nxr-done hidden>' +
        '<div class="nxr-tick"><svg viewBox="0 0 24 24"><path d="M4 12.5l5.5 5.5L20 7"/></svg></div>' +
        '<h3>' + esc(T.doneTitle) + '</h3>' +
        '<p data-nxr-donemsg>' + esc(T.doneMsg) + '</p>' +
      '</div>' +
    '</div>';
  document.body.appendChild(box);

  function fld(name, type, label, ph, opt) {
    opt = opt || {};
    var attrs = ['id="nxr-' + name + '"', 'name="' + name + '"', 'type="' + type + '"',
      'placeholder="' + esc(ph) + '"'];
    ['autocomplete', 'dir', 'inputmode'].forEach(function (a) { if (opt[a]) attrs.push(a + '="' + opt[a] + '"'); });
    return '<div class="nxr-fld"><label for="nxr-' + name + '">' + (opt.raw ? label : esc(label)) + '</label>' +
      '<input ' + attrs.join(' ') + '>' +
      '<div class="nxr-err"></div></div>';
  }

  var form = box.querySelector('[data-nxr-form]');
  var pane = box.querySelector('[data-nxr-pane]');
  var done = box.querySelector('[data-nxr-done]');
  var sendBtn = box.querySelector('[data-nxr-send]');
  var refIn = box.querySelector('#nxr-ref');
  var refHint = box.querySelector('[data-nxr-hint]');
  var lastFocus = null;

  function currentRef() {
    if (window.NX && typeof window.NX.getRef === 'function') return window.NX.getRef() || '';
    var m = location.search.match(/[?&]ref=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  }

  function open(kind) {
    lastFocus = document.activeElement;
    var sel = box.querySelector('#nxr-kind');
    if (sel && T.kinds[kind]) sel.value = kind;
    var ref = currentRef();
    if (ref && !refIn.value) {
      refIn.value = ref;
      refHint.textContent = T.refFound.replace('%s', ref);
    }
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    var first = box.querySelector('#nxr-name');
    if (first) first.focus();
  }
  function close() {
    box.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-nx-request-open]');
    if (o) { e.preventDefault(); open(o.getAttribute('data-nx-request-open')); return; }
    if (e.target.closest('[data-nxr-close]') || e.target === box) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close(); });

  // ---------- validation ----------
  function fail(input, msg) {
    var f = input.closest('.nxr-fld');
    if (f) { f.classList.add('nxr-bad'); var er = f.querySelector('.nxr-err'); if (er) er.textContent = msg; }
    return false;
  }
  function validate() {
    var ok = true;
    form.querySelectorAll('.nxr-fld').forEach(function (f) { f.classList.remove('nxr-bad'); });
    if (!form.name.value.trim()) ok = fail(form.name, T.errRequired) && ok;
    // Saudi mobile, with or without +966 / 00966 / a leading zero
    var digits = form.phone.value.replace(/[^\d]/g, '');
    if (!/^(?:00966|966)?0?5\d{8}$/.test(digits)) ok = fail(form.phone, T.errPhone) && ok;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.value.trim())) ok = fail(form.email, T.errEmail) && ok;
    return ok;
  }

  // ---------- submit ----------
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validate()) { var bad = form.querySelector('.nxr-bad input'); if (bad) bad.focus(); return; }

    sendBtn.disabled = true;
    sendBtn.textContent = T.sending;

    var kindSel = box.querySelector('#nxr-kind');
    var kind = kindSel ? kindSel.value : '';
    var note = form.note.value.trim();

    // Zoho takes one free-text field, so the request is composed into it. The
    // backend gets the same answers as discrete values in `meta` instead.
    var lines = [T.lblRequest + ': ' + PRODUCT];
    if (kind) lines.push(T.lblKind + ': ' + (T.kinds[kind] || kind));
    if (note) lines.push(T.lblNote + ': ' + note);

    var api = window.NXLead;
    var data = {
      name: form.name.value.trim(), email: form.email.value.trim(),
      phone: form.phone.value.trim(), company: form.company.value.trim(),
      details: lines.join('\n'), ref: (refIn.value || '').trim(),
    };
    var payload = api && api.enrich ? api.enrich(data) : data;

    if (api && api.toPartners) {
      api.toPartners(Object.assign({}, payload, {
        service: SERVICE, note: note, direct: true,
        meta: { product: PRODUCT, kind: kind, kind_label: T.kinds[kind] || '' },
      }));
    }
    try { if (api && api.toZoho) await api.toZoho(payload); } catch (err) {}

    pane.hidden = true;
    done.hidden = false;
    if (payload.ref) box.querySelector('[data-nxr-donemsg]').textContent = T.doneRef.replace('%s', payload.ref);
    done.scrollIntoView({ block: 'nearest' });
  });

  window.NXRequest = { open: open, close: close };
})();
