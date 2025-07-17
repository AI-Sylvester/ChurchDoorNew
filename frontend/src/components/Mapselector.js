import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerRetina from 'leaflet/dist/images/marker-icon-2x.png';


// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ✅ Moved out to avoid ESLint warning
const DEFAULT_POS = [10.7905, 78.7047]; // Trichy

const DraggableMarker = ({ position, onChange }) => {
  const [markerPos, setMarkerPos] = useState(position);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const newPos = [lat, lng];
      setMarkerPos(newPos);
      onChange(`${lat},${lng}`);
    },
  });

  const handleDragEnd = (e) => {
    const { lat, lng } = e.target.getLatLng();
    const newPos = [lat, lng];
    setMarkerPos(newPos);
    onChange(`${lat},${lng}`);
  };

  return (
    <Marker
      position={markerPos}
      draggable
      eventHandlers={{ dragend: handleDragEnd }}
    />
  );
};

const MapSelector = ({ value, onChange }) => {
  const [position, setPosition] = useState(DEFAULT_POS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const setFromValue = () => {
      if (value) {
        const [lat, lng] = value.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          setPosition([lat, lng]);
          setLoading(false);
          return true;
        }
      }
      return false;
    };

    if (!setFromValue()) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!isMounted) return;
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setPosition(coords);
          onChange(`${coords[0]},${coords[1]}`);
          setLoading(false);
        },
        () => {
          if (!isMounted) return;
          onChange(`${DEFAULT_POS[0]},${DEFAULT_POS[1]}`);
          setLoading(false);
        }
      );
    }

    return () => {
      isMounted = false;
    };
  }, [value, onChange]); // ✅ no need for DEFAULT_POS anymore

  if (loading) return <div>Loading map...</div>;

  return (
    <div style={{ height: 300, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker position={position} onChange={onChange} />
      </MapContainer>
    </div>
  );
};

export default MapSelector;
