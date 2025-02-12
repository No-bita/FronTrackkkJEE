const API_BASE_URL = "https://backend-q2xl.onrender.com/api"; // Adjust for production
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let timerInterval;

// Step 1: Extract year and slot from URL
const urlParams = new URLSearchParams(window.location.search);
const year = urlParams.get("year");
const slot = urlParams.get("slot");

if (!year || !slot) {
    alert("Invalid Year or Slot. Please go back and try again.");
    window.location.href = "home.html"; // Redirect to homepage if missing parameters
}

// Fetch Questions from Backend
document.addEventListener("DOMContentLoaded", async () => {
    await fetchQuestions();
    setupEventListeners();
});

// ✅ Fetch Questions from the Backend
async function fetchQuestions() {
    try {
        const slotFormatted = slot.replace(/\s+/g, "_"); // ✅ Convert spaces to underscores
        const response = await fetch(`${API_BASE_URL}/questions?year=${year}&slot=${slotFormatted}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        questions = await response.json();

        if (!Array.isArray(questions) || questions.length === 0) {
            document.getElementById("question").textContent = "No questions available.";
            return;
        }

        console.log("✅ Questions received:", questions);
        generateQuestionButtons();
        updateQuestion();
    } catch (error) {
        console.error("❌ Error fetching questions:", error);
    }
}

// ✅ Generate Question Navigation Buttons
function generateQuestionButtons() {
    console.log("✅ Generating Question Buttons...");

    const container = document.getElementById("question-buttons");
    if (!container) {
        console.error("❌ Error: question-buttons container not found!");
        return;
    }

    container.innerHTML = ""; // Clear previous buttons

    questions.forEach((_, index) => {
        const button = document.createElement("button");
        button.className = "nav-btn";
        button.textContent = index + 1;
        button.onclick = () => goToQuestion(index);
        container.appendChild(button);
    });

    container.style.overflowX = "auto"; // Enable horizontal scrolling
    container.style.whiteSpace = "nowrap"; // Prevent line breaks
}

// ✅ Update Question Display
function updateQuestion() {
    if (!questions.length) return;

    const question = questions[currentQuestionIndex];
    document.getElementById("question").innerHTML = `Q${currentQuestionIndex + 1}: ` + question.question_text;

    // ✅ Show question image if available
    const questionImage = document.getElementById("question-image");
    if (question?.image) {
        questionImage.src = question.image;
        questionImage.style.display = "inline-block";
    } else {
        questionImage.style.display = "none";
    }

    // ✅ Display answer options
    const optionsContainer = document.querySelector(".options");
    if (!optionsContainer) return;
    optionsContainer.innerHTML = "";

    if (question.options) {
        Object.entries(question.options).forEach(([key, value]) => {
            const optionElement = document.createElement("label");
            optionElement.innerHTML = `
                <input type="radio" name="question${currentQuestionIndex}" value="${key}" 
                    ${userAnswers[currentQuestionIndex] === key ? "checked" : ""}> ${value}
            `;
            optionsContainer.appendChild(optionElement);
        });
    }
}

// ✅ Handle Answer Selection
document.addEventListener("change", (event) => {
    if (event.target.type === "radio" && event.target.name.startsWith("question")) {
        userAnswers[currentQuestionIndex] = event.target.value;
    }
});

// ✅ Navigation Functions
function goToQuestion(index) {
    if (index >= 0 && index < questions.length) {
        currentQuestionIndex = index;
        updateQuestion();
    }
}

// ✅ Setup Event Listeners for Buttons
function setupEventListeners() {
    console.log("✅ Event Listeners Set Up");

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "login.html";
        });
    }

    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const submitBtn = document.getElementById("submit-btn");

    if (prevBtn && nextBtn && submitBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                updateQuestion();
            }
        });

        nextBtn.addEventListener("click", () => {
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                updateQuestion();
            }
        });

        submitBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to submit the test?")) {
                submitTest();
            }
        });
    }
}

// ✅ Submit Test Function
function submitTest() {
    clearInterval(timerInterval); // Stop the timer
    fetch(`${API_BASE_URL}/exam/submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ answers: userAnswers })
    })
    .then(response => response.json())
    .then(data => {
        alert(`✅ Test Submitted! Your Score: ${data.score}`);
        window.location.href = "home.html"; // Redirect to home page
    })
    .catch(error => console.error("❌ Error submitting test:", error));
}

// ✅ Timer Functionality
let timeLeft = localStorage.getItem("timeLeft") ? parseInt(localStorage.getItem("timeLeft")) : 10800; // Default to 3 hours (10800 seconds)
const timerElement = document.getElementById("timer");

function startTimer() {
    function updateTimer() {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;

        timerElement.textContent = `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("⏳ Time is up! Submitting the test.");
            submitTest();
        } else {
            timeLeft--;
            localStorage.setItem("timeLeft", timeLeft);
        }
    }

    timerInterval = setInterval(updateTimer, 1000);
    setInterval(() => localStorage.setItem("timeLeft", timeLeft), 60000); // Save every minute
}

// ✅ Start Countdown Before Test
function startCountdown() {
    let countdownTime = 5;
    const countdownElement = document.createElement("div");
    countdownElement.textContent = `Test starts in ${countdownTime} seconds...`;
    document.body.appendChild(countdownElement);

    const countdownInterval = setInterval(() => {
        countdownTime--;
        countdownElement.textContent = `Test starts in ${countdownTime} seconds...`;

        if (countdownTime === 0) {
            clearInterval(countdownInterval);
            countdownElement.style.display = "none";
            startTimer();
        }
    }, 1000);
}

startCountdown(); // ✅ Start the timer countdown
