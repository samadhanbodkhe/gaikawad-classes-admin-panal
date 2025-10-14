import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = () => {
  const data = {
    datasets: [
      {
        data: [200, 150, 30, 25], // Values
        backgroundColor: ["#1976D2", "#4CAF50", "#FFD700", "#FF5722"],
        borderWidth: 0,
      },
    ],
  };

  const labels = [
    { name: "Total Businesses", color: "#1976D2" },
    { name: "Approved", color: "#4CAF50" },
    { name: "Pending", color: "#FFD700" },
    { name: "Suspended", color: "#FF5722" },
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex flex-wrap justify-between w-full max-w-md text-sm">
        <div className="flex flex-col gap-2 items-start">
          {labels.slice(0, 2).map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
              {item.name}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 items-end">
          {labels.slice(2, 4).map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              {item.name}
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-40 h-40 flex justify-center items-center">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default DoughnutChart;
