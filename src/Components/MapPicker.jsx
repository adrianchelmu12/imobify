import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const IASI_CENTER = [47.1585, 27.6014];

function MapClickHandler({ onClick }) {
  useMapEvents({ click(e) { onClick(e.latlng); } });
  return null;
}

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapPicker({ lat, lng, address, onChange, height = 280 }) {
  const [position, setPosition] = useState(lat && lng ? [lat, lng] : null);
  const timerRef = useRef(null);
  const hasManualPin = useRef(false);
  const lastAddress = useRef(address);

  useEffect(() => {
    if (lat && lng) setPosition([lat, lng]);
  }, [lat, lng]);

  useEffect(() => {
    if (!address || !address.trim() || address === lastAddress.current) return;
    lastAddress.current = address;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", România")}&limit=1`
        );
        const data = await res.json();
        if (data.length > 0) {
          const { lat: newLat, lon: newLng } = data[0];
          const parsedLat = parseFloat(newLat);
          const parsedLng = parseFloat(newLng);
          setPosition([parsedLat, parsedLng]);
          onChange(parsedLat, parsedLng);
        }
      } catch {}
    }, 800);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [address]);

  const handleClick = useCallback(
    (latlng) => {
      hasManualPin.current = true;
      setPosition([latlng.lat, latlng.lng]);
      onChange(latlng.lat, latlng.lng);
    },
    [onChange]
  );

  const handleDrag = useCallback(
    (e) => {
      hasManualPin.current = true;
      const { lat, lng } = e.target.getLatLng();
      setPosition([lat, lng]);
      onChange(lat, lng);
    },
    [onChange]
  );

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", height, border: "1px solid var(--border-tertiary)" }}>
      <MapContainer
        center={position || IASI_CENTER}
        zoom={position ? 16 : 13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onClick={handleClick} />
        {position && <FlyTo center={position} />}
        {position && (
          <Marker
            position={position}
            draggable
            eventHandlers={{ dragend: handleDrag }}
          />
        )}
      </MapContainer>
      <div style={{ padding: "6px 10px", fontSize: 11, color: "var(--text-tertiary)", background: "var(--bg-secondary)", borderTop: "1px solid var(--border-tertiary)", display: "flex", justifyContent: "space-between" }}>
        <span>{position ? `${position[0].toFixed(6)}, ${position[1].toFixed(6)}` : "Dă click pe hartă sau tastează adresa"}</span>
        <span>{position ? "Pin-ul poate fi mutat" : ""}</span>
      </div>
    </div>
  );
}
