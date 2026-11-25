

import { useEffect, useMemo, useRef, useState } from "react";
import MapView from "./components/MapView";
import PaymentMethods, {
  type PaymentMethod,
  type DeliveryAddress,
} from "./components/PaymentMethods";
import { fetchShops } from "./services/shopService";
import {
  createOrder,
  fetchOrders,
  getCustomerKey,
  type OrderResponse,
} from "./services/orderService";

import type { Shop, FoodItem } from "./types/shop";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import { isAuthenticated } from "./services/authService";
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

const categories = ["All", "Burgers", "Pizza", "Sides", "Drinks", "Healthy"];

const ADDON_OPTIONS: Addon[] = [
  { name: "Extra Sauce", price: 0.5 },
  { name: "Mayonnaise", price: 0.5 },
  { name: "Black Pepper", price: 0.25 },
  { name: "Sriracha Sauce", price: 0.75 },
  { name: "Extra Cheese", price: 1 },
];

function getFoodEmoji(name: string) {
  const value = name.toLowerCase();

  if (value.includes("burger")) return "🍔";
  if (value.includes("pizza")) return "🍕";
  if (value.includes("fries") || value.includes("potato")) return "🍟";
  if (
    value.includes("drink") ||
    value.includes("soda") ||
    value.includes("juice")
  ) {
    return "🥤";
  }
  if (value.includes("salad") || value.includes("healthy")) return "🥗";
  if (value.includes("popcorn")) return "🍿";

  return "🍽️";
}

function getFoodCategory(name: string) {
  const value = name.toLowerCase();

  if (value.includes("burger")) return "Burgers";
  if (value.includes("pizza")) return "Pizza";
  if (
    value.includes("fries") ||
    value.includes("potato") ||
    value.includes("popcorn")
  ) {
    return "Sides";
  }
  if (
    value.includes("drink") ||
    value.includes("soda") ||
    value.includes("juice")
  ) {
    return "Drinks";
  }
  if (value.includes("salad") || value.includes("healthy")) return "Healthy";

  return "All";
}

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");

  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

const [orders, setOrders] = useState<OrderResponse[]>([]);
const [ordersOpen, setOrdersOpen] = useState(false);
const [ordersLoading, setOrdersLoading] = useState(false);
const [ordersError, setOrdersError] = useState("");

  const [orderConfirmation, setOrderConfirmation] = useState<{
  method: PaymentMethod;
  address: DeliveryAddress;
  total: number;
} | null>(null);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

const [favoriteShopIds, setFavoriteShopIds] = useState<number[]>(() => {
  try {
    const savedFavorites = localStorage.getItem("favoriteShopIds");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  } catch {
    return [];
  }
});
useEffect(() => {
  localStorage.setItem(
    "favoriteShopIds",
    JSON.stringify(favoriteShopIds)
  );
}, [favoriteShopIds]);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const restaurants = shops.filter(
    (shop) => shop.category === "Restaurant" && shop.is_active
  );
const displayedRestaurants = restaurants.filter((shop) =>
  showFavoritesOnly
    ? favoriteShopIds.includes(shop.id)
    : true
);
  const restaurant =
    restaurants.find((shop) => shop.id === selectedShopId) ??
    restaurants[0] ??
    null;

  const availableItems = useMemo(() => {
    if (!restaurant) return [];

    return restaurant.items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "All" ||
        getFoodCategory(item.name) === activeCategory;

      return item.is_available && matchesSearch && matchesCategory;
    });
  }, [restaurant, search, activeCategory]);

  const addToCart = (
    item: FoodItem,
    shopName: string,
    addons: Addon[] = []
  ) => {
    if (cart.length > 0 && cart[0].shopName !== shopName) {
      alert(
        `Your cart already contains items from ${cart[0].shopName}. Please complete or clear that order before choosing another restaurant.`
      );
      return;
    }

    const cartKey = JSON.stringify([
      item.id,
      addons.map((addon) => addon.name).sort(),
    ]);

    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (cartItem) => cartItem.cartKey === cartKey
      );

      if (existingItem) {
        return previousCart.map((cartItem) =>
          cartItem.cartKey === cartKey
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
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

    const extraNames = addons.map((addon) => addon.name).join(", ");
    setToast(
      `${item.name} added to cart${extraNames ? ` with ${extraNames}` : ""}`
    );

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    toastTimer.current = setTimeout(() => {
      setToast("");
      toastTimer.current = null;
    }, 2500);
  };

  const updateQuantity = (cartKey: string, change: number) => {
    setCart((previousCart) =>
      previousCart
        .map((cartItem) =>
          cartItem.cartKey === cartKey
            ? { ...cartItem, quantity: cartItem.quantity + change }
            : cartItem
        )
        .filter((cartItem) => cartItem.quantity > 0)
    );
  };

  const removeFromCart = (cartKey: string) => {
    setCart((previousCart) =>
      previousCart.filter((cartItem) => cartItem.cartKey !== cartKey)
    );
  };
const toggleFavorite = (shopId: number) => {
  setFavoriteShopIds((previousIds) =>
    previousIds.includes(shopId)
      ? previousIds.filter((id) => id !== shopId)
      : [...previousIds, shopId]
  );
};

  const cartCount = cart.reduce(
    (total, cartItem) => total + cartItem.quantity,
    0
  );

  const cartTotal = cart.reduce((total, cartItem) => {
    const addonTotal = cartItem.addons.reduce(
      (sum, addon) => sum + addon.price,
      0
    );

    return (
      total +
      (Number(cartItem.item.price) + addonTotal) * cartItem.quantity
    );
  }, 0);

  useEffect(() => {
    const loadShops = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchShops();
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

  const openCustomization = (item: FoodItem) => {
    setSelectedItem(item);
    setSelectedAddons([]);
  };

  const confirmCustomization = () => {
    if (!selectedItem || !restaurant) return;

    addToCart(selectedItem, restaurant.name, selectedAddons);
    setSelectedItem(null);
    setSelectedAddons([]);
  };

  return (
    <>
      {authOpen ? (
        <AuthPage
          onBack={() => setAuthOpen(false)}
          onLoginSuccess={() => {
            setAuthOpen(false);
            setProfileOpen(true);
          }}
        />
      ) : profileOpen ? (
        <ProfilePage onBack={() => setProfileOpen(false)} />
      ) : (
    <main className="app-shell">
      <header className="top-header">
        <div className="brand">
          <h1>
            🛍 Backyard <span>Shopping</span>
          </h1>
          <p>
  Your neighbourhood, your marketplace |
  ♡ Favourites: {favoriteShopIds.length}
</p>
        </div>
{/* jkr */}
        <div className="header-actions">
  <button
    className="top-orders-button"
    onClick={() => {
      if (isAuthenticated()) {
        setProfileOpen(true);
      } else {
        setAuthOpen(true);
      }
    }}
  >
    👤 My Profile
  </button>

  <button
    className="top-orders-button"
    onClick={async () => {
      setOrdersOpen(true);
      setOrdersLoading(true);
      setOrdersError("");

      try {
        const customerKey = getCustomerKey();
        const customerOrders = await fetchOrders(customerKey);
        setOrders(customerOrders);
      } catch (error) {
        setOrdersError(
          error instanceof Error
            ? error.message
            : "Unable to load orders."
        );
      } finally {
        setOrdersLoading(false);
      }
    }}
  >
    📦 Orders
  </button>

  <button
    className="top-cart-button"
    onClick={() => {
      setShowPaymentMethods(false);
      setCartOpen(true);
    }}
  >
    🛒 Cart <span>{cartCount}</span>
  </button>
</div>
      </header>

      <div className="dashboard-layout">
        <section className="main-content">
          <section className="welcome-banner">
            <div className="welcome-copy">
              <span>LOCAL FAVORITES · FRESH PICKS</span>
              <h2>
                Good food, closer
                <br />
                to home. 💙
              </h2>
              <p>Discover local shops and delicious favourites.</p>
              <button
                onClick={() =>
                  document
                    .getElementById("food-menu")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore menu →
              </button>
            </div>
            <div className="welcome-illustration">🥗</div>
          </section>

          {loading && (
            <p className="status-message">Loading local favourites...</p>
          )}
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
                <p className="status-message">
                  No restaurants are currently available.
                </p>
              ) : (
                <>
        <div className="restaurant-selector">
  <label htmlFor="restaurant-select">
    Showing menu from
  </label>

  <select
    id="restaurant-select"
    value={restaurant.id}
    onChange={(event) => {
      setSelectedShopId(Number(event.target.value));
      setSelectedItem(null);
      setSelectedAddons([]);
    }}
  >
    {displayedRestaurants.map((shop) => (
      <option key={shop.id} value={shop.id}>
        {shop.name}
      </option>
    ))}
  </select>

  <button
  type="button"
  onClick={() => setShowFavoritesOnly((previous) => !previous)}
>
  Toggle Favorites
</button>
</div>

<div className="favorite-shops">
  {restaurants.map((shop) => (
    <button
      key={shop.id}
      type="button"
      onClick={() => toggleFavorite(shop.id)}
    >
      {favoriteShopIds.includes(shop.id) ? "❤️" : "♡"} {shop.name}
    </button>
  ))}
</div>
                  <div className="food-grid">
                    {availableItems.map((item, index) => (
                      <article
                        className={`food-card food-color-${index % 6}`}
                        key={item.id}
                      >
                        <div className="food-emoji">
                          {getFoodEmoji(item.name)}
                        </div>
                        <div className="food-card-content">
                          <h4>{item.name}</h4>
                          <p>
                            {item.description || "Freshly prepared for you"}
                          </p>
                          <div className="food-card-bottom">
                            <strong>
                              ${Number(item.price).toFixed(2)}
                            </strong>
                            <button
                              className="add-item"
                              onClick={() => openCustomization(item)}
                            >
                              + Customize
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {availableItems.length === 0 && (
                    <p className="status-message">
                      No items match your search. Try another category.
                    </p>
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
            <p>
              {restaurant
                ? `${restaurant.name} · ${restaurant.address}`
                : "Explore nearby restaurants"}
            </p>
          </section>

          <section className="side-card cart-summary">
            <h3>🛍 Your Shopping Cart</h3>
            {cart.length === 0 ? (
              <p>Your cart is empty. Add something delicious!</p>
            ) : (
              <div className="summary-items">
                {cart.map((cartItem) => {
                  const addonTotal = cartItem.addons.reduce(
                    (sum, addon) => sum + addon.price,
                    0
                  );

                  return (
                    <div className="summary-item" key={cartItem.cartKey}>
                      <span>
                        {cartItem.item.name} × {cartItem.quantity}
                      </span>
                      <strong>
                        $
                        {(
                          (Number(cartItem.item.price) + addonTotal) *
                          cartItem.quantity
                        ).toFixed(2)}
                      </strong>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="summary-total">
              <strong>Total</strong>
              <strong>${cartTotal.toFixed(2)}</strong>
            </div>
            <button
              className="checkout-button"
              onClick={() => {
                setShowPaymentMethods(false);
                setCartOpen(true);
              }}
              disabled={cart.length === 0}
            >
              Proceed to Checkout
            </button>
            <small>Demo checkout · No real payment</small>
          </section>
        </aside>
      </div>

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

      {selectedItem && (
        <div
          className="cart-overlay"
          onClick={() => {
            setSelectedItem(null);
            setSelectedAddons([]);
          }}
        >
          <section
            className="cart-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-header">
              <div>
                <h2>Customize your item</h2>
                <p>{selectedItem.name}</p>
              </div>
              <button
                className="close-cart"
                onClick={() => {
                  setSelectedItem(null);
                  setSelectedAddons([]);
                }}
                aria-label="Close customization"
              >
                ×
              </button>
            </div>

            <div className="cart-items">
              <h3>Choose your add-ons</h3>
              {ADDON_OPTIONS.map((addon) => {
                const checked = selectedAddons.some(
                  (selected) => selected.name === addon.name
                );

                return (
                  <div className="addon-option" key={addon.name}>
                    <label>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedAddons((previous) =>
                            checked
                              ? previous.filter(
                                  (selected) => selected.name !== addon.name
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
                );
              })}

              <div className="addon-total">
                <span>Item price:</span>
                <strong>${Number(selectedItem.price).toFixed(2)}</strong>
              </div>
              <div className="addon-total">
                <span>Extra charges:</span>
                <strong>
                  $
                  {selectedAddons
                    .reduce((sum, addon) => sum + addon.price, 0)
                    .toFixed(2)}
                </strong>
              </div>
            </div>

            <div className="cart-footer">
              <button
                className="checkout-button"
                onClick={confirmCustomization}
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
          </section>
        </div>
      )}
    
{ordersOpen && (
  <div
    className="cart-overlay"
    onClick={() => setOrdersOpen(false)}
  >
    <section
      className="cart-panel orders-panel"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="cart-header">
        <div>
          <h2>📦 My Orders</h2>
          <p>Your current and previous orders</p>
        </div>

        <button
          className="close-cart"
          onClick={() => setOrdersOpen(false)}
          aria-label="Close orders"
        >
          ×
        </button>
      </div>

      {ordersLoading ? (
        <p className="status-message">Loading your orders...</p>
      ) : ordersError ? (
        <p className="status-error">{ordersError}</p>
      ) : orders.length === 0 ? (
        <div className="empty-cart">
          <div>📦</div>
          <h3>No orders yet</h3>
          <p>Your orders will appear here after checkout.</p>
        </div>
      ) : (
        <div className="cart-items">
          <h3>Current Orders</h3>

          {orders.filter((order) =>
            ["Pending", "Confirmed", "Preparing", "Out for delivery"]
              .includes(order.status)
          ).length === 0 ? (
            <p>No current orders.</p>
          ) : (
            orders
              .filter((order) =>
                ["Pending", "Confirmed", "Preparing", "Out for delivery"]
                  .includes(order.status)
              )
              .map((order) => (
                <div className="order-history-card" key={order.id}>
                  <h4>Order #{order.id}</h4>
                  <p>Status: <strong>{order.status}</strong></p>
                  <p>Payment: {order.payment_method}</p>
                  <p>Total: ${Number(order.total_amount).toFixed(2)}</p>
                  <p>Date: {new Date(order.created_at).toLocaleString()}</p>

                  {order.items.map((item) => (
                    <p key={item.id}>
                      {item.item_name} × {item.quantity}
                    </p>
                  ))}
                </div>
              ))
          )}

          <h3>Previous Orders</h3>

          {orders.filter((order) =>
            ["Delivered", "Cancelled"].includes(order.status)
          ).length === 0 ? (
            <p>No previous orders.</p>
          ) : (
            orders
              .filter((order) =>
                ["Delivered", "Cancelled"].includes(order.status)
              )
              .map((order) => (
                <div className="order-history-card" key={order.id}>
                  <h4>Order #{order.id}</h4>
                  <p>Status: <strong>{order.status}</strong></p>
                  <p>Total: ${Number(order.total_amount).toFixed(2)}</p>
                  <p>Date: {new Date(order.created_at).toLocaleString()}</p>
                </div>
              ))
          )}
        </div>
      )}
    </section>
  </div>
)}

      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <aside
            className="cart-panel"
            onClick={(event) => event.stopPropagation()}
          >
            {showPaymentMethods ? (
              <PaymentMethods
                total={cartTotal}
                onBack={() => setShowPaymentMethods(false)}
           
 onConfirm={async (method, address, promoCode) => {
  try {
    const customerKey = getCustomerKey();

    const savedOrder = await createOrder({
      customer_key: customerKey,
      customer_name: address.customerName,
      phone_number: address.phoneNumber,
      delivery_address: [
        address.streetAddress,
        address.apartment,
        address.city,
        address.province,
        address.postalCode,
        address.countryRegion,
      ]
        .filter(Boolean)
        .join(", "),
      payment_method: method,
      promo_code: promoCode,
      items: cart.map((cartItem) => ({
        item_id: cartItem.item.id,
        quantity: cartItem.quantity,
        addons: cartItem.addons.map((addon) => addon.name),
      })),
    });

    // Show success only after the backend saves the order
    setOrderConfirmation({
      method,
      address,
      total: savedOrder.total_amount,
    });

    setCart([]);
    setShowPaymentMethods(false);
    setCartOpen(false);

  } catch (error) {
    console.error("Order submission failed:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Unable to submit your order. Please try again."
    );
  }
}}

              />
            ) : (
              <>
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

                <div className="cart-items">
                  {cart.length === 0 ? (
                    <div className="empty-cart">
                      <div>🛒</div>
                      <h3>Your cart is empty</h3>
                      <p>Add food items from the menu.</p>
                    </div>
                  ) : (
                    cart.map((cartItem) => {
                      const addonTotal = cartItem.addons.reduce(
                        (sum, addon) => sum + addon.price,
                        0
                      );

                      return (
                        <div className="cart-item" key={cartItem.cartKey}>
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
                                (Number(cartItem.item.price) + addonTotal) *
                                cartItem.quantity
                              ).toFixed(2)}
                            </strong>
                          </div>

                          <div className="cart-item-actions">
                            <div className="quantity-control">
                              <button
                                onClick={() =>
                                  updateQuantity(cartItem.cartKey, -1)
                                }
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span>{cartItem.quantity}</span>
                              <button
                                onClick={() =>
                                  updateQuantity(cartItem.cartKey, 1)
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
                      );
                    })
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="cart-footer">
                    <div className="cart-total">
                      <span>Total</span>
                      <strong>${cartTotal.toFixed(2)}</strong>
                    </div>
                    <button
                      className="checkout-button"
                      onClick={() => setShowPaymentMethods(true)}
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      )}
            {/* ORDER SUCCESS CONFIRMATION */}
      {orderConfirmation && (
        <div className="order-success-overlay">
          <section className="order-success-card">
            <div className="order-success-icon">✓</div>

            <h2>Order Submitted Successfully!</h2>

            <p className="order-success-message">
              Thank you for shopping with Backyard Shopping.
              Your order has been submitted.
            </p>

            <div className="order-success-details">
              <p>
                <strong>Customer:</strong>{" "}
                {orderConfirmation.address.customerName}
              </p>

              <p>
                <strong>Payment Method:</strong>{" "}
                {orderConfirmation.method}
              </p>

              <p>
                <strong>Delivery Address:</strong>{" "}
                {orderConfirmation.address.streetAddress}
                {orderConfirmation.address.apartment &&
                  `, ${orderConfirmation.address.apartment}`}
                {`, ${orderConfirmation.address.city}, ${orderConfirmation.address.province}, ${orderConfirmation.address.postalCode}, ${orderConfirmation.address.countryRegion}`}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {orderConfirmation.address.phoneNumber}
              </p>

              <p className="order-success-total">
                <strong>Total Paid:</strong>{" "}
                ${orderConfirmation.total.toFixed(2)}
              </p>
            </div>

            <button
              className="order-success-button"
              onClick={() => setOrderConfirmation(null)}
            >
              Continue Shopping
            </button>
          </section>
        </div>
      )}
    </main>
      )}
    </>
  );
}

export default App;
