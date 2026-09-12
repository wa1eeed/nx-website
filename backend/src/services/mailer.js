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

// A plain layout for messages that are information rather than an action — no
// button, an optional list of facts, and an optional quoted note from the team.
function infoLayout({ ar, title, intro, rows, quote, cta, footer }) {
  const dir = ar ? 'rtl' : 'ltr';
  const align = ar ? 'right' : 'left';
  const rowsHtml = (rows || []).filter(r => r && r[1]).map(([k, v]) => `
          <tr>
            <td style="padding:7px 0;font:400 13px/1.6 -apple-system,Segoe UI,Tahoma,sans-serif;color:#6B7888;direction:${dir};text-align:${align};white-space:nowrap">${esc(k)}</td>
            <td style="padding:7px 0;font:600 14px/1.6 -apple-system,Segoe UI,Tahoma,sans-serif;color:#0A1A2F;direction:${dir};text-align:${align}">${esc(v)}</td>
          </tr>`).join('');
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
          <h1 style="margin:0;font:700 20px/1.35 -apple-system,Segoe UI,Tahoma,sans-serif;color:#0A1A2F;direction:${dir};text-align:${align}">${esc(title)}</h1>
          <p style="margin:14px 0 0;font:400 15px/1.75 -apple-system,Segoe UI,Tahoma,sans-serif;color:#3A4A60;direction:${dir};text-align:${align}">${esc(intro)}</p>
        </td></tr>
        ${rowsHtml ? `<tr><td style="padding:18px 30px 0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E7EBF0">${rowsHtml}
          </table>
        </td></tr>` : ''}
        ${quote ? `<tr><td style="padding:18px 30px 0">
          <div style="background:#F6F7F9;border:1px solid #E7EBF0;border-radius:10px;padding:14px 16px">
            <p style="margin:0;font:400 14px/1.75 -apple-system,Segoe UI,Tahoma,sans-serif;color:#3A4A60;direction:${dir};text-align:${align};white-space:pre-wrap">${esc(quote)}</p>
          </div>
        </td></tr>` : ''}
        ${cta ? `<tr><td style="padding:22px 30px 0" align="center">
          <a href="${esc(cta.url)}" style="display:inline-block;background:#0A1A2F;color:#ffffff;text-decoration:none;font:600 15px/1 -apple-system,Segoe UI,Tahoma,sans-serif;padding:13px 24px;border-radius:10px">${esc(cta.label)}</a>
        </td></tr>` : ''}
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

const textOf = ({ title, intro, rows, quote, ctaUrl, footer }) => [
  title, '', intro, '',
  ...(rows || []).filter(r => r && r[1]).map(([k, v]) => `${k}: ${v}`),
  quote ? `\n"${quote}"` : '',
  ctaUrl ? `\n${ctaUrl}` : '',
  '', footer,
].filter(x => x !== '').join('\n');

// 1 · a request landed → tell the team. Always English: this one goes to the NX
// inbox, not to a customer, and mixing directions in an operational alert helps
// nobody.
function newLeadMail({ lead, partner, adminUrl }) {
  const title = 'New client request';
  const intro = partner
    ? `A request came in through ${partner.name}'s referral.`
    : 'A direct request came in — no partner code, so no commission is due.';
  const rows = [
    ['Client', lead.name], ['Email', lead.email], ['Phone', lead.phone],
    ['Company', lead.company], ['Product / service', lead.service],
    ['Partner', partner ? `${partner.name} (${partner.ref_code})` : 'Direct'],
    ['From page', lead.source_page],
  ];
  const footer = 'You are receiving this because you administer the NX Partners program.';
  return {
    subject: partner ? `New request via ${partner.name} — ${lead.name || 'client'}`
                     : `New direct request — ${lead.name || 'client'}`,
    html: infoLayout({ ar: false, title, intro, rows, quote: lead.note,
                       cta: { label: 'Open the requests queue', url: adminUrl }, footer }),
    text: textOf({ title, intro, rows, quote: lead.note, ctaUrl: adminUrl, footer }),
  };
}

// 2 · the team decided → tell the client, in the language they filled the form in.
// `message` is whatever the admin typed when deciding; it is the "reply" half.
function leadDecisionMail({ lang, lead, status, message }) {
  const ar = lang !== 'en';
  const won = status === 'won';
  const title = won
    ? (ar ? 'تم تأكيد طلبك' : 'Your request is confirmed')
    : (ar ? 'تحديث بخصوص طلبك' : 'An update on your request');
  const intro = won
    ? (ar ? `شكراً لك${lead.name ? ' يا ' + lead.name : ''} — أكّدنا طلبك وبدأنا الإجراءات. سيتواصل معك فريق NX بالخطوات التالية.`
          : `Thank you${lead.name ? ', ' + lead.name : ''} — we have confirmed your request and started work on it. The NX team will be in touch with the next steps.`)
    : (ar ? `شكراً لتواصلك معنا${lead.name ? ' يا ' + lead.name : ''}. أغلقنا طلبك الحالي — وإن كان الوقت غير مناسب الآن، يسعدنا أن تعاود التواصل في أي وقت.`
          : `Thank you for reaching out${lead.name ? ', ' + lead.name : ''}. We have closed this request for now — if the timing was simply wrong, you are welcome to come back to us any time.`);
  const rows = [[ar ? 'الطلب' : 'Request', lead.service]];
  const footer = ar
    ? 'لأي استفسار، ردّ على هذه الرسالة أو راسلنا على hello@nx.sa'
    : 'For anything at all, reply to this email or write to hello@nx.sa';
  return {
    subject: won
      ? (ar ? 'تم تأكيد طلبك — NX Solutions' : 'Your request is confirmed — NX Solutions')
      : (ar ? 'تحديث بخصوص طلبك — NX Solutions' : 'An update on your request — NX Solutions'),
    html: infoLayout({ ar, title, intro, rows, quote: message, footer }),
    text: textOf({ title, intro, rows, quote: message, footer }),
  };
}

// 3 · a partner's client paid → tell the partner what they earned.
function commissionMail({ lang, partner, clientName, service, amount, portalUrl }) {
  const ar = lang !== 'en';
  const money = `${Math.round(Number(amount) || 0).toLocaleString('en-US')} ${ar ? 'ريال' : 'SAR'}`;
  const title = ar ? 'عمولة جديدة في رصيدك' : 'A new commission in your balance';
  const intro = ar
    ? `${partner.name ? partner.name + '، ' : ''}اكتمل الدفع من عميل أحلته إلينا، واحتُسبت عمولتك وأُضيفت إلى رصيدك.`
    : `${partner.name ? partner.name + ', ' : ''}a client you referred has paid, and your commission has been calculated and added to your balance.`;
  const rows = [
    [ar ? 'العميل' : 'Client', clientName],
    [ar ? 'المنتج / الخدمة' : 'Product / service', service],
    [ar ? 'عمولتك' : 'Your commission', money],
  ];
  const footer = ar
    ? 'تجد تفاصيل الصفقة وكشف حسابك في محفظتك داخل لوحة الشريك.'
    : 'The deal and your statement are in your wallet inside the partner dashboard.';
  return {
    subject: ar ? `عمولة جديدة: ${money} — شركاء NX` : `New commission: ${money} — NX Partners`,
    html: infoLayout({ ar, title, intro, rows, cta: { label: ar ? 'افتح لوحتك' : 'Open your dashboard', url: portalUrl }, footer }),
    text: textOf({ title, intro, rows, ctaUrl: portalUrl, footer }),
  };
}

module.exports = { send, passwordResetMail, newLeadMail, leadDecisionMail, commissionMail };
