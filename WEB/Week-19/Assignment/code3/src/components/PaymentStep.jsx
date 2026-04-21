import { useState } from 'react';

const FIELDS = [
    { name: 'cardNumber', label: 'Card Number (16 digits)', placeholder: '1234567890123456' },
    { name: 'expiry', label: 'Expiry (MM/YY)', placeholder: '12/27' },
    { name: 'cvv', label: 'CVV (3 digits)', placeholder: '123' },
];

function validateField(name, value) {
    const trimmed = value.trim();
    if (!trimmed) return 'This field is required';

    if (name === 'cardNumber' && !/^\d{16}$/.test(trimmed)) {
        return 'Card number must be exactly 16 digits';
    }
    if (name === 'expiry' && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(trimmed)) {
        return 'Expiry must be in MM/YY format';
    }
    if (name === 'cvv' && !/^\d{3}$/.test(trimmed)) {
        return 'CVV must be exactly 3 digits';
    }
    return '';
}

const SHIPPING_FEE = 5.99;
const FREE_SHIPPING_THRESHOLD = 50;

export default function PaymentStep({
    cartItems, shippingInfo, paymentInfo, onPaymentChange, onPlaceOrder, onBack,
}) {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = (name, value) => {
        onPaymentChange({ ...paymentInfo, [name]: value });
        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const handleBlur = (name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, paymentInfo[name]) }));
    };

    const isFormValid = FIELDS.every(
        field => validateField(field.name, paymentInfo[field.name]) === ''
    );

    // Recompute the same derived total shown on the cart step —
    // demonstrates reusing previously collected state across steps.
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shippingFee;

    return (
        <div className="step-content">
            <h2>Payment & Confirm</h2>

            <div className="order-summary">
                <h3>Order Summary</h3>
                {cartItems.map(item => (
                    <div key={item.id} className="summary-row">
                        <span>{item.name} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
                <div className="summary-row">
                    <span>Shipping</span>
                    <span>${shippingFee.toFixed(2)}</span>
                </div>
                <div className="summary-row total-row">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>

                <h3>Shipping To</h3>
                <p className="address-block">
                    {shippingInfo.fullName}<br />
                    {shippingInfo.address}<br />
                    {shippingInfo.city}, {shippingInfo.postalCode}<br />
                    {shippingInfo.phone}
                </p>
            </div>

            <div className="form-fields">
                {FIELDS.map(field => (
                    <div key={field.name} className="form-field">
                        <label htmlFor={field.name}>{field.label}</label>
                        <input
                            id={field.name}
                            type="text"
                            placeholder={field.placeholder}
                            value={paymentInfo[field.name]}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            onBlur={() => handleBlur(field.name)}
                            className={touched[field.name] && errors[field.name] ? 'input-error' : ''}
                        />
                        {touched[field.name] && errors[field.name] && (
                            <span className="error-text">{errors[field.name]}</span>
                        )}
                    </div>
                ))}
            </div>

            <div className="step-actions">
                <button onClick={onBack} className="back-btn">Back</button>
                <button
                    onClick={() => onPlaceOrder(total)}
                    disabled={!isFormValid}
                    className="next-btn"
                >
                    Place Order
                </button>
            </div>
        </div>
    );
}