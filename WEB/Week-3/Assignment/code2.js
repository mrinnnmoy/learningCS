// Array of product objects
const products = [
    {
        id: 1,
        name: "Laptop",
        price: 50000,
        quantity: 3
    },
    {
        id: 2,
        name: "Smartphone",
        price: 25000,
        quantity: 8
    },
    {
        id: 3,
        name: "Headphones",
        price: 2000,
        quantity: 15
    },
    {
        id: 4,
        name: "Keyboard",
        price: 1500,
        quantity: 4
    },
    {
        id: 5,
        name: "Monitor",
        price: 12000,
        quantity: 2
    }
];

// 1. Calculate total inventory value
let totalValue = 0;

products.forEach(product => {
    totalValue += product.price * product.quantity;
});

// 2. Find most expensive product
let mostExpensive = products[0];

products.forEach(product => {
    if (product.price > mostExpensive.price) {
        mostExpensive = product;
    }
});

// 3. Find product with lowest stock
let lowestStock = products[0];

products.forEach(product => {
    if (product.quantity < lowestStock.quantity) {
        lowestStock = product;
    }
});

// 4. Products with quantity less than 5
const lowStockProducts = products.filter(product => product.quantity < 5);

// 5. Increase all product prices by 10%
const updatedPrices = products.map(product => {
    return {
        ...product,
        price: product.price * 1.10
    };
});

// Print Results
console.log("===== INVENTORY SYSTEM =====\n");

console.log("Products:");
console.log(products);

console.log("\nTotal Inventory Value: ₹" + totalValue);

console.log("\nMost Expensive Product:");
console.log(mostExpensive);

console.log("\nProduct with Lowest Stock:");
console.log(lowestStock);

console.log("\nProducts with Quantity Less Than 5:");
console.log(lowStockProducts);

console.log("\nProducts After 10% Price Increase:");
console.log(updatedPrices);