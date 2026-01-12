import React from "react";
import "./StatCard.css";

function StatCard({ title, value, icon, color = "primary", subtitle }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-content">
        <div className="stat-card-header">
          <span className="stat-card-title">{title}</span>
          {icon && <span className="stat-card-icon">{icon}</span>}
        </div>
        <div className="stat-card-value">{value}</div>
        {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}

export default StatCard;
