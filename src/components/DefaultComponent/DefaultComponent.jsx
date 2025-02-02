import React from "react";
import SidebarComponent from "../SidebarComponent/SidebarComponent";
import "./DefaultComponent.css";

const DefaultComponent = ({ children }) => {
  return (
    <div className="layout-container">
      <SidebarComponent />
      <div className="main-content">
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

export default DefaultComponent;
