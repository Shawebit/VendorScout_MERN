import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import './VendorMap.css';

// Create a custom Google-style pin icon
const customMarkerIcon = L.divIcon({
  className: 'custom-vendor-marker',
  html: `<div class="marker-pin">
          <div class="pin-head"></div>
          <div class="pin-point"></div>
         </div>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -42]
});

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png"
});

export default function VendorMap({ vendors }) {
  const navigate = useNavigate();

  // Calculate center based on vendor coordinates
  const getMapCenter = () => {
    if (vendors.length > 0) {
      // Filter vendors with valid coordinates
      const vendorsWithCoords = vendors.filter(v => v.location?.coordinates);
      if (vendorsWithCoords.length > 0) {
        // Use the first vendor's coordinates as center
        const [lng, lat] = vendorsWithCoords[0].location.coordinates;
        return [lat, lng];
      }
    }
    // Default to India center
    return [20.5937, 78.9629];
  };

  const handleViewVendor = (vendorId) => {
    navigate(`/customer/vendor/${vendorId}`);
  };

  return (
    <div className="vendor-map-wrapper">
      <div className="leaflet-map-container">
        <MapContainer
          center={getMapCenter()}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="minimalist-map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
            className="grayscale-tiles"
          />

          {vendors.map((vendor) => {
            // Vendor must have coordinates: { type: "Point", coordinates: [lng, lat] }
            if (!vendor.location?.coordinates) return null;

            const [lng, lat] = vendor.location.coordinates;

            return (
              <Marker 
                key={vendor._id} 
                position={[lat, lng]}
                icon={customMarkerIcon}
              >
                <Popup className="custom-popup">
                  <div className="popup-content">
                    <h3 className="popup-title">{vendor.businessName}</h3>
                    {vendor.cuisineType && (
                      <p className="popup-cuisine">{vendor.cuisineType}</p>
                    )}
                    {vendor.phoneNumber && (
                      <p className="popup-phone">{vendor.phoneNumber}</p>
                    )}
                    {vendor.status && (
                      <span className={`popup-status status-${vendor.status}`}>
                        {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                      </span>
                    )}
                    <button 
                      className="popup-view-btn"
                      onClick={() => handleViewVendor(vendor._id)}
                    >
                      View Vendor Page
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}