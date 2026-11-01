import MarkerClusterGroup from "react-leaflet-cluster";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon, type Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Fab, SvgIcon } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  getMapPins,
  type MapBounds,
  type MapPin,
} from "../../api/mapApi";
import { getUniversities } from "../../api/universitiesApi";
import { getTags } from "../../api/tagsApi";
import ProjectQuickViewPanel from "./ProjectQuickViewPanel";
import ProjectSearchBar, {
  type ProjectSearchFilters,
} from "../search/ProjectSearchBar";
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
  onBoundsChange,
}: {
  onInteractionChange: (interacting: boolean) => void;
  onBoundsChange: (bounds: MapBounds) => void;
}) {
  const map = useMap();
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
      onBoundsChange(readMapBounds(map));
    },
    moveend: () => onBoundsChange(readMapBounds(map)),
  });

  return null;
}

function readMapBounds(map: LeafletMap): MapBounds {
  const bounds = map.getBounds();
  return {
    minLat: bounds.getSouth(),
    maxLat: bounds.getNorth(),
    minLng: bounds.getWest(),
    maxLng: bounds.getEast(),
  };
}

function MapInstanceBinder({
  onMapReady,
  onBoundsChange,
}: {
  onMapReady: (map: LeafletMap) => void;
  onBoundsChange: (bounds: MapBounds) => void;
}) {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
    onBoundsChange(readMapBounds(map));
  }, [map, onBoundsChange, onMapReady]);
  return null;
}

function LocateIcon() {
  return (
    <SvgIcon aria-hidden="true">
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8.9 3A9 9 0 0 0 13 3.1V1h-2v2.1A9 9 0 0 0 3.1 11H1v2h2.1a9 9 0 0 0 7.9 7.9V23h2v-2.1a9 9 0 0 0 7.9-7.9H23v-2h-2.1ZM12 19a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z" />
    </SvgIcon>
  );
}

export default function MapView() {
  const theme = useTheme();
  const mapRef = useRef<LeafletMap | null>(null);
  const isMapInteractingRef = useRef(false);
  const [viewBounds, setViewBounds] = useState<MapBounds | null>(null);
  const [debouncedBounds, setDebouncedBounds] = useState<MapBounds | null>(null);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [, setSearchFilters] = useState<ProjectSearchFilters>({
    keyword: "",
    types: [],
    tagIds: [],
    universityId: null,
  });
  useEffect(() => {
    if (!viewBounds) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedBounds(viewBounds);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [viewBounds]);
  const { data: pins = [] } = useQuery({
    queryKey: ["map-pins", debouncedBounds],
    queryFn: () => {
      if (!debouncedBounds) {
        throw new Error("Không thể tải ghim khi chưa xác định khung bản đồ.");
      }
      return getMapPins(debouncedBounds);
    },
    enabled: debouncedBounds !== null,
    placeholderData: (previousPins) => previousPins,
  });
  const universitiesQuery = useQuery({
    queryKey: ["universities"],
    queryFn: getUniversities,
  });
  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });
  const handleMapReady = useCallback((map: LeafletMap) => {
    mapRef.current = map;
  }, []);
  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    setViewBounds(bounds);
  }, []);
  const handleMapInteractionChange = useCallback((interacting: boolean) => {
    isMapInteractingRef.current = interacting;
    setIsMapInteracting(interacting);
  }, []);

  const locateUser = () => {
    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ định vị.");
      return;
    }

    setLocationError(null);
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location: [number, number] = [coords.latitude, coords.longitude];
        setUserLocation(location);

        if (!isMapInteractingRef.current) {
          mapRef.current?.flyTo(
            location,
            Math.max(mapRef.current.getZoom(), 15),
            { duration: 1.2 },
          );
        }
        setIsLocating(false);
      },
      () => {
        setLocationError(
          "Không lấy được vị trí. Hãy cho phép trình duyệt truy cập vị trí.",
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <ProjectSearchBar
        tags={tagsQuery.data ?? []}
        universities={universitiesQuery.data ?? []}
        onChange={setSearchFilters}
        disableAnimation={isMapInteracting}
      />
      <MapContainer
        center={[16.0544, 108.2022]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <MapInstanceBinder
          onMapReady={handleMapReady}
          onBoundsChange={handleBoundsChange}
        />
        <MapInteractionTracker
          onInteractionChange={handleMapInteractionChange}
          onBoundsChange={handleBoundsChange}
        />
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {(universitiesQuery.data ?? []).map((university) => (
          <CircleMarker
            key={university.id}
            center={[university.latitude, university.longitude]}
            radius={8}
            pathOptions={{
              color: theme.palette.background.paper,
              weight: 3,
              fillColor: theme.palette.secondary.main,
              fillOpacity: 1,
            }}
          >
            <Popup>{university.name}</Popup>
          </CircleMarker>
        ))}
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
        {userLocation && (
          <CircleMarker
            center={userLocation}
            radius={8}
            pathOptions={{
              color: theme.palette.background.paper,
              weight: 3,
              fillColor: theme.palette.info.main,
              fillOpacity: 1,
            }}
          />
        )}
      </MapContainer>
      <Fab
        aria-label="Về vị trí của tôi"
        color="primary"
        size="medium"
        onClick={locateUser}
        disabled={isMapInteracting || isLocating}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: theme.zIndex.fab,
        }}
      >
        <LocateIcon />
      </Fab>
      {(locationError || universitiesQuery.isError) && (
        <Alert
          severity="error"
          onClose={() => setLocationError(null)}
          sx={{
            position: "absolute",
            top: 80,
            right: 16,
            zIndex: theme.zIndex.fab,
            maxWidth: { xs: "calc(100% - 32px)", sm: 360 },
          }}
        >
          {locationError ??
            "Không tải được danh sách trường đại học. Vui lòng thử lại sau."}
        </Alert>
      )}
      <ProjectQuickViewPanel
        pin={selectedPin}
        onClose={() => setSelectedPin(null)}
        disableTransition={isMapInteracting}
      />
    </Box>
  );
}
