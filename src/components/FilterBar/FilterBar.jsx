import React from "react";
import { Input, Button, DatePicker } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import "./FilterBar.css";

const FilterBar = ({ tabs = [], activeTab, onTabClick }) => {
  return (
    <div className="filter-bar">
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => onTabClick(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="filter-actions">
        <Input placeholder="Tìm kiếm" />
        <DatePicker placeholder="Chọn ngày" />
        <Button icon={<FilterOutlined />}>Bộ lọc</Button>
      </div>
    </div>
  );
};

export default FilterBar;