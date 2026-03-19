// URL safety validator used by the /api/preview route (SSRF fix).
//
// Validates that a user-supplied URL is safe for the server to fetch.
// Three checks in order:
//   1. URL must be parseable.
//   2. Protocol must be https: — blocks http, file, ftp, and others.
//   3. Hostname resolves to a public IP — not private, loopback, or link-local.
//
// Why DNS resolution is required:
//   An attacker can register a domain like "mysite.com" that resolves to
//   169.254.169.254 (AWS metadata endpoint) in their own DNS records.
//   A simple hostname check would miss this. We resolve first, then check the IP.
//
// Private IP ranges covered:
//   10.0.0.0/8       — RFC 1918 private
//   172.16.0.0/12    — RFC 1918 private
//   192.168.0.0/16   — RFC 1918 private
//   127.0.0.0/8      — loopback
//   169.254.0.0/16   — link-local (AWS/GCP/Azure instance metadata lives here)

const { URL } = require('url');
const dns = require('dns').promises;

const PRIVATE_IP_REGEX =
    /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|169\.254\.)/;

async function isSafeUrl(inputUrl) {
    let parsed;
    try {
        parsed = new URL(inputUrl);
    } catch {
        return false; // malformed URL
    }

    if (parsed.protocol !== 'https:') return false;

    try {
        const { address } = await dns.lookup(parsed.hostname);
        if (PRIVATE_IP_REGEX.test(address)) return false;
    } catch {
        return false; // DNS resolution failed
    }

    return true;
}

module.exports = { isSafeUrl };