// src/pages/AdminAnalytics.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import Loader from "../components/Loader";
import AnalyticsCharts from "../charts/AnalyticsCharts";
import "../styles/AdminAnalytics.css"; // RED THEME

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/analytics")
      .then(res => setData(res.data))
      .catch(err => console.error("Analytics error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  // Calculate stats
  const totalFeedbacks = data?.pie?.reduce((sum, item) => sum + item.count, 0) || 0;
  const positive = data?.pie?.find(item => item.label === 'positive')?.count || 0;
  const avgSentiment = data?.bar?.reduce((sum, item) => sum + (item.avg_score || 0), 0) / (data?.bar?.length || 1);
  const hasData = totalFeedbacks > 0;

  return (
    <div className="admin-analytics-container">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="admin-analytics-header">
          <h2 className="admin-analytics-title">Full System Analytics</h2>
          <p className="admin-analytics-subtitle">
            Real-time insights from all feedback submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="analytics-stats">
          <div className="stat-card">
            <div className="stat-number">{totalFeedbacks}</div>
            <div className="stat-label">Total Feedbacks</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{((positive / totalFeedbacks) * 100 || 0).toFixed(1)}%</div>
            <div className="stat-label">Positive Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{avgSentiment.toFixed(2)}</div>
            <div className="stat-label">Avg Sentiment</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{data?.line?.length || 0}</div>
            <div className="stat-label">Active Days</div>
          </div>
        </div>

        {/* Charts – Using YOUR component */}
        {hasData ? (
          <div className="charts-wrapper">
            <AnalyticsCharts data={data} />
          </div>
        ) : (
          <div className="no-data">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No analytics data available yet.</p>
            <p className="text-sm text-gray-500 mt-2">Submit feedback to see insights!</p>
          </div>
        )}
      </div>
    </div>
  );
}