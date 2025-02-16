const API_BASE_URL = "https://backend-q2xl.onrender.com/api";
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {};    

// Extract year and slot from localStorage
const year = localStorage.getItem("year");
const slot = localStorage.getItem("slot");

if (!year || !slot) {
    alert("❌ Missing required test information (year/slot). Please login again.");
    window.location.href = "dashboard.html"; // Redirect to dashboard if missing
}
// Fetch Questions from Backend
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await fetchQuestions();
        setupEventListeners();
        updateQuestion();
    } catch (error) {
        console.error("❌ Error during initialization:", error);
    }
});

// Fetch Questions
async function fetchQuestions() {
    try {
        const slotFormatted = slot.replace(/\s+/g, "_");
        const response = await fetch(`${API_BASE_URL}/questions?year=${year}&slot=${slotFormatted}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) {
            throw new Error(`Error fetching questions: ${response.statusText}`);
        }   

        questions = await response.json();

        if (!questions.length) {
            document.getElementById("question").textContent = "No questions available.";
            return;
        }

        generateQuestionButtons();
        updateQuestion();
    } catch (error) {
        console.error("❌ Error fetching questions:", error);
        document.getElementById("question").innerHTML = `<p style="color:red;">Failed to load questions. <button onclick="fetchQuestions()">Retry</button></p>`;
    }
}

// Generate Question Buttons
function generateQuestionButtons() {
    const container = document.getElementById("question-buttons");
    container.innerHTML = ""; 

    questions.forEach((_, index) => {
        const button = document.createElement("button");
        button.className = "nav-btn unread";
        button.textContent = index + 1;
        button.setAttribute("data-index", index);
        button.onclick = () => {
            goToQuestion(index);
            button.classList.toggle("read", !button.classList.contains("answered"));
        };
        container.appendChild(button);
    });
}

// Navigate to Question
function goToQuestion(index) {
    if (index >= 0 && index < questions.length) {
        currentQuestionIndex = index;
        updateQuestion();
    }
}

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById("logout-btn")?.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "dashboard.html";
    });

    document.getElementById("prev-btn")?.addEventListener("click", () => goToQuestion(currentQuestionIndex - 1));
    document.getElementById("next-btn")?.addEventListener("click", () => goToQuestion(currentQuestionIndex + 1));

    document.getElementById("submit-btn")?.addEventListener("click", () => {
        if (confirm("Are you sure you want to submit the test?")) submitTest();
    }, { once: true });
}

// Update Question Display
function updateQuestion() {
    if (!questions.length) return;

    const question = questions[currentQuestionIndex];
    document.getElementById("question").innerHTML = `Q${currentQuestionIndex + 1}: ${question.question_text}`;

    const questionImage = document.getElementById("question-image");
    if (question?.image) {
        questionImage.src = question.image;
        questionImage.style.display = "inline-block";
    } else {
        questionImage.style.display = "none";
    }

    const optionsContainer = document.querySelector(".options");
    optionsContainer.innerHTML = "";

    const savedAnswers = JSON.parse(localStorage.getItem("userAnswers")) || {};
    const savedAnswer = savedAnswers[question._id] ?? null;

    if (question.type === "MCQ") {
        Object.entries(question.options).forEach(([key, value]) => {
            optionsContainer.innerHTML += `
                <label>
                    <input type="radio" name="question${currentQuestionIndex}" value="${key}" 
                        ${savedAnswer == key ? "checked" : ""}> ${value}
                </label>`;
        });
    } else {
        optionsContainer.innerHTML = `
            <label>Enter your answer:</label>
            <input type="number" name="question${currentQuestionIndex}" min="0" max="99999" value="${savedAnswer ?? ''}">
        `;
    }
}

// Display Detailed Answers
document.addEventListener("DOMContentLoaded", () => {
    const answers = JSON.parse(localStorage.getItem("detailedAnswers")) || [];
    const container = document.getElementById("question-display");

    if (!answers.length) {
        container.innerHTML = "<p>No detailed results available.</p>";
        return;
    }

    answers.forEach((result, index) => {
        const card = document.createElement("div");
        card.className = "question-card";
        card.style.backgroundColor = result.status === "correct" ? "#c3fcb1" : result.status === "incorrect" ? "#fbb1b1" : "#f1f1f1";

        card.innerHTML = `
            <h3>Question ${index + 1}</h3>
            <p><strong>🔍 Question:</strong> ${result.question_text}</p>
            <p><strong>🙋‍♂️ Your Answer:</strong> ${result.user_answer ?? "Not Attempted"}</p>
            <p><strong>✅ Correct Answer:</strong> ${result.correct_answer}</p>
            <p><strong>Status:</strong> ${result.status}</p>
            <hr/>
        `;
        container.appendChild(card);
    });
});

// Apply Styles
const style = document.createElement("style");
style.innerHTML = `
    .nav-btn { padding: 10px; margin: 5px; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 14px; }
    .unread { background-color: #d3d3d3; color: black; }
    .read { background-color: #808080; color: white; }
    .answered { background-color: #28a745; color: white; }
`;
document.head.appendChild(style);
