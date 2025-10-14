import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
    const staff = useSelector((state) => state.auth?.staff);

    if (staff) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicRoute;
