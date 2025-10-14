import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaExclamationTriangle,
  FaCalendarPlus,
  FaStethoscope,
  FaUmbrellaBeach,
  FaHome,
  FaBriefcase,
  FaEllipsisH,
  FaSync
} from "react-icons/fa";
import { useGetLeaveRequestsQuery, useProcessLeaveRequestMutation } from "../redux/apis/leaveRequestsApi";

// Import the hooks from your API

const Leaverequest = () => {
  // State for filters and UI
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // RTK Query hooks
  const { 
    data: leaveRequestsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetLeaveRequestsQuery({
    status: statusFilter !== "all" ? statusFilter : "",
    limit: 100 // Get all requests for stats calculation
  });

  const [processLeaveRequest] = useProcessLeaveRequestMutation();

  // Transform API data to match your frontend structure
  const leaveRequests = leaveRequestsData?.leaveRequests?.map(request => ({
    id: request._id,
    teacherId: request.teacherId?._id,
    teacher: request.teacherId?.name || "Unknown Teacher",
    fromDate: new Date(request.fromDate).toISOString().split('T')[0],
    toDate: new Date(request.toDate).toISOString().split('T')[0],
    leaveType: request.leaveType,
    reason: request.reason || "No reason provided",
    status: request.status?.toLowerCase() || "pending",
    appliedOn: new Date(request.createdAt).toISOString().split('T')[0],
    duration: Math.ceil((new Date(request.toDate) - new Date(request.fromDate)) / (1000 * 60 * 60 * 24)) + 1,
    emergencyContact: request.emergencyContact || "Not provided",
    documents: request.documents || [],
    priority: request.priority || "medium",
    rejectionReason: request.rejectionReason,
    processedOn: request.processedAt ? new Date(request.processedAt).toISOString().split('T')[0] : null
  })) || [];

  // Available teachers for reference
  const teachers = [
    { id: 1, name: "Amit Sharma", subject: "Mathematics" },
    { id: 2, name: "Priya Desai", subject: "Science" },
    { id: 3, name: "Rahul Joshi", subject: "English" },
    { id: 4, name: "Sneha Patil", subject: "History" },
    { id: 5, name: "Vikram Rao", subject: "Computer Science" }
  ];

  // Leave types with icons
  const leaveTypes = {
    "Sick": { icon: FaStethoscope, color: "red", bgColor: "bg-red-100" },
    "Personal": { icon: FaBriefcase, color: "blue", bgColor: "bg-blue-100" },
    "Vacation": { icon: FaUmbrellaBeach, color: "green", bgColor: "bg-green-100" },
    "Casual": { icon: FaHome, color: "purple", bgColor: "bg-purple-100" },
    "Emergency": { icon: FaExclamationTriangle, color: "orange", bgColor: "bg-orange-100" }
  };

  // Calculate stats from API data
  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(req => req.status === "pending").length,
    approved: leaveRequests.filter(req => req.status === "approved").length,
    rejected: leaveRequests.filter(req => req.status === "rejected").length
  };

  // Handle status change with API call
  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === "rejected") {
      setSelectedRequest(leaveRequests.find(req => req.id === id));
      setShowActionModal(true);
      return;
    }

    if (window.confirm(`Are you sure you want to ${newStatus} this leave request?`)) {
      try {
        await processLeaveRequest({ 
          id, 
          status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) 
        }).unwrap();
        
        alert(`Leave request ${newStatus} successfully!`);
        refetch(); // Refresh the data
      } catch (error) {
        console.error("Failed to process leave request:", error);
        alert("Failed to process leave request. Please try again.");
      }
    }
  };

  // Handle rejection with reason
  const handleRejectWithReason = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      await processLeaveRequest({ 
        id: selectedRequest.id, 
        status: "Rejected" 
      }).unwrap();
      
      alert("Leave request rejected successfully!");
      setShowActionModal(false);
      setRejectionReason("");
      setSelectedRequest(null);
      refetch(); // Refresh the data
    } catch (error) {
      console.error("Failed to reject leave request:", error);
      alert("Failed to reject leave request. Please try again.");
    }
  };

  // View leave details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  // Filter leave requests based on search and filters
  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = request.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.leaveType === typeFilter;
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: FaClock },
      approved: { color: "bg-green-100 text-green-800", icon: FaCheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: FaTimesCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { color: "bg-red-100 text-red-800", label: "High" },
      medium: { color: "bg-yellow-100 text-yellow-800", label: "Medium" },
      low: { color: "bg-blue-100 text-blue-800", label: "Low" }
    };
    
    const config = priorityConfig[priority] || priorityConfig.medium;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Get leave type badge
  const getLeaveTypeBadge = (leaveType) => {
    const typeConfig = leaveTypes[leaveType];
    if (!typeConfig) return null;
    
    const Icon = typeConfig.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.bgColor} text-${typeConfig.color}-800`}>
        <Icon className="w-3 h-3 mr-1" />
        {leaveType}
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSync className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Failed to load leave requests</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leave Requests Management</h1>
            <p className="text-gray-600 mt-2">Manage and review all teacher leave applications</p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaSync className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatusFilter("all")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatusFilter("pending")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatusFilter("approved")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatusFilter("rejected")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <FaTimesCircle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by teacher, reason..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Status Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Type Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Sick">Sick</option>
              <option value="Personal">Personal</option>
              <option value="Vacation">Vacation</option>
              <option value="Casual">Casual</option>
              <option value="Emergency">Emergency</option>
            </select>

            {/* Priority Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher & Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Information
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration & Dates
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Priority
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  {/* Teacher & Details */}
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-blue-600 text-sm" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.teacher}
                        </div>
                        <div className="text-sm text-gray-500">
                          Applied: {request.appliedOn}
                        </div>
                        {request.emergencyContact && (
                          <div className="text-xs text-gray-400">
                            Contact: {request.emergencyContact}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Leave Information */}
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <div>
                        {getLeaveTypeBadge(request.leaveType)}
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {request.reason}
                      </div>
                      {request.documents && request.documents.length > 0 && (
                        <div className="text-xs text-blue-600">
                          {request.documents.length} document(s) attached
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Duration & Dates */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <FaCalendarPlus className="text-gray-400 text-xs" />
                        {request.fromDate} to {request.toDate}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.duration} day{request.duration > 1 ? 's' : ''}
                      </div>
                      {request.processedOn && (
                        <div className="text-xs text-gray-400">
                          Processed: {request.processedOn}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status & Priority */}
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      {getStatusBadge(request.status)}
                      {getPriorityBadge(request.priority)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(request.id, "approved")}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Approve Leave"
                          >
                            <FaCheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(request.id, "rejected")}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Reject Leave"
                          >
                            <FaTimesCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <FaCalendarAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No leave requests found</p>
            <p className="text-gray-400 mt-2">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all" || priorityFilter !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "No leave requests have been submitted yet"}
            </p>
          </div>
        )}
      </div>

      {/* View Leave Details Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Leave Request Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimesCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Teacher Information */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUser className="text-blue-600 text-2xl" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-xl">{selectedRequest.teacher}</h4>
                  <p className="text-gray-600">Leave Application</p>
                </div>
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="font-medium text-gray-500 block">Status</span>
                  <div className="mt-1">
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="font-medium text-gray-500 block">Priority</span>
                  <div className="mt-1">
                    {getPriorityBadge(selectedRequest.priority)}
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-3">LEAVE INFORMATION</h5>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-gray-400">Leave Type</span>
                      <div className="mt-1">
                        {getLeaveTypeBadge(selectedRequest.leaveType)}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-400">Duration</span>
                      <p className="text-sm text-gray-900">{selectedRequest.duration} days</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-400">Applied On</span>
                      <p className="text-sm text-gray-900">{selectedRequest.appliedOn}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-3">DATES</h5>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-gray-400">From Date</span>
                      <p className="text-sm text-gray-900">{selectedRequest.fromDate}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-400">To Date</span>
                      <p className="text-sm text-gray-900">{selectedRequest.toDate}</p>
                    </div>
                    {selectedRequest.processedOn && (
                      <div>
                        <span className="text-xs font-medium text-gray-400">Processed On</span>
                        <p className="text-sm text-gray-900">{selectedRequest.processedOn}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <h5 className="text-sm font-medium text-gray-500 mb-3">REASON FOR LEAVE</h5>
                <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {selectedRequest.reason}
                </p>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedRequest.emergencyContact && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 mb-3">EMERGENCY CONTACT</h5>
                    <p className="text-sm text-gray-900">{selectedRequest.emergencyContact}</p>
                  </div>
                )}
                
                {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 mb-3">ATTACHED DOCUMENTS</h5>
                    <div className="space-y-1">
                      {selectedRequest.documents.map((doc, index) => (
                        <div key={index} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                          📎 {doc}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rejection Reason */}
              {selectedRequest.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-red-800 mb-2">REJECTION REASON</h5>
                  <p className="text-sm text-red-700">{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              {selectedRequest.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedRequest.id, "approved");
                      setShowViewModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve Leave
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(selectedRequest);
                      setShowActionModal(true);
                      setShowViewModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject Leave
                  </button>
                </>
              )}
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Reject Leave Request
              </h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  You are rejecting leave request for <strong>{selectedRequest.teacher}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Please provide a reason for rejection:
                </p>
              </div>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
              />
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setRejectionReason("");
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectWithReason}
                disabled={!rejectionReason.trim()}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  !rejectionReason.trim() 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Reject Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaverequest;