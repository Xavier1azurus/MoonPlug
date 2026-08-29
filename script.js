
"use strict";

/* =========================================================
   MOONPLUG AI
   COMPLETE FRONTEND JS
   BACKEND UNCHANGED
========================================================= */

const API_BASE = "https://moonplug.onrender.com";

let recognition = null;
let recognitionSupported = false;

let listening = false;
let speaking = false;
let thinking = false;

let speechAnimationFrame = null;
let speechVoices = [];

let selectedVoiceName =
    localStorage.getItem("moonplugVoice") || "";

let conversationRequestId = 0;


/* =========================================================
   DOM HELPER
========================================================= */

const $ = id => document.getElementById(id);


/* =========================================================
   STARTUP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    listening = false;
    speaking = false;
    thinking = false;

    hideTyping();

    createStars();
    setupSidebar();
    setupChat();
    setupConversation();
    setupSettings();
    setupAccount();
    setupSpeechRecognition();
    setupVoiceSystem();

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
        window.innerWidth <= 600 ? 55 : 95;

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

            sidebar.classList.toggle("collapsed");

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

    const input = $("messageInput");
    const button = $("sendButton");

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
   SEND CHAT
========================================================= */

async function sendMessage() {

    const input = $("messageInput");
    const button = $("sendButton");

    if (!input || !button) return;

    const message =
        input.value.trim();

    if (!message) return;


    /*
     * Built-in MoonPlug identity answers.
     * This works even if the backend doesn't know them.
     */

    const identityAnswer =
        getMoonPlugIdentityAnswer(message);

    addMessage(
        message,
        "user"
    );

    input.value = "";
    input.style.height = "auto";


    if (identityAnswer) {

        addMessage(
            identityAnswer,
            "ai"
        );

        return;
    }


    thinking = true;

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
   MOONPLUG IDENTITY
========================================================= */

function getMoonPlugIdentityAnswer(message) {

    const text =
        message
            .toLowerCase()
            .trim();


    if (
        text.includes("who made you") ||
        text.includes("who created you") ||
        text.includes("who built you") ||
        text.includes("who developed you")
    ) {

        return "I was created by Xavier as MoonPlug AI.";
    }


    if (
        text.includes("when were you made") ||
        text.includes("when were you created") ||
        text.includes("when was moonplug made") ||
        text.includes("when did moonplug start")
    ) {

        return "MoonPlug AI was created in 2026.";
    }


    if (
        text === "who are you" ||
        text.includes("what are you")
    ) {

        return "I'm MoonPlug AI, an AI assistant built for chatting, learning, coding, and more.";
    }


    return null;
}


/* =========================================================
   MESSAGES
========================================================= */

function addMessage(text, sender) {

    const messages = $("messages");
    const empty = $("emptyChat");

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

    const typing = $("typing");

    if (!typing) return;

    typing.hidden = false;
    typing.style.display = "flex";
}


function hideTyping() {

    const typing = $("typing");

    if (!typing) return;

    typing.hidden = true;
    typing.style.display = "none";
}


/* =========================================================
   NEW CHAT
========================================================= */

function startNewChat() {

    stopListening();
    stopSpeaking();

    thinking = false;

    hideTyping();


    const messages = $("messages");

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
   CONVERSATION
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


    stopListening();
    stopSpeaking();

    thinking = false;


    mode.classList.add("active");

    mode.setAttribute(
        "aria-hidden",
        "false"
    );


    setConversationState("idle");

    setConversationText(
        "Tap the microphone to talk"
    );
}


function closeConversation() {

    stopListening();
    stopSpeaking();

    thinking = false;

    conversationRequestId++;


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
   CONVERSATION BUTTON
========================================================= */

function handleConversationButton() {

    if (speaking) {

        stopSpeaking();

        setConversationState("idle");

        setConversationText(
            "Tap the microphone to talk"
        );

        return;
    }


    if (listening) {

        stopListening();

        return;
    }


    startListening();
}


/* =========================================================
   CONVERSATION STATE
========================================================= */

function setConversationState(state) {

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

        idle: "Ready",

        listening: "Listening",

        thinking: "Thinking",

        talking: "Speaking"

    };


    if (status) {

        status.textContent =
            labels[state] ||
            "Ready";
    }
}


function setConversationText(text) {

    const element =
        $("conversationText");

    if (!element) return;

    element.textContent =
        String(text);
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


    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";


    recognition.onstart = () => {

        listening = true;
        thinking = false;

        setConversationState(
            "listening"
        );

        setConversationText(
            "Listening..."
        );
    };


    recognition.onresult = event => {

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


    recognition.onerror = event => {

        console.warn(
            "Microphone:",
            event.error
        );


        listening = false;


        setConversationState(
            "idle"
        );


        if (
            event.error ===
            "not-allowed"
        ) {

            setConversationText(
                "Microphone permission was denied."
            );

        } else if (
            event.error ===
            "no-speech"
        ) {

            setConversationText(
                "I didn't hear anything."
            );

        } else {

            setConversationText(
                "Microphone error. Try again."
            );
        }
    };


    recognition.onend = () => {

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

        setConversationState("idle");

        setConversationText(
            "Speech recognition isn't supported in this browser."
        );

        return;
    }


    stopSpeaking();


    try {

        recognition.start();

    } catch {

        try {
            recognition.stop();
        } catch {}

        setTimeout(() => {

            try {
                recognition.start();
            } catch {}

        }, 250);
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
========================================================= */

async function processConversation(
    transcript
) {

    stopListening();


    const message =
        String(
            transcript || ""
        ).trim();


    if (!message) return;


    const requestId =
        ++conversationRequestId;


    /*
     * Handle identity questions locally.
     */

    const identityAnswer =
        getMoonPlugIdentityAnswer(
            message
        );


    if (identityAnswer) {

        addMessage(
            message,
            "user"
        );

        addMessage(
            identityAnswer,
            "ai"
        );


        thinking = false;

        setConversationText(
            identityAnswer
        );


        speakConversation(
            identityAnswer
        );

        return;
    }


    thinking = true;


    setConversationState(
        "thinking"
    );


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
                .catch(() => ({}));


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Chat request failed."
            );
        }


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


        addMessage(
            message,
            "user"
        );


        addMessage(
            cleanReply,
            "ai"
        );


        setConversationText(
            cleanReply
        );


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
   VOICE SYSTEM
========================================================= */

function setupVoiceSystem() {

    if (
        !("speechSynthesis" in window)
    ) {

        updateVoiceStatus(
            "Voice unavailable"
        );

        return;
    }


    window.speechSynthesis.onvoiceschanged =
        loadSpeechVoices;


    loadSpeechVoices();


    setTimeout(
        loadSpeechVoices,
        300
    );


    setTimeout(
        loadSpeechVoices,
        1000
    );


    setTimeout(
        loadSpeechVoices,
        2000
    );


    const testButton =
        $("testVoiceButton");


    if (testButton) {

        testButton.addEventListener(
            "click",
            testVoice
        );
    }
}


/* =========================================================
   LOAD VOICES
========================================================= */

function loadSpeechVoices() {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    speechVoices =
        window.speechSynthesis
            .getVoices() || [];


    populateVoiceSelector();


    if (speechVoices.length) {

        updateVoiceStatus(
            "Ready"
        );
    }
}


/* =========================================================
   VOICE SELECTOR
========================================================= */

function populateVoiceSelector() {

    const selector =
        $("voiceSelect");

    if (!selector) return;


    const voices =
        window.speechSynthesis
            .getVoices() || [];


    if (!voices.length) {

        selector.innerHTML =
            `<option value="">
                Loading voices...
            </option>`;

        return;
    }


    const english =
        voices.filter(
            voice =>
                /^en[-_]/i.test(
                    voice.lang
                )
        );


    const available =
        english.length
            ? english
            : voices;


    selector.innerHTML = "";


    available.forEach(
        voice => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                voice.name;


            option.textContent =
                `${voice.name} — ${voice.lang}`;


            if (
                voice.name ===
                selectedVoiceName
            ) {

                option.selected = true;
            }


            selector.appendChild(
                option
            );
        }
    );


    if (
        !available.some(
            voice =>
                voice.name ===
                selectedVoiceName
        )
    ) {

        selectedVoiceName =
            available[0].name;

        selector.value =
            selectedVoiceName;

        localStorage.setItem(
            "moonplugVoice",
            selectedVoiceName
        );
    }


    selector.onchange = () => {

        selectedVoiceName =
            selector.value;


        localStorage.setItem(
            "moonplugVoice",
            selectedVoiceName
        );


        updateVoiceStatus(
            "Ready"
        );
    };
}


/* =========================================================
   GET SELECTED VOICE
========================================================= */

function getSelectedVoice() {

    const voices =
        window.speechSynthesis
            .getVoices() || [];


    if (!voices.length) {
        return null;
    }


    if (selectedVoiceName) {

        const selected =
            voices.find(
                voice =>
                    voice.name ===
                    selectedVoiceName
            );


        if (selected) {
            return selected;
        }
    }


    const english =
        voices.filter(
            voice =>
                /^en[-_]/i.test(
                    voice.lang
                )
        );


    return (
        english[0] ||
        voices[0]
    );
}


/* =========================================================
   TEST VOICE
========================================================= */

function testVoice() {

    if (
        !("speechSynthesis" in window)
    ) {

        updateVoiceStatus(
            "Voice unavailable"
        );

        return;
    }


    /*
     * Cancel anything currently playing.
     */

    try {
        window.speechSynthesis.cancel();
    } catch {}


    /*
     * Safari sometimes needs a short
     * delay after cancel().
     */

    setTimeout(() => {

        const voice =
            getSelectedVoice();


        const utterance =
            new SpeechSynthesisUtterance(
                "Hi. I'm MoonPlug. This is my voice."
            );


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


        utterance.onstart = () => {

            updateVoiceStatus(
                "Speaking"
            );
        };


        utterance.onend = () => {

            updateVoiceStatus(
                "Ready"
            );
        };


        utterance.onerror = error => {

            console.error(
                "Test voice error:",
                error
            );

            updateVoiceStatus(
                "Ready"
            );
        };


        try {

            window.speechSynthesis.resume();

            window.speechSynthesis.speak(
                utterance
            );

        } catch (error) {

            console.error(
                "Test voice failed:",
                error
            );

            updateVoiceStatus(
                "Voice unavailable"
            );
        }

    }, 100);
}


/* =========================================================
   SPEAK MOONPLUG
========================================================= */

function speakConversation(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        setConversationState(
            "idle"
        );

        return;
    }


    const message =
        String(text || "").trim();


    if (!message) return;


    stopSpeechAnimation();


    try {
        window.speechSynthesis.cancel();
    } catch {}


    const voice =
        getSelectedVoice();


    const utterance =
        new SpeechSynthesisUtterance(
            message
        );


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


    utterance.onstart = () => {

        thinking = false;
        speaking = true;


        setConversationState(
            "talking"
        );


        updateVoiceStatus(
            "Speaking"
        );


        startVoiceWave();
    };


    utterance.onend = () => {

        speaking = false;
        thinking = false;


        stopSpeechAnimation();


        setConversationState(
            "idle"
        );


        updateVoiceStatus(
            "Ready"
        );


        setConversationText(
            "Tap the microphone to talk"
        );
    };


    utterance.onerror = error => {

        console.error(
            "MoonPlug voice error:",
            error
        );


        speaking = false;
        thinking = false;


        stopSpeechAnimation();


        setConversationState(
            "idle"
        );


        updateVoiceStatus(
            "Ready"
        );
    };


    try {

        /*
         * Important for Safari.
         */

        window.speechSynthesis.resume();

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
    }
}


/* =========================================================
   VOICE STATUS
========================================================= */

function updateVoiceStatus(text) {

    const status =
        $("voiceStatus");

    if (status) {

        status.textContent =
            String(text);
    }


    const engineStatus =
        $("kokoroStatusText");

    if (engineStatus) {

        engineStatus.textContent =
            String(text);
    }


    const dot =
        $("kokoroStatusDot");

    if (dot) {

        dot.classList.toggle(
            "speaking",
            text === "Speaking"
        );
    }
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


                const height =
                    0.3 +
                    (
                        Math.random() * 0.5 +
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

    if (speechAnimationFrame) {

        cancelAnimationFrame(
            speechAnimationFrame
        );

        speechAnimationFrame = null;
    }


    const wave =
        $("voiceWave");

    if (!wave) return;


    wave.querySelectorAll(
        "span"
    ).forEach(
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


    loadSpeechVoices();
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
                    button.dataset.size === size
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

