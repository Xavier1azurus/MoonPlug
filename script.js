
/* =========================================================
   MOONPLUG AI
   COMPLETE JAVASCRIPT
   CHAT + CONVERSATION MODE + VOICE WAVE
========================================================= */

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const API_BASE =
    "https://moonplug.onrender.com";

const OWNER_TRIGGER =
    "15912014";


/* =========================================================
   GLOBALS
========================================================= */

let sidebar = null;

let conversationMode = null;
let conversationMic = null;
let conversationSpeaker = null;
let conversationText = null;
let conversationStatus = null;
let voiceWave = null;

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

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cacheElements();

        createStars();

        setupSidebar();

        setupChat();

        setupConversation();

        setupConversationHistory();

        setupSettings();

        setupAccount();

        setupAccountForms();

        setupOwner();

        setupPasswordToggle();

        loadTextSize();

        loadConversation();

        loadSpeechVoices();

        setupSpeechVoiceEvents();

        setupSpeechRecognition();

        checkBackendHealth();
    }
);


/* =========================================================
   CACHE
========================================================= */

function cacheElements() {

    sidebar =
        document.getElementById(
            "sidebar"
        );

    conversationMode =
        document.getElementById(
            "conversationMode"
        );

    conversationMic =
        document.getElementById(
            "conversationMic"
        );

    conversationSpeaker =
        document.getElementById(
            "conversationSpeaker"
        );

    conversationText =
        document.getElementById(
            "conversationText"
        );

    conversationStatus =
        document.getElementById(
            "conversationStatus"
        );

    voiceWave =
        document.getElementById(
            "voiceWave"
        );
}


/* =========================================================
   STARS
========================================================= */

function createStars() {

    const field =
        document.getElementById(
            "starField"
        );

    if (!field) return;

    field.innerHTML = "";

    const amount =
        window.innerWidth < 700
            ? 55
            : 90;

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const star =
            document.createElement(
                "div"
            );

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
            `${Math.random() * 2 + .5}px`
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
        document.getElementById(
            "sidebarLogo"
        );

    if (logo) {

        logo.addEventListener(
            "click",
            () => {

                if (
                    window.innerWidth <= 900
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
   CHAT
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

    if (!input || !send)
        return;


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

    if (!input || !send)
        return;


    const message =
        input.value.trim();

    if (!message)
        return;


    addMessage(
        message,
        "user"
    );

    input.value = "";

    input.style.height =
        "auto";

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
                .catch(
                    () => ({})
                );


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

    if (!messages)
        return;


    if (empty)
        empty.remove();


    const bubble =
        document.createElement(
            "div"
        );

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
   CONVERSATION SETUP
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
   CONVERSATION CHOOSER
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

    if (!history)
        return;


    history.classList.remove(
        "active"
    );

    history.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   OPEN CONVERSATION MODE
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


    resetVoiceWave();
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


    recognition.onstart =
        () => {

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


    recognition.onend =
        () => {

            conversationListening =
                false;


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
   LISTENING
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
   SEND CONVERSATION TO AI
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
                .catch(
                    () => ({})
                );


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
         * Also put the conversation
         * into normal chat history.
         */

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

        stopVoiceWave();


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

    if (
        !("speechSynthesis" in window)
    )
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
   MOONPLUG SPEECH
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


    window.speechSynthesis.cancel();


    window.speechSynthesis.speak(
        utterance
    );
}


/* =========================================================
   WHITE VOICE WAVE
========================================================= */

/*
 * IMPORTANT:
 *
 * The browser SpeechSynthesis API does not expose the
 * actual speaker audio waveform to JavaScript.
 *
 * Therefore this creates a smooth voice-reactive-looking
 * waveform that runs for exactly as long as MoonPlug speaks.
 *
 * The black hole itself NEVER moves.
 */

function startVoiceWave() {

    if (!voiceWave)
        return;


    stopVoiceWave();


    const bars =
        Array.from(
            voiceWave.querySelectorAll(
                "span"
            )
        );


    if (!bars.length)
        return;


    let phase = 0;


    function animate() {

        if (!conversationSpeaking)
            return;


        phase += .13;


        const middle =
            (bars.length - 1) / 2;


        bars.forEach(
            (bar, index) => {

                const distance =
                    Math.abs(
                        index - middle
                    ) / middle;


                /*
                 * Multiple waves combined together
                 * make it look more like a real voice.
                 */

                const waveOne =
                    Math.sin(
                        phase * 1.7 +
                        index * .75
                    );


                const waveTwo =
                    Math.sin(
                        phase * 2.8 -
                        index * .42
                    );


                const waveThree =
                    Math.sin(
                        phase * 4.1 +
                        index * .19
                    );


                const centerBoost =
                    1 - distance * .55;


                const value =
                    (
                        Math.abs(waveOne) * .52 +
                        Math.abs(waveTwo) * .28 +
                        Math.abs(waveThree) * .20
                    );


                const height =
                    .12 +
                    value *
                    .88 *
                    centerBoost;


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


/* =========================================================
   STOP WAVE
========================================================= */

function stopVoiceWave() {

    if (speechTimer) {

        cancelAnimationFrame(
            speechTimer
        );

        speechTimer =
            null;
    }


    resetVoiceWave();
}


/* =========================================================
   RESET WAVE
========================================================= */

function resetVoiceWave() {

    if (!voiceWave)
        return;


    const bars =
        voiceWave.querySelectorAll(
            "span"
        );


    bars.forEach(
        bar => {

            bar.style.transform =
                "scaleY(.08)";
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

        conversationText.textContent =
            "Tap the microphone to talk";
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

    if (!panel)
        return;


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

    if (!panel)
        return;


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
            "accountButton"
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
            showLoginTab
        );
    }


    if (signupTab) {

        signupTab.addEventListener(
            "click",
            showSignupTab
        );
    }
}


function openAccount() {

    const screen =
        document.getElementById(
            "accountScreen"
        );

    if (!screen)
        return;


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

    if (!screen)
        return;


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


    login.hidden =
        false;

    signup.hidden =
        true;

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


    login.hidden =
        true;

    signup.hidden =
        false;

    loginTab.classList.remove(
        "active"
    );

    signupTab.classList.add(
        "active"
    );
}


/* =========================================================
   ACCOUNT FORMS
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


/* =========================================================
   HIDDEN OWNER ACCESS
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


    /*
     * The owner button is NOT shown publicly.
     *
     * Type the private trigger anywhere on the page.
     */

    let triggerBuffer = "";


    document.addEventListener(
        "keydown",
        event => {

            /*
             * Don't capture characters while
             * typing normally into inputs.
             */

            const target =
                event.target;


            const isTyping =
                target &&
                (
                    target.tagName ===
                        "INPUT" ||
                    target.tagName ===
                        "TEXTAREA"
                );


            if (isTyping)
                return;


            if (
                event.key.length !== 1
            )
                return;


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


/* =========================================================
   SHOW OWNER LOGIN
========================================================= */

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


/* =========================================================
   HIDE OWNER LOGIN
========================================================= */

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


/* =========================================================
   OWNER LOGIN
========================================================= */

async function loginOwner() {

    const codeInput =
        document.getElementById(
            "ownerCode"
        );

    const errorElement =
        document.getElementById(
            "ownerError"
        );


    if (!codeInput)
        return;


    const code =
        codeInput.value.trim();


    if (!code) {

        if (errorElement) {

            errorElement.textContent =
                "Enter the owner code.";
        }

        return;
    }


    if (errorElement) {

        errorElement.textContent =
            "Checking...";
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
                .catch(
                    () => ({})
                );


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


    } catch (err) {

        console.error(
            "Owner login:",
            err
        );


        /*
         * FIXED:
         *
         * The old version used `error` for both
         * the DOM element and the catch variable.
         *
         * This version uses `errorElement`
         * and `err` separately.
         */

        if (errorElement) {

            errorElement.textContent =
                err.message ||
                "Owner login failed.";
        }
    }
}


/* =========================================================
   OWNER PANEL
========================================================= */

function openOwnerPanel() {

    const panel =
        document.getElementById(
            "ownerPanel"
        );

    if (!panel)
        return;


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

    if (!panel)
        return;


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
                .catch(
                    () => ({})
                );


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


        if (!response.ok) {

            throw new Error(
                "Backend unavailable"
            );
        }


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
   PASSWORD TOGGLE
========================================================= */

function setupPasswordToggle() {

    const button =
        document.getElementById(
            "showPassword"
        );

    if (!button)
        return;


    button.addEventListener(
        "click",
        () => {

            const input =
                document.getElementById(
                    "ownerCode"
                );

            if (!input)
                return;


            if (
                input.type ===
                "password"
            ) {

                input.type =
                    "text";

                button.textContent =
                    "Hide";

            } else {

                input.type =
                    "password";

                button.textContent =
                    "Show";
            }
        }
    );
}


/* =========================================================
   OWNER PLACEHOLDERS
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

