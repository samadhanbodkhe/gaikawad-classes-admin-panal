import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const businesses = [
  { id: 1, name: "Royal Foods", owner: "Rahul Verma", status: "Approved", plan: "Premium" },
  { id: 2, name: "Cafe Delight", owner: "Ananya Sharma", status: "Pending", plan: "Standard" },
  { id: 3, name: "Spice Junction", owner: "Amit Singh", status: "Approved", plan: "Premium" },
  { id: 4, name: "Bakers Hub", owner: "Priya Mehta", status: "Suspended", plan: "Basic" },
];

const TopBusinesses = () => {
  return (
    <div className="overflow-x-auto bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Recently Onboarded Businesses</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-gray-500">
            <th className="p-3 text-left font-medium">Business Name</th>
            <th className="p-3 text-left font-medium">Owner</th>
            <th className="p-3 text-left font-medium">Plan</th>
            <th className="p-3 text-left font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {businesses.map((b) => (
            <tr key={b.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-semibold">{b.name}</td>
              <td className="p-3">{b.owner}</td>
              <td className="p-3">{b.plan}</td>
              <td className="p-3">
                {b.status === "Approved" && (
                  <span className="text-green-600 flex items-center gap-1">
                    <FaCheckCircle /> {b.status}
                  </span>
                )}
                {b.status === "Pending" && (
                  <span className="text-yellow-600 flex items-center gap-1">
                    ⏳ {b.status}
                  </span>
                )}
                {b.status === "Suspended" && (
                  <span className="text-red-600 flex items-center gap-1">
                    <FaTimesCircle /> {b.status}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopBusinesses;
