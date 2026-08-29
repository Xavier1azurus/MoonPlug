/* =========================================================
   MOONPLUG AI
   COMPLETE JAVASCRIPT
========================================================= */

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const API_BASE = "https://moonplug.onrender.com";

const OWNER_TRIGGER = "15912014";

let sidebar;
let conversationMode;
let conversationMic;
let conversationSpeaker;
let conversationText;
let conversationStatus;
let voiceWave;

let recognition = null;
let recognitionAvailable = false;

let conversationListening = false;
let conversationSpeaking = false;

let speechVoices = [];
let speechTimer = null;

let conversationMessages = [];

let ownerAuthenticated = false;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    cacheElements();

    createStars();

    setupSidebar();

    setupChat();

    setupConversation();

    setupConversationHistory();

    setupSettings();

    setupAccount();

    setupOwner();

    loadTextSize();

    loadConversation();

    loadSpeechVoices();

    setupSpeechVoiceEvents();

    setupSpeechRecognition();

    checkBackendHealth();

});


/* =========================================================
   CACHE ELEMENTS
========================================================= */

function cacheElements() {

    sidebar =
        document.getElementById("sidebar");

    conversationMode =
        document.getElementById("conversationMode");

    conversationMic =
        document.getElementById("conversationMic");

    conversationSpeaker =
        document.getElementById("conversationSpeaker");

    conversationText =
        document.getElementById("conversationText");

    conversationStatus =
        document.getElementById("conversationStatus");

    voiceWave =
        document.getElementById("voiceWave");
}


/* =========================================================
   STAR FIELD
========================================================= */

function createStars() {

    const field =
        document.getElementById("starField");

    if (!field) return;

    field.innerHTML = "";

    const amount =
        window.innerWidth < 700
            ? 55
            : 90;

    for (let i = 0; i < amount; i++) {

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
            `${Math.random() * 5 + 1}px`
        );

        star.style.setProperty(
            "--star-duration",
            `${Math.random() * 5 + 3}s`
        );

        star.style.setProperty(
            "--star-delay",
            `${Math.random() * -8}s`
        );

        star.style.setProperty(
            "--star-scale",
            `${Math.random() * .5 + .5}`
        );

        star.style.setProperty(
            "--star-move-x",
            `${Math.random() * 10 - 5}px`
        );

        star.style.setProperty(
            "--star-move-y",
            `${Math.random() * 10 - 5}px`
        );

        field.appendChild(star);
    }
}


/* =========================================================
   SIDEBAR
========================================================= */

function setupSidebar() {

    const logo =
        document.getElementById("sidebarLogo");

    if (logo) {

        logo.addEventListener(
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


    const conversationButton =
        document.getElementById(
            "conversationButton"
        );

    if (conversationButton) {

        conversationButton.addEventListener(
            "click",
            openConversationChooser
        );
    }


    const newChatButton =
        document.getElementById(
            "newChatButton"
        );

    if (newChatButton) {

        newChatButton.addEventListener(
            "click",
            startNewChat
        );
    }


    const historyButton =
        document.getElementById(
            "historyButton"
        );

    if (historyButton) {

        historyButton.addEventListener(
            "click",
            () => {

                alert(
                    "Chat history is available in MoonPlug."
                );
            }
        );
    }
}


/* =========================================================
   MAIN CHAT
========================================================= */

function setupChat() {

    const input =
        document.getElementById(
            "messageInput"
        );

    const send =
        document.getElementById(
            "sendButton"
        );

    if (!input || !send) return;


    send.addEventListener(
        "click",
        sendMessage
    );


    input.addEventListener(
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


    input.addEventListener(
        "input",
        () => {

            input.style.height =
                "auto";

            input.style.height =
                Math.min(
                    input.scrollHeight,
                    180
                ) + "px";
        }
    );
}


/* =========================================================
   NORMAL CHAT
========================================================= */

async function sendMessage() {

    const input =
        document.getElementById(
            "messageInput"
        );

    const send =
        document.getElementById(
            "sendButton"
        );

    if (!input || !send) return;


    const message =
        input.value.trim();

    if (!message) return;


    addMessage(
        message,
        "user"
    );

    input.value = "";
    input.style.height = "auto";

    showTyping();

    send.disabled = true;


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
                        message
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


        addMessage(
            String(reply),
            "ai"
        );


    } catch (error) {

        console.error(
            "Chat error:",
            error
        );


        addMessage(
            "I couldn't connect to MoonPlug right now.",
            "ai"
        );


    } finally {

        hideTyping();

        send.disabled = false;

        input.focus();
    }
}


/* =========================================================
   ADD MESSAGE
========================================================= */

function addMessage(
    text,
    sender
) {

    const messages =
        document.getElementById(
            "messages"
        );

    const empty =
        document.getElementById(
            "emptyChat"
        );

    if (!messages) return;

    if (empty) {
        empty.remove();
    }


    const bubble =
        document.createElement("div");

    bubble.className =
        `message-bubble ${sender}`;


    bubble.textContent =
        String(text);


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

    const typing =
        document.getElementById(
            "typing"
        );

    if (typing) {

        typing.style.display =
            "flex";
    }
}


function hideTyping() {

    const typing =
        document.getElementById(
            "typing"
        );

    if (typing) {

        typing.style.display =
            "none";
    }
}


/* =========================================================
   CONVERSATION MODE
========================================================= */

function setupConversation() {

    const close =
        document.getElementById(
            "conversationClose"
        );


    if (close) {

        close.addEventListener(
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
            stopConversationSpeaking
        );
    }
}


/* =========================================================
   OPEN CONVERSATION CHOOSER
========================================================= */

function openConversationChooser() {

    const history =
        document.getElementById(
            "conversationHistory"
        );

    const saved =
        getSavedConversation();


    if (
        !saved ||
        !saved.length
    ) {

        openConversationMode(
            true
        );

        return;
    }


    if (history) {

        history.classList.add(
            "active"
        );

        history.setAttribute(
            "aria-hidden",
            "false"
        );
    }
}


/* =========================================================
   HISTORY
========================================================= */

function setupConversationHistory() {

    const close =
        document.getElementById(
            "conversationHistoryClose"
        );

    const newButton =
        document.getElementById(
            "newConversationButton"
        );

    const continueButton =
        document.getElementById(
            "continueConversationButton"
        );


    if (close) {

        close.addEventListener(
            "click",
            closeConversationHistory
        );
    }


    if (newButton) {

        newButton.addEventListener(
            "click",
            () => {

                clearConversation();

                closeConversationHistory();

                openConversationMode(
                    true
                );
            }
        );
    }


    if (continueButton) {

        continueButton.addEventListener(
            "click",
            () => {

                loadConversation();

                closeConversationHistory();

                openConversationMode(
                    false
                );
            }
        );
    }
}


function closeConversationHistory() {

    const history =
        document.getElementById(
            "conversationHistory"
        );

    if (!history) return;

    history.classList.remove(
        "active"
    );

    history.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   OPEN / CLOSE MODE
========================================================= */

function openConversationMode(
    fresh = false
) {

    if (!conversationMode)
        return;


    if (fresh) {

        clearConversation();
    }


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
        "Tap the microphone to talk";
}


function closeConversation() {

    stopConversationListening();

    stopConversationSpeaking();

    if (!conversationMode)
        return;


    conversationMode.classList.remove(
        "active"
    );

    conversationMode.setAttribute(
        "aria-hidden",
        "true"
    );


    setConversationState(
        "idle"
    );
}


/* =========================================================
   STATE
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


    if (state !== "idle") {

        conversationMode.classList.add(
            state
        );
    }


    const labels = {

        idle:
            "Ready",

        listening:
            "Listening",

        thinking:
            "Thinking",

        talking:
            "Speaking"
    };


    if (conversationStatus) {

        conversationStatus.textContent =
            labels[state] ||
            "Ready";
    }


    if (
        conversationMic &&
        state === "listening"
    ) {

        conversationMic.classList.add(
            "active"
        );

    } else if (conversationMic) {

        conversationMic.classList.remove(
            "active"
        );
    }
}


/* =========================================================
   SPEECH RECOGNITION
========================================================= */

function setupSpeechRecognition() {

    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!Recognition) {

        recognitionAvailable =
            false;

        return;
    }


    recognitionAvailable =
        true;


    recognition =
        new Recognition();


    recognition.continuous =
        false;

    recognition.interimResults =
        true;

    recognition.lang =
        "en-US";


    recognition.onstart = () => {

        conversationListening =
            true;

        setConversationState(
            "listening"
        );

        conversationText.textContent =
            "Listening...";
    };


    recognition.onresult =
        event => {

            let transcript = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                transcript +=
                    event.results[i][0]
                        .transcript;
            }


            transcript =
                transcript.trim();


            if (transcript) {

                conversationText.textContent =
                    transcript;
            }


            const lastResult =
                event.results[
                    event.results.length - 1
                ];


            if (
                lastResult &&
                lastResult.isFinal
            ) {

                processConversationMessage(
                    transcript
                );
            }
        };


    recognition.onerror =
        event => {

            console.error(
                "Speech recognition:",
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

                conversationText.textContent =
                    "Microphone permission was denied.";

            } else {

                conversationText.textContent =
                    "I couldn't hear you. Try again.";
            }
        };


    recognition.onend = () => {

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
   START / STOP LISTENING
========================================================= */

function toggleConversationListening() {

    if (conversationSpeaking) {

        stopConversationSpeaking();

        return;
    }


    if (conversationListening) {

        stopConversationListening();

        return;
    }


    startConversationListening();
}


function startConversationListening() {

    if (!recognitionAvailable) {

        conversationText.textContent =
            "Speech recognition isn't supported in this browser.";

        return;
    }


    try {

        recognition.start();

    } catch (error) {

        console.warn(
            "Recognition could not start:",
            error
        );
    }
}


function stopConversationListening() {

    if (
        recognition &&
        conversationListening
    ) {

        try {

            recognition.stop();

        } catch (error) {

            console.warn(error);
        }
    }


    conversationListening =
        false;
}


/* =========================================================
   CONVERSATION → AI
========================================================= */

async function processConversationMessage(
    transcript
) {

    stopConversationListening();


    const cleanTranscript =
        String(
            transcript || ""
        ).trim();


    if (!cleanTranscript)
        return;


    saveConversationMessage(
        "user",
        cleanTranscript
    );


    setConversationState(
        "thinking"
    );


    conversationText.textContent =
        "MoonPlug is thinking...";


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
                            cleanTranscript
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


        addMessage(
            cleanTranscript,
            "user"
        );


        addMessage(
            cleanReply,
            "ai"
        );


        conversationText.textContent =
            cleanReply;


        /*
         * THIS IS THE IMPORTANT PART:
         * MoonPlug actually speaks the answer.
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
   SPEECH VOICES
========================================================= */

function loadSpeechVoices() {

    if (!("speechSynthesis" in window))
        return;


    speechVoices =
        window.speechSynthesis
            .getVoices();
}


function setupSpeechVoiceEvents() {

    if (
        "speechSynthesis" in window &&
        "onvoiceschanged" in
        window.speechSynthesis
    ) {

        window.speechSynthesis.onvoiceschanged =
            () => {

                loadSpeechVoices();
            };
    }
}


/* =========================================================
   CHOOSE ENGLISH VOICE
========================================================= */

function getEnglishVoice() {

    if (!speechVoices.length) {

        loadSpeechVoices();
    }


    const english =
        speechVoices.filter(
            voice =>
                /^en(-|_)/i.test(
                    voice.lang
                )
        );


    if (!english.length)
        return null;


    /*
     * Prefer an American English voice
     * when the device has one.
     */

    const american =
        english.find(
            voice =>
                /en-US/i.test(
                    voice.lang
                )
        );


    if (american)
        return american;


    return english[0];
}


/* =========================================================
   ACTUAL MOONPLUG SPEECH
========================================================= */

function speakConversation(
    text
) {

    if (
        !("speechSynthesis" in window)
    ) {

        conversationText.textContent =
            "Your browser doesn't support voice playback.";

        setConversationState(
            "idle"
        );

        return;
    }


    stopConversationSpeaking();


    const utterance =
        new SpeechSynthesisUtterance(
            String(text)
        );


    const voice =
        getEnglishVoice();


    if (voice) {

        utterance.voice =
            voice;
    }


    /*
     * Natural English voice settings.
     */

    utterance.lang =
        voice?.lang ||
        "en-US";

    utterance.rate =
        .95;

    utterance.pitch =
        1;

    utterance.volume =
        1;


    utterance.onstart =
        () => {

            conversationSpeaking =
                true;

            setConversationState(
                "talking"
            );

            startVoiceWave();
        };


    utterance.onend =
        () => {

            conversationSpeaking =
                false;

            stopVoiceWave();

            setConversationState(
                "idle"
            );
        };


    utterance.onerror =
        event => {

            console.error(
                "Speech synthesis error:",
                event
            );

            conversationSpeaking =
                false;

            stopVoiceWave();

            setConversationState(
                "idle"
            );
        };


    /*
     * Some mobile browsers need the
     * speech queue cleared first.
     */

    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(
        utterance
    );
}


/* =========================================================
   SPEAKING WAVE
========================================================= */

function startVoiceWave() {

    if (!voiceWave)
        return;


    stopVoiceWave();


    const bars =
        voiceWave.querySelectorAll(
            "span"
        );


    function animate() {

        if (!conversationSpeaking)
            return;


        bars.forEach(
            (bar, index) => {

                const center =
                    Math.abs(
                        index -
                        (bars.length - 1) / 2
                    );


                const centerStrength =
                    1 -
                    center /
                    ((bars.length - 1) / 2);


                const random =
                    Math.random();


                const height =
                    .2 +
                    random *
                    .75 *
                    Math.max(
                        .35,
                        centerStrength
                    );


                bar.style.transform =
                    `scaleY(${height})`;
            }
        );


        speechTimer =
            requestAnimationFrame(
                animate
            );
    }


    animate();
}


function stopVoiceWave() {

    if (speechTimer) {

        cancelAnimationFrame(
            speechTimer
        );

        speechTimer = null;
    }


    if (!voiceWave)
        return;


    const bars =
        voiceWave.querySelectorAll(
            "span"
        );


    bars.forEach(
        bar => {

            bar.style.transform =
                "scaleY(.12)";
        }
    );
}


/* =========================================================
   STOP SPEAKING
========================================================= */

function stopConversationSpeaking() {

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();
    }


    conversationSpeaking =
        false;


    stopVoiceWave();


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
    text
) {

    conversationMessages.push({
        role,
        text,
        timestamp:
            Date.now()
    });


    localStorage.setItem(
        "moonplugConversation",
        JSON.stringify(
            conversationMessages
        )
    );
}


function getSavedConversation() {

    try {

        const saved =
            localStorage.getItem(
                "moonplugConversation"
            );


        if (!saved)
            return [];


        const parsed =
            JSON.parse(saved);


        return Array.isArray(parsed)
            ? parsed
            : [];


    } catch {

        return [];
    }
}


function loadConversation() {

    conversationMessages =
        getSavedConversation();
}


function clearConversation() {

    conversationMessages = [];

    localStorage.removeItem(
        "moonplugConversation"
    );
}


/* =========================================================
   NEW CHAT
========================================================= */

function startNewChat() {

    const messages =
        document.getElementById(
            "messages"
        );

    if (!messages)
        return;


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
}


/* =========================================================
   SETTINGS
========================================================= */

function setupSettings() {

    const button =
        document.getElementById(
            "settingsButton"
        );

    const close =
        document.getElementById(
            "closeSettings"
        );


    if (button) {

        button.addEventListener(
            "click",
            openSettings
        );
    }


    if (close) {

        close.addEventListener(
            "click",
            closeSettings
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


    const themeButton =
        document.getElementById(
            "themeButton"
        );


    if (themeButton) {

        themeButton.addEventListener(
            "click",
            () => {

                document.body.classList.toggle(
                    "light-theme"
                );
            }
        );
    }
}


function openSettings() {

    const panel =
        document.getElementById(
            "settingsPanel"
        );

    if (!panel) return;

    panel.style.display =
        "flex";

    panel.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeSettings() {

    const panel =
        document.getElementById(
            "settingsPanel"
        );

    if (!panel) return;

    panel.style.display =
        "none";

    panel.setAttribute(
        "aria-hidden",
        "true"
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
        "moonplugTextSize",
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

    const size =
        localStorage.getItem(
            "moonplugTextSize"
        ) ||
        "medium";


    updateTextSize(
        size
    );
}


/* =========================================================
   ACCOUNT
========================================================= */

function setupAccount() {

    const account =
        document.getElementById(
            "ownerButton"
        );

    const close =
        document.getElementById(
            "closeAccount"
        );

    const loginTab =
        document.getElementById(
            "loginTab"
        );

    const signupTab =
        document.getElementById(
            "signupTab"
        );


    /*
     * Account remains available from
     * the sidebar.
     */

    if (account) {

        account.addEventListener(
            "click",
            openAccount
        );
    }


    if (close) {

        close.addEventListener(
            "click",
            closeAccount
        );
    }


    if (loginTab) {

        loginTab.addEventListener(
            "click",
            () => showLoginTab()
        );
    }


    if (signupTab) {

        signupTab.addEventListener(
            "click",
            () => showSignupTab()
        );
    }
}


function openAccount() {

    const screen =
        document.getElementById(
            "accountScreen"
        );

    if (!screen) return;

    screen.style.display =
        "flex";

    screen.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeAccount() {

    const screen =
        document.getElementById(
            "accountScreen"
        );

    if (!screen) return;

    screen.style.display =
        "none";

    screen.setAttribute(
        "aria-hidden",
        "true"
    );
}


function showLoginTab() {

    const login =
        document.getElementById(
            "loginForm"
        );

    const signup =
        document.getElementById(
            "signupForm"
        );

    const loginTab =
        document.getElementById(
            "loginTab"
        );

    const signupTab =
        document.getElementById(
            "signupTab"
        );


    login.hidden = false;
    signup.hidden = true;

    loginTab.classList.add(
        "active"
    );

    signupTab.classList.remove(
        "active"
    );
}


function showSignupTab() {

    const login =
        document.getElementById(
            "loginForm"
        );

    const signup =
        document.getElementById(
            "signupForm"
        );

    const loginTab =
        document.getElementById(
            "loginTab"
        );

    const signupTab =
        document.getElementById(
            "signupTab"
        );


    login.hidden = true;
    signup.hidden = false;

    loginTab.classList.remove(
        "active"
    );

    signupTab.classList.add(
        "active"
    );
}


/* =========================================================
   OWNER ACCESS
   15912014 TRIGGER
========================================================= */

function setupOwner() {

    const ownerLogin =
        document.getElementById(
            "ownerLoginButton"
        );

    const ownerCancel =
        document.getElementById(
            "ownerCancel"
        );

    const ownerLogout =
        document.getElementById(
            "ownerLogout"
        );

    const showPassword =
        document.getElementById(
            "showPassword"
        );


    if (ownerLogin) {

        ownerLogin.addEventListener(
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

                const input =
                    document.getElementById(
                        "ownerCode"
                    );


                if (
                    input.type ===
                    "password"
                ) {

                    input.type =
                        "text";

                    showPassword.textContent =
                        "Hide";

                } else {

                    input.type =
                        "password";

                    showPassword.textContent =
                        "Show";
                }
            }
        );
    }


    /*
     * Type 15912014 anywhere on the page
     * to open the hidden owner login.
     */

    let triggerBuffer = "";


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key.length !== 1
            ) {
                return;
            }


            triggerBuffer +=
                event.key;


            if (
                triggerBuffer.length >
                OWNER_TRIGGER.length
            ) {

                triggerBuffer =
                    triggerBuffer.slice(
                        -OWNER_TRIGGER.length
                    );
            }


            if (
                triggerBuffer ===
                OWNER_TRIGGER
            ) {

                triggerBuffer = "";

                showOwnerLogin();
            }
        }
    );
}


function showOwnerLogin() {

    const overlay =
        document.getElementById(
            "ownerLogin"
        );

    const code =
        document.getElementById(
            "ownerCode"
        );


    if (!overlay)
        return;


    overlay.style.display =
        "flex";

    overlay.setAttribute(
        "aria-hidden",
        "false"
    );


    if (code) {

        code.value = "";

        setTimeout(
            () => code.focus(),
            100
        );
    }
}


function hideOwnerLogin() {

    const overlay =
        document.getElementById(
            "ownerLogin"
        );

    if (!overlay)
        return;


    overlay.style.display =
        "none";

    overlay.setAttribute(
        "aria-hidden",
        "true"
    );
}


async function loginOwner() {

    const codeInput =
        document.getElementById(
            "ownerCode"
        );

    const error =
        document.getElementById(
            "ownerError"
        );


    const code =
        codeInput.value.trim();


    if (!code) {

        error.textContent =
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


        ownerAuthenticated =
            true;


        hideOwnerLogin();

        openOwnerPanel();

        loadOwnerDashboard();


    } catch (error) {

        console.error(
            "Owner login:",
            error
        );


        /*
         * The backend remains the authority.
         * Do not expose the owner panel merely
         * because the frontend code is entered.
         */

        error.textContent =
            error.message ||
            "Owner login failed.";
    }
}


function openOwnerPanel() {

    const panel =
        document.getElementById(
            "ownerPanel"
        );

    if (!panel) return;

    panel.style.display =
        "flex";

    panel.setAttribute(
        "aria-hidden",
        "false"
    );
}


function hideOwnerPanel() {

    const panel =
        document.getElementById(
            "ownerPanel"
        );

    if (!panel) return;

    panel.style.display =
        "none";

    panel.setAttribute(
        "aria-hidden",
        "true"
    );
}


async function logoutOwner() {

    try {

        await fetch(
            `${API_BASE}/api/owner/logout`,
            {
                method: "POST"
            }
        );

    } catch (error) {

        console.warn(
            "Owner logout:",
            error
        );
    }


    ownerAuthenticated =
        false;


    hideOwnerPanel();
}


/* =========================================================
   OWNER DASHBOARD
========================================================= */

async function loadOwnerDashboard() {

    if (!ownerAuthenticated)
        return;


    try {

        const response =
            await fetch(
                `${API_BASE}/api/owner/dashboard`
            );


        if (!response.ok)
            return;


        const data =
            await response
                .json()
                .catch(() => ({}));


        const users =
            document.getElementById(
                "ownerUsers"
            );

        const chats =
            document.getElementById(
                "ownerChats"
            );


        if (users) {

            users.textContent =
                data.users ??
                data.totalUsers ??
                0;
        }


        if (chats) {

            chats.textContent =
                data.chats ??
                data.totalChats ??
                0;
        }


    } catch (error) {

        console.warn(
            "Dashboard:",
            error
        );
    }
}


/* =========================================================
   BACKEND HEALTH
========================================================= */

async function checkBackendHealth() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/health`
            );


        if (!response.ok)
            throw new Error(
                "Backend unavailable"
            );


        console.log(
            "MoonPlug backend online."
        );


    } catch (error) {

        console.warn(
            "MoonPlug backend health:",
            error
        );
    }
}


/* =========================================================
   PLACEHOLDER OWNER FUNCTIONS
========================================================= */

async function loadOwnerUsers() {
    console.log(
        "Owner users requested."
    );
}


async function loadOwnerSettings() {
    console.log(
        "Owner settings requested."
    );
}


async function updateOwnerSettings() {
    console.log(
        "Owner settings update requested."
    );
}


async function loadTraining() {
    console.log(
        "Training requested."
    );
}


async function addTraining() {
    console.log(
        "Add training requested."
    );
}


async function deleteTraining() {
    console.log(
        "Delete training requested."
    );
}


function openTrainer() {
    console.log(
        "Trainer opened."
    );
}


function closeTrainer() {
    console.log(
        "Trainer closed."
    );
}


async function generateTraining() {
    console.log(
        "Generate training requested."
    );
}


async function loadAndRenderTraining() {
    console.log(
        "Loading training."
    );
}


function renderTrainingList() {
    console.log(
        "Rendering training."
    );
}


async function teachMoonPlug() {
    console.log(
        "Teaching MoonPlug."
    );
}


async function refreshTraining() {
    console.log(
        "Refreshing training."
    );
}


/* =========================================================
   PASSWORD TOGGLE COMPATIBILITY
========================================================= */

function setupPasswordToggle() {
    const button =
        document.getElementById(
            "showPassword"
        );

    if (!button) return;

    button.onclick = () => {

        const input =
            document.getElementById(
                "ownerCode"
            );

        if (!input) return;

        input.type =
            input.type === "password"
                ? "text"
                : "password";

        button.textContent =
            input.type === "password"
                ? "Show"
                : "Hide";
    };
}


/* =========================================================
   ACCOUNT FORM COMPATIBILITY
========================================================= */

function setupAccountForms() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );

    const signupForm =
        document.getElementById(
            "signupForm"
        );


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const message =
                    document.getElementById(
                        "accountMessage"
                    );

                if (message) {

                    message.textContent =
                        "Account login can be connected to your backend.";
                }
            }
        );
    }


    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const message =
                    document.getElementById(
                        "accountMessage"
                    );

                if (message) {

                    message.textContent =
                        "Account creation can be connected to your backend.";
                }
            }
        );
    }
}


setupAccountForms();
