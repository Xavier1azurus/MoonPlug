/* =========================================================
   MOONPLUG AI
   COMPLETE JAVASCRIPT
========================================================= */

const API_BASE = "https://moonplug.onrender.com";

const $ = id => document.getElementById(id);


/* =========================================================
   ELEMENTS
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
const conversationButton = $("conversationButton");
const conversationClose = $("conversationClose");
const conversationMic = $("conversationMic");
const conversationStatus = $("conversationStatus");
const conversationText = $("conversationText");
const moonOrb = $("moonOrb");

let conversationListening = false;
let conversationSpeaking = false;
let conversationRecognition = null;


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
   NEW CHAT
========================================================= */

function startNewChat() {

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

function addMessage(
    text,
    type = "ai"
) {

    const empty =
        $("emptyChat");

    if (empty) {
        empty.remove();
    }

    const bubble =
        document.createElement("div");

    bubble.className =
        `message-bubble ${type}`;

    bubble.textContent =
        text;

    messages.appendChild(
        bubble
    );

    messages.scrollTop =
        messages.scrollHeight;

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
   CHAT API
========================================================= */

async function askMoonPlug(text) {

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
        await response.json()
            .catch(() => ({}));

    if (!response.ok) {

        throw new Error(
            data.error ||
            "MoonPlug request failed."
        );
    }

    return String(
        data.response ||
        data.message ||
        data.answer ||
        "MoonPlug received your message."
    );
}


/* =========================================================
   NORMAL CHAT
========================================================= */

async function sendMessage() {

    const text =
        messageInput.value.trim();

    if (!text) return;

    addMessage(
        text,
        "user"
    );

    messageInput.value = "";

    autoResizeInput();

    sendButton.disabled =
        true;

    showTyping();

    try {

        const reply =
            await askMoonPlug(
                text
            );

        hideTyping();

        addMessage(
            reply,
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

        sendButton.disabled =
            false;

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
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            const value =
                messageInput.value.trim();

            /*
                Hidden owner trigger.
            */

            if (
                value ===
                "moonplug-owner"
            ) {

                messageInput.value = "";

                showOwnerLogin();

                return;
            }

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

    settingsPanel.style.display =
        "flex";

    settingsPanel.setAttribute(
        "aria-hidden",
        "false"
    );
}

function closeSettings() {

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
    event => {

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

        themeButton.textContent =
            "Light";

    } else {

        document.body.classList.remove(
            "light-theme"
        );

        themeButton.textContent =
            "Dark";
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

    themeButton.textContent =
        light
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

    const size =
        localStorage.getItem(
            "moonplug-text-size"
        ) || "medium";

    updateTextSize(size);
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

loginTab?.addEventListener(
    "click",
    () => {

        loginTab.classList.add(
            "active"
        );

        signupTab.classList.remove(
            "active"
        );

        loginForm.hidden =
            false;

        signupForm.hidden =
            true;

        accountMessage.textContent =
            "";
    }
);

signupTab?.addEventListener(
    "click",
    () => {

        signupTab.classList.add(
            "active"
        );

        loginTab.classList.remove(
            "active"
        );

        loginForm.hidden =
            true;

        signupForm.hidden =
            false;

        accountMessage.textContent =
            "";
    }
);


/* =========================================================
   ACCOUNT FORMS
========================================================= */

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

        if (
            password !== confirm
        ) {

            accountMessage.textContent =
                "Passwords do not match.";

            return;
        }

        accountMessage.textContent =
            "Account creation can be connected to the MoonPlug backend.";
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

    ownerCode.value =
        "";

    ownerError.textContent =
        "";

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

ownerCancel?.addEventListener(
    "click",
    hideOwnerLogin
);

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


/* =========================================================
   OWNER LOGIN API
========================================================= */

async function loginOwner() {

    const code =
        ownerCode.value.trim();

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

                    credentials:
                        "include",

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

        console.error(error);

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
    event => {

        if (
            event.key === "Enter"
        ) {

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
            data.users !== undefined
        ) {

            ownerUsers.textContent =
                data.users;
        }

        if (
            data.chats !== undefined
        ) {

            ownerChats.textContent =
                data.chats;
        }

    } catch (error) {

        console.error(
            "Dashboard:",
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

/*
   IMPORTANT:

   Conversation Mode uses the DEVICE.

   Microphone:
   SpeechRecognition / webkitSpeechRecognition

   Voice:
   speechSynthesis / SpeechSynthesisUtterance

   AI:
   MoonPlug /api/chat
*/


const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


/* =========================================================
   CREATE SPEECH RECOGNITION
========================================================= */

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

            conversationListening =
                true;

            setConversationState(
                "listening"
            );
        };


    conversationRecognition.onresult =
        async event => {

            const transcript =
                event
                    .results[0][0]
                    .transcript
                    .trim();

            conversationListening =
                false;

            if (!transcript) {

                setConversationState(
                    "idle"
                );

                return;
            }

            conversationText.textContent =
                `"${transcript}"`;

            await processConversationMessage(
                transcript
            );
        };


    conversationRecognition.onerror =
        event => {

            console.error(
                "Speech recognition error:",
                event.error
            );

            conversationListening =
                false;

            setConversationState(
                "idle"
            );

            if (
                event.error ===
                "not-allowed"
            ) {

                conversationStatus.textContent =
                    "Microphone permission needed";

                conversationText.textContent =
                    "Allow microphone access, then try again.";

            } else {

                conversationStatus.textContent =
                    "Microphone unavailable";

                conversationText.textContent =
                    "Tap the microphone to try again.";
            }
        };


    conversationRecognition.onend =
        () => {

            conversationListening =
                false;

            if (
                !conversationSpeaking &&
                conversationMode.classList.contains(
                    "active"
                )
            ) {

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

    conversationSpeaking =
        false;

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

            conversationMic.classList.remove(
                "active"
            );

            break;


        case "talking":

            moonOrb.classList.add(
                "talking"
            );

            conversationStatus.textContent =
                "MoonPlug is talking...";

            conversationText.textContent =
                "Speaking";

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

            conversationMic.classList.remove(
                "active"
            );
    }
}


/* =========================================================
   TOGGLE MICROPHONE
========================================================= */

function toggleConversationListening() {

    /*
       If MoonPlug is currently speaking,
       pressing the microphone stops it.
    */

    if (conversationSpeaking) {

        if (
            window.speechSynthesis
        ) {

            window.speechSynthesis.cancel();
        }

        conversationSpeaking =
            false;

        setConversationState(
            "idle"
        );

        return;
    }


    if (!conversationRecognition) {

        conversationStatus.textContent =
            "Speech recognition unavailable";

        conversationText.textContent =
            "This browser does not support microphone speech recognition.";

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
   START MICROPHONE
========================================================= */

function startConversationListening() {

    if (
        !conversationRecognition
    ) return;

    /*
       Make sure old speech is stopped.
    */

    if (
        window.speechSynthesis
    ) {

        window.speechSynthesis.cancel();
    }

    conversationSpeaking =
        false;

    try {

        conversationRecognition.start();

    } catch (error) {

        console.log(
            "Recognition already running."
        );
    }
}


/* =========================================================
   STOP MICROPHONE
========================================================= */

function stopConversationListening() {

    conversationListening =
        false;

    if (
        !conversationRecognition
    ) return;

    try {

        conversationRecognition.stop();

    } catch {}
}


/* =========================================================
   SPEECH → AI
========================================================= */

async function processConversationMessage(
    transcript
) {

    stopConversationListening();

    setConversationState(
        "thinking"
    );

    /*
       Put user's speech into normal chat.
    */

    addMessage(
        transcript,
        "user"
    );

    try {

        /*
           THIS IS THE SAME MOONPLUG AI
           USED BY NORMAL CHAT.
        */

        const reply =
            await askMoonPlug(
                transcript
            );

        /*
           Put AI response into normal chat.
        */

        addMessage(
            reply,
            "ai"
        );

        /*
           NOW ACTUALLY SPEAK IT.
        */

        await speakConversation(
            reply
        );

    } catch (error) {

        console.error(
            "Conversation AI error:",
            error
        );

        conversationSpeaking =
            false;

        setConversationState(
            "idle"
        );

        conversationText.textContent =
            "MoonPlug couldn't connect right now.";
    }
}


/* =========================================================
   DEVICE TEXT TO SPEECH
========================================================= */

function speakConversation(text) {

    return new Promise(resolve => {

        if (
            !window.speechSynthesis ||
            !("SpeechSynthesisUtterance" in window)
        ) {

            console.warn(
                "Device speech synthesis unavailable."
            );

            setConversationState(
                "idle"
            );

            resolve();

            return;
        }


        /*
           Stop any previous speech.
        */

        window.speechSynthesis.cancel();


        const utterance =
            new SpeechSynthesisUtterance(
                text
            );


        /*
           DEVICE VOICE

           We deliberately DO NOT download
           or use a separate voice.

           The browser/device chooses its
           installed speech voice.
        */

        utterance.lang =
            "en-US";

        utterance.rate =
            1;

        utterance.pitch =
            1;

        utterance.volume =
            1;


        /*
           Try to select an English voice
           already installed on the device.
        */

        const voices =
            window.speechSynthesis.getVoices();

        const englishVoice =
            voices.find(
                voice =>
                    voice.lang
                        ?.toLowerCase()
                        .startsWith("en-us")
            ) ||
            voices.find(
                voice =>
                    voice.lang
                        ?.toLowerCase()
                        .startsWith("en")
            );

        if (englishVoice) {

            utterance.voice =
                englishVoice;
        }


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
                    conversationMode.classList.contains(
                        "active"
                    )
                ) {

                    setConversationState(
                        "idle"
                    );
                }

                resolve();
            };


        utterance.onerror =
            error => {

                console.error(
                    "Device speech error:",
                    error
                );

                conversationSpeaking =
                    false;

                setConversationState(
                    "idle"
                );

                resolve();
            };


        window.speechSynthesis.speak(
            utterance
        );

    });
}


/* =========================================================
   LOAD DEVICE VOICES
========================================================= */

if (
    window.speechSynthesis
) {

    /*
       Some browsers load their voices
       asynchronously.
    */

    window.speechSynthesis.onvoiceschanged =
        () => {

            window.speechSynthesis
                .getVoices();
        };
}


/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) return;


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
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    createStars
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

    console.log(
        "Conversation Mode loaded."
    );

    console.log(
        "Device speech recognition:",
        Boolean(SpeechRecognition)
    );

    console.log(
        "Device speech synthesis:",
        Boolean(window.speechSynthesis)
    );
}

initializeMoonPlug();
