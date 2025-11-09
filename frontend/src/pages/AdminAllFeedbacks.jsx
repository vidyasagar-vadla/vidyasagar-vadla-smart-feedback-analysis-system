// src/pages/AdminAllFeedbacks.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import Loader from "../components/Loader";
import Swal from "sweetalert2";
import "../styles/AdminAllFeedbacks.css";

export default function AdminAllFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchFeedbacks = async () => {
    try {
      const res = await api.get("/admin/feedbacks");
      setFeedbacks(res.data);
    } catch (err) {
      Swal.fire("Error", "Failed to load feedbacks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Feedback?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);
    try {
      await api.delete(`/feedback/${id}`);
      setFeedbacks(prev => prev.filter(f => f.feedback_id !== id));
      Swal.fire("Deleted!", "Feedback removed.", "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to delete", "error");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="admin-feedback-container">
      <div className="max-w-7xl mx-auto">
        <div className="admin-feedback-header">
          <h2 className="admin-feedback-title">
            All Feedbacks
          </h2>
          <p className="admin-feedback-count">
            Total: {feedbacks.length} submission{feedbacks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {feedbacks.length === 0 ? (
          <div className="empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No feedback submitted yet.</p>
          </div>
        ) : (
          <div className="feedback-table-wrapper">
            <table className="feedback-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Sentiment</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((fb, i) => (
                  <tr key={fb.feedback_id}>
                    <td>{i + 1}</td>
                    <td>{fb.username || "Guest"}</td>
                    <td className={`sentiment-${fb.overall_sentiment_label}`}>
                      {fb.overall_sentiment_label}
                    </td>
                    <td>{fb.overall_sentiment_score?.toFixed(2)}</td>
                    <td>{new Date(fb.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(fb.feedback_id)}
                        disabled={deletingId === fb.feedback_id}
                        className="delete-btn"
                      >
                        {deletingId === fb.feedback_id ? (
                          "Deleting..."
                        ) : (
                          <>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}