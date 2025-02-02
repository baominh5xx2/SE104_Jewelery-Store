import React, { useState } from 'react';
import './Dashboard.css';
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import { Input, Button } from 'antd';
import { ExportOutlined } from '@ant-design/icons';

// Update import paths for react-icons and recharts
import { BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill } from 'react-icons/bs';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';


 const data1 = [
  {
    name: 'Tháng 1',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Tháng 2',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Tháng 3',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Tháng 4',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Tháng 5',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Tháng 6',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Tháng 7',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
  {
    name: 'Tháng 8',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Tháng 9',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Tháng 10',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Tháng 11',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Tháng 12',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  }
];

const data2 = [
  {
    name: 'Tháng 1',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Tháng 2',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Tháng 3',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Tháng 4',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Tháng 5',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Tháng 6',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Tháng 7',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
  {
    name: 'Tháng 8',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Tháng 9',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Tháng 10',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Tháng 11',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Tháng 12',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  }
];
const data3 = [
  {
    name: 'Hoa tai',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Vòng cổ',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Vòng tay',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Nhẫn',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  }
];



const Dashboard = () => {
  const [sortOption, setSortOption] = useState('date');
  
  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const toggleFilter = () => {
    console.log("Filter toggled");
  };

  const searchData = () => {
    console.log("Search data");
  };

  return (
    <div>
    
      <div style={{ marginLeft: "270px" }}>
        
        <Topbar title="Thông tin cá nhân" />
      </div> 
      

{/* MAIN*/}
      <main className='main-container'>
        <div className='main-title'>
            <h3>DASHBOARD</h3>
        </div>

        <div className='main-cards'>
            <div className='card'>
                <div className='card-inner'>
                    <h3>SẢN PHẨM</h3>
                    <BsFillArchiveFill className='card_icon'/>
                </div>
                <h1>300</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>DANH MỤC</h3>
                    <BsFillGrid3X3GapFill className='card_icon'/>
                </div>
                <h1>12</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>KHÁCH HÀNG</h3>
                    <BsPeopleFill className='card_icon'/>
                </div>
                <h1>33</h1>
            </div>
            <div className='card'>
                <div className='card-inner'>
                    <h3>THÔNG BÁO</h3>
                    <BsFillBellFill className='card_icon'/>
                </div>
                <h1>42</h1>
            </div>
        </div>


        <div className='charts-container'>
  {/* Container cho Line Chart */}
  <div className='chart-line'>
  
    <ResponsiveContainer width="100%" height={400}>
    <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Doanh thu năm</h3>
      <LineChart
        data={data1}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
        }}
      >
         <Legend
        formatter={(value) => {
          if (value === "pv") return "Năm 2024";
          if (value === "uv") return "Năm 2023";
          return value;
        }}
      />
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  </div>

  <div className='chart-below'>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
      {/* Bar Chart - Bên trái */}
      <div className='chart-bar' style={{ width: '48%', height: '300px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Đơn hàng mới</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data2}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <Legend
        formatter={(value) => {
          if (value === "pv") return "Hoàn thành";
          if (value === "uv") return "Đã hủy";
          return value;
        }}
      />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pv" fill="#8884d8" />
            <Bar dataKey="uv" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Bên phải */}
      <div className='chart-pie' style={{ width: '48%', height: '300px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Doanh thu trên danh mục sản phẩm</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data3}
              dataKey="pv"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            />
             {/* Sử dụng Cell để chỉ định màu sắc cho từng phần */}
        {data3.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={index % 4 === 0 ? "#BFECFF" : "#CDC1FF" } /* Tùy chỉnh màu sắc */
          />
        ))}
       
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
</div>

    </main>
</div>
  );
};

export default Dashboard;
