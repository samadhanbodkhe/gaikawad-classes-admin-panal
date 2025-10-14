import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserCheck,
  FaCalendarAlt,
  FaRegCalendarCheck,
  FaMoneyCheckAlt,
  FaTasks,
  FaBars,
  FaTimes,
  FaUser,
  FaUserGraduate
} from "react-icons/fa";

import { useGetAdminProfileQuery } from "../redux/apis/authApi"; // ✅ Import API Hook
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { name: "Dashboard", path: "/", icon: <FaTachometerAlt /> },
  { name: "Teacher Approve/Reject", path: "/TeacherAR", icon: <FaUserCheck /> },
  { name: "Schedule", path: "/schedule", icon: <FaCalendarAlt /> },
  { name: "Leave Request", path: "/Leaverequest", icon: <FaRegCalendarCheck /> },
  { name: "Salary", path: "/salary", icon: <FaMoneyCheckAlt /> },
  { name: "Attendance", path: "/attendance", icon: <FaTasks /> },
  { name: "Student", path: "/student", icon: <FaUserGraduate  /> },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const { data: adminData, isLoading, isError } = useGetAdminProfileQuery();

  const handleNavClick = () => {
    if (window.innerWidth < 768) toggleSidebar();
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-md shadow-lg md:hidden"
      >
        <FaBars className="text-lg" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:relative inset-y-0 left-0 bg-white text-gray-700 h-screen flex flex-col justify-between p-4 transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:w-64 w-60 shadow-lg`}
      >
        {/* Close Button (Mobile) */}
        <button
          onClick={toggleSidebar}
          className="text-2xl mb-5 md:hidden text-gray-400"
        >
          <FaTimes />
        </button>

        {/* Logo */}
        <div className="flex-shrink-0 mb-4">
          <img
            src="https://nexkites-admin-nfr8.vercel.app/assets/Logo-DMb1smQm.webp"
            alt="Logo"
            className="h-8"
          />
        </div>

        {/* Menu (scrollable) */}
        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-2 pr-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`flex items-center rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "bg-blue-100 text-blue-600 border-r-4 border-blue-500"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <div className="flex items-center gap-3 p-3 pl-4 rounded-lg w-full">
                  <span
                    className={`text-lg ${
                      location.pathname === item.path
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Admin Info */}
        <div
          onClick={() => setShowProfile(true)}
          className="cursor-pointer flex items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg mt-4 hover:from-blue-100 hover:to-blue-200 transition-all"
        >
          <div className="bg-blue-200 p-2 rounded-full">
            <FaUser className="text-blue-700 text-lg" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-gray-800">
              {adminData?.name || "Super Admin"}
            </p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            onClick={() => setShowProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-80 p-6"
            >
              <h2 className="text-xl font-semibold text-center text-blue-600 mb-4">
                Admin Profile
              </h2>

              {isLoading ? (
                <p className="text-center text-gray-500">Loading...</p>
              ) : isError ? (
                <p className="text-center text-red-500">
                  Failed to load profile.
                </p>
              ) : (
                <div className="space-y-3 text-gray-700">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Name
                    </p>
                    <p className="font-medium">{adminData?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Email
                    </p>
                    <p className="font-medium">{adminData?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Mobile
                    </p>
                    <p className="font-medium">{adminData?.mobile}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Status
                    </p>
                    <p
                      className={`font-medium ${
                        adminData?.isVerified
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {adminData?.isVerified ? "Verified" : "Not Verified"}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowProfile(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
