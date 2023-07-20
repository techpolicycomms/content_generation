function checkAnswer(answer) {
    const feedback = document.getElementById("feedback");
    
    if (answer === "Paris") {
        feedback.textContent = "Correct! Paris is the capital of France.";
        feedback.style.color = "green";
    } else {
        feedback.textContent = "Sorry, that's incorrect.";
        feedback.style.color = "red";
    }
}
