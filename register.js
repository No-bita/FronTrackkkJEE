const API_BASE_URL = "http://localhost:5001/api"; // Adjust this to match your backend

// ✅ Handle User Registration
async function handleRegister(event) {
    event.preventDefault(); // Prevent form from reloading

    // Get input values
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // ✅ Validate inputs before sending request
    if (!validateRegisterInputs(name, email, password)) {
        return;
    }

    try {
        // Send registration request to backend
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ Registration successful! Redirecting to login...");
            window.location.href = "dashboard.html"; // Redirect user to login page
        } else {
            showError("register-error", data.error || "Registration failed. Try again.");
        }
    } catch (error) {
        console.error("❌ Registration error:", error);
        showError("register-error", "An error occurred. Please try again later.");
    }
}

// ✅ Validate User Inputs
function validateRegisterInputs(name, email, password) {
    let isValid = true;

    if (name.length < 3) {
        showError("name-error", "Name must be at least 3 characters long.");
        isValid = false;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        showError("email-error", "Please enter a valid email address.");
        isValid = false;
    }

    if (password.length < 6) {
        showError("password-error", "Password must be at least 6 characters long.");
        isValid = false;
    }

    return isValid;
}

// ✅ Display Error Messages
function showError(elementId, message) {
    let errorElement = document.getElementById(elementId);
    if (!errorElement) {
        // If error element doesn't exist, create one dynamically
        errorElement = document.createElement("p");
        errorElement.id = elementId;
        errorElement.style.color = "red";
        document.querySelector("form").appendChild(errorElement);
    }
    errorElement.innerText = message;
}

// ✅ Attach Event Listener to Form on Page Load
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.querySelector("form");
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }
});
