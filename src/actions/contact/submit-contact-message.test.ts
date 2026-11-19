import assert from "node:assert/strict";
import test from "node:test";

import { STORE_CONTACT } from "../../lib/storefront/contact";
import { contactDraftUrl, prepareContactMessage } from "../../lib/storefront/contact-message";
import { submitContactMessage } from "./submit-contact-message";

const input = {
  fullName: "Test Buyer",
  email: "buyer@example.test",
  phone: "+000 000 000",
  message: "ტესტი & details + 15%\nLine #2?subject=other",
};

test("an email draft preserves the fields and cannot add headers or recipients", () => {
  const prepared = prepareContactMessage({ ...input, fullName: "Buyer\r\nBcc: other@example.test" });
  assert.ok(prepared.success);
  const url = new URL(contactDraftUrl(prepared.message));
  assert.equal(url.protocol, "mailto:");
  assert.equal(url.pathname, STORE_CONTACT.email);
  assert.deepEqual([...url.searchParams.keys()], ["subject", "body"]);
  assert.doesNotMatch(url.searchParams.get("subject")!, /[\r\n]/);
  assert.ok(url.searchParams.get("body")?.includes(input.message.replace(/\n/g, "\r\n")));
  assert.ok(url.searchParams.get("body")?.includes(input.phone));
  assert.ok(url.searchParams.get("body")?.includes(input.email));
});

test("contact validation and direct delivery with an isolated mail transport", async (t) => {
  const originalEnv = process.env;
  process.env = { ...originalEnv, RESEND_API_KEY: "", CONTACT_FROM_EMAIL: "" };
  t.after(() => { process.env = originalEnv; });
  t.mock.method(console, "error", () => {});
  const send = t.mock.method(globalThis, "fetch", async () => Response.json({ id: "fixture" }));

  assert.deepEqual(await submitContactMessage(input), { status: "draft_available" });
  assert.deepEqual(await submitContactMessage({ ...input, email: "invalid" }), {
    status: "error", errorKey: "contactFormEmailInvalid",
  });
  process.env.RESEND_API_KEY = "fixture";
  assert.deepEqual(await submitContactMessage(input), { status: "draft_available" });
  assert.equal(send.mock.callCount(), 0);

  process.env.CONTACT_FROM_EMAIL = "store@example.test";
  assert.deepEqual(await submitContactMessage(input), { status: "sent" });
  const [url, init] = send.mock.calls[0].arguments;
  assert.equal(url, "https://api.resend.com/emails");
  const payload = JSON.parse(String(init?.body));
  assert.deepEqual(payload.to, [STORE_CONTACT.email]);
  assert.equal(payload.reply_to, input.email);
  assert.ok(payload.text.includes(input.message));

  send.mock.mockImplementation(async () => new Response(null, { status: 422 }));
  assert.deepEqual(await submitContactMessage(input), { status: "error", errorKey: "contactFormSendFailed" });
  send.mock.mockImplementation(async () => new Response(null, { status: 503 }));
  const unconfirmed = { status: "error", errorKey: "contactFormSendUnconfirmed" };
  assert.deepEqual(await submitContactMessage(input), unconfirmed);
  send.mock.mockImplementation(async () => { throw new Error("ambiguous response"); });
  assert.deepEqual(await submitContactMessage(input), unconfirmed);
  assert.equal(send.mock.callCount(), 4);
});
