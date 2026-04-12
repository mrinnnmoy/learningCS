// A subscribed Redis connection cannot run normal commands (GET, SET, etc.)
// It enters a special mode where it can only receive messages.
// We use a dedicated connection for subscribing.
const { createRedisClient } = require('./redis');

const sub = createRedisClient('Redis Subscriber');

// Handler registry — other parts of the app can register handlers
const handlers = {};

const addHandler = (channel, fn) => {
    handlers[channel] = fn;
};

sub.on('message', (channel, message) => {
    console.log(`\n[PubSub] Channel: ${channel} | Message: ${message}`);
    if (handlers[channel]) {
        try { handlers[channel](JSON.parse(message)); } catch (e) { }
    }
});

const subscribeToChannel = async (channel) => {
    await sub.subscribe(channel);
    console.log(`📡 Subscribed to channel: ${channel}`);
};

module.exports = { sub, subscribeToChannel, addHandler };