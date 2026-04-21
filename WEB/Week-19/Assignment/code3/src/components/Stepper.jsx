const steps = [
    { number: 1, label: 'Cart' },
    { number: 2, label: 'Shipping' },
    { number: 3, label: 'Payment' },
];

export default function Stepper({ currentStep }) {
    return (
        <div className="stepper">
            {steps.map((step, index) => (
                <div key={step.number} className="stepper-item">
                    <div
                        className={`stepper-circle ${step.number === currentStep ? 'active' :
                                step.number < currentStep ? 'completed' : ''
                            }`}
                    >
                        {step.number < currentStep ? '✓' : step.number}
                    </div>
                    <span className="stepper-label">{step.label}</span>
                    {index < steps.length - 1 && <div className="stepper-line" />}
                </div>
            ))}
        </div>
    );
}