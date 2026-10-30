const nodemailer = require('nodemailer');
const Order = require('../models/Order');

// Sends through the support@naarzi.com mailbox on Hostinger. Set on Render:
//   SMTP_USER=support@naarzi.com  SMTP_PASS=<mailbox password>
// Optional: SMTP_HOST (default smtp.hostinger.com), SMTP_PORT (465), MAIL_FROM, ORDER_ALERT_TO.
// Without SMTP_USER/SMTP_PASS every email is skipped (logged), so nothing else breaks.
const SUPPORT_EMAIL = 'support@naarzi.com';

let transporter = null;
const getTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 465;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  return transporter;
};

const shopUrl = () => (process.env.CLIENT_URL || 'https://naarzi.com').split(',')[0].trim().replace(/\/$/, '');
const orderNumber = (order) => order._id.toString().slice(-8).toUpperCase();
const rupees = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Render's free plan blocks outgoing SMTP, so an HTTPS email API is used when its key is set:
//   BREVO_API_KEY or RESEND_API_KEY (the sender domain must be verified with that service).
// MAIL_FROM_EMAIL sets the sender address for these (default support@naarzi.com).
const postJson = async (url, headers, body) => {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${url} answered ${res.status}: ${(await res.text()).slice(0, 300)}`);
};

const sendMail = async ({ to, subject, html, text }) => {
  const fromEmail = process.env.MAIL_FROM_EMAIL || SUPPORT_EMAIL;

  if (process.env.BREVO_API_KEY) {
    return postJson('https://api.brevo.com/v3/smtp/email', { 'api-key': process.env.BREVO_API_KEY }, {
      sender: { name: 'Naarzi', email: fromEmail },
      to: [{ email: to }],
      replyTo: { email: SUPPORT_EMAIL },
      subject,
      htmlContent: html,
      textContent: text
    });
  }

  if (process.env.RESEND_API_KEY) {
    return postJson('https://api.resend.com/emails', { Authorization: `Bearer ${process.env.RESEND_API_KEY}` }, {
      from: `Naarzi <${fromEmail}>`,
      to: [to],
      reply_to: SUPPORT_EMAIL,
      subject,
      html,
      text
    });
  }

  const t = getTransporter();
  if (!t) {
    console.log(`Email skipped (no email service configured): "${subject}" to ${to}`);
    return;
  }
  await t.sendMail({
    from: process.env.MAIL_FROM || `Naarzi <${process.env.SMTP_USER}>`,
    replyTo: SUPPORT_EMAIL,
    to,
    subject,
    html,
    text
  });
};

// Never lets an email problem fail the request that triggered it
const fireAndForget = (label, fn) => {
  Promise.resolve().then(fn).catch((err) => console.error(`Email "${label}" failed:`, err.message));
};

const layout = (heading, bodyHtml) => `<!doctype html>
<html><body style="margin:0;padding:0;background:#f6f1ec;font-family:Georgia,'Times New Roman',serif;color:#2b2320">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f1ec;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden">
        <tr><td style="padding:28px 32px 8px;text-align:center;letter-spacing:6px;font-size:22px">NAARZI</td></tr>
        <tr><td style="padding:8px 32px 0;text-align:center;font-size:20px">${heading}</td></tr>
        <tr><td style="padding:16px 32px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6">${bodyHtml}</td></tr>
        <tr><td style="padding:16px 32px;background:#faf7f4;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7a6f6a;text-align:center">
          Questions? Reply to this email or write to <a href="mailto:${SUPPORT_EMAIL}" style="color:#7a6f6a">${SUPPORT_EMAIL}</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

const button = (label, href) =>
  `<p style="text-align:center;margin:24px 0 8px"><a href="${href}" style="display:inline-block;background:#2b2320;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:4px;font-size:13px;letter-spacing:1px">${label}</a></p>`;

const itemsTable = (order) => {
  const rows = order.items.map((i) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(i.product?.name || 'Item')}<br>
        <span style="color:#7a6f6a;font-size:12px">${escapeHtml(i.color)} · Size ${escapeHtml(i.size)} · Qty ${i.quantity}</span></td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${rupees(i.priceAtPurchase * i.quantity)}</td>
    </tr>`).join('');
  const line = (label, value) => `<tr><td style="padding:4px 0;color:#7a6f6a">${label}</td><td style="padding:4px 0;text-align:right">${value}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0">
    ${rows}
    ${order.discountAmount ? line(`Discount${order.couponCode ? ` (${escapeHtml(order.couponCode)})` : ''}`, `-${rupees(order.discountAmount)}`) : ''}
    ${line('Shipping', order.shippingCost ? rupees(order.shippingCost) : 'Free')}
    <tr><td style="padding:8px 0;font-weight:bold">Total</td><td style="padding:8px 0;text-align:right;font-weight:bold">${rupees(order.totalAmount)}</td></tr>
  </table>`;
};

const addressBlock = (a) => a ? `<p style="margin:0;color:#7a6f6a">Shipping to:<br>${escapeHtml(a.street)}<br>${escapeHtml(a.city)}, ${escapeHtml(a.state)} ${escapeHtml(a.postalCode)}${a.phone ? `<br>Phone: ${escapeHtml(a.phone)}` : ''}</p>` : '';

const loadOrder = (orderId) => Order.findById(orderId).populate('user', 'name email phone').populate('items.product', 'name');

// Customer confirmation + a heads-up for the shop. Called once, when payment is confirmed.
exports.sendOrderPlacedEmails = (orderId) => fireAndForget('order placed', async () => {
  const order = await loadOrder(orderId);
  if (!order) return;
  const num = orderNumber(order);
  const name = order.user?.name ? escapeHtml(order.user.name.split(' ')[0]) : 'there';

  if (order.user?.email) {
    await sendMail({
      to: order.user.email,
      subject: `Your Naarzi order #${num} is confirmed`,
      html: layout(`Thank you, ${name}`, `
        <p>We've received your payment and your order <strong>#${num}</strong> is confirmed. Orders are dispatched within 7–10 business days, and we'll email your tracking details as soon as it ships.</p>
        <p style="color:#7a6f6a">Need to cancel? That's possible only before dispatch: cancel it from your account or reply to this email with your order number.</p>
        ${itemsTable(order)}
        ${addressBlock(order.shippingAddress)}
        ${button('VIEW YOUR ORDER', `${shopUrl()}/account`)}`),
      text: `Thank you for your order. Order #${num} is confirmed. Total ${rupees(order.totalAmount)}. Track it at ${shopUrl()}/account`
    });
  }

  await sendMail({
    to: process.env.ORDER_ALERT_TO || 'orders@naarzi.com',
    subject: `New order #${num}: ${rupees(order.totalAmount)}`,
    html: layout(`New order #${num}`, `
      <p>Customer: ${escapeHtml(order.user?.name || 'Unknown')}${order.user?.email ? `, ${escapeHtml(order.user.email)}` : ''}${order.user?.phone ? `, ${escapeHtml(order.user.phone)}` : ''}</p>
      ${itemsTable(order)}
      ${addressBlock(order.shippingAddress)}`),
    text: `New paid order #${num} for ${rupees(order.totalAmount)}.`
  });
});

const STATUS_COPY = {
  shipped: (order) => ({
    subject: `Your Naarzi order #${orderNumber(order)} is on its way`,
    heading: 'Your order has shipped',
    body: `<p>Good news: order <strong>#${orderNumber(order)}</strong> is on its way.</p>
      ${order.carrier || order.trackingNumber ? `<p>${order.carrier ? `Courier: <strong>${escapeHtml(order.carrier)}</strong><br>` : ''}${order.trackingNumber ? `Tracking number: <strong>${escapeHtml(order.trackingNumber)}</strong>` : ''}</p>` : ''}
      ${order.estimatedDelivery ? `<p>Expected delivery: <strong>${new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>` : ''}`
  }),
  delivered: (order) => ({
    subject: `Your Naarzi order #${orderNumber(order)} has been delivered`,
    heading: 'Delivered',
    body: `<p>Order <strong>#${orderNumber(order)}</strong> has been delivered. We hope you love it.</p>
      <p>Need a different size or colour? You can request an exchange within 14 days of delivery by replying to this email with your order number. Pieces need to be unused and unwashed, with tags attached and in their original packaging.</p>
      <p>If anything arrived damaged, defective or incorrect, reply within 48 hours with photos and we'll put it right.</p>
      <p style="color:#7a6f6a;font-size:12px">Full details: <a href="${shopUrl()}/exchange-policy" style="color:#7a6f6a">Exchange Policy</a></p>`
  }),
  cancelled: (order) => ({
    subject: `Your Naarzi order #${orderNumber(order)} has been cancelled`,
    heading: 'Order cancelled',
    body: `<p>Order <strong>#${orderNumber(order)}</strong> has been cancelled.</p>
      ${order.paymentStatus === 'paid' || order.paymentStatus === 'refunded' || order.refundStatus !== 'not_applicable'
        ? `<p>Your refund of <strong>${rupees(order.totalAmount)}</strong> goes back to your original payment method and usually arrives in 5 to 7 working days.</p>`
        : '<p>No payment was taken for this order.</p>'}`
  })
};

// Tells the customer their order moved to shipped, delivered or cancelled
exports.sendOrderStatusEmail = (orderId, status) => {
  if (!STATUS_COPY[status]) return;
  fireAndForget(`order ${status}`, async () => {
    const order = await loadOrder(orderId);
    if (!order?.user?.email) return;
    const copy = STATUS_COPY[status](order);
    await sendMail({
      to: order.user.email,
      subject: copy.subject,
      html: layout(copy.heading, `${copy.body}${button('VIEW YOUR ORDER', `${shopUrl()}/account`)}`),
      text: `${copy.subject}. Details: ${shopUrl()}/account`
    });
  });
};

// Login code for email sign-in. Unlike the order emails this is awaited and throws, so the
// customer is told straight away if the code couldn't be sent. Returns false when no email
// service is configured (local development), so the caller can say so.
exports.sendLoginCodeEmail = async (to, code) => {
  const configured = process.env.BREVO_API_KEY || process.env.RESEND_API_KEY || (process.env.SMTP_USER && process.env.SMTP_PASS);
  if (!configured) {
    console.log(`Login code for ${to}: ${code} (not emailed, no email service configured)`);
    return false;
  }
  await sendMail({
    to,
    subject: `${code} is your Naarzi login code`,
    html: layout('Your login code', `
      <p style="text-align:center;margin:0 0 8px">Enter this code to sign in to Naarzi:</p>
      <p style="text-align:center;font-size:32px;letter-spacing:10px;font-weight:bold;margin:16px 0">${code}</p>
      <p style="text-align:center;color:#7a6f6a;margin:0">It expires in 10 minutes. If you didn't ask for it, you can ignore this email.</p>`),
    text: `Your Naarzi login code is ${code}. It expires in 10 minutes. If you didn't ask for it, you can ignore this email.`
  });
  return true;
};
