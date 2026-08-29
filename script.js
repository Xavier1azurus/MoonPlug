
"use strict";

/* =========================================================
   MOONPLUG AI
   COMPLETE FRONTEND JAVASCRIPT
   BACKEND UNCHANGED
   USER-SELECTABLE VOICE
========================================================= */

const API_BASE = "https://moonplug.onrender.com";

let recognition = null;
let recognitionSupported = false;

let listening = false;
let speaking = false;
let thinking = false;

let speechAnimationFrame = null;
let speechVoices = [];

let conversationRequestId = 0;


/* =========================================================
   DOM HELPER
========================================================= */

const $ = id => document.getElementById(id);


/* =========================================================
   STARTUP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /*
     * Absolutely nothing should start thinking,
     * listening, or speaking when the page loads.
     */

    thinking = false;
    listening = false;
    speaking = false;

    hideTyping();

    createStars();

    setupSidebar();
    setupChat();
    setupConversation();
    setupSettings();
    setupAccount();

    setupSpeechRecognition();

    loadSpeechVoices();
    setupVoiceLoading();
    setupVoiceSelector();

    loadTextSize();

    checkBackendHealth();

});


/* =========================================================
   STARS
========================================================= */

function createStars() {

    const field = $("starField");

    if (!field) return;

    field.innerHTML = "";

    const amount =
        window.innerWidth <= 600
            ? 55
            : 95;

    for (let i = 0; i < amount; i++) {

        const star =
            document.createElement("div");

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
            `${Math.random() * 2 + 0.5}px`
        );

        star.style.setProperty(
            "--star-opacity",
            `${Math.random() * 0.6 + 0.2}`
        );

        star.style.setProperty(
            "--star-glow",
            `${Math.random() * 5 + 2}px`
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
            `${Math.random() * 0.6 + 0.5}`
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

    const sidebar = $("sidebar");
    const logo = $("sidebarLogo");

    if (logo && sidebar) {

        logo.addEventListener("click", () => {

            /*
             * One click on the MoonPlug logo
             * collapses/expands the sidebar.
             */

            sidebar.classList.toggle("collapsed");

            /*
             * Also support the mobile class
             * if the CSS uses it.
             */

            sidebar.classList.toggle("expanded");

        });
    }


    const conversation =
        $("conversationButton");

    if (conversation) {

        conversation.addEventListener(
            "click",
            openConversation
        );
    }


    const newChat =
        $("newChatButton");

    if (newChat) {

        newChat.addEventListener(
            "click",
            startNewChat
        );
    }


    const settings =
        $("settingsButton");

    if (settings) {

        settings.addEventListener(
            "click",
            openSettings
        );
    }


    const account =
        $("accountButton");

    if (account) {

        account.addEventListener(
            "click",
            openAccount
        );
    }


    const history =
        $("historyButton");

    if (history) {

        history.addEventListener(
            "click",
            () => {

                addMessage(
                    "Chat history is coming soon.",
                    "ai"
                );

            }
        );
    }
}


/* =========================================================
   NORMAL CHAT
========================================================= */

function setupChat() {

    const input =
        $("messageInput");

    const button =
        $("sendButton");

    if (!input || !button) return;


    button.addEventListener(
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

            input.style.height = "auto";

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
        $("messageInput");

    const button =
        $("sendButton");

    if (!input || !button) return;


    const message =
        input.value.trim();


    /*
     * EMPTY INPUT DOES NOTHING.
     *
     * This prevents the old
     * "MoonPlug is thinking..."
     * problem.
     */

    if (!message) {

        hideTyping();

        thinking = false;

        return;
    }


    thinking = true;


    addMessage(
        message,
        "user"
    );


    input.value = "";

    input.style.height = "auto";

    button.disabled = true;

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
                        message: message
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
            "MoonPlug chat error:",
            error
        );


        addMessage(
            "I couldn't connect to MoonPlug right now.",
            "ai"
        );


    } finally {

        thinking = false;

        hideTyping();

        button.disabled = false;

        input.focus();
    }
}


/* =========================================================
   MESSAGES
========================================================= */

function addMessage(
    text,
    sender
) {

    const messages =
        $("messages");

    const empty =
        $("emptyChat");

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
   THINKING INDICATOR
========================================================= */

function showTyping() {

    const typing =
        $("typing");

    if (!typing) return;

    typing.hidden = false;

    typing.style.display = "flex";
}


function hideTyping() {

    const typing =
        $("typing");

    if (!typing) return;

    typing.hidden = true;

    typing.style.display = "none";
}


/* =========================================================
   NEW CHAT
========================================================= */

function startNewChat() {

    stopSpeaking();

    stopListening();

    thinking = false;

    hideTyping();


    const messages =
        $("messages");

    if (!messages) return;


    messages.innerHTML = `
        <div id="emptyChat" class="empty-chat">

            <div class="home-orb">
                <span></span>
            </div>

            <h1>What can I help with?</h1>

            <p>Ask MoonPlug anything.</p>

        </div>
    `;
}


/* =========================================================
   CONVERSATION MODE
========================================================= */

function setupConversation() {

    const close =
        $("conversationClose");

    const mic =
        $("conversationMic");


    if (close) {

        close.addEventListener(
            "click",
            closeConversation
        );
    }


    if (mic) {

        mic.addEventListener(
            "click",
            handleConversationButton
        );
    }
}


function openConversation() {

    const mode =
        $("conversationMode");

    if (!mode) return;


    /*
     * Opening conversation mode must NEVER
     * start thinking automatically.
     */

    thinking = false;

    listening = false;

    speaking = false;

    hideTyping();


    mode.classList.add("active");

    mode.setAttribute(
        "aria-hidden",
        "false"
    );


    setConversationState(
        "idle"
    );


    setConversationText(
        "Tap the microphone to talk"
    );


    resumeSpeechEngine();
}


function closeConversation() {

    stopListening();

    stopSpeaking();

    thinking = false;


    const mode =
        $("conversationMode");

    if (!mode) return;


    mode.classList.remove(
        "active",
        "listening",
        "thinking",
        "talking"
    );


    mode.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   ONE CONVERSATION BUTTON
========================================================= */

function handleConversationButton() {

    /*
     * Speaking -> stop speaking.
     */

    if (speaking) {

        stopSpeaking();

        setConversationState(
            "idle"
        );

        setConversationText(
            "Tap the microphone to talk"
        );

        return;
    }


    /*
     * Listening -> stop listening.
     */

    if (listening) {

        stopListening();

        setConversationText(
            "Tap the microphone to talk"
        );

        return;
    }


    /*
     * Otherwise -> start listening.
     */

    startListening();
}


/* =========================================================
   CONVERSATION STATE
========================================================= */

function setConversationState(
    state
) {

    const mode =
        $("conversationMode");

    const status =
        $("conversationStatus");

    if (!mode) return;


    mode.classList.remove(
        "listening",
        "thinking",
        "talking"
    );


    if (state !== "idle") {

        mode.classList.add(
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


    if (status) {

        status.textContent =
            labels[state] ||
            "Ready";
    }
}


function setConversationText(
    text
) {

    const element =
        $("conversationText");

    if (element) {

        element.textContent =
            String(text);
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

        recognitionSupported = false;

        return;
    }


    recognitionSupported = true;


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

            listening = true;

            thinking = false;

            setConversationState(
                "listening"
            );

            setConversationText(
                "Listening..."
            );
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


            /*
             * Show exactly what the user said.
             */

            if (transcript) {

                setConversationText(
                    transcript
                );
            }


            const last =
                event.results[
                    event.results.length - 1
                ];


            if (
                last &&
                last.isFinal &&
                transcript
            ) {

                processConversation(
                    transcript
                );
            }
        };


    recognition.onerror =
        event => {

            console.warn(
                "Speech recognition:",
                event.error
            );


            listening = false;


            if (
                event.error ===
                "not-allowed"
            ) {

                setConversationState(
                    "idle"
                );

                setConversationText(
                    "Microphone permission was denied."
                );

            } else if (
                event.error ===
                "no-speech"
            ) {

                setConversationState(
                    "idle"
                );

                setConversationText(
                    "I didn't hear anything. Tap to try again."
                );

            } else {

                setConversationState(
                    "idle"
                );

                setConversationText(
                    "Microphone error. Try again."
                );
            }
        };


    recognition.onend =
        () => {

            listening = false;


            if (
                !thinking &&
                !speaking
            ) {

                setConversationState(
                    "idle"
                );
            }
        };
}


/* =========================================================
   START LISTENING
========================================================= */

function startListening() {

    if (!recognitionSupported) {

        setConversationState(
            "idle"
        );

        setConversationText(
            "Speech recognition isn't supported in this browser."
        );

        return;
    }


    stopSpeaking();


    try {

        recognition.start();

    } catch (error) {

        console.warn(
            "Recognition start:",
            error
        );


        try {

            recognition.stop();

        } catch {}


        setTimeout(
            () => {

                try {

                    recognition.start();

                } catch {}

            },
            200
        );
    }
}


/* =========================================================
   STOP LISTENING
========================================================= */

function stopListening() {

    if (recognition) {

        try {

            recognition.stop();

        } catch {}
    }


    listening = false;


    if (
        !thinking &&
        !speaking
    ) {

        setConversationState(
            "idle"
        );
    }
}


/* =========================================================
   CONVERSATION BACKEND
   SAME BACKEND AS BEFORE
========================================================= */

async function processConversation(
    transcript
) {

    stopListening();


    const message =
        String(
            transcript || ""
        ).trim();


    if (!message) {

        thinking = false;

        setConversationState(
            "idle"
        );

        setConversationText(
            "Tap the microphone to talk"
        );

        return;
    }


    const requestId =
        ++conversationRequestId;


    thinking = true;


    setConversationState(
        "thinking"
    );


    /*
     * Keep the user's actual words visible
     * while MoonPlug processes them.
     */

    setConversationText(
        message
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
                        message: message
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


        /*
         * Ignore stale requests.
         */

        if (
            requestId !==
            conversationRequestId
        ) {

            return;
        }


        const reply =
            data.response ||
            data.message ||
            data.answer ||
            "I received your message.";


        const cleanReply =
            String(reply).trim();


        thinking = false;


        /*
         * Show what the user said
         * in the normal chat.
         */

        addMessage(
            message,
            "user"
        );


        /*
         * Show MoonPlug's response.
         */

        addMessage(
            cleanReply,
            "ai"
        );


        /*
         * Show response in conversation mode.
         */

        setConversationText(
            cleanReply
        );


        /*
         * SPEAK RESPONSE.
         */

        speakConversation(
            cleanReply
        );


    } catch (error) {

        console.error(
            "Conversation error:",
            error
        );


        thinking = false;

        speaking = false;


        setConversationState(
            "idle"
        );


        setConversationText(
            "I couldn't connect to MoonPlug right now."
        );
    }
}


/* =========================================================
   SPEECH VOICES
========================================================= */

function loadSpeechVoices() {

    if (
        !("speechSynthesis" in window)
    ) {

        speechVoices = [];

        return;
    }


    speechVoices =
        window.speechSynthesis
            .getVoices() || [];
}


/* =========================================================
   VOICE LOADING
========================================================= */

function setupVoiceLoading() {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    /*
     * Safari commonly loads voices later.
     */

    window.speechSynthesis.onvoiceschanged =
        () => {

            loadSpeechVoices();

            populateVoiceSelector();
        };


    setTimeout(
        () => {

            loadSpeechVoices();

            populateVoiceSelector();

        },
        250
    );


    setTimeout(
        () => {

            loadSpeechVoices();

            populateVoiceSelector();

        },
        1000
    );


    setTimeout(
        () => {

            loadSpeechVoices();

            populateVoiceSelector();

        },
        2000
    );
}


/* =========================================================
   DEFAULT VOICE
========================================================= */

function getBestVoice() {

    if (
        !("speechSynthesis" in window)
    ) {
        return null;
    }


    const voices =
        window.speechSynthesis
            .getVoices() || [];


    if (!voices.length) {
        return null;
    }


    const englishVoices =
        voices.filter(
            voice =>
                /^en[-_]/i.test(
                    voice.lang
                )
        );


    const availableVoices =
        englishVoices.length
            ? englishVoices
            : voices;


    const preferredVoices = [

        "Samantha",
        "Alex",
        "Daniel",
        "Karen",
        "Fred",
        "Google US English",
        "Microsoft Aria",
        "Microsoft Jenny",
        "Microsoft Guy"

    ];


    for (
        const preferredName
        of preferredVoices
    ) {

        const match =
            availableVoices.find(
                voice =>
                    voice.name
                        .toLowerCase()
                        .includes(
                            preferredName
                                .toLowerCase()
                        )
            );


        if (match) {
            return match;
        }
    }


    const american =
        availableVoices.find(
            voice =>
                /^en-US/i.test(
                    voice.lang
                )
        );


    if (american) {
        return american;
    }


    return availableVoices[0] ||
        null;
}


/* =========================================================
   USER SELECTED VOICE
========================================================= */

function getSelectedVoice() {

    if (
        !("speechSynthesis" in window)
    ) {
        return null;
    }


    const voices =
        window.speechSynthesis
            .getVoices() || [];


    if (!voices.length) {
        return null;
    }


    const savedVoice =
        localStorage.getItem(
            "moonplugVoice"
        );


    /*
     * User selected a voice.
     */

    if (savedVoice) {

        const selected =
            voices.find(
                voice =>
                    voice.name ===
                    savedVoice
            );


        if (selected) {

            return selected;
        }
    }


    /*
     * No saved voice:
     * use MoonPlug's default.
     */

    return getBestVoice();
}


/* =========================================================
   VOICE SELECTOR
========================================================= */

function setupVoiceSelector() {

    const select =
        $("voiceSelect");


    /*
     * The selector is optional.
     *
     * If it isn't in the HTML,
     * MoonPlug still works normally.
     */

    if (!select) {
        return;
    }


    populateVoiceSelector();


    select.addEventListener(
        "change",
        () => {

            const selected =
                select.value;


            if (!selected) {

                localStorage.removeItem(
                    "moonplugVoice"
                );

                return;
            }


            localStorage.setItem(
                "moonplugVoice",
                selected
            );


            /*
             * Don't speak automatically.
             * The voice only changes future responses.
             */
        }
    );
}


/* =========================================================
   POPULATE VOICE DROPDOWN
========================================================= */

function populateVoiceSelector() {

    const select =
        $("voiceSelect");


    if (!select) {
        return;
    }


    const voices =
        window.speechSynthesis
            ? window.speechSynthesis
                .getVoices()
            : [];


    if (!voices.length) {

        select.innerHTML = `
            <option value="">
                Loading voices...
            </option>
        `;

        return;
    }


    const englishVoices =
        voices.filter(
            voice =>
                /^en[-_]/i.test(
                    voice.lang
                )
        );


    const availableVoices =
        englishVoices.length
            ? englishVoices
            : voices;


    /*
     * Remove duplicate voice names.
     */

    const uniqueVoices = [];

    const usedNames =
        new Set();


    availableVoices.forEach(
        voice => {

            if (
                usedNames.has(
                    voice.name
                )
            ) {
                return;
            }


            usedNames.add(
                voice.name
            );


            uniqueVoices.push(
                voice
            );
        }
    );


    select.innerHTML = "";


    uniqueVoices.forEach(
        voice => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                voice.name;


            option.textContent =
                `${voice.name} — ${voice.lang}`;


            select.appendChild(
                option
            );
        }
    );


    /*
     * Restore saved voice.
     */

    const savedVoice =
        localStorage.getItem(
            "moonplugVoice"
        );


    if (
        savedVoice &&
        uniqueVoices.some(
            voice =>
                voice.name ===
                savedVoice
        )
    ) {

        select.value =
            savedVoice;

        return;
    }


    /*
     * Otherwise select
     * MoonPlug's default voice.
     */

    const defaultVoice =
        getBestVoice();


    if (defaultVoice) {

        select.value =
            defaultVoice.name;
    }
}


/* =========================================================
   SPEAK RESPONSE
========================================================= */

function speakConversation(
    text
) {

    if (
        !("speechSynthesis" in window)
    ) {

        setConversationState(
            "idle"
        );

        setConversationText(
            "Voice playback isn't supported by this browser."
        );

        return;
    }


    stopSpeechAnimation();


    try {

        window.speechSynthesis.cancel();

    } catch {}


    /*
     * Safari sometimes pauses speech
     * after a previous utterance.
     */

    resumeSpeechEngine();


    const utterance =
        new SpeechSynthesisUtterance(
            String(text)
        );


    /*
     * IMPORTANT:
     * use the voice chosen by the user.
     */

    const voice =
        getSelectedVoice();


    if (voice) {

        utterance.voice =
            voice;

        utterance.lang =
            voice.lang;

    } else {

        utterance.lang =
            "en-US";
    }


    utterance.rate =
        0.92;

    utterance.pitch =
        1;

    utterance.volume =
        1;


    utterance.onstart =
        () => {

            thinking = false;

            speaking = true;


            setConversationState(
                "talking"
            );


            startVoiceWave();
        };


    utterance.onend =
        () => {

            speaking = false;

            thinking = false;


            stopSpeechAnimation();


            setConversationState(
                "idle"
            );


            setConversationText(
                "Tap the microphone to talk"
            );
        };


    utterance.onerror =
        error => {

            console.error(
                "Speech synthesis:",
                error
            );


            speaking = false;

            thinking = false;


            stopSpeechAnimation();


            setConversationState(
                "idle"
            );


            setConversationText(
                "Tap the microphone to talk"
            );
        };


    try {

        window.speechSynthesis.speak(
            utterance
        );

    } catch (error) {

        console.error(
            "Speech failed:",
            error
        );


        speaking = false;

        thinking = false;


        setConversationState(
            "idle"
        );
    }
}


/* =========================================================
   SPEECH ENGINE
========================================================= */

function resumeSpeechEngine() {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    try {

        if (
            window.speechSynthesis.paused
        ) {

            window.speechSynthesis.resume();
        }

    } catch {}
}


/* =========================================================
   STOP SPEAKING
========================================================= */

function stopSpeaking() {

    if (
        "speechSynthesis" in window
    ) {

        try {

            window.speechSynthesis.cancel();

            window.speechSynthesis.resume();

        } catch {}
    }


    speaking = false;

    stopSpeechAnimation();
}


/* =========================================================
   VOICE WAVE
========================================================= */

function startVoiceWave() {

    const wave =
        $("voiceWave");


    if (!wave) return;


    stopSpeechAnimation();


    const bars =
        Array.from(
            wave.querySelectorAll("span")
        );


    function animate() {

        if (!speaking) {

            stopSpeechAnimation();

            return;
        }


        bars.forEach(
            (bar, index) => {

                const pulse =
                    Math.sin(
                        Date.now() / 90 +
                        index * 0.75
                    );


                const random =
                    Math.random();


                const height =
                    0.25 +
                    (
                        random * 0.55 +
                        (pulse + 1) * 0.2
                    );


                bar.style.transform =
                    `scaleY(${Math.min(
                        1.8,
                        height
                    )})`;
            }
        );


        speechAnimationFrame =
            requestAnimationFrame(
                animate
            );
    }


    animate();
}


function stopSpeechAnimation() {

    if (
        speechAnimationFrame
    ) {

        cancelAnimationFrame(
            speechAnimationFrame
        );

        speechAnimationFrame =
            null;
    }


    const wave =
        $("voiceWave");


    if (!wave) return;


    wave.querySelectorAll("span")
        .forEach(
            bar => {

                bar.style.transform =
                    "scaleY(.15)";
            }
        );
}


/* =========================================================
   SETTINGS
========================================================= */

function setupSettings() {

    const close =
        $("closeSettings");


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
}


function openSettings() {

    const panel =
        $("settingsPanel");


    if (!panel) return;


    panel.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeSettings() {

    const panel =
        $("settingsPanel");


    if (!panel) return;


    panel.setAttribute(
        "aria-hidden",
        "true"
    );
}


function updateTextSize(
    size
) {

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

    const saved =
        localStorage.getItem(
            "moonplugTextSize"
        ) ||
        "medium";


    updateTextSize(
        saved
    );
}


/* =========================================================
   ACCOUNT
========================================================= */

function setupAccount() {

    const close =
        $("closeAccount");


    if (close) {

        close.addEventListener(
            "click",
            closeAccount
        );
    }
}


function openAccount() {

    const screen =
        $("accountScreen");


    if (!screen) return;


    screen.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeAccount() {

    const screen =
        $("accountScreen");


    if (!screen) return;


    screen.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   BACKEND HEALTH
   READ-ONLY CHECK
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
            "MoonPlug backend:",
            error
        );
    }
}
