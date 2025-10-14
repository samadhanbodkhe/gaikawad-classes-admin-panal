import React, { useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaUser,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaMoneyBill,
} from "react-icons/fa";

const Customers = () => {
  // Dummy Data
  const initialCustomers = [
    {
      id: 1,
      name: "Rajesh Kumar",
      contact: "+91 9876543210",
      email: "rajesh@example.com",
      address: "123 Main St, Delhi",
      salesPerson: "Amit",
      history: [
        {
          year: 2025,
          orders: [
            {
              id: "ORD-5001",
              date: "2025-04-22",
              products: [{ name: "Microwave", qty: 1, price: 12000 }],
              total: 12000,
              paid: 8000,
              pending: 4000,
            },
            {
              id: "ORD-5002",
              date: "2025-05-12",
              products: [{ name: "TV", qty: 1, price: 40000 }],
              total: 40000,
              paid: 40000,
              pending: 0,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Priya Sharma",
      contact: "+91 8765432109",
      email: "priya@example.com",
      address: "456 Park Ave, Mumbai",
      salesPerson: "Neha",
      history: [
        {
          year: 2023,
          orders: [
            {
              id: "ORD-6001",
              date: "2023-08-20",
              products: [{ name: "Air Conditioner", qty: 1, price: 32000 }],
              total: 32000,
              paid: 20000,
              pending: 12000,
            },
          ],
        },
      ],
    },
  ];

  const [customers, setCustomers] = useState(initialCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [billSearchTerm, setBillSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
    salesPerson: "",
  });

  const [showPayModal, setShowPayModal] = useState(false);
  const [payOrder, setPayOrder] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("Cash");

  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 5;

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    if (
      c.name.toLowerCase().includes(term) ||
      c.contact.includes(term) ||
      c.email.toLowerCase().includes(term)
    ) {
      return true;
    }
    return c.history.some(
      (h) =>
        h.year.toString().includes(term) ||
        h.orders.some(
          (o) =>
            o.id.toLowerCase().includes(term) ||
            o.products.some((p) => p.name.toLowerCase().includes(term))
        )
    );
  });

  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
  const indexOfLast = currentPage * customersPerPage;
  const indexOfFirst = indexOfLast - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);

  const downloadInvoice = (order) => {
    const rows = [
      ["Product", "Qty", "Price"],
      ...order.products.map((p) => [p.name, p.qty, p.price]),
      ["Total", "", order.total],
      ["Paid", "", order.paid],
      ["Pending", "", order.pending],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${order.id}_invoice.csv`;
    a.click();
  };

  const deleteCustomer = (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      setCustomers(customers.filter((c) => c.id !== id));
      setSelectedCustomer(null);
    }
  };

  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.contact) {
      alert("Name and Contact are required!");
      return;
    }
    const newEntry = {
      id: Date.now(),
      ...newCustomer,
      history: [],
    };
    setCustomers([...customers, newEntry]);
    setNewCustomer({
      name: "",
      contact: "",
      email: "",
      address: "",
      salesPerson: "",
    });
    setShowAddModal(false);
  };

  const openPayModal = (order) => {
    setPayOrder(order);
    setPayAmount("");
    setPayMode("Cash");
    setShowPayModal(true);
  };

  const handlePayment = () => {
    if (!payAmount || isNaN(payAmount)) {
      alert("Enter valid payment amount!");
      return;
    }
    const amount = parseFloat(payAmount);
    if (amount <= 0 || amount > payOrder.pending) {
      alert("Invalid payment amount!");
      return;
    }

    const updatedCustomers = customers.map((c) => {
      if (c.id === selectedCustomer.id) {
        return {
          ...c,
          history: c.history.map((h) => ({
            ...h,
            orders: h.orders.map((o) =>
              o.id === payOrder.id
                ? {
                    ...o,
                    paid: o.paid + amount,
                    pending: o.pending - amount,
                  }
                : o
            ),
          })),
        };
      }
      return c;
    });

    setCustomers(updatedCustomers);
    setSelectedCustomer(
      updatedCustomers.find((c) => c.id === selectedCustomer.id)
    );
    setShowPayModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 text-gray-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-blue-700">
          Customer Management
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <FaPlus className="mr-2" /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-1/2 mb-6">
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, phone, email, year, product, order id..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring focus:ring-blue-300 bg-gray-100 placeholder-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customers Table */}
      <div className="bg-gray-50 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Contact</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => setSelectedCustomer(c)}
                >
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{c.name}</div>
                      <div className="text-gray-500">{c.address}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{c.contact}</td>
                  <td className="px-4 py-3 text-gray-700">{c.email}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomer(c.id);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {currentCustomers.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 bg-gray-100 text-gray-700">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 flex items-center gap-1"
            >
              <FaChevronLeft /> Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 flex items-center gap-1"
            >
              Next <FaChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {/* ... (Customer Details, Add Customer, Pay Now modals remain same with gray/soft colors for text) */}
    </div>
  );
};

export default Customers;
