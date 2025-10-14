import React, { useState } from "react";
import {
  FaCog,
  FaMoneyBill,
  FaBell,
  FaListAlt,
  FaBox,
  FaSave,
  FaUndo,
  FaUser,
  FaUpload,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    general: {
      companyName: "Petpooja Billing",
      address: "123 Business Street, Mumbai",
      phone: "+91 9876543210",
      email: "admin@petpooja.com",
      currency: "INR",
      timezone: "Asia/Kolkata",
    },
    payment: {
      razorpayKey: "rzp_test_xxxxxxxx",
      razorpaySecret: "xxxxxxxxxxxxxxxx",
      stripeKey: "pk_test_xxxxxxxx",
      stripeSecret: "sk_test_xxxxxxxx",
      paypalClientId: "xxxxxxxxxxxxxxxx",
      enableRazorpay: true,
      enableStripe: false,
      enablePaypal: false,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      lowBalanceAlert: true,
      newUserAlert: true,
      paymentReceivedAlert: true,
      emailAddress: "notifications@petpooja.com",
      smsNumber: "+91 9876543210",
    },
    invoice: {
      logo: "",
      taxRate: 18,
      invoicePrefix: "INV",
      dueDays: 15,
      notes: "Thank you for your business!",
      showLogo: true,
      showTaxDetails: true,
      termsAndConditions: "Goods once sold will not be taken back.",
    },
    personal: {
      name: "Rajesh Kumar",
      email: "rajesh@petpooja.com",
      phone: "+91 9876543210",
      role: "Administrator",
      language: "English",
      dateFormat: "DD/MM/YYYY",
      enableDarkMode: false,
      notifications: true,
    },
  });

  const [originalSettings] = useState(JSON.parse(JSON.stringify(settings)));
  const [saveStatus, setSaveStatus] = useState(null);

  const handleInputChange = (category, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleToggleChange = (category, field) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field],
      },
    }));
  };

  const handleSave = () => {
    // Simulate API call
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 2000);
    }, 1000);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all changes?")) {
      setSettings(JSON.parse(JSON.stringify(originalSettings)));
      setSaveStatus("reset");
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  const renderSaveStatus = () => {
    if (saveStatus === "saving") {
      return <span className="ml-3 text-blue-500">Saving...</span>;
    }
    if (saveStatus === "success") {
      return (
        <span className="ml-3 text-green-500 flex items-center">
          <FaCheckCircle className="mr-1" /> Settings saved successfully!
        </span>
      );
    }
    if (saveStatus === "reset") {
      return (
        <span className="ml-3 text-gray-500 flex items-center">
          <FaUndo className="mr-1" /> Settings reset to defaults
        </span>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600">
            Manage your billing software configuration
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex flex-col sm:flex-row overflow-x-auto">
              <button
                className={`py-4 px-6 text-sm font-medium flex items-center ${
                  activeTab === "general"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("general")}
              >
                <FaCog className="mr-2" /> General
              </button>
              <button
                className={`py-4 px-6 text-sm font-medium flex items-center ${
                  activeTab === "payment"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("payment")}
              >
                <FaMoneyBill className="mr-2" /> Payment Gateways
              </button>
              <button
                className={`py-4 px-6 text-sm font-medium flex items-center ${
                  activeTab === "notifications"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("notifications")}
              >
                <FaBell className="mr-2" /> Notifications
              </button>
              <button
                className={`py-4 px-6 text-sm font-medium flex items-center ${
                  activeTab === "invoice"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("invoice")}
              >
                <FaListAlt className="mr-2" /> Invoice Settings
              </button>
              <button
                className={`py-4 px-6 text-sm font-medium flex items-center ${
                  activeTab === "personal"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("personal")}
              >
                <FaUser className="mr-2" /> Personal
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">General Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={settings.general.companyName}
                      onChange={(e) =>
                        handleInputChange("general", "companyName", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={settings.general.phone}
                      onChange={(e) =>
                        handleInputChange("general", "phone", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={settings.general.email}
                      onChange={(e) =>
                        handleInputChange("general", "email", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={settings.general.currency}
                      onChange={(e) =>
                        handleInputChange("general", "currency", e.target.value)
                      }
                    >
                      <option value="INR">Indian Rupee (INR)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="GBP">British Pound (GBP)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      value={settings.general.address}
                      onChange={(e) =>
                        handleInputChange("general", "address", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={settings.general.timezone}
                      onChange={(e) =>
                        handleInputChange("general", "timezone", e.target.value)
                      }
                    >
                      <option value="Asia/Kolkata">India (IST)</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                      <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Payment Gateway Settings</h2>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Razorpay</h3>
                    <p className="text-sm text-gray-600">Enable Razorpay payments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.payment.enableRazorpay}
                      onChange={() => handleToggleChange("payment", "enableRazorpay")}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.payment.enableRazorpay && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Razorpay Key
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={settings.payment.razorpayKey}
                        onChange={(e) =>
                          handleInputChange("payment", "razorpayKey", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Razorpay Secret
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={settings.payment.razorpaySecret}
                        onChange={(e) =>
                          handleInputChange("payment", "razorpaySecret", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Stripe</h3>
                    <p className="text-sm text-gray-600">Enable Stripe payments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.payment.enableStripe}
                      onChange={() => handleToggleChange("payment", "enableStripe")}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.payment.enableStripe && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stripe Key
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={settings.payment.stripeKey}
                        onChange={(e) =>
                          handleInputChange("payment", "stripeKey", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stripe Secret
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={settings.payment.stripeSecret}
                        onChange={(e) =>
                          handleInputChange("payment", "stripeSecret", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">PayPal</h3>
                    <p className="text-sm text-gray-600">Enable PayPal payments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.payment.enablePaypal}
                      onChange={() => handleToggleChange("payment", "enablePaypal")}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {settings.payment.enablePaypal && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="max-w-md">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PayPal Client ID
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={settings.payment.paypalClientId}
                        onChange={(e) =>
                          handleInputChange("payment", "paypalClientId", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Notification Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-3">Notification Channels</h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-700">Email Notifications</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.notifications.emailNotifications}
                          onChange={() => handleToggleChange("notifications", "emailNotifications")}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">SMS Notifications</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.notifications.smsNotifications}
                          onChange={() => handleToggleChange("notifications", "smsNotifications")}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-3">Contact Information</h3>
                    
                    <div className="mb-3">
                      <label className="block text-sm text-gray-700 mb-1">Email for Notifications</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        value={settings.notifications.emailAddress}
                        onChange={(e) => handleInputChange("notifications", "emailAddress", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">SMS Number</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        value={settings.notifications.smsNumber}
                        onChange={(e) => handleInputChange("notifications", "smsNumber", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-3">Alert Preferences</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-700">Low Balance Alerts</span>
                        <p className="text-sm text-gray-500">Get notified when your balance is low</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.notifications.lowBalanceAlert}
                          onChange={() => handleToggleChange("notifications", "lowBalanceAlert")}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-700">New User Alerts</span>
                        <p className="text-sm text-gray-500">Get notified when a new user signs up</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.notifications.newUserAlert}
                          onChange={() => handleToggleChange("notifications", "newUserAlert")}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-700">Payment Received Alerts</span>
                        <p className="text-sm text-gray-500">Get notified when you receive a payment</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.notifications.paymentReceivedAlert}
                          onChange={() => handleToggleChange("notifications", "paymentReceivedAlert")}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "invoice" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Invoice Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Prefix
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={settings.invoice.invoicePrefix}
                      onChange={(e) =>
                        handleInputChange("invoice", "invoicePrefix", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={settings.invoice.taxRate}
                      onChange={(e) =>
                        handleInputChange("invoice", "taxRate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Days
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={settings.invoice.dueDays}
                      onChange={(e) =>
                        handleInputChange("invoice", "dueDays", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Show Logo on Invoice</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.invoice.showLogo}
                        onChange={() => handleToggleChange("invoice", "showLogo")}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Notes
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    value={settings.invoice.notes}
                    onChange={(e) =>
                      handleInputChange("invoice", "notes", e.target.value)
                    }
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terms and Conditions
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    value={settings.invoice.termsAndConditions}
                    onChange={(e) =>
                      handleInputChange("invoice", "termsAndConditions", e.target.value)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Show Tax Details on Invoice</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.invoice.showTaxDetails}
                      onChange={() => handleToggleChange("invoice", "showTaxDetails")}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Logo
                  </label>
                  <div className="flex items-center">
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={settings.invoice.logo}
                        onChange={(e) =>
                          handleInputChange("invoice", "logo", e.target.value)
                        }
                        placeholder="Enter image URL or upload file"
                      />
                    </div>
                    <button className="ml-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center">
                      <FaUpload className="mr-2" /> Upload
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "personal" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Personal Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={settings.personal.name}
                      onChange={(e) =>
                        handleInputChange("personal", "name", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={settings.personal.email}
                      onChange={(e) =>
                        handleInputChange("personal", "email", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={settings.personal.phone}
                      onChange={(e) =>
                        handleInputChange("personal", "phone", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={settings.personal.role}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={settings.personal.language}
                      onChange={(e) =>
                        handleInputChange("personal", "language", e.target.value)
                      }
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Marathi">Marathi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Format
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={settings.personal.dateFormat}
                      onChange={(e) =>
                        handleInputChange("personal", "dateFormat", e.target.value)
                      }
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-3">Preferences</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Dark Mode</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.personal.enableDarkMode}
                          onChange={() => handleToggleChange("personal", "enableDarkMode")}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Notifications</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={settings.personal.notifications}
                          onChange={() => handleToggleChange("personal", "notifications")}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="p-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 border-t">
            <div className="text-sm text-gray-500">
              Make sure to save your changes before switching tabs
            </div>
            <div className="flex space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                onClick={handleReset}
              >
                <FaUndo className="mr-2" /> Reset
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                onClick={handleSave}
              >
                <FaSave className="mr-2" /> Save Changes
              </button>
            </div>
          </div>
          
          {/* Save Status */}
          <div className="px-6 pb-4 flex justify-end">
            {renderSaveStatus()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;