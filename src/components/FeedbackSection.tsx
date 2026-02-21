"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Textarea, Card, Badge, Alert, Select, Input } from "@/components/ui";
import { MessageSquare, ChevronDown } from "lucide-react";
import { format } from "date-fns";

interface FeedbackItem {
  id: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  adminNotes?: string | null;
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  question: "Question",
  bug: "Bug Report",
  feature: "Feature Request",
  support: "Support Request",
};

const statusVariant: Record<string, "neutral" | "info" | "success" | "warning"> = {
  open: "info",
  in_progress: "warning",
  resolved: "success",
  closed: "neutral",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export default function FeedbackSection() {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("question");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await fetch("/api/feedback");
      if (res.ok) {
        const data = await res.json();
        setFeedbackList(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, subject: subject.trim(), message: message.trim() }),
      });

      if (res.ok) {
        setSuccessMsg("Feedback submitted! We'll get back to you soon.");
        setShowForm(false);
        setType("question");
        setSubject("");
        setMessage("");
        setTimeout(() => setSuccessMsg(""), 4000);
        fetchFeedback();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit");
      }
    } catch {
      setError("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <details>
        <summary className="cursor-pointer select-none list-none flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Help & Feedback</h3>
          </div>
          <ChevronDown className="chevron-icon w-5 h-5 text-muted transition-transform" />
        </summary>

        <div className="mt-4 space-y-4">
          {successMsg && <Alert variant="success">{successMsg}</Alert>}
          {error && <Alert variant="error">{error}</Alert>}

          {!showForm ? (
            <Button size="sm" onClick={() => setShowForm(true)}>
              Submit Feedback
            </Button>
          ) : (
            <div className="space-y-3 border border-border rounded-lg p-4">
              <Select
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="question">Question</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="support">Support Request</option>
              </Select>

              <Input
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary"
              />

              <Textarea
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question, issue, or idea..."
                rows={4}
              />

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  loading={submitting}
                  disabled={submitting}
                >
                  Submit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Past feedback */}
          {loading ? (
            <p className="text-sm text-muted">Loading...</p>
          ) : feedbackList.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted uppercase tracking-wide">
                Your Submissions
              </p>
              {feedbackList.map((fb) => (
                <div
                  key={fb.id}
                  className="border border-border rounded-lg p-3 text-sm"
                >
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-foreground">
                      {fb.subject}
                    </span>
                    <Badge variant="primary">
                      {typeLabels[fb.type] || fb.type}
                    </Badge>
                    <Badge variant={statusVariant[fb.status] || "neutral"}>
                      {statusLabels[fb.status] || fb.status}
                    </Badge>
                  </div>
                  <p className="text-muted line-clamp-2">{fb.message}</p>
                  <p className="text-xs text-muted mt-1">
                    {format(new Date(fb.createdAt), "MMM d, yyyy")}
                  </p>
                  {fb.adminNotes && (
                    <div className="mt-2 p-2 bg-primary/5 rounded text-xs">
                      <span className="font-medium">Response:</span>{" "}
                      {fb.adminNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </details>
    </Card>
  );
}
