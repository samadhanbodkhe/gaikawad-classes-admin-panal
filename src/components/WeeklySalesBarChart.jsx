import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { FaChartBar } from "react-icons/fa";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WeeklySalesBarChart = () => {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const data = {
    labels,
    datasets: [
      {
        label: "New Businesses Onboarded",
        data: [5, 10, 7, 12, 8, 15, 9],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        barPercentage: 0.5,
      },
      {
        label: "Subscriptions Renewed",
        data: [2, 4, 5, 7, 6, 9, 4],
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        barPercentage: 0.5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true },
    },
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-blue-500 text-lg font-semibold">
        <FaChartBar className="text-2xl" /> Weekly Platform Growth
      </div>
      <Bar data={data} options={options} />
    </div>
  );
};

export default WeeklySalesBarChart;
