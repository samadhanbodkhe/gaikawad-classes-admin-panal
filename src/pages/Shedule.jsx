import React, { useState, useEffect } from "react";
import {
  useGetAllSchedulesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useGetAllTeachersQuery,
} from "../redux/apis/scheduleApi";
import { Loader2, Edit, Trash2, PlusCircle, Info } from "lucide-react";
import { toast } from "react-toastify";

// Helper function to format date in IST
const formatIST = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
};

// Helper to get current date-time in correct format for datetime-local input
const getCurrentDateTimeForInput = () => {
  const now = new Date();
  // Convert to local time string in correct format
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function Schedule() {
  const { data: schedulesData, isLoading: loadingSchedules, refetch } = useGetAllSchedulesQuery();
  const { data: teachersData, isLoading: loadingTeachers } = useGetAllTeachersQuery();

  const [createSchedule, { isLoading: creating }] = useCreateScheduleMutation();
  const [updateSchedule, { isLoading: updating }] = useUpdateScheduleMutation();
  const [deleteSchedule, { isLoading: deleting }] = useDeleteScheduleMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const [formData, setFormData] = useState({
    teacherId: "",
    batchName: "",
    subject: "",
    startTime: getCurrentDateTimeForInput(),
    endTime: getCurrentDateTimeForInput(),
    mode: "offline",
    room: "",
  });

  useEffect(() => {
    if (teachersData?.length) {
      setSelectedTeacher("");
    }
  }, [teachersData]);

  const openModal = (schedule = null) => {
    setEditingSchedule(schedule);
    if (schedule) {
      // For editing, use the original UTC times - they will be converted to local by the input
      setFormData({
        teacherId: schedule.teacherId?._id || "",
        batchName: schedule.batchName,
        subject: schedule.subject,
        startTime: schedule.startTime ? new Date(schedule.startTime).toISOString().slice(0, 16) : "",
        endTime: schedule.endTime ? new Date(schedule.endTime).toISOString().slice(0, 16) : "",
        mode: schedule.mode,
        room: schedule.room || "",
      });
    } else {
      setFormData({
        teacherId: "",
        batchName: "",
        subject: "",
        startTime: getCurrentDateTimeForInput(),
        endTime: getCurrentDateTimeForInput(),
        mode: "offline",
        room: "",
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await updateSchedule({ id: editingSchedule._id, ...formData }).unwrap();
        toast.success("Schedule updated successfully!");
      } else {
        await createSchedule(formData).unwrap();
        toast.success("Schedule created successfully!");
      }
      refetch();
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      try {
        await deleteSchedule(id).unwrap();
        toast.success("Schedule deleted successfully!");
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete schedule!");
      }
    }
  };

  if (loadingSchedules || loadingTeachers)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📅 All Schedules</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <PlusCircle className="w-5 h-5" /> Add Schedule
        </button>
      </div>

      {/* Teacher selector */}
      <div className="mb-4">
        <label className="font-medium">Select Teacher:</label>
        <select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="border p-2 rounded w-full max-w-xs"
        >
          <option value="">-- All Teachers --</option>
          {teachersData?.map((teacher) => (
            <option key={teacher._id} value={teacher._id}>
              {teacher.name}
            </option>
          ))}
        </select>
      </div>

      {/* Schedule Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Teacher</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Batch</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">Start Time (IST)</th>
              <th className="p-3 text-left">End Time (IST)</th>
              <th className="p-3 text-left">Mode</th>
              <th className="p-3 text-left">Room</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(schedulesData?.schedules || [])
              .filter((sch) => !selectedTeacher || sch.teacherId?._id === selectedTeacher)
              .map((s) => (
                <tr key={s._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{s.teacherId?.name}</td>
                  <td className="p-3">{s.teacherId?.email}</td>
                  <td className="p-3">{s.batchName}</td>
                  <td className="p-3">{s.subject}</td>
                  <td className="p-3">{s.startTimeIST || formatIST(s.startTime)}</td>
                  <td className="p-3">{s.endTimeIST || formatIST(s.endTime)}</td>
                  <td className="p-3 capitalize">{s.mode}</td>
                  <td className="p-3">{s.room || "-"}</td>
                  <td className="p-3 flex gap-3">
                    <button
                      onClick={() => {
                        setDetailModalOpen(true);
                        setEditingSchedule(s);
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Info size={18} />
                    </button>
                    <button
                      onClick={() => openModal(s)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detailModalOpen && editingSchedule && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Schedule Details</h2>
            <p>
              <strong>Teacher:</strong> {editingSchedule.teacherId?.name}
            </p>
            <p>
              <strong>Email:</strong> {editingSchedule.teacherId?.email}
            </p>
            <p>
              <strong>Batch:</strong> {editingSchedule.batchName}
            </p>
            <p>
              <strong>Subject:</strong> {editingSchedule.subject}
            </p>
            <p>
              <strong>Start Time:</strong>{" "}
              {editingSchedule.startTimeIST || formatIST(editingSchedule.startTime)}
            </p>
            <p>
              <strong>End Time:</strong>{" "}
              {editingSchedule.endTimeIST || formatIST(editingSchedule.endTime)}
            </p>
            <p>
              <strong>Mode:</strong> {editingSchedule.mode}
            </p>
            <p>
              <strong>Room:</strong> {editingSchedule.room || "-"}
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editingSchedule ? "Edit Schedule" : "Add Schedule"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                value={formData.teacherId}
                onChange={(e) =>
                  setFormData({ ...formData, teacherId: e.target.value })
                }
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Select Teacher</option>
                {teachersData?.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Batch Name"
                value={formData.batchName}
                onChange={(e) =>
                  setFormData({ ...formData, batchName: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />
              <div>
                <label className="block text-sm font-medium mb-1">Start Time (Your Local Time)</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time (Your Local Time)</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <select
                value={formData.mode}
                onChange={(e) =>
                  setFormData({ ...formData, mode: e.target.value })
                }
                className="border p-2 rounded w-full"
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
              {formData.mode === "offline" && (
                <input
                  type="text"
                  placeholder="Room"
                  value={formData.room}
                  onChange={(e) =>
                    setFormData({ ...formData, room: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating || updating ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}