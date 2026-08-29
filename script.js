
/* =========================================================
   MOONPLUG AI
   COMPLETE JAVASCRIPT
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const API_BASE = "https://moonplug.onrender.com";


/* =========================================================
   HELPERS
========================================================= */

const $ = (id) => document.getElementById(id);

const safeJSON = (key, fallback) => {

    try {
        return JSON.parse(
            localStorage.getItem(key)
        ) ?? fallback;
    } catch {
        return fallback;
    }
};


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
   STAR FIELD
========================================================= */

function createStars() {

    const field = $("starField");

    if (!field) return;

    field.innerHTML = "";

    const count =
        window.innerWidth < 700
            ? 80
            : 140;

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

    messageInput.focus();
}

$("newChatButton")?.addEventListener(
    "click",
    startNewChat
);


function addMessage(text, type = "ai") {

    if (!messages) return null;

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

    typing.style.display = "flex";

    messages.scrollTop =
        messages.scrollHeight;
}

function hideTyping() {

    if (!typing) return;

    typing.style.display = "none";
}


/* =========================================================
   NORMAL SEND
========================================================= */

async function sendMessage() {

    const text =
        messageInput.value.trim();

    if (!text) return;


    /* Hidden owner trigger */

    if (
        text === "15912014"
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

        console.error(
            "MoonPlug chat error:",
            error
        );

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
   ENTER
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

    settingsPanel.style.display = "flex";

    settingsPanel.setAttribute(
        "aria-hidden",
        "false"
    );
}

function closeSettings() {

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
   OWNER ACCESS
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

            event.preventDefault();

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

const conversationMode =
    $("conversationMode");

const conversationButton =
    $("conversationButton");

const conversationClose =
    $("conversationClose");

const conversationMic =
    $("conversationMic");

const conversationSpeaker =
    $("conversationSpeaker");

const conversationStatus =
    $("conversationStatus");

const conversationText =
    $("conversationText");


let conversationListening = false;
let conversationSpeaking = false;
let conversationRecognition = null;


/* =========================================================
   CONVERSATION STORAGE
========================================================= */

const CONVERSATION_STORAGE_KEY =
    "moonplug-conversation-history";


let conversationHistory =
    safeJSON(
        CONVERSATION_STORAGE_KEY,
        []
    );


function saveConversationMessage(
    role,
    text
) {

    conversationHistory.push({
        role,
        text: String(text),
        time: Date.now()
    });

    /*
       Keep the most recent 100 messages.
    */

    if (
        conversationHistory.length > 100
    ) {
        conversationHistory =
            conversationHistory.slice(-100);
    }

    localStorage.setItem(
        CONVERSATION_STORAGE_KEY,
        JSON.stringify(
            conversationHistory
        )
    );
}


/* =========================================================
   CONVERSATION HISTORY CHOOSER
========================================================= */

const conversationHistoryScreen =
    $("conversationHistory");

const conversationHistoryClose =
    $("conversationHistoryClose");

const newConversationButton =
    $("newConversationButton");

const continueConversationButton =
    $("continueConversationButton");

const conversationHistoryStatus =
    $("conversationHistoryStatus");


function openConversationChooser() {

    conversationHistoryScreen.classList.add(
        "active"
    );

    conversationHistoryScreen.setAttribute(
        "aria-hidden",
        "false"
    );

    const hasHistory =
        conversationHistory.length > 0;

    continueConversationButton.disabled =
        !hasHistory;

    continueConversationButton.style.opacity =
        hasHistory ? "1" : ".4";

    conversationHistoryStatus.textContent =
        hasHistory
            ? `${conversationHistory.length} saved messages`
            : "No previous conversation yet.";
}


function closeConversationChooser() {

    conversationHistoryScreen.classList.remove(
        "active"
    );

    conversationHistoryScreen.setAttribute(
        "aria-hidden",
        "true"
    );
}


function startFreshConversation() {

    conversationHistory = [];

    localStorage.removeItem(
        CONVERSATION_STORAGE_KEY
    );

    closeConversationChooser();

    openConversationMode();

    conversationText.textContent =
        "Tap the microphone to talk";
}


function continueOldConversation() {

    if (
        conversationHistory.length === 0
    ) {
        return;
    }

    closeConversationChooser();

    openConversationMode();

    const lastMessage =
        conversationHistory[
            conversationHistory.length - 1
        ];

    conversationText.textContent =
        lastMessage?.text ||
        "Ready to continue.";

    setConversationState("idle");
}


conversationHistoryClose?.addEventListener(
    "click",
    closeConversationChooser
);

newConversationButton?.addEventListener(
    "click",
    startFreshConversation
);

continueConversationButton?.addEventListener(
    "click",
    continueOldConversation
);


/* =========================================================
   OPEN CONVERSATION MODE
========================================================= */

function openConversationMode() {

    if (!conversationMode) return;

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
    () => {

        /*
           On mobile/iPad:
           ask whether to start new or continue.
        */

        openConversationChooser();
    }
);


/* =========================================================
   CLOSE CONVERSATION
========================================================= */

function closeConversationMode() {

    stopConversationListening();

    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    conversationSpeaking = false;

    conversationMode.classList.remove(
        "active",
        "listening",
        "thinking",
        "talking"
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

    if (!conversationMode) return;

    conversationMode.classList.remove(
        "listening",
        "thinking",
        "talking"
    );

    switch (state) {

        case "listening":

            conversationMode.classList.add(
                "listening"
            );

            conversationStatus.textContent =
                "Listening";

            conversationText.textContent =
                "I'm listening...";

            conversationMic.classList.add(
                "active"
            );

            break;


        case "thinking":

            conversationMode.classList.add(
                "thinking"
            );

            conversationStatus.textContent =
                "Thinking";

            conversationText.textContent =
                "MoonPlug is thinking...";

            conversationMic.classList.remove(
                "active"
            );

            break;


        case "talking":

            conversationMode.classList.add(
                "talking"
            );

            conversationStatus.textContent =
                "Speaking";

            conversationMic.classList.remove(
                "active"
            );

            break;


        default:

            conversationStatus.textContent =
                "Ready";

            conversationText.textContent =
                "Tap the microphone to talk";

            conversationMic.classList.remove(
                "active"
            );
    }
}


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
                "Speech recognition error:",
                event.error
            );

            conversationListening = false;

            setConversationState(
                "idle"
            );

            conversationStatus.textContent =
                "Microphone error";

            conversationText.textContent =
                "Check your microphone permission and try again.";
        };


    conversationRecognition.onend =
        () => {

            conversationListening =
                false;

            if (!conversationSpeaking) {

                if (
                    conversationMode.classList.contains(
                        "active"
                    )
                ) {

                    setConversationState(
                        "idle"
                    );
                }
            }
        };
}


/* =========================================================
   MICROPHONE
========================================================= */

function toggleConversationListening() {

    if (!conversationRecognition) {

        conversationStatus.textContent =
            "Speech recognition unavailable";

        conversationText.textContent =
            "Your browser does not provide speech recognition.";

        return;
    }


    if (conversationSpeaking) {

        stopConversationSpeaking();

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

        stopConversationSpeaking();
    }

    try {

        conversationRecognition.start();

    } catch (error) {

        console.log(
            "Speech recognition already running."
        );
    }
}


/* =========================================================
   STOP LISTENING
========================================================= */

function stopConversationListening() {

    conversationListening = false;

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

    stopConversationListening();

    saveConversationMessage(
        "user",
        transcript
    );

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


        saveConversationMessage(
            "assistant",
            cleanReply
        );


        /*
           Also save it in normal MoonPlug chat.
        */

        addMessage(
            transcript,
            "user"
        );

        addMessage(
            cleanReply,
            "ai"
        );


        /*
           SHOW THE RESPONSE
        */

        conversationText.textContent =
            cleanReply;


        /*
           ACTUALLY SPEAK THE RESPONSE
        */

        speakConversation(
            cleanReply
        );


    } catch (error) {

        console.error(
            "Conversation mode error:",
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
   FIND DEVICE ENGLISH VOICE
========================================================= */

let availableVoices = [];


function loadVoices() {

    if (!window.speechSynthesis) {
        availableVoices = [];
        return;
    }

    availableVoices =
        window.speechSynthesis.getVoices();
}


if (
    "speechSynthesis" in window
) {

    loadVoices();

    window.speechSynthesis.onvoiceschanged =
        loadVoices;
}


/* =========================================================
   SELECT ENGLISH DEVICE VOICE
========================================================= */

function getEnglishVoice() {

    if (!availableVoices.length) {

        loadVoices();
    }


    if (!availableVoices.length) {
        return null;
    }


    /*
       Prefer an English voice.

       We don't force one specific person's
       voice because different devices have
       different installed voices.
    */

    const englishVoices =
        availableVoices.filter(
            voice =>
                /^en(-|_)/i.test(
                    voice.lang
                )
        );


    if (!englishVoices.length) {

        return null;
    }


    /*
       Prefer common natural/system voices
       when available.
    */

    const preferred =
        englishVoices.find(
            voice =>
                /Samantha|Alex|Karen|Daniel|Google|Microsoft|Natural|Premium/i
                    .test(voice.name)
        );


    return preferred ||
           englishVoices[0];
}


/* =========================================================
   TEXT TO SPEECH
========================================================= */

function speakConversation(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        conversationText.textContent =
            `${text}\n\nVoice playback is not available on this device.`;

        setConversationState(
            "idle"
        );

        return;
    }


    /*
       Stop anything currently speaking.
    */

    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            String(text)
        );


    const voice =
        getEnglishVoice();


    if (voice) {

        utterance.voice =
            voice;

        utterance.lang =
            voice.lang;

    } else {

        /*
           Ask the browser for English even
           if it doesn't expose a selectable
           English voice.
        */

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
        (event) => {

            console.error(
                "Speech synthesis error:",
                event
            );

            conversationSpeaking =
                false;

            setConversationState(
                "idle"
            );
        };


    /*
       Some browsers need this after
       voices have loaded.
    */

    setTimeout(
        () => {

            window.speechSynthesis.speak(
                utterance
            );

        },
        50
    );
}


/* =========================================================
   SPEAKER BUTTON
========================================================= */

function stopConversationSpeaking() {

    if (
        window.speechSynthesis
    ) {

        window.speechSynthesis.cancel();
    }

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
}


conversationSpeaker?.addEventListener(
    "click",
    stopConversationSpeaking
);


/* =========================================================
   DESKTOP SAFETY
========================================================= */

function checkConversationScreenSize() {

    /*
       Conversation Mode is intended for
       iPhone + iPad/tablet.

       It is automatically closed only
       when the viewport becomes desktop-sized.
    */

    if (
        window.innerWidth > 1200 &&
        conversationMode.classList.contains(
            "active"
        )
    ) {

        closeConversationMode();
    }
}


window.addEventListener(
    "resize",
    () => {

        createStars();

        checkConversationScreenSize();
    }
);


/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key !== "Escape") {
            return;
        }


        if (
            conversationHistoryScreen.classList.contains(
                "active"
            )
        ) {

            closeConversationChooser();

            return;
        }


        if (
            conversationMode.classList.contains(
                "active"
            )
        ) {

            closeConversationMode();

            return;
        }


        if (
            settingsPanel.style.display === "flex"
        ) {

            closeSettings();

            return;
        }


        if (
            ownerLogin.style.display === "flex"
        ) {

            hideOwnerLogin();
        }
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
       Load device voices.
    */

    if (
        "speechSynthesis" in window
    ) {

        loadVoices();

        setTimeout(
            loadVoices,
            500
        );

        setTimeout(
            loadVoices,
            1500
        );
    }

    console.log(
        "MoonPlug AI initialized."
    );
}


initializeMoonPlug();

