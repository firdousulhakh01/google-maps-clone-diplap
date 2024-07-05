import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ButtonUsage() {
  const navigate = useNavigate();
  const divStyle = {
    backgroundImage: "url(/background.jpg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    width: "100vw",
    height: "100vh",
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/sign-in");
    }, 2000);
    localStorage.clear();
    console.log("IntroUseEffect");
    return () => clearTimeout(timer);
  }, [navigate]);
  return <div style={divStyle}></div>;
}
