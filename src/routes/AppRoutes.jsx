import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import RevenueReports from '../subscriptions/RevenueReports'
import TransactionList from '../subscriptions/TransactionList'
import Customers from '../pages/Customers'
import Billing from '../pages/Billing'
import Inventory from '../pages/Salary'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import NotFound from '../components/NotFound'
import Attendance from '../pages/Attendance'
import TeacherAR from '../pages/TeacherAR'
import Schedule from '../pages/Shedule'
import Leaverequest from '../pages/Leaverequest'
import Salary from '../pages/Salary'
import Dashboard from '../pages/Dashboard'
import PublicRoute from '../components/PublicRoute'
import Login from '../pages/Login'
import Student from '../pages/Student'

const AppRoutes = () => {
    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <Routes>
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />

                <Route
                    path="/"
                    element={
                        
                            <AdminLayout />
                       
                    }
                >
                    <Route index element={<Dashboard/>} />
                    <Route path="Schedule" element={<Schedule />} />
                    <Route path="Leaverequest" element={<Leaverequest />} />
                    <Route path="TeacherAR" element={<TeacherAR/>} />
                    <Route path="billing" element={<Billing />} />
                    <Route path="salary" element={<Salary />} />
                    <Route path="revenuereports" element={<RevenueReports />} />
                    <Route path="transactionlist" element={<TransactionList />} />
                     <Route path="Attendance" element={<Attendance />} />
                     <Route path="student" element={<Student />} />
                   


                </Route>

                {/* Page Not Found Route */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    )
}

export default AppRoutes
