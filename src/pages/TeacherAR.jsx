import React, { useState } from "react";
import {
  useGetPendingTeachersQuery,
  useGetAllTeachersQuery,
  useGetTeacherDetailsQuery,
  useApproveTeacherMutation,
  useRejectTeacherMutation,
} from "../redux/apis/teacherApproveRejectApi";
import { toast } from "react-toastify";
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Users, 
  Loader2, 
  AlertCircle, 
  FileText, 
  X,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  DollarSign
} from "lucide-react";

const TeacherAR = () => {
  const { data: pendingData = [], isLoading: loadingPending, refetch: refetchPending } = useGetPendingTeachersQuery();
  const { data: allTeachers = [], isLoading: loadingAll, refetch: refetchAll } = useGetAllTeachersQuery();
  const [approveTeacher] = useApproveTeacherMutation();
  const [rejectTeacher] = useRejectTeacherMutation();
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const {
    data: teacherDetails,
    isFetching: loadingDetails,
    refetch: refetchDetails
  } = useGetTeacherDetailsQuery(selectedTeacherId, {
    skip: !selectedTeacherId,
  });

  const handleApprove = async (id) => {
    if (window.confirm("Are you sure you want to approve this teacher?")) {
      try {
        await approveTeacher(id).unwrap();
        toast.success("Teacher approved successfully!");
        refetchPending();
        refetchAll();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to approve teacher.");
      }
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      try {
        await rejectTeacher({ id, reason }).unwrap();
        toast.info("Teacher rejected successfully and notified via email!");
        refetchPending();
        refetchAll();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to reject teacher.");
      }
    }
  };

  const handleViewDetails = async (teacherId) => {
    setSelectedTeacherId(teacherId);
    setShowDetailsModal(true);
    // Refetch details to ensure fresh data
    setTimeout(() => {
      refetchDetails();
    }, 100);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTeacherId(null);
  };

  // Format subjects for display - handle all possible formats
  const formatSubjects = (subjects) => {
    if (!subjects || subjects.length === 0) return "Not specified";
    
    if (Array.isArray(subjects)) {
      return subjects.join(", ");
    }
    
    if (typeof subjects === 'string') {
      // Handle stringified array
      if (subjects.startsWith('[') || subjects.startsWith('"[')) {
        try {
          const cleanedString = subjects.replace(/^"|"$/g, '').replace(/\\"/g, '"');
          const parsed = JSON.parse(cleanedString);
          if (Array.isArray(parsed)) {
            return parsed.join(", ");
          }
          return subjects;
        } catch (error) {
          return subjects;
        }
      }
      return subjects;
    }
    
    return String(subjects);
  };

  // Get file name from URL
  const getFileNameFromUrl = (url) => {
    if (!url) return "Document";
    try {
      return url.split('/').pop() || "Document";
    } catch {
      return "Document";
    }
  };

  if (loadingPending || loadingAll) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <Loader2 className="w-10 h-10 animate-spin mb-2" />
        <p>Loading teacher data...</p>
      </div>
    );
  }

  // Categorize teachers
  const approvedTeachers = allTeachers.filter((t) => t.isApproved && !t.isRejected);
  const rejectedTeachers = allTeachers.filter((t) => t.isRejected || t.status === "rejected");
  const pendingTeachers = pendingData.filter((t) => t.status === "pending");

  const stats = {
    total: allTeachers.length + pendingTeachers.length,
    approved: approvedTeachers.length,
    pending: pendingTeachers.length,
    rejected: rejectedTeachers.length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Users className="text-blue-600" /> Teacher Management
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total", value: stats.total, color: "bg-blue-500" },
          { label: "Approved", value: stats.approved, color: "bg-green-500" },
          { label: "Pending", value: stats.pending, color: "bg-yellow-500" },
          { label: "Rejected", value: stats.rejected, color: "bg-red-500" },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                <h2 className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</h2>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`}>
                <Users className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Requests */}
      <section className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
          <h2 className="text-xl font-semibold text-yellow-800 flex items-center gap-2">
            <AlertCircle size={20} /> 
            Pending Approval Requests 
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-sm">
              {pendingTeachers.length}
            </span>
          </h2>
        </div>
        
        {pendingTeachers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AlertCircle className="mx-auto mb-3 text-gray-400" size={48} />
            <p>No pending teacher requests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Teacher</th>
                  <th className="px-6 py-4 text-left font-semibold">Contact</th>
                  <th className="px-6 py-4 text-left font-semibold">Qualification</th>
                  <th className="px-6 py-4 text-left font-semibold">Subjects</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingTeachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{teacher.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-gray-400" />
                          {teacher.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-gray-400" />
                          {teacher.mobile}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={16} className="text-gray-400" />
                        {teacher.qualification || "Not specified"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-gray-400" />
                        {formatSubjects(teacher.subjects)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(teacher._id)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Eye size={16} /> Details
                        </button>
                        <button
                          onClick={() => handleApprove(teacher._id)}
                          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(teacher._id)}
                          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Approved Teachers */}
      <section className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-green-50 px-6 py-4 border-b border-green-200">
          <h2 className="text-xl font-semibold text-green-800 flex items-center gap-2">
            <CheckCircle size={20} /> 
            Approved Teachers 
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
              {approvedTeachers.length}
            </span>
          </h2>
        </div>
        
        {approvedTeachers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle className="mx-auto mb-3 text-gray-400" size={48} />
            <p>No approved teachers yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Teacher</th>
                  <th className="px-6 py-4 text-left font-semibold">Contact</th>
                  <th className="px-6 py-4 text-left font-semibold">Qualification</th>
                  <th className="px-6 py-4 text-left font-semibold">Subjects</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {approvedTeachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{teacher.name}</div>
                        <div className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle size={12} />
                          Approved
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-gray-400" />
                          {teacher.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-gray-400" />
                          {teacher.mobile}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={16} className="text-gray-400" />
                        {teacher.qualification || "Not specified"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-gray-400" />
                        {formatSubjects(teacher.subjects)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(teacher._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Eye size={16} /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Rejected Teachers */}
      <section className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-red-50 px-6 py-4 border-b border-red-200">
          <h2 className="text-xl font-semibold text-red-800 flex items-center gap-2">
            <XCircle size={20} /> 
            Rejected Teachers 
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
              {rejectedTeachers.length}
            </span>
          </h2>
        </div>
        
        {rejectedTeachers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <XCircle className="mx-auto mb-3 text-gray-400" size={48} />
            <p>No rejected teachers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Teacher</th>
                  <th className="px-6 py-4 text-left font-semibold">Contact</th>
                  <th className="px-6 py-4 text-left font-semibold">Qualification</th>
                  <th className="px-6 py-4 text-left font-semibold">Subjects</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rejectedTeachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{teacher.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">{teacher.email}</div>
                        <div className="text-sm text-gray-600">{teacher.mobile}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {teacher.qualification || "Not specified"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatSubjects(teacher.subjects)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        <XCircle size={12} className="mr-1" />
                        Rejected
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Teacher Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="text-blue-600" />
                Teacher Details
              </h3>
              <button
                onClick={closeDetailsModal}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {loadingDetails ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : teacherDetails ? (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="text-blue-600" size={24} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Full Name</div>
                          <div className="text-lg font-semibold text-gray-900">{teacherDetails.name}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Mail className="text-green-600" size={24} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Email</div>
                          <div className="text-lg font-semibold text-gray-900">{teacherDetails.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Phone className="text-purple-600" size={24} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Mobile</div>
                          <div className="text-lg font-semibold text-gray-900">{teacherDetails.mobile}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="text-orange-600" size={24} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Qualification</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {teacherDetails.qualification || "Not specified"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="text-indigo-600" size={24} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Subjects</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {formatSubjects(teacherDetails.subjects)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="text-emerald-600" size={24} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Salary</div>
                          <div className="text-lg font-semibold text-gray-900">
                            ₹{teacherDetails.baseSalary || 0}
                          </div>
                          <div className="text-sm text-gray-600 capitalize">
                            {teacherDetails.salaryType || "fixed"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="text-gray-600" size={20} />
                      Documents
                      {teacherDetails.documents && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                          {teacherDetails.documents.length} files
                        </span>
                      )}
                    </h4>

                    {teacherDetails.documents && teacherDetails.documents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teacherDetails.documents.map((documentUrl, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">
                                  {getFileNameFromUrl(documentUrl).charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Doc {index + 1}
                              </span>
                            </div>
                            <div className="mb-3">
                              <div className="font-medium text-gray-900 text-sm truncate">
                                {getFileNameFromUrl(documentUrl)}
                              </div>
                            </div>
                            <a 
                              href={documentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              View Document
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                        <FileText className="mx-auto mb-3 text-gray-400" size={48} />
                        <div className="text-gray-500">No documents uploaded</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="mx-auto mb-3" size={48} />
                  <p>Failed to load teacher details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherAR;