const API_BASE_URL = "https://backend-q2xl.onrender.com/api";

let currentQuestionIndex = 0;
let questions = [];
let resultData = {};

// 🔹 Fetch results when page loads
document.addEventListener('DOMContentLoaded', async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const examYear = localStorage.getItem('exam_year');
    const examSlot = localStorage.getItem('exam_slot');

    if (!userInfo || !examYear || !examSlot) {
        alert("Missing required information. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/results/calculate?user_id=${userInfo.id}&year=${examYear}&slot=${examSlot}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch results");
        }

        resultData = await response.json();
        questions = resultData.answers;

        // Display summary
        document.getElementById('total-questions').textContent = resultData.total_questions;
        document.getElementById('correct-answers').textContent = resultData.correct;
        document.getElementById('incorrect-answers').textContent = resultData.incorrect;
        document.getElementById('unattempted-answers').textContent = resultData.unattempted;
        document.getElementById('total-score').textContent = resultData.total_marks;

        // Display first question
        displayQuestion(currentQuestionIndex);
    } catch (error) {
        console.error("Error loading results:", error);
        alert("Failed to load results. Please try again.");
    }
});

// 🔹 Display question
function displayQuestion(index) {
    const question = questions[index];
    const questionDisplay = document.getElementById('question-display');

    questionDisplay.innerHTML = `
        <div class="question-card">
            <div class="question-text">
                <strong>Q${index + 1}:</strong> ${question.question_text}
            </div>
            <div class="option ${question.status}">
                User Answer: ${question.user_answer !== null ? question.user_answer : "Not Attempted"}
            </div>
            <div class="option correct">
                Correct Answer: ${question.correct_answer}
            </div>
            <div class="status">
                <strong>Status:</strong> ${question.status.toUpperCase()}
            </div>
        </div>
    `;

    // Enable/disable buttons accordingly
    document.getElementById('prev-btn').disabled = index === 0;
    document.getElementById('next-btn').disabled = index === questions.length - 1;
}

// 🔹 Event listeners for navigation buttons
document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion(currentQuestionIndex);
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion(currentQuestionIndex);
    }
});
