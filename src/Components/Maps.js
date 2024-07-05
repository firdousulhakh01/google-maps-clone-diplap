import React, { useState, useEffect, useRef } from "react";
import { auth } from "../Firebase/config";
import { useNavigate } from "react-router-dom";
import {
  GoogleMap,
  useJsApiLoader,
  Autocomplete,
  Marker,
  OverlayView,
} from "@react-google-maps/api";

const MapComponent = () => {
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [markerPosition, setMarkerPosition] = useState({});
  const [photoUrl, setPhotoUrl] = useState("");
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchHistory, setSearchHistory] = useState(() => {
    const history = localStorage.getItem("searchHistory");
    return history ? JSON.parse(history) : [];
  });

  const inputRef = useRef(null);
  const navigate = useNavigate();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setMarkerPosition({ lat: latitude, lng: longitude });
      }
    );
  }, []);

  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  const onLoad = (autoC) => {
    setAutocomplete(autoC);
    // console.log(autocomplete, "onload");
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      // console.log(place, "api details");

      const location = place.geometry?.location;
      if (location) {
        const newPlace = {
          description: place.formatted_address || place.name,
          location: { lat: location.lat(), lng: location.lng() },
          photoUrl:
            place.photos && place.photos[0]
              ? place.photos[0].getUrl({ maxWidth: 200 })
              : "",
        };

        setSearchHistory((prev) =>
          [
            newPlace,
            ...prev.filter((p) => p.description !== newPlace.description),
          ].slice(0, 5)
        );

        setMarkerPosition(newPlace.location);
        map.panTo(newPlace.location);
        setPhotoUrl(newPlace.photoUrl);
        setInputValue(newPlace.description);
      }
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
  };

  const onMapLoad = (map) => {
    setMap(map);
  };

  const handleLogOut = async () => {
    try {
      await auth.signOut();
      localStorage.clear();
      navigate("/sign-in");
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteHistory = (description) => {
    setSearchHistory((prev) =>
      prev.filter((place) => place.description !== description)
    );
  };

  const handleFocus = () => {
    if (autocomplete !== null) {
      autocomplete.setTypes([]);
      autocomplete.setBounds(null);
      autocomplete.setFields(["formatted_address", "geometry", "photos"]);
    }
  };

  const handleBlur = () => {
    if (autocomplete !== null) {
      autocomplete.setTypes(["establishment"]);
    }
  };

  const toggleHistory = () => {
    setIsHistoryVisible(!isHistoryVisible);
  };

  const handleClearInput = () => {
    setInputValue("");
    if (autocomplete) {
      autocomplete.setFields([]);
    }
  };

  const handleHistoryItemClick = (description) => {
    setInputValue(description);
  };

  if (loadError) {
    return <div>Map cannot be loaded right now, please try again later.</div>;
  }

  return isLoaded ? (
    <div style={{ position: "relative" }}>
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <div style={{ position: "relative" }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search places..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </Autocomplete>
      <div
        style={{
          boxSizing: `border-box`,
          border: `1px solid transparent`,
          height: `32px`,
          padding: `0 12px`,
          borderRadius: `3px`,
          fontSize: `14px`,
          outline: `none`,
          // textOverflow: `ellipsis`,
          position: "absolute",
          left: "50%",
          marginLeft: "-130px",
          top: "50px",
          zIndex: "10",
        }}
      >
        <button
          style={{
            marginRight: searchHistory.length > 0 ? "20px" : "130px",
          }}
          onClick={handleLogOut}
        >
          LogOut
        </button>

        {searchHistory.length > 0 && (
          <button
            onClick={toggleHistory}
            style={{
              marginRight: "20px",
            }}
          >
            {isHistoryVisible ? "Hide History" : "Show History"}
          </button>
        )}
        <button onClick={handleClearInput}>clear</button>
      </div>

      {isHistoryVisible && searchHistory.length > 0 && (
        <div
          className="search-history"
          style={{
            position: "absolute",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            background: "white",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
            borderRadius: "3px",
          }}
        >
          {searchHistory.map((place, index) => (
            <div
              key={index}
              className="history-item"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "5px 10px",
                borderBottom: "1px solid #ddd",
              }}
              onClick={() => handleHistoryItemClick(place.description)}
            >
              <span>{place.description}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteHistory(place.description);
                }}
                style={{ marginLeft: "10px" }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <GoogleMap
        mapContainerStyle={{
          width: "100%",
          height: "100vh",
        }}
        center={markerPosition}
        zoom={14}
        onLoad={onMapLoad}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        <Marker position={markerPosition} />

        {photoUrl && (
          <OverlayView
            position={markerPosition}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              style={{
                background: "white",
                padding: "5px",
                borderRadius: "5px",
                boxShadow: "0px 0px 10px rgba(0,0,0,0.5)",
              }}
            >
              <img
                src={photoUrl}
                alt="Place"
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            </div>
          </OverlayView>
        )}
      </GoogleMap>
    </div>
  ) : (
    <div>Loading...</div>
  );
};

export default MapComponent;
