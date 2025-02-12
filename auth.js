const API_BASE_URL = "https://backend-q2xl.onrender.com/api";

// Setup event listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    setupSignupLink();
    setupLogout();
    checkAuth();

    if (document.getElementById("year-dropdown")) {
        fetchYears();
    }
});

// Setup Sign-up Link
function setupSignupLink() {
    const signupLink = document.getElementById("signup-link");
    if (signupLink) {
        signupLink.addEventListener("click", () => {
            console.log("Sign-up link clicked"); // Debug log
            window.location.href = "signup.html"; // Redirect to signup page
        });
    }
}

function setupLoginLink() {
    const loginLink = document.getElementById("login-link");
    if (loginLink) {
        loginLink.addEventListener("click", () => {
            const token = localStorage.getItem("token");
            if (token) {
                console.log("User already logged in, redirecting to dashboard.");
                window.location.href = "dashboard.html"; // ✅ Redirect only if logged in
            } else {
                console.log("No active session, redirecting to login.");
                window.location.href = "signup.html"; // ✅ Redirect to signup/login page
            }
        });
    }
}

// Setup Logout Button
function setupLogout() {
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            sessionStorage.clear();  // Clears sessionStorage (temporary data)
            localStorage.clear();    // Clears localStorage (persistent data)
            document.cookie.split(";").forEach((cookie) => {
                document.cookie = cookie
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname);
            });

            console.log("User logged out, session cleared."); // Debugging log
            
            // ✅ Redirect to index.html (Login page)
            window.location.href = "index.html";
        });
    }
}


function checkAuth() {
    const token = localStorage.getItem("token");
    const protectedPages = ['dashboard.html', 'exam.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (!token) {
        if (protectedPages.includes(currentPage)) {
            console.log("User not logged in. Redirecting to index.html...");
            window.location.href = "index.html"; // Redirect to login if unauthorized
        }
    } else {
        fetchUserDetails(); // Fetch user info if authenticated
    }
}


async function fetchUserDetails() {
    try {
        const response = await fetch(`${API_BASE_URL}/user`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) {
            localStorage.clear(); // Clear invalid session
            sessionStorage.clear();
            window.location.href = "index.html"; // Redirect to login
            return;
        }

        const data = await response.json();

        if (data.success) {
            const userInfo = document.getElementById("user-info");
            if (userInfo) {
                userInfo.innerHTML = `Welcome, ${data.user.name} <img src="${data.user.picture}" width="40">`;
            }
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "index.html"; // Ensure redirect on failure
    }
}


async function fetchYears() {
    try {
        const response = await fetch(`${API_BASE_URL}/questions/years`);
        if (!response.ok) throw new Error("Failed to fetch years");

        const years = await response.json();
        const yearDropdown = document.getElementById("year-dropdown");
        if (!yearDropdown) return; // Ensure the dropdown exists

        yearDropdown.innerHTML = '<option value="" disabled selected>Select Year</option>';
        years.forEach(year => {
            yearDropdown.innerHTML += `<option value="${year}">${year}</option>`;
        });
        yearDropdown.addEventListener("change", fetchSlots);
    } catch (error) {
        console.error("Error fetching years:", error);
        const yearDropdown = document.getElementById("year-dropdown");
        if (yearDropdown) {
            yearDropdown.innerHTML = '<option value="" disabled>No years available</option>';
        }
    }
}


// ✅ Fetch Available Slots Based on Selected Year
async function fetchSlots() {
    const selectedYear = document.getElementById("year-dropdown").value;
    if (!selectedYear) return;

    try {
        const response = await fetch(`${API_BASE_URL}/questions/slots?year=${selectedYear}`);
        const slots = await response.json();

        const slotDropdown = document.getElementById("slot-dropdown");
        if (!slotDropdown) {
            console.error("Slot dropdown not found in the document");
            return;
        }
        slotDropdown.innerHTML = '<option value="" disabled selected>Select Slot</option>';

        slots.forEach(slot => {
            slotDropdown.innerHTML += `<option value="${slot}">${slot}</option>`;
        });
    } catch (error) {
        console.error("Error fetching slots:", error);
    }
}

// ✅ Fetch Years on Page Load
//document.addEventListener("DOMContentLoaded", fetchYears);

// Handle Email/Password Registration
async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validate inputs
    if (!validateSignupInputs(name, email, password)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                name, 
                email, 
                password 
            })
        });

        const data = await response.json();
        
        if (response.ok) { // Successful registration
            localStorage.setItem('token', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            // Show specific error message from server if available
            showError('email-error', data.message || 'Registration failed.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('email-error', 'An error occurred. Please try again later.');
    }
}

// Input Validation
function validateSignupInputs(name, email, password) {
    let isValid = true;
    
    if (name.length < 3) {
        showError('name-error', 'Name must be at least 3 characters long');
        isValid = false;
    }
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        showError('email-error', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (password.length < 6) {
        showError('password-error', 'Password must be at least 6 characters long');
        isValid = false;
    }
    
    return isValid;
}