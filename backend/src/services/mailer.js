'use strict';
/* Transactional email via Resend's HTTP API.
 *
 * No SDK: one POST with global fetch (Node 18+) keeps the dependency list as short
 * as the rest of this service, and the whole contract is four fields.
 *
 * Sending never throws at the caller. A reset request must answer identically
 * whether or not the address exists and whether or not delivery worked — anything
 * else turns the form into a way of discovering who has an account here. Failures
 * are logged for operators instead.
 */
const config = require('../config');

const ENDPOINT = 'https://api.resend.com/emails';

async function send({ to, subject, html, text }) {
  if (!config.resendApiKey) {
    console.warn('[mail] RESEND_API_KEY is not set — not sending:', subject, '→', to);
    return { ok: false, skipped: true };
  }
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.mailFrom,
        to: [to],
        subject,
        html,
        text,
        ...(config.mailReplyTo ? { reply_to: config.mailReplyTo } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[mail] Resend rejected the message:', res.status, body.slice(0, 400));
      return { ok: false, status: res.status };
    }
    return { ok: true };
  } catch (e) {
    console.error('[mail] Could not reach Resend:', e.message);
    return { ok: false, error: e.message };
  }
}

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// One layout for every message we send, in the partner's own language. Inline
// styles only — email clients discard <style> blocks and understand almost no
// modern CSS, so this deliberately looks nothing like the site's stylesheet.
function layout({ ar, title, intro, ctaLabel, ctaUrl, after, footer }) {
  const dir = ar ? 'rtl' : 'ltr';
  const align = ar ? 'right' : 'left';
  return `<!doctype html>
<html lang="${ar ? 'ar' : 'en'}" dir="${dir}">
<body style="margin:0;padding:0;background:#F6F7F9">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F7F9;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #DCE3EC;border-radius:14px;overflow:hidden">
        <tr><td style="padding:26px 30px 0">
          <div style="font:700 18px/1.3 -apple-system,Segoe UI,Tahoma,sans-serif;color:#0A1A2F;direction:${dir};text-align:${align}">NX Partners</div>
        </td></tr>
        <tr><td style="padding:18px 30px 0">
          <h1 style="margin:0;font:700 21px/1.35 -apple-system,Segoe UI,Tahoma,sans-serif;color:#0A1A2F;direction:${dir};text-align:${align}">${esc(title)}</h1>
          <p style="margin:14px 0 0;font:400 15px/1.75 -apple-system,Segoe UI,Tahoma,sans-serif;color:#3A4A60;direction:${dir};text-align:${align}">${esc(intro)}</p>
        </td></tr>
        <tr><td style="padding:24px 30px 0" align="center">
          <a href="${esc(ctaUrl)}" style="display:inline-block;background:#0A1A2F;color:#ffffff;text-decoration:none;font:600 15px/1 -apple-system,Segoe UI,Tahoma,sans-serif;padding:14px 26px;border-radius:10px">${esc(ctaLabel)}</a>
        </td></tr>
        <tr><td style="padding:20px 30px 0">
          <p style="margin:0;font:400 13px/1.7 -apple-system,Segoe UI,Tahoma,sans-serif;color:#6B7888;direction:${dir};text-align:${align}">${esc(after)}</p>
          <p style="margin:12px 0 0;font:400 12px/1.6 -apple-system,Segoe UI,Tahoma,sans-serif;color:#9AA6B6;direction:ltr;text-align:left;word-break:break-all">${esc(ctaUrl)}</p>
        </td></tr>
        <tr><td style="padding:24px 30px 28px">
          <div style="border-top:1px solid #E7EBF0;padding-top:16px">
            <p style="margin:0;font:400 12px/1.7 -apple-system,Segoe UI,Tahoma,sans-serif;color:#9AA6B6;direction:${dir};text-align:${align}">${esc(footer)}</p>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Reset link mail. `minutes` is stated in the body because a link that dies
// silently reads as a broken product rather than a deliberate limit.
function passwordResetMail({ lang, name, url, minutes }) {
  const ar = lang !== 'en';
  const title = ar ? 'إعادة تعيين كلمة المرور' : 'Reset your password';
  const hi = name ? (ar ? `مرحباً ${name}، ` : `Hi ${name}, `) : '';
  const intro = ar
    ? `${hi}وصلنا طلب لإعادة تعيين كلمة مرور حسابك في شركاء NX. اضغط الزر أدناه لاختيار كلمة مرور جديدة.`
    : `${hi}we received a request to reset the password for your NX Partners account. Use the button below to choose a new one.`;
  const after = ar
    ? `الرابط صالح ${minutes} دقيقة ولمرّة واحدة. إن لم تطلب هذا، تجاهل الرسالة — كلمة مرورك الحالية تبقى كما هي.`
    : `The link is valid for ${minutes} minutes and can be used once. If you did not request this, ignore this email — your current password stays as it is.`;
  const footer = ar
    ? 'لن نطلب منك كلمة مرورك أو بيانات بطاقتك في أي رسالة.'
    : 'We will never ask for your password or card details in an email.';
  return {
    subject: ar ? 'إعادة تعيين كلمة المرور — شركاء NX' : 'Reset your password — NX Partners',
    html: layout({ ar, title, intro, ctaLabel: ar ? 'تعيين كلمة مرور جديدة' : 'Set a new password', ctaUrl: url, after, footer }),
    text: `${title}\n\n${intro}\n\n${url}\n\n${after}\n${footer}`,
  };
}

module.exports = { send, passwordResetMail };
