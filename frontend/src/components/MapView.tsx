
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";

import type { Shop } from "../types/shop";

interface MapViewProps {
  shops: Shop[];
  selectedShopId: number | null;
  onSelectShop: (shop: Shop) => void;
}

const MapView = ({
  shops,
  selectedShopId,
  onSelectShop,
}: MapViewProps) => {
  const position: [number, number] = [47.5615, -52.7126];

  return (
    <div className="map-container">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {shops.map((shop) => (
          <CircleMarker
            key={shop.id}
            center={[shop.latitude, shop.longitude]}
            radius={selectedShopId === shop.id ? 12 : 9}
            eventHandlers={{
              click: () => onSelectShop(shop),
            }}
            pathOptions={{
              color: "#ffffff",
              fillColor:
                selectedShopId === shop.id
                  ? "#2563eb"
                  : "#e65c36",
              fillOpacity: 1,
              weight: selectedShopId === shop.id ? 4 : 2,
            }}
          >
            <Popup>
              <div className="shop-popup">
                <h3>{shop.name}</h3>
                <p>{shop.description}</p>
                <p>
                  <strong>Address:</strong> {shop.address}
                </p>

                <p>
                  <strong>Available food items:</strong>{" "}
                  {shop.items.filter(
                    (item) => item.is_available
                  ).length}
                </p>

                <button
                  onClick={() => onSelectShop(shop)}
                >
                  View Menu
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
