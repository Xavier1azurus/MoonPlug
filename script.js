
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
    const text = input.value.trim();

    if (text === "") {
        return;
    }
const emptyChat = document.querySelector(".empty-chat");

if (emptyChat) {
    emptyChat.remove();
}
    addMessage(text, "user");

    input.value = "";
    input.focus();

    // Temporary MoonPlug response
    setTimeout(() => {
        addMessage("I'm MoonPlug AI. How can I help?", "ai");
    }, 600);
}

sendButton.addEventListener("click", sendMessage);

input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});
