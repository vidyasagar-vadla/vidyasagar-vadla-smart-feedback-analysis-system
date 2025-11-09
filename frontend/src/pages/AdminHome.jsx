import "../styles/AdminHome.css";
import { Link } from "react-router-dom";

export default function AdminHome() {
  return (
    <div className="admin-home">
      <div className="admin-home-container">
        <h1 className="admin-home-title">Admin Panel</h1>

        <div className="admin-home-grid">
          <Link to="/admin/feedbacks" className="admin-home-card red">
            <div className="admin-home-icon">📋</div>
            <h3>All Feedbacks</h3>
            <p>View & Delete</p>
          </Link>

          <Link to="/admin/analytics" className="admin-home-card purple">
            <div className="admin-home-icon">📊</div>
            <h3>All Analytics</h3>
            <p>Charts & Insights</p>
          </Link>
        </div>

        <p className="admin-home-footer">
          Manage everything from one place
        </p>
      </div>
    </div>
  );
}
