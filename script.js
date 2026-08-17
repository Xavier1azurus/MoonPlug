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
const themeButton = document.getElementById("themeButton");

themeButton.addEventListener("click", function() {

    document.body.classList.toggle("light-theme");

    if (document.body.classList.contains("light-theme")) {
        themeButton.textContent = "Light";
    } else {
        themeButton.textContent = "Dark";
    }

});
const sizeButtons = document.querySelectorAll(".size-button");

sizeButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        sizeButtons.forEach(function(btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        const size = button.dataset.size;

        if (size === "small") {
            document.body.classList.add("small-text");
            document.body.classList.remove("large-text");
        }

        if (size === "medium") {
            document.body.classList.remove("small-text");
            document.body.classList.remove("large-text");
        }

        if (size === "large") {
            document.body.classList.remove("small-text");
            document.body.classList.add("large-text");
        }

    });

});
const sidebarSizeButtons =
    document.querySelectorAll(".sidebar-size-button");

const sidebar =
    document.querySelector(".sidebar");

sidebarSizeButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        sidebarSizeButtons.forEach(function(btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        const size =
            button.dataset.sidebarSize;

        sidebar.classList.remove(
            "sidebar-compact",
            "sidebar-wide"
        );

        if (size === "compact") {
            sidebar.classList.add("sidebar-compact");
        }

        if (size === "wide") {
            sidebar.classList.add("sidebar-wide");
        }

    });

});
const sidebar = document.querySelector(".sidebar");

if (sidebar) {

    sidebar.addEventListener("click", function(event) {

        // Don't expand/collapse when clicking an actual sidebar button
        if (event.target.closest(".sidebar-button")) {
            return;
        }

        sidebar.classList.toggle("expanded");

    });

}
