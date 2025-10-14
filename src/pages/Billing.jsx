import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaDownload,
  FaPrint,
  FaSearch,
  FaUser,
  FaBoxOpen,
  FaTrashAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaShoppingCart,
  FaRupeeSign,
  FaFileInvoiceDollar,
  FaUsers,
  FaBoxes
} from "react-icons/fa";

const currency = (n) =>
  typeof n === "number" ? `₹${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "₹0.00";

// Sample data with more products and customers
const sampleProducts = [
  { id: "P001", name: "Pine Wood (1ft)", price: 500, unit: "pcs", gst: 18, category: "Wood" },
  { id: "P002", name: "MDF Board (4x8)", price: 750, unit: "sheet", gst: 12, category: "Board" },
  { id: "P003", name: "Fiber Sheet", price: 1200, unit: "sheet", gst: 18, category: "Sheet" },
  { id: "P004", name: "Nails Pack", price: 50, unit: "pack", gst: 18, category: "Hardware" },
  { id: "P005", name: "Glue (500ml)", price: 180, unit: "btl", gst: 12, category: "Adhesive" },
  { id: "P006", name: "Varnish (1L)", price: 350, unit: "can", gst: 18, category: "Finish" },
  { id: "P007", name: "Plywood (8x4)", price: 1800, unit: "sheet", gst: 18, category: "Board" },
  { id: "P008", name: "Screws (100pcs)", price: 120, unit: "pack", gst: 18, category: "Hardware" },
];

const sampleCustomers = [
  { id: "C001", name: "Balaji Corp", phone: "9876543210", email: "balaji@example.com", address: "Delhi" },
  { id: "C002", name: "Sai Enterprises", phone: "9123456780", email: "sai@example.com", address: "Mumbai" },
  { id: "C003", name: "Apex Traders", phone: "9001234567", email: "apex@example.com", address: "Bengaluru" },
  { id: "C004", name: "Sharma Furniture", phone: "9898765432", email: "sharma@example.com", address: "Chennai" },
];

const sampleBills = [
  {
    id: "INV-1001",
    date: "2025-09-01",
    customer: sampleCustomers[0],
    items: [
      { productId: "P001", name: "Pine Wood (1ft)", price: 500, qty: 10, gst: 18 },
      { productId: "P004", name: "Nails Pack", price: 50, qty: 4, gst: 18 },
    ],
    discount: 0,
    shipping: 0,
    note: "Thank you for your business",
    payment: { method: "Cash", paid: 6000 },
  },
];

const Billing = () => {
  // Global state
  const [products, setProducts] = useState(sampleProducts);
  const [customers, setCustomers] = useState(sampleCustomers);
  const [bills, setBills] = useState(sampleBills);
  const [activeTab, setActiveTab] = useState("billing"); // billing, products, customers

  // new invoice state
  const [invoiceCustomerId, setInvoiceCustomerId] = useState(customers[0]?.id || "");
  const [lineItems, setLineItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [invoiceNote, setInvoiceNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paidAmount, setPaidAmount] = useState(0);

  // UI state
  const [productSearch, setProductSearch] = useState("");
  const [billSearch, setBillSearch] = useState("");
  const [viewBill, setViewBill] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [newProduct, setNewProduct] = useState({ id: "", name: "", price: 0, unit: "", gst: 18, category: "" });
  const [newCustomer, setNewCustomer] = useState({ id: "", name: "", phone: "", email: "", address: "" });
  
  const invoiceNumberCounter = useRef(1002);

  // Helpers: totals
  const subTotal = useMemo(() => {
    return lineItems.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 0), 0);
  }, [lineItems]);

  const totalGst = useMemo(() => {
    return lineItems.reduce((sum, it) => sum + ((it.price || 0) * (it.qty || 0) * (it.gst || 0)) / 100, 0);
  }, [lineItems]);

  const discountAmount = useMemo(() => {
    return (subTotal * (Number(discountPercent) || 0)) / 100;
  }, [subTotal, discountPercent]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subTotal - discountAmount + totalGst + Number(shipping || 0));
  }, [subTotal, discountAmount, totalGst, shipping]);

  const paymentStatus = useMemo(() => {
    const paid = Number(paidAmount || 0);
    if (paid <= 0) return "Due";
    if (paid >= grandTotal) return "Paid";
    return "Partial";
  }, [paidAmount, grandTotal]);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    const searchTerm = productSearch.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm) || 
      p.id.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
  }, [products, productSearch]);

  // Filter bills based on search
  const filteredBills = useMemo(() => {
    const term = billSearch.trim().toLowerCase();
    if (!term) return bills;
    
    return bills.filter((b) => {
      if (b.id.toLowerCase().includes(term)) return true;
      if (b.customer?.name?.toLowerCase().includes(term)) return true;
      if (b.date.includes(term)) return true;
      if (b.items.some((it) => it.name.toLowerCase().includes(term))) return true;
      return false;
    });
  }, [bills, billSearch]);

  // Actions
  const addProductToInvoice = (prod) => {
    setLineItems((prev) => {
      const found = prev.find((p) => p.productId === prod.id);
      if (found) {
        return prev.map((p) => (p.productId === prod.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { 
        productId: prod.id, 
        name: prod.name, 
        price: prod.price, 
        qty: 1, 
        gst: prod.gst 
      }];
    });
  };

  const updateLine = (productId, patch) => {
    setLineItems((prev) => prev.map((l) => (l.productId === productId ? { ...l, ...patch } : l)));
  };

  const removeLine = (productId) => {
    setLineItems((prev) => prev.filter((l) => l.productId !== productId));
  };

  const resetInvoiceForm = () => {
    setInvoiceCustomerId(customers[0]?.id || "");
    setLineItems([]);
    setDiscountPercent(0);
    setShipping(0);
    setInvoiceNote("");
    setPaymentMethod("Cash");
    setPaidAmount(0);
    setProductSearch("");
  };

  const saveInvoice = () => {
    if (!invoiceCustomerId) return alert("Select a customer");
    if (lineItems.length === 0) return alert("Add at least one product");

    const customer = customers.find((c) => c.id === invoiceCustomerId);
    const id = `INV-${invoiceNumberCounter.current++}`;
    const invoice = {
      id,
      date: new Date().toISOString().split("T")[0],
      customer,
      items: lineItems.map((li) => ({ ...li })),
      discount: Number(discountPercent || 0),
      shipping: Number(shipping || 0),
      note: invoiceNote,
      payment: { method: paymentMethod, paid: Number(paidAmount || 0) },
    };
    setBills((prev) => [invoice, ...prev]);
    resetInvoiceForm();
    alert(`Invoice ${id} saved`);
  };

  const addNewProduct = () => {
    if (!newProduct.id || !newProduct.name || newProduct.price <= 0) {
      return alert("Please fill all required fields");
    }
    
    if (products.some(p => p.id === newProduct.id)) {
      return alert("Product ID already exists");
    }
    
    setProducts(prev => [...prev, { ...newProduct }]);
    setNewProduct({ id: "", name: "", price: 0, unit: "", gst: 18, category: "" });
    alert("Product added successfully");
  };

  const updateProduct = () => {
    setProducts(prev => 
      prev.map(p => p.id === editingProduct.id ? { ...editingProduct } : p)
    );
    setEditingProduct(null);
    alert("Product updated successfully");
  };

  const deleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const addNewCustomer = () => {
    if (!newCustomer.id || !newCustomer.name) {
      return alert("Please fill all required fields");
    }
    
    if (customers.some(c => c.id === newCustomer.id)) {
      return alert("Customer ID already exists");
    }
    
    setCustomers(prev => [...prev, { ...newCustomer }]);
    setNewCustomer({ id: "", name: "", phone: "", email: "", address: "" });
    alert("Customer added successfully");
  };

  const updateCustomer = () => {
    setCustomers(prev => 
      prev.map(c => c.id === editingCustomer.id ? { ...editingCustomer } : c)
    );
    setEditingCustomer(null);
    alert("Customer updated successfully");
  };

  const deleteCustomer = (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  // Download CSV invoice for a bill object
  const downloadInvoiceCSV = (bill) => {
    const lines = [
      ["Invoice", bill.id],
      ["Date", bill.date],
      ["Customer", bill.customer.name],
      [],
      ["Product", "Qty", "Price", "GST%", "Total"],
      ...bill.items.map((it) => [it.name, it.qty, it.price, it.gst, it.price * it.qty]),
      [],
      ["Subtotal", subTotal],
      ["Discount %", bill.discount],
      ["Shipping", bill.shipping],
      ["GST", bill.items.reduce((s, it) => s + (it.price * it.qty * it.gst) / 100, 0)],
      ["Total", bill.items.reduce((s, it) => s + it.price * it.qty, 0) - (bill.discount / 100) * subTotal + bill.shipping],
      ["Paid", bill.payment?.paid || 0],
    ];
    const csv = lines.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bill.id}_invoice.csv`;
    a.click();
  };

  const printInvoice = (bill) => {
    const html = `
      <html>
        <head>
          <title>Invoice ${bill.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111;}
            .header { display:flex; justify-content:space-between; align-items:center; }
            table { width:100%; border-collapse: collapse; margin-top: 10px;}
            th, td { border:1px solid #ddd; padding:8px; text-align:left;}
            th { background:#f3f4f6; }
            .total { text-align:right; font-weight:700; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>My Company (Pro)</h2>
              <div>Address line 1</div>
              <div>Email: hello@company.com</div>
            </div>
            <div>
              <h3>Invoice: ${bill.id}</h3>
              <div>Date: ${bill.date}</div>
            </div>
          </div>
          <hr/>
          <h4>Bill To:</h4>
          <div>${bill.customer.name}</div>
          <div>${bill.customer.address || ""}</div>
          <div>${bill.customer.phone || ""}</div>

          <table>
            <thead>
              <tr><th>Product</th><th>Qty</th><th>Price</th><th>GST%</th><th>Line Total</th></tr>
            </thead>
            <tbody>
              ${bill.items
                .map(
                  (it) =>
                    `<tr><td>${it.name}</td><td>${it.qty}</td><td>${it.price}</td><td>${it.gst}</td><td>₹${
                      it.price * it.qty
                    }</td></tr>`
                )
                .join("")}
            </tbody>
          </table>

          <div style="margin-top:10px; width:100%; display:flex; justify-content:flex-end;">
            <div style="width:320px;">
              <div style="display:flex;justify-content:space-between;"><div>Subtotal</div><div>₹${bill.items
                .reduce((s, it) => s + it.price * it.qty, 0)
                .toLocaleString()}</div></div>
              <div style="display:flex;justify-content:space-between;"><div>Discount</div><div>${bill.discount}%</div></div>
              <div style="display:flex;justify-content:space-between;"><div>Shipping</div><div>₹${bill.shipping}</div></div>
              <div style="display:flex;justify-content:space-between;margin-top:8px;font-weight:700;"><div>Total</div><div>₹${(
                bill.items.reduce((s, it) => s + it.price * it.qty, 0) -
                (bill.discount / 100) * bill.items.reduce((s, it) => s + it.price * it.qty, 0) +
                bill.items.reduce((s, it) => s + (it.price * it.qty * it.gst) / 100, 0) +
                bill.shipping
              ).toLocaleString()}</div></div>
            </div>
          </div>

          <p style="margin-top:20px;">Payment method: ${bill.payment?.method || "-"}, Paid: ₹${
      bill.payment?.paid || 0
    }</p>
        </body>
      </html>
    `;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return alert("Popup blocked");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <FaFileInvoiceDollar className="text-blue-600" /> Advanced Billing Software
      </h1>

      {/* Navigation Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === "billing" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          onClick={() => setActiveTab("billing")}
        >
          <FaShoppingCart /> Billing
        </button>
        <button
          className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === "products" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          onClick={() => setActiveTab("products")}
        >
          <FaBoxes /> Products
        </button>
        <button
          className={`px-4 py-2 font-medium flex items-center gap-2 ${activeTab === "customers" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          onClick={() => setActiveTab("customers")}
        >
          <FaUsers /> Customers
        </button>
      </div>

      {activeTab === "billing" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Create Invoice */}
          <div className="lg:col-span-2 bg-white rounded-xl p-4 shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FaUser className="text-blue-600 text-xl" />
                <div>
                  <div className="text-sm text-gray-500">Customer</div>
                  <select
                    className="border rounded px-3 py-2 w-64"
                    value={invoiceCustomerId}
                    onChange={(e) => setInvoiceCustomerId(e.target.value)}
                  >
                    <option value="">Select customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">Invoice Date</div>
                <input
                  type="date"
                  className="border rounded px-3 py-2"
                  value={new Date().toISOString().split("T")[0]}
                  readOnly
                />
              </div>
            </div>

            {/* Product add/search */}
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    placeholder="Search products to add (name / ID / category)..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded"
                  />
                </div>
              </div>

              {productSearch.length > 0 && (
                <div className="mt-2 bg-white border rounded shadow max-h-56 overflow-y-auto">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer border-b"
                      onClick={() => {
                        addProductToInvoice(p);
                        setProductSearch("");
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <FaBoxOpen className="text-blue-500" />
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.id} • {p.unit} • {p.category}</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">{currency(p.price)}</div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="p-3 text-gray-500">No products found</div>
                  )}
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="p-2 text-left">Product</th>
                    <th className="p-2 text-left">Price</th>
                    <th className="p-2 text-left">GST%</th>
                    <th className="p-2 text-left">Qty</th>
                    <th className="p-2 text-left">Line Total</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">
                        No items — search products and click to add
                      </td>
                    </tr>
                  )}
                  {lineItems.map((l) => (
                    <tr key={l.productId} className="border-b">
                      <td className="p-2">{l.name}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="w-24 border rounded px-2 py-1"
                          value={l.price}
                          onChange={(e) => updateLine(l.productId, { price: Number(e.target.value) })}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="w-20 border rounded px-2 py-1"
                          value={l.gst}
                          onChange={(e) => updateLine(l.productId, { gst: Number(e.target.value) })}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          className="w-20 border rounded px-2 py-1"
                          value={l.qty}
                          onChange={(e) => updateLine(l.productId, { qty: Number(e.target.value) })}
                        />
                      </td>
                      <td className="p-2 font-medium">{currency(l.price * l.qty)}</td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => removeLine(l.productId)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove"
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice adjustments */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-600">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full border rounded px-3 py-2"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Shipping</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border rounded px-3 py-2"
                  value={shipping}
                  onChange={(e) => setShipping(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Payment Method</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option>Cash</option>
                  <option>Online</option>
                  <option>Cheque</option>
                  <option>Credit</option>
                </select>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-sm text-gray-600">Note (optional)</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={invoiceNote}
                  onChange={(e) => setInvoiceNote(e.target.value)}
                  placeholder="E.g. Delivery in 3 days..."
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Amount Paid Now</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border rounded px-3 py-2"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                />
              </div>

              <div className="bg-gray-50 p-3 rounded border">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{currency(subTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>GST:</span>
                  <span className="font-semibold">{currency(totalGst)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Discount:</span>
                  <span className="font-semibold">- {currency(discountAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Shipping:</span>
                  <span className="font-semibold">{currency(shipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2 border-t pt-2">
                  <span>Grand Total:</span>
                  <span>{currency(grandTotal)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-semibold ${paymentStatus === "Paid" ? "text-green-600" : paymentStatus === "Partial" ? "text-yellow-600" : "text-red-600"}`}>
                    {paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={saveInvoice} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                <FaSave /> Save Invoice
              </button>
              <button
                onClick={() => {
                  const customer = customers.find((c) => c.id === invoiceCustomerId) || { name: "Unknown" };
                  const billPreview = {
                    id: `PREVIEW-${new Date().getTime()}`,
                    date: new Date().toISOString().split("T")[0],
                    customer,
                    items: lineItems.map((li) => ({ ...li })),
                    discount: discountPercent,
                    shipping,
                    note: invoiceNote,
                    payment: { method: paymentMethod, paid: Number(paidAmount || 0) },
                  };
                  setViewBill(billPreview);
                }}
                className="bg-gray-200 px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-300"
              >
                Preview
              </button>
              <button
                onClick={() => {
                  if (confirm("Clear invoice form?")) resetInvoiceForm();
                }}
                className="bg-red-50 text-red-600 px-4 py-2 rounded border hover:bg-red-100"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Right: Bills list */}
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <FaFileInvoiceDollar /> Recent Invoices
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    placeholder="Search invoices..."
                    className="border rounded pl-10 pr-3 py-2"
                    value={billSearch}
                    onChange={(e) => setBillSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {filteredBills.length === 0 && <div className="text-gray-500 p-3 text-center">No invoices found</div>}
              {filteredBills.map((b) => (
                <div key={b.id} className="border rounded p-3 flex justify-between items-start gap-2 hover:bg-gray-50">
                  <div>
                    <div className="font-medium">{b.id}</div>
                    <div className="text-sm text-gray-500">{b.date} • {b.customer?.name}</div>
                    <div className="text-sm mt-1 flex items-center gap-1">
                      <FaRupeeSign className="text-gray-400" /> 
                      {currency(b.items.reduce((s, it) => s + it.price * it.qty, 0))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setViewBill(b); }} className="text-blue-600 hover:text-blue-800" title="View">
                      <FaSearch />
                    </button>
                    <button onClick={() => downloadInvoiceCSV(b)} className="text-gray-600 hover:text-gray-800" title="Download">
                      <FaDownload />
                    </button>
                    <button onClick={() => printInvoice(b)} className="text-gray-600 hover:text-gray-800" title="Print">
                      <FaPrint />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Tip: Use the product search to quickly add lines. You can edit qty, price and GST per-line.
            </div>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="bg-white rounded-xl p-4 shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaBoxes /> Product Management
            </h2>
            <div className="flex gap-3">
              <input
                placeholder="Search products..."
                className="border rounded px-3 py-2"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add/Edit Product Form */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product ID*</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={editingProduct?.id || newProduct.id}
                    onChange={(e) => 
                      editingProduct 
                        ? setEditingProduct({...editingProduct, id: e.target.value})
                        : setNewProduct({...newProduct, id: e.target.value})
                    }
                    placeholder="e.g. P001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={editingProduct?.name || newProduct.name}
                    onChange={(e) => 
                      editingProduct 
                        ? setEditingProduct({...editingProduct, name: e.target.value})
                        : setNewProduct({...newProduct, name: e.target.value})
                    }
                    placeholder="e.g. Pine Wood (1ft)"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full border rounded px-3 py-2"
                      value={editingProduct?.price || newProduct.price}
                      onChange={(e) => 
                        editingProduct 
                          ? setEditingProduct({...editingProduct, price: Number(e.target.value)})
                          : setNewProduct({...newProduct, price: Number(e.target.value)})
                      }
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST %</label>
                    <input
                      type="number"
                      min="0"
                      max="28"
                      className="w-full border rounded px-3 py-2"
                      value={editingProduct?.gst || newProduct.gst}
                      onChange={(e) => 
                        editingProduct 
                          ? setEditingProduct({...editingProduct, gst: Number(e.target.value)})
                          : setNewProduct({...newProduct, gst: Number(e.target.value)})
                      }
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={editingProduct?.unit || newProduct.unit}
                      onChange={(e) => 
                        editingProduct 
                          ? setEditingProduct({...editingProduct, unit: e.target.value})
                          : setNewProduct({...newProduct, unit: e.target.value})
                      }
                      placeholder="e.g. pcs, kg, sheet"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={editingProduct?.category || newProduct.category}
                      onChange={(e) => 
                        editingProduct 
                          ? setEditingProduct({...editingProduct, category: e.target.value})
                          : setNewProduct({...newProduct, category: e.target.value})
                      }
                      placeholder="e.g. Wood, Hardware"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  {editingProduct ? (
                    <>
                      <button 
                        onClick={updateProduct}
                        className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                      >
                        <FaSave /> Update Product
                      </button>
                      <button 
                        onClick={() => setEditingProduct(null)}
                        className="bg-gray-200 px-4 py-2 rounded flex items-center gap-2"
                      >
                        <FaTimes /> Cancel
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={addNewProduct}
                      className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                      <FaPlus /> Add Product
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Product List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Product List</h3>
              <div className="overflow-y-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Price</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{p.id}</td>
                        <td className="p-2">{p.name}</td>
                        <td className="p-2">{currency(p.price)}</td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setEditingProduct(p)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => deleteProduct(p.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "customers" && (
        <div className="bg-white rounded-xl p-4 shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaUsers /> Customer Management
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add/Edit Customer Form */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID*</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={editingCustomer?.id || newCustomer.id}
                    onChange={(e) => 
                      editingCustomer 
                        ? setEditingCustomer({...editingCustomer, id: e.target.value})
                        : setNewCustomer({...newCustomer, id: e.target.value})
                    }
                    placeholder="e.g. C001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name*</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={editingCustomer?.name || newCustomer.name}
                    onChange={(e) => 
                      editingCustomer 
                        ? setEditingCustomer({...editingCustomer, name: e.target.value})
                        : setNewCustomer({...newCustomer, name: e.target.value})
                    }
                    placeholder="e.g. John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={editingCustomer?.phone || newCustomer.phone}
                    onChange={(e) => 
                      editingCustomer 
                        ? setEditingCustomer({...editingCustomer, phone: e.target.value})
                        : setNewCustomer({...newProduct, phone: e.target.value})
                    }
                    placeholder="e.g. 9876543210"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full border rounded px-3 py-2"
                    value={editingCustomer?.email || newCustomer.email}
                    onChange={(e) => 
                      editingCustomer 
                        ? setEditingCustomer({...editingCustomer, email: e.target.value})
                        : setNewCustomer({...newCustomer, email: e.target.value})
                    }
                    placeholder="e.g. john@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    value={editingCustomer?.address || newCustomer.address}
                    onChange={(e) => 
                      editingCustomer 
                        ? setEditingCustomer({...editingCustomer, address: e.target.value})
                        : setNewCustomer({...newCustomer, address: e.target.value})
                    }
                    placeholder="Full address"
                    rows="3"
                  />
                </div>
                
                <div className="flex gap-2 mt-4">
                  {editingCustomer ? (
                    <>
                      <button 
                        onClick={updateCustomer}
                        className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                      >
                        <FaSave /> Update Customer
                      </button>
                      <button 
                        onClick={() => setEditingCustomer(null)}
                        className="bg-gray-200 px-4 py-2 rounded flex items-center gap-2"
                      >
                        <FaTimes /> Cancel
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={addNewCustomer}
                      className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                      <FaPlus /> Add Customer
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Customer List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer List</h3>
              <div className="overflow-y-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Phone</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{c.id}</td>
                        <td className="p-2">{c.name}</td>
                        <td className="p-2">{c.phone}</td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setEditingCustomer(c)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => deleteCustomer(c.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Bill Modal */}
      {viewBill && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">Invoice: {viewBill.id}</h2>
                <div className="text-sm text-gray-500">{viewBill.date}</div>
                <div className="mt-2"><strong>Bill To:</strong> {viewBill.customer?.name}</div>
                <div className="text-sm text-gray-500">{viewBill.customer?.address}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { downloadInvoiceCSV(viewBill); }} className="px-3 py-1 border rounded flex items-center gap-2">
                  <FaDownload /> Download
                </button>
                <button onClick={() => { printInvoice(viewBill); }} className="px-3 py-1 border rounded flex items-center gap-2">
                  <FaPrint /> Print
                </button>
                <button onClick={() => setViewBill(null)} className="px-3 py-1 border rounded">Close</button>
              </div>
            </div>

            <table className="w-full mt-4 border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Product</th>
                  <th className="p-2 border">Qty</th>
                  <th className="p-2 border">Price</th>
                  <th className="p-2 border">GST%</th>
                  <th className="p-2 border">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {viewBill.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{it.name}</td>
                    <td className="p-2 border">{it.qty}</td>
                    <td className="p-2 border">{currency(it.price)}</td>
                    <td className="p-2 border">{it.gst}%</td>
                    <td className="p-2 border">{currency(it.price * it.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-end gap-4">
              <div className="text-right">
                <div>Subtotal: {currency(viewBill.items.reduce((s, it) => s + it.price * it.qty, 0))}</div>
                <div>GST: {currency(viewBill.items.reduce((s, it) => s + (it.price * it.qty * it.gst) / 100, 0))}</div>
                <div>Discount: {viewBill.discount}%</div>
                <div>Shipping: {currency(viewBill.shipping)}</div>
                <div className="text-xl font-bold mt-2">Total: {currency(
                  viewBill.items.reduce((s, it) => s + it.price * it.qty, 0) -
                    (viewBill.discount / 100) * viewBill.items.reduce((s, it) => s + it.price * it.qty, 0) +
                    viewBill.items.reduce((s, it) => s + (it.price * it.qty * it.gst) / 100, 0) +
                    (viewBill.shipping || 0)
                )}</div>
                <div className="mt-2 text-sm">Paid: {currency(viewBill.payment?.paid || 0)} • Method: {viewBill.payment?.method || "-"}</div>
              </div>
            </div>

            {viewBill.note && <div className="mt-4 text-sm text-gray-600">Note: {viewBill.note}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;