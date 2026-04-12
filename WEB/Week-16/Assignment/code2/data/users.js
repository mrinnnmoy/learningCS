const users = [];
let nextId = 1;

const findByEmail = (email) => users.find(u => u.email === email) || null;
const findById = (id) => users.find(u => u.id === Number(id)) || null;

const createUser = (email, passwordHash) => {
    const user = { id: nextId++, email, password: passwordHash };
    users.push(user);
    return { id: user.id, email: user.email };
};

module.exports = { findByEmail, findById, createUser };