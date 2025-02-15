const API_BASE_URL = "https://backend-q2xl.onrender.com/api";

// 🎯 Fetch Results from Backend and Populate Summary
async function fetchResults() {
    try {
        const response = await fetch(`${API_BASE_URL}/results/calculate?user_id=${localStorage.getItem("user_id")}&year=${localStorage.getItem("exam_year")}&slot=${localStorage.getItem("exam_slot")}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch results: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📊 Results:", data);

        // 🛠️ Populate Summary
        document.getElementById("total-questions").innerText = data.total_questions;
        document.getElementById("correct-answers").innerText = data.correct;
        document.getElementById("incorrect-answers").innerText = data.incorrect;
        document.getElementById("unattempted-answers").innerText = data.unattempted;
        document.getElementById("total-score").innerText = data.total_marks;

        // ✅ Store detailed answers for next page
        localStorage.setItem("detailedAnswers", JSON.stringify(data.answers));
    } catch (error) {
        console.error("❌ Error fetching results:", error);
        alert("Failed to load results. Please try again later.");
    }
}

// 🚀 Redirect to Detailed Results
document.getElementById("view-details-btn").addEventListener("click", () => {
    window.location.href = "./detailed_results.html";
});

// 🟢 Initialize
document.addEventListener("DOMContentLoaded", fetchResults);
