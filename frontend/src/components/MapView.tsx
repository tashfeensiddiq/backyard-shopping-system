import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";

import type { Shop } from "../types/shop";

interface MapViewProps {
  shops: Shop[];
}

const MapView = ({ shops }: MapViewProps) => {
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
            radius={9}
            pathOptions={{
              color: "#ffffff",
              fillColor: shop.category === "Restaurant" ? "#e65c36" : "#2563eb",
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="shop-popup">
                <h3>{shop.name}</h3>
                <p>{shop.description}</p>
                <p><strong>Category:</strong> {shop.category}</p>
                <p><strong>Address:</strong> {shop.address}</p>

                {shop.items.length > 0 && (
                  <>
                    <h4>Food Menu</h4>
                    <ul>
                      {shop.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;