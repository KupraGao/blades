import { STORE_CONTACT } from "./contact";

export type ContactMessageInput = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  company?: string;
};

type ContactValidationError =
  | "contactFormNameRequired"
  | "contactFormEmailInvalid"
  | "contactFormMessageRequired"
  | "contactFormTooLong";

type ContactMessage = { email: string; subject: string; text: string };

function plainText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

export function prepareContactMessage(input: ContactMessageInput):
  | { success: true; message: ContactMessage }
  | { success: false; errorKey: ContactValidationError } {
  const fullName = plainText(input?.fullName);
  const email = plainText(input?.email).toLowerCase();
  const phone = plainText(input?.phone);
  const message = plainText(input?.message);

  if (fullName.length > 120 || email.length > 254 || phone.length > 40 || message.length > 4000) {
    return { success: false, errorKey: "contactFormTooLong" };
  }
  if (fullName.length < 2) {
    return { success: false, errorKey: "contactFormNameRequired" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, errorKey: "contactFormEmailInvalid" };
  }
  if (!message) {
    return { success: false, errorKey: "contactFormMessageRequired" };
  }

  const lines = [
    "New contact form message from the Blades storefront.",
    "",
    `Full name: ${fullName}`,
    `Email: ${email}`,
  ];
  if (phone) lines.push(`Phone: ${phone}`);
  lines.push("", "Message:", message);
  const subject = `Blades contact: ${fullName.replace(/[\r\n]+/g, " ")}`;
  return { success: true, message: { email, subject, text: lines.join("\n") } };
}

export function contactDraftUrl({ subject, text }: ContactMessage): string {
  const query = new URLSearchParams({
    subject,
    body: text.replace(/\r\n?|\n/g, "\r\n"),
  });
  // mailto uses percent-encoded spaces, unlike form-encoded queries.
  return `mailto:${STORE_CONTACT.email}?${query.toString().replace(/\+/g, "%20")}`;
}
