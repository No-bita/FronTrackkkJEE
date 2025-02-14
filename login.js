const API_BASE_URL = "https://backend-q2xl.onrender.com/api"; // Adjust this based on your backend

// ✅ Handle User Login
async function handleLogin(event) {
    event.preventDefault(); // Prevent form reload

    // Get input values
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // ✅ Validate inputs before sending request
    if (!validateLoginInputs(email, password)) {
        return;
    }

    try {
        // Send login request to backend
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // ✅ Extract user_id and user_name from response
            const { _id: user_id, name: user_name } = data.user; 

            // ✅ Store JWT token, user_id, and user_name in localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user_name", user_name);
            localStorage.setItem("userInfo", JSON.stringify(data.user)); // Keep full user info if needed

            alert(`✅ Welcome, ${user_name}! Redirecting to dashboard...`);
            window.location.href = "dashboard.html"; // Redirect user to dashboard
        } else {
            showError("login-error", data.error || "Invalid email or password.");
        }
    } catch (error) {
        console.error("❌ Login error:", error);
        showError("login-error", "An error occurred. Please try again later.");
    }
}


// ✅ Validate Login Inputs
function validateLoginInputs(email, password) {
    let isValid = true;

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

// ✅ Check if User is Already Logged In
function checkIfLoggedIn() {
    const token = localStorage.getItem("token");
    if (token) {
        console.log("🔹 User already logged in. Redirecting to dashboard...");
        window.location.href = "dashboard.html";
    }
}

// ✅ Attach Event Listener on Page Load
document.addEventListener("DOMContentLoaded", () => {
    checkIfLoggedIn();
    const loginForm = document.querySelector("form");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
});
