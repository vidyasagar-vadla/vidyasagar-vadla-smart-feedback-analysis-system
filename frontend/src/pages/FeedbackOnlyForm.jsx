// src/pages/FeedbackOnlyForm.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import Swal from "sweetalert2";
import "../styles/FeedbackTheme.css";

export default function FeedbackOnlyForm({ user, onSubmitted }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/questions")
      .then((res) => {
        setQuestions(res.data);
        setLoading(false);
      })
      .catch(() => {
        Swal.fire("Error", "Failed to load questions", "error");
        setLoading(false);
      });
  }, []);

  const allAnswered = questions.every((q) => {
    const val = answers[q.question_id];
    if (q.question_type === "text") return val?.trim().length > 0;
    return val !== undefined && val !== null;
  });

  const handleChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const submit = async () => {
    if (!allAnswered) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please answer every question before submitting.",
      });
      return;
    }

    const payload = {
      submitter_type: user ? "user" : "guest",
      submitter_id: user?.id || null,
      answers: Object.entries(answers).map(([qid, text]) => ({
        question_id: parseInt(qid),
        answer_text: text,
      })),
    };

    try {
      // GUEST → /feedback/guest (NO TOKEN)
      // USER → /feedback (WITH TOKEN)
      const endpoint = user ? "/feedback" : "/feedback/guest";
      await api.post(endpoint, payload);

      Swal.fire({
        icon: "success",
        title: "Thank You!",
        text: "Your feedback has been submitted.",
        confirmButtonColor: "#dc2626",
      });
      setAnswers({});
      onSubmitted?.();
    } catch (err) {
      console.error("Submit error:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to submit feedback",
        "error"
      );
    }
  };

  if (loading) return <div className="text-center p-10 text-xl">Loading...</div>;

  return (
    <div className="feedback-page">
      <div className="feedback-form-card">
        <h2>Employee Feedback Survey</h2>

        <div className="space-y-10">
          {questions.map((q, i) => (
            <div key={q.question_id} className="question-card">
              <p className="text-lg font-semibold text-gray-800 mb-4">
                {i + 1}. {q.question_text}
                {q.question_type === "text" && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Open-ended)
                  </span>
                )}
              </p>

              {q.question_type === "text" && (
                <textarea
                  className="question-textarea"
                  rows="4"
                  placeholder="Share your thoughts..."
                  value={answers[q.question_id] || ""}
                  onChange={(e) => handleChange(q.question_id, e.target.value)}
                />
              )}

              {q.question_type === "rating" && (
                <div className="rating-options">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label key={n}>
                      <input
                        type="radio"
                        name={`rating-${q.question_id}`}
                        value={n}
                        checked={answers[q.question_id] === n}
                        onChange={() => handleChange(q.question_id, n)}
                        className="sr-only"
                      />
                      <div
                        className={`rating-circle ${
                          answers[q.question_id] === n ? "active" : ""
                        }`}
                      >
                        {n}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {q.question_type === "choice" && (
                <div className="choice-grid">
                  {(Array.isArray(q.options)
                    ? q.options
                    : JSON.parse(q.options || "[]")
                  ).map((opt) => (
                    <label key={opt}>
                      <input
                        type="radio"
                        name={`choice-${q.question_id}`}
                        value={opt}
                        checked={answers[q.question_id] === opt}
                        onChange={() => handleChange(q.question_id, opt)}
                        className="sr-only"
                      />
                      <div
                        className={`choice-option ${
                          answers[q.question_id] === opt ? "active" : ""
                        }`}
                      >
                        {opt}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={submit}
          disabled={!allAnswered}
          className={`feedback-submit ${!allAnswered ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {allAnswered ? "Submit Feedback" : "Answer all questions"}
        </button>
      </div>
    </div>
  );
}