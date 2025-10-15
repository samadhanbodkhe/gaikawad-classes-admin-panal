// src/pages/Schedule.jsx
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

// Format date in IST for display
const formatIST = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Convert IST datetime-local input to ISO string
const toISOFromInput = (input) => {
  const [date, time] = input.split("T");
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");
  const dateObj = new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30));
  return dateObj.toISOString();
};

// Get current datetime-local for input (IST)
const getCurrentDateTimeForInput = () => {
  const now = new Date();
  const tzOffset = 5 * 60 + 30; // IST offset in minutes
  const local = new Date(now.getTime() + tzOffset * 60000);
  return local.toISOString().slice(0, 16);
};

export default function Schedule() {
  const { data: schedulesData, isLoading: loadingSchedules, refetch } = useGetAllSchedulesQuery();
  const { data: teachersData, isLoading: loadingTeachers } = useGetAllTeachersQuery();

  const [createSchedule, { isLoading: creating }] = useCreateScheduleMutation();
  const [updateSchedule, { isLoading: updating }] = useUpdateScheduleMutation();
  const [deleteSchedule, { isLoading: deleting }] = useDeleteScheduleMutation();

  const [modalOpen, setModalOpen] = useState(false);
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

  const openModal = (schedule = null) => {
    setEditingSchedule(schedule);
    if (schedule) {
      setFormData({
        teacherId: schedule.teacherId?._id || "",
        batchName: schedule.batchName,
        subject: schedule.subject,
        startTime: schedule.startTimeIST?.slice(0, 16) || getCurrentDateTimeForInput(),
        endTime: schedule.endTimeIST?.slice(0, 16) || getCurrentDateTimeForInput(),
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
      const payload = {
        ...formData,
        startTime: toISOFromInput(formData.startTime),
        endTime: toISOFromInput(formData.endTime),
      };
      if (editingSchedule) {
        await updateSchedule({ id: editingSchedule._id, ...payload }).unwrap();
        toast.success("Schedule updated!");
      } else {
        await createSchedule(payload).unwrap();
        toast.success("Schedule created!");
      }
      refetch();
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteSchedule(id).unwrap();
        toast.success("Deleted successfully!");
        refetch();
      } catch {
        toast.error("Failed to delete");
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📅 Schedules</h1>
        <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <PlusCircle /> Add
        </button>
      </div>

      <div className="mb-4">
        <label>Filter by Teacher: </label>
        <select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          {teachersData?.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Teacher</th>
              <th className="p-2">Batch</th>
              <th className="p-2">Subject</th>
              <th className="p-2">Start (IST)</th>
              <th className="p-2">End (IST)</th>
              <th className="p-2">Mode</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(schedulesData?.schedules || [])
              .filter(s => !selectedTeacher || s.teacherId?._id === selectedTeacher)
              .map(s => (
                <tr key={s._id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{s.teacherId?.name}</td>
                  <td className="p-2">{s.batchName}</td>
                  <td className="p-2">{s.subject}</td>
                  <td className="p-2">{formatIST(s.startTime)}</td>
                  <td className="p-2">{formatIST(s.endTime)}</td>
                  <td className="p-2 capitalize">{s.mode}</td>
                  <td className="p-2 flex gap-2">
                    <button onClick={() => openModal(s)} className="text-blue-600"><Edit /></button>
                    <button onClick={() => handleDelete(s._id)} className="text-red-600"><Trash2 /></button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40">
          <div className="bg-white p-4 rounded w-[90%] max-w-md">
            <h2 className="font-bold mb-2">{editingSchedule ? "Edit" : "Add"} Schedule</h2>
            <form onSubmit={handleSubmit} className="space-y-2">
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                required
                className="border p-2 w-full rounded"
              >
                <option value="">Select Teacher</option>
                {teachersData?.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
              <input type="text" placeholder="Batch Name" value={formData.batchName} onChange={e => setFormData({...formData, batchName: e.target.value})} className="border p-2 w-full rounded" required />
              <input type="text" placeholder="Subject" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="border p-2 w-full rounded" required />
              <input type="datetime-local" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="border p-2 w-full rounded" required />
              <input type="datetime-local" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="border p-2 w-full rounded" required />
              <select value={formData.mode} onChange={e => setFormData({...formData, mode: e.target.value})} className="border p-2 w-full rounded">
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
              {formData.mode === "offline" && (
                <input type="text" placeholder="Room" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})} className="border p-2 w-full rounded" />
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-2 py-1 border rounded">Cancel</button>
                <button type="submit" className="px-2 py-1 bg-blue-600 text-white rounded">{creating || updating ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
