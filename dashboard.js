// ✅ Base API URL (adjust based on deployment)
const API_BASE_URL = "https://backend-q2xl.onrender.com/api"; // Ensure backend URL is correctly defined

// ✅ Ensure the DOM is fully loaded before running scripts
document.addEventListener("DOMContentLoaded", function () {
    setupLogout();
    fetchYears();
    setupSidebar();
    setupQuizStart();
});

document.addEventListener("DOMContentLoaded", () => {
    const userName = localStorage.getItem("user_name") || "User";
    document.getElementById("user-name").textContent = userName;
});


// ✅ Logout Functionality
function setupLogout() {
    const logoutBtn = document.getElementById("logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            sessionStorage.removeItem("userToken");
            window.location.href = "index.html";
        });
    }
}

// ✅ Fetch Available Years for Dropdown
async function fetchYears() {
    try {
        const response = await fetch(`${API_BASE_URL}/questions/years`);
        if (!response.ok) throw new Error("Failed to fetch years");

        const years = await response.json();
        populateDropdown("year-dropdown", years, "Select Year");

        // Attach event listener for slot fetching only if the dropdown exists
        const yearDropdown = document.getElementById("year-dropdown");
        if (yearDropdown) {
            yearDropdown.addEventListener("change", fetchSlots);
        }
    } catch (error) {
        console.error("Error fetching years:", error);
    }
}

// ✅ Fetch Available Slots Based on Selected Year
async function fetchSlots() {
    const selectedYear = document.getElementById("year-dropdown").value;
    if (!selectedYear) return;

    try {
        const response = await fetch(`${API_BASE_URL}/questions/slots?year=${selectedYear}`);
        if (!response.ok) throw new Error("Failed to fetch slots");

        const slots = await response.json();
        populateDropdown("slot-dropdown", slots, "Select Slot");
    } catch (error) {
        console.error("Error fetching slots:", error);
    }
}

// ✅ Populate Dropdown Helper Function
function populateDropdown(dropdownId, data, defaultText) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return; // Ensure the dropdown exists

    dropdown.innerHTML = `<option value="" disabled selected>${defaultText}</option>`;

    data.forEach(item => {
        dropdown.innerHTML += `<option value="${item}">${item}</option>`;
    });
}

// ✅ Setup Quiz Start Event
function setupQuizStart() {
    const startQuizBtn = document.getElementById("start-quiz-btn");
    if (startQuizBtn) {
        startQuizBtn.addEventListener("click", function () {
            const selectedYear = document.getElementById("year-dropdown").value;
            const selectedSlot = document.getElementById("slot-dropdown").value;

            if (!selectedYear || !selectedSlot) {
                alert("Please select a year and slot before starting the quiz.");
                return;
            }

            window.location.href = `exam.html?year=${selectedYear}&slot=${selectedSlot}`;
        });
    }
}

// ✅ Sidebar Toggle Setup
function setupSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const menuToggle = document.getElementById("menu-toggle");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", function () {
            sidebar.classList.toggle("open");
        });
    }
}
