/* =========================================================
   MOONPLUG AI
   COMPLETE JAVASCRIPT
   DEVICE MICROPHONE + DEVICE VOICE
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const API_BASE = "https://moonplug.onrender.com";

const $ = (id) => document.getElementById(id);


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

        const star =
            document.createElement("span");

        star.className =
            "random-star";

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
   ADD MESSAGE
========================================================= */

function addMessage(text, type = "ai") {

    if (!messages) return;

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
        String(text);

    messages.appendChild(
        bubble
    );

    messages.scrollTop =
        messages.scrollHeight;

    return bubble;
}


/* =========================================================
   THINKING
========================================================= */

function showTyping() {

    if (!typing) return;

    typing.style.display =
        "block";

    messages.scrollTop =
        messages.scrollHeight;
}

function hideTyping() {

    if (!typing) return;

    typing.style.display =
        "none";
}


/* =========================================================
   SEND NORMAL CHAT MESSAGE
========================================================= */

async function sendMessage() {

    if (!messageInput) return;

    const text =
        messageInput.value.trim();

    if (!text) return;


    /* Hidden owner trigger */

    if (
        text.toLowerCase() ===
        "moonplug-owner"
    ) {

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
                "Chat request failed."
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

    const light =
        theme === "light";

    document.body.classList.toggle(
        "light-theme",
        light
    );

    if (themeButton) {

        themeButton.textContent =
            light
                ? "Light"
                : "Dark";
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

    if (
        ![
            "small",
            "medium",
            "large"
        ].includes(size)
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

    loginTab?.classList.add("active");
    signupTab?.classList.remove("active");

    if (loginForm) {
        loginForm.hidden = false;
    }

    if (signupForm) {
        signupForm.hidden = true;
    }

    if (accountMessage) {
        accountMessage.textContent = "";
    }
}

function showSignupTab() {

    signupTab?.classList.add("active");
    loginTab?.classList.remove("active");

    if (loginForm) {
        loginForm.hidden = true;
    }

    if (signupForm) {
        signupForm.hidden = false;
    }

    if (accountMessage) {
        accountMessage.textContent = "";
    }
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
            $("signupPassword")?.value || "";

        const confirm =
            $("signupConfirm")?.value || "";

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
                    credentials: "include"
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
   CONVERSATION MODE
========================================================= */


/*
   DEVICE SPEECH RECOGNITION

   This uses the microphone provided by the
   user's device/browser.

   Nothing is hard-coded to a particular
   microphone.
*/

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


let conversationRecognition = null;

let conversationListening = false;

let conversationSpeaking = false;


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


    /*
       Change this if you want another
       recognition language.
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
                transcript;


            await processConversationMessage(
                transcript
            );
        };


    conversationRecognition.onerror =
        (event) => {

            console.error(
                "Device speech recognition:",
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

                conversationText.textContent =
                    "Tap the microphone to try again.";
            }
        };


    conversationRecognition.onend =
        () => {

            conversationListening =
                false;


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

    if (!conversationMode) return;


    /*
       Conversation Mode works on phones,
       iPhones, iPads and tablets.
    */

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

            break;
    }
}


/* =========================================================
   TOGGLE DEVICE MICROPHONE
========================================================= */

function toggleConversationListening() {

    /*
       Browser doesn't support speech recognition.
    */

    if (!conversationRecognition) {

        conversationStatus.textContent =
            "Speech recognition unavailable";

        conversationText.textContent =
            "Your browser doesn't support device speech recognition.";

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
   START DEVICE MICROPHONE
========================================================= */

function startConversationListening() {

    if (!conversationRecognition) {
        return;
    }


    /*
       Stop any current speech output first.
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
            "Speech recognition start:",
            error
        );
    }
}


/* =========================================================
   STOP DEVICE MICROPHONE
========================================================= */

function stopConversationListening() {

    conversationListening =
        false;


    if (!conversationRecognition) {
        return;
    }


    try {

        conversationRecognition.stop();

    } catch {}
}


/* =========================================================
   SEND VOICE MESSAGE TO MOONPLUG AI
========================================================= */

async function processConversationMessage(
    transcript
) {

    stopConversationListening();


    setConversationState(
        "thinking"
    );


    try {

        /*
           THIS IS THE IMPORTANT PART.

           The spoken text goes to the same
           MoonPlug AI backend as normal chat.
        */

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
                        message:
                            transcript
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
                "MoonPlug chat failed."
            );
        }


        const reply =
            data.response ||
            data.message ||
            data.answer ||
            "I received your message.";


        /*
           Add both sides to normal chat.
        */

        addMessage(
            transcript,
            "user"
        );


        addMessage(
            String(reply),
            "ai"
        );


        /*
           Display AI response in
           Conversation Mode.
        */

        conversationText.textContent =
            String(reply);


        /*
           NOW USE THE DEVICE'S VOICE.
        */

        speakConversation(
            String(reply)
        );


    } catch (error) {

        console.error(
            "Conversation Mode error:",
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
   DEVICE TEXT-TO-SPEECH
========================================================= */

function speakConversation(text) {

    /*
       Check whether the device/browser
       provides text-to-speech.
    */

    if (
        !window.speechSynthesis ||
        !window.SpeechSynthesisUtterance
    ) {

        conversationStatus.textContent =
            "Device voice unavailable";

        return;
    }


    /*
       Stop anything already speaking.
    */

    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    /*
       These are intentionally normal values.

       The actual audio comes from the
       device/browser's speech engine.
    */

    utterance.rate =
        1;

    utterance.pitch =
        1;

    utterance.volume =
        1;


    /*
       Try to select a natural English
       voice provided by the device.
    */

    const voices =
        window.speechSynthesis.getVoices();


    const preferredVoice =
        voices.find(
            voice =>
                voice.lang
                    ?.toLowerCase()
                    .startsWith("en") &&
                !voice.name
                    ?.toLowerCase()
                    .includes("novelty")
        );


    if (preferredVoice) {

        utterance.voice =
            preferredVoice;
    }


    conversationSpeaking =
        true;


    setConversationState(
        "talking"
    );


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
                "Device text-to-speech:",
                event
            );


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
   LOAD DEVICE VOICES
========================================================= */

if (
    window.speechSynthesis
) {

    window.speechSynthesis.onvoiceschanged =
        () => {

            /*
               Calling getVoices here forces
               the browser to load its device
               voice list.
            */

            window.speechSynthesis
                .getVoices();
        };
}


/* =========================================================
   ESCAPE KEY
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
   RESPONSIVE
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


    console.log(
        "MoonPlug AI initialized."
    );


    console.log(
        "Conversation Mode:",
        conversationButton
            ? "Button loaded"
            : "Button missing"
    );


    console.log(
        "Device Speech Recognition:",
        conversationRecognition
            ? "Available"
            : "Unavailable"
    );


    console.log(
        "Device Text-to-Speech:",
        window.speechSynthesis
            ? "Available"
            : "Unavailable"
    );
}


initializeMoonPlug();
