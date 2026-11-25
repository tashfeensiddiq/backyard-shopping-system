
const API_BASE_URL = "http://127.0.0.1:8000";

// Data sent to the backend when placing an order
export interface OrderCreatePayload {
  customer_key: string;
  customer_name: string;
  phone_number: string;
  delivery_address: string;
  payment_method: string;
  promo_code?: string | null;
  items: {
    item_id: number;
    quantity: number;
    addons: string[];
  }[];
}

// Unique customer key for this browser
export function getCustomerKey(): string {
  let customerKey = localStorage.getItem("backyard_customer_key");

  if (!customerKey) {
    customerKey = crypto.randomUUID();
    localStorage.setItem("backyard_customer_key", customerKey);
  }

  return customerKey;
}

// Order information returned by the backend
export interface OrderResponse {
  id: number;
  customer_key?: string | null;
  customer_name: string;
  phone_number: string;
  delivery_address: string;
  payment_method: string;
  promo_code?: string | null;
  discount_amount: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: {
    id: number;
    item_name: string;
    shop_name: string;
    quantity: number;
    unit_price: number;
    addons: string | null;
  }[];
}

// Save a new order
export async function createOrder(
  orderData: OrderCreatePayload
): Promise<OrderResponse> {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Unable to place order");
  }

  return response.json();
}

// Retrieve previous and current orders
export async function fetchOrders(
  customerKey: string
): Promise<OrderResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/orders/${encodeURIComponent(customerKey)}`
  );

  if (!response.ok) {
    throw new Error("Unable to load order history");
  }

  return response.json();
}
