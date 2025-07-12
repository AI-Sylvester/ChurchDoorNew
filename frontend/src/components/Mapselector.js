import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LocationMarker = ({ onChange }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onChange(`${e.latlng.lat},${e.latlng.lng}`);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const MapSelector = ({ value, onChange }) => {
  const [initialPos, setInitialPos] = useState([10.7905, 78.7047]); // Default: Trichy
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setInitialPos([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      (err) => {
        console.warn('Geolocation failed, using default:', err);
        setLoading(false);
      }
    );
  }, []);

  if (loading) return <div>Loading map...</div>;

  return (
    <div style={{ height: '250px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer center={initialPos} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onChange={onChange} />
      </MapContainer>
    </div>
  );
};

export default MapSelector;