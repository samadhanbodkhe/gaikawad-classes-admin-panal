import React, { useState } from "react";
import {
  useGetPendingTeachersQuery,
  useGetAllTeachersQuery,
  useGetTeacherDetailsQuery,
  useApproveTeacherMutation,
  useRejectTeacherMutation,
} from "../redux/apis/teacherApproveRejectApi";
import { toast } from "react-toastify";
import { Eye, CheckCircle, XCircle, Users, Loader2, AlertCircle, FileText } from "lucide-react";
import Modal from "../components/Modal";

const TeacherAR = () => {
  const { data: pendingData = [], isLoading: loadingPending } = useGetPendingTeachersQuery();
  const { data: allTeachers = [], isLoading: loadingAll, refetch } = useGetAllTeachersQuery();
  const [approveTeacher] = useApproveTeacherMutation();
  const [rejectTeacher] = useRejectTeacherMutation();
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  const {
    data: teacherDetails,
    isFetching: loadingDetails,
  } = useGetTeacherDetailsQuery(selectedTeacherId, {
    skip: !selectedTeacherId,
  });

  const handleApprove = async (id) => {
    if (window.confirm("Are you sure you want to approve this teacher?")) {
      try {
        await approveTeacher(id).unwrap();
        toast.success("Teacher approved successfully!");
        refetch();
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
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to reject teacher.");
      }
    }
  };

  // Format subjects for display
  const formatSubjects = (subjects) => {
    if (!subjects) return "Not specified";
    if (Array.isArray(subjects)) {
      return subjects.join(", ");
    }
    return subjects;
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
  const approvedTeachers = allTeachers.filter((t) => t.isApproved);
  const rejectedTeachers = allTeachers.filter((t) => t.isRejected || t.status === "rejected");

  const stats = {
    total: allTeachers.length,
    approved: approvedTeachers.length,
    pending: pendingData.length,
    rejected: rejectedTeachers.length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Users className="text-blue-600" /> Teacher Management
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(stats).map(([key, value]) => (
          <div
            key={key}
            className="bg-white shadow rounded-xl p-4 text-center hover:shadow-lg transition-all"
          >
            <p className="text-gray-500 capitalize">{key}</p>
            <h2 className="text-2xl font-bold text-blue-700">{value}</h2>
          </div>
        ))}
      </div>

      {/* Pending Requests */}
      <section>
        <h2 className="text-xl font-semibold mb-3 text-yellow-600 flex items-center gap-2">
          <AlertCircle /> Pending Requests ({pendingData.length})
        </h2>
        {pendingData.length === 0 ? (
          <p className="text-gray-500 italic">No pending teacher requests.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Mobile</th>
                  <th className="p-3 text-left">Qualification</th>
                  <th className="p-3 text-left">Subjects</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingData.map((t) => (
                  <tr key={t._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3 font-medium">{t.name}</td>
                    <td className="p-3">{t.email}</td>
                    <td className="p-3">{t.mobile}</td>
                    <td className="p-3">{t.qualification || "Not specified"}</td>
                    <td className="p-3">{formatSubjects(t.subjects)}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => setSelectedTeacherId(t._id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1 text-sm"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => handleApprove(t._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(t._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Approved Teachers */}
      <section>
        <h2 className="text-xl font-semibold mb-3 text-green-700 flex items-center gap-2">
          <CheckCircle /> Approved Teachers ({approvedTeachers.length})
        </h2>
        {approvedTeachers.length === 0 ? (
          <p className="text-gray-500 italic">No approved teachers yet.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Mobile</th>
                  <th className="p-3 text-left">Qualification</th>
                  <th className="p-3 text-left">Subjects</th>
                  <th className="p-3 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {approvedTeachers.map((t) => (
                  <tr key={t._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{t.name}</td>
                    <td className="p-3">{t.email}</td>
                    <td className="p-3">{t.mobile}</td>
                    <td className="p-3">{t.qualification || "Not specified"}</td>
                    <td className="p-3">{formatSubjects(t.subjects)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedTeacherId(t._id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1 text-sm"
                      >
                        <Eye size={14} /> View
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
      <section>
        <h2 className="text-xl font-semibold mb-3 text-red-700 flex items-center gap-2">
          <XCircle /> Rejected Teachers ({rejectedTeachers.length})
        </h2>
        {rejectedTeachers.length === 0 ? (
          <p className="text-gray-500 italic">No rejected teachers.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Mobile</th>
                  <th className="p-3 text-left">Qualification</th>
                  <th className="p-3 text-left">Subjects</th>
                </tr>
              </thead>
              <tbody>
                {rejectedTeachers.map((t) => (
                  <tr key={t._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{t.name}</td>
                    <td className="p-3">{t.email}</td>
                    <td className="p-3">{t.mobile}</td>
                    <td className="p-3">{t.qualification || "Not specified"}</td>
                    <td className="p-3">{formatSubjects(t.subjects)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Teacher Details Modal */}
      {selectedTeacherId && (
        <Modal onClose={() => setSelectedTeacherId(null)}>
          {loadingDetails ? (
            <div className="flex justify-center p-6">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                Teacher Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-lg font-semibold">{teacherDetails?.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg">{teacherDetails?.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Mobile</label>
                  <p className="text-lg">{teacherDetails?.mobile}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Qualification</label>
                  <p className="text-lg">{teacherDetails?.qualification || "Not specified"}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600">Subjects</label>
                  <p className="text-lg">{formatSubjects(teacherDetails?.subjects)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Salary Type</label>
                  <p className="text-lg capitalize">{teacherDetails?.salaryType}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Base Salary</label>
                  <p className="text-lg">₹{teacherDetails?.baseSalary || 0}</p>
                </div>
              </div>

              {/* Documents Section */}
              <div className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                  <FileText size={16} /> Documents
                </label>
                {teacherDetails?.documents?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {teacherDetails.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">
                          Document {index + 1}
                        </span>
                        <a
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic bg-gray-50 p-3 rounded-lg">
                    No documents uploaded.
                  </p>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default TeacherAR;