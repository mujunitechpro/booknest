import {
    getLibrary,
    updateBookStatus,
    removeBook
} from "./services/library-storage.mjs";

import { logoutUser } from "./services/auth.mjs";

const libraryContainer = document.querySelector("#library-books");
const libraryMessage = document.querySelector("#library-message");
const statusFilter = document.querySelector("#status-filter");

const totalBooks = document.querySelector("#total-books");
const wantToReadCount = document.querySelector("#want-to-read-count");
const currentlyReadingCount = document.querySelector("#currently-reading-count");
const completedCount = document.querySelector("#completed-count");

const currentYear = document.querySelector("#current-year");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

// Mobile navigation
const menuToggle = document.querySelector("#menu-toggle");
const mainNav = document.querySelector("#main-nav");

menuToggle?.addEventListener("click", () => {
    const isOpen = mainNav?.classList.toggle("show") ?? false;
    menuToggle.setAttribute("aria-expanded", String(isOpen));
});

// Logout functionality
const logoutButton = document.querySelector("#logout-button");

logoutButton?.addEventListener("click", async () => {
    logoutButton.disabled = true;
    logoutButton.textContent = "Logging out...";

    try {
        await logoutUser();
        window.location.href = "index.html";
    } catch (error) {
        console.error("Logout error:", error);

        libraryMessage.textContent =
            error.message || "Unable to log out. Please try again.";

        logoutButton.disabled = false;
        logoutButton.textContent = "Logout";
    }
});

// Update library statistics
function updateStatistics(books) {
    if (totalBooks) {
        totalBooks.textContent = books.length;
    }

    if (wantToReadCount) {
        wantToReadCount.textContent = books.filter(
            (book) => book.status === "Want to Read"
        ).length;
    }

    if (currentlyReadingCount) {
        currentlyReadingCount.textContent = books.filter(
            (book) => book.status === "Currently Reading"
        ).length;
    }

    if (completedCount) {
        completedCount.textContent = books.filter(
            (book) => book.status === "Completed"
        ).length;
    }
}

// Display books from Supabase
async function displayLibrary() {
    libraryContainer.innerHTML = "<p>Loading your library...</p>";
    libraryMessage.textContent = "";

    try {
        const books = await getLibrary();

        updateStatistics(books);

        const selectedStatus = statusFilter?.value || "All";

        const filteredBooks = selectedStatus === "All"
            ? books
            : selectedStatus === "Favorites"
                ? books.filter((book) => book.isFavorite)
                : books.filter((book) => book.status === selectedStatus);

        libraryContainer.innerHTML = "";

        if (filteredBooks.length === 0) {
            libraryContainer.innerHTML = books.length === 0
                ? "<p>Your library is empty. Discover books and add them to your collection!</p>"
                : "<p>No books match this reading status.</p>";

            return;
        }

        filteredBooks.forEach((book) => {
            const card = document.createElement("article");
            card.classList.add("library-book-card");

            const cover = document.createElement("img");
            cover.src = book.cover || "https://placehold.co/150x220?text=No+Cover";
            cover.alt = `Cover of ${book.title}`;
            cover.classList.add("library-book-cover");

            const information = document.createElement("div");
            information.classList.add("library-book-information");

            const title = document.createElement("h2");
            title.textContent = book.title;

            const author = document.createElement("p");
            author.textContent = `By ${book.authors.join(", ")}`;

            const statusLabel = document.createElement("label");
            statusLabel.textContent = "Reading Status: ";

            const statusSelect = document.createElement("select");

            const statuses = [
                "Want to Read",
                "Currently Reading",
                "Completed"
            ];

            statuses.forEach((status) => {
                const option = document.createElement("option");
                option.value = status;
                option.textContent = status;
                statusSelect.appendChild(option);
            });

            statusSelect.value = book.status;

            statusSelect.addEventListener("change", async () => {
                statusSelect.disabled = true;

                try {
                    await updateBookStatus(book.id, statusSelect.value);
                    await displayLibrary();
                } catch (error) {
                    console.error("Status update error:", error);
                    libraryMessage.textContent =
                        error.message || "Unable to update reading status.";
                    await displayLibrary();
                }
            });

            statusLabel.appendChild(statusSelect);

            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove from Library";
            removeButton.classList.add("remove-book-button");

            removeButton.addEventListener("click", async () => {
                removeButton.disabled = true;
                removeButton.textContent = "Removing...";

                try {
                    await removeBook(book.id);
                    await displayLibrary();
                } catch (error) {
                    console.error("Remove book error:", error);
                    libraryMessage.textContent =
                        error.message || "Unable to remove this book.";
                    await displayLibrary();
                }
            });

            information.append(
                title,
                author,
                statusLabel,
                removeButton
            );

            card.append(cover, information);
            libraryContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Library loading error:", error);

        libraryContainer.innerHTML = "";
        libraryMessage.textContent =
            error.message || "Unable to load your library. Please try again.";
    }
}

// Filter books
statusFilter?.addEventListener("change", displayLibrary);

// Load the library when the page opens
displayLibrary();
