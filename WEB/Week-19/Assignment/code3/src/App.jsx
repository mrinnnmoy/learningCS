import { useState } from 'react';
import { initialCart } from './data/initialCart';
import Stepper from './components/Stepper';
import CartStep from './components/CartStep';
import ShippingStep from './components/ShippingStep';
import PaymentStep from './components/PaymentStep';
import ConfirmationScreen from './components/ConfirmationScreen';

const emptyShipping = { fullName: '', address: '', city: '', postalCode: '', phone: '' };
const emptyPayment = { cardNumber: '', expiry: '', cvv: '' };

function App() {
  // All shared state lives here, at the top, and flows DOWN as props.
  // This is "lifting state up" — necessary because both CartStep and
  // PaymentStep need cartItems, and both ShippingStep and PaymentStep
  // need shippingInfo. No single step owns data that another step needs.
  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState(initialCart);
  const [shippingInfo, setShippingInfo] = useState(emptyShipping);
  const [paymentInfo, setPaymentInfo] = useState(emptyPayment);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);

  const updateQuantity = (id, newQuantity) => {
    setCartItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
    );
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const goNext = () => setCurrentStep(prev => prev + 1);
  const goBack = () => setCurrentStep(prev => prev - 1);

  const placeOrder = (total) => {
    setOrderNumber(Date.now());
    setOrderTotal(total);
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="app">
        <ConfirmationScreen orderNumber={orderNumber} total={orderTotal} />
      </div>
    );
  }

  return (
    <div className="app">
      <h1 className="page-title">Checkout</h1>
      <Stepper currentStep={currentStep} />

      {currentStep === 1 && (
        <CartStep
          cartItems={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onNext={goNext}
        />
      )}

      {currentStep === 2 && (
        <ShippingStep
          shippingInfo={shippingInfo}
          onShippingChange={setShippingInfo}
          onNext={goNext}
          onBack={goBack}
        />
      )}

      {currentStep === 3 && (
        <PaymentStep
          cartItems={cartItems}
          shippingInfo={shippingInfo}
          paymentInfo={paymentInfo}
          onPaymentChange={setPaymentInfo}
          onPlaceOrder={placeOrder}
          onBack={goBack}
        />
      )}
    </div>
  );
}

export default App;