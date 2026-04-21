import { useState } from 'react';

const FIELDS = [
    { name: 'fullName', label: 'Full Name', type: 'text' },
    { name: 'address', label: 'Address', type: 'text' },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'postalCode', label: 'Postal Code', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
];

function validateField(name, value) {
    const trimmed = value.trim();
    if (!trimmed) return 'This field is required';

    if (name === 'postalCode' && !/^\d{5}$/.test(trimmed)) {
        return 'Postal code must be exactly 5 digits';
    }
    if (name === 'phone' && !/^\d{10}$/.test(trimmed)) {
        return 'Phone must be exactly 10 digits';
    }
    return '';
}

export default function ShippingStep({ shippingInfo, onShippingChange, onNext, onBack }) {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = (name, value) => {
        onShippingChange({ ...shippingInfo, [name]: value });
        // Re-validate live ONLY if the field was already touched —
        // avoids showing an error the instant the user starts typing.
        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
    };

    const handleBlur = (name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, shippingInfo[name]) }));
    };

    // The form is valid only if every field passes validation right now
    const isFormValid = FIELDS.every(
        field => validateField(field.name, shippingInfo[field.name]) === ''
    );

    return (
        <div className="step-content">
            <h2>Shipping Information</h2>

            <div className="form-fields">
                {FIELDS.map(field => (
                    <div key={field.name} className="form-field">
                        <label htmlFor={field.name}>{field.label}</label>
                        <input
                            id={field.name}
                            type={field.type}
                            value={shippingInfo[field.name]}
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
                <button onClick={onNext} disabled={!isFormValid} className="next-btn">
                    Next: Payment
                </button>
            </div>
        </div>
    );
}