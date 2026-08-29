
"use strict";

/* =========================================================
   MOONPLUG AI
   COMPLETE FRONTEND JS

   BACKEND:
   https://moonplug.onrender.com

   IMPORTANT:
   - Backend endpoints unchanged
   - Normal chat still uses /api/chat
   - Kokoro handles voice locally
   - Safari speechSynthesis is NOT used for replies
========================================================= */

const API_BASE = "https://moonplug.onrender.com";

let recognition = null;
let recognitionSupported = false;

let listening = false;
let speaking = false;
let thinking = false;

let speechAnimationFrame = null;

let conversationRequestId = 0;

/* =========================================================
   KOKORO
========================================================= */

let kokoro = null;
let kokoroLoading = false;
let kokoroReady = false;

let currentAudio = null;

let selectedVoiceName =
    localStorage.getItem("moonplugVoice") ||
    "af_heart";


const $ = id =>
    document.getElementById(id);


/* =========================================================
   STARTUP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

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

        setupKokoroEvents();

        loadTextSize();

        checkBackendHealth();

    }
);


/* =========================================================
   STARS
========================================================= */

function createStars() {

    const field =
        $("starField");

    if (!field) return;

    field.innerHTML = "";

    const amount =
        window.innerWidth <= 600
            ? 55
            : 95;

    for (
        let i = 0;
        i < amount;
        i++
    ) {

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

    const sidebar =
        $("sidebar");

    const logo =
        $("sidebarLogo");

    if (
        sidebar &&
        logo
    ) {

        logo.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                /*
                 * One class controls the collapsed
                 * state on desktop, tablet and mobile.
                 */

                sidebar.classList.toggle(
                    "collapsed"
                );

                sidebar.classList.toggle(
                    "expanded"
                );
            }
        );
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

    if (
        !input ||
        !button
    ) return;


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
        $("messageInput");

    const button =
        $("sendButton");

    if (
        !input ||
        !button
    ) return;


    const message =
        input.value.trim();


    /*
     * EMPTY INPUT DOES NOTHING.
     */

    if (!message) {

        thinking = false;

        hideTyping();

        return;
    }


    /*
     * Show user's message immediately.
     */

    addMessage(
        message,
        "user"
    );


    input.value = "";

    input.style.height =
        "auto";

    button.disabled = true;


    /*
     * Identity questions are handled
     * locally and never hit the backend.
     */

    const identityAnswer =
        getMoonPlugIdentityAnswer(
            message
        );


    if (identityAnswer) {

        thinking = false;

        hideTyping();


        addMessage(
            identityAnswer,
            "ai"
        );


        button.disabled = false;

        input.focus();

        return;
    }


    /*
     * ONLY NOW does thinking begin.
     */

    thinking = true;

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
   MOONPLUG IDENTITY
========================================================= */

function getMoonPlugIdentityAnswer(
    message
) {

    const text =
        String(message || "")
            .toLowerCase()
            .trim()
            .replace(/[?!.,]/g, "");


    if (
        text.includes("who made you") ||
        text.includes("who created you") ||
        text.includes("who built you") ||
        text.includes("who developed you") ||
        text.includes("who is your creator") ||
        text.includes("who made moonplug") ||
        text.includes("who created moonplug")
    ) {

        return (
            "I was created by Xavier as part of " +
            "the MoonPlug AI project."
        );
    }


    if (
        text.includes("when were you made") ||
        text.includes("when were you created") ||
        text.includes("when was moonplug made") ||
        text.includes("when was moonplug created") ||
        text.includes("when did you get created") ||
        text.includes("when did moonplug start") ||
        text.includes("when was moonplug started")
    ) {

        return (
            "MoonPlug AI was started in 2026."
        );
    }


    if (
        text === "what are you" ||
        text === "who are you" ||
        text.includes("what is moonplug")
    ) {

        return (
            "I'm MoonPlug AI, an AI assistant " +
            "created by Xavier."
        );
    }


    return null;
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
        $("typing");

    if (!typing) return;

    typing.hidden = false;

    typing.style.display =
        "flex";
}


function hideTyping() {

    const typing =
        $("typing");

    if (!typing) return;

    typing.hidden = true;

    typing.style.display =
        "none";
}


/* =========================================================
   NEW CHAT
========================================================= */

function startNewChat() {

    stopListening();

    stopSpeaking();

    thinking = false;

    hideTyping();


    const messages =
        $("messages");

    if (!messages) return;


    messages.innerHTML = `

        <div
            id="emptyChat"
            class="empty-chat"
        >

            <div class="home-orb">
                <span></span>
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


/* =========================================================
   OPEN CONVERSATION
========================================================= */

function openConversation() {

    const mode =
        $("conversationMode");

    if (!mode) return;


    stopListening();

    stopSpeaking();

    thinking = false;


    mode.classList.add(
        "active"
    );

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


    /*
     * Load Kokoro when Conversation Mode
     * is opened, but DO NOT start talking.
     */

    initializeKokoro();
}


/* =========================================================
   CLOSE CONVERSATION
========================================================= */

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

        setConversationState(
            "idle"
        );

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


    if (
        state !== "idle"
    ) {

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


/* =========================================================
   CONVERSATION TEXT
========================================================= */

function setConversationText(
    text
) {

    const element =
        $("conversationText");

    if (!element) return;


    element.textContent =
        String(text);
}


/* =========================================================
   SPEECH RECOGNITION
   Safari/iOS microphone input
========================================================= */

function setupSpeechRecognition() {

    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!Recognition) {

        recognitionSupported =
            false;

        return;
    }


    recognitionSupported =
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

            let transcript =
                "";


            for (
                let i =
                    event.resultIndex;

                i <
                    event.results.length;

                i++
            ) {

                transcript +=
                    event.results[i][0]
                        .transcript;
            }


            transcript =
                transcript.trim();


            if (transcript) {

                /*
                 * Show exactly what
                 * the user said.
                 */

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
            250
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
   CONVERSATION PROCESSING
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

        setConversationState(
            "idle"
        );

        return;
    }


    /*
     * Show what the user said in
     * normal chat too.
     */

    addMessage(
        message,
        "user"
    );


    setConversationText(
        message
    );


    /*
     * IDENTITY QUESTIONS
     * DO NOT TOUCH BACKEND.
     */

    const identityAnswer =
        getMoonPlugIdentityAnswer(
            message
        );


    if (identityAnswer) {

        thinking = false;


        addMessage(
            identityAnswer,
            "ai"
        );


        setConversationText(
            identityAnswer
        );


        /*
         * Speak the local answer.
         */

        await speakConversation(
            identityAnswer
        );


        return;
    }


    /*
     * NORMAL BACKEND REQUEST.
     */

    const requestId =
        ++conversationRequestId;


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
                .catch(
                    () => ({})
                );


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
            cleanReply,
            "ai"
        );


        setConversationText(
            cleanReply
        );


        await speakConversation(
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
   KOKORO EVENTS
========================================================= */

function setupKokoroEvents() {

    window.addEventListener(
        "kokoro-ready",
        () => {

            console.log(
                "Kokoro library loaded."
            );

            setKokoroStatus(
                "ready",
                "Kokoro voice engine is ready."
            );

            populateKokoroVoices();
        }
    );


    const selector =
        $("voiceSelect");


    if (selector) {

        selector.addEventListener(
            "change",
            () => {

                selectedVoiceName =
                    selector.value;


                localStorage.setItem(
                    "moonplugVoice",
                    selectedVoiceName
                );
            }
        );
    }


    const testButton =
        $("testVoiceButton");


    if (testButton) {

        testButton.addEventListener(
            "click",
            () => {

                speakConversation(
                    "Hi. This is MoonPlug's voice."
                );
            }
        );
    }
}


/* =========================================================
   INITIALIZE KOKORO
========================================================= */

async function initializeKokoro() {

    if (kokoroReady) {

        populateKokoroVoices();

        return;
    }


    if (kokoroLoading) {

        return;
    }


    if (
        !window.MoonPlugKokoro ||
        !window.MoonPlugKokoro.KokoroTTS
    ) {

        setKokoroStatus(
            "error",
            "Kokoro library has not loaded yet."
        );

        return;
    }


    kokoroLoading = true;


    setKokoroStatus(
        "loading",
        "Loading MoonPlug voice..."
    );


    try {

        const KokoroTTS =
            window.MoonPlugKokoro
                .KokoroTTS;


        const modelId =
            "onnx-community/Kokoro-82M-v1.0-ONNX";


        /*
         * WebGPU when available.
         * WASM is the fallback.
         */

        let device =
            "wasm";


        if (
            navigator.gpu
        ) {

            device =
                "webgpu";
        }


        kokoro =
            await KokoroTTS.from_pretrained(
                modelId,
                {
                    dtype:
                        device === "webgpu"
                            ? "fp32"
                            : "q8",

                    device:
                        device
                }
            );


        kokoroReady =
            true;

        kokoroLoading =
            false;


        populateKokoroVoices();


        setKokoroStatus(
            "ready",
            "Kokoro voice engine ready."
        );


    } catch (error) {

        console.error(
            "Kokoro initialization failed:",
            error
        );


        kokoroLoading =
            false;

        kokoroReady =
            false;


        setKokoroStatus(
            "error",
            "Kokoro could not load."
        );
    }
}


/* =========================================================
   KOKORO VOICES
========================================================= */

function populateKokoroVoices() {

    const selector =
        $("voiceSelect");

    if (!selector) return;


    /*
     * Keep a useful starter list even
     * before the model finishes loading.
     */

    const voices = [

        ["af_heart", "Heart — Warm Female"],

        ["af_bella", "Bella — Bright Female"],

        ["af_nicole", "Nicole — Clear Female"],

        ["af_sarah", "Sarah — Soft Female"],

        ["af_sky", "Sky — Calm Female"],

        ["am_adam", "Adam — Neutral Male"],

        ["am_michael", "Michael — Deep Male"],

        ["am_fenrir", "Fenrir — Low Male"],

        ["am_puck", "Puck — Light Male"]

    ];


    selector.innerHTML = "";


    voices.forEach(
        ([id, label]) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                id;

            option.textContent =
                label;


            if (
                id ===
                selectedVoiceName
            ) {

                option.selected =
                    true;
            }


            selector.appendChild(
                option
            );
        }
    );
}


/* =========================================================
   KOKORO STATUS
========================================================= */

function setKokoroStatus(
    state,
    message
) {

    const text =
        $("kokoroStatusText");

    const dot =
        $("kokoroStatusDot");


    if (text) {

        text.textContent =
            message;
    }


    if (dot) {

        dot.dataset.state =
            state;
    }


    const status =
        $("voiceStatus");


    if (status) {

        status.textContent =
            message;
    }
}


/* =========================================================
   KOKORO SPEECH
========================================================= */

async function speakConversation(
    text
) {

    const cleanText =
        String(text || "").trim();


    if (!cleanText) {

        return;
    }


    /*
     * Stop any previous audio.
     */

    stopSpeaking();


    /*
     * Load Kokoro if it isn't ready.
     */

    if (!kokoroReady) {

        await initializeKokoro();
    }


    if (!kokoro) {

        speaking = false;

        setConversationState(
            "idle"
        );

        setConversationText(
            "The MoonPlug voice could not load."
        );

        return;
    }


    try {

        speaking = true;

        thinking = false;


        setConversationState(
            "talking"
        );


        startVoiceWave();


        const audio =
            await kokoro.generate(
                cleanText,
                {
                    voice:
                        selectedVoiceName ||
                        "af_heart",

                    speed:
                        0.95
                }
            );


        /*
         * The generation may finish after
         * the user pressed the mic again.
         */

        if (!speaking) {

            return;
        }


        const blob =
            audio.toBlob();


        const url =
            URL.createObjectURL(
                blob
            );


        const player =
            new Audio(url);


        currentAudio =
            player;


        player.volume =
            1;


        player.onended =
            () => {

                URL.revokeObjectURL(
                    url
                );


                currentAudio =
                    null;

                speaking =
                    false;

                thinking =
                    false;


                stopSpeechAnimation();


                setConversationState(
                    "idle"
                );


                setConversationText(
                    "Tap the microphone to talk"
                );
            };


        player.onerror =
            error => {

                console.error(
                    "Kokoro audio error:",
                    error
                );


                URL.revokeObjectURL(
                    url
                );


                currentAudio =
                    null;

                speaking =
                    false;

                thinking =
                    false;


                stopSpeechAnimation();


                setConversationState(
                    "idle"
                );
            };


        await player.play();


    } catch (error) {

        console.error(
            "Kokoro speech failed:",
            error
        );


        speaking =
            false;

        thinking =
            false;


        stopSpeechAnimation();


        setConversationState(
            "idle"
        );


        setConversationText(
            "I couldn't play the MoonPlug voice."
        );
    }
}


/* =========================================================
   STOP SPEAKING
========================================================= */

function stopSpeaking() {

    speaking = false;


    if (currentAudio) {

        try {

            currentAudio.pause();

            currentAudio.currentTime =
                0;

        } catch {}


        currentAudio =
            null;
    }


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
            wave.querySelectorAll(
                "span"
            )
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
                        Date.now() /
                            90 +
                        index *
                            0.75
                    );


                const random =
                    Math.random();


                const height =
                    0.25 +
                    (
                        random * 0.55 +
                        (pulse + 1) *
                            0.2
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


/* =========================================================
   STOP VOICE WAVE
========================================================= */

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


    populateKokoroVoices();
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
   DOES NOT START THINKING
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

