import { supabase } from "./supabase.mjs";

// Get the currently logged-in user
async function getAuthenticatedUser() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    if (!user) {
        throw new Error("Please log in to access your library.");
    }

    return user;
}

// Get all books belonging to the logged-in user
export async function getLibrary() {
    const user = await getAuthenticatedUser();

    const { data, error } = await supabase
        .from("library_books")
        .select("*")
        .eq("user_id", user.id)
        .order("date_added", { ascending: false });

    if (error) {
        throw error;
    }

    return (data || []).map((book) => ({
        id: book.book_id,
        title: book.title,
        authors: Array.isArray(book.authors) ? book.authors : [],
        description: book.description || "No description available.",
        cover: book.cover || null,
        firstPublishDate: book.first_publish_date || "Not available",
        status: book.status,
        dateAdded: book.date_added,
        isFavorite: book.is_favorite
    }));
}

// Save a book to Supabase
export async function saveBook(book) {
    const user = await getAuthenticatedUser();

    const record = {
        user_id: user.id,
        book_id: book.id,
        title: book.title,
        authors: book.authors || [],
        description: book.description || "",
        cover: book.cover || null,
        first_publish_date: book.firstPublishDate || null,
        status: "Want to Read",
        is_favorite: false
    };

    const { error } = await supabase
        .from("library_books")
        .insert(record);

    if (error?.code === "23505") {
        return false;
    }

    if (error) {
        throw error;
    }

    return true;
}

// Add or remove a book from Favorites
export async function toggleFavorite(book) {
    const user = await getAuthenticatedUser();

    // Check whether this book is already in the user's library
    const { data: existingBook, error: fetchError } = await supabase
        .from("library_books")
        .select("is_favorite")
        .eq("user_id", user.id)
        .eq("book_id", book.id)
        .maybeSingle();

    if (fetchError) {
        throw fetchError;
    }

    // If the book already exists, reverse its favorite status
    if (existingBook) {
        const newFavoriteStatus = !existingBook.is_favorite;

        const { error } = await supabase
            .from("library_books")
            .update({ is_favorite: newFavoriteStatus })
            .eq("user_id", user.id)
            .eq("book_id", book.id);

        if (error) {
            throw error;
        }

        return newFavoriteStatus;
    }

    // If it does not exist, save it directly as a favorite
    const { error } = await supabase
        .from("library_books")
        .insert({
            user_id: user.id,
            book_id: book.id,
            title: book.title,
            authors: book.authors || [],
            description: book.description || "",
            cover: book.cover || null,
            first_publish_date: book.firstPublishDate || null,
            status: "Want to Read",
            is_favorite: true
        });

    if (error) {
        throw error;
    }

    return true;
}

// Update a book's reading status
export async function updateBookStatus(bookId, status) {
    const user = await getAuthenticatedUser();

    const { error } = await supabase
        .from("library_books")
        .update({ status })
        .eq("user_id", user.id)
        .eq("book_id", bookId);

    if (error) {
        throw error;
    }
}

// Remove a book from the library
export async function removeBook(bookId) {
    const user = await getAuthenticatedUser();

    const { error } = await supabase
        .from("library_books")
        .delete()
        .eq("user_id", user.id)
        .eq("book_id", bookId);

    if (error) {
        throw error;
    }
}


// Check whether a book is already a favorite
export async function getFavoriteStatus(bookId) {
    const user = await getAuthenticatedUser();

    const { data, error } = await supabase
        .from("library_books")
        .select("is_favorite")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data?.is_favorite || false;
}
