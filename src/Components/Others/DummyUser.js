import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../Firebase/config";
import { getDoc, doc } from "firebase/firestore";

import { Button } from "@mui/material";

const DummyUser = () => {
  const [userDetails, setUserDetails] = useState();

  const navigate = useNavigate();

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userSnap = await getDoc(doc(db, "Users", user.uid));

        if (userSnap.exists()) {
          setUserDetails(userSnap.data());
        } else console.log("ErrorDummyUser");
      } else console.log("SignedOut");
    });
  };

  useEffect(() => {
    // localStorage.clear();
    fetchUserData();
  }, []);

  const handleLogOut = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("status");
      navigate("/sign-in");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div>
      {userDetails ? (
        <>
          <h3>{userDetails.firstName}</h3>
          <h3>{userDetails.lastName}</h3>
          <h3>{userDetails.email}</h3>
          <Button variant="contained" onClick={handleLogOut}>
            LogOut
          </Button>
        </>
      ) : (
        <h1>Loading</h1>
      )}
    </div>
  );
};

export default DummyUser;
