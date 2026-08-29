
/* =========================================================
   MOONPLUG AI
   COMPLETE JAVASCRIPT
   - Chat
   - Sidebar
   - Settings
   - Account
   - Hidden Owner Login
   - Owner Panel
   - Conversation Mode
   - Device Speech Recognition
   - Device English Text-to-Speech
   - Conversation Storage
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const API_BASE = "https://moonplug.onrender.com";


/* =========================================================
   DOM HELPER
========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   MAIN ELEMENTS
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
   CONVERSATION MODE ELEMENTS
========================================================= */

const conversationMode = $("conversationMode");
const conversationClose = $("conversationClose");
const conversationMic = $("conversationMic");
const conversationStatus = $("conversationStatus");
const conversationText = $("conversationText");
const moonOrb = $("moonOrb");


/*
   The sidebar button can have this ID:

       conversationButton

   If it doesn't exist yet, this script does not crash.
*/

const conversationButton = $("conversationButton");


/* =========================================================
   CONVERSATION VARIABLES
========================================================= */

let conversationRecognition = null;

let conversationListening = false;
let conversationSpeaking = false;

let speechVoices = [];

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
            `${Math.random() * 0.6 + 0.25}`
        );

        star.style.setProperty(
            "--star-scale",
            `${Math.random() * 0.7 + 0.6}`
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
            `${(Math.random() - 0.5) * 12}px`
        );

        star.style.setProperty(
            "--star-move-y",
            `${(Math.random() - 0.5) * 12}px`
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

    } else {

        sidebar.classList.toggle("collapsed");
    }
}


sidebarLogo?.addEventListener(
    "click",
    toggleSidebar
);


sidebarLogo?.addEventListener(
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


/* =========================================================
   NORMAL CHAT
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

    currentConversation = [];

    saveConversation();

    messageInput.focus();
}


$("newChatButton")?.addEventListener(
    "click",
    startNewChat
);


/* =========================================================
   ADD MESSAGE
========================================================= */

function addMessage(
    text,
    type = "ai",
    save = true
) {

    if (!messages) return null;

    const emptyChat =
        $("emptyChat");

    if (emptyChat) {
        emptyChat.remove();
    }

    const bubble =
        document.createElement("div");

    bubble.className =
        `message-bubble ${type}`;

    bubble.textContent =
        String(text);

    messages.appendChild(
        bubble
    );

    messages.scrollTop =
        messages.scrollHeight;


    if (save) {

        currentConversation.push({
            role:
                type === "user"
                    ? "user"
                    : "assistant",

            content:
                String(text),

            time:
                Date.now()
        });

        saveConversation();
    }

    return bubble;
}


/* =========================================================
   TYPING
========================================================= */

function showTyping() {

    if (!typing) return;

    typing.style.display =
        "block";
}


function hideTyping() {

    if (!typing) return;

    typing.style.display =
        "none";
}


/* =========================================================
   NORMAL CHAT → AI
========================================================= */

async function sendMessage() {

    if (!messageInput) return;

    const text =
        messageInput.value.trim();

    if (!text) return;


    /*
       Hidden owner trigger
    */

    if (text === "15912014") {

        messageInput.value = "";

        autoResizeInput();

        showOwnerLogin();

        return;
    }


    addMessage(
        text,
        "user"
    );

    messageInput.value = "";

    autoResizeInput();

    if (sendButton) {
        sendButton.disabled = true;
    }

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
            "MoonPlug received your message.";


        hideTyping();


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

        if (sendButton) {
            sendButton.disabled = false;
        }

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

    messageInput.style.height =
        "auto";

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

    settingsPanel.style.display =
        "flex";

    settingsPanel.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeSettings() {

    if (!settingsPanel) return;

    settingsPanel.style.display =
        "none";

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
            event.target ===
            settingsPanel
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


    if (themeButton) {

        themeButton.textContent =
            isLight
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

    const validSizes = [
        "small",
        "medium",
        "large"
    ];

    if (
        !validSizes.includes(size)
    ) {
        size = "medium";
    }


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
        .querySelectorAll(
            ".size-button"
        )
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
    .querySelectorAll(
        ".size-button"
    )
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

    if (!accountScreen) return;

    accountScreen.style.display =
        "flex";

    accountScreen.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeAccountScreen() {

    if (!accountScreen) return;

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

    loginTab?.classList.add(
        "active"
    );

    signupTab?.classList.remove(
        "active"
    );

    if (loginForm)
        loginForm.hidden = false;

    if (signupForm)
        signupForm.hidden = true;

    if (accountMessage)
        accountMessage.textContent = "";
}


function showSignupTab() {

    signupTab?.classList.add(
        "active"
    );

    loginTab?.classList.remove(
        "active"
    );

    if (loginForm)
        loginForm.hidden = true;

    if (signupForm)
        signupForm.hidden = false;

    if (accountMessage)
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

        if (accountMessage) {

            accountMessage.textContent =
                "Account login can be connected to the MoonPlug backend here.";
        }
    }
);


signupForm?.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        const password =
            $("signupPassword")?.value;

        const confirm =
            $("signupConfirm")?.value;


        if (
            password !== confirm
        ) {

            accountMessage.textContent =
                "Passwords do not match.";

            return;
        }


        accountMessage.textContent =
            "Account creation can be connected to the MoonPlug backend here.";
    }
);


/* =========================================================
   HIDDEN OWNER LOGIN
========================================================= */

function showOwnerLogin() {

    if (!ownerLogin) return;

    ownerLogin.style.display =
        "flex";

    ownerLogin.setAttribute(
        "aria-hidden",
        "false"
    );

    if (ownerCode) {

        ownerCode.value = "";

        ownerCode.focus();
    }

    if (ownerError) {
        ownerError.textContent = "";
    }
}


function hideOwnerLogin() {

    if (!ownerLogin) return;

    ownerLogin.style.display =
        "none";

    ownerLogin.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   OWNER CODE
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
        ownerCode?.value.trim();


    if (!code) {

        ownerError.textContent =
            "Enter the owner code.";

        return;
    }


    ownerLoginButton.disabled =
        true;

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

        console.error(
            "Owner login:",
            error
        );

        ownerError.textContent =
            "Unable to connect to MoonPlug.";
    }


    ownerLoginButton.disabled =
        false;
}


ownerLoginButton?.addEventListener(
    "click",
    loginOwner
);


ownerCode?.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            loginOwner();
        }
    }
);


/* =========================================================
   OWNER PANEL
========================================================= */

function openOwnerPanel() {

    if (!ownerPanel) return;

    ownerPanel.style.display =
        "flex";

    ownerPanel.setAttribute(
        "aria-hidden",
        "false"
    );

    loadOwnerDashboard();
}


function closeOwnerPanel() {

    if (!ownerPanel) return;

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
            await response
                .json()
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
   CONVERSATION STORAGE
========================================================= */

function saveConversation() {

    try {

        localStorage.setItem(
            "moonplug-conversation",
            JSON.stringify(
                currentConversation
            )
        );

    } catch (error) {

        console.error(
            "Conversation save error:",
            error
        );
    }
}


function loadConversation() {

    try {

        const saved =
            localStorage.getItem(
                "moonplug-conversation"
            );


        if (!saved) return;


        const parsed =
            JSON.parse(saved);


        if (
            !Array.isArray(parsed) ||
            parsed.length === 0
        ) {
            return;
        }


        currentConversation =
            parsed;


        parsed.forEach(
            message => {

                if (
                    !message ||
                    !message.content
                ) {
                    return;
                }


                addMessage(
                    message.content,
                    message.role === "user"
                        ? "user"
                        : "ai",
                    false
                );
            }
        );

    } catch (error) {

        console.error(
            "Conversation load error:",
            error
        );
    }
}


/* =========================================================
   SPEECH VOICES
========================================================= */

function loadSpeechVoices() {

    if (!window.speechSynthesis) {
        return;
    }


    speechVoices =
        window.speechSynthesis
            .getVoices();


    console.log(
        "Available device voices:",
        speechVoices
    );
}


if (
    window.speechSynthesis
) {

    loadSpeechVoices();

    window.speechSynthesis
        .onvoiceschanged =
        loadSpeechVoices;
}


/* =========================================================
   FIND ENGLISH DEVICE VOICE
========================================================= */

function getEnglishVoice() {

    if (!speechVoices.length) {

        speechVoices =
            window.speechSynthesis
                .getVoices();
    }


    if (!speechVoices.length) {
        return null;
    }


    /*
       Prefer US English.
    */

    const american =
        speechVoices.find(
            voice =>
                /^en-US$/i.test(
                    voice.lang
                )
        );


    if (american) {
        return american;
    }


    /*
       Then any English voice.
    */

    const english =
        speechVoices.find(
            voice =>
                /^en(-|_)/i.test(
                    voice.lang
                )
        );


    if (english) {
        return english;
    }


    /*
       Last fallback:
       first available device voice.
    */

    return speechVoices[0];
}


/* =========================================================
   UNLOCK SPEECH
========================================================= */

function unlockSpeech() {

    if (
        !window.speechSynthesis
    ) {
        return;
    }


    /*
       Some browsers require speech
       to be initiated after a user
       interaction.
    */

    try {

        const unlock =
            new SpeechSynthesisUtterance(
                ""
            );

        unlock.volume = 0;

        window.speechSynthesis.speak(
            unlock
        );

        speechUnlocked = true;

    } catch (error) {

        console.error(
            "Speech unlock:",
            error
        );
    }
}


/* =========================================================
   SPEAK TEXT
========================================================= */

function speakConversation(text) {

    if (
        !window.speechSynthesis
    ) {

        conversationStatus.textContent =
            "Speech isn't supported";

        conversationText.textContent =
            text;

        return;
    }


    if (!text) return;


    window.speechSynthesis.cancel();


    const voice =
        getEnglishVoice();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    /*
       Device English voice.
    */

    if (voice) {

        utterance.voice =
            voice;

        utterance.lang =
            voice.lang || "en-US";

    } else {

        utterance.lang =
            "en-US";
    }


    utterance.rate =
        1;

    utterance.pitch =
        1;

    utterance.volume =
        1;


    conversationSpeaking =
        true;


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
                conversationMode?.classList.contains(
                    "active"
                )
            ) {

                setConversationState(
                    "idle"
                );
            }
        };


    utterance.onerror =
        (event) => {

            console.error(
                "Speech synthesis error:",
                event
            );

            conversationSpeaking =
                false;

            if (
                conversationMode?.classList.contains(
                    "active"
                )
            ) {

                setConversationState(
                    "idle"
                );
            }
        };


    window.speechSynthesis.speak(
        utterance
    );
}


/* =========================================================
   CONVERSATION MODE
========================================================= */

function openConversationMode() {

    if (!conversationMode) {
        return;
    }


    /*
       Conversation Mode is designed
       for iPhone/iPad/mobile.
    */

    if (
        window.innerWidth > 1200
    ) {

        console.log(
            "Conversation Mode is mobile/tablet focused."
        );

        /*
           We don't block it completely.
           This also makes desktop testing possible.
        */
    }


    unlockSpeech();


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


/*
   IMPORTANT:
   Only ONE listener is attached
   to the sidebar Conversation button.
*/

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


    conversationSpeaking =
        false;


    conversationMode?.classList.remove(
        "active"
    );


    conversationMode?.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "conversation-open"
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

            if (conversationMic) {

                conversationMic.textContent =
                    "●";

                conversationMic.classList.add(
                    "active"
                );
            }

            break;


        case "thinking":

            moonOrb.classList.add(
                "thinking"
            );

            conversationStatus.textContent =
                "Thinking...";

            conversationText.textContent =
                "MoonPlug is thinking";

            if (conversationMic) {

                conversationMic.textContent =
                    "🎙";
            }

            break;


        case "talking":

            moonOrb.classList.add(
                "talking"
            );

            conversationStatus.textContent =
                "MoonPlug is talking...";

            if (conversationMic) {

                conversationMic.textContent =
                    "🔊";
            }

            break;


        default:

            conversationStatus.textContent =
                "Ready";

            conversationText.textContent =
                "Tap the microphone to talk";

            if (conversationMic) {

                conversationMic.textContent =
                    "🎙";
            }
    }
}


/* =========================================================
   SPEECH RECOGNITION
========================================================= */

function setupSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        console.warn(
            "Speech recognition is not supported by this browser."
        );

        return;
    }


    conversationRecognition =
        new SpeechRecognition();


    conversationRecognition.continuous =
        false;


    conversationRecognition.interimResults =
        false;


    /*
       English recognition.
    */

    conversationRecognition.lang =
        "en-US";


    conversationRecognition.onstart =
        () => {

            conversationListening =
                true;

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
        (event) => {

            console.error(
                "Speech recognition error:",
                event.error
            );


            conversationListening =
                false;


            if (
                event.error ===
                "not-allowed"
            ) {

                conversationStatus.textContent =
                    "Microphone permission needed";

                conversationText.textContent =
                    "Allow microphone access and try again.";

            } else {

                setConversationState(
                    "idle"
                );
            }
        };


    conversationRecognition.onend =
        () => {

            conversationListening =
                false;


            if (
                !conversationSpeaking &&
                conversationMode?.classList.contains(
                    "active"
                )
            ) {

                setConversationState(
                    "idle"
                );
            }
        };
}


setupSpeechRecognition();


/* =========================================================
   TOGGLE MICROPHONE
========================================================= */

function toggleConversationListening() {

    unlockSpeech();


    if (!conversationRecognition) {

        conversationStatus.textContent =
            "Speech recognition unavailable";

        conversationText.textContent =
            "Your browser does not support voice input.";

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

    if (!conversationRecognition) {
        return;
    }


    if (
        conversationSpeaking &&
        window.speechSynthesis
    ) {

        window.speechSynthesis.cancel();

        conversationSpeaking =
            false;
    }


    try {

        conversationRecognition.start();

    } catch (error) {

        console.log(
            "Recognition start:",
            error
        );
    }
}


/* =========================================================
   STOP LISTENING
========================================================= */

function stopConversationListening() {

    if (!conversationRecognition) {
        return;
    }


    conversationListening =
        false;


    try {

        conversationRecognition.stop();

    } catch {}
}


/* =========================================================
   CONVERSATION → AI
========================================================= */

async function processConversationMessage(
    transcript
) {

    stopConversationListening();


    /*
       Save user's voice message.
    */

    currentConversation.push({
        role: "user",
        content: transcript,
        time: Date.now()
    });


    saveConversation();


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
            await response
                .json()
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


        const cleanReply =
            String(reply);


        /*
           Save AI response.
        */

        currentConversation.push({
            role: "assistant",
            content: cleanReply,
            time: Date.now()
        });


        saveConversation();


        /*
           Add both messages to
           normal chat.
        */

        addMessage(
            transcript,
            "user",
            false
        );


        addMessage(
            cleanReply,
            "ai",
            false
        );


        /*
           Display AI response.
        */

        conversationText.textContent =
            cleanReply;


        /*
           SPEAK IT.
        */

        speakConversation(
            cleanReply
        );


    } catch (error) {

        console.error(
            "Conversation mode error:",
            error
        );


        conversationSpeaking =
            false;


        setConversationState(
            "idle"
        );


        conversationText.textContent =
            "I couldn't connect to MoonPlug right now.";
    }
}


/* =========================================================
   KEYBOARD ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key !== "Escape"
        ) {
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

        /*
           Don't leave the Conversation Mode
           open if the window becomes tiny/invalid.
        */
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

    /*
       Load previous conversation.
    */

    loadConversation();


    console.log(
        "MoonPlug AI initialized."
    );
}


initializeMoonPlug();


