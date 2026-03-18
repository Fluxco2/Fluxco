"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Question {
  id: string;
  listing_id: string;
  asked_by_name: string;
  asked_by_company: string | null;
  asked_by_supplier_id: string | null;
  question: string;
  answer: string | null;
  answered_by_type: string | null;
  answered_by_name: string | null;
  answered_at: string | null;
  created_at: string;
}

interface QASectionProps {
  listingId: string;
  canAsk?: boolean;       // supplier can ask questions
  canAnswer?: boolean;    // customer/fluxco can answer
  className?: string;
  accessToken?: string | null; // pass token directly to avoid getSession issues
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function QASection({ listingId, canAsk = false, canAnswer = false, className = "", accessToken: propToken }: QASectionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [answeringId, setAnsweringId] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`/api/marketplace/${listingId}/questions`);
      if (res.ok) {
        const { questions: q } = await res.json();
        setQuestions(q || []);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, [listingId]);

  const handleAsk = async () => {
    if (!newQuestion.trim()) return;
    setSubmitting(true);

    const token = propToken || (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) { setSubmitting(false); return; }

    try {
      const res = await fetch(`/api/marketplace/${listingId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: newQuestion.trim() }),
      });
      if (res.ok) {
        setNewQuestion("");
        await fetchQuestions();
      }
    } catch (err) {
      console.error("Error asking question:", err);
    }
    setSubmitting(false);
  };

  const handleAnswer = async (questionId: string) => {
    const answer = answerText[questionId]?.trim();
    if (!answer) return;
    setAnsweringId(questionId);

    const token = propToken || (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) { setAnsweringId(null); return; }

    try {
      const res = await fetch(`/api/marketplace/questions/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answer }),
      });
      if (res.ok) {
        setAnswerText((prev) => ({ ...prev, [questionId]: "" }));
        await fetchQuestions();
      }
    } catch (err) {
      console.error("Error answering question:", err);
    }
    setAnsweringId(null);
  };

  return (
    <div className={className}>
      <h3 className="font-semibold flex items-center gap-2 mb-4">
        <MessageCircle className="w-4 h-4 text-primary" />
        Q&A
        {questions.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {questions.length}
          </Badge>
        )}
      </h3>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : (
        <div className="space-y-4">
          {/* Questions */}
          {questions.map((q, idx) => (
            <div key={q.id} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-sm font-semibold text-muted-foreground">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">{formatDate(q.created_at)}</span>
                    {q.answer ? (
                      <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Answered
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                        Awaiting Reply
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{q.question}</p>
                </div>
              </div>

              {/* Answer */}
              {q.answer && (
                <div className="pl-11 border-l-2 border-green-500/30 ml-4">
                  <p className="text-sm pl-3">{q.answer}</p>
                  {q.answered_at && (
                    <span className="text-xs text-muted-foreground pl-3">{formatDate(q.answered_at)}</span>
                  )}
                </div>
              )}

              {/* Answer form */}
              {!q.answer && canAnswer && (
                <div className="pl-11 space-y-2">
                  <Textarea
                    placeholder="Type your answer..."
                    value={answerText[q.id] || ""}
                    onChange={(e) => setAnswerText((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    rows={2}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAnswer(q.id)}
                    disabled={!answerText[q.id]?.trim() || answeringId === q.id}
                  >
                    {answeringId === q.id ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3 mr-1" />
                    )}
                    Reply
                  </Button>
                </div>
              )}
            </div>
          ))}

          {questions.length === 0 && !canAsk && (
            <p className="text-sm text-muted-foreground py-2">No questions yet.</p>
          )}

          {/* Ask form */}
          {canAsk && (
            <div className="border border-dashed border-border rounded-lg p-4 space-y-3">
              <Textarea
                placeholder="Ask a question about this listing..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <Button
                size="sm"
                onClick={handleAsk}
                disabled={!newQuestion.trim() || submitting}
              >
                {submitting ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <MessageCircle className="w-3 h-3 mr-1" />
                )}
                Ask Question
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
