import { searchBooks } from "./services/google-books.mjs";

const searchForm = document.querySelector("#book-search-form");
const searchInput = document.querySelector("#book-search-input");
const searchResults = document.querySelector("#search-results");
const searchMessage = document.querySelector("#search-message");

const menuToggle = document.querySelector("#menu-toggle");
const mainNav = document.querySelector("#main-nav");

const currentYear = document.querySelector("#current-year");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

// Mobile navigation
menuToggle?.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("show");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
});

// Display search results
function displayBooks(books) {
    searchResults.innerHTML = "";

    if (books.length === 0) {
        searchMessage.textContent = "No books found. Try another search.";
        return;
    }

    searchMessage.textContent = `Found ${books.length} books.`;

    books.forEach((book) => {
        const info = book.volumeInfo;

        const title = info.title || "Untitled Book";
        const authors = info.authors
            ? info.authors.join(", ")
            : "Unknown Author";

        const description = info.description || "No description available.";

        const cover = info.imageLinks?.thumbnail?.replace(
            "http://",
            "https://"
        );

        const bookCard = document.createElement("article");
        bookCard.classList.add("book-card");

        const image = document.createElement("img");
        image.src = cover || "https://placehold.co/160x230?text=No+Cover";
        image.alt = `Cover of ${title}`;
        image.loading = "lazy";

        const details = document.createElement("div");
        details.classList.add("book-card-details");

        const bookTitle = document.createElement("h3");
        bookTitle.textContent = title;

        const bookAuthor = document.createElement("p");
        bookAuthor.textContent = authors;

        const bookDescription = document.createElement("p");
        bookDescription.textContent =
            description.replace(/<[^>]*>/g, "").slice(0, 120);

        const detailsLink = document.createElement("a");
        detailsLink.href = `details.html?work=${encodeURIComponent(book.id)}`;
        detailsLink.classList.add("book-details-link");
        detailsLink.textContent = "View Details";

        details.append(
            bookTitle,
            bookAuthor,
            bookDescription,
            detailsLink
        );

        bookCard.append(image, details);
        searchResults.appendChild(bookCard);
    });
}

// Search books
searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const searchTerm = searchInput.value.trim();

    if (!searchTerm) return;

    searchMessage.textContent = "Searching for books...";
    searchResults.innerHTML = "";

    try {
        const books = await searchBooks(searchTerm);
        displayBooks(books);
    } catch (error) {
        console.error("Search failed:", error);
        searchMessage.textContent =
            `Search failed: ${error.message}`;
    }
});

// Handle searches coming from the homepage
const params = new URLSearchParams(window.location.search);
const initialQuery = params.get("q");

if (initialQuery) {
    searchInput.value = initialQuery;
    searchForm.requestSubmit();
}
