import React, { useState, useEffect } from "react";
import {
  useGetAllSchedulesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useGetAllTeachersQuery,
} from "../redux/apis/scheduleApi";
import { Loader2, Edit, Trash2, Plus, Calendar, Clock, User, Book, ChevronDown } from "lucide-react";
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

  // Time options for dropdown (12-hour format)
  const timeOptions = [
    "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM",
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
    "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM",
    "09:00 PM", "09:30 PM", "10:00 PM"
  ];

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
        startTime: "02:00 PM",
        endTime: "04:00 PM"
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
      
      // Convert stored time to 12-hour format for display
      const formatTimeForDisplay = (date) => {
        if (!date) return "02:00 PM";
        const d = new Date(date);
        return d.toLocaleString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).toUpperCase();
      };

      const startTime = formatTimeForDisplay(schedule.startTime);
      const endTime = formatTimeForDisplay(schedule.endTime);

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
    
    // Validate time order by converting to comparable format
    if (formData.startTime && formData.endTime) {
      const startIndex = timeOptions.indexOf(formData.startTime);
      const endIndex = timeOptions.indexOf(formData.endTime);
      
      if (startIndex >= endIndex) {
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Class Schedule Management</h1>
        <p className="text-gray-600">Organize and manage teaching schedules efficiently</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Teacher
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full lg:w-80 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Teachers</option>
              {teachersData?.teachers?.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name} - {teacher.email}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            Create New Schedule
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSchedules.map((schedule) => (
          <div key={schedule._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{schedule.batchName}</h3>
                <p className="text-gray-600 text-sm mt-1">{schedule.subject}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                schedule.mode === 'online' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}>
                {schedule.mode === 'online' ? '🖥️ Online' : '🏫 Offline'}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-700">
                <User className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{schedule.teacherId?.name}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="w-4 h-4 text-green-500" />
                <div>
                  <div className="font-medium">Start: {schedule.displayStartTime}</div>
                  <div className="font-medium">End: {schedule.displayEndTime}</div>
                </div>
              </div>
              {schedule.room && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Book className="w-4 h-4 text-purple-500" />
                  <span>Room: <strong>{schedule.room}</strong></span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setDetailModalOpen(true);
                  setEditingSchedule(schedule);
                }}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="View Details"
              >
                <Calendar className="w-4 h-4" />
              </button>
              <button
                onClick={() => openModal(schedule)}
                className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                title="Edit Schedule"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(schedule._id)}
                className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete Schedule"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSchedules.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-xl font-medium mb-2">No schedules found</p>
          <p className="text-gray-400 text-sm">
            {selectedTeacher ? "No schedules for selected teacher" : "Get started by creating your first schedule"}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && editingSchedule && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Schedule Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="font-medium text-gray-700 text-sm">Teacher</label>
                  <p className="mt-1 text-gray-900">{editingSchedule.teacherId?.name}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700 text-sm">Email</label>
                  <p className="mt-1 text-gray-900">{editingSchedule.teacherId?.email}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700 text-sm">Batch</label>
                  <p className="mt-1 text-gray-900">{editingSchedule.batchName}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700 text-sm">Subject</label>
                  <p className="mt-1 text-gray-900">{editingSchedule.subject}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700 text-sm">Start Time</label>
                  <p className="mt-1 text-gray-900">{editingSchedule.displayStartTime}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700 text-sm">End Time</label>
                  <p className="mt-1 text-gray-900">{editingSchedule.displayEndTime}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700 text-sm">Mode</label>
                  <p className="mt-1 text-gray-900 capitalize">{editingSchedule.mode}</p>
                </div>
                {editingSchedule.room && (
                  <div>
                    <label className="font-medium text-gray-700 text-sm">Room</label>
                    <p className="mt-1 text-gray-900">{editingSchedule.room}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {editingSchedule ? "Edit Schedule" : "Create New Schedule"}
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
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white ${
                        errors.teacherId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a teacher</option>
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
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                    <div className="relative">
                      <select
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                          errors.startTime || errors.time ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                          errors.endTime || errors.time ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                {(errors.startTime || errors.endTime || errors.time) && (
                  <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                    {errors.time || "Please select valid start and end times"}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mode Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class Mode
                    </label>
                    <select
                      value={formData.mode}
                      onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="offline">🏫 Offline Class</option>
                      <option value="online">🖥️ Online Class</option>
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
                  >
                    {creating || updating ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      editingSchedule ? "Update Schedule" : "Create Schedule"
                    )}
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