import React from "react";
import "./Card.css";
import backImg from "../assets/cards/back.jpg";

export default function Card({ img, faceUp, style, className, onClick }) {
  return (
    <img
      src={faceUp ? img : backImg}
      alt="carta"
      className={className ? `card ${className}` : "card"}
      onClick={onClick}
      draggable="false"
      style={style}
    />
  );
}
