// Elements
const titleInput = document.getElementById("titleInput");
const descriptionInput = document.getElementById("descriptionInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const notesContainer = document.getElementById("notesContainer");
const message = document.getElementById("message");

// Load notes from localStorage
let notes = JSON.parse(localStorage.getItem("notes")) || [];

// Save notes to localStorage
function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
}

// Render notes
function renderNotes() {
    notesContainer.innerHTML = "";

    notes.forEach((note, index) => {

        const noteDiv = document.createElement("div");
        noteDiv.classList.add("note");

        noteDiv.innerHTML = `
          <h3>${note.title}</h3>

          <p>${note.description}</p>

          <button class="edit-btn" data-index="${index}">
            Edit
          </button>

          <button class="delete-btn" data-index="${index}">
            Delete
          </button>
        `;

        notesContainer.appendChild(noteDiv);
    });
}

// Clear form
function clearForm() {
    titleInput.value = "";
    descriptionInput.value = "";
}

// Show validation message
function showMessage(text) {
    message.textContent = text;

    setTimeout(() => {
        message.textContent = "";
    }, 2000);
}

// Add note
addNoteBtn.addEventListener("click", () => {

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    // Validation
    if (title === "" || description === "") {
        showMessage("Please fill all fields.");
        return;
    }

    // Create note object
    const note = {
        title,
        description
    };

    // Add to array
    notes.push(note);

    // Save + render
    saveNotes();
    renderNotes();

    // Clear form
    clearForm();
});

// Event Delegation
notesContainer.addEventListener("click", (event) => {

    const index = event.target.dataset.index;

    // DELETE NOTE
    if (event.target.classList.contains("delete-btn")) {

        notes.splice(index, 1);

        saveNotes();
        renderNotes();
    }

    // EDIT NOTE
    if (event.target.classList.contains("edit-btn")) {

        const currentNote = notes[index];

        // Prompt user for updated values
        const updatedTitle = prompt(
            "Edit Title",
            currentNote.title
        );

        const updatedDescription = prompt(
            "Edit Description",
            currentNote.description
        );

        // Prevent empty updates
        if (
            updatedTitle === null ||
            updatedDescription === null
        ) {
            return;
        }

        if (
            updatedTitle.trim() === "" ||
            updatedDescription.trim() === ""
        ) {
            showMessage("Fields cannot be empty.");
            return;
        }

        // Update note
        notes[index] = {
            title: updatedTitle,
            description: updatedDescription
        };

        saveNotes();
        renderNotes();
    }
});

// Initial render
renderNotes();