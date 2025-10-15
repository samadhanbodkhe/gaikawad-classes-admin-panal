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

export default function Schedule() {
  const { 
    data: schedulesData, 
    isLoading: loadingSchedules, 
    refetch 
  } = useGetAllSchedulesQuery();
  
  const { 
    data: teachersData, 
    isLoading: loadingTeachers 
  } = useGetAllTeachersQuery();

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
    startTime: "02:00 PM",
    endTime: "04:00 PM",
    mode: "offline",
    room: "",
  });

  const [errors, setErrors] = useState({});

  // Time options in 12-hour Indian format
  const timeOptions = [
    "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM",
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
    "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM"
  ];

  // Get current date
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const currentDate = getCurrentDate();
    if (!editingSchedule && modalOpen) {
      setFormData(prev => ({
        ...prev,
        scheduleDate: currentDate,
        startTime: "02:00 PM",
        endTime: "04:00 PM"
      }));
    }
  }, [modalOpen, editingSchedule]);

  const openModal = (schedule = null) => {
    setEditingSchedule(schedule);
    setErrors({});
    
    if (schedule) {
      setFormData({
        teacherId: schedule.teacherId?._id || "",
        batchName: schedule.batchName || "",
        subject: schedule.subject || "",
        scheduleDate: schedule.scheduleDate || "",
        startTime: schedule.startTime || "02:00 PM",
        endTime: schedule.endTime || "04:00 PM",
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
        startTime: "02:00 PM",
        endTime: "04:00 PM",
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingSchedule) {
        await updateSchedule({ 
          id: editingSchedule._id, 
          ...formData 
        }).unwrap();
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

  // Format date for display (DD/MM/YYYY)
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Class Schedule</h1>
        <p className="text-gray-600">Manage all teaching schedules</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Teacher
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full lg:w-80 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Teachers</option>
              {teachersData?.teachers?.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Schedule
          </button>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Teacher</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Batch</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Subject</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Start Time</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">End Time</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Mode</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Room</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSchedules.map((schedule) => (
                <tr key={schedule._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{schedule.teacherId?.name}</div>
                      <div className="text-sm text-gray-500">{schedule.teacherId?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{schedule.batchName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{schedule.subject}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDisplayDate(schedule.scheduleDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{schedule.startTime}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{schedule.endTime}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      schedule.mode === 'online' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {schedule.mode}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {schedule.room || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(schedule)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(schedule._id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSchedules.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No schedules found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Teacher Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teacher *
                    </label>
                    <select
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.teacherId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Teacher</option>
                      {teachersData?.teachers?.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} ({teacher.email})
                        </option>
                      ))}
                    </select>
                    {errors.teacherId && (
                      <p className="text-red-500 text-sm mt-1">{errors.teacherId}</p>
                    )}
                  </div>

                  {/* Batch Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Batch A, Class 10th"
                      value={formData.batchName}
                      onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.batchName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.batchName && (
                      <p className="text-red-500 text-sm mt-1">{errors.batchName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Mathematics, Science"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.subject ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.subject && (
                      <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                    )}
                  </div>

                  {/* Schedule Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduleDate}
                      onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.scheduleDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.scheduleDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.scheduleDate}</p>
                    )}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <select
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.startTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    {errors.startTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time *
                    </label>
                    <select
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.endTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    {errors.endTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mode Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Mode
                    </label>
                    <select
                      value={formData.mode}
                      onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="offline">Offline</option>
                      <option value="online">Online</option>
                    </select>
                  </div>

                  {/* Room (only for offline) */}
                  {formData.mode === "offline" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Room 101, Lab A"
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {creating || updating ? "Saving..." : "Save Schedule"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}