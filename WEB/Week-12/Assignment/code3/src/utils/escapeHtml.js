// Escapes HTML special characters before including user input in responses.
//
// Even in JSON APIs, reflecting raw user input can enable XSS if the client
// renders the value in an HTML context (innerHTML, template literals, etc.).
// Escaping is cheap, safe, and has no downside.

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

module.exports = { escapeHtml };
