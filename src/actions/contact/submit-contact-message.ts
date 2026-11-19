"use server";

import { STORE_CONTACT } from "@/lib/storefront/contact";
import { getContactMailConfig } from "@/lib/storefront/contact-mail-config";
import {
  prepareContactMessage,
  type ContactMessageInput,
} from "@/lib/storefront/contact-message";

export async function submitContactMessage(input: ContactMessageInput) {
  if (typeof input?.company === "string" && input.company.trim()) {
    return { status: "sent" } as const;
  }

  const prepared = prepareContactMessage(input);
  if (!prepared.success) {
    return { status: "error", errorKey: prepared.errorKey } as const;
  }

  const config = getContactMailConfig();
  if (!config) {
    return { status: "draft_available" } as const;
  }

  const { email, subject, text } = prepared.message;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.fromEmail,
        to: [STORE_CONTACT.email],
        reply_to: email,
        subject,
        text,
      }),
    });

    if (response.ok) {
      return { status: "sent" } as const;
    }
    console.error("Contact message send failed", { status: response.status });
    if (response.status < 500) {
      return { status: "error", errorKey: "contactFormSendFailed" } as const;
    }
  } catch {
    console.error("Contact message send failed");
  }

  return { status: "error", errorKey: "contactFormSendUnconfirmed" } as const;
}
