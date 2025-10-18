document.addEventListener("DOMContentLoaded", () => {
    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");

    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        // Display user's message
        appendMessage(message, "user-message");
        userInput.value = "";

        // Show a thinking indicator
        const thinkingIndicator = appendMessage("...", "bot-message");

        try {
            // Send message to the Flask server
            const response = await fetch("/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: message }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Update the thinking indicator with the actual reply
            thinkingIndicator.querySelector('p').textContent = data.reply;

        } catch (error) {
            thinkingIndicator.querySelector('p').textContent = "Oops! Kuch gadbad ho gayi. Kripya dobara koshish karein.";
            console.error("Error:", error);
        }
    });

    function appendMessage(text, className) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${className}`;
        const p = document.createElement("p");
        p.textContent = text;
        messageDiv.appendChild(p);
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageDiv; // Return the element to be updated later
    }
});