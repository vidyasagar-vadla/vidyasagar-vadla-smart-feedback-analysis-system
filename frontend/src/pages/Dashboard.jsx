// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import api from "../api";
import Loader from "../components/Loader";
import FeedbackOnlyForm from "./FeedbackOnlyForm";
import Swal from "sweetalert2";
import "../styles/FeedbackTheme.css";

export default function Dashboard({ user }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadFeedbacks = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/feedback/user/${user.id}`);
      // SAFELY set feedbacks – always an array
      setFeedbacks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
      setFeedbacks([]); // ← NEVER undefined
      Swal.fire("Error", "Could not load your feedback history.", "error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFeedbacks();
  }, [loadFeedbacks, refreshKey]);

  const handleSubmitted = () => {
    setRefreshKey(prev => prev + 1);
    Swal.fire({
      icon: "success",
      title: "Submitted!",
      text: "Your feedback is recorded.",
      timer: 1500,
      showConfirmButton: false
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-container">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6">Welcome, {user?.username}!</h2>

      {/* Submit New Feedback */}
      <div className="mb-10 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Submit New Feedback</h3>
        <FeedbackOnlyForm user={user} onSubmitted={handleSubmitted} />
      </div>

      {/* Past Feedbacks – SAFE .map() */}
      <div className="dashboard-card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Past Feedbacks</h3>
        {feedbacks.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No feedback submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feedbacks.map((fb, i) => (
                  <tr key={fb.feedback_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{i + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fb.feedback_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full sentiment-${fb.overall_sentiment_label}`}>
                        {fb.overall_sentiment_label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fb.overall_sentiment_score?.toFixed(2) ?? "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(fb.created_at).toLocaleDateString()}
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