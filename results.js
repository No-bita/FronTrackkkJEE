const API_BASE_URL = "https://backend-q2xl.onrender.com/api";

// 🔍 Extract necessary parameters
const userId = localStorage.getItem("user_id");
const year = localStorage.getItem("exam_year"); // Stored earlier when the test was started
const slot = localStorage.getItem("exam_slot");

let results = [];
let currentQuestionIndex = 0;

// 🎯 Fetch Results from Backend
async function fetchResults() {
    try {
        const response = await fetch(`${API_BASE_URL}/results/calculate?user_id=${userId}&year=${year}&slot=${slot}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch results: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📊 Results:", data);
        results = data.answers;

        // 🛠️ Populate Summary
        document.getElementById("total-questions").innerText = data.total_questions;
        document.getElementById("correct-answers").innerText = data.correct;
        document.getElementById("incorrect-answers").innerText = data.incorrect;
        document.getElementById("unattempted-answers").innerText = data.unattempted;
        document.getElementById("total-score").innerText = data.total_marks;

        // Display first question initially
        if (results.length > 0) {
            displayQuestion(0);
        }
    } catch (error) {
        console.error("❌ Error fetching results:", error);
        alert("Failed to load results. Please try again later.");
    }
}

// 🔍 Display Current Question
function displayQuestion(index) {
    const question = results[index];
    document.getElementById("question-text").innerText = question.question_text;
    document.getElementById("your-answer").innerText = question.user_answer ?? "Not answered";
    document.getElementById("correct-answer").innerText = question.correct_answer;
    document.getElementById("status").innerText = question.status;

    // Apply status-based color class
    document.getElementById("status").className = question.status;

    // Disable/Enable buttons based on current index
    document.getElementById("prev-btn").disabled = index === 0;
    document.getElementById("next-btn").disabled = index === results.length - 1;
}

// 🧭 Navigation Event Listeners
document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(currentQuestionIndex);
    }
});

document.getElementById("next-btn").addEventListener("click", () => {
    if (currentQuestionIndex < results.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
    }
});

// 🟢 Initialize Results Fetching on Page Load
document.addEventListener("DOMContentLoaded", fetchResults);
