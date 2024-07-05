import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { CssBaseline } from "@mui/material";

import IntroPage from "./Components/IntroPage";
import SignInPage from "./Components/SignInPage";
import SignUpPage from "./Components/SignUpPage";
import Home from "./Components/Home";
import UserRoute from "./Components/UserRoute";
import Maps from "./Components/Maps";

const App = () => {
  return (
    <Router>
      <div>
        <CssBaseline />
        <Routes>
          <Route
            path="/"
            element={
              <Home>
                <IntroPage />
              </Home>
            }
          />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route
            path="/user"
            element={
              <UserRoute>
                <Maps />
              </UserRoute>
            }
          />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
};

export default App;
