export default function ConfirmationScreen({ orderNumber, total }) {
    return (
        <div className="confirmation-screen">
            <div className="confirmation-icon">✅</div>
            <h2>Order Confirmed!</h2>
            <p>Thank you for your purchase.</p>
            <div className="confirmation-details">
                <div className="summary-row">
                    <span>Order Number</span>
                    <span>#{orderNumber}</span>
                </div>
                <div className="summary-row total-row">
                    <span>Total Charged</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}