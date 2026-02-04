let selectedMood = null;

document.querySelectorAll(".mood").forEach(mood => {
    mood.addEventListener("click", () => {
        document.querySelectorAll(".mood").forEach(m => m.classList.remove("selected"));

        mood.classList.add("selected");
        selectedMood = mood.getAttribute("data-mood");
    });
});

document.getElementById("submitBtn").addEventListener("click", () => {
    if (!selectedMood) {
        alert("Please select a mood before submitting.");
        return;
    }

    alert("You selected: " + selectedMood.toUpperCase());
});
