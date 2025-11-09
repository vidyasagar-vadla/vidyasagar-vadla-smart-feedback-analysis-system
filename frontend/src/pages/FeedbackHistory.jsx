// src/pages/FeedbackHistory.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import Loader from "../components/Loader";
import "../styles/FeedbackTheme.css";

export default function FeedbackHistory({ user }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    api
      .get(`/feedback/user/${user.id}`)
      .then((res) => {
        setFeedbacks(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Failed to load history:", err);
        setFeedbacks([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Loader />;

  return (
    <div className="history-container">
      <h2 className="text-3xl font-bold text-center mb-6 text-indigo-700">
        Your Feedback History
      </h2>

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
  );
}