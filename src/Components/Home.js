import { Navigate } from "react-router-dom";

const Home = ({ children }) => {
  const isSignedIn = localStorage.getItem("status");

  return isSignedIn ? <Navigate to="/user" /> : children;
};

export default Home;
