// src/pages/UserAnalytics.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import Loader from "../components/Loader";
import AnalyticsCharts from "../charts/AnalyticsCharts";

export default function UserAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics")
      .then(res => setData(res.data))
      .catch(() => alert("No personal data yet"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">
        My Analytics
      </h2>
      {data && (data.pie.length || data.bar.length || data.line.length) ? (
        <AnalyticsCharts data={data} />
      ) : (
        <p className="text-center text-gray-500">Submit feedback to see analytics!</p>
      )}
    </div>
  );
}