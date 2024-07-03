import React, { useState, useEffect } from "react";
import { auth } from "../Firebase/config";
import { useNavigate } from "react-router-dom";
import {
  GoogleMap,
  useJsApiLoader,
  Autocomplete,
  Marker,
} from "@react-google-maps/api";

const MapComponent = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [markerPosition, setMarkerPosition] = useState({});
  console.log(markerPosition, "test");
  useEffect(() => {
    console.log("OK");
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setMarkerPosition({ lat: latitude, lng: longitude });
      }
    );
  }, []);

  const onLoad = (autoC) => {
    setAutocomplete(autoC);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      const location = place.geometry?.location;
      if (location) {
        setMarkerPosition({
          lat: location.lat(),
          lng: location.lng(),
        });
        map.panTo({
          lat: location.lat(),
          lng: location.lng(),
        });
      }
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
  };
  const handleLogOut = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("status");
      navigate("/sign-in");
    } catch (error) {
      console.log(error.message);
    }
  };
  const onMapLoad = (map) => {
    setMap(map);
  };

  if (loadError) {
    return <div>Map cannot be loaded right now, please try again later.</div>;
  }

  return isLoaded ? (
    <div style={{ position: "relative" }}>
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <input
          type="text"
          placeholder="Search places..."
          style={{
            boxSizing: `border-box`,
            border: `1px solid transparent`,
            width: `240px`,
            height: `32px`,
            padding: `0 12px`,
            borderRadius: `3px`,
            boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
            fontSize: `14px`,
            outline: `none`,
            textOverflow: `ellipsis`,
            position: "absolute",
            left: "50%",
            marginLeft: "-120px",
            top: "10px",
            zIndex: "10",
          }}
        />
      </Autocomplete>
      <div
        style={{
          boxSizing: `border-box`,
          border: `1px solid transparent`,
          width: `48px`,
          height: `32px`,
          padding: `0 12px`,
          borderRadius: `3px`,
          fontSize: `14px`,
          outline: `none`,
          textOverflow: `ellipsis`,
          position: "absolute",
          left: "50%",
          marginLeft: "-500px",
          top: "18px",
          zIndex: "10",
        }}
      >
        <button style={{ color: "red" }} onClick={handleLogOut}>
          LogOut
        </button>
      </div>
      <GoogleMap
        mapContainerStyle={{
          width: "100%",
          height: "100vh",
        }}
        center={markerPosition}
        zoom={14}
        onLoad={onMapLoad}
      >
        <Marker position={markerPosition} />
      </GoogleMap>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default MapComponent;
