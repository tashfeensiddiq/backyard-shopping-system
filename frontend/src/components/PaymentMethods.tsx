
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
  address: DeliveryAddress,
  promoCode: string | null
 ) => void;
}

type CheckoutStep = "address" | "card" | "review";

function PaymentMethods({
  total,
  onBack,
  onConfirm,
}: PaymentMethodsProps) {
  const [step, setStep] = useState<CheckoutStep>("address");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [promoError, setPromoError] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

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

  const [card, setCard] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const methods: PaymentMethod[] = [
    "PayPal",
    "Visa",
    "Apple Pay",
  ];

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCardChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setCard((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleConfirmPayment = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (selectedMethod === "Visa") {
      setStep("card");
    } else {
      setStep("review");
    }
  };

  const handleCardSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setStep("review");
  };
/* promo code hendle jkr */
const handleApplyPromo = () => {
  const code = promoCode.trim().toUpperCase();

  setPromoError("");
  setAppliedPromo("");
  setDiscountAmount(0);

  if (code === "WELCOME10") {
    setAppliedPromo(code);
    setDiscountAmount(Number((total * 0.10).toFixed(2)));
  } else if (code === "SAVE5" && total >= 20) {
    setAppliedPromo(code);
    setDiscountAmount(5);
  } else if (code === "FOOD20" && total >= 30) {
    setAppliedPromo(code);
    setDiscountAmount(Number((total * 0.20).toFixed(2)));
  } else {
    setPromoError("Invalid promo code or minimum order amount not reached.");
  }
};
  const handleFinalSubmit = () => {
  onConfirm(selectedMethod, address, appliedPromo || null);
};

  return (
    <div className="payment-container">

      {/* STEP 1: DELIVERY ADDRESS AND PAYMENT METHOD */}
      {step === "address" && (
        <form onSubmit={handleConfirmPayment}>

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
                  onChange={handleAddressChange}
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
                  onChange={handleAddressChange}
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
                  onChange={handleAddressChange}
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
                  onChange={handleAddressChange}
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
                  onChange={handleAddressChange}
                />
              </div>

              <div className="delivery-field">
                <label>Province *</label>
                <input
                  type="text"
                  name="province"
                  placeholder="Province"
                  value={address.province}
                  onChange={handleAddressChange}
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
                  onChange={handleAddressChange}
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
                  onChange={handleAddressChange}
                  required
                />
              </div>

            </div>
          </div>

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
<div className="promo-code-section">
  <h3>Promo Code</h3>

  <div className="promo-code-controls">
    <input
      type="text"
      placeholder="Enter promo code"
      value={promoCode}
      onChange={(e) => setPromoCode(e.target.value)}
    />

    <button type="button" onClick={handleApplyPromo}>
      Apply
    </button>
  </div>

  {appliedPromo && (
    <p className="promo-success">
      {appliedPromo} applied successfully!
    </p>
  )}

  {promoError && (
    <p className="promo-error">{promoError}</p>
  )}
</div>
          {discountAmount > 0 && (
  <div className="payment-total">
    <span>Discount ({appliedPromo})</span>
    <strong>-${discountAmount.toFixed(2)}</strong>
  </div>
)}

<div className="payment-total">
  <span>Total Amount</span>
  <strong>${(total - discountAmount).toFixed(2)}</strong>
</div>
          <button
            type="submit"
            className="payment-confirm-button"
          >
            Confirm Payment
          </button>

          <button
            type="button"
            className="payment-back-button"
            onClick={onBack}
          >
            ← Back to Shopping Cart
          </button>

        </form>
      )}

      {/* STEP 2: CARD INFORMATION */}
      {step === "card" && (
        <form onSubmit={handleCardSubmit}>

          <div className="card-information-section">
            <h3>Card Information</h3>

            <p className="payment-description">
              Enter demo card details to continue.
            </p>

            <div className="delivery-fields">

              <div className="delivery-field full-width">
                <label>Cardholder Name *</label>
                <input
                  type="text"
                  name="cardholderName"
                  placeholder="Name on card"
                  value={card.cardholderName}
                  onChange={handleCardChange}
                  required
                />
              </div>

              <div className="delivery-field full-width">
                <label>Card Number *</label>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="Enter demo card number"
                  value={card.cardNumber}
                  onChange={handleCardChange}
                  maxLength={19}
                  pattern="[0-9 ]{13,19}"
                  title="Enter 13 to 19 digits."
                  required
                />
              </div>

              <div className="delivery-field">
                <label>Expiry Date *</label>
                <input
                  type="text"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={card.expiryDate}
                  onChange={handleCardChange}
                  pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                  title="Use MM/YY format."
                  required
                />
              </div>

              <div className="delivery-field">
                <label>CVV *</label>
                <input
                  type="password"
                  name="cvv"
                  placeholder="CVV"
                  value={card.cvv}
                  onChange={handleCardChange}
                  maxLength={4}
                  pattern="[0-9]{3,4}"
                  title="Enter 3 or 4 digits."
                  required
                />
              </div>

            </div>

            <p className="payment-description">
              Demo checkout only. Do not enter real payment details.
            </p>
          </div>

          <button
            type="submit"
            className="payment-confirm-button"
          >
            Continue to Order Review
          </button>

          <button
            type="button"
            className="payment-back-button"
            onClick={() => setStep("address")}
          >
            ← Back
          </button>

        </form>
      )}

      {/* STEP 3: ORDER REVIEW */}
      {step === "review" && (
        <div className="order-review-section">

          <h3>Review Your Order</h3>

          <div className="order-review-card">
            <h4>Delivery Information</h4>

            <p><strong>Name:</strong> {address.customerName}</p>
            <p><strong>Phone:</strong> {address.phoneNumber}</p>
            <p>
              <strong>Address:</strong>{" "}
              {address.streetAddress}
              {address.apartment && `, ${address.apartment}`}
              {`, ${address.city}, ${address.province}, ${address.postalCode}, ${address.countryRegion}`}
            </p>

            <h4>Payment Information</h4>

            <p>
              <strong>Payment Method:</strong> {selectedMethod}
            </p>

            {selectedMethod === "Visa" && (
              <p>
                <strong>Card Number:</strong>{" "}
                **** **** **** {card.cardNumber.slice(-4)}
              </p>
            )}
          </div>

         {discountAmount > 0 && (
  <div className="payment-total">
    <span>Discount ({appliedPromo})</span>
    <strong>-${discountAmount.toFixed(2)}</strong>
  </div>
)}

<div className="payment-total">
  <span>Final Total Amount</span>
  <strong>${(total - discountAmount).toFixed(2)}</strong>
</div>

          <button
            type="button"
            className="payment-confirm-button"
            onClick={handleFinalSubmit}
          >
            Submit Order
          </button>

          <button
            type="button"
            className="payment-back-button"
            onClick={() =>
              setStep(selectedMethod === "Visa" ? "card" : "address")
            }
          >
            ← Back
          </button>

        </div>
      )}

    </div>
  );
}

export default PaymentMethods;
