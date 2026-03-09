// Strip fields that should NEVER appear in API responses
const SENSITIVE = ['password', 'passwordHash', '__v', 'resetToken', 'internalNotes', 'salt'];

function sanitize(obj) {
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (obj && typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj).filter(([k]) => !SENSITIVE.includes(k))
        );
    }
    return obj;
}
module.exports = sanitize;