
import { useState } from "react";
import "./PaymentMethods.css";

export type PaymentMethod = "PayPal" | "Visa" | "Apple Pay";

export interface DeliveryAddress {
  countryRegion: string;
  customerName: string;
  phoneNumber: string;
  streetAddress: string;
  apartment: string;
  province: string;
  city: string;
  postalCode: string;
}

interface PaymentMethodsProps {
  total: number;
  onBack: () => void;
  onConfirm: (
    method: PaymentMethod,
    address: DeliveryAddress
  ) => void;
}

function PaymentMethods({
  total,
  onBack,
  onConfirm,
}: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("Visa");

  const [address, setAddress] = useState<DeliveryAddress>({
    countryRegion: "",
    customerName: "",
    phoneNumber: "",
    streetAddress: "",
    apartment: "",
    province: "",
    city: "",
    postalCode: "",
  });

  const methods: PaymentMethod[] = [
    "PayPal",
    "Visa",
    "Apple Pay",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(selectedMethod, address);
  };

  return (
    <form className="payment-container" onSubmit={handleSubmit}>

      {/* DELIVERY ADDRESS SECTION */}
      <div className="delivery-section">
        <h3>Delivery Address</h3>

        <p className="payment-description">
          Please enter your delivery information.
        </p>

        <div className="delivery-fields">

          <div className="delivery-field full-width">
            <label>Country / Region *</label>
            <input
              type="text"
              name="countryRegion"
              placeholder="Enter country or region"
              value={address.countryRegion}
              onChange={handleChange}
              required
            />
          </div>

          <div className="delivery-field full-width">
            <label>Customer Name *</label>
            <input
              type="text"
              name="customerName"
              placeholder="Enter your full name"
              value={address.customerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="delivery-field full-width">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Enter phone number"
              value={address.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="delivery-field full-width">
            <label>Street Address *</label>
            <input
              type="text"
              name="streetAddress"
              placeholder="House number and street name"
              value={address.streetAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div className="delivery-field full-width">
            <label>Apartment, Suite, etc. (Optional)</label>
            <input
              type="text"
              name="apartment"
              placeholder="Apartment or unit number"
              value={address.apartment}
              onChange={handleChange}
            />
          </div>

          <div className="delivery-field">
            <label>Province *</label>
            <input
              type="text"
              name="province"
              placeholder="Province"
              value={address.province}
              onChange={handleChange}
              required
            />
          </div>

          <div className="delivery-field">
            <label>City *</label>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={address.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="delivery-field full-width">
            <label>Postal Code *</label>
            <input
              type="text"
              name="postalCode"
              placeholder="Postal / ZIP code"
              value={address.postalCode}
              onChange={handleChange}
              required
            />
          </div>

        </div>
      </div>

      {/* PAYMENT METHODS SECTION */}
      <div className="payment-method-section">
        <h3>Choose Payment Method</h3>

        <p className="payment-description">
          Select your preferred payment method.
        </p>

        <div className="payment-options">
          {methods.map((method) => (
            <label
              key={method}
              className={`payment-option ${
                selectedMethod === method ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={method}
                checked={selectedMethod === method}
                onChange={() => setSelectedMethod(method)}
              />

              <span className="payment-name">
                {method}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* TOTAL */}
      <div className="payment-total">
        <span>Total Amount</span>
        <strong>${total.toFixed(2)}</strong>
      </div>

      <button
        type="submit"
        className="payment-confirm-button"
      >
        Confirm Payment Method
      </button>

      <button
        type="button"
        className="payment-back-button"
        onClick={onBack}
      >
        ← Back to Shopping Cart
      </button>

    </form>
  );
}

export default PaymentMethods;
