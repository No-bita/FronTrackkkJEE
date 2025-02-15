const API_BASE_URL = "https://backend-q2xl.onrender.com/api";

async function fetchResults() {
    const userId = localStorage.getItem("user_id");
    const year = localStorage.getItem("year");
    const slot = localStorage.getItem("slot");

    // ✅ Ensure slot is formatted correctly
    const formattedSlot = slot.replace(/\s+/g, "_"); 

    if (!userId || !year || !formattedSlot) {
        alert("⚠️ Missing user ID, year, or slot. Please start the exam again.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/results/calculate?user_id=${userId}&year=${year}&slot=${formattedSlot}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(`Failed to fetch results: ${errorMsg}`);
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
        alert("⚠️ Failed to load results. Please try again later.");
    }
}

// 🚀 Redirect to Detailed Results
document.getElementById("view-details-btn").addEventListener("click", () => {
    window.location.href = "./detailed_results.html";
});

// 🟢 Initialize
document.addEventListener("DOMContentLoaded", fetchResults);
