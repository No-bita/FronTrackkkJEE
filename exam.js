const API_BASE_URL = "https://backend-q2xl.onrender.com/api";
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
    window.location.href = "dashboard.html"; // Redirect to homepage if missing parameters
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

        if (!response.ok) {
            throw new Error(`Error fetching questions: ${response.statusText}`);
        }

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
        document.getElementById("question").innerHTML = `<p style="color:red;">Failed to load questions. <button onclick="fetchQuestions()">Retry</button></p>`;
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
        button.setAttribute("data-index", index);
        button.onclick = () => {
            goToQuestion(index);
            button.classList.remove("unread");
            button.classList.add("read"); // Mark as visited
        };
        container.appendChild(button);
    });

    container.style.overflowX = "auto"; // Enable horizontal scrolling
    container.style.whiteSpace = "nowrap"; // Prevent line breaks
}

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

// ✅ Collect Answers from User Inputs
function collectAnswers() {
    const answers = {};

    document.querySelectorAll(".options").forEach((optionContainer, index) => {
        const questionId = questions[index]._id; // Get question ID from backend
        const selectedOption = optionContainer.querySelector("input[type='radio']:checked");
        const enteredInteger = optionContainer.querySelector("input[type='number']");

        if (selectedOption) {
            answers[questionId] = parseInt(selectedOption.value);
        } else if (enteredInteger && enteredInteger.value !== "") {
            answers[questionId] = parseInt(enteredInteger.value);
        } else {
            answers[questionId] = null; // No response
        }
    });

    return answers;
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

// ✅ Countdown Timer Function
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

document.addEventListener("DOMContentLoaded", () => {
    startTimer();

    window.addEventListener("beforeunload", () => {
        if (timeLeft > 0) {
            localStorage.setItem("timeLeft", timeLeft);
        }
    });
});

// ✅ Handle Answer Selection for Both MCQs & Integer Questions
document.addEventListener("change", handleAnswerSelection);
document.addEventListener("input", handleAnswerSelection);

function handleAnswerSelection(event) {
    if (event.target.type === "radio" || event.target.type === "number") {
        userAnswers[currentQuestionIndex] = event.target.value;

        // ✅ Change button color to Green for answered questions
        const btn = document.querySelector(`button[data-index="${currentQuestionIndex}"]`);
        if (btn) {
            btn.classList.remove("unread", "read");
            btn.classList.add("answered");
        }
    }
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

    // ✅ Display Answer Options
    const optionsContainer = document.querySelector(".options");
    optionsContainer.innerHTML = "";

    if (question.type === "MCQ") {
        Object.entries(question.options).forEach(([key, value]) => {
            const optionElement = document.createElement("label");
            optionElement.innerHTML = `
                <input type="radio" name="question${currentQuestionIndex}" value="${key}" 
                    ${userAnswers[currentQuestionIndex] === key ? "checked" : ""}> ${value}
            `;
            optionsContainer.appendChild(optionElement);
        });
    } else {
        optionsContainer.innerHTML = `
            <label>Enter your answer:</label>
            <input type="number" name="question${currentQuestionIndex}" min="0" max="99999">
        `;
    }
}

// ✅ Submit Test Function
function submitTest() {
    const answers = collectAnswers();

    const answeredCount = Object.values(answers).filter(ans => ans !== null).length;
    if (answeredCount === 0) {
        alert("⚠ You haven't answered any questions. Please attempt at least one question before submitting.");
        return;
    }

    clearInterval(timerInterval); // Stop the timer
    fetch(`${API_BASE_URL}/exam/submit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ answers: collectAnswers() })
    })
    .then(response => response.json())
    .then(data => {
        alert(`✅ Test Submitted! Your Score: ${data.score}`);
        window.location.href = "results.html"; // Redirect to home page
    })
    .catch(error => console.error("❌ Error submitting test:", error));
}

// ✅ Event Listeners for Navigation
document.addEventListener("DOMContentLoaded", () => {
    startTimer();

    document.getElementById("submit-btn").addEventListener("click", () => {
        submitTest();
    });

    window.addEventListener("beforeunload", () => {
        localStorage.setItem("timeLeft", timeLeft);
    });
});



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

// ✅ Apply Button Colors via CSS
const style = document.createElement("style");
style.innerHTML = `
    .nav-btn {
        padding: 10px;
        margin: 5px;
        border: none;
        cursor: pointer;
        font-size: 14px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
    }

    .unread { background-color: #d3d3d3; color: black; } /* Light Grey for unread */
    .read { background-color: #808080; color: white; } /* Dark Grey for visited */
    .answered { background-color: #28a745; color: white; } /* Green for answered */
`;

document.head.appendChild(style);