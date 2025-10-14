import { useState, useEffect } from "react";
import { FaBars, FaSearch, FaBell, FaChevronDown } from "react-icons/fa";
import { FcBusinessman } from "react-icons/fc";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLogoutAdminMutation } from "../redux/apis/authApi";

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [logoutAdmin, { isSuccess, isError, error }] = useLogoutAdminMutation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Path to Title Mapping
  const titles = {
    "/": "Dashboard",
    "/TeacherAR": "TDashboard",
    "/products": "Dashboard",
    "/orders": "Dashboard",
    "/pendingApprovals": "Dashboard",
    "/addProduct": "Dashboard",
    "/leads": "Leads",
    "/transactions": "Transactions",
    "/attendance": "Attendance",
  };

  // Toast handling
  useEffect(() => {
    if (isSuccess) {
      toast.success("Logout successful!");
      navigate("/login");
    }
    if (isError) {
      toast.error(error?.data?.message || "Logout failed!");
    }
  }, [isSuccess, isError, error, navigate]);

  const handleLogout = () => {
    logoutAdmin();
  };

  return (
    <header className="bg-white shadow-md p-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
      {/* Sidebar Toggle Button (Mobile) */}
      <button onClick={toggleSidebar} className="text-gray-700 text-2xl md:hidden">
        <FaBars />
      </button>

      {/* Page Title */}
      <h1 className="text-xl md:text-2xl font-bold text-blue-800">
        {titles[location.pathname] || "Admin Panel"}
      </h1>

      {/* Right Section */}
      <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between">
       
    
        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <FcBusinessman className="w-10 h-10 rounded-full" />
            <FaChevronDown className="text-gray-500" />
          </button>

          {dropdownOpen && (
            <ul className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg py-2 z-50">
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-blue-50 rounded-lg"
                >
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
