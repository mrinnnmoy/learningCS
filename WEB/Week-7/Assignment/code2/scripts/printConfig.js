const config = require('../config');

// Mask sensitive values
function maskSecret(value) {
    if (!value || value.length <= 4) {
        return '****';
    }

    return `${value.slice(0, 4)}****`;
}

const safeConfig = {
    port: config.port,

    db: {
        url: config.db.url,
    },

    logLevel: config.logLevel,

    api: {
        baseUrl: config.api.baseUrl,
        key: maskSecret(config.api.key),
    },
};

console.log(safeConfig);