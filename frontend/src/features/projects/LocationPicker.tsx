import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Icon ghim tự tạo, vì icon mặc định của Leaflet bị lỗi khi dùng Vite
const pinIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

export type LatLng = { latitude: number; longitude: number };

type Props = {
  value: LatLng | null;
  onChange: (pos: LatLng) => void;
};

// Component con: lắng nghe sự kiện bấm lên bản đồ
function ClickHandler({ onChange }: { onChange: (pos: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onChange({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange }: Props) {
  return (
    <MapContainer
      center={[16.0544, 108.2022]}
      zoom={13}
      style={{ height: 320, width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={onChange} />
      {value && (
        <Marker position={[value.latitude, value.longitude]} icon={pinIcon} />
      )}
    </MapContainer>
  );
}
