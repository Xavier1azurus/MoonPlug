
/* =========================================================
   MOONPLUG AI
   COMPLETE SCRIPT
   Matches the provided index.html + style.css
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const API_BASE = "https://moonplug.onrender.com";

const OWNER_TRIGGER = "15912014";

const CONVERSATION_STORAGE_KEY =
    "moonplug_conversation";

const TEXT_SIZE_KEY =
    "moonplug_text_size";

const THEME_KEY =
    "moonplug_theme";


/* =========================================================
   DOM
========================================================= */

const sidebar =
    document.getElementById("sidebar");

const sidebarLogo =
    document.getElementById("sidebarLogo");

const newChatButton =
    document.getElementById("newChatButton");

const conversationButton =
    document.getElementById("conversationButton");

const studyButton =
    document.getElementById("studyButton");

const cookButton =
    document.getElementById("cookButton");

const imagesButton =
    document.getElementById("imagesButton");

const codeButton =
    document.getElementById("codeButton");

const historyButton =
    document.getElementById("historyButton");

const settingsButton =
    document.getElementById("settingsButton");

const ownerButton =
    document.getElementById("ownerButton");


/* Main chat */

const messages =
    document.getElementById("messages");

const emptyChat =
    document.getElementById("emptyChat");

const typing =
    document.getElementById("typing");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");


/* Conversation */

const conversationMode =
    document.getElementById("conversationMode");

const conversationClose =
    document.getElementById("conversationClose");

const conversationMic =
    document.getElementById("conversationMic");

const conversationSpeaker =
    document.getElementById("conversationSpeaker");

const conversationStatus =
    document.getElementById("conversationStatus");

const conversationText =
    document.getElementById("conversationText");


/* Conversation history */

const conversationHistory =
    document.getElementById("conversationHistory");

const conversationHistoryClose =
    document.getElementById(
        "conversationHistoryClose"
    );

const newConversationButton =
    document.getElementById(
        "newConversationButton"
    );

const continueConversationButton =
    document.getElementById(
        "continueConversationButton"
    );

const conversationHistoryStatus =
    document.getElementById(
        "conversationHistoryStatus"
    );


/* Settings */

const settingsPanel =
    document.getElementById("settingsPanel");

const closeSettings =
    document.getElementById("closeSettings");

const themeButton =
    document.getElementById("themeButton");


/* Account */

const accountScreen =
    document.getElementById("accountScreen");

const loginTab =
    document.getElementById("loginTab");

const signupTab =
    document.getElementById("signupTab");

const loginForm =
    document.getElementById("loginForm");

const signupForm =
    document.getElementById("signupForm");

const closeAccount =
    document.getElementById("closeAccount");

const accountMessage =
    document.getElementById("accountMessage");


/* Owner */

const ownerLogin =
    document.getElementById("ownerLogin");

const ownerCode =
    document.getElementById("ownerCode");

const ownerLoginButton =
    document.getElementById(
        "ownerLoginButton"
    );

const ownerCancel =
    document.getElementById("ownerCancel");

const ownerError =
    document.getElementById("ownerError");

const showPassword =
    document.getElementById("showPassword");

const ownerPanel =
    document.getElementById("ownerPanel");

const ownerLogout =
    document.getElementById("ownerLogout");

const ownerUsers =
    document.getElementById("ownerUsers");

const ownerChats =
    document.getElementById("ownerChats");

const manageUsersButton =
    document.getElementById(
        "manageUsersButton"
    );

const manageChatsButton =
    document.getElementById(
        "manageChatsButton"
    );

const appSettingsButton =
    document.getElementById(
        "appSettingsButton"
    );

const ownerActionMessage =
    document.getElementById(
        "ownerActionMessage"
    );

const trainerButton =
    document.getElementById("trainerButton");

const trainerContainer =
    document.getElementById(
        "trainerContainer"
    );


/* =========================================================
   STATE
========================================================= */

let recognition = null;

let conversationListening = false;

let conversationSpeaking = false;

let lastSpokenReply = "";

let currentConversation = [];

let ownerLoggedIn = false;

let speechReady = false;


/* =========================================================
   STARTUP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeMoonPlug
);


function initializeMoonPlug() {

    createStars();

    setupSidebar();

    setupChat();

    setupConversation();

    setupConversationHistory();

    setupSettings();

    setupAccount();

    setupOwner();

    setupSpeech();

    loadTextSize();

    loadTheme();

    loadConversation();

    checkBackendHealth();

    checkOwnerSession();

}


/* =========================================================
   STAR FIELD
========================================================= */

function createStars() {

    const field =
        document.getElementById(
            "starField"
        );

    if (!field) return;

    field.innerHTML = "";

    const count =
        window.innerWidth <= 700
            ? 45
            : 90;

    for (let i = 0; i < count; i++) {

        const star =
            document.createElement("div");

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

        const size =
            Math.random() * 2 + .5;

        star.style.setProperty(
            "--star-size",
            `${size}px`
        );

        star.style.setProperty(
            "--star-opacity",
            `${Math.random() * .65 + .2}`
        );

        star.style.setProperty(
            "--star-glow",
            `${Math.random() * 5 + 2}px`
        );

        star.style.setProperty(
            "--star-duration",
            `${Math.random() * 5 + 4}s`
        );

        star.style.setProperty(
            "--star-delay",
            `${Math.random() * 4}s`
        );

        star.style.setProperty(
            "--star-scale",
            `${Math.random() * .5 + .5}`
        );

        star.style.setProperty(
            "--star-move-x",
            `${Math.random() * 12 - 6}px`
        );

        star.style.setProperty(
            "--star-move-y",
            `${Math.random() * 12 - 6}px`
        );

        field.appendChild(star);
    }
}


/* =========================================================
   SIDEBAR
========================================================= */

function setupSidebar() {

    if (sidebarLogo) {

        sidebarLogo.addEventListener(
            "click",
            () => {

                if (
                    window.innerWidth <= 700
                ) {

                    sidebar.classList.toggle(
                        "expanded"
                    );

                } else {

                    sidebar.classList.toggle(
                        "collapsed"
                    );
                }
            }
        );
    }


    if (newChatButton) {

        newChatButton.addEventListener(
            "click",
            startNewChat
        );
    }


    if (conversationButton) {

        conversationButton.addEventListener(
            "click",
            openConversationChooser
        );
    }


    if (historyButton) {

        historyButton.addEventListener(
            "click",
            openConversationChooser
        );
    }


    if (settingsButton) {

        settingsButton.addEventListener(
            "click",
            openSettings
        );
    }


    if (ownerButton) {

        ownerButton.addEventListener(
            "click",
            openAccount
        );
    }


    if (studyButton) {

        studyButton.addEventListener(
            "click",
            () => {

                messageInput.value =
                    "Help me study.";

                messageInput.focus();
            }
        );
    }


    if (cookButton) {

        cookButton.addEventListener(
            "click",
            () => {

                messageInput.value =
                    "Help me cook something.";

                messageInput.focus();
            }
        );
    }


    if (imagesButton) {

        imagesButton.addEventListener(
            "click",
            () => {

                messageInput.value =
                    "I want help with an image.";

                messageInput.focus();
            }
        );
    }


    if (codeButton) {

        codeButton.addEventListener(
            "click",
            () => {

                messageInput.value =
                    "Help me write code.";

                messageInput.focus();
            }
        );
    }
}


/* =========================================================
   CHAT
========================================================= */

function setupChat() {

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendMessage
        );
    }


    if (messageInput) {

        messageInput.addEventListener(
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


        messageInput.addEventListener(
            "input",
            () => {

                messageInput.style.height =
                    "auto";

                messageInput.style.height =
                    Math.min(
                        messageInput.scrollHeight,
                        180
                    ) + "px";
            }
        );
    }
}


/* =========================================================
   SEND NORMAL CHAT
========================================================= */

async function sendMessage() {

    if (!messageInput) return;

    const text =
        messageInput.value.trim();

    if (!text) return;


    addMessage(
        text,
        "user"
    );

    messageInput.value = "";

    messageInput.style.height =
        "auto";

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
            "I received your message.";


        hideTyping();

        addMessage(
            String(reply),
            "ai"
        );


    } catch (error) {

        console.error(
            "Chat error:",
            error
        );

        hideTyping();

        addMessage(
            "I couldn't connect to MoonPlug right now.",
            "ai"
        );
    }
}


/* =========================================================
   ADD MESSAGE
========================================================= */

function addMessage(
    text,
    sender
) {

    if (!messages) return;


    if (emptyChat) {

        emptyChat.style.display =
            "none";
    }


    const bubble =
        document.createElement("div");

    bubble.className =
        `message-bubble ${sender}`;


    bubble.textContent =
        text;


    messages.appendChild(
        bubble
    );


    messages.scrollTop =
        messages.scrollHeight;
}


/* =========================================================
   THINKING
========================================================= */

function showTyping() {

    if (typing) {

        typing.style.display =
            "flex";
    }
}


function hideTyping() {

    if (typing) {

        typing.style.display =
            "none";
    }
}


/* =========================================================
   CONVERSATION MODE
========================================================= */

function setupConversation() {

    if (conversationClose) {

        conversationClose.addEventListener(
            "click",
            closeConversation
        );
    }


    if (conversationMic) {

        conversationMic.addEventListener(
            "click",
            toggleConversationListening
        );
    }


    if (conversationSpeaker) {

        conversationSpeaker.addEventListener(
            "click",
            () => {

                if (
                    conversationSpeaking
                ) {

                    stopConversationSpeech();

                } else if (
                    lastSpokenReply
                ) {

                    speakConversation(
                        lastSpokenReply
                    );
                }
            }
        );
    }
}


/* =========================================================
   OPEN CONVERSATION CHOOSER
========================================================= */

function openConversationChooser() {

    stopConversationListening();

    stopConversationSpeech();


    if (
        conversationHistory
    ) {

        conversationHistory.classList.add(
            "active"
        );

        conversationHistory.setAttribute(
            "aria-hidden",
            "false"
        );
    }
}


/* =========================================================
   CONVERSATION HISTORY
========================================================= */

function setupConversationHistory() {

    if (conversationHistoryClose) {

        conversationHistoryClose.addEventListener(
            "click",
            closeConversationChooser
        );
    }


    if (newConversationButton) {

        newConversationButton.addEventListener(
            "click",
            () => {

                currentConversation = [];

                saveConversation();

                closeConversationChooser();

                openConversation();
            }
        );
    }


    if (continueConversationButton) {

        continueConversationButton.addEventListener(
            "click",
            () => {

                loadConversation();

                closeConversationChooser();

                openConversation();

                renderConversationHistory();
            }
        );
    }
}


function closeConversationChooser() {

    if (!conversationHistory)
        return;

    conversationHistory.classList.remove(
        "active"
    );

    conversationHistory.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   OPEN CONVERSATION
========================================================= */

function openConversation() {

    if (!conversationMode)
        return;


    conversationMode.classList.add(
        "active"
    );

    conversationMode.setAttribute(
        "aria-hidden",
        "false"
    );


    setConversationState(
        "idle"
    );


    conversationText.textContent =
        currentConversation.length
            ? "Continue talking to MoonPlug."
            : "Tap the microphone to talk";
}


/* =========================================================
   CLOSE CONVERSATION
========================================================= */

function closeConversation() {

    stopConversationListening();

    stopConversationSpeech();


    if (!conversationMode)
        return;


    conversationMode.classList.remove(
        "active"
    );

    conversationMode.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   CONVERSATION STATE
========================================================= */

function setConversationState(
    state
) {

    if (!conversationMode)
        return;


    conversationMode.classList.remove(
        "listening",
        "thinking",
        "talking"
    );


    if (state === "listening") {

        conversationMode.classList.add(
            "listening"
        );

        conversationStatus.textContent =
            "Listening";
    }


    else if (
        state === "thinking"
    ) {

        conversationMode.classList.add(
            "thinking"
        );

        conversationStatus.textContent =
            "Thinking";
    }


    else if (
        state === "talking"
    ) {

        conversationMode.classList.add(
            "talking"
        );

        conversationStatus.textContent =
            "Speaking";
    }


    else {

        conversationStatus.textContent =
            "Ready";
    }
}


/* =========================================================
   SPEECH RECOGNITION
========================================================= */

function setupSpeech() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        console.warn(
            "Speech recognition is not supported."
        );

        return;
    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;

    recognition.interimResults =
        false;

    recognition.lang =
        "en-US";

    recognition.maxAlternatives =
        1;


    recognition.onstart =
        () => {

            conversationListening =
                true;

            setConversationState(
                "listening"
            );


            if (conversationMic) {

                conversationMic.classList.add(
                    "active"
                );
            }


            conversationText.textContent =
                "Listening...";
        };


    recognition.onresult =
        event => {

            const transcript =
                event.results[0][0]
                    .transcript
                    .trim();


            if (!transcript) {

                setConversationState(
                    "idle"
                );

                conversationText.textContent =
                    "I didn't hear anything.";

                return;
            }


            processConversationMessage(
                transcript
            );
        };


    recognition.onerror =
        event => {

            console.error(
                "Speech recognition error:",
                event.error
            );


            conversationListening =
                false;


            if (conversationMic) {

                conversationMic.classList.remove(
                    "active"
                );
            }


            setConversationState(
                "idle"
            );


            if (
                event.error ===
                "not-allowed"
            ) {

                conversationText.textContent =
                    "Microphone permission was blocked.";
            }

            else {

                conversationText.textContent =
                    "I couldn't hear you. Try again.";
            }
        };


    recognition.onend =
        () => {

            conversationListening =
                false;


            if (conversationMic) {

                conversationMic.classList.remove(
                    "active"
                );
            }


            if (
                !conversationSpeaking &&
                conversationMode &&
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
   START / STOP LISTENING
========================================================= */

function toggleConversationListening() {

    if (!recognition) {

        conversationText.textContent =
            "Speech recognition isn't supported by this browser.";

        return;
    }


    if (conversationListening) {

        stopConversationListening();

        return;
    }


    stopConversationSpeech();


    try {

        recognition.start();

    } catch (error) {

        console.warn(
            "Recognition start:",
            error
        );
    }
}


function stopConversationListening() {

    if (!recognition)
        return;


    try {

        recognition.stop();

    } catch {
        /* Already stopped */
    }


    conversationListening =
        false;


    if (conversationMic) {

        conversationMic.classList.remove(
            "active"
        );
    }
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


    conversationText.textContent =
        transcript;


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
                "Chat request failed."
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
           Also save it to normal MoonPlug chat.
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
           Show response.
        */

        conversationText.textContent =
            cleanReply;


        /*
           Actually speak response.
        */

        await speakConversation(
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
   SPEECH SYNTHESIS
========================================================= */

function setupSpeechSynthesis() {

    if (!("speechSynthesis" in window)) {

        console.warn(
            "Speech synthesis is not available."
        );

        return;
    }


    speechReady = true;

    /*
       Some browsers don't expose voices
       until voiceschanged fires.
    */

    window.speechSynthesis.onvoiceschanged =
        () => {

            getBestEnglishVoice();
        };


    getBestEnglishVoice();
}


function getBestEnglishVoice() {

    if (
        !("speechSynthesis" in window)
    ) {

        return null;
    }


    const voices =
        window.speechSynthesis
            .getVoices();


    if (!voices.length) {

        return null;
    }


    /*
       Prefer English voices.

       Priority:
       1. en-US
       2. en-CA
       3. en-GB
       4. any English voice
    */

    const preferred =
        voices.find(
            voice =>
                voice.lang === "en-US"
        ) ||
        voices.find(
            voice =>
                voice.lang === "en-CA"
        ) ||
        voices.find(
            voice =>
                voice.lang === "en-GB"
        ) ||
        voices.find(
            voice =>
                voice.lang &&
                voice.lang
                    .toLowerCase()
                    .startsWith("en")
        );


    return preferred || null;
}


/*
   This is the important function.

   It uses the device/browser's available
   English voice and DOES NOT require an
   external voice API.
*/

function speakConversation(
    text
) {

    return new Promise(
        resolve => {

            if (
                !("speechSynthesis" in window)
            ) {

                conversationSpeaking =
                    false;

                setConversationState(
                    "idle"
                );

                resolve(false);

                return;
            }


            const cleanText =
                String(text || "")
                    .replace(
                        /[*_#`]/g,
                        ""
                    )
                    .trim();


            if (!cleanText) {

                resolve(false);

                return;
            }


            /*
               Cancel anything already speaking.
            */

            window.speechSynthesis.cancel();


            lastSpokenReply =
                cleanText;


            const utterance =
                new SpeechSynthesisUtterance(
                    cleanText
                );


            const voice =
                getBestEnglishVoice();


            if (voice) {

                utterance.voice =
                    voice;

                utterance.lang =
                    voice.lang;
            }

            else {

                utterance.lang =
                    "en-US";
            }


            /*
               Natural but clear.
            */

            utterance.rate =
                0.96;

            utterance.pitch =
                1.0;

            utterance.volume =
                1.0;


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

                    setConversationState(
                        "idle"
                    );

                    resolve(true);
                };


            utterance.onerror =
                event => {

                    console.error(
                        "Speech synthesis error:",
                        event
                    );

                    conversationSpeaking =
                        false;

                    setConversationState(
                        "idle"
                    );

                    resolve(false);
                };


            /*
               Small delay helps Safari/iOS
               and some browsers actually
               begin playback.
            */

            setTimeout(
                () => {

                    window.speechSynthesis
                        .speak(
                            utterance
                        );

                },
                50
            );
        }
    );
}


/* =========================================================
   STOP SPEAKING
========================================================= */

function stopConversationSpeech() {

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();
    }


    conversationSpeaking =
        false;


    if (
        conversationMode &&
        conversationMode.classList.contains(
            "active"
        )
    ) {

        setConversationState(
            "idle"
        );
    }
}


/* =========================================================
   CONVERSATION STORAGE
========================================================= */

function saveConversationMessage(
    role,
    content
) {

    currentConversation.push({
        role,
        content,
        timestamp:
            Date.now()
    });


    saveConversation();
}


function saveConversation() {

    try {

        localStorage.setItem(
            CONVERSATION_STORAGE_KEY,
            JSON.stringify(
                currentConversation
            )
        );

    } catch (error) {

        console.error(
            "Could not save conversation:",
            error
        );
    }
}


function loadConversation() {

    try {

        const saved =
            localStorage.getItem(
                CONVERSATION_STORAGE_KEY
            );


        if (!saved) {

            currentConversation = [];

            return;
        }


        const parsed =
            JSON.parse(saved);


        if (Array.isArray(parsed)) {

            currentConversation =
                parsed;

        } else {

            currentConversation = [];
        }

    } catch (error) {

        console.error(
            "Could not load conversation:",
            error
        );

        currentConversation = [];
    }
}


/* =========================================================
   RENDER SAVED CONVERSATION
========================================================= */

function renderConversationHistory() {

    if (!conversationText)
        return;


    if (!currentConversation.length) {

        conversationText.textContent =
            "No saved conversation yet.";

        return;
    }


    const lastMessages =
        currentConversation
            .slice(-4);


    conversationText.textContent =
        lastMessages
            .map(
                message =>
                    `${
                        message.role ===
                        "user"
                            ? "You"
                            : "MoonPlug"
                    }: ${message.content}`
            )
            .join("\n\n");
}


/* =========================================================
   NEW CHAT
========================================================= */

function startNewChat() {

    stopConversationListening();

    stopConversationSpeech();


    currentConversation = [];

    saveConversation();


    if (messages) {

        messages.innerHTML = "";

        if (emptyChat) {

            messages.appendChild(
                emptyChat
            );

            emptyChat.style.display =
                "flex";
        }
    }


    if (conversationMode) {

        conversationMode.classList.remove(
            "active"
        );
    }


    if (sidebar) {

        sidebar.classList.remove(
            "expanded"
        );
    }
}


/* =========================================================
   SETTINGS
========================================================= */

function setupSettings() {

    if (closeSettings) {

        closeSettings.addEventListener(
            "click",
            () => {

                settingsPanel.style.display =
                    "none";
            }
        );
    }


    if (themeButton) {

        themeButton.addEventListener(
            "click",
            toggleTheme
        );
    }


    document
        .querySelectorAll(
            ".size-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        updateTextSize(
                            button.dataset.size
                        );
                    }
                );
            }
        );
}


function openSettings() {

    if (!settingsPanel)
        return;


    settingsPanel.style.display =
        "flex";

    settingsPanel.setAttribute(
        "aria-hidden",
        "false"
    );
}


function updateTextSize(
    size
) {

    document.body.classList.remove(
        "text-small",
        "text-medium",
        "text-large"
    );


    document.body.classList.add(
        `text-${size}`
    );


    localStorage.setItem(
        TEXT_SIZE_KEY,
        size
    );


    document
        .querySelectorAll(
            ".size-button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.size ===
                        size
                );
            }
        );
}


function loadTextSize() {

    const saved =
        localStorage.getItem(
            TEXT_SIZE_KEY
        ) || "medium";


    updateTextSize(
        saved
    );
}


function toggleTheme() {

    const light =
        document.body.classList.toggle(
            "light-theme"
        );


    localStorage.setItem(
        THEME_KEY,
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


function loadTheme() {

    const theme =
        localStorage.getItem(
            THEME_KEY
        );


    if (theme === "light") {

        document.body.classList.add(
            "light-theme"
        );

        if (themeButton) {

            themeButton.textContent =
                "Light";
        }
    }
}


/* =========================================================
   ACCOUNT
========================================================= */

function setupAccount() {

    if (loginTab) {

        loginTab.addEventListener(
            "click",
            showLoginTab
        );
    }


    if (signupTab) {

        signupTab.addEventListener(
            "click",
            showSignupTab
        );
    }


    if (closeAccount) {

        closeAccount.addEventListener(
            "click",
            closeAccountScreen
        );
    }


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                accountMessage.textContent =
                    "Account login is connected to the MoonPlug backend.";
            }
        );
    }


    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                accountMessage.textContent =
                    "Account creation is ready for backend integration.";
            }
        );
    }
}


function openAccount() {

    if (!accountScreen)
        return;


    accountScreen.style.display =
        "flex";

    accountScreen.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeAccountScreen() {

    if (!accountScreen)
        return;


    accountScreen.style.display =
        "none";

    accountScreen.setAttribute(
        "aria-hidden",
        "true"
    );
}


function showLoginTab() {

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
}


function showSignupTab() {

    signupTab.classList.add(
        "active"
    );

    loginTab.classList.remove(
        "active"
    );

    signupForm.hidden =
        false;

    loginForm.hidden =
        true;
}


/* =========================================================
   HIDDEN OWNER ACCESS
========================================================= */

function setupOwner() {

    /*
       Owner button still behaves as Account.

       The owner login is intentionally not
       shown publicly.
    */


    document.addEventListener(
        "keydown",
        handleOwnerTrigger
    );


    if (ownerLoginButton) {

        ownerLoginButton.addEventListener(
            "click",
            loginOwner
        );
    }


    if (ownerCancel) {

        ownerCancel.addEventListener(
            "click",
            hideOwnerLogin
        );
    }


    if (ownerLogout) {

        ownerLogout.addEventListener(
            "click",
            logoutOwner
        );
    }


    if (showPassword) {

        showPassword.addEventListener(
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
    }


    if (ownerCode) {

        ownerCode.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    loginOwner();
                }
            }
        );
    }


    if (manageUsersButton) {

        manageUsersButton.addEventListener(
            "click",
            loadOwnerUsers
        );
    }


    if (manageChatsButton) {

        manageChatsButton.addEventListener(
            "click",
            () => {

                ownerActionMessage.textContent =
                    "Chat management is connected to the owner backend.";
            }
        );
    }


    if (appSettingsButton) {

        appSettingsButton.addEventListener(
            "click",
            loadOwnerSettings
        );
    }


    if (trainerButton) {

        trainerButton.addEventListener(
            "click",
            openTrainer
        );
    }
}


function handleOwnerTrigger(
    event
) {

    /*
       Only react when typing the code
       into a normal text/password input.
    */

    const target =
        event.target;


    if (
        target &&
        (
            target.tagName ===
                "INPUT" ||
            target.tagName ===
                "TEXTAREA"
        )
    ) {

        const value =
            target.value;


        if (
            value ===
            OWNER_TRIGGER
        ) {

            target.value = "";

            showOwnerLogin();
        }
    }
}


function showOwnerLogin() {

    if (!ownerLogin)
        return;


    ownerLogin.style.display =
        "flex";

    ownerLogin.setAttribute(
        "aria-hidden",
        "false"
    );


    ownerError.textContent =
        "";

    ownerCode.value =
        "";

    ownerCode.focus();
}


function hideOwnerLogin() {

    if (!ownerLogin)
        return;


    ownerLogin.style.display =
        "none";

    ownerLogin.setAttribute(
        "aria-hidden",
        "true"
    );
}


async function loginOwner() {

    const code =
        ownerCode.value.trim();


    if (!code) {

        ownerError.textContent =
            "Enter the owner code.";

        return;
    }


    /*
       The real authentication should
       happen on the backend.

       The trigger above only reveals
       this hidden login.
    */

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

            throw new Error(
                data.error ||
                "Invalid owner code."
            );
        }


        ownerLoggedIn =
            true;


        hideOwnerLogin();

        openOwnerPanel();

        loadOwnerDashboard();


    } catch (error) {

        console.error(
            "Owner login:",
            error
        );


        ownerError.textContent =
            error.message ||
            "Owner login failed.";
    }
}


/* =========================================================
   OWNER SESSION
========================================================= */

async function checkOwnerSession() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/owner/session`,
                {
                    credentials:
                        "include"
                }
            );


        if (!response.ok)
            return;


        const data =
            await response
                .json()
                .catch(() => ({}));


        if (
            data.loggedIn ||
            data.authenticated
        ) {

            ownerLoggedIn =
                true;
        }

    } catch (error) {

        console.warn(
            "Owner session unavailable:",
            error
        );
    }
}


async function logoutOwner() {

    try {

        await fetch(
            `${API_BASE}/api/owner/logout`,
            {
                method: "POST",

                credentials:
                    "include"
            }
        );

    } catch (error) {

        console.warn(
            "Owner logout:",
            error
        );
    }


    ownerLoggedIn =
        false;


    hideOwnerPanel();
}


function openOwnerPanel() {

    if (!ownerPanel)
        return;


    ownerPanel.style.display =
        "flex";

    ownerPanel.setAttribute(
        "aria-hidden",
        "false"
    );
}


function hideOwnerPanel() {

    if (!ownerPanel)
        return;


    ownerPanel.style.display =
        "none";

    ownerPanel.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   OWNER DASHBOARD
========================================================= */

async function loadOwnerDashboard() {

    if (!ownerLoggedIn)
        return;


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


        if (!response.ok)
            throw new Error(
                data.error ||
                "Dashboard failed."
            );


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


async function loadOwnerUsers() {

    if (!ownerLoggedIn)
        return;


    try {

        const response =
            await fetch(
                `${API_BASE}/api/owner/users`,
                {
                    credentials:
                        "include"
                }
            );


        const data =
            await response
                .json()
                .catch(() => ({}));


        ownerActionMessage.textContent =
            `Users loaded: ${
                Array.isArray(data.users)
                    ? data.users.length
                    : data.count ||
                      0
            }`;

    } catch (error) {

        ownerActionMessage.textContent =
            "Could not load users.";
    }
}


async function loadOwnerSettings() {

    if (!ownerLoggedIn)
        return;


    try {

        const response =
            await fetch(
                `${API_BASE}/api/owner/settings`,
                {
                    credentials:
                        "include"
                }
            );


        const data =
            await response
                .json()
                .catch(() => ({}));


        ownerActionMessage.textContent =
            "Owner settings loaded.";

        console.log(
            "Owner settings:",
            data
        );

    } catch (error) {

        ownerActionMessage.textContent =
            "Could not load owner settings.";
    }
}


async function updateOwnerSettings(
    settings
) {

    if (!ownerLoggedIn)
        return;


    try {

        const response =
            await fetch(
                `${API_BASE}/api/owner/settings`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    body: JSON.stringify(
                        settings
                    )
                }
            );


        if (!response.ok)
            throw new Error(
                "Settings update failed."
            );


        ownerActionMessage.textContent =
            "Settings updated.";

    } catch (error) {

        ownerActionMessage.textContent =
            "Could not update settings.";
    }
}


/* =========================================================
   OWNER TRAINER
========================================================= */

function openTrainer() {

    if (!trainerContainer)
        return;


    trainerContainer.innerHTML = `
        <div style="
            margin-top:20px;
            padding:18px;
            border:1px solid #222;
            border-radius:14px;
            background:#080808;
        ">

            <h3>Teach MoonPlug</h3>

            <input
                id="trainingQuestion"
                placeholder="Question"
                style="margin-bottom:8px;"
            >

            <input
                id="trainingAnswer"
                placeholder="Answer"
                style="margin-bottom:8px;"
            >

            <input
                id="trainingCategory"
                placeholder="Category"
                style="margin-bottom:12px;"
            >

            <button
                id="teachButton"
                type="button"
            >
                Teach MoonPlug
            </button>

            <button
                id="refreshTrainingButton"
                type="button"
                style="margin-left:8px;"
            >
                Refresh
            </button>

            <div
                id="trainingList"
                style="margin-top:15px;"
            ></div>

        </div>
    `;


    const teachButton =
        document.getElementById(
            "teachButton"
        );


    const refreshButton =
        document.getElementById(
            "refreshTrainingButton"
        );


    if (teachButton) {

        teachButton.addEventListener(
            "click",
            teachMoonPlug
        );
    }


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            refreshTraining
        );
    }


    loadAndRenderTraining();
}


function closeTrainer() {

    if (trainerContainer) {

        trainerContainer.innerHTML =
            "";
    }
}


async function teachMoonPlug() {

    const question =
        document.getElementById(
            "trainingQuestion"
        )?.value.trim();


    const answer =
        document.getElementById(
            "trainingAnswer"
        )?.value.trim();


    const category =
        document.getElementById(
            "trainingCategory"
        )?.value.trim();


    if (
        !question ||
        !answer
    ) {

        ownerActionMessage.textContent =
            "Enter both a question and answer.";

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/api/owner/training`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    body: JSON.stringify({
                        question,
                        answer,
                        category:
                            category ||
                            "General"
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
                "Training failed."
            );
        }


        document.getElementById(
            "trainingQuestion"
        ).value = "";

        document.getElementById(
            "trainingAnswer"
        ).value = "";

        document.getElementById(
            "trainingCategory"
        ).value = "";


        ownerActionMessage.textContent =
            "MoonPlug learned the new training.";


        await refreshTraining();


    } catch (error) {

        ownerActionMessage.textContent =
            error.message ||
            "Could not add training.";
    }
}


async function loadTraining() {

    const response =
        await fetch(
            `${API_BASE}/api/owner/training`,
            {
                credentials:
                    "include"
            }
        );


    const data =
        await response
            .json()
            .catch(() => ({}));


    if (!response.ok) {

        throw new Error(
            data.error ||
            "Training could not be loaded."
        );
    }


    return data.training ||
        data.items ||
        [];
}


async function loadAndRenderTraining() {

    try {

        const training =
            await loadTraining();


        renderTrainingList(
            training
        );

    } catch (error) {

        const list =
            document.getElementById(
                "trainingList"
            );


        if (list) {

            list.textContent =
                "Could not load training.";
        }
    }
}


function renderTrainingList(
    training
) {

    const list =
        document.getElementById(
            "trainingList"
        );


    if (!list)
        return;


    list.innerHTML = "";


    if (!Array.isArray(training) ||
        !training.length
    ) {

        list.textContent =
            "No training yet.";

        return;
    }


    training.forEach(
        item => {

            const row =
                document.createElement(
                    "div"
                );


            row.style.cssText = `
                padding:12px;
                margin-top:8px;
                border:1px solid #191919;
                border-radius:10px;
                background:#0b0b0b;
            `;


            const question =
                document.createElement(
                    "strong"
                );


            question.textContent =
                item.question ||
                "Training";


            const answer =
                document.createElement(
                    "div"
                );


            answer.style.cssText =
                "color:#888;margin-top:5px;";


            answer.textContent =
                item.answer ||
                "";


            row.appendChild(
                question
            );

            row.appendChild(
                answer
            );


            if (item.id) {

                const deleteButton =
                    document.createElement(
                        "button"
                    );


                deleteButton.textContent =
                    "Delete";


                deleteButton.style.marginTop =
                    "10px";


                deleteButton.addEventListener(
                    "click",
                    () =>
                        deleteTraining(
                            item.id
                        )
                );


                row.appendChild(
                    deleteButton
                );
            }


            list.appendChild(
                row
            );
        }
    );
}


async function deleteTraining(
    id
) {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/owner/training/${encodeURIComponent(id)}`,
                {
                    method: "DELETE",

                    credentials:
                        "include"
                }
            );


        if (!response.ok)
            throw new Error();


        await refreshTraining();

    } catch {

        ownerActionMessage.textContent =
            "Could not delete training.";
    }
}


async function addTraining(
    training
) {

    return fetch(
        `${API_BASE}/api/owner/training`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            credentials:
                "include",

            body: JSON.stringify(
                training
            )
        }
    );
}


async function refreshTraining() {

    await loadAndRenderTraining();
}


/* =========================================================
   BACKEND HEALTH
========================================================= */

async function checkBackendHealth() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/health`,
                {
                    method: "GET"
                }
            );


        console.log(
            "MoonPlug backend:",
            response.ok
                ? "online"
                : "offline"
        );

    } catch (error) {

        console.warn(
            "MoonPlug backend is unavailable.",
            error
        );
    }
}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

function setupPasswordToggle() {

    if (!showPassword)
        return;


    showPassword.addEventListener(
        "click",
        () => {

            const showing =
                ownerCode.type ===
                "text";


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
}


/* =========================================================
   AUTO RESIZE / MOBILE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth >
            700
        ) {

            sidebar.classList.remove(
                "expanded"
            );
        }
    }
);


/* =========================================================
   CLEANUP
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        stopConversationListening();

        stopConversationSpeech();

        saveConversation();
    }
);


/* =========================================================
   START SPEECH SYSTEM
========================================================= */

setupSpeechSynthesis();


/* =========================================================
   GLOBAL ACCESS
   Useful for debugging from console.
========================================================= */

window.MoonPlug = {

    openConversation,

    closeConversation,

    startListening:
        toggleConversationListening,

    stopListening:
        stopConversationListening,

    speak:
        speakConversation,

    stopSpeaking:
        stopConversationSpeech,

    newChat:
        startNewChat,

    openOwnerLogin:
        showOwnerLogin,

    openOwnerPanel,

    hideOwnerPanel,

    refreshTraining
};

