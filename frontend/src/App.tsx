import { useEffect, useState } from "react";
import MapView from "./components/MapView";
import { fetchShops } from "./services/shopService";
import type { Shop } from "./types/shop";
import "./App.css";

function App() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchShops()
      .then(setShops)
      .catch(() => setError("Unable to load shops. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Backyard Shopping System</h1>
          <p>Discover local shops around St. John's.</p>
        </div>

        <div className="shop-count">
          Available shops: {shops.length}
        </div>
      </header>

      {loading && <div className="status-message">Loading shops...</div>}
      {error && <div className="status-message error">{error}</div>}

      <section className="map-area">
        <MapView shops={shops} />
      </section>
    </main>
  );
}

export default App;