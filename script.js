/* =========================================================
   MOONPLUG AI
   COMPLETE JAVASCRIPT
   CHAT + CONVERSATION MODE
========================================================= */

const API_BASE = "https://moonplug.onrender.com";

const $ = id => document.getElementById(id);


/* =========================================================
   MAIN ELEMENTS
========================================================= */

const sidebar = $("sidebar");
const sidebarLogo = $("sidebarLogo");

const messages = $("messages");
const messageInput = $("messageInput");
const sendButton = $("sendButton");
const typing = $("typing");

const conversationButton = $("conversationButton");
const conversationMode = $("conversationMode");
const conversationClose = $("conversationClose");
const conversationMic = $("conversationMic");

const conversationStatus = $("conversationStatus");
const conversationText = $("conversationText");

const blackHole = $("blackHole");


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

    return bubble;
}


/* =========================================================
   TYPING
========================================================= */

function showTyping() {

    if (!typing) return;

    typing.style.display =
        "flex";
}

function hideTyping() {

    if (!typing) return;

    typing.style.display =
        "none";
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
            reply,
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

            sendMessage();
        }
    }
);


/* =========================================================
   INPUT RESIZE
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
   CONVERSATION MODE
========================================================= */

let conversationListening = false;
let conversationSpeaking = false;
let conversationRecognition = null;


/* =========================================================
   DEVICE SPEECH RECOGNITION
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

            await sendConversationToAI(
                transcript
            );
        };


    conversationRecognition.onerror =
        event => {

            console.error(
                "Microphone error:",
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
   CONVERSATION STATES
========================================================= */

function setConversationState(
    state
) {

    if (!blackHole) return;

    blackHole.classList.remove(
        "listening",
        "thinking",
        "talking"
    );

    conversationMic.classList.remove(
        "active"
    );

    switch (state) {

        case "listening":

            blackHole.classList.add(
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

            blackHole.classList.add(
                "thinking"
            );

            conversationStatus.textContent =
                "Thinking...";

            conversationText.textContent =
                "MoonPlug is thinking...";

            conversationMic.textContent =
                "🎙️";

            break;


        case "talking":

            blackHole.classList.add(
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
   MICROPHONE BUTTON
========================================================= */

function toggleConversationListening() {

    if (!conversationRecognition) {

        conversationStatus.textContent =
            "Speech recognition unavailable";

        conversationText.textContent =
            "Your browser doesn't support speech recognition.";

        return;
    }


    if (conversationSpeaking) {

        window.speechSynthesis.cancel();

        conversationSpeaking =
            false;

        setConversationState(
            "idle"
        );

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

    if (!conversationRecognition)
        return;

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

    if (!conversationRecognition)
        return;

    try {

        conversationRecognition.stop();

    } catch {}
}


/* =========================================================
   SEND VOICE MESSAGE TO MOONPLUG
========================================================= */

async function sendConversationToAI(
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


        /* Put it in normal chat */

        addMessage(
            transcript,
            "user"
        );

        addMessage(
            reply,
            "ai"
        );


        /* Show AI response */

        conversationText.textContent =
            String(reply);


        /* SPEAK THE ACTUAL AI RESPONSE */

        await speakConversation(
            String(reply)
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
            "I couldn't connect to MoonPlug right now.";
    }
}


/* =========================================================
   DEVICE TEXT TO SPEECH
========================================================= */

function getAmericanVoice() {

    if (!window.speechSynthesis)
        return null;

    const voices =
        window.speechSynthesis
            .getVoices();

    /*
       Try to find an English-American
       voice on the user's device.
    */

    return (
        voices.find(
            voice =>
                voice.lang === "en-US"
        ) ||

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
        ) ||

        null
    );
}


function speakConversation(
    text
) {

    return new Promise(
        resolve => {

            if (
                !window.speechSynthesis
            ) {

                setConversationState(
                    "idle"
                );

                resolve();

                return;
            }


            window.speechSynthesis.cancel();


            const utterance =
                new SpeechSynthesisUtterance(
                    text
                );


            const voice =
                getAmericanVoice();


            if (voice) {
                utterance.voice =
                    voice;
            }


            /*
               Device voice settings.
            */

            utterance.lang =
                voice?.lang ||
                "en-US";

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
                event => {

                    console.error(
                        "Speech synthesis:",
                        event
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

        }
    );
}


/*
   iPhone/iPad Safari can load voices
   after the page starts.
*/

if (
    window.speechSynthesis
) {

    window.speechSynthesis.onvoiceschanged =
        () => {

            window.speechSynthesis
                .getVoices();
        };
}


/* =========================================================
   SETTINGS
========================================================= */

const settingsPanel =
    $("settingsPanel");

const themeButton =
    $("themeButton");

const closeSettings =
    $("closeSettings");


function openSettings() {

    settingsPanel.style.display =
        "flex";
}

function closeSettingsPanel() {

    settingsPanel.style.display =
        "none";
}

$("settingsButton")?.addEventListener(
    "click",
    openSettings
);

closeSettings?.addEventListener(
    "click",
    closeSettingsPanel
);

settingsPanel?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            settingsPanel
        ) {

            closeSettingsPanel();
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

const accountScreen =
    $("accountScreen");

function openAccount() {

    accountScreen.style.display =
        "flex";
}

function closeAccountScreen() {

    accountScreen.style.display =
        "none";
}

$("ownerButton")?.addEventListener(
    "click",
    openAccount
);

$("closeAccount")?.addEventListener(
    "click",
    closeAccountScreen
);


/* =========================================================
   ACCOUNT TABS
========================================================= */

$("loginTab")?.addEventListener(
    "click",
    () => {

        $("loginTab")
            .classList.add("active");

        $("signupTab")
            .classList.remove("active");

        $("loginForm").hidden =
            false;

        $("signupForm").hidden =
            true;
    }
);

$("signupTab")?.addEventListener(
    "click",
    () => {

        $("signupTab")
            .classList.add("active");

        $("loginTab")
            .classList.remove("active");

        $("loginForm").hidden =
            true;

        $("signupForm").hidden =
            false;
    }
);


/* =========================================================
   ACCOUNT FORMS
========================================================= */

$("loginForm")?.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        $("accountMessage").textContent =
            "Account login can be connected to the MoonPlug backend.";
    }
);

$("signupForm")?.addEventListener(
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

            $("accountMessage").textContent =
                "Passwords do not match.";

            return;
        }

        $("accountMessage").textContent =
            "Account creation can be connected to the MoonPlug backend.";
    }
);


/* =========================================================
   HIDDEN OWNER LOGIN
========================================================= */

const ownerLogin =
    $("ownerLogin");

const ownerCode =
    $("ownerCode");

const ownerError =
    $("ownerError");


function showOwnerLogin() {

    ownerLogin.style.display =
        "flex";

    ownerCode.value = "";

    ownerError.textContent =
        "";

    ownerCode.focus();
}

function hideOwnerLogin() {

    ownerLogin.style.display =
        "none";
}


/*
   Hidden owner trigger.
*/

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

            messageInput.value =
                "";

            showOwnerLogin();
        }
    }
);


/* =========================================================
   OWNER LOGIN
========================================================= */

$("showPassword")?.addEventListener(
    "click",
    () => {

        if (
            ownerCode.type ===
            "password"
        ) {

            ownerCode.type =
                "text";

            $("showPassword").textContent =
                "Hide";

        } else {

            ownerCode.type =
                "password";

            $("showPassword").textContent =
                "Show";
        }
    }
);

$("ownerCancel")?.addEventListener(
    "click",
    hideOwnerLogin
);


$("ownerLoginButton")?.addEventListener(
    "click",
    async () => {

        const code =
            ownerCode.value.trim();

        if (!code) {

            ownerError.textContent =
                "Enter the owner code.";

            return;
        }

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

                        body:
                            JSON.stringify({
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

            $("ownerPanel").style.display =
                "flex";

        } catch (error) {

            console.error(error);

            ownerError.textContent =
                "Unable to connect to MoonPlug.";
        }
    }
);


/* =========================================================
   OWNER LOGOUT
========================================================= */

$("ownerLogout")?.addEventListener(
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

        $("ownerPanel").style.display =
            "none";
    }
);


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

            closeSettingsPanel();

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
    () => {

        createStars();

        /*
           Conversation mode is intentionally
           available on phones AND iPads.
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
       Preload the device's available
       speech voices.
    */

    if (
        window.speechSynthesis
    ) {

        window.speechSynthesis
            .getVoices();
    }

    console.log(
        "MoonPlug AI initialized."
    );

    console.log(
        "Conversation Mode ready."
    );
}

initializeMoonPlug();
