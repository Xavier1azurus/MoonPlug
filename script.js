
"use strict";

/* =========================================================
   MOONPLUG AI
   RESTORED VOICE SYSTEM
   ONE CONVERSATION BUTTON
========================================================= */

const API_BASE = "https://moonplug.onrender.com";


/* =========================================================
   STATE
========================================================= */

let recognition = null;
let recognitionSupported = false;

let listening = false;
let speaking = false;
let thinking = false;

let speechAnimationFrame = null;
let speechVoices = [];

let conversationRequestId = 0;


/* =========================================================
   SHORT DOM HELPER
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

    setupSpeechRecognition();
    setupVoiceLoading();

    loadSpeechVoices();
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

        const star = document.createElement("div");

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
            `${Math.random() * 2 + .5}px`
        );

        star.style.setProperty(
            "--star-opacity",
            `${Math.random() * .6 + .2}`
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
            `${Math.random() * .6 + .5}`
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
   DESKTOP/TABLET = COLLAPSE
   PHONE = SLIDE OPEN/CLOSED
========================================================= */

function setupSidebar() {

    const sidebar = $("sidebar");
    const logo = $("sidebarLogo");

    if (!sidebar || !logo) return;

    logo.addEventListener("click", () => {

        const phone =
            window.matchMedia("(max-width: 600px)").matches;

        if (phone) {

            sidebar.classList.toggle("mobile-open");

        } else {

            sidebar.classList.toggle("collapsed");

            document.body.classList.toggle(
                "sidebar-collapsed",
                sidebar.classList.contains("collapsed")
            );
        }
    });


    const conversation = $("conversationButton");

    if (conversation) {

        conversation.addEventListener(
            "click",
            () => {

                openConversation();

                if (
                    window.matchMedia("(max-width: 600px)").matches
                ) {
                    sidebar.classList.remove("mobile-open");
                }
            }
        );
    }


    const newChat = $("newChatButton");

    if (newChat) {
        newChat.addEventListener(
            "click",
            startNewChat
        );
    }


    const settings = $("settingsButton");

    if (settings) {
        settings.addEventListener(
            "click",
            openSettings
        );
    }


    const history = $("historyButton");

    if (history) {

        history.addEventListener(
            "click",
            () => {
                alert("Chat history is coming soon.");
            }
        );
    }


    const study = $("studyButton");

    if (study) {

        study.addEventListener(
            "click",
            () => {
                alert("Study mode is coming soon.");
            }
        );
    }


    const cook = $("cookButton");

    if (cook) {

        cook.addEventListener(
            "click",
            () => {
                alert("Cook mode is coming soon.");
            }
        );
    }


    const images = $("imagesButton");

    if (images) {

        images.addEventListener(
            "click",
            () => {
                alert("Image mode is coming soon.");
            }
        );
    }


    const code = $("codeButton");

    if (code) {

        code.addEventListener(
            "click",
            () => {
                alert("Code mode is coming soon.");
            }
        );
    }


    const account = $("accountButton");

    if (account) {

        account.addEventListener(
            "click",
            () => {
                alert("Account features are coming soon.");
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


async function sendMessage() {

    const input = $("messageInput");
    const button = $("sendButton");

    if (!input || !button) return;

    const message =
        input.value.trim();

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
            "Normal chat error:",
            error
        );

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

    messages.appendChild(bubble);

    messages.scrollTop =
        messages.scrollHeight;
}


/* =========================================================
   TYPING
========================================================= */

function showTyping() {

    const typing = $("typing");

    if (typing) {
        typing.hidden = false;
    }
}


function hideTyping() {

    const typing = $("typing");

    if (typing) {
        typing.hidden = true;
    }
}


/* =========================================================
   CONVERSATION
========================================================= */

function setupConversation() {

    const close = $("conversationClose");
    const mic = $("conversationMic");

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

    const mode = $("conversationMode");

    if (!mode) return;

    mode.classList.add("active");

    mode.setAttribute(
        "aria-hidden",
        "false"
    );

    setConversationState("idle");

    setConversationText(
        "Tap the button to talk"
    );

    resumeSpeechEngine();
}


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

    if (speaking) {

        stopSpeaking();

        setConversationState("idle");

        setConversationText(
            "Tap the button to talk"
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

        console.warn(
            "Speech recognition is not supported."
        );

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
            last.isFinal
        ) {

            processConversation(
                transcript
            );
        }
    };


    recognition.onerror = event => {

        console.warn(
            "Speech recognition:",
            event.error
        );

        listening = false;


        if (event.error === "not-allowed") {

            setConversationState("idle");

            setConversationText(
                "Microphone permission was denied."
            );

        } else if (
            event.error === "no-speech"
        ) {

            setConversationState("idle");

            setConversationText(
                "I didn't hear anything. Tap to try again."
            );

        } else {

            setConversationState("idle");

            setConversationText(
                "Microphone error. Try again."
            );
        }
    };


    recognition.onend = () => {

        listening = false;

        if (!thinking && !speaking) {

            setConversationState("idle");
        }
    };
}


/* =========================================================
   START LISTENING
========================================================= */

function startListening() {

    if (speaking) {

        stopSpeaking();

        return;
    }


    if (!recognitionSupported) {

        setConversationState("idle");

        setConversationText(
            "Speech recognition isn't supported by this browser."
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


function stopListening() {

    if (recognition) {

        try {
            recognition.stop();
        } catch {}
    }

    listening = false;

    if (!thinking && !speaking) {

        setConversationState("idle");
    }
}


/* =========================================================
   SEND VOICE MESSAGE TO MOONPLUG
========================================================= */

async function processConversation(transcript) {

    stopListening();

    const message =
        String(transcript || "").trim();

    if (!message) return;


    const requestId =
        ++conversationRequestId;


    thinking = true;

    setConversationState("thinking");

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


        /*
         * IMPORTANT:
         * This is the old speech-synthesis
         * path that actually speaks the answer.
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

        setConversationState("idle");

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


function setupVoiceLoading() {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    window.speechSynthesis.onvoiceschanged =
        () => {

            loadSpeechVoices();
        };


    setTimeout(
        loadSpeechVoices,
        250
    );

    setTimeout(
        loadSpeechVoices,
        1000
    );
}


/* =========================================================
   BEST VOICE
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
        return null;
    }


    const preferredNames = [
        "Samantha",
        "Alex",
        "Daniel",
        "Karen",
        "Google US English",
        "Microsoft Aria",
        "Microsoft Jenny",
        "Microsoft Guy"
    ];


    for (
        const name of preferredNames
    ) {

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


    const american =
        english.find(
            voice =>
                /^en-US/i.test(
                    voice.lang
                )
        );


    return american || english[0];
}


/* =========================================================
   SPEAK CONVERSATION
========================================================= */

function speakConversation(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        setConversationState("idle");

        setConversationText(
            "Voice playback isn't supported by this browser."
        );

        return;
    }


    stopSpeechAnimation();


    try {

        window.speechSynthesis.cancel();

    } catch {}


    resumeSpeechEngine();


    const utterance =
        new SpeechSynthesisUtterance(
            String(text)
        );


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
     * These values intentionally match
     * the older working voice setup.
     */

    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;


    utterance.onstart = () => {

        thinking = false;
        speaking = true;

        setConversationState(
            "talking"
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

        setConversationText(
            "Tap the button to talk"
        );
    };


    utterance.onerror = event => {

        console.error(
            "Speech synthesis error:",
            event
        );

        speaking = false;
        thinking = false;

        stopSpeechAnimation();

        setConversationState(
            "idle"
        );
    };


    /*
     * ACTUAL AUDIO PLAYBACK.
     */

    try {

        window.speechSynthesis.speak(
            utterance
        );

    } catch (error) {

        console.error(
            "Could not speak:",
            error
        );

        speaking = false;

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

    } catch (error) {

        console.warn(
            "Speech resume:",
            error
        );
    }
}


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


        bars.forEach(
            (bar, index) => {

                const center =
                    Math.abs(
                        index -
                        (bars.length - 1) / 2
                    );


                const centerPower =
                    1 -
                    center /
                    ((bars.length - 1) / 2);


                const noise =
                    Math.random();


                const pulse =
                    Math.sin(
                        Date.now() / 80 +
                        index * .8
                    ) * .25 +
                    .55;


                const height =
                    .18 +
                    (
                        noise * .55 +
                        pulse * .45
                    ) *
                    (
                        .35 +
                        centerPower * .65
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

    const messages = $("messages");

    if (!messages) return;

    messages.innerHTML = `
        <div id="emptyChat" class="empty-chat">
            <div class="empty-moon">🌙</div>
            <h1>What can I help with?</h1>
            <p>Ask MoonPlug anything.</p>
        </div>
    `;
}


/* =========================================================
   SETTINGS
========================================================= */

function setupSettings() {

    const close = $("closeSettings");

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

    const panel = $("settingsPanel");

    if (!panel) return;

    panel.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeSettings() {

    const panel = $("settingsPanel");

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
        ) || "medium";

    updateTextSize(saved);
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

