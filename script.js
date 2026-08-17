const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messages = document.getElementById("messages");

function addMessage(text, type) {
    const message = document.createElement("div");
    message.className = `message ${type}`;

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = text;

    message.appendChild(bubble);
    messages.appendChild(message);

    messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
    if (!input || !messages) {
        return;
    }

    const text = input.value.trim();

    if (text === "") {
        return;
    }

    // Remove the empty-chat greeting
    const emptyChat = document.querySelector(".empty-chat");

    if (emptyChat) {
        emptyChat.remove();
    }

    // Add user's message
    addMessage(text, "user");

    // Clear input
    input.value = "";
    input.focus();

    // Show MoonPlug's response
    setTimeout(() => {
        addMessage(
            "I'm MoonPlug AI. How can I help?",
            "ai"
        );
    }, 600);
}


// Send button
if (sendButton) {
    sendButton.addEventListener("click", sendMessage);
}


// Enter key
if (input) {
    input.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
}
const settingsButton = document.getElementById("settingsButton");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettings = document.getElementById("closeSettings");

settingsButton.addEventListener("click", function() {
    settingsPanel.style.display = "flex";
});

closeSettings.addEventListener("click", function() {
    settingsPanel.style.display = "none";
});
