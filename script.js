const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messages = document.getElementById("messages");
function sendMessage() {

    const text = input.value.trim();

    if (text === "") {
        return;
    }

    const message = document.createElement("div");

    message.textContent = text;

    messages.appendChild(message);

    input.value = "";
}

sendButton.addEventListener("click", sendMessage);
