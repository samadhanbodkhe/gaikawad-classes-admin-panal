import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-6xl font-bold text-red-600">404</h1>
            <p className="text-xl mt-4">Page Not Found</p>
            <Link to="/" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg">
                Go to Dashboard
            </Link>
        </div>
    );
};

export default NotFound;
