import React, { useState, useEffect } from "react";
import {
  useGetAllSchedulesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useGetAllTeachersQuery,
} from "../redux/apis/scheduleApi";
import { Loader2, Edit, Trash2, Plus, Calendar, Clock, User, Book } from "lucide-react";
import { toast } from "react-toastify";

// Convert 24-hour string to 12-hour AM/PM
const formatTimeTo12Hour = (time24) => {
  if (!time24) return "";
  const [hour, minute] = time24.split(":");
  let h = parseInt(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${minute} ${ampm}`;
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
    scheduleDate: "",
    startTime: "",
    endTime: "",
    mode: "offline",
    room: "",
  });

  const [errors, setErrors] = useState({});

  // Default date
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  };

  useEffect(() => {
    const currentDate = getCurrentDate();
    if (!editingSchedule && modalOpen) {
      setFormData(prev => ({
        ...prev,
        scheduleDate: currentDate,
        startTime: "14:00",
        endTime: "16:00",
      }));
    }
  }, [modalOpen, editingSchedule]);

  const openModal = (schedule = null) => {
    setEditingSchedule(schedule);
    setErrors({});

    if (schedule) {
      const startDate = new Date(schedule.startTime).toISOString().split("T")[0];
      const startTime = new Date(schedule.startTime).toTimeString().slice(0, 5);
      const endTime = new Date(schedule.endTime).toTimeString().slice(0, 5);

      setFormData({
        teacherId: schedule.teacherId?._id || "",
        batchName: schedule.batchName || "",
        subject: schedule.subject || "",
        scheduleDate: startDate,
        startTime,
        endTime,
        mode: schedule.mode || "offline",
        room: schedule.room || "",
      });
    } else {
      const currentDate = getCurrentDate();
      setFormData({
        teacherId: "",
        batchName: "",
        subject: "",
        scheduleDate: currentDate,
        startTime: "14:00",
        endTime: "16:00",
        mode: "offline",
        room: "",
      });
    }

    setModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.teacherId) newErrors.teacherId = "Please select a teacher";
    if (!formData.batchName?.trim()) newErrors.batchName = "Batch name is required";
    if (!formData.subject?.trim()) newErrors.subject = "Subject is required";
    if (!formData.scheduleDate) newErrors.scheduleDate = "Date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.time = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

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

  if (loadingSchedules || loadingTeachers) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
        <span className="ml-2 text-gray-600">Loading schedules...</span>
      </div>
    );
  }

  const schedules = schedulesData?.schedules || [];
  const filteredSchedules = selectedTeacher
    ? schedules.filter(sch => sch.teacherId?._id === selectedTeacher)
    : schedules;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Class Schedules</h1>
        <p className="text-gray-600">Manage and view all teaching schedules</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Teacher
          </label>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="w-full sm:w-64 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Teachers</option>
            {teachersData?.teachers?.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Schedule
        </button>
      </div>

      {/* Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchedules.map((schedule) => (
          <div key={schedule._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{schedule.batchName}</h3>
                <p className="text-sm text-gray-600">{schedule.subject}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                schedule.mode === 'online' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {schedule.mode}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{schedule.teacherId?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatTimeTo12Hour(schedule.startTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatTimeTo12Hour(schedule.endTime)}</span>
              </div>
              {schedule.room && (
                <div className="flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  <span>Room: {schedule.room}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => { setDetailModalOpen(true); setEditingSchedule(schedule); }}
                className="text-gray-600 hover:text-gray-800 p-1"
              >
                <Calendar className="w-4 h-4" />
              </button>
              <button
                onClick={() => openModal(schedule)}
                className="text-blue-600 hover:text-blue-800 p-1"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(schedule._id)}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSchedules.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No schedules found</p>
        </div>
      )}

      {/* Modals (Add/Edit Schedule) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editingSchedule ? "Edit Schedule" : "Add Schedule"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Teacher */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher *</label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className={`w-full border px-3 py-2 rounded-lg ${
                    errors.teacherId ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">Select Teacher</option>
                  {teachersData?.teachers?.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                  ))}
                </select>
                {errors.teacherId && <p className="text-red-500 text-sm mt-1">{errors.teacherId}</p>}
              </div>

              {/* Batch Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name *</label>
                <input
                  type="text"
                  value={formData.batchName}
                  onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                  className={`w-full border px-3 py-2 rounded-lg ${
                    errors.batchName ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.batchName && <p className="text-red-500 text-sm mt-1">{errors.batchName}</p>}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={`w-full border px-3 py-2 rounded-lg ${
                    errors.subject ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.scheduleDate}
                  onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                  className={`w-full border px-3 py-2 rounded-lg ${
                    errors.scheduleDate ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.scheduleDate && <p className="text-red-500 text-sm mt-1">{errors.scheduleDate}</p>}
              </div>

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className={`w-full border px-3 py-2 rounded-lg ${
                      errors.startTime || errors.time ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className={`w-full border px-3 py-2 rounded-lg ${
                      errors.endTime || errors.time ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                </div>
              </div>
              {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}

              {/* Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                </select>
              </div>

              {/* Room */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                >
                  {editingSchedule ? "Update" : "Add"}
                  {(creating || updating) && <Loader2 className="animate-spin w-4 h-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
