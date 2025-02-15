const API_BASE_URL = "https://backend-q2xl.onrender.com/api";

document.addEventListener("DOMContentLoaded", async () => {
    const user_id = localStorage.getItem("user_id");
    const year = localStorage.getItem("year");
    const slot = localStorage.getItem("slot");

    if (!user_id || !year || !slot) {
        alert("⚠ Missing exam data. Redirecting to dashboard.");
        window.location.href = "dashboard.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/attempts/results`, {
            method: "POST", // ✅ Ensure using POST instead of query params in GET
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ user_id, year, slot })
        });

        if (!response.ok) throw new Error("⚠ Failed to fetch results");

        const data = await response.json();

        // ✅ Update score display
        document.getElementById("score").innerText = data.totalMarks;
        document.getElementById("correct").innerText = data.correctAnswers;
        document.getElementById("incorrect").innerText = data.incorrectAnswers;
        document.getElementById("skipped").innerText = data.skipped;
        document.getElementById("accuracy").innerText = `${data.accuracy}%`; // ✅ Add accuracy
        document.getElementById("timeTaken").innerText = `${data.timeTaken} min`; // ✅ Add time taken

        // ✅ Populate review table
        const tableBody = document.getElementById("review-table");
        tableBody.innerHTML = ""; // Clear any existing data

        data.review.forEach((item, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.question_text}</td>
                <td>${item.your_answer || "⏺ Skipped"}</td>
                <td>${item.correct_answer}</td>
                <td>${item.status === "✅ Correct" ? "✅" : item.status === "❌ Incorrect" ? "❌" : "⚪ Skipped"}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("❌ Error fetching results:", error);
        alert("❌ Failed to load results. Please try again.");
    }
});
