import MarkerClusterGroup from "react-leaflet-cluster";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { useRef, useState } from "react";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useQuery } from "@tanstack/react-query";
import { getMapPins, type MapPin } from "../../api/mapApi";
import ProjectQuickViewPanel from "./ProjectQuickViewPanel";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Tự tạo icon ghim, vì icon mặc định của Leaflet bị lỗi khi dùng Vite
const pinIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapInteractionTracker({
  onInteractionChange,
}: {
  onInteractionChange: (interacting: boolean) => void;
}) {
  const activeInteractions = useRef(new Set<string>());

  useMapEvents({
    dragstart: () => {
      activeInteractions.current.add("drag");
      onInteractionChange(true);
    },
    dragend: () => {
      activeInteractions.current.delete("drag");
      onInteractionChange(activeInteractions.current.size > 0);
    },
    zoomstart: () => {
      activeInteractions.current.add("zoom");
      onInteractionChange(true);
    },
    zoomend: () => {
      activeInteractions.current.delete("zoom");
      onInteractionChange(activeInteractions.current.size > 0);
    },
  });

  return null;
}

export default function MapView() {
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  const { data: pins = [] } = useQuery({
    queryKey: ["map-pins"],
    queryFn: getMapPins,
  });

  return (
    <>
      <MapContainer
        center={[16.0544, 108.2022]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <MapInteractionTracker onInteractionChange={setIsMapInteracting} />
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup chunkedLoading>
          {pins.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              icon={pinIcon}
              eventHandlers={{
                click: () => setSelectedPin(pin),
              }}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>
      <ProjectQuickViewPanel
        pin={selectedPin}
        onClose={() => setSelectedPin(null)}
        disableTransition={isMapInteracting}
      />
    </>
  );
}
