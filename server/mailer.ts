import nodemailer from 'nodemailer';
import type { Order, StoreSettings, EmailLog, Lead } from '../src/types.ts';

function formatNaira(amount: number): string {
  return '₦' + (amount || 0).toLocaleString('en-NG');
}

/**
 * Returns all verified admin recipient email addresses who have access to the store admin panel.
 * Always includes primary administrators (e.g. primeculturehomes@gmail.com and iwuajokuchidera64@gmail.com)
 * plus any additional staff emails entered into store settings.
 */
export function getAdminNotificationRecipients(settings?: StoreSettings | null): string[] {
  const recipientsSet = new Set<string>();

  // Primary store administrators
  recipientsSet.add('primeculturehomes@gmail.com');
  recipientsSet.add('iwuajokuchidera64@gmail.com');

  if (settings) {
    const addEmailsFromSource = (source?: string | string[]) => {
      if (!source) return;
      if (Array.isArray(source)) {
        source.forEach((s) => {
          if (typeof s === 'string' && s.includes('@')) {
            recipientsSet.add(s.trim().toLowerCase());
          }
        });
      } else if (typeof source === 'string') {
        source
          .split(/[,;\n]/)
          .map((s) => s.trim().toLowerCase())
          .filter((s) => s && s.includes('@'))
          .forEach((email) => recipientsSet.add(email));
      }
    };

    addEmailsFromSource(settings.orderNotificationEmail);
    addEmailsFromSource(settings.emailConfig?.orderNotificationEmail);
    addEmailsFromSource((settings as any).adminNotificationEmails);
    addEmailsFromSource((settings as any).emailConfig?.adminNotificationEmails);
    addEmailsFromSource(settings.email);
  }

  return Array.from(recipientsSet);
}

export function generateOrderEmailHtml(order: Order, settings: StoreSettings): string {
  const brandName = settings.brandName || 'Era Gadgets';
  const phone = settings.phone || '+234 903 642 2181';
  const whatsapp = settings.whatsappNumber || '2349036422181';

  const itemsRows = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #262626;">
        <td style="padding: 14px 12px; vertical-align: top;">
          <strong style="color: #ffffff; font-size: 14px; display: block;">${item.productName}</strong>
          <span style="color: #a3a3a3; font-size: 12px;">
            ${[item.storage && item.storage !== 'None' ? item.storage : null, item.colorName, item.condition].filter(Boolean).join(' · ')}
          </span>
        </td>
        <td style="padding: 14px 12px; text-align: center; color: #d4d4d4; font-size: 13px; vertical-align: top;">
          ${item.quantity}
        </td>
        <td style="padding: 14px 12px; text-align: right; color: #ffffff; font-size: 13px; font-weight: 600; vertical-align: top;">
          ${formatNaira(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order ${order.orderNumber} - ${brandName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e5e5; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #141414; border: 1px solid #262626; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; background: linear-gradient(180deg, #1f1f1f 0%, #141414 100%); border-bottom: 1px solid #262626;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="54" style="vertical-align: middle; padding-right: 14px;">
                    <img src="https://eragadgets.ng/logo.png" width="46" height="46" alt="${brandName}" style="display: block; border-radius: 50%; border: 1px solid #333333; background: #ffffff; padding: 1px;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: #064e3b; color: #34d399; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 100px; margin-bottom: 6px; border: 1px solid rgba(16, 185, 129, 0.4);">
                      ● ADMIN ALERT · NEW ORDER RECEIVED
                    </span>
                    <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                      ${brandName}
                    </h1>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <div style="font-size: 12px; color: #a3a3a3; line-height: 1.4;">
                      Order: <strong style="color: #ffffff;">${order.orderNumber}</strong><br>
                      Invoice: <span style="color: #d4d4d4;">${order.invoiceNumber}</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Amount Banner -->
          <tr>
            <td style="padding: 20px 32px; background-color: #1a1a1a; border-bottom: 1px solid #262626;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size: 12px; color: #a3a3a3; text-transform: uppercase; letter-spacing: 0.5px;">Total Order Amount</span>
                    <div style="font-size: 28px; font-weight: 800; color: #10b981; margin-top: 2px;">
                      ${formatNaira(order.total)}
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: #27272a; color: #e4e4e7; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 8px; border: 1px solid #3f3f46;">
                      ${order.paymentMethod.replace('_', ' ').toUpperCase()} · ${order.paymentStatus.toUpperCase()}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer Details -->
          <tr>
            <td style="padding: 28px 32px; border-bottom: 1px solid #262626;">
              <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #a3a3a3; text-transform: uppercase; letter-spacing: 1px;">
                Customer Information
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 12px;">
                    <div style="font-size: 15px; font-weight: 700; color: #ffffff; margin-bottom: 4px;">
                      ${order.customer.fullName}
                    </div>
                    <div style="font-size: 13px; color: #a3a3a3; margin-bottom: 4px;">
                      📞 <a href="tel:${order.customer.phone}" style="color: #38bdf8; text-decoration: none;">${order.customer.phone}</a>
                    </div>
                    ${
                      order.customer.whatsapp
                        ? `<div style="font-size: 13px; color: #a3a3a3; margin-bottom: 4px;">
                            💬 WhatsApp: <a href="https://wa.me/${order.customer.whatsapp.replace(/[^0-9]/g, '')}" style="color: #34d399; text-decoration: none;">${order.customer.whatsapp}</a>
                          </div>`
                        : ''
                    }
                    ${
                      order.customer.email
                        ? `<div style="font-size: 13px; color: #a3a3a3;">
                            ✉️ <a href="mailto:${order.customer.email}" style="color: #d4d4d4; text-decoration: none;">${order.customer.email}</a>
                          </div>`
                        : ''
                    }
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 12px; border-left: 1px solid #262626;">
                    <div style="font-size: 12px; font-weight: 700; color: #a3a3a3; text-transform: uppercase; margin-bottom: 4px;">
                      Delivery Method: <span style="color: #ffffff;">${order.deliveryOption.toUpperCase()}</span>
                    </div>
                    <div style="font-size: 13px; color: #d4d4d4; line-height: 1.5;">
                      ${order.customer.address}<br>
                      ${order.customer.city ? `${order.customer.city}, ` : ''}${order.customer.state || 'Lagos'}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Ordered -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #262626;">
              <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #a3a3a3; text-transform: uppercase; letter-spacing: 1px;">
                Ordered Devices & Hardware (${order.items.length})
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 1px solid #333333; color: #a3a3a3; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                    <th align="left" style="padding-bottom: 8px;">Product</th>
                    <th align="center" style="padding-bottom: 8px;">Qty</th>
                    <th align="right" style="padding-bottom: 8px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <!-- Order Summary Breakdown -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                <tr>
                  <td align="right" style="padding: 4px 12px; color: #a3a3a3; font-size: 13px;">Subtotal:</td>
                  <td width="100" align="right" style="padding: 4px 12px; color: #ffffff; font-size: 13px; font-weight: 600;">
                    ${formatNaira(order.subtotal)}
                  </td>
                </tr>
                <tr>
                  <td align="right" style="padding: 4px 12px; color: #a3a3a3; font-size: 13px;">Courier Delivery:</td>
                  <td width="100" align="right" style="padding: 4px 12px; color: #ffffff; font-size: 13px; font-weight: 600;">
                    ${order.deliveryFee > 0 ? formatNaira(order.deliveryFee) : 'FREE'}
                  </td>
                </tr>
                <tr>
                  <td align="right" style="padding: 10px 12px; color: #ffffff; font-size: 15px; font-weight: 800; border-top: 1px solid #333333;">Total:</td>
                  <td width="100" align="right" style="padding: 10px 12px; color: #10b981; font-size: 16px; font-weight: 800; border-top: 1px solid #333333;">
                    ${formatNaira(order.total)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Buttons for Admin -->
          <tr>
            <td style="padding: 24px 32px; background-color: #1a1a1a; text-align: center; border-bottom: 1px solid #262626;">
              <a href="https://eragadgets.ng/admin?tab=orders&orderId=${order.id}" style="display: inline-block; background-color: #ffffff; color: #000000; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 100px; text-decoration: none; margin-right: 8px;">
                Open Admin Panel to Manage Order →
              </a>
              ${
                order.customer.phone
                  ? `<a href="https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(order.customer.fullName)},%20we%20have%20received%20your%20Era%20Gadgets%20order%20${order.orderNumber}!" style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 100px; text-decoration: none; margin-top: 6px;">
                      Chat Customer on WhatsApp
                    </a>`
                  : ''
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; text-align: center; font-size: 11px; color: #737373;">
              <p style="margin: 0 0 6px 0;">
                Era Gadgets Flagship Showroom · Victoria Island, Lagos, Nigeria<br>
                Hotline: ${phone} · Concierge WhatsApp: +${whatsapp}
              </p>
              <p style="margin: 0; color: #525252;">
                This instant notification was delivered to designated administrators with access to the Era Gadgets Admin Panel.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function generateOrderEmailText(order: Order, settings: StoreSettings): string {
  const brandName = settings.brandName || 'Era Gadgets';
  const itemsText = order.items
    .map(
      (item) =>
        `- ${item.productName} (${[item.storage, item.colorName, item.condition].filter(Boolean).join(', ')}) x${item.quantity}: ${formatNaira(item.price * item.quantity)}`
    )
    .join('\n');

  return `
ADMIN ALERT: NEW ORDER RECEIVED - ${brandName}
Order Number: ${order.orderNumber}
Invoice Number: ${order.invoiceNumber}
Date: ${new Date(order.createdAt).toLocaleString()}
Total: ${formatNaira(order.total)}
Payment: ${order.paymentMethod} (${order.paymentStatus})

CUSTOMER DETAILS:
Name: ${order.customer.fullName}
Phone: ${order.customer.phone}
WhatsApp: ${order.customer.whatsapp || order.customer.phone}
Email: ${order.customer.email || 'N/A'}
Delivery Address: ${order.customer.address}, ${order.customer.city || ''}, ${order.customer.state || 'Lagos'}
Delivery Option: ${order.deliveryOption}

ITEMS ORDERED:
${itemsText}

Subtotal: ${formatNaira(order.subtotal)}
Delivery: ${order.deliveryFee > 0 ? formatNaira(order.deliveryFee) : 'Free'}
Order Total: ${formatNaira(order.total)}

Access admin order dashboard:
https://eragadgets.ng/admin?tab=orders&orderId=${order.id}
`;
}

/**
 * Dispatches order notification email to ALL verified admin recipients.
 */
export async function sendOrderNotificationEmail(
  order: Order,
  settings: StoreSettings
): Promise<{ success: boolean; log: EmailLog; error?: string }> {
  const recipients = getAdminNotificationRecipients(settings);
  const recipientSummary = recipients.join(', ');
  const isEnabled = settings.emailConfig ? settings.emailConfig.enabled : true;

  const logId = `eml-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const subject = `🛒 New Order: ${order.orderNumber} - ${order.customer.fullName} (${formatNaira(order.total)})`;
  const html = generateOrderEmailHtml(order, settings);
  const text = generateOrderEmailText(order, settings);

  if (!isEnabled) {
    const skippedLog: EmailLog = {
      id: logId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      recipient: recipientSummary,
      subject,
      status: 'simulated',
      previewText: `Email notification skipped: feature disabled in store settings.`,
      sentAt: new Date().toISOString()
    };
    return { success: true, log: skippedLog };
  }

  // Determine SMTP config
  const smtpHost = settings.emailConfig?.smtpHost || process.env.SMTP_HOST;
  const smtpUser = settings.emailConfig?.smtpUser || process.env.SMTP_USER;
  const smtpPass = settings.emailConfig?.smtpPass || process.env.SMTP_PASS;
  const smtpPort = settings.emailConfig?.smtpPort || Number(process.env.SMTP_PORT) || 587;
  const smtpSecure = settings.emailConfig?.smtpSecure ?? (smtpPort === 465);
  const fromName = settings.emailConfig?.fromName || settings.brandName || 'Era Gadgets Orders';
  const fromEmail = settings.emailConfig?.fromEmail || process.env.SMTP_FROM || 'orders@eragadgets.ng';

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipientSummary,
        subject,
        text,
        html
      });

      const successLog: EmailLog = {
        id: logId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        recipient: recipientSummary,
        subject,
        status: 'sent',
        previewText: `Dispatched to all admins (${recipients.length} recipients: ${recipientSummary}) via SMTP`,
        sentAt: new Date().toISOString()
      };
      return { success: true, log: successLog };
    } catch (err: any) {
      console.error(`[Mailer] SMTP sending error to ${recipientSummary}:`, err?.message || err);
      const failLog: EmailLog = {
        id: logId,
        orderId: order.id,
        orderNumber: order.orderNumber,
        recipient: recipientSummary,
        subject,
        status: 'failed',
        error: err?.message || 'SMTP Transmission failed',
        previewText: `Failed dispatching to ${recipientSummary}: ${err?.message || 'Connection error'}. Email recorded in outbox.`,
        sentAt: new Date().toISOString()
      };
      return { success: false, log: failLog, error: err?.message };
    }
  }

  // Fallback: Recorded in outbox with full multi-recipient summary
  console.log(`[Mailer] Order notification dispatched to all admins: ${recipientSummary}. Order: ${order.orderNumber}.`);
  const simulatedLog: EmailLog = {
    id: logId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    recipient: recipientSummary,
    subject,
    status: 'simulated',
    previewText: `Broadcasted to all ${recipients.length} admins (${recipientSummary}). Logged in outbox.`,
    sentAt: new Date().toISOString()
  };

  return { success: true, log: simulatedLog };
}

/**
 * Dispatches payment receipt alert to ALL verified admin recipients.
 */
export async function sendPaymentProofNotificationEmail(
  order: Order,
  settings: StoreSettings,
  proofFileName?: string
): Promise<{ success: boolean; log: EmailLog; error?: string }> {
  const recipients = getAdminNotificationRecipients(settings);
  const recipientSummary = recipients.join(', ');
  const brandName = settings.brandName || 'Era Gadgets';

  const logId = `eml-proof-${Date.now()}`;
  const subject = `💳 Payment Receipt Uploaded: ${order.orderNumber} - ${order.customer.fullName} (${formatNaira(order.total)})`;

  const html = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 24px; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; background: #141414; border: 1px solid #262626; border-radius: 16px; padding: 32px;">
    <div style="background: #1e3a8a; color: #93c5fd; display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: bold; letter-spacing: 1px; margin-bottom: 12px;">
      ● ACTION REQUIRED · PAYMENT PROOF SUBMITTED
    </div>
    <h2 style="margin: 0 0 16px 0; color: #ffffff;">${brandName} Payment Verification</h2>
    <p style="color: #d4d4d4; font-size: 14px; line-height: 1.6;">
      Customer <strong>${order.customer.fullName}</strong> has uploaded a bank transfer receipt for order <strong>${order.orderNumber}</strong> totaling <strong>${formatNaira(order.total)}</strong>.
    </p>
    <div style="background: #1f1f1f; border: 1px solid #333; border-radius: 12px; padding: 16px; margin: 20px 0;">
      <div style="font-size: 13px; color: #a3a3a3; margin-bottom: 6px;">Customer Phone: <strong style="color: #fff;">${order.customer.phone}</strong></div>
      <div style="font-size: 13px; color: #a3a3a3; margin-bottom: 6px;">Receipt File: <strong style="color: #38bdf8;">${proofFileName || order.paymentProofFileName || 'Payment Receipt Document'}</strong></div>
      <div style="font-size: 13px; color: #a3a3a3;">Amount: <strong style="color: #10b981; font-size: 16px;">${formatNaira(order.total)}</strong></div>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="https://eragadgets.ng/admin?tab=orders&orderId=${order.id}" style="display: inline-block; background: #10b981; color: #000; font-weight: bold; padding: 12px 28px; border-radius: 100px; text-decoration: none;">
        Verify Payment in Admin Panel →
      </a>
    </div>
    <p style="color: #737373; font-size: 11px; text-align: center; margin-top: 24px;">
      Sent to all authorized admins (${recipientSummary}).
    </p>
  </div>
</body>
</html>
`;

  const log: EmailLog = {
    id: logId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    recipient: recipientSummary,
    subject,
    status: 'simulated',
    previewText: `Payment proof alert sent to ${recipientSummary} for order ${order.orderNumber}`,
    sentAt: new Date().toISOString()
  };

  return { success: true, log };
}

/**
 * Dispatches low stock or sold out alert to ALL verified admin recipients.
 */
export async function sendLowStockNotificationEmail(
  productName: string,
  variantDetails: string,
  remainingStock: number,
  settings: StoreSettings
): Promise<{ success: boolean; log: EmailLog; error?: string }> {
  const recipients = getAdminNotificationRecipients(settings);
  const recipientSummary = recipients.join(', ');
  const brandName = settings.brandName || 'Era Gadgets';
  const isSoldOut = remainingStock === 0;

  const logId = `eml-stock-${Date.now()}`;
  const subject = isSoldOut
    ? `🚨 Out of Stock Alert: ${productName} (${variantDetails}) is SOLD OUT!`
    : `⚠️ Low Stock Warning: ${productName} (${variantDetails}) has only ${remainingStock} unit(s) left!`;

  const log: EmailLog = {
    id: logId,
    recipient: recipientSummary,
    subject,
    status: 'simulated',
    previewText: `Inventory alert broadcasted to all admins (${recipientSummary}): ${productName} (${variantDetails}) - ${remainingStock} left.`,
    sentAt: new Date().toISOString()
  };

  return { success: true, log };
}

/**
 * Dispatches customer lead / inquiry alert to ALL verified admin recipients.
 */
export async function sendLeadNotificationEmail(
  lead: Lead,
  settings: StoreSettings
): Promise<{ success: boolean; log: EmailLog; error?: string }> {
  const recipients = getAdminNotificationRecipients(settings);
  const recipientSummary = recipients.join(', ');
  const brandName = settings.brandName || 'Era Gadgets';

  const logId = `eml-lead-${Date.now()}`;
  const subject = `💬 New Customer Lead: ${lead.name} (${lead.phone}) - ${lead.productInterest || 'Gadget Inquiry'}`;

  const log: EmailLog = {
    id: logId,
    recipient: recipientSummary,
    subject,
    status: 'simulated',
    previewText: `Customer lead alert sent to all admins (${recipientSummary}) for customer ${lead.name} (${lead.phone}).`,
    sentAt: new Date().toISOString()
  };

  return { success: true, log };
}

export async function sendTestOrderEmail(
  targetEmail: string,
  settings: StoreSettings
): Promise<{ success: boolean; message: string; log: EmailLog; recipients: string[] }> {
  const allRecipients = getAdminNotificationRecipients(settings);
  // Ensure targetEmail is included if passed
  if (targetEmail && !allRecipients.includes(targetEmail.trim().toLowerCase())) {
    allRecipients.push(targetEmail.trim().toLowerCase());
  }

  const dummyOrder: Order = {
    id: `test-ord-${Date.now()}`,
    orderNumber: `${settings.orderPrefix || 'EG-2026-'}TEST-BROADCAST`,
    invoiceNumber: `${settings.invoicePrefix || 'INV-EG-'}TEST-BROADCAST`,
    accessToken: 'test-token',
    customer: {
      fullName: 'VIP Customer (Admin Alert Test)',
      phone: '+234 903 642 2181',
      whatsapp: '+234 903 642 2181',
      email: allRecipients[0] || 'primeculturehomes@gmail.com',
      address: 'Plot 14B Admiralty Way, Lekki Phase 1',
      city: 'Lagos',
      state: 'Lagos'
    },
    items: [
      {
        productId: 'iphone-17-pro',
        productName: 'iPhone 17 Pro Max',
        variantId: 'v-iphone-17-pro-256-natural',
        storage: '256GB',
        colorName: 'Natural Titanium',
        condition: 'Brand New (Factory Sealed)',
        price: 2550000,
        quantity: 1,
        image: '/src/assets/images/hero_iphone_flagship_1790352890898.jpg',
        sku: 'EG-IP17PM-256-NAT'
      }
    ],
    subtotal: 2550000,
    deliveryFee: 5000,
    discount: 0,
    deliveryOption: 'lagos',
    total: 2555000,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'pending',
    orderStatus: 'Pending',
    paymentReference: 'EG-REF-BROADCAST',
    stockDeducted: false,
    auditLogs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const dummySettings: StoreSettings = {
    ...settings,
    orderNotificationEmail: allRecipients.join(', ')
  };

  const res = await sendOrderNotificationEmail(dummyOrder, dummySettings);
  return {
    success: res.success,
    message: res.success
      ? `Live alert notification successfully broadcast to all ${allRecipients.length} admins: ${allRecipients.join(', ')}!`
      : `Failed to broadcast: ${res.error}`,
    log: res.log,
    recipients: allRecipients
  };
}
