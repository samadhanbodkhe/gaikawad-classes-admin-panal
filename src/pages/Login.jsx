import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {  useLoginAdminMutation, useVerifyAdminMutation,  } from '../redux/apis/authApi';

const Login = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [countdown, setCountdown] = useState(0);
    const [isResending, setIsResending] = useState(false);

    const [loginStaff, {
        isLoading: loginLoading,
        isError: isLoginError,
        error: loginError,
        isSuccess: isLoginSuccess
    }] = useLoginAdminMutation();

    const [verifyStaff, {
        isLoading: verifyLoading,
        isError: isVerifyError,
        error: verifyError,
        isSuccess: isVerifySuccess
    }] = useVerifyAdminMutation();

    const navigate = useNavigate();
    const otpInputs = useRef([]);

    // Countdown timer
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => {
        if (isLoginSuccess) {
            setStep(2);
            setCountdown(60);
            toast.success('OTP sent to your email');

            // Focus first OTP input
            if (otpInputs.current[0]) {
                setTimeout(() => otpInputs.current[0].focus(), 100);
            }
        }
        if (isLoginError && loginError) {
            toast.error(loginError.data?.message || 'Failed to send OTP');
        }
    }, [isLoginSuccess, isLoginError, loginError]);

    useEffect(() => {
        if (isVerifySuccess) {
            toast.success('Login successful! Redirecting...');
            setTimeout(() => navigate('/'));
        }
        if (isVerifyError && verifyError) {
            toast.error(verifyError.data?.message || 'Invalid OTP');
        }
    }, [isVerifySuccess, isVerifyError, verifyError, navigate]);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('⚠️ Please enter your email address');
            return;
        }
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
            toast.error('⚠️ Please enter a valid email address');
            return;
        }
        try {
            await loginStaff({ email }).unwrap();
        } catch (err) {
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            otpInputs.current[index + 1].focus();
        }

        if (newOtp.every(val => val !== '') && index === 5) {
            handleOtpSubmit();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputs.current[index - 1].focus();
        }
    };

    const handleOtpSubmit = async (e) => {
        if (e) e.preventDefault();

        const otpString = otp.join('');
        if (!otpString || otpString.length !== 4) {
            return
        }
        try {
            await verifyStaff({ email, otp: otpString }).unwrap();
        } catch (err) {
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (countdown > 0) return;

        setIsResending(true);
        try {
            await loginStaff({ email }).unwrap();
            setCountdown(60);
            toast.success('New OTP sent to your email');
        } catch (err) {
            // Error handling is done in the useEffect
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 px-4 py-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header with Logo */}
                <div className="bg-gradient-to-r from-[#01BCD4] to-[#0196a7] py-8 px-6 text-white flex flex-col items-center justify-center">
                    {/* Logo */}
                    <img
                        src="https://images.unsplash.com/photo-1750816204148-5d02aff367cb?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Nexkites Logo"
                        className="h-32 w-auto  bg-white p-2 rounded-xl shadow-md"
                    />

                    {/* Text */}
                    <p className="mt-3 text-lg font-medium tracking-wide opacity-95">
                        Admin Panal
                    </p>
                </div>


                {/* Content */}
                <div className="p-8">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
                    </div>

                    {/* Step 1 - Email */}
                    {step === 1 ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01BCD4] focus:border-transparent transition-colors"
                                    placeholder="Enter your registered email"
                                    disabled={loginLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loginLoading}
                                className="w-full py-3 px-4 rounded-lg text-white font-medium bg-gradient-to-r from-[#01BCD4] to-[#0196a7] hover:from-[#0196a7] hover:to-[#017980] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01BCD4] disabled:opacity-70 transition-colors flex items-center justify-center"
                            >
                                {loginLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending OTP...
                                    </>
                                ) : 'Send OTP'}
                            </button>

                            <div className="text-center pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <Link
                                        to="/register"
                                        className="font-medium text-[#01BCD4] hover:underline"
                                    >
                                        Create an account
                                    </Link>
                                </p>
                            </div>
                        </form>
                    ) : (
                        // Step 2 - OTP
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Code
                                </label>
                                <p className="text-sm text-gray-600 mb-4">
                                    Enter the 6-digit code sent to <span className="font-medium">{email}</span>
                                </p>

                                <div className="flex justify-between space-x-2">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            ref={(el) => (otpInputs.current[index] = el)}
                                            className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01BCD4] focus:border-transparent"
                                        />
                                    ))}
                                </div>

                                <div className="mt-4 text-center">
                                    {countdown > 0 ? (
                                        <p className="text-sm text-gray-500">
                                            Resend code in <span className="font-medium">{countdown}</span> seconds
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={isResending}
                                            className="text-sm font-medium text-[#01BCD4] hover:underline disabled:opacity-50"
                                        >
                                            {isResending ? 'Resending...' : 'Resend code'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={verifyLoading}
                                    className="w-full py-3 px-4 rounded-lg text-white font-medium bg-gradient-to-r from-[#01BCD4] to-[#0196a7] hover:from-[#0196a7] hover:to-[#017980] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01BCD4] disabled:opacity-70 transition-colors flex items-center justify-center"
                                >
                                    {verifyLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Verifying...
                                        </>
                                    ) : 'Verify & Login'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep(1);
                                        setOtp(['', '', '', '', '', '']);
                                    }}
                                    className="w-full py-3 px-4 rounded-lg text-gray-700 font-medium border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    Back to Email
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-100 px-8 py-4 text-center">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} Billing Engine. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;