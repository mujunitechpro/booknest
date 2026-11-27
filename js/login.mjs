import { loginUser } from "./services/auth.mjs";

const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const message = document.querySelector("#login-message");
const loginButton = document.querySelector("#login-button");

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

// Handle login
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    message.textContent = "";

    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    try {
        await loginUser(email, password);

        message.textContent = "Login successful! Welcome to BookNest.";

        setTimeout(() => {
            window.location.href = "library.html";
        }, 1000);

    } catch (error) {
        console.error("Login error:", error);

        message.textContent =
            error.message || "Login failed. Please check your details.";

    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Log In";
    }
});
