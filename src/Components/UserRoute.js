import { Navigate } from "react-router-dom";

const UserRoute = ({ children }) => {
  const isSignedIn = localStorage.getItem("status");

  return isSignedIn ? children : <Navigate to="/sign-in" />;
};

export default UserRoute;
