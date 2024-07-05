import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const notifySuccess = () => {
    toast.success("This is a success message!", {
      position: "top-center",
      autoClose: 3000, // Close after 3 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const notifyError = () => {
    toast.error("This is an error message!", {
      position: "bottom-center",
      autoClose: 5000, // Close after 5 seconds
      hideProgressBar: true,
    });
  };

  return (
    <div>
      <button onClick={notifySuccess}>Show Success Toast</button>
      <button onClick={notifyError}>Show Error Toast</button>
      <ToastContainer />
    </div>
  );
};

export default App;
