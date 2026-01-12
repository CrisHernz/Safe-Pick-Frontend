import React from "react";
import "./Loading.css";

function Loading({ text = "Cargando..." }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

export default Loading;
