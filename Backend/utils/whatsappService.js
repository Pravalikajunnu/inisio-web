/**
 * WhatsApp Notification Service for Inisio Greenfield Project Advisory
 * Formats and dispatches automated WhatsApp notifications upon new enquiries.
 */

export const formatWhatsAppEnquiryMessage = ({ name, phone, email, company, subject, message, createdAt }) => {
  const formattedDate = new Date(createdAt || Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    `📩 *New Contact Enquiry*\n\n` +
    `*Name:* ${name}\n` +
    `*Phone:* ${phone}\n` +
    `*Email:* ${email}\n` +
    `*Company:* ${company || 'Not Specified'}\n` +
    `*Subject:* ${subject || 'General Greenfield Project Enquiry'}\n\n` +
    `*Message:*\n${message}\n\n` +
    `*Submitted On:* ${formattedDate} IST\n` +
    `_View it in the Inisio Admin Dashboard._`
  );
};

export const sendWhatsAppNotification = async (enquiryData) => {
  const adminPhone = process.env.ADMIN_WHATSAPP_PHONE || '916302026462';
  const whatsappApiUrl = process.env.WHATSAPP_API_URL || process.env.WHATSAPP_WEBHOOK_URL;
  const whatsappToken = process.env.WHATSAPP_API_TOKEN || process.env.WHATSAPP_BEARER_TOKEN;

  const messageText = formatWhatsAppEnquiryMessage(enquiryData);

  console.log(`\n========================================`);
  console.log(`📱 [WHATSAPP DISPATCH] New Contact Enquiry to Admin (${adminPhone})`);
  console.log(messageText);
  console.log(`========================================\n`);

  // If a live WhatsApp API endpoint is configured in env:
  if (whatsappApiUrl) {
    try {
      const response = await fetch(whatsappApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(whatsappToken ? { Authorization: `Bearer ${whatsappToken}` } : {}),
        },
        body: JSON.stringify({
          to: adminPhone,
          recipient_type: 'individual',
          type: 'text',
          text: { body: messageText },
          enquiry: enquiryData,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[WhatsApp API Response ${response.status}]:`, errorText);
      } else {
        console.log(`✅ [WhatsApp Notification] Dispatched successfully to ${adminPhone}`);
      }
    } catch (apiError) {
      console.warn('[WhatsApp Notification API Warning]:', apiError.message);
    }
  }

  // Pre-configured direct click-to-chat WhatsApp link
  const directWhatsAppLink = `https://wa.me/${adminPhone}?text=${encodeURIComponent(messageText)}`;
  const replyWhatsAppLink = `https://wa.me/91${enquiryData.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hello ${enquiryData.name}, thank you for contacting Inisio Project Advisory regarding: "${enquiryData.subject || 'Greenfield Project'}"...`)}`;

  return {
    success: true,
    dispatchedTo: adminPhone,
    messageText,
    directWhatsAppLink,
    replyWhatsAppLink,
  };
};

export default {
  formatWhatsAppEnquiryMessage,
  sendWhatsAppNotification,
};
