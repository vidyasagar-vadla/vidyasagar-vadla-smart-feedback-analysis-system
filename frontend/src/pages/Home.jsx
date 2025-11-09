// src/pages/Home.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function Home({ user }) {
  const navigate = useNavigate();

  const goToFeedback = () => navigate("/feedback-only");
  const goToHistory = () => navigate("/feedback-history");
  const goToAnalytics = () => navigate("/analytics");

  return (
    <div className="home-container">
      <div className="home-content">
        <span className="home-badge">Welcome</span>
        <h1 className="home-title">Smart Feedback System</h1>
        <p className="home-subtitle">
          Empower your organization with insights from employees through
          sentiment analysis.
        </p>

        <div className="home-buttons">
          <button onClick={goToFeedback} className="home-btn-primary">
            Give Feedback
          </button>

          {user ? (
            <>
              <button onClick={goToHistory} className="home-btn-secondary">
                View Feedback
              </button>
              <button onClick={goToAnalytics} className="home-btn-secondary">
                Analytics
              </button>
            </>
          ) : (
            <Link to="/login" className="home-btn-secondary">
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
