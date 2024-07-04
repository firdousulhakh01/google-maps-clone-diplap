import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Autocomplete,
  Marker,
  OverlayView,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 40.712776,
  lng: -74.005974,
};

const MapComponent = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "YOUR_API_KEY_HERE",
    libraries: ["places"],
  });

  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [photoUrl, setPhotoUrl] = useState("");
  const [searchHistory, setSearchHistory] = useState(() => {
    const history = localStorage.getItem("searchHistory");
    return history ? JSON.parse(history) : [];
  });
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  const onLoad = (autoC) => {
    setAutocomplete(autoC);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
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
          <button
            onClick={handleClearInput}
            style={{
              position: "absolute",
              right: "0",
              top: "0",
              height: "100%",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            ✖
          </button>
        </div>
      </Autocomplete>
      <button
        onClick={toggleHistory}
        style={{
          position: "absolute",
          top: "50px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        {isHistoryVisible ? "Hide History" : "Show History"}
      </button>
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
            >
              <span>{place.description}</span>
              <button
                onClick={() => handleDeleteHistory(place.description)}
                style={{ marginLeft: "10px" }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={10}
        onLoad={onMapLoad}
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
