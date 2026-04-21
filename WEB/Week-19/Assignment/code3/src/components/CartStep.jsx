const SHIPPING_FEE = 5.99;
const FREE_SHIPPING_THRESHOLD = 50;

export default function CartStep({ cartItems, onUpdateQuantity, onRemoveItem, onNext }) {
    // Derived values — recalculated fresh on every render from cartItems.
    // Never stored as their own useState — that would risk them going stale
    // or out of sync with the actual cart contents.
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
    const total = subtotal + shippingFee;

    return (
        <div className="step-content">
            <h2>Your Cart</h2>

            {cartItems.length === 0 ? (
                <p className="empty-state">Your cart is empty.</p>
            ) : (
                <ul className="cart-list">
                    {cartItems.map(item => (
                        <li key={item.id} className="cart-item">
                            <div className="cart-item-info">
                                <span className="cart-item-name">{item.name}</span>
                                <span className="cart-item-price">${item.price.toFixed(2)} each</span>
                            </div>
                            <div className="quantity-controls">
                                <button
                                    onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                    className="qty-btn"
                                >−</button>
                                <span className="qty-value">{item.quantity}</span>
                                <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                    className="qty-btn"
                                >+</button>
                            </div>
                            <span className="cart-item-total">
                                ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            <button onClick={() => onRemoveItem(item.id)} className="remove-btn">
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="cart-summary">
                <div className="summary-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                    <span>Shipping {shippingFee === 0 && subtotal > 0 && '(Free over $50)'}</span>
                    <span>${shippingFee.toFixed(2)}</span>
                </div>
                <div className="summary-row total-row">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>

            <div className="step-actions">
                <button
                    onClick={onNext}
                    disabled={cartItems.length === 0}
                    className="next-btn"
                >
                    Next: Shipping
                </button>
            </div>
        </div>
    );
}