import React, { useState, useEffect, useRef } from "react";
import {
  FaPlus,
  FaTrash,
  FaEye,
  FaSync,
  FaRupeeSign,
  FaUser,
  FaTimesCircle,
} from "react-icons/fa";
import {
  useCreateSalaryPaymentMutation,
  useDeletePaymentMutation,
  useGetAllPaymentsQuery,
  useGetSalaryTeachersQuery,
} from "../redux/apis/salaryApi";

const Salary = () => {
  const [showAddSalaryModal, setShowAddSalaryModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");

  const [salaryForm, setSalaryForm] = useState({
    teacherId: "",
    month: new Date().toISOString().slice(0, 7),
    paidAmount: "",
    paymentMethod: "bank_transfer",
    transactionRef: "",
    remarks: "",
  });

  const { data: paymentsData, isLoading, error, refetch } = useGetAllPaymentsQuery({
    limit: 100,
    month: monthFilter || undefined,
  });

  const { data: teachersData, isLoading: loadingTeachers } = useGetSalaryTeachersQuery();

  const [createSalaryPayment] = useCreateSalaryPaymentMutation();
  const [deletePayment] = useDeletePaymentMutation();

  const paymentMethods = [
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "upi", label: "UPI Payment" },
    { value: "cash", label: "Cash" },
    { value: "cheque", label: "Cheque" },
  ];

  const modalRef = useRef();

  const handleSalaryInputChange = (e) => {
    const { name, value } = e.target;
    setSalaryForm((prev) => ({ ...prev, [name]: value }));

    if (name === "teacherId" && value) {
      const selectedTeacher = teachersData?.find((t) => t._id === value);
      if (selectedTeacher) {
        setSalaryForm((prev) => ({
          ...prev,
          paidAmount: selectedTeacher.baseSalary || "",
        }));
      }
    }
  };

  const resetForm = () => {
    setSalaryForm({
      teacherId: "",
      month: new Date().toISOString().slice(0, 7),
      paidAmount: "",
      paymentMethod: "bank_transfer",
      transactionRef: "",
      remarks: "",
    });
  };

  const closeModal = () => {
    setShowAddSalaryModal(false);
    setShowViewModal(false);
    resetForm();
  };

  const handleAddSalary = async () => {
    const { teacherId, month, paidAmount, paymentMethod, transactionRef, remarks } = salaryForm;
    if (!teacherId || !month || !paidAmount) {
      alert("Please fill all required fields");
      return;
    }
    if (paidAmount < 0) {
      alert("Paid amount cannot be negative");
      return;
    }
    try {
      await createSalaryPayment({
        teacherId,
        month,
        paidAmount: Number(paidAmount),
        paymentMethod,
        transactionRef,
        remarks,
      }).unwrap();
      alert("✅ Salary payment recorded successfully!");
      closeModal();
      refetch();
    } catch (err) {
      alert(err?.data?.message || "Failed to create salary payment");
    }
  };

  const handleDeletePayment = async (id) => {
    if (window.confirm("Are you sure you want to delete this salary record?")) {
      try {
        await deletePayment(id).unwrap();
        alert("🗑️ Salary record deleted successfully!");
        refetch();
      } catch (err) {
        alert(err?.data?.message || "Failed to delete salary record");
      }
    }
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: "bg-green-100 text-green-800", label: "Fully Paid" },
      partial: { color: "bg-yellow-100 text-yellow-800", label: "Partial Payment" },
      unpaid: { color: "bg-red-100 text-red-800", label: "Unpaid" },
    };
    const config = statusConfig[status] || statusConfig.unpaid;
    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatMonth = (monthString) => {
    if (!monthString) return "N/A";
    const date = new Date(monthString + "-01");
    return date.toLocaleDateString("en-IN", { year: "numeric", month: "long" });
  };

  const filteredData =
    paymentsData?.records?.filter((payment) => {
      const teacherName = payment.teacherId?.name?.toLowerCase() || "";
      const month = payment.month?.toLowerCase() || "";
      const remarks = payment.remarks?.toLowerCase() || "";
      const searchMatch =
        teacherName.includes(searchTerm.toLowerCase()) ||
        month.includes(searchTerm.toLowerCase()) ||
        remarks.includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === "all" || payment.paymentStatus === statusFilter;
      return searchMatch && statusMatch;
    }) || [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeModal();
      }
    };
    if (showAddSalaryModal || showViewModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAddSalaryModal, showViewModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <FaSync className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-500">Error loading data</p>
        <button onClick={refetch} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">💰 Salary Management</h1>
        <button
          onClick={() => setShowAddSalaryModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
        >
          <FaPlus /> Add Salary Payment
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Teacher</th>
              <th className="p-3">Month</th>
              <th className="p-3">Salary</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment Method</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((payment) => (
              <tr key={payment._id} className="hover:bg-gray-50">
                <td className="p-3 flex items-center gap-2">
                  <FaUser className="text-blue-500" /> {payment.teacherId?.name}
                </td>
                <td className="p-3">{formatMonth(payment.month)}</td>
                <td className="p-3">
                  Paid: {formatCurrency(payment.paidAmount)} <br />
                  Pending: {formatCurrency(payment.pendingAmount)}
                </td>
                <td className="p-3">{getStatusBadge(payment.paymentStatus)}</td>
                <td className="p-3 capitalize">{payment.paymentMethod?.replace("_", " ")}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleViewPayment(payment)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleDeletePayment(payment._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {(showAddSalaryModal || showViewModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in"
          >
            {/* Add Salary Modal */}
            {showAddSalaryModal && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Add Salary Payment</h2>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                    <FaTimesCircle />
                  </button>
                </div>
                <div className="space-y-3">
                  <select
                    name="teacherId"
                    value={salaryForm.teacherId}
                    onChange={handleSalaryInputChange}
                    className="w-full border p-2 rounded"
                  >
                    <option value="">Select Teacher</option>
                    {teachersData?.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="month"
                    name="month"
                    value={salaryForm.month}
                    onChange={handleSalaryInputChange}
                    className="w-full border p-2 rounded"
                  />

                  <input
                    type="number"
                    name="paidAmount"
                    value={salaryForm.paidAmount}
                    onChange={handleSalaryInputChange}
                    placeholder="Paid Amount"
                    className="w-full border p-2 rounded"
                  />

                  <select
                    name="paymentMethod"
                    value={salaryForm.paymentMethod}
                    onChange={handleSalaryInputChange}
                    className="w-full border p-2 rounded"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    name="transactionRef"
                    value={salaryForm.transactionRef}
                    onChange={handleSalaryInputChange}
                    placeholder="Transaction Reference"
                    className="w-full border p-2 rounded"
                  />

                  <textarea
                    name="remarks"
                    value={salaryForm.remarks}
                    onChange={handleSalaryInputChange}
                    placeholder="Remarks"
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSalary}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Payment
                  </button>
                </div>
              </div>
            )}

            {/* View Salary Modal */}
            {showViewModal && selectedPayment && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Payment Details</h2>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                    <FaTimesCircle />
                  </button>
                </div>

                <div className="space-y-2">
                  <p>
                    <strong>Teacher:</strong> {selectedPayment.teacherId?.name}
                  </p>
                  <p>
                    <strong>Month:</strong> {formatMonth(selectedPayment.month)}
                  </p>
                  <p>
                    <strong>Paid Amount:</strong> {formatCurrency(selectedPayment.paidAmount)}
                  </p>
                  <p>
                    <strong>Pending Amount:</strong> {formatCurrency(selectedPayment.pendingAmount)}
                  </p>
                  <p>
                    <strong>Status:</strong> {getStatusBadge(selectedPayment.paymentStatus)}
                  </p>
                  <p>
                    <strong>Payment Method:</strong>{" "}
                    {selectedPayment.paymentMethod?.replace("_", " ")}
                  </p>
                  <p>
                    <strong>Transaction Ref:</strong> {selectedPayment.transactionRef || "N/A"}
                  </p>
                  <p>
                    <strong>Remarks:</strong> {selectedPayment.remarks || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Salary;
