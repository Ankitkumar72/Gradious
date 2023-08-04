import "./Loading.css";
import React from "react";
import Spinner from "../../../assests/images/Loading.gif";

export default function Loading() {
  return (
    <div className="loadingDiv">
      <img className="loadingPng" src={Spinner} alt="Loading..." />
    </div>
  );
}
