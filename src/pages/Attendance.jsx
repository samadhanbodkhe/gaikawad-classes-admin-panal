import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaCalendarAlt,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaPlus,
  FaTimes,
  FaSpinner,
  FaUsers,
  FaCalendarCheck,
  FaCalendarTimes,
  FaChartBar,
  FaEye
} from "react-icons/fa";

import {
  useGetAttendancesQuery,
  useMarkAttendanceMutation,
  useGetAttendanceTeacherQuery
} from "../redux/apis/attendanceApi";

const Attendance = () => {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const {
    data: attendanceResponse,
    isLoading: attendanceLoading,
    error: attendanceError,
    refetch: refetchAttendances
  } = useGetAttendancesQuery({
    date: selectedDate,
    status: statusFilter !== "all" ? statusFilter : undefined
  });

  // Fix: Properly handle the teachers query with better error handling
  const {
    data: teachersResponse,
    isLoading: teachersLoading,
    error: teachersError,
    refetch: refetchTeachers
  } = useGetAttendanceTeacherQuery(undefined, {
    skip: !showMarkAttendance
  });

  // Fix: Handle different possible response structures
  const attendanceData = attendanceResponse?.attendances || attendanceResponse?.data || [];
  
  // Fix: Handle teachers data structure properly
  const teachers = React.useMemo(() => {
    if (!teachersResponse) return [];
    
    // Handle different possible response structures
    if (Array.isArray(teachersResponse)) {
      return teachersResponse;
    } else if (teachersResponse.teachers && Array.isArray(teachersResponse.teachers)) {
      return teachersResponse.teachers;
    } else if (teachersResponse.data && Array.isArray(teachersResponse.data)) {
      return teachersResponse.data;
    }
    
    console.warn('Unexpected teachers response structure:', teachersResponse);
    return [];
  }, [teachersResponse]);

  const [markAttendance, { isLoading: markingAttendance }] = useMarkAttendanceMutation();

  const attendanceFormInitial = {
    teacherId: "",
    date: new Date().toISOString().split('T')[0],
    status: "present"
  };

  const [attendanceForm, setAttendanceForm] = useState(attendanceFormInitial);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowMarkAttendance(false);
        setShowViewModal(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    if (showMarkAttendance) {
      refetchTeachers();
    }
  }, [showMarkAttendance, refetchTeachers]);

  // Calculate statistics
  const stats = {
    total: attendanceData.length,
    present: attendanceData.filter(a => a.status === "present").length,
    absent: attendanceData.filter(a => a.status === "absent").length,
    leave: attendanceData.filter(a => a.status === "leave").length,
    attendanceRate: attendanceData.length > 0
      ? Math.round(((attendanceData.filter(a => a.status === "present").length) / attendanceData.length) * 100)
      : 0
  };

  // Filter data based on search
  const filteredData = attendanceData.filter(attendance => {
    const teacher = attendance.teacherId || {};
    return (
      teacher.name?.toLowerCase().includes(search.toLowerCase()) ||
      (teacher.subject && teacher.subject.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const resetForm = () => {
    setAttendanceForm(attendanceFormInitial);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAttendanceForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMarkAttendance = async () => {
    if (!attendanceForm.teacherId || !attendanceForm.date || !attendanceForm.status) {
      alert("Please select teacher, date and status");
      return;
    }

    try {
      await markAttendance(attendanceForm).unwrap();
      setShowMarkAttendance(false);
      resetForm();
      refetchAttendances();
    } catch (error) {
      console.error("Failed to mark attendance:", error);
      alert(error.data?.message || "Failed to mark attendance");
    }
  };

  const handleUpdateStatus = async (attendanceId, newStatus) => {
    const attendance = attendanceData.find(a => a._id === attendanceId);
    if (!attendance) return;
    
    try {
      await markAttendance({
        teacherId: attendance.teacherId._id,
        date: attendance.date.split('T')[0],
        status: newStatus
      }).unwrap();
      refetchAttendances();
    } catch (error) {
      console.error("Failed to update attendance:", error);
      alert(error.data?.message || "Failed to update attendance");
    }
  };

  const handleViewDetails = (attendance) => {
    setSelectedAttendance(attendance);
    setShowViewModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      present: { 
        color: "bg-green-50 text-green-700 border-green-200", 
        icon: FaCheckCircle, 
        label: "Present" 
      },
      absent: { 
        color: "bg-red-50 text-red-700 border-red-200", 
        icon: FaTimesCircle, 
        label: "Absent" 
      },
      leave: { 
        color: "bg-yellow-50 text-yellow-700 border-yellow-200", 
        icon: FaClock, 
        label: "Leave" 
      }
    };
    const config = statusConfig[status] || statusConfig.present;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon className="w-3 h-3 mr-2" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const closeMarkAttendanceModal = () => {
    setShowMarkAttendance(false);
    resetForm();
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedAttendance(null);
  };

  // Fix: Add debug logging to understand the data structure
  useEffect(() => {
    if (showMarkAttendance) {
      console.log('Teachers Response:', teachersResponse);
      console.log('Processed Teachers:', teachers);
    }
  }, [showMarkAttendance, teachersResponse, teachers]);

  if (attendanceLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading Attendance Data</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch the records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaCalendarCheck className="text-blue-600 text-xl" />
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Teacher Attendance</h1>
            </div>
            <p className="text-gray-600 text-sm lg:text-base max-w-2xl">
              Manage and track teacher attendance records with real-time updates
            </p>
          </div>
          <button
            onClick={() => setShowMarkAttendance(true)}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold group"
          >
            <FaPlus className="text-sm group-hover:scale-110 transition-transform" />
            Mark Attendance
          </button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
          {[
            { 
              label: "Total Records", 
              value: stats.total, 
              icon: FaUsers, 
              color: "from-blue-500 to-blue-600",
              bgColor: "bg-blue-50"
            },
            { 
              label: "Present", 
              value: stats.present, 
              icon: FaCalendarCheck, 
              color: "from-green-500 to-green-600",
              bgColor: "bg-green-50"
            },
            { 
              label: "Absent", 
              value: stats.absent, 
              icon: FaCalendarTimes, 
              color: "from-red-500 to-red-600",
              bgColor: "bg-red-50"
            },
            { 
              label: "Leave", 
              value: stats.leave, 
              icon: FaClock, 
              color: "from-yellow-500 to-yellow-600",
              bgColor: "bg-yellow-50"
            },
            { 
              label: "Attendance Rate", 
              value: `${stats.attendanceRate}%`, 
              icon: FaChartBar, 
              color: "from-purple-500 to-purple-600",
              bgColor: "bg-purple-50"
            },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`text-xl bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${stat.color}`}
                  style={{ width: `${(stat.value / (stats.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search by teacher name or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
            
            {/* Date Selector */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header */}
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
              {filteredData.length} records
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Subject & Date
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Marked By
                </th>
                <th className="px-4 lg:px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((attendance) => (
                <tr 
                  key={attendance._id} 
                  className="hover:bg-blue-50 transition-colors duration-150 group"
                >
                  {/* Teacher Column */}
                  <td className="px-4 lg:px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                        <FaUser className="text-blue-600 text-sm" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                          {attendance.teacherId?.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {attendance.teacherId?.email || "No email"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Subject & Date Column */}
                  <td className="px-4 lg:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {attendance.teacherId?.subject || "General"}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <FaCalendarAlt className="text-xs text-gray-400" />
                      {formatDate(attendance.date)}
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="px-4 lg:px-6 py-4">
                    {getStatusBadge(attendance.status)}
                  </td>

                  {/* Marked By Column */}
                  <td className="px-4 lg:px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">
                      {attendance.markedBy?.name || "System Admin"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {attendance.createdAt && new Date(attendance.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 lg:px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(attendance)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 group/btn"
                        title="View Details"
                      >
                        <FaEye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(attendance._id, "present")}
                        className={`p-2 rounded-lg transition-colors duration-200 group/btn ${
                          attendance.status === "present" 
                            ? "text-green-600 bg-green-50" 
                            : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                        }`}
                        title="Mark Present"
                      >
                        <FaCheckCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(attendance._id, "absent")}
                        className={`p-2 rounded-lg transition-colors duration-200 group/btn ${
                          attendance.status === "absent" 
                            ? "text-red-600 bg-red-50" 
                            : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                        }`}
                        title="Mark Absent"
                      >
                        <FaTimesCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(attendance._id, "leave")}
                        className={`p-2 rounded-lg transition-colors duration-200 group/btn ${
                          attendance.status === "leave" 
                            ? "text-yellow-600 bg-yellow-50" 
                            : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                        }`}
                        title="Mark Leave"
                      >
                        <FaClock className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && !attendanceLoading && (
          <div className="text-center py-12 lg:py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaCalendarAlt className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-500 mb-6">
                {search || statusFilter !== "all" || selectedDate 
                  ? "Try adjusting your search criteria or filters" 
                  : "No attendance records available for the selected period"}
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setSelectedDate(new Date().toISOString().split('T')[0]);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {attendanceError && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaTimesCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load data</h3>
              <p className="text-gray-500 mb-6">
                There was an error loading the attendance records. Please try again.
              </p>
              <button
                onClick={refetchAttendances}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mark Attendance Modal */}
      {showMarkAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Mark Attendance</h3>
                <p className="text-sm text-gray-600 mt-1">Record teacher attendance for selected date</p>
              </div>
              <button
                onClick={closeMarkAttendanceModal}
                className="p-2 hover:bg-white rounded-lg transition-colors duration-200 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Teacher Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Teacher <span className="text-red-500">*</span>
                </label>
                {teachersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <FaSpinner className="w-5 h-5 text-blue-600 animate-spin mr-3" />
                    <span className="text-gray-600">Loading teachers...</span>
                  </div>
                ) : teachersError ? (
                  <div className="text-center py-4">
                    <div className="text-red-500 mb-2">Failed to load teachers</div>
                    <button
                      onClick={refetchTeachers}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <select
                    name="teacherId"
                    value={attendanceForm.teacherId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    required
                  >
                    <option value="">Choose a teacher</option>
                    {teachers.length > 0 ? (
                      teachers.map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} - {teacher.subject || "General Subject"}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No teachers available</option>
                    )}
                  </select>
                )}
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={attendanceForm.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  required
                />
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={attendanceForm.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={closeMarkAttendanceModal}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                disabled={markingAttendance}
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAttendance}
                disabled={markingAttendance || !attendanceForm.teacherId || teachersLoading}
                className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {markingAttendance && <FaSpinner className="animate-spin" />}
                {markingAttendance ? "Marking..." : "Mark Attendance"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Attendance Details Modal */}
      {showViewModal && selectedAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Attendance Details</h3>
                <p className="text-sm text-gray-600 mt-1">Complete attendance information</p>
              </div>
              <button
                onClick={closeViewModal}
                className="p-2 hover:bg-white rounded-lg transition-colors duration-200 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Teacher Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                  <FaUser className="text-blue-600 text-lg" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    {selectedAttendance.teacherId?.name || "N/A"}
                  </h4>
                  <p className="text-gray-600">
                    {selectedAttendance.teacherId?.subject || "General Subject"}
                  </p>
                </div>
              </div>

              {/* Attendance Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="font-semibold text-gray-500 block mb-1">Date</span>
                  <p className="text-gray-900 font-medium">
                    {formatDate(selectedAttendance.date)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <span className="font-semibold text-gray-500 block mb-1">Status</span>
                  <div className="mt-1">
                    {getStatusBadge(selectedAttendance.status)}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                  <span className="font-semibold text-gray-500 block mb-1">Marked By</span>
                  <p className="text-gray-900 font-medium">
                    {selectedAttendance.markedBy?.name || "System Admin"}
                  </p>
                </div>
              </div>

              {/* Timestamp */}
              {selectedAttendance.createdAt && (
                <div className="text-xs text-gray-400 text-center border-t pt-4">
                  Record created on {new Date(selectedAttendance.createdAt).toLocaleString()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                onClick={closeViewModal}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;