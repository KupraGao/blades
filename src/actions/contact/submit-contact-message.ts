"use server";

import { STORE_CONTACT } from "@/lib/storefront/contact";

export type SubmitContactResult =
  | {
      success: true;
    }
  | {
      success: false;
      errorKey:
        | "contactFormNameRequired"
        | "contactFormEmailInvalid"
        | "contactFormMessageRequired"
        | "contactFormTooLong"
        | "contactFormSendFailed";
    };

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 40;
const MAX_MESSAGE_LENGTH = 4000;
const MIN_NAME_LENGTH = 2;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toPlainText(value: unknown): string {
  return asString(value)
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export async function submitContactMessage(input: {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  company?: string;
}): Promise<SubmitContactResult> {
  const honeypot = toPlainText(input?.company).trim();
  if (honeypot.length > 0) {
    return { success: true };
  }

  const fullName = toPlainText(input?.fullName).trim();
  const email = toPlainText(input?.email).trim().toLowerCase();
  const phone = toPlainText(input?.phone).trim();
  const message = toPlainText(input?.message).trim();

  if (
    fullName.length > MAX_NAME_LENGTH ||
    email.length > MAX_EMAIL_LENGTH ||
    phone.length > MAX_PHONE_LENGTH ||
    message.length > MAX_MESSAGE_LENGTH
  ) {
    return { success: false, errorKey: "contactFormTooLong" };
  }

  if (fullName.length < MIN_NAME_LENGTH) {
    return { success: false, errorKey: "contactFormNameRequired" };
  }

  if (!email || !isValidEmail(email)) {
    return { success: false, errorKey: "contactFormEmailInvalid" };
  }

  if (!message) {
    return { success: false, errorKey: "contactFormMessageRequired" };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.CONTACT_FROM_EMAIL?.trim();

  if (!apiKey || !fromEmail) {
    console.error("Contact message send failed: missing server mail configuration");
    return { success: false, errorKey: "contactFormSendFailed" };
  }

  const lines = [
    "New contact form message from the Blades storefront.",
    "",
    `Full name: ${fullName}`,
    `Email: ${email}`,
  ];

  if (phone) {
    lines.push(`Phone: ${phone}`);
  }

  lines.push("", "Message:", message);

  const text = lines.join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [STORE_CONTACT.email],
        reply_to: email,
        subject: `Blades contact: ${fullName}`,
        text,
      }),
    });

    if (!response.ok) {
      console.error("Contact message send failed", { status: response.status });
      return { success: false, errorKey: "contactFormSendFailed" };
    }
  } catch {
    console.error("Contact message send failed");
    return { success: false, errorKey: "contactFormSendFailed" };
  }

  return { success: true };
}
