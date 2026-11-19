export function getContactMailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim();
  return apiKey && fromEmail ? { apiKey, fromEmail } : null;
}
