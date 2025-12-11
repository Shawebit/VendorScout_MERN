import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Create a custom red dot icon
const redDotIcon = L.divIcon({
  className: 'custom-red-dot',
  html: '<div style="background-color: red; width: 16px; height: 16px; border-radius: 50%;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8]
});

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png"
});

export default function VendorMap({ vendors }) {
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

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <MapContainer
        center={getMapCenter()}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors"
        />

        {vendors.map((vendor) => {
          // Vendor must have coordinates: { type: "Point", coordinates: [lng, lat] }
          if (!vendor.location?.coordinates) return null;

          const [lng, lat] = vendor.location.coordinates;

          return (
            <Marker 
              key={vendor._id} 
              position={[lat, lng]}
              icon={redDotIcon}
            >
              <Popup>
                <strong>{vendor.businessName}</strong><br />
                {vendor.phoneNumber && (
                  <span>{vendor.phoneNumber}<br /></span>
                )}
                {vendor.status && (
                  <span>Status: {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}<br /></span>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}