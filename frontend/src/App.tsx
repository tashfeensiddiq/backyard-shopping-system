import { useEffect, useRef, useState } from "react";
import MapView from "./components/MapView";

import PaymentMethods, {
  type PaymentMethod,
} from "./components/PaymentMethods";

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
  { name: "Extra Sauce", price: 0.5 },
  { name: "Mayonnaise", price: 0.5 },
  { name: "Black Pepper", price: 0.25 },
  { name: "Sriracha Sauce", price: 0.75 },
  { name: "Extra Cheese", price: 1.0 },
];

const categoryIcons: Record<string, string> = {
  restaurant: "🍔",
  grocery: "🛒",
  fashion: "👕",
  clothing: "👕",
  electronics: "💻",
  pharmacy: "💊",
  bakery: "🥐",
  general: "🏪",
};

function getCategoryIcon(category: string) {
  return categoryIcons[category.toLowerCase()] || "🏪";
}

// Product images
function getProductImage(item: FoodItem, category: string): string {
  const text = `${item.name} ${item.description ?? ""}`.toLowerCase();

  if (
    /shirt|jean|hoodie|jacket|dress|shoe|cap|wallet|glove|scarf|fashion|clothing/.test(
      text
    )
  ) {
    return "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=480&q=80";
  }

  if (
    /milk|egg|bread|banana|apple|potato|rice|chicken|juice|chip|butter|oil|soap|toilet|vegetable|fruit|grocery/.test(
      text
    )
  ) {
    return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=480&q=80";
  }

  if (
    /burger|wing|poutine|fries|pizza|salad|wrap|brownie|shake|drink|food|restaurant/.test(
      text
    )
  ) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=480&q=80";
  }

  const normalized = category.toLowerCase();

  if (/fashion|clothing/.test(normalized)) {
    return "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=480&q=80";
  }

  if (/grocery|general/.test(normalized)) {
    return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=480&q=80";
  }

  if (/restaurant/.test(normalized)) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=480&q=80";
  }

  return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=480&q=80";
}

// Product category detection
function getProductGroup(
  item: FoodItem,
  shopCategory: string
): string {
  const text = `${item.name} ${item.description ?? ""}`.toLowerCase();

  if (
    /shirt|jean|hoodie|jacket|dress|shoe|cap|wallet|glove|scarf|fashion|clothing/.test(
      text
    )
  ) {
    return "Fashion";
  }

  if (
    /milk|egg|bread|banana|apple|potato|rice|chicken|juice|chip|butter|oil|soap|toilet|vegetable|fruit|grocery/.test(
      text
    )
  ) {
    return "Grocery";
  }

  if (
    /burger|wing|poutine|fries|pizza|salad|wrap|brownie|shake|drink|food|restaurant/.test(
      text
    )
  ) {
    return "Food";
  }

  const category = shopCategory.toLowerCase();

  if (/fashion|clothing/.test(category)) return "Fashion";
  if (/grocery|general/.test(category)) return "Grocery";
  if (/restaurant/.test(category)) return "Food";

  return "Other";
}

function App() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");

  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  // Product search and filter states
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState("All");
  const [productQuantities, setProductQuantities] = useState<Record<number, number>>({});

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categories = [
    "All",
    ...Array.from(
      new Set(
        shops
          .filter((shop) => shop.is_active)
          .map((shop) => shop.category)
      )
    ),
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredShops =
    selectedCategory === "All"
      ? shops.filter((shop) => shop.is_active)
      : shops.filter(
          (shop) =>
            shop.is_active &&
            shop.category === selectedCategory
        );

  const isRestaurant =
    selectedShop?.category?.toLowerCase() === "restaurant";

  // Add item to cart
  const addToCart = (
    item: FoodItem,
    shopName: string,
    addons: Addon[] = [],
    quantity: number = 1
  ) => {
    const cartKey = JSON.stringify([
      shopName,
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
            ? {
                ...cartItem,
                quantity: cartItem.quantity + quantity,
              }
            : cartItem
        );
      }

      return [
        ...previousCart,
        {
          item,
          quantity,
          shopName,
          addons: [...addons],
          cartKey,
        },
      ];
    });

    const extraNames = addons.map((addon) => addon.name).join(", ");

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

  // Update cart quantity
  const updateQuantity = (cartKey: string, change: number) => {
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

  // Cart quantity
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Cart total
  const cartTotal = cart.reduce((total, cartItem) => {
    const addonTotal = cartItem.addons.reduce(
      (sum, addon) => sum + addon.price,
      0
    );

    return (
      total +
      (Number(cartItem.item.price) + addonTotal) *
        cartItem.quantity
    );
  }, 0);

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

  // Clear toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  // Category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedShop(null);
    setSelectedItem(null);
    setSelectedAddons([]);
    setProductSearch("");
    setProductFilter("All");
  };

  // Select shop
  const handleShopSelect = (shop: Shop) => {
    setSelectedShop(shop);
    setSelectedItem(null);
    setSelectedAddons([]);
    setProductSearch("");
    setProductFilter("All");
  };

  // Update the quantity selected on a product card
  const changeProductQuantity = (itemId: number, change: number) => {
    setProductQuantities((previous) => ({
      ...previous,
      [itemId]: Math.max(1, (previous[itemId] ?? 1) + change),
    }));
  };

  // Add product
  const handleAddItem = (item: FoodItem) => {
    if (!selectedShop) return;

    if (selectedShop.category.toLowerCase() === "restaurant") {
      setSelectedItem(item);
      setSelectedAddons([]);
      return;
    }

    addToCart(item, selectedShop.name, [], productQuantities[item.id] ?? 1);
    setProductQuantities((previous) => ({ ...previous, [item.id]: 1 }));
  };

  // Filter products
  const filteredProducts = selectedShop
    ? selectedShop.items.filter((item) => {
        const matchesSearch =
          item.name
            .toLowerCase()
            .includes(productSearch.trim().toLowerCase()) ||
          (item.description ?? "")
            .toLowerCase()
            .includes(productSearch.trim().toLowerCase());

        const matchesCategory =
          productFilter === "All" ||
          getProductGroup(item, selectedShop.category) ===
            productFilter;

        return item.is_available && matchesSearch && matchesCategory;
      })
    : [];

  return (
    <main className="app-shell">
      {/* LEFT MENU PANEL */}
      <aside className="menu-sidebar">
        <div className="sidebar-header">
          <h2>Backyard Shopping</h2>
          <p>Discover local food and shops</p>
        </div>

        {loading && (
          <p className="sidebar-message">Loading shops...</p>
        )}

        {error && <p className="sidebar-error">{error}</p>}

        {!loading && !error && (
          <div
            className={`sidebar-content ${
              selectedShop ? "shopping-mode" : "browse-mode"
            }`}
          >
            {selectedShop ? (
              <>
                {/* SELECTED SHOP HEADER */}
                <div className="selected-shop-header">
                  <button
                    className="back-to-shops"
                    onClick={() => {
                      setSelectedShop(null);
                      setSelectedItem(null);
                      setSelectedAddons([]);
                      setProductSearch("");
                      setProductFilter("All");
                    }}
                  >
                    ← All shops
                  </button>

                  <div className="selected-shop-title-row">
                    <span className="selected-shop-icon">
                      {getCategoryIcon(selectedShop.category)}
                    </span>

                    <div className="selected-shop-title">
                      <span className="selected-shop-category">
                        {selectedShop.category}
                      </span>
                      <h2>{selectedShop.name}</h2>
                    </div>
                  </div>

                  <p className="selected-shop-description">
                    {selectedShop.description}
                  </p>

                  <small className="selected-shop-address">
                    {selectedShop.address}
                  </small>
                </div>

                {/* PRODUCTS HEADER */}
                <div className="products-heading">
                  <div>
                    <h3>{isRestaurant ? "Menu" : "Products"}</h3>
                    <span>
                      {selectedShop.items.filter(
                        (item) => item.is_available
                      ).length}{" "}
                      items available
                    </span>
                  </div>
                </div>

                {/* SEARCH AND FILTER */}
                <div className="product-tools">
                  <div className="product-search-wrap">
                    <span className="product-search-icon">⌕</span>

                    <input
                      className="product-search"
                      value={productSearch}
                      onChange={(event) =>
                        setProductSearch(event.target.value)
                      }
                      placeholder="Search products..."
                    />

                    {productSearch && (
                      <button
                        className="clear-product-search"
                        onClick={() => setProductSearch("")}
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* CATEGORY FILTER */}
                  <div className="product-filter-pills">
                    {["All", "Food", "Grocery", "Fashion", "Other"].map(
                      (filter) => (
                        <button
                          key={filter}
                          className={`product-filter-pill ${
                            productFilter === filter ? "active" : ""
                          }`}
                          onClick={() => setProductFilter(filter)}
                        >
                          {filter}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* PRODUCT LIST */}
                <div className="food-list">
                  {filteredProducts.map((item) => (
                    <div className="food-card product-card" key={item.id}>
                      {/* PRODUCT IMAGE */}
                      <div className="product-image-wrap">
                        <img
                          className="product-image"
                          src={getProductImage(
                            item,
                            selectedShop.category
                          )}
                          alt={item.name}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />

                        <span className="product-category-icon">
                          {getCategoryIcon(selectedShop.category)}
                        </span>
                      </div>

                      <div className="food-card-content">
                        <div>
                          <h4>{item.name}</h4>
                          <p>{item.description}</p>
                        </div>

                        <div className="product-quantity-control">
                          <button
                            type="button"
                            onClick={() => changeProductQuantity(item.id, -1)}
                            aria-label={`Decrease ${item.name} quantity`}
                          >−</button>
                          <span>{productQuantities[item.id] ?? 1}</span>
                          <button
                            type="button"
                            onClick={() => changeProductQuantity(item.id, 1)}
                            aria-label={`Increase ${item.name} quantity`}
                          >+</button>
                        </div>

                        <div className="food-card-bottom">
                          <strong>
                            ${Number(item.price).toFixed(2)}
                          </strong>

                          <button
                            className="addon-confirm-button"
                            onClick={() => handleAddItem(item)}
                          >
                            {isRestaurant ? "Customize" : "Add to Cart"}
                          </button>
                        </div>
                      </div>

                      {/* RESTAURANT ADD-ONS */}
                      {selectedItem?.id === item.id &&
                        isRestaurant && (
                          <div className="addons-section">
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
                                      (selected) =>
                                        selected.name === addon.name
                                    )}
                                    onChange={() =>
                                      setSelectedAddons((previous) =>
                                        previous.some(
                                          (selected) =>
                                            selected.name === addon.name
                                        )
                                          ? previous.filter(
                                              (selected) =>
                                                selected.name !==
                                                addon.name
                                            )
                                          : [...previous, addon]
                                      )
                                    }
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
                                $
                                {selectedAddons
                                  .reduce(
                                    (sum, addon) =>
                                      sum + addon.price,
                                    0
                                  )
                                  .toFixed(2)}
                              </span>
                            </div>

                            <button
                              className="addon-confirm-button"
                              onClick={() => {
                                addToCart(
                                  item,
                                  selectedShop.name,
                                  selectedAddons,
                                  productQuantities[item.id] ?? 1
                                );
                                setProductQuantities((previous) => ({ ...previous, [item.id]: 1 }));

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

                  {/* EMPTY SEARCH RESULT */}
                  {filteredProducts.length === 0 && (
                    <div className="no-products">
                      No products match your search. Try another keyword or
                      filter.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* SHOP CATEGORIES */}
                <div className="category-section">
                  <h3>Shop Categories</h3>
<div className="category-pills">
  {categories.map((category) => (
    <button
      key={category}
      className={`category-pill ${
        selectedCategory === category ? "active" : ""
      }`}
      onClick={() => handleCategoryChange(category)}
    >
      {category === "All"
        ? "🏪 All Shops"
        : `${getCategoryIcon(category)} ${category}`}
    </button>
  ))}
</div>
                </div>

                {/* SHOP LIST */}
                <div className="shop-list-section">
                  <div className="shop-list-heading">
                    <h3>Local Shops</h3>
                    <span>{filteredShops.length}</span>
                  </div>

                  {filteredShops.length === 0 && (
                    <p className="sidebar-message">
                      No shops available in this category.
                    </p>
                  )}

                  {filteredShops.map((shop) => (
                    <button
                      key={shop.id}
                      className="shop-list-card"
                      onClick={() => handleShopSelect(shop)}
                    >
                      <div className="shop-card-icon">
                        {getCategoryIcon(shop.category)}
                      </div>

                      <div className="shop-card-details">
                        <strong>{shop.name}</strong>
                        <span>{shop.category}</span>
                        <small>{shop.address}</small>
                      </div>

                      <span className="shop-card-arrow">›</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* SIDEBAR FOOTER */}
        <div className="sidebar-footer">
          {selectedShop ? (
            <button
              className="sidebar-cart-button"
              onClick={() => setCartOpen(true)}
            >
              🛒 View Cart <span>{cartCount} items</span>
            </button>
          ) : (
            <span>Backyard Shopping System</span>
          )}
        </div>
      </aside>

      {/* MAP AREA */}
      <section className="map-section">
        <header className="map-header">
          <div>
            <h1>Explore Local Shops</h1>
            <p>Find shops and restaurants around St. John's.</p>
          </div>

          <button
            className="cart-button"
            onClick={() => setCartOpen(true)}
          >
            🛒 Cart
            <span className="cart-count">{cartCount}</span>
          </button>
        </header>

        {/* TOAST */}
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
              {showPaymentMethods ? (
                <PaymentMethods
                  total={cartTotal}
                  onBack={() => setShowPaymentMethods(false)}
                  onConfirm={(method: PaymentMethod) => {
                    alert(
                      `You selected ${method}. Actual payment processing is not available yet.`
                    );
                  }}
                />
              ) : (
                <>
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
                        <p>Add products from the shops.</p>
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
                                    (sum, addon) =>
                                      sum + addon.price,
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
                        <strong>${cartTotal.toFixed(2)}</strong>
                      </div>

                      <button
                        className="checkout-button"
                        onClick={() =>
                          setShowPaymentMethods(true)
                        }
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
      </section>
    </main>
  );
}

export default App;