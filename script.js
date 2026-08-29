/* =========================================================
MOONPLUG AI
COMPLETE JAVASCRIPT
========================================================= */

/* =========================================================
CONFIG
========================================================= */

const API_BASE = "https://moonplug.onrender.com";

const $ = id => document.getElementById(id);

/* =========================================================
NORMAL CHAT ELEMENTS
========================================================= */

const sidebar = $("sidebar");
const sidebarLogo = $("sidebarLogo");

const messages = $("messages");
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

/* =========================================================
OWNER
========================================================= */

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
CONVERSATION MODE
========================================================= */

const conversationMode = $("conversationMode");
const conversationButton = $("conversationButton");
const conversationClose = $("conversationClose");

const conversationMic = $("conversationMic");
const conversationSpeaker = $("conversationSpeaker");

const conversationStatus = $("conversationStatus");
const conversationText = $("conversationText");
const conversationVoiceStatus = $("conversationVoiceStatus");

const moonOrb = $("moonOrb");

const conversationChoice = $("conversationChoice");
const continueConversation = $("continueConversation");
const newConversation = $("newConversation");

const conversationHistoryButton =
$("conversationHistoryButton");

const conversationHistory =
$("conversationHistory");

const closeConversationHistory =
$("closeConversationHistory");

const conversationHistoryList =
$("conversationHistoryList");

/* =========================================================
CONVERSATION VARIABLES
========================================================= */

let conversationRecognition = null;

let conversationListening = false;

let conversationSpeaking = false;

let conversationVoiceEnabled = true;

let availableVoices = [];

let currentConversation = [];

let speechUnlocked = false;

/* =========================================================
STAR FIELD
========================================================= */

function createStars() {

const field = $("starField");

if (!field) return;

field.innerHTML = "";

const count =
    window.innerWidth <= 700
        ? 80
        : 150;

for (let i = 0; i < count; i++) {

    const star =
        document.createElement("span");

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

sidebar.classList.toggle("expanded");

}

sidebarLogo?.addEventListener(
"click",
toggleSidebar
);

sidebarLogo?.addEventListener(
"keydown",
event => {

    if (
        event.key === "Enter" ||
        event.key === " "
    ) {

        event.preventDefault();

        toggleSidebar();
    }
}

);

/* =========================================================
NORMAL CHAT
========================================================= */

function addMessage(text, type = "ai") {

if (!messages) return;

const empty =
    document.getElementById("emptyChat");

empty?.remove();

const bubble =
    document.createElement("div");

bubble.className =
    `message-bubble ${type}`;

bubble.textContent = String(text);

messages.appendChild(bubble);

messages.scrollTop =
    messages.scrollHeight;

return bubble;

}

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

if (messageInput) {
    messageInput.value = "";
    autoResizeInput();
    messageInput.focus();
}

}

$("newChatButton")?.addEventListener(
"click",
startNewChat
);

/* =========================================================
THINKING
========================================================= */

function showTyping() {

if (!typing) return;

typing.style.display = "flex";

}

function hideTyping() {

if (!typing) return;

typing.style.display = "none";

}

/* =========================================================
NORMAL AI CHAT
========================================================= */

async function sendMessage() {

const text =
    messageInput?.value.trim();

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

    const data =
        await response
            .json()
            .catch(() => ({}));

    hideTyping();

    if (!response.ok) {

        addMessage(
            "MoonPlug couldn't process that request right now.",
            "ai"
        );

        return;
    }

    const reply =
        data.response ||
        data.message ||
        data.answer ||
        "MoonPlug received your message.";

    addMessage(
        String(reply),
        "ai"
    );

} catch (error) {

    console.error(
        "MoonPlug chat error:",
        error
    );

    hideTyping();

    addMessage(
        "MoonPlug is having trouble connecting to the server.",
        "ai"
    );

} finally {

    sendButton.disabled = false;

    messageInput?.focus();
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
event => {

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

settingsPanel.style.display = "flex";

}

function closeSettings() {

settingsPanel.style.display = "none";

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
event => {

    if (event.target === settingsPanel) {
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

document.body.classList.toggle(
    "light-theme",
    theme === "light"
);

if (themeButton) {
    themeButton.textContent =
        theme === "light"
            ? "Light"
            : "Dark";
}

}

function toggleTheme() {

const isLight =
    document.body.classList.toggle(
        "light-theme"
    );

localStorage.setItem(
    "moonplug-theme",
    isLight
        ? "light"
        : "dark"
);

themeButton.textContent =
    isLight
        ? "Light"
        : "Dark";

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
accountScreen.style.display = "flex";
}

function closeAccountScreen() {
accountScreen.style.display = "none";
}

ownerButton?.addEventListener(
"click",
openAccount
);

closeAccount?.addEventListener(
"click",
closeAccountScreen
);

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

loginForm?.addEventListener(
"submit",
event => {

    event.preventDefault();

    accountMessage.textContent =
        "Account login can be connected to the MoonPlug backend.";
}

);

signupForm?.addEventListener(
"submit",
event => {

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
        "Account creation can be connected to the MoonPlug backend.";
}

);

/* =========================================================
HIDDEN OWNER TRIGGER
========================================================= */

function showOwnerLogin() {

ownerLogin.style.display = "flex";

ownerCode.value = "";

ownerError.textContent = "";

ownerCode.focus();

}

function hideOwnerLogin() {

ownerLogin.style.display = "none";

}

messageInput?.addEventListener(
"keydown",
event => {

    if (
        event.key === "Enter" &&
        !event.shiftKey &&
        messageInput.value.trim() ===
        "moonplug-owner"
    ) {

        event.preventDefault();

        messageInput.value = "";

        showOwnerLogin();
    }
}

);

/* =========================================================
OWNER PASSWORD
========================================================= */

showPassword?.addEventListener(
"click",
() => {

    const showing =
        ownerCode.type === "text";

    ownerCode.type =
        showing
            ? "password"
            : "text";

    showPassword.textContent =
        showing
            ? "Show"
            : "Hide";
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
        await response
            .json()
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

    console.error(error);

    ownerError.textContent =
        "Unable to connect to MoonPlug.";

} finally {

    ownerLoginButton.disabled = false;
}

}

ownerLoginButton?.addEventListener(
"click",
loginOwner
);

ownerCode?.addEventListener(
"keydown",
event => {

    if (event.key === "Enter") {
        loginOwner();
    }
}

);

/* =========================================================
OWNER PANEL
========================================================= */

function openOwnerPanel() {

ownerPanel.style.display = "flex";

loadOwnerDashboard();

}

function closeOwnerPanel() {

ownerPanel.style.display = "none";

}

async function loadOwnerDashboard() {

try {

    const response =
        await fetch(
            `${API_BASE}/api/owner/dashboard`,
            {
                credentials: "include"
            }
        );

    const data =
        await response
            .json()
            .catch(() => ({}));

    if (!response.ok) return;

    if (data.users !== undefined) {
        ownerUsers.textContent =
            data.users;
    }

    if (data.chats !== undefined) {
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
DEVICE VOICES
========================================================= */

function loadDeviceVoices() {

if (!("speechSynthesis" in window)) {

    conversationVoiceStatus.textContent =
        "This device/browser does not provide text-to-speech.";

    return;
}

availableVoices =
    window.speechSynthesis.getVoices();

if (!availableVoices.length) {

    conversationVoiceStatus.textContent =
        "Waiting for the device voices...";

    return;
}

/*
   We do NOT require an American voice.

   First preference:
   any English voice.

   If there isn't one:
   use whatever voice the device provides.
*/

const englishVoices =
    availableVoices.filter(
        voice =>
            voice.lang &&
            voice.lang
                .toLowerCase()
                .startsWith("en")
    );

const selected =
    englishVoices[0] ||
    availableVoices[0];

if (selected) {

    conversationVoiceStatus.textContent =
        `Voice ready: ${selected.name}`;
}

}

if ("speechSynthesis" in window) {

window.speechSynthesis.onvoiceschanged =
    loadDeviceVoices;

}

loadDeviceVoices();

/* =========================================================
SPEECH UNLOCK
========================================================= */

function unlockSpeech() {

if (!("speechSynthesis" in window)) {
    return;
}

if (speechUnlocked) return;

try {

    /*
       A silent utterance helps some mobile
       browsers initialize their speech engine
       after a user gesture.
    */

    const unlock =
        new SpeechSynthesisUtterance("");

    unlock.volume = 0;

    window.speechSynthesis.speak(
        unlock
    );

    speechUnlocked = true;

} catch (error) {

    console.warn(
        "Speech unlock failed:",
        error
    );
}

}

/* =========================================================
SELECT ANY ENGLISH VOICE
========================================================= */

function getEnglishVoice() {

if (!availableVoices.length) {

    availableVoices =
        window.speechSynthesis
            ?.getVoices() || [];
}

const english =
    availableVoices.filter(
        voice =>
            voice.lang &&
            voice.lang
                .toLowerCase()
                .startsWith("en")
    );

/*
   Any English voice is acceptable.
   We don't force en-US.
*/

return (
    english[0] ||
    availableVoices[0] ||
    null
);

}

/* =========================================================
CONVERSATION SPEECH RECOGNITION
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
    async event => {

        const transcript =
            event.results[0][0]
                .transcript
                .trim();

        conversationListening = false;

        if (!transcript) {

            setConversationState(
                "idle"
            );

            return;
        }

        conversationText.textContent =
            transcript;

        await processConversationMessage(
            transcript
        );
    };


conversationRecognition.onerror =
    event => {

        console.error(
            "Speech recognition:",
            event.error
        );

        conversationListening = false;

        setConversationState(
            "idle"
        );

        if (
            event.error ===
            "not-allowed"
        ) {

            conversationText.textContent =
                "Microphone permission was denied.";

        } else {

            conversationText.textContent =
                "I couldn't hear that. Tap the microphone again.";
        }
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
   Conversation Mode is intentionally
   available on phones and iPads.
*/

if (!conversationMode) return;

unlockSpeech();

conversationMode.classList.add("active");

conversationMode.setAttribute(
    "aria-hidden",
    "false"
);

document.body.classList.add(
    "conversation-open"
);

loadDeviceVoices();

showConversationChoice();

}

conversationButton?.addEventListener(
"click",
openConversationMode
);

/* =========================================================
NEW / OLD CHOICE
========================================================= */

function showConversationChoice() {

const saved =
    getSavedConversations();

if (!saved.length) {

    conversationChoice.hidden = true;

    startConversationSession();

    return;
}

conversationChoice.hidden = false;

}

continueConversation?.addEventListener(
"click",
() => {

    conversationChoice.hidden = true;

    const saved =
        getSavedConversations();

    if (saved.length) {

        currentConversation =
            saved[0].messages || [];

        restoreConversationToScreen();
    }

    startConversationSession(
        false
    );
}

);

newConversation?.addEventListener(
"click",
() => {

    conversationChoice.hidden = true;

    currentConversation = [];

    startConversationSession(
        true
    );
}

);

function startConversationSession(
newSession = false
) {

if (newSession) {

    currentConversation = [];
}

setConversationState(
    "idle"
);

loadDeviceVoices();

}

/* =========================================================
CLOSE CONVERSATION
========================================================= */

function closeConversationMode() {

stopConversationListening();

if ("speechSynthesis" in window) {

    window.speechSynthesis.cancel();
}

conversationSpeaking = false;

saveCurrentConversation();

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

conversationChoice.hidden = true;

conversationHistory.hidden = true;

setConversationState(
    "idle"
);

}

conversationClose?.addEventListener(
"click",
closeConversationMode
);

/* =========================================================
STATE
========================================================= */

function setConversationState(state) {

if (!moonOrb) return;

moonOrb.classList.remove(
    "listening",
    "thinking",
    "talking"
);

conversationMic?.classList.remove(
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

        conversationMic.textContent = "";

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
            "MoonPlug is thinking...";

        conversationMic.innerHTML =
            getMicSVG();

        break;


    case "talking":

        moonOrb.classList.add(
            "talking"
        );

        conversationStatus.textContent =
            "MoonPlug is talking...";

        conversationText.textContent =
            "MoonPlug is speaking";

        conversationMic.innerHTML =
            getMicSVG();

        break;


    default:

        conversationStatus.textContent =
            "Ready";

        conversationText.textContent =
            "Tap the microphone to talk";

        conversationMic.innerHTML =
            getMicSVG();

        break;
}

}

/* =========================================================
CUSTOM MIC SVG
========================================================= */

function getMicSVG() {

return `
    <svg
        class="mic-svg"
        viewBox="0 0 64 64"
        aria-hidden="true"
    >

        <rect
            x="23"
            y="7"
            width="18"
            height="34"
            rx="9"
        ></rect>

        <path
            d="M15 30v3c0 10 7.5 18 17 18s17-8 17-18v-3"
        ></path>

        <path d="M32 51v8"></path>

        <path d="M23 59h18"></path>

    </svg>
`;

}

/* =========================================================
LISTENING
========================================================= */

function toggleConversationListening() {

unlockSpeech();

if (!conversationRecognition) {

    conversationStatus.textContent =
        "Microphone unavailable";

    conversationText.textContent =
        "This browser does not support speech recognition.";

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

function startConversationListening() {

if (!conversationRecognition) return;

unlockSpeech();

try {

    conversationRecognition.start();

} catch (error) {

    console.log(
        "Recognition could not start:",
        error
    );
}

}

function stopConversationListening() {

conversationListening = false;

if (!conversationRecognition) return;

try {

    conversationRecognition.stop();

} catch {}

}

/* =========================================================
SEND SPOKEN MESSAGE TO ACTUAL AI
========================================================= */

async function processConversationMessage(
transcript
) {

stopConversationListening();

setConversationState(
    "thinking"
);

addConversationMessage(
    transcript,
    "user"
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
        await response
            .json()
            .catch(() => ({}));

    if (!response.ok) {

        throw new Error(
            data.error ||
            "AI request failed"
        );
    }

    const reply =
        data.response ||
        data.message ||
        data.answer ||
        "I received your message.";

    addConversationMessage(
        String(reply),
        "ai"
    );

    conversationText.textContent =
        String(reply);

    saveCurrentConversation();

    /*
       THIS is the important part:
       the actual AI response is passed
       into the device's speech engine.
    */

    speakConversation(
        String(reply)
    );

} catch (error) {

    console.error(
        "Conversation AI error:",
        error
    );

    conversationSpeaking = false;

    setConversationState(
        "idle"
    );

    conversationText.textContent =
        "I couldn't connect to MoonPlug right now.";
}

}

/* =========================================================
ADD CONVERSATION MESSAGE
========================================================= */

function addConversationMessage(
text,
role
) {

currentConversation.push({
    role,
    text: String(text),
    time: Date.now()
});

}

/* =========================================================
DEVICE TEXT TO SPEECH
========================================================= */

function speakConversation(text) {

if (!conversationVoiceEnabled) {

    setConversationState(
        "idle"
    );

    return;
}

if (!("speechSynthesis" in window)) {

    conversationVoiceStatus.textContent =
        "No device voice is available.";

    setConversationState(
        "idle"
    );

    return;
}

unlockSpeech();

window.speechSynthesis.cancel();

/*
   Give mobile browsers a tiny moment
   after cancelling the previous utterance.
*/

setTimeout(() => {

    const voice =
        getEnglishVoice();

    const utterance =
        new SpeechSynthesisUtterance(
            text
        );

    /*
       Use ANY English voice available.
       We do not require American English.
    */

    if (voice) {

        utterance.voice = voice;

        conversationVoiceStatus.textContent =
            `Speaking with ${voice.name}`;
    } else {

        conversationVoiceStatus.textContent =
            "Using the device's default voice.";
    }

    utterance.lang =
        voice?.lang || "en-US";

    utterance.rate = 1;

    utterance.pitch = 1;

    utterance.volume = 1;

    conversationSpeaking = true;

    setConversationState(
        "talking"
    );


    utterance.onstart =
        () => {

            conversationSpeaking =
                true;

            setConversationState(
                "talking"
            );
        };


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
        event => {

            console.error(
                "Speech synthesis error:",
                event
            );

            conversationSpeaking =
                false;

            conversationVoiceStatus.textContent =
                "The device could not play the voice.";

            setConversationState(
                "idle"
            );
        };


    window.speechSynthesis.speak(
        utterance
    );

}, 100);

}

/* =========================================================
SPEAKER BUTTON
========================================================= */

conversationSpeaker?.addEventListener(
"click",
() => {

    unlockSpeech();

    conversationVoiceEnabled =
        !conversationVoiceEnabled;

    conversationSpeaker.classList.toggle(
        "muted",
        !conversationVoiceEnabled
    );

    if (!conversationVoiceEnabled) {

        window.speechSynthesis?.cancel();

        conversationSpeaking = false;

        conversationVoiceStatus.textContent =
            "Voice muted";

    } else {

        loadDeviceVoices();

        conversationVoiceStatus.textContent =
            "Voice enabled";
    }
}

);

/* =========================================================
SAVE CONVERSATIONS
========================================================= */

function getSavedConversations() {

try {

    return JSON.parse(
        localStorage.getItem(
            "moonplug-conversations"
        ) || "[]"
    );

} catch {

    return [];
}

}

function saveCurrentConversation() {

if (!currentConversation.length) {
    return;
}

let saved =
    getSavedConversations();

const conversation = {
    id: Date.now(),
    created: Date.now(),
    messages: currentConversation
};

/*
   Keep newest conversation first.
*/

saved.unshift(
    conversation
);

/*
   Keep the last 20.
*/

saved =
    saved.slice(0, 20);

localStorage.setItem(
    "moonplug-conversations",
    JSON.stringify(saved)
);

}

/* =========================================================
RESTORE CONVERSATION
========================================================= */

function restoreConversationToScreen() {

conversationText.textContent =
    "Previous conversation restored.";

/*
   The saved conversation remains inside
   currentConversation and will continue
   being used for the Conversation Mode
   session.
*/

const last =
    currentConversation[
        currentConversation.length - 1
    ];

if (last) {

    conversationText.textContent =
        last.text;
}

}

/* =========================================================
HISTORY
========================================================= */

conversationHistoryButton?.addEventListener(
"click",
() => {

    renderConversationHistory();

    conversationHistory.hidden =
        false;
}

);

closeConversationHistory?.addEventListener(
"click",
() => {

    conversationHistory.hidden =
        true;
}

);

function renderConversationHistory() {

const saved =
    getSavedConversations();

conversationHistoryList.innerHTML = "";

if (!saved.length) {

    conversationHistoryList.innerHTML =
        `
            <div class="history-empty">
                No saved conversations yet.
            </div>
        `;

    return;
}

saved.forEach(
    (conversation, index) => {

        const button =
            document.createElement(
                "button"
            );

        button.className =
            "history-item";

        const firstUserMessage =
            conversation.messages.find(
                message =>
                    message.role === "user"
            );

        const title =
            firstUserMessage?.text ||
            "Conversation";

        const date =
            new Date(
                conversation.created
            ).toLocaleString();

        button.innerHTML = `
            <strong>
                ${escapeHTML(
                    title.slice(0, 60)
                )}
            </strong>

            <small>
                ${escapeHTML(date)}
            </small>
        `;

        button.addEventListener(
            "click",
            () => {

                currentConversation =
                    conversation.messages || [];

                conversationHistory.hidden =
                    true;

                conversationText.textContent =
                    "Conversation restored.";

                setTimeout(() => {

                    const last =
                        currentConversation[
                            currentConversation.length - 1
                        ];

                    if (last) {

                        conversationText.textContent =
                            last.text;
                    }

                }, 500);
            }
        );

        conversationHistoryList.appendChild(
            button
        );
    }
);

}

/* =========================================================
ESCAPE HTML
========================================================= */

function escapeHTML(value) {

return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}

/* =========================================================
ESCAPE KEY
========================================================= */

document.addEventListener(
"keydown",
event => {

    if (event.key !== "Escape") {
        return;
    }

    if (
        conversationMode?.classList.contains(
            "active"
        )
    ) {

        closeConversationMode();

        return;
    }

    if (
        settingsPanel?.style.display ===
        "flex"
    ) {

        closeSettings();

        return;
    }

    if (
        ownerLogin?.style.display ===
        "flex"
    ) {

        hideOwnerLogin();
    }
}

);

/* =========================================================
RESIZE
========================================================= */

window.addEventListener(
"resize",
() => {

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

loadDeviceVoices();

/*
   Make sure the custom microphone
   icon is present.
*/

if (conversationMic) {

    conversationMic.innerHTML =
        getMicSVG();
}

console.log(
    "MoonPlug AI initialized."
);

}

initializeMoonPlug();
