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

const conversationButton = $("conversationButton");
const conversationMode = $("conversationMode");
const conversationClose = $("conversationClose");
const conversationMic = $("conversationMic");
const conversationStatus = $("conversationStatus");
const conversationText = $("conversationText");
const moonOrb = $("moonOrb");

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
   STATE
========================================================= */

let conversationListening = false;
let conversationSpeaking = false;
let conversationRecognition = null;

let availableVoices = [];


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

function addMessage(text, type = "ai") {

    const empty = $("emptyChat");

    if (empty) {
        empty.remove();
    }

    const bubble =
        document.createElement("div");

    bubble.className =
        `message-bubble ${type}`;

    bubble.textContent =
        String(text);

    messages.appendChild(bubble);

    messages.scrollTop =
        messages.scrollHeight;

    return bubble;
}


/* =========================================================
   THINKING
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
   NORMAL CHAT
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

        const data =
            await response.json()
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

        console.error(error);

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
   SETTINGS
========================================================= */

function openSettings() {

    settingsPanel.style.display =
        "flex";
}

function closeSettings() {

    settingsPanel.style.display =
        "none";
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

    themeButton.textContent =
        theme === "light"
            ? "Light"
            : "Dark";
}

function toggleTheme() {

    const light =
        document.body.classList.toggle(
            "light-theme"
        );

    localStorage.setItem(
        "moonplug-theme",
        light ? "light" : "dark"
    );

    themeButton.textContent =
        light ? "Light" : "Dark";
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
}

function closeAccountScreen() {

    accountScreen.style.display =
        "none";
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
    event => {

        event.preventDefault();

        accountMessage.textContent =
            "Account login can be connected to the MoonPlug backend here.";
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
            "Account creation can be connected to the MoonPlug backend here.";
    }
);


/* =========================================================
   CONVERSATION MODE
========================================================= */

/*
   This is intentionally NOT restricted to phones.

   It works on:
   - iPhone
   - iPad
   - iPad Air
   - desktop browsers that support the APIs
*/

function openConversationMode() {

    if (!conversationMode) return;

    conversationMode.classList.add("active");

    conversationMode.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "conversation-open"
    );

    setConversationState("idle");
}

function closeConversationMode() {

    stopConversationListening();

    if (window.speechSynthesis) {
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

    setConversationState("idle");
}

conversationButton?.addEventListener(
    "click",
    openConversationMode
);

conversationClose?.addEventListener(
    "click",
    closeConversationMode
);


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

            conversationText.textContent =
                "I couldn't hear you. Tap the microphone and try again.";
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
                "MoonPlug is thinking...";

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

    if (conversationSpeaking) {

        window.speechSynthesis.cancel();

        conversationSpeaking =
            false;
    }

    try {

        conversationRecognition.start();

    } catch (error) {

        console.log(
            "Speech recognition could not start:",
            error
        );
    }
}


/* =========================================================
   STOP LISTENING
========================================================= */

function stopConversationListening() {

    conversationListening =
        false;

    if (!conversationRecognition) return;

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

    setConversationState(
        "thinking"
    );

    /*
       Show the user's spoken message
       in the normal chat too.
    */

    addMessage(
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
            await response.json()
                .catch(() => ({}));

        if (!response.ok) {

            throw new Error(
                data?.error ||
                "Chat request failed"
            );
        }

        const reply =
            data?.response ||
            data?.message ||
            data?.answer;

        if (!reply) {

            throw new Error(
                "The AI returned no response."
            );
        }

        /*
           Put the REAL AI response into
           the normal MoonPlug chat.
        */

        addMessage(
            String(reply),
            "ai"
        );

        /*
           Show the response while it is
           being spoken.
        */

        conversationText.textContent =
            String(reply);

        /*
           THIS is what makes MoonPlug
           actually talk back.
        */

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
   DEVICE VOICES
========================================================= */

function loadVoices() {

    if (!window.speechSynthesis) return;

    availableVoices =
        window.speechSynthesis.getVoices();

}

if (window.speechSynthesis) {

    loadVoices();

    window.speechSynthesis.onvoiceschanged =
        loadVoices;
}


/* =========================================================
   FIND ENGLISH DEVICE VOICE
========================================================= */

function getBestDeviceVoice() {

    if (!availableVoices.length) {

        availableVoices =
            window.speechSynthesis.getVoices();
    }

    /*
       Prefer an American English voice
       if the DEVICE provides one.
    */

    const american =
        availableVoices.find(
            voice =>
                voice.lang === "en-US"
        );

    if (american) {
        return american;
    }

    /*
       Otherwise use any English
       voice supplied by the device.
    */

    const english =
        availableVoices.find(
            voice =>
                voice.lang?.startsWith("en")
        );

    return english || null;
}


/* =========================================================
   DEVICE TEXT TO SPEECH
========================================================= */

function speakConversation(text) {

    return new Promise(resolve => {

        if (!window.speechSynthesis) {

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

        /*
           Use the DEVICE'S voice.

           If the device has an American
           English voice, select it.
        */

        const voice =
            getBestDeviceVoice();

        if (voice) {
            utterance.voice = voice;
        }

        utterance.lang =
            voice?.lang || "en-US";

        utterance.rate =
            1.0;

        utterance.pitch =
            1.0;

        utterance.volume =
            1.0;

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
                    "Text-to-speech error:",
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
   ESCAPE
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
            accountScreen?.style.display ===
            "flex"
        ) {

            closeAccountScreen();
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

    console.log(
        "MoonPlug AI initialized."
    );

}

initializeMoonPlug();
