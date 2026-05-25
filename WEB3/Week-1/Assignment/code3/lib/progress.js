import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const PROGRESS_FILE = join(DATA_DIR, "progress.json");

const TOTAL_WEEKS = 42;

function defaultProgress() {
    const weeks = {};
    for (let i = 1; i <= TOTAL_WEEKS; i++) {
        weeks[i] = false;
    }
    return weeks;
}

function loadProgress() {
    if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!existsSync(PROGRESS_FILE)) {
        const fresh = defaultProgress();
        saveProgress(fresh);
        return fresh;
    }
    const raw = readFileSync(PROGRESS_FILE, "utf-8");
    try {
        return JSON.parse(raw);
    } catch (err) {
        console.warn("progress.json was unreadable; resetting to defaults.");
        const fresh = defaultProgress();
        saveProgress(fresh);
        return fresh;
    }
}

function saveProgress(progress) {
    writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), "utf-8");
}

export function markDone(weekNumber) {
    if (weekNumber < 1 || weekNumber > TOTAL_WEEKS) {
        throw new RangeError(`Week must be between 1 and ${TOTAL_WEEKS}, got ${weekNumber}.`);
    }
    const progress = loadProgress();
    progress[weekNumber] = true;
    saveProgress(progress);
}

export function listProgress() {
    const progress = loadProgress();
    const lines = [];
    for (let i = 1; i <= TOTAL_WEEKS; i++) {
        const marker = progress[i] ? "[x]" : "[ ]";
        lines.push(`  ${marker} Week ${String(i).padStart(2, "0")}`);
    }
    return lines;
}

export function loadProgressPublic() {
    return loadProgress();
}

export function toggleWeek(weekNumber) {
    if (weekNumber < 1 || weekNumber > TOTAL_WEEKS) {
        throw new RangeError(`Week must be between 1 and ${TOTAL_WEEKS}, got ${weekNumber}.`);
    }
    const progress = loadProgress();
    progress[weekNumber] = !progress[weekNumber];
    saveProgress(progress);
    return progress;
}