import React, { useEffect, useState } from "react";
import api from "../api";
import Loader from "../components/Loader";
import AnalyticsCharts from "../charts/AnalyticsCharts";
import Swal from "sweetalert2";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await api.get("/admin/analytics");
        setData(res.data);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Failed to load analytics",
          text: "Please check admin permissions or try again later.",
        });
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-container">
        <h2 className="admin-dashboard-title">
          Admin Analytics Dashboard 📈
        </h2>
        <div className="analytics-section">
          <div className="analytics-card">
            <div className="analytics-chart-container">
              <AnalyticsCharts data={data} />
            </div>
          </div>
          <p className="analytics-footer">
            📊 Data visualized in real-time for better insights.
          </p>
        </div>
      </div>
    </div>
  );
}
