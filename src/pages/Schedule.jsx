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
    startTime: "",
    endTime: "",
    mode: "offline",
    room: "",
  });

  const [errors, setErrors] = useState({});

  // Get current date for default
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
        startTime: "14:00", // 2:00 PM default
        endTime: "16:00"    // 4:00 PM default
      }));
    }
  }, [modalOpen, editingSchedule]);

  const openModal = (schedule = null) => {
    setEditingSchedule(schedule);
    setErrors({});
    
    if (schedule) {
      // Extract date and time from existing schedule for editing
      const startDate = schedule.startTime ? 
        new Date(schedule.startTime).toLocaleDateString('en-CA') : "";
      const startTime = schedule.startTime ? 
        new Date(schedule.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) : "";
      const endTime = schedule.endTime ? 
        new Date(schedule.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) : "";

      setFormData({
        teacherId: schedule.teacherId?._id || "",
        batchName: schedule.batchName || "",
        subject: schedule.subject || "",
        scheduleDate: startDate,
        startTime: startTime,
        endTime: endTime,
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
    
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (formData.startTime && !timeRegex.test(formData.startTime)) {
      newErrors.startTime = "Invalid time format (HH:MM)";
    }
    if (formData.endTime && !timeRegex.test(formData.endTime)) {
      newErrors.endTime = "Invalid time format (HH:MM)";
    }
    
    if (formData.startTime && formData.endTime) {
      if (formData.startTime >= formData.endTime) {
        newErrors.time = "End time must be after start time";
      }
    }

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
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
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
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        </div>
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
                schedule.mode === 'online' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
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
                <span>{schedule.displayStartTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{schedule.displayEndTime}</span>
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
                onClick={() => {
                  setDetailModalOpen(true);
                  setEditingSchedule(schedule);
                }}
                className="text-gray-600 hover:text-gray-800 p-1"
                title="View Details"
              >
                <Calendar className="w-4 h-4" />
              </button>
              <button
                onClick={() => openModal(schedule)}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(schedule._id)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Delete"
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
          <p className="text-gray-400 text-sm mt-1">
            {selectedTeacher ? "Try changing the filter" : "Create your first schedule"}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && editingSchedule && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Schedule Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="font-medium text-gray-700">Teacher:</label>
                  <p className="mt-1">{editingSchedule.teacherId?.name}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Email:</label>
                  <p className="mt-1">{editingSchedule.teacherId?.email}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Batch:</label>
                  <p className="mt-1">{editingSchedule.batchName}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Subject:</label>
                  <p className="mt-1">{editingSchedule.subject}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Start Time:</label>
                  <p className="mt-1">{editingSchedule.displayStartTime}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">End Time:</label>
                  <p className="mt-1">{editingSchedule.displayEndTime}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Mode:</label>
                  <p className="mt-1 capitalize">{editingSchedule.mode}</p>
                </div>
                {editingSchedule.room && (
                  <div>
                    <label className="font-medium text-gray-700">Room:</label>
                    <p className="mt-1">{editingSchedule.room}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Teacher Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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

                {/* Time Selection - Simple Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time * (24-hour format)
                    </label>
                    <input
                      type="text"
                      placeholder="HH:MM (e.g., 14:00 for 2 PM)"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.startTime || errors.time ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: HH:MM (24-hour)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time * (24-hour format)
                    </label>
                    <input
                      type="text"
                      placeholder="HH:MM (e.g., 16:00 for 4 PM)"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.endTime || errors.time ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: HH:MM (24-hour)</p>
                  </div>
                </div>
                {(errors.startTime || errors.endTime || errors.time) && (
                  <p className="text-red-500 text-sm">
                    {errors.time || errors.startTime || errors.endTime || "Please select valid start and end times"}
                  </p>
                )}

                {/* Mode Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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