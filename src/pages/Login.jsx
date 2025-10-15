// src/pages/Login.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useLoginAdminMutation,
  useVerifyAdminMutation,
} from "../redux/apis/authApi";

const Login = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const [loginAdmin, { isLoading: loginLoading, isSuccess: loginSuccess, data: loginData, error: loginError }] =
    useLoginAdminMutation();

  const [verifyAdmin, { isLoading: verifyLoading, isSuccess: verifySuccess, data: verifyData, error: verifyError }] =
    useVerifyAdminMutation();

  const navigate = useNavigate();
  const otpInputs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (loginSuccess) {
      toast.success("OTP sent to your email");
      setStep(2);
      setCountdown(60);
      setTimeout(() => otpInputs.current[0]?.focus(), 150);
    } else if (loginError) {
      toast.error(loginError?.data?.message || "Failed to send OTP");
    }
  }, [loginSuccess, loginError]);

  useEffect(() => {
    if (verifySuccess && verifyData) {
      // Save token & admin to localStorage (very important)
      try {
        localStorage.setItem("token", verifyData.token);
        localStorage.setItem("admin", JSON.stringify(verifyData.admin));
      } catch (e) {
        console.error("Failed to save auth info:", e);
      }
      toast.success("Login successful!");
      // Navigate now that token is saved
      navigate("/");
    } else if (verifyError) {
      toast.error(verifyError?.data?.message || "Invalid OTP");
    }
  }, [verifySuccess, verifyError, verifyData, navigate]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Please enter email");
    try {
      await loginAdmin({ email }).unwrap();
    } catch (err) {
      // handled by effect above
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) otpInputs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpInputs.current[index - 1]?.focus();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 4) {
      toast.error("Please enter 4-digit OTP");
      return;
    }
    try {
      await verifyAdmin({ email, otp: otpString }).unwrap();
    } catch (err) {
      // handled by effect above
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsResending(true);
    try {
      await loginAdmin({ email }).unwrap();
      setCountdown(60);
      toast.success("New OTP sent!");
    } catch (err) {
      toast.error("Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#01BCD4] to-[#0196a7] py-8 px-6 text-white text-center">
          <h2 className="text-2xl font-semibold">Admin Login</h2>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginLoading}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#01BCD4]"
              />
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 text-white rounded-lg bg-gradient-to-r from-[#01BCD4] to-[#0196a7]"
              >
                {loginLoading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <p className="text-sm text-gray-600 text-center">
                Enter the 4-digit OTP sent to <b>{email}</b>
              </p>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    ref={(el) => (otpInputs.current[index] = el)}
                    className="w-12 h-12 text-center border text-xl rounded-lg focus:ring-2 focus:ring-[#01BCD4]"
                  />
                ))}
              </div>
              <div className="text-center text-sm text-gray-500">
                {countdown > 0 ? (
                  <>Resend in {countdown}s</>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="text-[#01BCD4]"
                  >
                    {isResending ? "Resending..." : "Resend OTP"}
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={verifyLoading}
                className="w-full py-3 text-white rounded-lg bg-gradient-to-r from-[#01BCD4] to-[#0196a7]"
              >
                {verifyLoading ? "Verifying..." : "Verify & Login"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
