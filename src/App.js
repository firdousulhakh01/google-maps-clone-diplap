import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { CssBaseline } from "@mui/material";

import Dummy from "./Components/Others/Dummy";
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
                <Dummy />
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
      </div>
    </Router>
  );
};

export default App;
