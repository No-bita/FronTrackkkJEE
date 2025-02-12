const API_BASE_URL = "https://backend-q2xl.onrender.com/api/auth";

// Setup event listeners when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    setupSignupLink();
    setupLogoutButton();
    checkAuthStatus();

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

// Setup Logout Button
function setupLogout() {
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            sessionStorage.clear();  // Clears sessionStorage (temporary data)
            localStorage.clear();    // Clears localStorage (persistent data)
            document.cookie = "userToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // Deletes cookies
            
            window.location.href = "index.html"; // Redirects to home page
        });
    }
}


async function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    window.location.href = "index.html";
}

// Check Authentication Status
function checkAuthStatus() {
    const token = localStorage.getItem("token");
    if (token) {
        fetchUserDetails();
    }
}

// ✅ Fetch User Details from Backend
async function fetchUserDetails() {
    try {
        const response = await fetch(`${API_BASE_URL}/user`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        const data = await response.json();

        if (data.success) {
            const userInfo = document.getElementById("user-info");
            if (userInfo) {
                userInfo.innerHTML = `Welcome, ${data.user.name} <img src="${data.user.picture}" width="40">`;
            }
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
    }
}

// ✅ Prevent unauthorized access to protected pages
function checkAuth() {
    const protectedPages = ['main.html', 'exam.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !localStorage.getItem("token")) {
        window.location.href = "index.html";
    }
}
checkAuth();

// ✅ Fetch Available Years
async function fetchYears() {
    try {
        const response = await fetch(`${API_BASE_URL}/questions/years`);
        if (!response.ok) throw new Error("Failed to fetch years");

        const years = await response.json();
        const yearDropdown = document.getElementById("year-dropdown");
        if (yearDropdown) {
            yearDropdown.innerHTML = '<option value="" disabled selected>Select Year</option>';
            years.forEach(year => {
                yearDropdown.innerHTML += `<option value="${year}">${year}</option>`;
            });
            yearDropdown.addEventListener("change", fetchSlots);
        }    
    } catch (error) {
        console.error("Error fetching years:", error);
        document.getElementById("year-dropdown").innerHTML = '<option value="" disabled>No years available</option>';
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
    
    // Debug log - Form Data
    console.log('Form Data:', { name, email, password: '****' });
    
    // Validate inputs
    if (!validateSignupInputs(name, email, password)) {
        return;
    }
    
    try {
        console.log('Attempting to register user...'); // Debug log
        
        // Log the API endpoint being called
        console.log('API Endpoint:', `${API_BASE_URL}/register`);
        
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
        
        console.log('Response status:', response.status); // Debug log
        
        // Log the full response
        const data = await response.json();
        console.log('Response data:', data); // Debug log
        
        if (response.ok && data.success) {  // Check both response.ok and data.success
            localStorage.setItem('token', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data.user));
            window.location.href = 'main.html';
        } else {
            // Show specific error message from server if available
            const errorMessage = data.message || 'Registration failed. Please try again.';
            showError('email-error', errorMessage);
            console.error('Registration failed:', errorMessage);
        }
    } catch (error) {
        console.error('Registration error:', error);
        // Show more specific error message
        if (error.message.includes('Failed to fetch')) {
            showError('email-error', 'Unable to connect to server. Please check your internet connection.');
        } else {
            showError('email-error', 'Registration failed. Please try again later.');
        }
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