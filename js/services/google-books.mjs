const OPEN_LIBRARY_API_URL = "https://openlibrary.org";

export async function searchBooks(searchTerm) {
    if (!searchTerm || !searchTerm.trim()) {
        return [];
    }

    const url = `${OPEN_LIBRARY_API_URL}/search.json?q=${encodeURIComponent(searchTerm)}&limit=20`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Open Library error: ${response.status}`);
        }

        const data = await response.json();

        return (data.docs || []).map((book) => ({
            id: book.key,
            volumeInfo: {
                title: book.title || "Untitled Book",
                authors: book.author_name || ["Unknown Author"],
                description: Array.isArray(book.first_sentence)
                    ? book.first_sentence.join(" ")
                    : book.first_sentence || "No description available.",
                imageLinks: book.cover_i
                    ? {
                        thumbnail: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                    }
                    : undefined
            }
        }));
    } catch (error) {
        console.error("Open Library search error:", error);
        throw error;
    }
}

/**
 * Retrieve detailed information about one book.
 * @param {string} workKey - Open Library work key.
 */
export async function getBookDetails(workKey) {
    if (!workKey) {
        throw new Error("A book identifier is required.");
    }

    const response = await fetch(
        `${OPEN_LIBRARY_API_URL}${workKey}.json`
    );

    if (!response.ok) {
        throw new Error(`Unable to retrieve book details: ${response.status}`);
    }

    const book = await response.json();

    let authorNames = [];

    if (book.authors?.length) {
        const authorRequests = book.authors.slice(0, 3).map(async (item) => {
            const authorKey = item.author?.key;

            if (!authorKey) return null;

            const authorResponse = await fetch(
                `${OPEN_LIBRARY_API_URL}${authorKey}.json`
            );

            if (!authorResponse.ok) return null;

            const author = await authorResponse.json();
            return author.name || null;
        });

        authorNames = (await Promise.all(authorRequests)).filter(Boolean);
    }

    const description =
        typeof book.description === "string"
            ? book.description
            : book.description?.value || "No description available.";

    return {
        id: workKey,
        title: book.title || "Untitled Book",
        authors: authorNames.length ? authorNames : ["Author information unavailable"],
        description,
        firstPublishDate: book.first_publish_date || "Not available",
        subjects: book.subjects || [],
        cover: book.covers?.length
            ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`
            : null
    };
}
