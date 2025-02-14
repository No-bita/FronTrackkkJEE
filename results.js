document.addEventListener("DOMContentLoaded", async () => {
    const user_id = localStorage.getItem("user_id");
    const year = localStorage.getItem("exam_year");
    const slot = localStorage.getItem("exam_slot");

    if (!user_id || !year || !slot) {
        alert("Missing exam data. Redirecting to dashboard.");
        window.location.href = "dashboard.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/exam/results?user_id=${user_id}&year=${year}&slot=${slot}`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) throw new Error("Failed to fetch results");

        const data = await response.json();

        // ✅ Update score display
        document.getElementById("score").innerText = data.score;
        document.getElementById("correct").innerText = data.correct;
        document.getElementById("incorrect").innerText = data.incorrect;
        document.getElementById("skipped").innerText = data.skipped;

        // ✅ Populate review table
        const tableBody = document.getElementById("review-table");
        data.review.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.question_text}</td>
                <td>${item.your_answer || "⏺ Skipped"}</td>
                <td>${item.correct_answer}</td>
                <td>${item.status === "Correct" ? "✅" : item.status === "Incorrect" ? "❌" : "⚪ Skipped"}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("❌ Error fetching results:", error);
        alert("Failed to load results. Please try again.");
    }
});
