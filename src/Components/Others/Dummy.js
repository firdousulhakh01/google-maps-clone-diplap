import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ButtonUsage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/sign-in");
    }, 3000);
    localStorage.clear();
    console.log("IntroUseEffect");
    return () => clearTimeout(timer);
  }, [navigate]);
  return <h1>IntroPage...</h1>;
}
