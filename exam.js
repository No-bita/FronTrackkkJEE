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

let timer; // Timer variable

// ✅ Function to collect answers
function collectAnswers() {
    const answers = {};
    const timeTaken = {};

    document.querySelectorAll(".question").forEach((question) => {
        const questionId = question.getAttribute("data-id");
        const selectedOption = question.querySelector("input[type='radio']:checked");

        answers[questionId] = selectedOption ? parseInt(selectedOption.value) : null;
        timeTaken[questionId] = parseInt(question.getAttribute("data-time")) || 0;
    });

    return { answers, timeTaken };
}

// ✅ Function to handle test submission
async function handleExamSubmit() {
    clearInterval(timer); // Stop timer to prevent duplicate submission

    const { answers, timeTaken } = collectAnswers();
    const examId = document.getElementById("exam").getAttribute("data-exam-id");

    if (!examId) {
        alert("Error: Exam ID missing!");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/responses/submit`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}` // Add authentication
            },
            body: JSON.stringify({ examId, answers, timeTaken }),
        });

        const data = await response.json();

        if (response.ok) {
            // ✅ Store results in local storage
            localStorage.setItem("examResults", JSON.stringify(data));

            // ✅ Redirect to results page
            window.location.href = "results.html";
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error("❌ Exam Submission Error:", error);
        alert("Something went wrong. Please try again.");
    }
}

// ✅ Countdown Timer Function
function startTimer(duration) {
    let timeRemaining = duration;

    timer = setInterval(() => {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        document.getElementById("timer").innerText = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

        if (timeRemaining <= 0) {
            clearInterval(timer);
            alert("Time is up! Your test is being submitted.");
            handleExamSubmit(); // Auto-submit when time is up
        }

        timeRemaining--;
    }, 1000);
}

// ✅ Attach Event Listeners on Page Load
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("submit-exam").addEventListener("click", handleExamSubmit);

    // ✅ Start Timer (Assuming test duration is set in dataset)
    const duration = parseInt(document.getElementById("exam").getAttribute("data-duration")) || 1800; // Default: 30 min
    startTimer(duration);
});


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
            window.location.href = "dashboard.html";
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

// ✅ Timer Functionality with Auto-Save & Page Refresh Handling
let timeLeft = localStorage.getItem("timeLeft") ? parseInt(localStorage.getItem("timeLeft")) : 10800; // Default: 3 hours (10800 seconds)
const timerElement = document.getElementById("timer");

function updateTimerDisplay() {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    timerElement.textContent = `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// ✅ Start the Timer
function startTimer() {
    if (timeLeft <= 0) {
        submitTest(); // ⏳ Auto-submit if time is already 0
        return;
    }

    updateTimerDisplay(); // Show initial time

    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
            localStorage.setItem("timeLeft", timeLeft);
        } else {
            clearInterval(timerInterval);
            alert("⏳ Time is up! Submitting the test.");
            submitTest();
        }
    }, 1000);
}

// ✅ Event: Reset Timer on Test Start
document.addEventListener("DOMContentLoaded", () => {
    startTimer();

    document.getElementById("submit-btn").addEventListener("click", () => {
        submitTest();
    });

    window.addEventListener("beforeunload", () => {
        localStorage.setItem("timeLeft", timeLeft); // 🔄 Save remaining time if page is refreshed
    });
});


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
