```javascript
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messages = document.getElementById("messages");
const typing = document.getElementById("typing");


// =====================================================
// SEND MESSAGE
// =====================================================

function sendMessage() {

    const message = messageInput.value.trim();

    if (message === "") {
        return;
    }


    // Remove welcome screen

    const welcome = document.querySelector(".welcome-message");

    if (welcome) {
        welcome.remove();
    }


    // Add user message

    addMessage(
        message,
        "user"
    );


    // Clear input

    messageInput.value = "";


    // Show typing

    typing.style.display = "block";


    // Temporary demo response

    setTimeout(() => {

        typing.style.display = "none";


        addMessage(
            "I'm Lazarus. The AI connection isn't connected yet, but the chat interface is working! 🚀",
            "ai"
        );

    }, 1200);

}


// =====================================================
// ADD MESSAGE
// =====================================================

function addMessage(
    text,
    sender
) {

    const message = document.createElement("div");

    message.classList.add(
        "message",
        sender
    );


    const bubble = document.createElement("div");

    bubble.classList.add(
        "message-bubble"
    );


    bubble.textContent = text;


    message.appendChild(
        bubble
    );


    messages.appendChild(
        message
    );


    // Scroll to newest message

    messages.scrollTop =
        messages.scrollHeight;

}


// =====================================================
// SEND BUTTON
// =====================================================

sendButton.addEventListener(
    "click",
    sendMessage
);


// =====================================================
// ENTER KEY
// =====================================================

messageInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);
```
