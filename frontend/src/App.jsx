// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FeedbackOnlyForm from "./pages/FeedbackOnlyForm";
import FeedbackHistory from "./pages/FeedbackHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminHome from "./pages/AdminHome";
import AdminAllFeedbacks from "./pages/AdminAllFeedbacks";
import AdminAnalytics from "./pages/AdminAnalytics";
import UserAnalytics from "./pages/Useranalytics";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="p-6 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feedback-only" element={<FeedbackOnlyForm user={user} />} />

          <Route
            path="/dashboard"
            element={<ProtectedRoute user={user}><Dashboard user={user} /></ProtectedRoute>}
          />
          <Route
            path="/feedback-history"
            element={<ProtectedRoute user={user}><FeedbackHistory user={user} /></ProtectedRoute>}
          />
          <Route
            path="/analytics"
            element={<ProtectedRoute user={user}><UserAnalytics /></ProtectedRoute>}
          />

          <Route
            path="/admin"
            element={<ProtectedRoute user={user} adminOnly><AdminHome /></ProtectedRoute>}
          />
          <Route
            path="/admin/feedbacks"
            element={<ProtectedRoute user={user} adminOnly><AdminAllFeedbacks /></ProtectedRoute>}
          />
          <Route
            path="/admin/analytics"
            element={<ProtectedRoute user={user} adminOnly><AdminAnalytics /></ProtectedRoute>}
          />
        </Routes>
      </div>
    </Router>
  );
}