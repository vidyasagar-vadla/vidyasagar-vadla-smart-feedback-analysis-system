import React, { useEffect, useState } from "react";
import api from "../api";
import Loader from "../components/Loader";
import "../styles/Visualization.css"; // ✅ import styles

export default function AnalyticsPage({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartIndex, setChartIndex] = useState(0);

  // ✅ Load analytics data or fallback
  useEffect(() => {
    api
      .get("/analytics")
      .then((res) => setData(res.data))
      .catch(() => {
        console.warn("⚠️ Using fallback data (API unavailable)");
        setData({
          pie: [
            { label: "Positive", count: 45 },
            { label: "Negative", count: 25 },
            { label: "Neutral", count: 30 },
          ],
          bar: [
            { question_text: "Work environment", avg_score: 0.8 },
            { question_text: "Salary satisfaction", avg_score: 0.6 },
            { question_text: "Team support", avg_score: 0.9 },
          ],
          line: [
            { day: "Mon", avg_score: 0.7 },
            { day: "Tue", avg_score: 0.6 },
            { day: "Wed", avg_score: 0.8 },
            { day: "Thu", avg_score: 0.75 },
            { day: "Fri", avg_score: 0.9 },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, [user]);

  const charts = [
    { id: "pie", title: "Sentiment Distribution" },
    { id: "bar", title: "Avg Sentiment per Question" },
    { id: "line", title: "Sentiment Trend Over Time" },
  ];

  const nextChart = () => setChartIndex((prev) => (prev + 1) % charts.length);
  const prevChart = () => setChartIndex((prev) => (prev - 1 + charts.length) % charts.length);

  if (loading) return <Loader />;

  return (
    <div className="visualization-container">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">
        {charts[chartIndex].title}
      </h2>

      <div className="visualization-box">
        <canvas id="chart-canvas"></canvas>
      </div>

      <div className="visualization-buttons">
        <button className="vis-btn vis-btn-secondary" onClick={prevChart}>
          Prev
        </button>
        <button className="vis-btn vis-btn-primary" onClick={nextChart}>
          Next
        </button>
      </div>

      {data && <RenderCharts data={data} chartType={charts[chartIndex].id} />}
    </div>
  );
}

// ✅ Chart Rendering
function RenderCharts({ data, chartType }) {
  useEffect(() => {
    if (!window.Chart) {
      console.error("❌ Chart.js not loaded. Check index.html script tag.");
      return;
    }

    const ctx = document.getElementById("chart-canvas")?.getContext("2d");
    if (!ctx) return;

    if (window.activeChart) {
      window.activeChart.destroy();
    }

    let chartConfig;

    if (chartType === "pie") {
      chartConfig = {
        type: "pie",
        data: {
          labels: data.pie.map((d) => d.label),
          datasets: [
            {
              data: data.pie.map((d) => d.count),
              backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
        },
      };
    } else if (chartType === "bar") {
      chartConfig = {
        type: "bar",
        data: {
          labels: data.bar.map((d) => d.question_text),
          datasets: [
            {
              label: "Avg Score",
              data: data.bar.map((d) => d.avg_score),
              backgroundColor: "#3b82f6",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
          scales: { y: { beginAtZero: true, max: 1 } },
        },
      };
    } else if (chartType === "line") {
      chartConfig = {
        type: "line",
        data: {
          labels: data.line.map((d) => d.day),
          datasets: [
            {
              label: "Daily Avg",
              data: data.line.map((d) => d.avg_score),
              borderColor: "#8b5cf6",
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
          scales: { y: { beginAtZero: true, max: 1 } },
        },
      };
    }

    window.activeChart = new window.Chart(ctx, chartConfig);

    return () => {
      window.activeChart?.destroy();
    };
  }, [data, chartType]);

  return null;
}
