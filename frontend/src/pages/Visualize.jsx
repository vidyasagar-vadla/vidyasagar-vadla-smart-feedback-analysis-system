// src/pages/Visualize.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import AnalyticsCharts from "../charts/AnalyticsCharts";
import Loader from "../components/Loader";
import Swal from "sweetalert2";

export default function Visualize() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/admin/analytics", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setData(res.data);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "Only admin users can view analytics.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
        📊 Feedback Visualizations
      </h2>
      {data ? (
        <AnalyticsCharts data={data} />
      ) : (
        <p className="text-center text-gray-500">
          No visualization data available.
        </p>
      )}
    </div>
  );
}
