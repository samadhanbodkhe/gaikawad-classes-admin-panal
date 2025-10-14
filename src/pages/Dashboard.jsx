import React from "react";
import { FaUsers, FaMoneyCheckAlt, FaTasks } from "react-icons/fa";
import { useGetDashboardStatsQuery } from "../redux/apis/dashboardApi";

const Dashboard = () => {
  const { data, isLoading, isError } = useGetDashboardStatsQuery();
  console.log("sdksdnfs",data);
  

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Loading dashboard...</p>
      </div>
    );

  if (isError)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-red-600">Failed to load dashboard data.</p>
      </div>
    );

  const stats = data?.data || {};

  const summary = [
    {
      title: "Total Teachers",
      value: stats.totalTeachers || 0,
      icon: <FaUsers className="text-2xl text-blue-600" />,
    },
    {
      title: "Pending Salaries",
      value: stats.pendingSalaries || 0,
      icon: <FaMoneyCheckAlt className="text-2xl text-green-600" />,
    },
    {
      title: "Pending Leaves",
      value: stats.pendingLeaves || 0,
      icon: <FaTasks className="text-2xl text-yellow-600" />,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {summary.map((item, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{item.title}</p>
                <p className="text-2xl font-bold text-gray-800">{item.value}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">{item.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-5 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Today’s Attendance</h2>
        <p className="text-gray-800 font-medium">
          Present: {stats.attendance?.present || 0} | Absent: {stats.attendance?.absent || 0}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
