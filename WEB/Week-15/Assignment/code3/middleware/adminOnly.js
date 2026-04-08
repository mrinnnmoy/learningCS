// A simple role check using a request header.
// In a real app this would read from a verified JWT — here x-role keeps it simple.
const adminOnly = (req, res, next) => {
    const role = req.headers['x-role'];
    if (role !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

module.exports = { adminOnly };