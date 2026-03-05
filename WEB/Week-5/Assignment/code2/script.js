const statusDiv = document.getElementById("status");
const usersContainer = document.getElementById("usersContainer");
const reloadBtn = document.getElementById("reloadBtn");

// Public API
const API_URL = "https://jsonplaceholder.typicode.com/users";

// Abort controller
let controller;

// Fetch users
async function fetchUsers() {

    // Cancel old request if exists
    if (controller) {
        controller.abort();
    }

    controller = new AbortController();

    // Clear old UI
    usersContainer.innerHTML = "";
    statusDiv.innerHTML = "Loading...";

    try {

        // Fetch API
        const response = await fetch(API_URL, {
            signal: controller.signal
        });

        // HTTP Error
        if (!response.ok) {
            throw new Error("API_ERROR");
        }

        let users;

        // JSON Parsing Error Handling
        try {
            users = await response.json();
        } catch (error) {
            throw new Error("JSON_ERROR");
        }

        // Clear loading text
        statusDiv.innerHTML = "";

        // Render users
        users.forEach(user => {

            const card = document.createElement("div");
            card.classList.add("user-card");

            card.innerHTML = `
            <h3>${user.name}</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Company:</strong> ${user.company.name}</p>
          `;

            usersContainer.appendChild(card);
        });

    } catch (error) {

        // Ignore aborted requests
        if (error.name === "AbortError") {
            return;
        }

        usersContainer.innerHTML = "";

        // Error Handling
        if (error.message === "API_ERROR") {
            statusDiv.innerHTML =
                '<p class="error">API Error</p>';

        } else if (error.message === "JSON_ERROR") {
            statusDiv.innerHTML =
                '<p class="error">Data Parsing Error</p>';

        } else {
            statusDiv.innerHTML =
                '<p class="error">Network Error</p>';
        }
    }
}

// Reload button
reloadBtn.addEventListener("click", fetchUsers);

// Initial fetch
fetchUsers();