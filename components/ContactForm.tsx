"use client";

import { useState, type FormEvent } from "react";
import { contactFormTopics } from "@/data/store";

type ContactFormProps = {
  source?: "homepage" | "contact_page";
};

type SubmitState = {
  status: "idle" | "success" | "error";
  message: string;
};

const initialState: SubmitState = { status: "idle", message: "" };

export default function ContactForm({ source = "contact_page" }: ContactFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);
    setSubmitState(initialState);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          topic: String(formData.get("topic") ?? ""),
          orderNumber: String(formData.get("orderNumber") ?? ""),
          message: String(formData.get("message") ?? ""),
          company: String(formData.get("company") ?? ""),
          source,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as { error?: string; ticketId?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Message could not be sent.");
      }

      form.reset();
      setSubmitState({
        status: "success",
        message: result.ticketId
          ? `Message received. Support ticket ${result.ticketId.slice(0, 8).toUpperCase()} has been created.`
          : "Message received. Our support team will reply soon.",
      });
    } catch (error) {
      setSubmitState({
        status: "error",
        message: error instanceof Error ? error.message : "Message could not be sent.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <span>Support ticket</span>
      <h2>Need help choosing?</h2>
      <div className="contact-form-grid">
        <label>
          <span>Your name</span>
          <input name="name" autoComplete="name" required placeholder="Your name" />
        </label>
        <label>
          <span>Email address</span>
          <input name="email" type="email" autoComplete="email" required placeholder="Email address" />
        </label>
      </div>
      <div className="contact-form-grid">
        <label>
          <span>Phone</span>
          <input name="phone" type="tel" autoComplete="tel" placeholder="Optional" />
        </label>
        <label>
          <span>Order number</span>
          <input name="orderNumber" placeholder="Optional" />
        </label>
      </div>
      <label>
        <span>What do you need?</span>
        <select name="topic" defaultValue="" required>
          <option value="" disabled>
            Select a topic
          </option>
          {contactFormTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Message</span>
        <textarea name="message" required minLength={10} placeholder="Tell us how we can help." rows={4} />
      </label>
      <input className="contact-honeypot" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {submitState.status !== "idle" ? (
        <p className={`contact-form-status ${submitState.status}`} role={submitState.status === "error" ? "alert" : "status"}>
          {submitState.message}
        </p>
      ) : null}
      <button type="submit" className="dark-button" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
