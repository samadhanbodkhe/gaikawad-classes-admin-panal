import React, { useState } from "react";
import {
  FaSearch,
  FaClock,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaCalendarPlus,
  FaStethoscope,
  FaUmbrellaBeach,
  FaHome,
  FaBriefcase,
  FaSync,
} from "react-icons/fa";
import {
  useGetLeaveRequestsQuery,
  useProcessLeaveRequestMutation,
} from "../redux/apis/leaveRequestsApi";

const Leaverequest = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const {
    data: leaveRequestsData,
    isLoading,
    error,
    refetch,
  } = useGetLeaveRequestsQuery({
    status: statusFilter !== "all" ? statusFilter : "",
    limit: 100,
  });

  const [processLeaveRequest] = useProcessLeaveRequestMutation();

  const leaveRequests =
    leaveRequestsData?.leaveRequests?.map((request) => ({
      id: request._id,
      teacher: request.teacherId?.name || "Unknown Teacher",
      fromDate: new Date(request.fromDate).toISOString().split("T")[0],
      toDate: new Date(request.toDate).toISOString().split("T")[0],
      leaveType: request.leaveType,
      reason: request.reason || "No reason provided",
      status: request.status?.toLowerCase() || "pending",
      appliedOn: new Date(request.createdAt).toISOString().split("T")[0],
      duration:
        Math.ceil(
          (new Date(request.toDate) - new Date(request.fromDate)) /
            (1000 * 60 * 60 * 24)
        ) + 1,
      emergencyContact: request.emergencyContact || "Not provided",
      documents: request.documents || [],
      priority: request.priority || "medium",
      rejectionReason: request.rejectionReason,
      processedOn: request.processedAt
        ? new Date(request.processedAt).toISOString().split("T")[0]
        : null,
    })) || [];

  const leaveTypes = {
    Sick: { icon: FaStethoscope, color: "red", bgColor: "bg-red-100" },
    Personal: { icon: FaBriefcase, color: "blue", bgColor: "bg-blue-100" },
    Vacation: { icon: FaUmbrellaBeach, color: "green", bgColor: "bg-green-100" },
    Casual: { icon: FaHome, color: "purple", bgColor: "bg-purple-100" },
    Emergency: { icon: FaExclamationTriangle, color: "orange", bgColor: "bg-orange-100" },
  };

  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter((r) => r.status === "pending").length,
    approved: leaveRequests.filter((r) => r.status === "approved").length,
    rejected: leaveRequests.filter((r) => r.status === "rejected").length,
  };

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === "rejected") {
      setSelectedRequest(leaveRequests.find((r) => r.id === id));
      setShowActionModal(true);
      return;
    }

    if (window.confirm(`Are you sure you want to ${newStatus} this leave request?`)) {
      try {
        await processLeaveRequest({ id, status: newStatus }).unwrap();
        alert(`Leave request ${newStatus} successfully!`);
        refetch();
      } catch (err) {
        console.error("Error:", err);
        alert("Failed to process leave request.");
      }
    }
  };

  const handleRejectWithReason = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      await processLeaveRequest({
        id: selectedRequest.id,
        status: "Rejected",
        rejectionReason,
      }).unwrap();

      alert("Leave request rejected successfully!");
      setShowActionModal(false);
      setRejectionReason("");
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to reject leave request.");
    }
  };

  const filteredRequests = leaveRequests.filter((req) => {
    const searchMatch =
      req.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === "all" || req.status === statusFilter;
    const typeMatch = typeFilter === "all" || req.leaveType === typeFilter;
    const priorityMatch = priorityFilter === "all" || req.priority === priorityFilter;
    return searchMatch && statusMatch && typeMatch && priorityMatch;
  });

  const getStatusBadge = (status) => {
    const map = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: FaClock },
      approved: { color: "bg-green-100 text-green-800", icon: FaCheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: FaTimesCircle },
    };
    const cfg = map[status] || map.pending;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
        <Icon className="w-3 h-3 mr-1" /> {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Failed to load requests</div>;

  return (
    <div className="p-4">
      {/* Stats Header */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg text-center cursor-pointer" onClick={() => setStatusFilter("all")}>
          <p>Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg text-center cursor-pointer" onClick={() => setStatusFilter("pending")}>
          <p>Pending</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg text-center cursor-pointer" onClick={() => setStatusFilter("approved")}>
          <p>Approved</p>
          <p className="text-2xl font-bold">{stats.approved}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg text-center cursor-pointer" onClick={() => setStatusFilter("rejected")}>
          <p>Rejected</p>
          <p className="text-2xl font-bold">{stats.rejected}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">Teacher</th>
              <th className="px-4 py-3">Leave Type</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{r.teacher}</td>
                <td className="px-4 py-3">{r.leaveType}</td>
                <td className="px-4 py-3">{r.fromDate} → {r.toDate}</td>
                <td className="px-4 py-3">{getStatusBadge(r.status)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleStatusChange(r.id, "approved")}
                    className="text-green-600 hover:text-green-800 mr-2"
                  >
                    <FaCheckCircle />
                  </button>
                  <button
                    onClick={() => handleStatusChange(r.id, "rejected")}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTimesCircle />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRequests.length === 0 && (
          <div className="text-center py-10 text-gray-500">No leave requests found</div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="font-semibold text-lg">Reject Leave</h2>
              <button onClick={() => setShowActionModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm mb-2 text-gray-700">
                Rejecting leave request for <strong>{selectedRequest.teacher}</strong>
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectWithReason}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaverequest;
