import React, { useState, useMemo } from "react";
import { useGetAllStudentsQuery } from "../redux/apis/studentApi";

const Student = () => {
  const { data, isLoading, isError, error, refetch } = useGetAllStudentsQuery();
  const students = data?.data || [];

  const [query, setQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

  // Get all unique class names
  const classes = useMemo(() => {
    const setC = new Set(students.map((s) => s.className || "Unknown"));
    return ["All", ...Array.from(setC).sort()];
  }, [students]);

  // Filter + search logic
  const filteredStudents = useMemo(() => {
    let arr = [...students];
    if (selectedClass !== "All") {
      arr = arr.filter((s) => s.className === selectedClass);
    }
    if (query) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(q) ||
          (s.rollNumber || "").toString().includes(q) ||
          (s.parentName || "").toLowerCase().includes(q)
      );
    }
    if (sortBy === "name") {
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else {
      arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return arr;
  }, [students, selectedClass, query, sortBy]);

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">Student Management</h1>
            <p className="text-sm text-gray-500">Admin view — all classes, students & fees details</p>
          </div>
          <button
            onClick={() => refetch()}
            className="mt-4 sm:mt-0 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
          >
            Refresh
          </button>
        </header>

        {/* Filters */}
        <section className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <input
              type="text"
              placeholder="🔍 Search by name, roll no. or parent"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-200"
            />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Student Cards */}
        {isLoading ? (
          <div className="p-10 text-center bg-white rounded-lg shadow">Loading students...</div>
        ) : isError ? (
          <div className="p-6 bg-red-100 border border-red-200 rounded text-red-700">
            Error loading data: {String(error?.data || error?.message)}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-lg shadow">No students found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((s) => (
              <div
                key={s._id}
                className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelectedStudent(s)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{s.name}</h3>
                  <span className="text-sm text-gray-500">Roll: {s.rollNumber}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <strong>Class:</strong> {s.className} {s.section ? `(${s.section})` : ""}
                  </div>
                  <div>
                    <strong>Parent:</strong> {s.parentName}
                  </div>
                  <div>
                    <strong>Contact:</strong> {s.contactNumber}
                  </div>
                  <div>
                    <strong>Fees:</strong> {s.fees?.paymentStatus} — ₹
                    {s.fees?.pendingAmount ?? 0} pending
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Admission: {formatDate(s.admissionDate)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Student Details Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Student Details</h2>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-600 hover:text-gray-900 text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Info label="Name" value={selectedStudent.name} />
                  <Info label="Roll Number" value={selectedStudent.rollNumber} />
                  <Info
                    label="Class"
                    value={`${selectedStudent.className || "-"} ${
                      selectedStudent.section ? `(${selectedStudent.section})` : ""
                    }`}
                  />
                  <Info
                    label="Admission Date"
                    value={formatDate(selectedStudent.admissionDate)}
                  />
                  <Info label="Parent Name" value={selectedStudent.parentName} />
                  <Info label="Contact" value={selectedStudent.contactNumber} />
                  <Info label="Gender" value={selectedStudent.gender} />
                  <div className="md:col-span-2">
                    <Info label="Address" value={selectedStudent.address} />
                  </div>
                </div>

                <hr className="my-3" />

                <div>
                  <h3 className="text-lg font-semibold mb-2">Fee Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Info label="Total Amount" value={`₹${selectedStudent.fees?.totalAmount ?? 0}`} />
                    <Info label="Paid Amount" value={`₹${selectedStudent.fees?.paidAmount ?? 0}`} />
                    <Info
                      label="Pending Amount"
                      value={`₹${selectedStudent.fees?.pendingAmount ?? 0}`}
                    />
                  </div>
                  <div className="text-sm mt-2">
                    <strong>Status:</strong> {selectedStudent.fees?.paymentStatus ?? "-"} <br />
                    <strong>Last Payment:</strong>{" "}
                    {selectedStudent.fees?.lastPaymentDate
                      ? new Date(selectedStudent.fees.lastPaymentDate).toLocaleString()
                      : "-"}
                  </div>
                </div>

                <hr className="my-3" />

                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <strong>Created At:</strong>{" "}
                    {selectedStudent.createdAt
                      ? new Date(selectedStudent.createdAt).toLocaleString()
                      : "-"}
                  </div>
                  <div>
                    <strong>Updated At:</strong>{" "}
                    {selectedStudent.updatedAt
                      ? new Date(selectedStudent.updatedAt).toLocaleString()
                      : "-"}
                  </div>
                  <div>
                    <strong>Teacher:</strong>{" "}
                    {selectedStudent.teacherId?.name ?? selectedStudent.teacherId ?? "-"}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t flex justify-end">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ Small reusable info block
const Info = ({ label, value }) => (
  <div>
    <div className="text-xs text-gray-500">{label}</div>
    <div className="font-medium text-gray-800">{value || "-"}</div>
  </div>
);

export default Student;
