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
import {
  Box,
  Paper,
  InputBase,
  IconButton,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import HistoryIcon from "@mui/icons-material/History";

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
    if (searchHistory.length === 1) setIsHistoryVisible(false);
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
      <Grid
        container
        sx={{
          justifyContent: {
            xs: "center",
            sm: "flex-start",
          },
          position: "absolute",
          top: "12.5px",
          zIndex: 10,
          marginLeft: { sm: "25px" },
        }}
      >
        <Grid item xs={10} sm={8} md={6} lg={5}>
          <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
            <Box display={"flex"}>
              <Paper
                component="form"
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  width: 400,
                }}
              >
                {searchHistory.length > 0 ? (
                  <>
                    <IconButton sx={{ p: "10px" }} aria-label="menu">
                      <HistoryIcon
                        onClick={toggleHistory}
                        sx={{
                          backgroundColor: isHistoryVisible ? "lightblue" : "",
                        }}
                      />
                    </IconButton>
                    <Divider
                      sx={{ height: 28, m: 0.5 }}
                      orientation="vertical"
                    />
                  </>
                ) : (
                  ""
                )}

                <InputBase
                  sx={{
                    ml: 1,
                    flex: 1,
                  }}
                  placeholder="Search Google Maps"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  ref={inputRef}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  inputProps={{ "aria-label": "search google maps" }}
                />
                {inputValue ? (
                  <IconButton
                    type="button"
                    sx={{ p: "10px" }}
                    aria-label="clear"
                    onClick={handleClearInput}
                  >
                    <ClearIcon />
                  </IconButton>
                ) : (
                  ""
                )}
              </Paper>
              <Button
                variant="contained"
                onClick={handleLogOut}
                sx={{ marginLeft: "20px", alignSelf: "center" }}
                size="small"
              >
                LogOut
              </Button>
            </Box>
          </Autocomplete>

          {isHistoryVisible && searchHistory.length > 0 && (
            <div
              className="search-history"
              style={{
                width: "75%",
                marginTop: "3px",
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
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </Grid>
      </Grid>

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
