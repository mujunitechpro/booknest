import { getBookDetails } from "./services/google-books.mjs";

import {
    saveBook,
    toggleFavorite,
    getFavoriteStatus
} from "./services/library-storage.mjs";

const detailsContainer = document.querySelector("#book-details");
const detailsMessage = document.querySelector("#details-message");

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

// Display book information
async function displayBook(book) {
    detailsContainer.innerHTML = "";

    const cover = document.createElement("img");
    cover.classList.add("details-cover");
    cover.src = book.cover || "https://placehold.co/300x450?text=No+Cover";
    cover.alt = `Cover of ${book.title}`;

    const information = document.createElement("div");
    information.classList.add("details-information");

    const title = document.createElement("h1");
    title.textContent = book.title;

    const author = document.createElement("p");
    author.classList.add("details-author");
    author.textContent = `By ${book.authors.join(", ")}`;

    const publication = document.createElement("p");
    publication.textContent = `First published: ${book.firstPublishDate}`;

    const descriptionHeading = document.createElement("h2");
    descriptionHeading.textContent = "About This Book";

    const description = document.createElement("p");
    description.textContent = book.description;

    const subjectsHeading = document.createElement("h2");
    subjectsHeading.textContent = "Subjects";

    const subjects = document.createElement("p");
    subjects.textContent = book.subjects.length
        ? book.subjects.slice(0, 8).join(" • ")
        : "No subjects available.";

    // Save to My Library button
    const saveButton = document.createElement("button");
    saveButton.classList.add("save-book-button");
    saveButton.textContent = "Add to My Library";

    saveButton.addEventListener("click", async () => {
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        try {
            const wasSaved = await saveBook({
                id: book.id,
                title: book.title,
                authors: book.authors,
                description: book.description,
                cover: book.cover,
                firstPublishDate: book.firstPublishDate
            });

            saveButton.textContent = wasSaved
                ? "Added to My Library ✓"
                : "Already in My Library ✓";

            detailsMessage.textContent = wasSaved
                ? "Book successfully saved to your library."
                : "This book is already in your library.";

        } catch (error) {
            console.error("Save book error:", error);

            saveButton.disabled = false;
            saveButton.textContent = "Add to My Library";

            detailsMessage.textContent =
                error.message || "Unable to save this book.";
        }
    });

    // Add to Favorites button
    const favoriteButton = document.createElement("button");
    favoriteButton.classList.add("save-book-button");
    favoriteButton.textContent = "Loading Favorites...";

    try {
        const isFavorite = await getFavoriteStatus(book.id);

        favoriteButton.textContent = isFavorite
            ? "♥ Remove from Favorites"
            : "♡ Add to Favorites";

    } catch (error) {
        console.error("Favorite status error:", error);
        favoriteButton.textContent = "♡ Add to Favorites";
    }

    favoriteButton.addEventListener("click", async () => {
        favoriteButton.disabled = true;
        favoriteButton.textContent = "Updating...";

        try {
            const isFavorite = await toggleFavorite({
                id: book.id,
                title: book.title,
                authors: book.authors,
                description: book.description,
                cover: book.cover,
                firstPublishDate: book.firstPublishDate
            });

            favoriteButton.textContent = isFavorite
                ? "♥ Remove from Favorites"
                : "♡ Add to Favorites";

            detailsMessage.textContent = isFavorite
                ? "Added to your Favorites!"
                : "Removed from your Favorites.";

        } catch (error) {
            console.error("Favorite update error:", error);

            detailsMessage.textContent =
                error.message || "Unable to update Favorites.";

            favoriteButton.textContent = "♡ Add to Favorites";

        } finally {
            favoriteButton.disabled = false;
        }
    });

    information.append(
        title,
        author,
        publication,
        descriptionHeading,
        description,
        subjectsHeading,
        subjects,
        saveButton,
        favoriteButton
    );

    detailsContainer.append(cover, information);

    detailsMessage.textContent = "";
}

// Get book identifier from URL
const params = new URLSearchParams(window.location.search);
const workKey = params.get("work");

// Load book details
async function loadBookDetails() {
    if (!workKey || !/^\/works\/[^/]+$/.test(workKey)) {
        detailsMessage.textContent =
            "Invalid book link. Please return to Discover.";
        return;
    }

    try {
        const book = await getBookDetails(workKey);
        await displayBook(book);

    } catch (error) {
        console.error("Book details error:", error);

        detailsMessage.textContent =
            "Unable to load this book. Please try another book.";
    }
}

loadBookDetails();
