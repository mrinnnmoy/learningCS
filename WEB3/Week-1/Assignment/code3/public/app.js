const weekListEl = document.getElementById("week-list");
const doctorButton = document.getElementById("doctor-button");
const doctorResultsEl = document.getElementById("doctor-results");

async function loadAndRenderProgress() {
    const response = await fetch("/api/progress");
    if (!response.ok) {
        weekListEl.innerHTML = "<li>Failed to load progress.</li>";
        return;
    }
    const progress = await response.json();
    renderWeekList(progress);
}

function renderWeekList(progress) {
    weekListEl.innerHTML = "";

    for (let week = 1; week <= 42; week++) {
        const li = document.createElement("li");
        const label = document.createElement("label");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = Boolean(progress[String(week)]);
        checkbox.addEventListener("change", () => handleToggle(week));

        const text = document.createTextNode(`Week ${String(week).padStart(2, "0")}`);

        label.appendChild(checkbox);
        label.appendChild(text);
        li.appendChild(label);
        weekListEl.appendChild(li);
    }
}

async function handleToggle(week) {
    const response = await fetch(`/api/progress/${week}`, { method: "POST" });
    if (!response.ok) {
        console.error(`Failed to toggle week ${week}`);
        await loadAndRenderProgress();
        return;
    }
    const updatedProgress = await response.json();
    renderWeekList(updatedProgress);
}

async function handleRunDoctor() {
    doctorButton.disabled = true;
    doctorButton.textContent = "Checking...";
    doctorResultsEl.textContent = "";

    try {
        const response = await fetch("/api/doctor");
        const result = await response.json();

        const lines = result.tools.map((tool) => {
            if (tool.found) return `[ OK ] ${tool.name}  ${tool.version}`;
            if (tool.required) return `[FAIL] ${tool.name}  not found (required now)`;
            return `[ -- ] ${tool.name}  not installed yet (needed later in the course)`;
        });
        doctorResultsEl.textContent = lines.join("\n");
    } catch (err) {
        doctorResultsEl.textContent = "Failed to run doctor check — is the server running?";
    } finally {
        doctorButton.disabled = false;
        doctorButton.textContent = "Run Toolchain Doctor";
    }
}

doctorButton.addEventListener("click", handleRunDoctor);

loadAndRenderProgress();