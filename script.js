/* =========================================================
   MOONPLUG AI
   COMPLETE JAVASCRIPT
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const API_BASE = "https://moonplug.onrender.com";


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   ELEMENTS
========================================================= */

const sidebar = $("sidebar");
const sidebarLogo = $("sidebarLogo");

const messages = $("messages");
const emptyChat = $("emptyChat");

const messageInput = $("messageInput");
const sendButton = $("sendButton");

const typing = $("typing");

const settingsPanel = $("settingsPanel");
const closeSettingsButton = $("closeSettings");

const themeButton = $("themeButton");

const accountScreen = $("accountScreen");
const ownerButton = $("ownerButton");
const closeAccount = $("closeAccount");

const loginTab = $("loginTab");
const signupTab = $("signupTab");

const loginForm = $("loginForm");
const signupForm = $("signupForm");

const accountMessage = $("accountMessage");

const ownerLogin = $("ownerLogin");
const ownerCode = $("ownerCode");
const ownerLoginButton = $("ownerLoginButton");
const ownerCancel = $("ownerCancel");
const ownerError = $("ownerError");

const showPassword = $("showPassword");

const ownerPanel = $("ownerPanel");
const ownerLogout = $("ownerLogout");

const ownerUsers = $("ownerUsers");
const ownerChats = $("ownerChats");

const trainerButton = $("trainerButton");
const trainerContainer = $("trainerContainer");


/* =========================================================
   STAR FIELD
========================================================= */

function createStars() {

    const field = $("starField");

    if (!field) return;

    field.innerHTML = "";

    const count =
        window.innerWidth < 700
            ? 90
            : 150;

    for (let i = 0; i < count; i++) {

        const star = document.createElement("span");

        star.className = "random-star";

        star.style.setProperty(
            "--star-x",
            `${Math.random() * 100}%`
        );

        star.style.setProperty(
            "--star-y",
            `${Math.random() * 100}%`
        );

        star.style.setProperty(
            "--star-size",
            `${Math.random() * 2 + 1}px`
        );

        star.style.setProperty(
            "--star-opacity",
            `${Math.random() * .6 + .25}`
        );

        star.style.setProperty(
            "--star-scale",
            `${Math.random() * .7 + .6}`
        );

        star.style.setProperty(
            "--star-duration",
            `${Math.random() * 4 + 3}s`
        );

        star.style.setProperty(
            "--star-delay",
            `${Math.random() * 4}s`
        );

        star.style.setProperty(
            "--star-move-x",
            `${(Math.random() - .5) * 12}px`
        );

        star.style.setProperty(
            "--star-move-y",
            `${(Math.random() - .5) * 12}px`
        );

        star.style.setProperty(
            "--star-glow",
            `${Math.random() * 4 + 3}px`
        );

        field.appendChild(star);
    }
}


/* =========================================================
   SIDEBAR
========================================================= */

function toggleSidebar() {

    if (!sidebar) return;

    if (window.innerWidth <= 1200) {

        sidebar.classList.toggle("expanded");

        return;
    }

    sidebar.classList.toggle("collapsed");
}

if (sidebarLogo) {

    sidebarLogo.addEventListener(
        "click",
        toggleSidebar
    );

    sidebarLogo.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                toggleSidebar();
            }
        }
    );
}


/* =========================================================
   NEW CHAT
========================================================= */

function startNewChat() {

    if (!messages) return;

    messages.innerHTML = `
        <div id="emptyChat" class="empty-chat">

            <div class="empty-moon">
                🌙
            </div>

            <h1>
                What can I help with?
            </h1>

            <p>
                Ask MoonPlug anything.
            </p>

        </div>
    `;

    messageInput.value = "";

    autoResizeInput();

    messageInput.focus();
}

$("newChatButton")?.addEventListener(
    "click",
    startNewChat
);


/* =========================================================
   ADD MESSAGE
========================================================= */

function addMessage(text, type = "ai") {

    if (!messages) return;

    if (emptyChat) {
        emptyChat.remove();
    }

    const bubble =
        document.createElement("div");

    bubble.className =
        `message-bubble ${type}`;

    bubble.textContent = text;

    messages.appendChild(bubble);

    messages.scrollTop =
        messages.scrollHeight;

    return bubble;
}


/* =========================================================
   TYPING
========================================================= */

function showTyping() {

    if (!typing) return;

    typing.style.display = "block";

    messages.scrollTop =
        messages.scrollHeight;
}

function hideTyping() {

    if (!typing) return;

    typing.style.display = "none";
}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    const text =
        messageInput.value.trim();

    if (!text) return;

    addMessage(text, "user");

    messageInput.value = "";

    autoResizeInput();

    sendButton.disabled = true;

    showTyping();

    try {

        const response =
            await fetch(
                `${API_BASE}/api/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: text
                    })
                }
            );

        let data = null;

        try {
            data =
                await response.json();
        } catch {
            data = null;
        }

        hideTyping();

        if (!response.ok) {

            addMessage(
                "MoonPlug couldn't process that request right now.",
                "ai"
            );

            return;
        }

        const reply =
            data?.response ||
            data?.message ||
            data?.answer ||
            "MoonPlug received your message.";

        addMessage(
            String(reply),
            "ai"
        );

    } catch (error) {

        hideTyping();

        addMessage(
            "MoonPlug is having trouble connecting to the server.",
            "ai"
        );

        console.error(
            "MoonPlug chat error:",
            error
        );

    } finally {

        sendButton.disabled = false;

        messageInput.focus();
    }
}

sendButton?.addEventListener(
    "click",
    sendMessage
);


/* =========================================================
   ENTER TO SEND
========================================================= */

messageInput?.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    }
);


/* =========================================================
   AUTO RESIZE
========================================================= */

function autoResizeInput() {

    if (!messageInput) return;

    messageInput.style.height = "auto";

    messageInput.style.height =
        `${Math.min(
            messageInput.scrollHeight,
            180
        )}px`;
}

messageInput?.addEventListener(
    "input",
    autoResizeInput
);


/* =========================================================
   SETTINGS
========================================================= */

function openSettings() {

    if (!settingsPanel) return;

    settingsPanel.style.display = "flex";

    settingsPanel.setAttribute(
        "aria-hidden",
        "false"
    );
}

function closeSettings() {

    if (!settingsPanel) return;

    settingsPanel.style.display = "none";

    settingsPanel.setAttribute(
        "aria-hidden",
        "true"
    );
}

$("settingsButton")?.addEventListener(
    "click",
    openSettings
);

closeSettingsButton?.addEventListener(
    "click",
    closeSettings
);

settingsPanel?.addEventListener(
    "click",
    (event) => {

        if (
            event.target === settingsPanel
        ) {
            closeSettings();
        }
    }
);


/* =========================================================
   THEME
========================================================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            "moonplug-theme"
        ) || "dark";

    if (theme === "light") {

        document.body.classList.add(
            "light-theme"
        );

        if (themeButton) {
            themeButton.textContent =
                "Light";
        }

    } else {

        document.body.classList.remove(
            "light-theme"
        );

        if (themeButton) {
            themeButton.textContent =
                "Dark";
        }
    }
}

function toggleTheme() {

    const light =
        document.body.classList.toggle(
            "light-theme"
        );

    localStorage.setItem(
        "moonplug-theme",
        light
            ? "light"
            : "dark"
    );

    if (themeButton) {

        themeButton.textContent =
            light
                ? "Light"
                : "Dark";
    }
}

themeButton?.addEventListener(
    "click",
    toggleTheme
);


/* =========================================================
   TEXT SIZE
========================================================= */

function updateTextSize(size) {

    document.body.classList.remove(
        "text-small",
        "text-medium",
        "text-large"
    );

    document.body.classList.add(
        `text-${size}`
    );

    localStorage.setItem(
        "moonplug-text-size",
        size
    );

    document
        .querySelectorAll(".size-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.size === size
            );
        });
}

function loadTextSize() {

    const saved =
        localStorage.getItem(
            "moonplug-text-size"
        ) || "medium";

    updateTextSize(saved);
}

document
    .querySelectorAll(".size-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {
                updateTextSize(
                    button.dataset.size
                );
            }
        );
    });


/* =========================================================
   ACCOUNT
========================================================= */

function openAccount() {

    accountScreen.style.display =
        "flex";

    accountScreen.setAttribute(
        "aria-hidden",
        "false"
    );
}

function closeAccountScreen() {

    accountScreen.style.display =
        "none";

    accountScreen.setAttribute(
        "aria-hidden",
        "true"
    );
}

ownerButton?.addEventListener(
    "click",
    openAccount
);

closeAccount?.addEventListener(
    "click",
    closeAccountScreen
);


/* =========================================================
   ACCOUNT TABS
========================================================= */

function showLoginTab() {

    loginTab.classList.add("active");

    signupTab.classList.remove("active");

    loginForm.hidden = false;

    signupForm.hidden = true;

    accountMessage.textContent = "";
}

function showSignupTab() {

    signupTab.classList.add("active");

    loginTab.classList.remove("active");

    loginForm.hidden = true;

    signupForm.hidden = false;

    accountMessage.textContent = "";
}

loginTab?.addEventListener(
    "click",
    showLoginTab
);

signupTab?.addEventListener(
    "click",
    showSignupTab
);


/* =========================================================
   ACCOUNT FORMS
========================================================= */

loginForm?.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        accountMessage.textContent =
            "Account login can be connected to the MoonPlug backend here.";
    }
);

signupForm?.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        const password =
            $("signupPassword").value;

        const confirm =
            $("signupConfirm").value;

        if (password !== confirm) {

            accountMessage.textContent =
                "Passwords do not match.";

            return;
        }

        accountMessage.textContent =
            "Account creation can be connected to the MoonPlug backend here.";
    }
);


/* =========================================================
   OWNER LOGIN
========================================================= */

function showOwnerLogin() {

    ownerLogin.style.display =
        "flex";

    ownerLogin.setAttribute(
        "aria-hidden",
        "false"
    );

    ownerCode.value = "";

    ownerError.textContent = "";

    ownerCode.focus();
}

function hideOwnerLogin() {

    ownerLogin.style.display =
        "none";

    ownerLogin.setAttribute(
        "aria-hidden",
        "true"
    );
}


/*
   Hidden owner trigger:
   Enter a private trigger into the chat.
*/

messageInput?.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            const value =
                messageInput.value.trim();

            if (
                value ===
                "moonplug-owner"
            ) {

                event.preventDefault();

                messageInput.value = "";

                showOwnerLogin();
            }
        }
    }
);


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

showPassword?.addEventListener(
    "click",
    () => {

        if (
            ownerCode.type ===
            "password"
        ) {

            ownerCode.type =
                "text";

            showPassword.textContent =
                "Hide";

        } else {

            ownerCode.type =
                "password";

            showPassword.textContent =
                "Show";
        }
    }
);

ownerCancel?.addEventListener(
    "click",
    hideOwnerLogin
);


/* =========================================================
   OWNER LOGIN
========================================================= */

async function loginOwner() {

    const code =
        ownerCode.value.trim();

    if (!code) {

        ownerError.textContent =
            "Enter the owner code.";

        return;
    }

    ownerLoginButton.disabled = true;

    ownerError.textContent =
        "Checking...";

    try {

        const response =
            await fetch(
                `${API_BASE}/api/owner/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        code
                    })
                }
            );

        const data =
            await response.json()
                .catch(() => ({}));

        if (!response.ok) {

            ownerError.textContent =
                data.error ||
                "Invalid owner code.";

            return;
        }

        hideOwnerLogin();

        openOwnerPanel();

    } catch (error) {

        ownerError.textContent =
            "Unable to connect to MoonPlug.";

        console.error(
            "Owner login:",
            error
        );

    } finally {

        ownerLoginButton.disabled =
            false;
    }
}

ownerLoginButton?.addEventListener(
    "click",
    loginOwner
);

ownerCode?.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {
            loginOwner();
        }
    }
);


/* =========================================================
   OWNER PANEL
========================================================= */

function openOwnerPanel() {

    ownerPanel.style.display =
        "flex";

    ownerPanel.setAttribute(
        "aria-hidden",
        "false"
    );

    loadOwnerDashboard();
}

function closeOwnerPanel() {

    ownerPanel.style.display =
        "none";

    ownerPanel.setAttribute(
        "aria-hidden",
        "true"
    );
}

async function loadOwnerDashboard() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/owner/dashboard`,
                {
                    credentials:
                        "include"
                }
            );

        const data =
            await response.json()
                .catch(() => ({}));

        if (!response.ok) return;

        if (
            ownerUsers &&
            data.users !== undefined
        ) {
            ownerUsers.textContent =
                data.users;
        }

        if (
            ownerChats &&
            data.chats !== undefined
        ) {
            ownerChats.textContent =
                data.chats;
        }

    } catch (error) {

        console.error(
            "Owner dashboard:",
            error
        );
    }
}

ownerLogout?.addEventListener(
    "click",
    async () => {

        try {

            await fetch(
                `${API_BASE}/api/owner/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

        } catch {}

        closeOwnerPanel();
    }
);


/* =========================================================
   CONVERSATION MODE
========================================================= */

const conversationMode =
    $("conversationMode");

const conversationButton =
    $("conversationButton");

const conversationClose =
    $("conversationClose");

const conversationMic =
    $("conversationMic");

const conversationStatus =
    $("conversationStatus");

const conversationText =
    $("conversationText");

const moonOrb =
    $("moonOrb");


let conversationListening = false;
let conversationRecognition = null;
let conversationSpeaking = false;


/* =========================================================
   SPEECH RECOGNITION
========================================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognition) {

    conversationRecognition =
        new SpeechRecognition();

    conversationRecognition.continuous =
        false;

    conversationRecognition.interimResults =
        false;

    conversationRecognition.lang =
        "en-US";

    conversationRecognition.onstart =
        () => {

            conversationListening = true;

            setConversationState(
                "listening"
            );
        };

    conversationRecognition.onresult =
        async (event) => {

            const transcript =
                event.results[0][0]
                    .transcript
                    .trim();

            if (!transcript) {

                stopConversationListening();

                return;
            }

            conversationText.textContent =
                transcript;

            await processConversationMessage(
                transcript
            );
        };

    conversationRecognition.onerror =
        (event) => {

            console.error(
                "Speech recognition:",
                event.error
            );

            stopConversationListening();

            conversationStatus.textContent =
                "Microphone unavailable";

            conversationText.textContent =
                "Tap the microphone to try again";
        };

    conversationRecognition.onend =
        () => {

            conversationListening = false;

            if (!conversationSpeaking) {

                setConversationState(
                    "idle"
                );
            }
        };
}


/* =========================================================
   OPEN CONVERSATION MODE
========================================================= */

function openConversationMode() {

    /*
       Only intended for mobile/tablet.
    */

    if (
        window.innerWidth >= 700
    ) {
        return;
    }

    conversationMode.classList.add(
        "active"
    );

    conversationMode.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "conversation-open"
    );

    setConversationState(
        "idle"
    );
}

conversationButton?.addEventListener(
    "click",
    openConversationMode
);


/* =========================================================
   CLOSE CONVERSATION MODE
========================================================= */

function closeConversationMode() {

    stopConversationListening();

    if (
        window.speechSynthesis
    ) {
        window.speechSynthesis.cancel();
    }

    conversationSpeaking = false;

    conversationMode.classList.remove(
        "active"
    );

    conversationMode.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "conversation-open"
    );

    setConversationState(
        "idle"
    );
}

conversationClose?.addEventListener(
    "click",
    closeConversationMode
);


/* =========================================================
   CONVERSATION STATE
========================================================= */

function setConversationState(state) {

    if (!moonOrb) return;

    moonOrb.classList.remove(
        "listening",
        "thinking",
        "talking"
    );

    conversationMic.classList.remove(
        "active"
    );

    switch (state) {

        case "listening":

            moonOrb.classList.add(
                "listening"
            );

            conversationStatus.textContent =
                "Listening...";

            conversationText.textContent =
                "I'm listening";

            conversationMic.textContent =
                "⏹";

            conversationMic.classList.add(
                "active"
            );

            break;


        case "thinking":

            moonOrb.classList.add(
                "thinking"
            );

            conversationStatus.textContent =
                "Thinking...";

            conversationText.textContent =
                "MoonPlug is thinking";

            conversationMic.textContent =
                "🎙️";

            break;


        case "talking":

            moonOrb.classList.add(
                "talking"
            );

            conversationStatus.textContent =
                "MoonPlug is talking...";

            conversationMic.textContent =
                "🔊";

            break;


        default:

            conversationStatus.textContent =
                "Ready";

            conversationText.textContent =
                "Tap the microphone to talk";

            conversationMic.textContent =
                "🎙️";
    }
}


/* =========================================================
   TOGGLE LISTENING
========================================================= */

function toggleConversationListening() {

    if (!conversationRecognition) {

        conversationStatus.textContent =
            "Speech recognition unavailable";

        conversationText.textContent =
            "Try a browser that supports microphone speech recognition.";

        return;
    }

    if (conversationListening) {

        stopConversationListening();

    } else {

        startConversationListening();
    }
}

conversationMic?.addEventListener(
    "click",
    toggleConversationListening
);


/* =========================================================
   START LISTENING
========================================================= */

function startConversationListening() {

    if (!conversationRecognition) return;

    try {

        conversationRecognition.start();

    } catch (error) {

        console.log(
            "Recognition already running."
        );
    }
}


/* =========================================================
   STOP LISTENING
========================================================= */

function stopConversationListening() {

    if (!conversationRecognition) return;

    conversationListening = false;

    try {

        conversationRecognition.stop();

    } catch {}
}


/* =========================================================
   CONVERSATION → MOONPLUG
========================================================= */

async function processConversationMessage(
    transcript
) {

    stopConversationListening();

    setConversationState(
        "thinking"
    );

    try {

        const response =
            await fetch(
                `${API_BASE}/api/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: transcript
                    })
                }
            );

        const data =
            await response.json()
                .catch(() => ({}));

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Chat request failed"
            );
        }

        const reply =
            data.response ||
            data.message ||
            data.answer ||
            "I received your message.";

        conversationText.textContent =
            String(reply);

        /*
           Also put the conversation into
           the normal MoonPlug chat.
        */

        addMessage(
            transcript,
            "user"
        );

        addMessage(
            String(reply),
            "ai"
        );

        speakConversation(
            String(reply)
        );

    } catch (error) {

        console.error(
            "Conversation mode:",
            error
        );

        conversationSpeaking = false;

        setConversationState(
            "idle"
        );

        conversationText.textContent =
            "I couldn't connect right now.";
    }
}


/* =========================================================
   TEXT TO SPEECH
========================================================= */

function speakConversation(text) {

    if (
        !window.speechSynthesis
    ) {

        setConversationState(
            "idle"
        );

        return;
    }

    window.speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(
            text
        );

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    conversationSpeaking = true;

    setConversationState(
        "talking"
    );

    utterance.onend =
        () => {

            conversationSpeaking =
                false;

            if (
                conversationMode.classList.contains(
                    "active"
                )
            ) {

                setConversationState(
                    "idle"
                );
            }
        };

    utterance.onerror =
        () => {

            conversationSpeaking =
                false;

            setConversationState(
                "idle"
            );
        };

    window.speechSynthesis.speak(
        utterance
    );
}


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            if (
                conversationMode.classList.contains(
                    "active"
                )
            ) {

                closeConversationMode();

                return;
            }

            if (
                settingsPanel.style.display ===
                "flex"
            ) {

                closeSettings();

                return;
            }

            if (
                ownerLogin.style.display ===
                "flex"
            ) {

                hideOwnerLogin();
            }
        }
    }
);


/* =========================================================
   RESPONSIVE SAFETY
========================================================= */

window.addEventListener(
    "resize",
    () => {

        /*
           If the user rotates/resizes from
           mobile into desktop, close conversation mode.
        */

        if (
            window.innerWidth >= 700 &&
            conversationMode.classList.contains(
                "active"
            )
        ) {

            closeConversationMode();
        }

        createStars();
    }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeMoonPlug() {

    createStars();

    loadTheme();

    loadTextSize();

    autoResizeInput();

    console.log(
        "MoonPlug AI initialized."
    );
}

initializeMoonPlug();
