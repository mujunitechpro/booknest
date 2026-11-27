import { supabase } from "./supabase.mjs";

// Register a new user
export async function registerUser(fullName, email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName
            }
        }
    });

    if (error) {
        throw error;
    }

    return data;
}

// Log in an existing user
export async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw error;
    }

    return data;
}

// Log out the current user
export async function logoutUser() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
}

// Get the currently logged-in user
export async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    return data.user;
}

// Listen for authentication changes
export function listenToAuthChanges(callback) {
    return supabase.auth.onAuthStateChange(callback);
}
