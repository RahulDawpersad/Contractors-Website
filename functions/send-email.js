const fetch = require('node-fetch');  // For making API calls

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { name, email, phone, service, message } = JSON.parse(event.body);

  // Validate inputs (add more as needed)
  if (!name || !email || !phone || !service) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;  // Securely pulled from env vars
  const BUSINESS_EMAIL = 'designxfolio@gmail.com';
  const SENDER_NAME = 'ProFix Home Services';
  const SENDER_EMAIL = 'designxfolio@gmail.com';

  const headers = {
    'accept': 'application/json',
    'api-key': BREVO_API_KEY,
    'content-type': 'application/json'
  };

  try {
    // Email to business
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: BUSINESS_EMAIL }],
        subject: `🚨 New Quote Request - ${name}`,
        htmlContent: `
          <h2>New Contact Request Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Message:</strong> ${message || 'No additional message'}</p>
          <hr>
          <small>Sent: ${new Date().toLocaleString('en-ZA')}</small>
        `
      })
    });

    // Thank-you email to user
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: email }],
        subject: `Thank you ${name.split(' ')[0]} – ProFix Team ❤️`,
        htmlContent: `
          <h2>Hi ${name.split(' ')[0]},</h2>
          <p>Thank you for reaching out to <strong>ProFix Home Services</strong>!</p>
          <p>We received your request for <strong>${service}</strong>.</p>
          <p>Our team will get back to you within <strong>30 minutes</strong> during business hours.</p>
          <p>You can also call or WhatsApp us anytime on <strong>031 000 0000</strong>.</p>
          <br>
          <p>Best regards,<br><strong>ProFix Team</strong><br>Durban's Most Trusted Home Repair Service</p>
        `
      })
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Emails sent successfully' })
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send emails' })
    };
  }
};