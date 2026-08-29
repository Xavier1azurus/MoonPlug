/* =========================================================
   MOONPLUG AI
   FULL JAVASCRIPT
   ONE BUTTON CONVERSATION MODE
   SPEECH ENGINE UNLOCKED ON USER GESTURE
========================================================= */

"use strict";

/* =========================================================
   CONFIG
========================================================= */

const API_BASE = "https://moonplug.onrender.com";

/* =========================================================
   STATE
========================================================= */

let recognition = null;
let recognitionSupported = false;

let listening = false;
let thinking = false;
let speaking = false;

let speechUnlocked = false;
let currentUtterance = null;

let speechVoices = [];
let speechAnimationFrame = null;

let conversationRequestId = 0;

/* =========================================================
   HELPER
========================================================= */

const $ = id => document.getElementById(id);

/* =========================================================
   START
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    createStars();

    setupSidebar();
    setupChat();
    setupConversation();
    setupSettings();
    setupAccount();

    setupSpeechRecognition();
    setupSpeechSynthesis();

    loadTextSize();

    hideTyping();

    /*
     * IMPORTANT:
     * The conversation screen starts completely inactive.
     */
    const conversationMode = $("conversationMode");

    if (conversationMode) {
        conversationMode.classList.remove("active");
        conversationMode.setAttribute("aria-hidden", "true");
    }

    checkBackendHealth();
});


/* =========================================================
   STARS
========================================================= */

function createStars() {

    const field = $("starField");

    if (!field) return;

    field.innerHTML = "";

    const amount = window.innerWidth <= 600 ? 55 : 95;

    for (let i = 0; i < amount; i++) {

        const star = document.createElement("div");

        star.className = "random-star";

        star.style.setProperty("--star-x", `${Math.random() * 100}%`);
        star.style.setProperty("--star-y", `${Math.random() * 100}%`);
        star.style.setProperty("--star-size", `${Math.random() * 2 + 0.5}px`);
        star.style.setProperty("--star-opacity", `${Math.random() * 0.6 + 0.2}`);
        star.style.setProperty("--star-glow", `${Math.random() * 5 + 2}px`);
        star.style.setProperty("--star-duration", `${Math.random() * 5 + 3}s`);
        star.style.setProperty("--star-delay", `${Math.random() * -8}s`);
        star.style.setProperty("--star-scale", `${Math.random() * 0.6 + 0.5}`);
        star.style.setProperty("--star-move-x", `${Math.random() * 10 - 5}px`);
        star.style.setProperty("--star-move-y", `${Math.random() * 10 - 5}px`);

        field.appendChild(star);
    }
}


/* =========================================================
   SIDEBAR
========================================================= */

function setupSidebar() {

    const logo = $("sidebarLogo");

    if (logo) {

        logo.addEventListener("click", () => {

            const sidebar = $("sidebar");

            if (!sidebar) return;

            /*
             * Works on desktop, tablet and mobile.
             */
            sidebar.classList.toggle("expanded");

        });
    }


    const conversation = $("conversationButton");

    if (conversation) {
        conversation.addEventListener("click", openConversation);
    }


    const newChat = $("newChatButton");

    if (newChat) {
        newChat.addEventListener("click", startNewChat);
    }


    const settings = $("settingsButton");

    if (settings) {
        settings.addEventListener("click", openSettings);
    }


    const account = $("accountButton");

    if (account) {
        account.addEventListener("click", openAccount);
    }


    const history = $("historyButton");

    if (history) {

        history.addEventListener("click", () => {

            alert("Chat history is coming soon.");

        });
    }
}


/* =========================================================
   NORMAL CHAT
========================================================= */

function setupChat() {

    const input = $("messageInput");
    const button = $("sendButton");

    if (!input || !button) return;

    button.addEventListener("click", sendMessage);

    input.addEventListener("keydown", event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    });


    input.addEventListener("input", () => {

        input.style.height = "auto";

        input.style.height =
            Math.min(input.scrollHeight, 180) + "px";

    });
}


async function sendMessage() {

    const input = $("messageInput");
    const button = $("sendButton");

    if (!input || !button) return;

    const message = input.value.trim();

    if (!message) return;

    addMessage(message, "user");

    input.value = "";
    input.style.height = "auto";

    showTyping();

    button.disabled = true;

    try {

        const response = await fetch(
            `${API_BASE}/api/chat`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: message
                })
            }
        );


        const data = await response.json().catch(() => ({}));

        if (!response.ok) {

            throw new Error(
                data.error || "Chat request failed."
            );
        }


        const reply =
            data.response ||
            data.message ||
            data.answer ||
            "I received your message.";


        addMessage(String(reply), "ai");


    } catch (error) {

        console.error("Normal chat error:", error);

        addMessage(
            "I couldn't connect to MoonPlug right now.",
            "ai"
        );

    } finally {

        hideTyping();

        button.disabled = false;

        input.focus();
    }
}


/* =========================================================
   ADD MESSAGE
========================================================= */

function addMessage(text, sender) {

    const messages = $("messages");
    const empty = $("emptyChat");

    if (!messages) return;

    if (empty) {
        empty.remove();
    }

    const bubble = document.createElement("div");

    bubble.className =
        `message-bubble ${sender}`;

    bubble.textContent = String(text);

    messages.appendChild(bubble);

    messages.scrollTop =
        messages.scrollHeight;
}


/* =========================================================
   TYPING
========================================================= */

function showTyping() {

    const typing = $("typing");

    if (!typing) return;

    typing.hidden = false;

    /*
     * Make sure it is actually displayed as a flex row.
     */
    typing.style.display = "flex";
}


function hideTyping() {

    const typing = $("typing");

    if (!typing) return;

    typing.hidden = true;

    typing.style.display = "none";
}


/* =========================================================
   CONVERSATION SETUP
========================================================= */

function setupConversation() {

    const close = $("conversationClose");
    const mic = $("conversationMic");

    if (close) {
        close.addEventListener("click", closeConversation);
    }

    if (mic) {

        /*
         * ONE conversation button.
         */
        mic.addEventListener(
            "click",
            handleConversationButton
        );
    }
}


/* =========================================================
   OPEN CONVERSATION
========================================================= */

function openConversation() {

    const mode = $("conversationMode");

    if (!mode) return;

    mode.classList.add("active");

    mode.setAttribute(
        "aria-hidden",
        "false"
    );

    /*
     * CRITICAL:
     * Do NOT start thinking here.
     * Do NOT start speech here.
     * Do NOT show "thinking".
     */

    thinking = false;
    listening = false;
    speaking = false;

    setConversationState("idle");

    setConversationText(
        "Tap the button to talk"
    );
}


/* =========================================================
   CLOSE CONVERSATION
========================================================= */

function closeConversation() {

    stopListening();
    stopSpeaking();

    thinking = false;

    const mode = $("conversationMode");

    if (!mode) return;

    mode.classList.remove("active");

    mode.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   ONE BUTTON
========================================================= */

function handleConversationButton() {

    /*
     * THIS CLICK IS THE MOST IMPORTANT PART.
     *
     * Safari/iOS often requires speech to begin from
     * a real user gesture.
     *
     * Unlock speech BEFORE doing anything asynchronous.
     */

    unlockSpeechEngine();


    /*
     * If MoonPlug is speaking,
     * same button stops it.
     */

    if (speaking) {

        stopSpeaking();

        setConversationState("idle");

        setConversationText(
            "Tap the button to talk"
        );

        return;
    }


    /*
     * If currently listening,
     * same button stops listening.
     */

    if (listening) {

        stopListening();

        return;
    }


    /*
     * Otherwise listen.
     */

    startListening();
}


/* =========================================================
   CONVERSATION STATE
========================================================= */

function setConversationState(state) {

    const mode = $("conversationMode");
    const status = $("conversationStatus");

    if (!mode) return;

    mode.classList.remove(
        "listening",
        "thinking",
        "talking"
    );

    if (state !== "idle") {

        mode.classList.add(state);
    }


    const labels = {
        idle: "Ready",
        listening: "Listening",
        thinking: "Thinking",
        talking: "Speaking"
    };


    if (status) {

        status.textContent =
            labels[state] || "Ready";
    }
}


function setConversationText(text) {

    const element = $("conversationText");

    if (element) {

        element.textContent =
            String(text);
    }
}


/* =========================================================
   SPEECH SYNTHESIS SETUP
========================================================= */

function setupSpeechSynthesis() {

    if (!("speechSynthesis" in window)) {

        console.warn(
            "Speech synthesis is not supported."
        );

        return;
    }

    loadSpeechVoices();

    if ("onvoiceschanged" in speechSynthesis) {

        speechSynthesis.onvoiceschanged =
            loadSpeechVoices;
    }

    setTimeout(loadSpeechVoices, 100);
    setTimeout(loadSpeechVoices, 500);
    setTimeout(loadSpeechVoices, 1500);
}


/* =========================================================
   LOAD VOICES
========================================================= */

function loadSpeechVoices() {

    if (!("speechSynthesis" in window)) {

        speechVoices = [];

        return;
    }

    speechVoices =
        window.speechSynthesis.getVoices() || [];
}


/* =========================================================
   UNLOCK SPEECH ENGINE
========================================================= */

function unlockSpeechEngine() {

    if (!("speechSynthesis" in window)) {
        return;
    }

    /*
     * We only need to do this once.
     */

    if (speechUnlocked) {

        try {
            window.speechSynthesis.resume();
        } catch {}

        return;
    }


    try {

        /*
         * Cancel anything old.
         */
        window.speechSynthesis.cancel();

        /*
         * Resume the engine.
         */
        window.speechSynthesis.resume();


        /*
         * Tiny silent utterance.
         *
         * This is intentionally almost silent and extremely
         * short. Its purpose is to unlock the browser's
         * speech system from the user's tap.
         */

        const unlock =
            new SpeechSynthesisUtterance(" ");

        unlock.volume = 0;

        unlock.rate = 10;

        unlock.pitch = 1;

        unlock.lang = "en-US";


        unlock.onend = () => {

            speechUnlocked = true;

        };


        unlock.onerror = () => {

            /*
             * Even if the browser doesn't report an end event,
             * consider the engine unlocked after the gesture.
             */

            speechUnlocked = true;
        };


        window.speechSynthesis.speak(unlock);

        speechUnlocked = true;


    } catch (error) {

        console.warn(
            "Speech engine unlock failed:",
            error
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

        recognitionSupported = false;

        console.warn(
            "Speech recognition is not supported."
        );

        return;
    }


    recognitionSupported = true;

    recognition = new Recognition();

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
                event.results[i][0].transcript;
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
            "Recognition error:",
            event.error
        );

        listening = false;


        if (event.error === "not-allowed") {

            setConversationState("idle");

            setConversationText(
                "Microphone permission was denied."
            );

            return;
        }


        if (event.error === "no-speech") {

            setConversationState("idle");

            setConversationText(
                "I didn't hear anything. Tap to try again."
            );

            return;
        }


        if (event.error === "aborted") {

            return;
        }


        setConversationState("idle");

        setConversationText(
            "Microphone error. Tap to try again."
        );
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

    /*
     * Unlock speech FIRST.
     */
    unlockSpeechEngine();


    if (!recognitionSupported) {

        setConversationState("idle");

        setConversationText(
            "Voice input isn't supported in this browser."
        );

        return;
    }


    if (speaking) {

        stopSpeaking();

        return;
    }


    try {

        recognition.start();

    } catch (error) {

        console.warn(
            "Recognition start:",
            error
        );

        /*
         * If the browser thinks it is already running,
         * cleanly stop it and retry.
         */

        try {

            recognition.stop();

        } catch {}


        setTimeout(() => {

            try {

                recognition.start();

            } catch (retryError) {

                console.warn(
                    "Recognition retry:",
                    retryError
                );
            }

        }, 200);
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
   PROCESS CONVERSATION
========================================================= */

async function processConversation(
    transcript
) {

    const message =
        String(transcript || "").trim();


    if (!message) {

        listening = false;

        setConversationState("idle");

        setConversationText(
            "Tap the button to talk"
        );

        return;
    }


    stopListening();


    const requestId =
        ++conversationRequestId;


    thinking = true;

    setConversationState(
        "thinking"
    );

    setConversationText(
        "MoonPlug is thinking..."
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


        /*
         * Ignore an old request.
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


        if (!cleanReply) {

            throw new Error(
                "MoonPlug returned an empty response."
            );
        }


        thinking = false;


        /*
         * Put the conversation in normal chat.
         */

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


        /*
         * IMPORTANT:
         *
         * The speech engine was unlocked when the user
         * pressed the microphone button.
         *
         * Therefore this call can happen after the API
         * response.
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
   CHOOSE BEST VOICE
========================================================= */

function getBestVoice() {

    loadSpeechVoices();


    if (!speechVoices.length) {
        return null;
    }


    const english =
        speechVoices.filter(
            voice =>
                /^en[-_]/i.test(
                    voice.lang
                )
        );


    if (!english.length) {
        return speechVoices[0];
    }


    const preferred = [
        "Samantha",
        "Alex",
        "Karen",
        "Daniel",
        "Google US English",
        "Microsoft Aria",
        "Microsoft Jenny",
        "Microsoft Guy"
    ];


    for (const name of preferred) {

        const found =
            english.find(
                voice =>
                    voice.name
                        .toLowerCase()
                        .includes(
                            name.toLowerCase()
                        )
            );


        if (found) {
            return found;
        }
    }


    const us =
        english.find(
            voice =>
                /^en-US/i.test(
                    voice.lang
                )
        );


    return us || english[0];
}


/* =========================================================
   SPEAK MOONPLUG RESPONSE
========================================================= */

function speakConversation(text) {

    if (!("speechSynthesis" in window)) {

        thinking = false;
        speaking = false;

        setConversationState("idle");

        setConversationText(
            "Voice playback isn't supported in this browser."
        );

        return;
    }


    const speech =
        String(text || "").trim();


    if (!speech) {

        setConversationState("idle");

        return;
    }


    /*
     * Stop anything currently queued.
     */

    try {

        window.speechSynthesis.cancel();

    } catch {}


    try {

        window.speechSynthesis.resume();

    } catch {}


    loadSpeechVoices();


    const utterance =
        new SpeechSynthesisUtterance(
            speech
        );


    currentUtterance =
        utterance;


    const voice =
        getBestVoice();


    if (voice) {

        utterance.voice =
            voice;

        utterance.lang =
            voice.lang;

    } else {

        utterance.lang =
            "en-US";
    }


    /*
     * Natural assistant settings.
     */

    utterance.rate = 0.95;

    utterance.pitch = 1.0;

    utterance.volume = 1.0;


    utterance.onstart = () => {

        /*
         * Safari can occasionally delay the onstart
         * event. The state is changed here rather than
         * before speak() so the UI only says Speaking
         * when speech actually starts.
         */

        thinking = false;

        speaking = true;

        setConversationState(
            "talking"
        );

        startVoiceWave();
    };


    utterance.onend = () => {

        if (
            currentUtterance !==
            utterance
        ) {
            return;
        }


        speaking = false;

        thinking = false;

        currentUtterance = null;

        stopSpeechAnimation();


        setConversationState(
            "idle"
        );


        setConversationText(
            "Tap the button to talk"
        );
    };


    utterance.onerror = event => {

        console.error(
            "Speech synthesis error:",
            event
        );


        if (
            currentUtterance !==
            utterance
        ) {
            return;
        }


        speaking = false;

        thinking = false;

        currentUtterance = null;

        stopSpeechAnimation();


        setConversationState(
            "idle"
        );


        /*
         * Give the user an actual useful message.
         */

        setConversationText(
            "Voice playback failed. Tap the button and try again."
        );
    };


    /*
     * Speak.
     */

    try {

        window.speechSynthesis.speak(
            utterance
        );


        /*
         * Safari sometimes pauses speech immediately.
         * Resume a moment later.
         */

        setTimeout(() => {

            try {

                if (
                    window.speechSynthesis.paused
                ) {

                    window.speechSynthesis.resume();
                }

            } catch {}

        }, 100);


        setTimeout(() => {

            try {

                if (
                    window.speechSynthesis.paused
                ) {

                    window.speechSynthesis.resume();
                }

            } catch {}

        }, 500);


    } catch (error) {

        console.error(
            "Could not speak:",
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
   STOP SPEAKING
========================================================= */

function stopSpeaking() {

    if ("speechSynthesis" in window) {

        try {

            window.speechSynthesis.cancel();

        } catch {}


        try {

            window.speechSynthesis.resume();

        } catch {}
    }


    currentUtterance = null;

    speaking = false;

    stopSpeechAnimation();
}


/* =========================================================
   VOICE WAVE
========================================================= */

function startVoiceWave() {

    const wave = $("voiceWave");

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


        bars.forEach((bar, index) => {

            const center =
                Math.abs(
                    index -
                    (bars.length - 1) / 2
                );


            const maxCenter =
                (bars.length - 1) / 2;


            const centerPower =
                1 -
                center /
                maxCenter;


            const waveMotion =
                Math.sin(
                    Date.now() / 90 +
                    index * 0.7
                );


            const randomMotion =
                Math.random();


            const height =
                0.2 +
                (
                    randomMotion * 0.55 +
                    (waveMotion + 1) * 0.2
                ) *
                (
                    0.4 +
                    centerPower * 0.6
                );


            bar.style.transform =
                `scaleY(${Math.min(1.8, height)})`;
        });


        speechAnimationFrame =
            requestAnimationFrame(
                animate
            );
    }


    animate();
}


/* =========================================================
   STOP WAVE
========================================================= */

function stopSpeechAnimation() {

    if (speechAnimationFrame) {

        cancelAnimationFrame(
            speechAnimationFrame
        );

        speechAnimationFrame = null;
    }


    const wave = $("voiceWave");

    if (!wave) return;


    wave.querySelectorAll("span")
        .forEach(bar => {

            bar.style.transform =
                "scaleY(.15)";
        });
}


/* =========================================================
   NEW CHAT
========================================================= */

function startNewChat() {

    stopSpeaking();

    stopListening();

    thinking = false;

    const messages = $("messages");

    if (!messages) return;


    messages.innerHTML = `
        <div id="emptyChat" class="empty-chat">
            <div>🌙</div>
            <h1>What can I help with?</h1>
            <p>Ask MoonPlug anything.</p>
        </div>
    `;


    hideTyping();
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
            "moonplugTextSize"
        ) ||
        "medium";


    updateTextSize(saved);
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
            "MoonPlug backend health:",
            error
        );
    }
}


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        createStars();

    }
);
