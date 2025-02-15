const API_BASE_URL = "https://backend-q2xl.onrender.com/api";
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {};    
let timerInterval;

// Step 1: Extract year and slot from URL
const urlParams = new URLSearchParams(window.location.search);
const exam_year = urlParams.get("year");
const exam_slot = urlParams.get("slot");

if (!year || !slot) {
    alert("Invalid Year or Slot. Please go back and try again.");
    window.location.href = "dashboard.html"; // Redirect to homepage if missing parameters
}

// Fetch Questions from Backend
document.addEventListener("DOMContentLoaded", async () => {
    await fetchQuestions();
    setupEventListeners();

    const savedAnswers = JSON.parse(localStorage.getItem("userAnswers")) || {};
    userAnswers = savedAnswers;
    updateQuestion();
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
        document.getElementById("retry-btn").style.display = "block";
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

    if (container.childElementCount >= questions.length) return;

    questions.forEach((_, index) => {
        const button = document.createElement("button");
        button.className = "nav-btn unread";
        button.textContent = index + 1;
        button.setAttribute("data-index", index);
        button.onclick = () => {
            goToQuestion(index);
            button.classList.remove("unread");
            if (!button.classList.contains("answered")) {
                button.classList.add("read");
            }
        };
        container.appendChild(button);
    });
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

    document.getElementById("logout-btn")?.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "dashboard.html";
    });

    document.getElementById("prev-btn")?.addEventListener("click", () => {
        if (currentQuestionIndex > 0) { 
            goToQuestion(currentQuestionIndex - 1);
        }
    });

    document.getElementById("next-btn")?.addEventListener("click", () => {
        if (currentQuestionIndex < questions.length - 1) {
            goToQuestion(currentQuestionIndex + 1);
        }
    });

    document.getElementById("submit-btn")?.addEventListener("click", () => {
        if (confirm("Are you sure you want to submit the test?")) submitTest();
    });
}

// ✅ Collect Answers from User Inputs
function collectAnswers() {
    console.log("Collecting answers...");
    
    const optionContainers = document.querySelectorAll(".options");
    if (!optionContainers.length) {
        console.error("❌ Error: options container not found!");
        return {};
    }

    const answers = {};

    optionContainers.forEach((optionContainer, index) => {
        if (!questions[index]) return;

        const questionId = questions[index]._id; // ✅ Ensure question has an `_id`
        const selectedOption = optionContainer.querySelector("input[type='radio']:checked");
        const enteredInteger = optionContainer.querySelector("input[type='number']");

        answers[questionId] = selectedOption ? parseInt(selectedOption.value) :
                             enteredInteger && enteredInteger.value !== "" ? parseInt(enteredInteger.value) : null;
    });

    console.log("✅ Collected Answers:", answers);
    localStorage.setItem("userAnswers", JSON.stringify(answers)); // ✅ Persist answers

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

    clearInterval(timerInterval); // Clear any existing timers
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
        const questionId = questions[currentQuestionIndex]._id; // Get the question ID
        const selectedValue = event.target.type === "radio" ? parseInt(event.target.value) : parseInt(event.target.value);

        userAnswers[questionId] = selectedValue; // Store response in userAnswers object
        localStorage.setItem("userAnswers", JSON.stringify(userAnswers)); // Persist to localStorage

        // ✅ Change button color to Green for answered questions
        const btn = document.querySelector(`button[data-index="${currentQuestionIndex}"]`);
        if (btn) {
            btn.classList.remove("unread", "read");
            btn.classList.add("answered");
        }
    }
}



    // ✅ Display Answer Options
    const optionsContainer = document.querySelector(".options");
    
    function updateQuestion() {
        if (!questions.length) return;
    
        if (!questions || !questions.length) {
            console.error("❌ Error: No questions available!");
            return;
        }
    
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
    
        // ✅ Retrieve user's previous answer from localStorage
        const savedAnswers = JSON.parse(localStorage.getItem("userAnswers")) || {};
        const savedAnswer = savedAnswers[question._id] ?? null;
    
        // ✅ Display Answer Options
        const optionsContainer = document.querySelector(".options");
        optionsContainer.innerHTML = "";
    
        if (question.type === "MCQ") {
            Object.entries(question.options).forEach(([key, value]) => {
                const optionElement = document.createElement("label");
                optionElement.innerHTML = `
                    <input type="radio" name="question${currentQuestionIndex}" value="${parseInt(key)}" 
                        ${savedAnswer === parseInt(key) ? "checked" : ""}> ${value}
                `;
                optionsContainer.appendChild(optionElement);
            });
        } else {
            optionsContainer.innerHTML = `
                <label>Enter your answer:</label>
                <input type="number" name="question${currentQuestionIndex}" min="0" max="99999" value="${savedAnswer !== null ? savedAnswer : ''}">
            `;
        }
    }
    

// ✅ Submit Test Function (Updated)
async function submitTest() {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const user_id = userInfo?.id || null;
    const user_name = localStorage.getItem("user_name");

    if (!user_id) {
        alert("⚠ User session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    // Fetch answers from localStorage
    const answers = JSON.parse(localStorage.getItem("userAnswers")) || {};

    if (!answers || Object.keys(answers).length === 0 || 
        Object.values(answers).every(ans => ans === null || ans === undefined || ans === "")) {
        alert("⚠ You haven't answered any questions. Please attempt at least one before submitting.");
        return;
    }

    clearInterval(timerInterval);
    document.getElementById("submit-btn").textContent = "Submitting...";

    try {
        const response = await fetch(`${API_BASE_URL}/attempts/save-attempt`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                user_id, 
                user_name,
                exam_year, 
                exam_slot, 
                answers
            })
        });

        const data = await response.json();
        alert(`✅ Test Submitted!`);
        window.location.href = "results.html";
    } catch (error) {
        console.error("❌ Error submitting test:", error);
        alert("❌ Submission failed! Please retry.");
        document.getElementById("submit-btn").textContent = "Submit Test";
    }
}


// ✅ Event Listeners for Navigation
document.addEventListener("DOMContentLoaded", () => {
    startTimer();

    document.getElementById("submit-btn")?.addEventListener("click", () => {
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

function autoSaveAnswers() {
    setInterval(() => {
        localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
    }, 5000); // Auto-save every 5 seconds
}

document.addEventListener("DOMContentLoaded", () => {
    autoSaveAnswers();
});



// ✅ Apply Button Colors via CSS
const style = document.createElement("style");
style.innerHTML = `
    .nav-btn { padding: 10px; margin: 5px; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 14px; }
    .unread { background-color: #d3d3d3; color: black; }
    .read { background-color: #808080; color: white; }
    .answered { background-color: #28a745; color: white; }
`;
document.head.appendChild(style);