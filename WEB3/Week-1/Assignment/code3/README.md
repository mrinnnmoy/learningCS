**How to Build.**

```
1. Step 1 — Add the new files to the existing project.

    From inside your existing `web3-orientation-kit/` folder:

        mkdir public

2. Step 2 — Write `server.js` using Node's built-in `http` module.

3. Step 3 — Define the JSON API routes inside `server.js`.

    You need: `GET /api/progress` (return current state), `POST /api/progress/:week` (toggle one week), and `GET /api/doctor` (run the same check as the CLI, return JSON instead of printing).

4. Step 4 — Write the static frontend in `public/`.

    Plain HTML + CSS + vanilla JS — no frontend framework or build step.

5. Step 5 — Serve static files and API routes from the same server.

    `server.js` inspects the request path: if it starts with `/api/`, handle it as an API call; otherwise, treat it as a request for a file in `public/`.

6. Step 6 — Run it and open the dashboard.

        node server.js

    Then open the printed URL (`http://localhost:4242`) in your browser.
```
