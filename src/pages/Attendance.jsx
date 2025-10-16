import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaPlus,
  FaTimes,
  FaSpinner,
  FaEye,
  FaCalendarDay
} from "react-icons/fa";

import {
  useGetAttendancesQuery,
  useMarkAttendanceMutation,
  useGetAttendanceTeacherQuery
} from "../redux/apis/attendanceApi";

const Attendance = () => {
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

  const {
    data: teachersResponse,
    isLoading: teachersLoading,
    error: teachersError,
    refetch: refetchTeachers
  } = useGetAttendanceTeacherQuery(undefined, {
    skip: !showMarkAttendance
  });

  // Handle attendance data structure
  const attendanceData = attendanceResponse?.attendances || attendanceResponse?.data || [];
  
  // Handle teachers data structure properly
  const teachers = React.useMemo(() => {
    if (!teachersResponse) return [];
    
    if (Array.isArray(teachersResponse)) {
      return teachersResponse;
    } else if (teachersResponse.teachers && Array.isArray(teachersResponse.teachers)) {
      return teachersResponse.teachers;
    } else if (teachersResponse.data && Array.isArray(teachersResponse.data)) {
      return teachersResponse.data;
    }
    
    return [];
  }, [teachersResponse]);

  const [markAttendance, { isLoading: markingAttendance }] = useMarkAttendanceMutation();

  const attendanceFormInitial = {
    teacherId: "",
    date: new Date().toISOString().split('T')[0],
    status: "present"
  };

  const [attendanceForm, setAttendanceForm] = useState(attendanceFormInitial);

  // Close modals on escape key
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

  // Refetch teachers when mark attendance modal opens
  useEffect(() => {
    if (showMarkAttendance) {
      refetchTeachers();
    }
  }, [showMarkAttendance, refetchTeachers]);

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

  const handleViewDetails = (attendance) => {
    setSelectedAttendance(attendance);
    setShowViewModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      present: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: FaCheckCircle, 
        label: "Present" 
      },
      absent: { 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: FaTimesCircle, 
        label: "Absent" 
      },
      leave: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        icon: FaClock, 
        label: "Leave" 
      }
    };
    const config = statusConfig[status] || statusConfig.present;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
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

  if (attendanceLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaCalendarDay className="text-blue-600" />
              Teacher Attendance
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage teacher attendance records
            </p>
          </div>
          <button
            onClick={() => setShowMarkAttendance(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <FaPlus className="text-sm" />
            Mark Attendance
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Attendance Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-4 lg:px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded border">
              {attendanceData.length} records
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.map((attendance) => (
                <tr 
                  key={attendance._id} 
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* Teacher Column */}
                  <td className="px-4 lg:px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FaUser className="text-blue-600 text-xs" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {attendance.teacherId?.name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {attendance.teacherId?.email || "No email"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Subject Column */}
                  <td className="px-4 lg:px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {attendance.teacherId?.subject || "General"}
                    </div>
                  </td>

                  {/* Date Column */}
                  <td className="px-4 lg:px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <FaCalendarAlt className="text-xs text-gray-400" />
                      {formatDate(attendance.date)}
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="px-4 lg:px-6 py-4">
                    {getStatusBadge(attendance.status)}
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 lg:px-6 py-4 text-right">
                    <button
                      onClick={() => handleViewDetails(attendance)}
                      className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                      title="View Details"
                    >
                      <FaEye className="w-3 h-3 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {attendanceData.length === 0 && !attendanceLoading && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FaCalendarAlt className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-500 mb-4">
                {statusFilter !== "all" || selectedDate 
                  ? "No attendance records match your filters" 
                  : "No attendance records available for the selected date"}
              </p>
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setSelectedDate(new Date().toISOString().split('T')[0]);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {attendanceError && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FaTimesCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load data</h3>
              <p className="text-gray-500 mb-4">
                There was an error loading the attendance records.
              </p>
              <button
                onClick={refetchAttendances}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mark Attendance Modal */}
      {showMarkAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Mark Attendance</h3>
                <p className="text-sm text-gray-600 mt-1">Record teacher attendance</p>
              </div>
              <button
                onClick={closeMarkAttendanceModal}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Teacher Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Teacher <span className="text-red-500">*</span>
                </label>
                {teachersLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <FaSpinner className="w-4 h-4 text-blue-600 animate-spin mr-2" />
                    <span className="text-gray-600">Loading teachers...</span>
                  </div>
                ) : teachersError ? (
                  <div className="text-center py-2">
                    <div className="text-red-500 mb-2 text-sm">Failed to load teachers</div>
                    <button
                      onClick={refetchTeachers}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <select
                    name="teacherId"
                    value={attendanceForm.teacherId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a teacher</option>
                    {teachers.length > 0 ? (
                      teachers.map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} - {teacher.subject || "General"}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={attendanceForm.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={attendanceForm.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closeMarkAttendanceModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={markingAttendance}
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAttendance}
                disabled={markingAttendance || !attendanceForm.teacherId || teachersLoading}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Attendance Details</h3>
                <p className="text-sm text-gray-600 mt-1">Complete attendance information</p>
              </div>
              <button
                onClick={closeViewModal}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Teacher Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaUser className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {selectedAttendance.teacherId?.name || "N/A"}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {selectedAttendance.teacherId?.subject || "General Subject"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {selectedAttendance.teacherId?.email || "No email"}
                  </p>
                </div>
              </div>

              {/* Attendance Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-500 block mb-1">Date</span>
                  <p className="text-gray-900">
                    {formatDate(selectedAttendance.date)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-500 block mb-1">Status</span>
                  <div>
                    {getStatusBadge(selectedAttendance.status)}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                  <span className="font-medium text-gray-500 block mb-1">Marked By</span>
                  <p className="text-gray-900">
                    {selectedAttendance.markedBy?.name || "System Admin"}
                  </p>
                </div>
              </div>

              {/* Timestamp */}
              {selectedAttendance.createdAt && (
                <div className="text-xs text-gray-400 text-center border-t pt-3">
                  Record created on {new Date(selectedAttendance.createdAt).toLocaleString()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={closeViewModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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