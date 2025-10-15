import React, { useState, useEffect } from "react";
import {
  useGetAllSchedulesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useGetAllTeachersQuery,
} from "../redux/apis/scheduleApi";
import { Loader2, Edit, Trash2, Plus, Calendar, Clock, User, Book, Search, Filter } from "lucide-react";
import { toast } from "react-toastify";

export default function Schedule() {
  const { 
    data: schedulesData, 
    isLoading: loadingSchedules, 
    refetch,
    isError: schedulesError 
  } = useGetAllSchedulesQuery();
  
  const { 
    data: teachersData, 
    isLoading: loadingTeachers,
    isError: teachersError 
  } = useGetAllTeachersQuery();

  const [createSchedule, { isLoading: creating }] = useCreateScheduleMutation();
  const [updateSchedule, { isLoading: updating }] = useUpdateScheduleMutation();
  const [deleteSchedule, { isLoading: deleting }] = useDeleteScheduleMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

    // Validate time order
    const startIndex = timeOptions.indexOf(formData.startTime);
    const endIndex = timeOptions.indexOf(formData.endTime);
    if (startIndex >= endIndex) {
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

  // Filter schedules based on search and teacher filter
  const filteredSchedules = (schedulesData?.schedules || []).filter(schedule => {
    const matchesTeacher = !selectedTeacher || schedule.teacherId?._id === selectedTeacher;
    const matchesSearch = !searchTerm || 
      schedule.batchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.teacherId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTeacher && matchesSearch;
  });

  if (loadingSchedules || loadingTeachers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading schedules...</p>
        </div>
      </div>
    );
  }

  if (schedulesError || teachersError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-sm p-8 max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Data</h3>
            <p className="text-gray-600 mb-4">There was an error loading the schedules. Please try again.</p>
            <button
              onClick={refetch}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Class Schedule</h1>
              <p className="text-gray-600">Manage and organize teaching schedules efficiently</p>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md mt-4 sm:mt-0"
            >
              <Plus className="w-5 h-5" />
              Add Schedule
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Schedules
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by batch, subject, or teacher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Teacher Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Filter by Teacher
              </label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Teachers</option>
                {teachersData?.teachers?.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stats */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Schedules</p>
                  <p className="text-2xl font-bold text-blue-900">{filteredSchedules.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Batch & Subject
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Mode & Room
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSchedules.map((schedule) => (
                  <tr 
                    key={schedule._id} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{schedule.teacherId?.name}</div>
                          <div className="text-sm text-gray-500">{schedule.teacherId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{schedule.batchName}</div>
                      <div className="text-sm text-gray-600">{schedule.subject}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900 mb-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDisplayDate(schedule.scheduleDate)}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-green-600">
                          <Clock className="w-4 h-4" />
                          {schedule.startTime}
                        </div>
                        <span className="text-gray-300">→</span>
                        <div className="flex items-center gap-1 text-red-600">
                          <Clock className="w-4 h-4" />
                          {schedule.endTime}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          schedule.mode === 'online' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {schedule.mode === 'online' ? '🖥️ Online' : '🏫 Offline'}
                        </span>
                        {schedule.room && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Book className="w-4 h-4" />
                            {schedule.room}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(schedule)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Edit Schedule"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule._id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete Schedule"
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
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No schedules found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedTeacher 
                  ? "Try adjusting your search or filter criteria" 
                  : "Get started by creating your first schedule"
                }
              </p>
              {!searchTerm && !selectedTeacher && (
                <button
                  onClick={() => openModal()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Schedule
                </button>
              )}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingSchedule ? "Edit Schedule" : "Create New Schedule"}
                  </h2>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Teacher Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Teacher *
                    </label>
                    <select
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.teacherId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a Teacher</option>
                      {teachersData?.teachers?.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                    {errors.teacherId && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.teacherId}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Batch Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Batch Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Batch A, Class 10th"
                        value={formData.batchName}
                        onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                        className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.batchName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.batchName && (
                        <p className="text-red-500 text-sm mt-2">{errors.batchName}</p>
                      )}
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Subject *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Mathematics, Science"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.subject && (
                        <p className="text-red-500 text-sm mt-2">{errors.subject}</p>
                      )}
                    </div>
                  </div>

                  {/* Schedule Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Schedule Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduleDate}
                      onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                      className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.scheduleDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.scheduleDate && (
                      <p className="text-red-500 text-sm mt-2">{errors.scheduleDate}</p>
                    )}
                  </div>

                  {/* Time Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Start Time *
                      </label>
                      <select
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.startTime || errors.time ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      {errors.startTime && (
                        <p className="text-red-500 text-sm mt-2">{errors.startTime}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        End Time *
                      </label>
                      <select
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.endTime || errors.time ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      {errors.endTime && (
                        <p className="text-red-500 text-sm mt-2">{errors.endTime}</p>
                      )}
                    </div>
                  </div>
                  
                  {errors.time && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-700 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.time}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Mode Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Class Mode
                      </label>
                      <select
                        value={formData.mode}
                        onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="offline">🏫 Offline Class</option>
                        <option value="online">🖥️ Online Class</option>
                      </select>
                    </div>

                    {/* Room (only for offline) */}
                    {formData.mode === "offline" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Room Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Room 101, Lab A"
                          value={formData.room}
                          onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating || updating}
                      className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      {creating || updating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {editingSchedule ? "Updating..." : "Creating..."}
                        </>
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
    </div>
  );
}