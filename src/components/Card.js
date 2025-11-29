import React from "react";
import "./Card.css";
import backImg from "../assets/cards/back.jpg";

export default function Card({ img, faceUp, style, className, onClick }) {
  return (
    <img
      src={faceUp ? img : backImg}
      alt="carta"
      className={className}
      onClick={onClick}
      draggable="false"
      style={{
  width: "90px",
  height: "150px",
  borderRadius: "8px",
  position: "absolute",
  cursor: faceUp ? "pointer" : "default",
  background: "red",   // ← TEST
  zIndex: 9999,
  ...style
}}

    />
  );
}
