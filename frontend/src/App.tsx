
import { useEffect, useRef, useState } from "react";
import MapView from "./components/MapView";
import { fetchShops } from "./services/shopService";
import type { Shop, FoodItem } from "./types/shop";
import "./App.css";

interface Addon {
  name: string;
  price: number;
}

interface CartItem {
  item: FoodItem;
  quantity: number;
  shopName: string;
  addons: Addon[];
  cartKey: string;
}

const ADDON_OPTIONS: Addon[] = [
  { name: "Extra Sauce", price: 0.50 },
  { name: "Mayonnaise", price: 0.50 },
  { name: "Black Pepper", price: 0.25 },
  { name: "Sriracha Sauce", price: 0.75 },
  { name: "Extra Cheese", price: 1.00 },
];

function App() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [selectedItem, setSelectedItem] =
  useState<FoodItem | null>(null);

const [selectedAddons, setSelectedAddons] =
  useState<Addon[]>([]);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const restaurants = shops.filter(
    (shop) => shop.category === "Restaurant"
  );

  const restaurant = restaurants[0];

  // Add item and selected extras to cart
const addToCart = (
  item: FoodItem,
  shopName: string,
  addons: Addon[]
) => {
  const cartKey = JSON.stringify([
  item.id,
  addons.map(a => a.name).sort()
]);

  setCart((previousCart) => {
    const existingItem = previousCart.find(
      (cartItem) => cartItem.cartKey === cartKey
    );

    if (existingItem) {
      return previousCart.map((cartItem) =>
        cartItem.cartKey === cartKey
          ? {
              ...cartItem,
              quantity: cartItem.quantity + 1,
            }
          : cartItem
      );
    }

    return [
      ...previousCart,
      {
        item,
        quantity: 1,
        shopName,
        addons: [...addons],
        cartKey,
      },
    ];
  });

  const extraNames = addons.map(a => a.name).join(", ");

  setToast(
    `${item.name} added to cart${
      extraNames ? ` with ${extraNames}` : ""
    }`
  );

  if (toastTimer.current) {
    clearTimeout(toastTimer.current);
  }

  toastTimer.current = setTimeout(() => {
    setToast("");
    toastTimer.current = null;
  }, 2500);
};


  // Update item quantity
const updateQuantity = (
  cartKey: string,
  change: number
) => {
  setCart((previousCart) =>
    previousCart
      .map((cartItem) =>
        cartItem.cartKey === cartKey
          ? {
              ...cartItem,
              quantity: cartItem.quantity + change,
            }
          : cartItem
      )
      .filter((cartItem) => cartItem.quantity > 0)
  );
};

// Remove item from cart
const removeFromCart = (cartKey: string) => {
  setCart((previousCart) =>
    previousCart.filter(
      (cartItem) => cartItem.cartKey !== cartKey
    )
  );
};

  // Calculate cart count
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Calculate cart total including add-ons
const cartTotal = cart.reduce(
  (total, cartItem) => {
    const addonTotal = cartItem.addons.reduce(
      (sum, addon) => sum + addon.price,
      0
    );

    return total +
      (Number(cartItem.item.price) + addonTotal) *
      cartItem.quantity;
  },
  0
);

  // Load shops from API
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
        setError(
          "Unable to load shops. Please check the backend connection."
        );
      } finally {
        setLoading(false);
      }
    };

    loadShops();
  }, []);

  // Clear notification timer when component unmounts
  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  return (
    <main className="app-shell">

      {/* LEFT MENU PANEL */}
      <aside className="menu-sidebar">

        <div className="sidebar-header">
          <h2>Backyard Shopping</h2>
          <p>Discover local food and shops</p>
        </div>

        {loading && (
          <p className="sidebar-message">Loading menu...</p>
        )}

        {error && (
          <p className="sidebar-error">{error}</p>
        )}

        {!loading && !error && restaurant && (
          <>
            <div className="restaurant-info">
              <span className="restaurant-label">
                RESTAURANT
              </span>

              <h3>{restaurant.name}</h3>

              <p>{restaurant.description}</p>

              <small>{restaurant.address}</small>
            </div>

            <div className="menu-heading">
              <h3>Food Menu</h3>

              <span>
                {restaurant.items.filter(
                  (item) => item.is_available
                ).length} items
              </span>
            </div>

            <div className="food-list">
  {restaurant.items
    .filter((item) => item.is_available)
    .map((item) => (
      <div className="food-card" key={item.id}>

        <div className="food-card-content">
          <div>
            <h4>{item.name}</h4>
            <p>{item.description}</p>
          </div>

          <div className="food-card-bottom">
            <strong>
              ${Number(item.price).toFixed(2)}
            </strong>

            <button
              className="addon-confirm-button"
              onClick={() => {
                setSelectedItem(item);
                setSelectedAddons([]);
              }}
            >
              Customize & Add
            </button>
          </div>
        </div>

        {selectedItem?.id === item.id && (
          <div
            className="addons-section"
            onClick={(event) => event.stopPropagation()}
          >
            <h4>Choose Your Add-ons</h4>

            {ADDON_OPTIONS.map((addon) => (
              <div
                className="addon-option"
                key={addon.name}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={selectedAddons.some(
                      (a) => a.name === addon.name
                    )}
                    onChange={() => {
                      setSelectedAddons((previous) =>
                        previous.some(
                          (a) => a.name === addon.name
                        )
                          ? previous.filter(
                              (a) => a.name !== addon.name
                            )
                          : [...previous, addon]
                      );
                    }}
                  />

                  {addon.name}
                </label>

                <span className="addon-price">
                  +${addon.price.toFixed(2)}
                </span>
              </div>
            ))}

            <div className="addon-total">
              <span>Extra Charges:</span>

              <span>
                ${selectedAddons
                  .reduce((sum, a) => sum + a.price, 0)
                  .toFixed(2)}
              </span>
            </div>

            <button
              className="addon-confirm-button"
              onClick={() => {
                addToCart(
                  item,
                  restaurant.name,
                  selectedAddons
                );

                setSelectedItem(null);
                setSelectedAddons([]);
              }}
            >
              Add to Cart
            </button>

            <button
              className="remove-item"
              onClick={() => {
                setSelectedItem(null);
                setSelectedAddons([]);
              }}
            >
              Cancel
            </button>
          </div>
        )}

      </div>
    ))}
</div>
          </>
        )}

        {!loading && !error && !restaurant && (
          <p className="sidebar-message">
            No restaurants are currently available.
          </p>
        )}

        <div className="sidebar-footer">
          <span>Backyard Shopping System</span>
        </div>
      </aside>

      {/* MAP AREA */}
      <section className="map-section">

        {/* HEADER */}
        <header className="map-header">
          <div>
            <h1>Explore Local Shops</h1>
            <p>
              Find shops and restaurants around St. John's.
            </p>
          </div>

          <button
            className="cart-button"
            onClick={() => setCartOpen(true)}
          >
            🛒 Cart

            <span className="cart-count">
              {cartCount}
            </span>
          </button>
        </header>

        {/* TOAST NOTIFICATION */}
        {toast && (
          <div
            className="toast-notification"
            role="status"
            aria-live="polite"
          >
            <span className="toast-icon">✓</span>

            <div className="toast-content">
              <strong>Added to cart!</strong>
              <p>{toast}</p>
            </div>
          </div>
        )}

        {/* MAP */}
        <div className="map-area">
          <MapView shops={shops} />
        </div>

        {/* CART OVERLAY */}
        {cartOpen && (
          <div
            className="cart-overlay"
            onClick={() => setCartOpen(false)}
          >
            <aside
              className="cart-panel"
              onClick={(event) => event.stopPropagation()}
            >

              {/* CART HEADER */}
              <div className="cart-header">
                <div>
                  <h2>Shopping Cart</h2>
                  <p>{cartCount} items added</p>
                </div>

                <button
                  className="close-cart"
                  onClick={() => setCartOpen(false)}
                  aria-label="Close cart"
                >
                  ×
                </button>
              </div>

              {/* CART ITEMS */}
              <div className="cart-items">
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <div>🛒</div>
                    <h3>Your cart is empty</h3>
                    <p>
                      Add food items from the left menu.
                    </p>
                  </div>
                ) : (
                  cart.map((cartItem) => (
                    <div
                      className="cart-item"
                      key={cartItem.cartKey}
                    >
                      <div className="cart-item-info">
                        <h4>{cartItem.item.name}</h4>

                        <p>{cartItem.shopName}</p>
            {cartItem.addons.length > 0 && (
              <p>
                  Extras:{" "}
                  {cartItem.addons
                  .map((addon) => addon.name)
                  .join(", ")}
                </p>
)}
                        <strong>
                          $
                        {(
  (Number(cartItem.item.price) +
    cartItem.addons.reduce(
      (sum, addon) => sum + addon.price,
      0
    )) * cartItem.quantity
).toFixed(2)}
                        </strong>
                      </div>

                      <div className="cart-item-actions">
                        <div className="quantity-control">
                          <button
                            onClick={() =>
                              updateQuantity(
                                cartItem.cartKey,
                                -1
                              )
                            }
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>

                          <span>{cartItem.quantity}</span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                cartItem.cartKey,
                                1
                              )
                            }
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="remove-item"
                          onClick={() =>
                            removeFromCart(cartItem.cartKey)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* CART FOOTER */}
              {cart.length > 0 && (
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total</span>

                    <strong>
                      ${cartTotal.toFixed(2)}
                    </strong>
                  </div>

                  <button
                    className="checkout-button"
                    onClick={() =>
                      alert(
                        "Checkout will be implemented in the next phase."
                      )
                    }
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
