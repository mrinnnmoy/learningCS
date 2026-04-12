// In-memory product store — simulates a database for this assignment
let products = [
    { id: 1, name: 'Laptop', price: 999.99, category: 'electronics' },
    { id: 2, name: 'Phone', price: 599.99, category: 'electronics' },
    { id: 3, name: 'Running Shoes', price: 89.99, category: 'clothing' },
];
let nextId = 4;

const getAllProducts = () => [...products];

const getProductById = (id) => products.find(p => p.id === Number(id)) || null;

const createProduct = ({ name, price, category }) => {
    const product = { id: nextId++, name, price: Number(price), category };
    products.push(product);
    return product;
};

const updateProduct = (id, updates) => {
    const index = products.findIndex(p => p.id === Number(id));
    if (index === -1) return null;
    products[index] = { ...products[index], ...updates };
    return products[index];
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct };