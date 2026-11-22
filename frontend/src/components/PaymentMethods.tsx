
import { useState } from "react";
import "./PaymentMethods.css";

export type PaymentMethod = "PayPal" | "Visa" | "Apple Pay";

interface PaymentMethodsProps {
  total: number;
  onBack: () => void;
  onConfirm: (method: PaymentMethod) => void;
}

function PaymentMethods({
  total,
  onBack,
  onConfirm,
}: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("Visa");

  const methods: PaymentMethod[] = [
    "PayPal",
    "Visa",
    "Apple Pay",
  ];

  return (
    <div className="payment-container">
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

      <div className="payment-total">
        <span>Total Amount</span>
        <strong>${total.toFixed(2)}</strong>
      </div>

      <button
        className="payment-confirm-button"
        onClick={() => onConfirm(selectedMethod)}
      >
        Confirm Payment Method
      </button>

      <button
        className="payment-back-button"
        onClick={onBack}
      >
        ← Back to Shopping Cart
      </button>
    </div>
  );
}

export default PaymentMethods;
