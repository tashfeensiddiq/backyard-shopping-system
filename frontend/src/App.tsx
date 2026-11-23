
import { useEffect, useMemo, useRef, useState } from "react";
import MapView from "./components/MapView";
import PaymentMethods, {
  type PaymentMethod,
  type DeliveryAddress,
} from "./components/PaymentMethods";
import { fetchShops } from "./services/shopService";
import type { Shop, FoodItem } from "./types/shop";
import "./App.css";

interface CartItem {
  item: FoodItem;
  quantity: number;
  shopName: string;
}

const categories = ["All", "Burgers", "Pizza", "Sides", "Drinks", "Healthy"];

function getFoodEmoji(name: string) {
  const value = name.toLowerCase();
  if (value.includes("burger")) return "🍔";
  if (value.includes("pizza")) return "🍕";
  if (value.includes("fries") || value.includes("potato")) return "🍟";
  if (value.includes("drink") || value.includes("soda") || value.includes("juice")) return "🥤";
  if (value.includes("salad") || value.includes("healthy")) return "🥗";
  if (value.includes("popcorn")) return "🍿";
  return "🍽️";
}

function getFoodCategory(name: string) {
  const value = name.toLowerCase();
  if (value.includes("burger")) return "Burgers";
  if (value.includes("pizza")) return "Pizza";
  if (value.includes("fries") || value.includes("potato") || value.includes("popcorn")) return "Sides";
  if (value.includes("drink") || value.includes("soda") || value.includes("juice")) return "Drinks";
  if (value.includes("salad") || value.includes("healthy")) return "Healthy";
  return "All";
}

function App() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const restaurants = shops.filter(
    (shop) => shop.category === "Restaurant" && shop.is_active
  );

  const restaurant =
    restaurants.find((shop) => shop.id === selectedShopId) ??
    restaurants[0] ??
    null;

  const availableItems = useMemo(() => {
    if (!restaurant) return [];

    return restaurant.items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "All" ||
        getFoodCategory(item.name) === activeCategory;

      return item.is_available && matchesSearch && matchesCategory;
    });
  }, [restaurant, search, activeCategory]);

  const addToCart = (item: FoodItem, shopName: string) => {
    if (cart.length > 0 && cart[0].shopName !== shopName) {
      alert(
        `Your cart already contains items from ${cart[0].shopName}. Please complete or clear that order before choosing another restaurant.`
      );
      return;
    }

    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (cartItem) => cartItem.item.id === item.id
      );

      if (existingItem) {
        return previousCart.map((cartItem) =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...previousCart, { item, quantity: 1, shopName }];
    });

    setToast(`${item.name} added to cart`);

    if (toastTimer.current) clearTimeout(toastTimer.current);

    toastTimer.current = setTimeout(() => {
      setToast("");
      toastTimer.current = null;
    }, 2500);
  };

  const updateQuantity = (itemId: number, change: number) => {
    setCart((previousCart) =>
      previousCart
        .map((cartItem) =>
          cartItem.item.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity + change }
            : cartItem
        )
        .filter((cartItem) => cartItem.quantity > 0)
    );
  };

  const removeFromCart = (itemId: number) => {
    setCart((previousCart) =>
      previousCart.filter((cartItem) => cartItem.item.id !== itemId)
    );
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.item.price * item.quantity,
    0
  );

  useEffect(() => {
    const loadShops = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchShops();
        console.log("Shops received from API:", data);
        setShops(data);
      } catch (err) {
        console.error("Shop loading error:", err);
        setError("Unable to load shops. Please check the backend connection.");
      } finally {
        setLoading(false);
      }
    };

    loadShops();
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  return (
    <main className="app-shell">
      <header className="top-header">
        <div className="brand">
          <h1>🛍 Backyard <span>Shopping</span></h1>
          <p>Your neighbourhood, your marketplace</p>
        </div>

        <button className="top-cart-button" onClick={() => setCartOpen(true)}>
          🛒 Cart <span>{cartCount}</span>
        </button>
      </header>

      <div className="dashboard-layout">
        <section className="main-content">
          <section className="welcome-banner">
            <div className="welcome-copy">
              <span>LOCAL FAVORITES · FRESH PICKS</span>
              <h2>Good food, closer<br />to home. 💙</h2>
              <p>Discover local shops and delicious favourites.</p>
              <button onClick={() => document.getElementById("food-menu")?.scrollIntoView({ behavior: "smooth" })}>
                Explore menu →
              </button>
            </div>
            <div className="welcome-illustration">🥗</div>
          </section>

          {loading && <p className="status-message">Loading local favourites...</p>}
          {error && <p className="status-error">{error}</p>}

          {!loading && !error && (
            <>
              <input
                className="food-search"
                type="search"
                placeholder="⌕  Search burgers, pizza, drinks..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <div className="category-filters">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={activeCategory === category ? "active" : ""}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="menu-heading" id="food-menu">
                <h3>Popular near you</h3>
                <span>{availableItems.length} items</span>
              </div>

              {!restaurant ? (
                <p className="status-message">No restaurants are currently available.</p>
              ) : (
                <>
                  <div className="restaurant-selector">
                    <label htmlFor="restaurant-select">Showing menu from</label>
                    <select
                      id="restaurant-select"
                      value={restaurant.id}
                      onChange={(event) => setSelectedShopId(Number(event.target.value))}
                    >
                      {restaurants.map((shop) => (
                        <option key={shop.id} value={shop.id}>{shop.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="food-grid">
                    {availableItems.map((item, index) => (
                      <button
                        className={`food-card food-color-${index % 6}`}
                        key={item.id}
                        onClick={() => addToCart(item, restaurant.name)}
                        title={`Add ${item.name} to cart`}
                      >
                        <div className="food-emoji">{getFoodEmoji(item.name)}</div>
                        <div className="food-card-content">
                          <h4>{item.name}</h4>
                          <p>{item.description || "Freshly prepared for you"}</p>
                          <div className="food-card-bottom">
                            <strong>${Number(item.price).toFixed(2)}</strong>
                            <span className="add-item">+ Add</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {availableItems.length === 0 && (
                    <p className="status-message">No items match your search. Try another category.</p>
                  )}
                </>
              )}
            </>
          )}

          <footer className="page-footer">
            Backyard Shopping · Supporting local businesses 💙
          </footer>
        </section>

        <aside className="right-sidebar">
          <section className="side-card map-card">
            <h3>📍 Explore Local Shops</h3>
            <div className="mini-map">
              <MapView
                shops={restaurants}
                selectedShopId={restaurant?.id ?? null}
                onSelectShop={(shop) => setSelectedShopId(shop.id)}
              />
            </div>
            <p>Harbour Bistro · East End, St. John's</p>
          </section>

          <section className="side-card cart-summary">
            <h3>🛍 Your Shopping Cart</h3>
            {cart.length === 0 ? (
              <p>Your cart is empty. Add something delicious!</p>
            ) : (
              <div className="summary-items">
                {cart.map((cartItem) => (
                  <div className="summary-item" key={cartItem.item.id}>
                    <span>{cartItem.item.name} × {cartItem.quantity}</span>
                    <strong>${(cartItem.item.price * cartItem.quantity).toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            )}
            <div className="summary-total">
              <strong>Total</strong>
              <strong>${cartTotal.toFixed(2)}</strong>
            </div>
            <button
              className="checkout-button"
              onClick={() => setCartOpen(true)}
            >
              Proceed to Checkout
            </button>
            <small>Demo checkout · No real payment</small>
          </section>
        </aside>
      </div>

      {toast && (
        <div className="toast-notification" role="status" aria-live="polite">
          <span className="toast-icon">✓</span>
          <div className="toast-content">
            <strong>Added to cart!</strong>
            <p>{toast}</p>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <aside className="cart-panel" onClick={(event) => event.stopPropagation()}>
            {showPaymentMethods ? (
              <PaymentMethods
                total={cartTotal}
                onBack={() => setShowPaymentMethods(false)}
                onConfirm={(method: PaymentMethod, address: DeliveryAddress) => {
                  alert(
                    `Payment Method: ${method}\n` +
                    `Customer: ${address.customerName}\n` +
                    `Delivery Address: ${address.streetAddress}, ${address.city}, ${address.province}, ${address.countryRegion}\n` +
                    `Postal Code: ${address.postalCode}`
                  );
                }}
              />
            ) : (
              <>
                <div className="cart-header">
                  <div>
                    <h2>Shopping Cart</h2>
                    <p>{cartCount} items added</p>
                  </div>
                  <button className="close-cart" onClick={() => setCartOpen(false)}>×</button>
                </div>

                <div className="cart-items">
                  {cart.length === 0 ? (
                    <div className="empty-cart">
                      <div>🛒</div>
                      <h3>Your cart is empty</h3>
                      <p>Add food items from the menu.</p>
                    </div>
                  ) : (
                    cart.map((cartItem) => (
                      <div className="cart-item" key={cartItem.item.id}>
                        <div className="cart-item-info">
                          <h4>{cartItem.item.name}</h4>
                          <p>{cartItem.shopName}</p>
                          <strong>${(cartItem.item.price * cartItem.quantity).toFixed(2)}</strong>
                        </div>
                        <div className="cart-item-actions">
                          <div className="quantity-control">
                            <button onClick={() => updateQuantity(cartItem.item.id, -1)}>−</button>
                            <span>{cartItem.quantity}</span>
                            <button onClick={() => updateQuantity(cartItem.item.id, 1)}>+</button>
                          </div>
                          <button className="remove-item" onClick={() => removeFromCart(cartItem.item.id)}>Remove</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="cart-footer">
                    <div className="cart-total">
                      <span>Total</span>
                      <strong>${cartTotal.toFixed(2)}</strong>
                    </div>
                    <button className="checkout-button" onClick={() => setShowPaymentMethods(true)}>
                      Proceed to Checkout
                    </button>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}

export default App;
