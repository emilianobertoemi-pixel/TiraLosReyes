import React from "react";
import "./Card.css";

export default function Card({ id, rank, faceUp, style, className, onClick }) {
  return (
    <div
      className={`card ${faceUp ? "face-up" : "face-down"} ${className || ""}`}
      style={style}
      onClick={onClick}
    >
      {faceUp ? (
        <span className="card-rank">{rank}</span>
      ) : (
        <span className="card-back">★</span>
      )}
    </div>
  );
}
