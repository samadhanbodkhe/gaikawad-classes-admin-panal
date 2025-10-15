import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaStethoscope,
  FaUmbrellaBeach,
  FaHome,
  FaBriefcase,
  FaExclamationTriangle
} from "react-icons/fa";
import { useGetLeaveRequestsQuery, useProcessLeaveRequestMutation } from "../redux/apis/leaveRequestsApi";

const Leaverequest = () => {
  // State for search and UI
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState(""); // "approve" or "reject"

  // RTK Query hooks
  const { 
    data: leaveRequestsData, 
    isLoading, 
    error, 
    refetch 
  } = useGetLeaveRequestsQuery({ limit: 100 });

  const [processLeaveRequest, { isLoading: isProcessing }] = useProcessLeaveRequestMutation();

  // Transform API data
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

  // Handle approve action
  const handleApprove = async (id) => {
    if (window.confirm("Are you sure you want to approve this leave request?")) {
      try {
        await processLeaveRequest({ 
          id, 
          status: "Approved" 
        }).unwrap();
        
        alert("Leave request approved successfully!");
        refetch();
      } catch (error) {
        console.error("Failed to approve leave request:", error);
        alert("Failed to approve leave request. Please try again.");
      }
    }
  };

  // Handle reject action - opens modal for reason
  const handleReject = (id) => {
    const request = leaveRequests.find(req => req.id === id);
    setSelectedRequest(request);
    setActionType("reject");
    setShowActionModal(true);
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
        status: "Rejected",
        rejectionReason: rejectionReason // Make sure backend accepts this field
      }).unwrap();
      
      alert("Leave request rejected successfully!");
      setShowActionModal(false);
      setRejectionReason("");
      setSelectedRequest(null);
      setActionType("");
      refetch();
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

  // Filter leave requests based on search
  const filteredRequests = leaveRequests.filter(request => {
    return request.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
           request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
           request.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-2" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Get leave type badge
  const getLeaveTypeBadge = (leaveType) => {
    const typeConfig = leaveTypes[leaveType];
    if (!typeConfig) return null;
    
    const Icon = typeConfig.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeConfig.bgColor} text-${typeConfig.color}-800`}>
        <Icon className="w-4 h-4 mr-2" />
        {leaveType}
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md">
          <FaExclamationTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Data</h3>
          <p className="text-gray-600 mb-4">There was an error loading leave requests.</p>
          <button 
            onClick={refetch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Requests</h1>
          <p className="text-gray-600">Manage teacher leave applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <FaTimesCircle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Search Leave Requests
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by teacher, reason, or type..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Leave Details
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  {/* Teacher */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-blue-600 text-sm" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          {request.teacher}
                        </div>
                        <div className="text-sm text-gray-500">
                          Applied: {request.appliedOn}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Leave Details */}
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div>
                        {getLeaveTypeBadge(request.leaveType)}
                      </div>
                      <div className="text-sm text-gray-600 max-w-xs">
                        {request.reason}
                      </div>
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        {request.fromDate} to {request.toDate}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.duration} day{request.duration > 1 ? 's' : ''}
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {getStatusBadge(request.status)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end items-center gap-3">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      
                      {/* APPROVE AND REJECT BUTTONS - Only show for pending requests */}
                      {request.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={isProcessing}
                            className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve Leave"
                          >
                            <FaCheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={isProcessing}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="text-center py-16">
            <FaCalendarAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No leave requests found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? "No matching leave requests found. Try adjusting your search." 
                : "No leave requests have been submitted yet."
              }
            </p>
          </div>
        )}
      </div>

      {/* View Leave Details Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
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
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUser className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">{selectedRequest.teacher}</h4>
                  <p className="text-gray-600">Leave Application</p>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>

              {/* Leave Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">Leave Type</label>
                    {getLeaveTypeBadge(selectedRequest.leaveType)}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">Duration</label>
                    <p className="text-gray-900">{selectedRequest.duration} days</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">Applied On</label>
                    <p className="text-gray-900">{selectedRequest.appliedOn}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">From Date</label>
                    <p className="text-gray-900">{selectedRequest.fromDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">To Date</label>
                    <p className="text-gray-900">{selectedRequest.toDate}</p>
                  </div>
                  {selectedRequest.emergencyContact && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-2">Emergency Contact</label>
                      <p className="text-gray-900">{selectedRequest.emergencyContact}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-3">Reason for Leave</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900">{selectedRequest.reason}</p>
                </div>
              </div>

              {/* Documents */}
              {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-3">Attached Documents</label>
                  <div className="space-y-2">
                    {selectedRequest.documents.map((doc, index) => (
                      <div key={index} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                        📎 {doc}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedRequest.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-red-800 block mb-2">Rejection Reason</label>
                  <p className="text-red-700">{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* APPROVE AND REJECT BUTTONS IN MODAL */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              {selectedRequest.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(selectedRequest.id);
                      setShowViewModal(false);
                    }}
                    disabled={isProcessing}
                    className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={() => {
                      setActionType("reject");
                      setShowActionModal(true);
                      setShowViewModal(false);
                    }}
                    disabled={isProcessing}
                    className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {actionType === "reject" ? "Reject Leave Request" : "Confirm Action"}
              </h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                {actionType === "reject" 
                  ? `Rejecting leave request for <strong>${selectedRequest.teacher}</strong>`
                  : `Are you sure you want to ${actionType} this leave request?`
                }
              </p>
              
              {actionType === "reject" && (
                <>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Reason for rejection:
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows="4"
                  />
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setRejectionReason("");
                  setSelectedRequest(null);
                  setActionType("");
                }}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={actionType === "reject" ? handleRejectWithReason : () => {}}
                disabled={actionType === "reject" && !rejectionReason.trim()}
                className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  actionType === "reject" 
                    ? (!rejectionReason.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700')
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {actionType === "reject" ? "Confirm Rejection" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaverequest;