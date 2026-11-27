import { registerUser } from "./services/auth.mjs";

// Page elements
const registerForm = document.querySelector("#register-form");
const fullNameInput = document.querySelector("#full-name");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirm-password");
const message = document.querySelector("#register-message");
const registerButton = document.querySelector("#register-button");

// Current year
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

// Handle registration
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    message.textContent = "";

    // Check password confirmation
    if (password !== confirmPassword) {
        message.textContent = "Your passwords do not match.";
        confirmPasswordInput.focus();
        return;
    }

    // Prevent repeated submissions
    registerButton.disabled = true;
    registerButton.textContent = "Creating Account...";

    try {
        const data = await registerUser(fullName, email, password);

        if (data.session) {
            message.textContent =
                "Your account has been created successfully! You can now log in.";
        } else {
            message.textContent =
                "Registration successful! Please check your email and confirm your account before logging in.";
        }

        registerForm.reset();

    } catch (error) {
        console.error("Registration error:", error);

        message.textContent =
            error.message || "Registration failed. Please try again.";

    } finally {
        registerButton.disabled = false;
        registerButton.textContent = "Create Account";
    }
});
