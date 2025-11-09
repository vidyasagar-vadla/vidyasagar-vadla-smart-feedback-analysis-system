import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import "../styles/AnalyticsCharts.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" },
    tooltip: { mode: "index", intersect: false },
  },
};

export default function AnalyticsCharts({ data }) {
  if (!data?.pie?.length && !data?.bar?.length && !data?.line?.length) {
    return <p className="text-center text-gray-500">No data available.</p>;
  }

  // ✅ Define fixed colors for sentiments
  const sentimentColors = {
    positive: "#10b981", // green
    negative: "#ef4444", // red
    neutral: "#f59e0b",  // yellow
  };

  // ✅ Extract sentiment counts (handle missing labels)
  const sentiments = ["positive", "negative", "neutral"];
  const counts = sentiments.map(
    (label) =>
      data.pie.find((d) => d.label.toLowerCase() === label)?.count || 0
  );

  // ✅ Only include nonzero sentiments for cleaner chart
  const filteredLabels = [];
  const filteredCounts = [];
  const filteredColors = [];

  sentiments.forEach((label, i) => {
    if (counts[i] > 0) {
      filteredLabels.push(label.charAt(0).toUpperCase() + label.slice(1));
      filteredCounts.push(counts[i]);
      filteredColors.push(sentimentColors[label]);
    }
  });

  const pieData = {
    labels: filteredLabels.length ? filteredLabels : ["No Data"],
    datasets: [
      {
        data: filteredCounts.length ? filteredCounts : [1],
        backgroundColor: filteredColors.length
          ? filteredColors
          : ["#9ca3af"], // gray if no data
      },
    ],
  };

  // ✅ Determine dominant sentiment dynamically
  let pieClass = "";
  if (counts.some((c) => c > 0)) {
    const maxIndex = counts.indexOf(Math.max(...counts));
    pieClass = sentiments[maxIndex];
  }

  // ✅ BAR CHART
  const barData = data.bar
    ? {
        labels: data.bar.map(
          (d) =>
            d.question_text.slice(0, 25) +
            (d.question_text.length > 25 ? "..." : "")
        ),
        datasets: [
          {
            label: "Avg Sentiment",
            data: data.bar.map((d) => d.avg_score),
            backgroundColor: "#3b82f6",
          },
        ],
      }
    : null;

  // ✅ LINE CHART
  const lineData = data.line
    ? {
        labels: data.line.map((d) => d.day),
        datasets: [
          {
            label: "Daily Avg Score",
            data: data.line.map((d) => d.avg_score),
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            tension: 0.3,
            fill: true,
          },
        ],
      }
    : null;

  return (
    <div className="analytics-scroll-container">
      {pieData && (
        <div className={`chart-card ${pieClass}`}>
          <h3 className="chart-title">
            Sentiment Distribution{" "}
            {pieClass ? `(${pieClass.toUpperCase()})` : ""}
          </h3>
          <div className="chart-wrapper">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>
      )}

      {barData && (
        <div className="chart-card neutral">
          <h3 className="chart-title">Avg Sentiment per Question</h3>
          <div className="chart-wrapper">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      )}

      {lineData && (
        <div className="chart-card positive">
          <h3 className="chart-title">Sentiment Trend Over Time</h3>
          <div className="chart-wrapper">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
