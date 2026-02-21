"use client";

import { useState } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { Button, Input, Textarea, Select, Alert } from "@/components/ui";

// [Template] — Enrollment / inquiry form for a provider's public profile page.
// Adjust fields and terminology (e.g., "enrollment" vs "inquiry" vs "booking request") to match your domain.

interface EnrollmentFormProps {
  providerId: string;
  providerName: string;
  /** Available service types/formats the consumer can choose from */
  serviceTypes?: string[];
  /** Pre-fill from logged-in user session */
  defaultName?: string;
  defaultEmail?: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  message: string;
}

export function EnrollmentForm({
  providerId,
  providerName,
  serviceTypes,
  defaultName = "",
  defaultEmail = "",
}: EnrollmentFormProps) {
  const [form, setForm] = useState<FormState>({
    name: defaultName,
    email: defaultEmail,
    phone: "",
    serviceType: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error on edit
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Please enter a valid email address";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/providers/${providerId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          serviceType: form.serviceType || undefined,
          message: form.message.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  /* ── Success state ─────────────────────────────────────── */
  if (status === "success") {
    return (
      <div className="text-center py-10">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle className="w-6 h-6 text-success" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Inquiry sent!
        </h3>
        <p className="text-sm text-muted max-w-sm mx-auto">
          {/* [Template] Customize the success message */}
          Your message has been sent to {providerName}. They will get back to
          you soon.
        </p>
      </div>
    );
  }

  /* ── Form ──────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "error" && errorMessage && (
        <Alert variant="error">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Your name"
          placeholder="Full name"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          error={errors.name}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Phone (optional)"
          type="tel"
          placeholder="(555) 123-4567"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          error={errors.phone}
        />
        {serviceTypes && serviceTypes.length > 0 && (
          <Select
            label="Service type (optional)"
            value={form.serviceType}
            onChange={(e) => update("serviceType", e.target.value)}
          >
            <option value="">Select a service...</option>
            {serviceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        )}
      </div>

      <Textarea
        label="Message (optional)"
        placeholder={`Tell ${providerName} a bit about what you're looking for...`}
        rows={4}
        value={form.message}
        onChange={(e) => update("message", e.target.value)}
        error={errors.message}
      />

      <Button type="submit" loading={status === "loading"} className="w-full sm:w-auto">
        <Send className="w-4 h-4 mr-1.5" />
        Send inquiry
      </Button>
    </form>
  );
}
