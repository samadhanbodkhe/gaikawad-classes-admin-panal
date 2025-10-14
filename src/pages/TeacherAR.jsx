import React, { useState } from "react";
import {
  useGetPendingTeachersQuery,
  useGetAllTeachersQuery,
  useGetTeacherDetailsQuery,
  useApproveTeacherMutation,
  useRejectTeacherMutation,
} from "../redux/apis/teacherApproveRejectApi";
import { toast } from "react-toastify";
import { Eye, CheckCircle, XCircle, Users, Loader2, AlertCircle } from "lucide-react";
import Modal from "../components/Modal";

const TeacherAR = () => {
  const { data: pendingData = [], isLoading: loadingPending } = useGetPendingTeachersQuery();
  console.log("dfsdf",pendingData);
  
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
        await rejectTeacher(id).unwrap();
        toast.info("Teacher rejected successfully and notified via email!");
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to reject teacher.");
      }
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

  // categorize
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
          <AlertCircle /> Pending Requests
        </h2>
        {pendingData.length === 0 ? (
          <p className="text-gray-500 italic">No pending teacher requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Mobile</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingData.map((t) => (
                  <tr key={t._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3">{t.name}</td>
                    <td className="p-3">{t.email}</td>
                    <td className="p-3">{t.mobile}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => setSelectedTeacherId(t._id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Eye size={16} /> View
                      </button>
                      <button
                        onClick={() => handleApprove(t._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(t._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
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
          <CheckCircle /> Approved Teachers
        </h2>
        {approvedTeachers.length === 0 ? (
          <p className="text-gray-500 italic">No approved teachers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Qualification</th>
                  <th className="p-3 text-left">Subjects</th>
                  <th className="p-3 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {approvedTeachers.map((t) => (
                  <tr key={t._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{t.name}</td>
                    <td className="p-3">{t.email}</td>
                    <td className="p-3">{t.qualification}</td>
                    <td className="p-3">
                      {Array.isArray(t.subjects) ? t.subjects.join(", ") : t.subjects}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedTeacherId(t._id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <Eye size={16} /> View
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
          <XCircle /> Rejected Teachers
        </h2>
        {rejectedTeachers.length === 0 ? (
          <p className="text-gray-500 italic">No rejected teachers.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Mobile</th>
                </tr>
              </thead>
              <tbody>
                {rejectedTeachers.map((t) => (
                  <tr key={t._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{t.name}</td>
                    <td className="p-3">{t.email}</td>
                    <td className="p-3">{t.mobile}</td>
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
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {teacherDetails?.name}
              </h3>
              <p><b>Email:</b> {teacherDetails?.email}</p>
              <p><b>Mobile:</b> {teacherDetails?.mobile}</p>
              <p><b>Qualification:</b> {teacherDetails?.qualification}</p>
              <p><b>Subjects:</b> {teacherDetails?.subjects?.join(", ")}</p>
              <p><b>Salary Type:</b> {teacherDetails?.salaryType}</p>
              <p><b>Base Salary:</b> ₹{teacherDetails?.baseSalary}</p>
              <div>
                <b>Documents:</b>
                {teacherDetails?.documents?.length ? (
                  <ul className="list-disc ml-6 mt-2">
                    {teacherDetails.documents.map((doc, i) => (
                      <li key={i}>
                        <a
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View Document {i + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No documents uploaded.</p>
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
