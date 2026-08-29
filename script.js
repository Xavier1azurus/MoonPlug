
"use strict";

/* =========================================================
   MOONPLUG AI
   COMPLETE FRONTEND JS
   KOKORO TTS
   BACKEND UNCHANGED
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

let kokoro = null;
let kokoroLoading = false;
let kokoroReady = false;

let selectedVoice =
    localStorage.getItem("moonplugVoice") ||
    "af_heart";

let currentAudio = null;
let currentAudioURL = null;

let conversationRequestId = 0;


/* =========================================================
   DOM HELPER
========================================================= */

const $ = id => document.getElementById(id);


/* =========================================================
   STARTUP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* Never start in thinking mode. */

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

        setupVoicePicker();

        setupKokoroEvents();

        loadTextSize();

        checkBackendHealth();

        /*
         * Do NOT load Kokoro immediately.
         *
         * The model is large, so it loads when
         * the user actually needs voice.
         */

        updateKokoroStatus(
            "ready",
            "Voice engine ready to load."
        );

    }
);


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

    if (logo && sidebar) {

        logo.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "collapsed"
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
   SEND NORMAL CHAT
========================================================= */

async function sendMessage() {

    const input =
        $("messageInput");

    const button =
        $("sendButton");

    if (!input || !button) return;


    const message =
        input.value.trim();


    /* Empty input does NOTHING. */

    if (!message) {

        thinking = false;

        hideTyping();

        return;
    }


    addMessage(
        message,
        "user"
    );


    input.value = "";

    input.style.height =
        "auto";

    button.disabled = true;


    /*
     * Built-in MoonPlug questions.
     */

    const builtIn =
        getMoonPlugBuiltInResponse(
            message
        );


    if (builtIn) {

        thinking = true;

        showTyping();


        setTimeout(
            () => {

                addMessage(
                    builtIn,
                    "ai"
                );

                thinking = false;

                hideTyping();

                button.disabled =
                    false;

                input.focus();

            },
            350
        );

        return;
    }


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
   BUILT-IN MOONPLUG ANSWERS
========================================================= */

function getMoonPlugBuiltInResponse(
    message
) {

    const text =
        String(message)
            .toLowerCase()
            .trim()
            .replace(/[?!.,]/g, "");


    if (
        text.includes("who made you") ||
        text.includes("who created you") ||
        text.includes("who built you") ||
        text.includes("who developed you") ||
        text.includes("who made moonplug") ||
        text.includes("who created moonplug")
    ) {

        return (
            "I was created by Xavier " +
            "as MoonPlug AI."
        );
    }


    if (
        text.includes("when were you made") ||
        text.includes("when were you created") ||
        text.includes("when was moonplug made") ||
        text.includes("when was moonplug created")
    ) {

        return (
            "MoonPlug AI was created in 2026."
        );
    }


    if (
        text === "who are you" ||
        text === "what are you" ||
        text === "what is moonplug"
    ) {

        return (
            "I'm MoonPlug AI, an AI assistant created by Xavier."
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


    recognition.onresult =
        event => {

            let transcript =
                "";


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


    recognition.onerror =
        event => {

            console.warn(
                "Speech recognition:",
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
                    "I didn't hear anything. Tap to try again."
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


    if (!message) {

        return;
    }


    /*
     * Built-in identity questions.
     */

    const builtIn =
        getMoonPlugBuiltInResponse(
            message
        );


    if (builtIn) {

        addMessage(
            message,
            "user"
        );

        addMessage(
            builtIn,
            "ai"
        );


        setConversationText(
            builtIn
        );


        await speakKokoro(
            builtIn
        );


        return;
    }


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


        await speakKokoro(
            cleanReply
        );


    } catch (error) {

        console.error(
            "Conversation error:",
            error
        );


        thinking = false;


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

    /*
     * The HTML module dispatches this event
     * after kokoro-js itself has loaded.
     */

    window.addEventListener(
        "ready",
        () => {

            console.log(
                " library loaded."
            );

            updateKokoroStatus(
                "ready",
                " voice engine ready."
            );
        }
    );
}


/* =========================================================
   LOAD KOKORO
========================================================= */

async function loadKokoro() {

    if (kokoroReady && kokoro) {

        return kokoro;
    }


    if (kokoroLoading) {

        return waitForKokoro();
    }


    if (
        !window.MoonPlugKokoro ||
        !window.MoonPlugKokoro.KokoroTTS
    ) {

        throw new Error(
            " library did not load."
        );
    }


    kokoroLoading = true;


    updateKokoroStatus(
        "loading",
        "Loading MoonPlug voice..."
    );


    try {

        const KokoroTTS =
            window.MoonPlugKokoro
                .KokoroTTS;


        /*
         * WASM + q8 is deliberately used here.
         *
         * It is the safer browser configuration,
         * especially for compatibility.
         */

        kokoro =
            await KokoroTTS.from_pretrained(
                "onnx-community/Kokoro-82M-v1.0-ONNX",
                {
                    dtype: "q8",
                    device: "wasm"
                }
            );


        kokoroReady = true;

        kokoroLoading = false;


        updateKokoroStatus(
            "ready",
            " ready."
        );


        console.log(
            "MoonPlug  loaded.",
            kokoro.list_voices
                ? kokoro.list_voices()
                : []
        );


        return kokoro;


    } catch (error) {

        kokoroLoading = false;

        kokoroReady = false;

        kokoro = null;


        updateKokoroStatus(
            "error",
            "Couldn't load the MoonPlug voice."
        );


        console.error(
            " loading error:",
            error
        );


        throw error;
    }
}


/* =========================================================
   WAIT FOR KOKORO
========================================================= */

function waitForKokoro() {

    return new Promise(
        (resolve, reject) => {

            const start =
                Date.now();


            const timer =
                setInterval(
                    () => {

                        if (
                            kokoroReady &&
                            kokoro
                        ) {

                            clearInterval(
                                timer
                            );

                            resolve(
                                kokoro
                            );

                            return;
                        }


                        if (
                            Date.now() -
                            start >
                            120000
                        ) {

                            clearInterval(
                                timer
                            );

                            reject(
                                new Error(
                                    "loading timed out."
                                )
                            );
                        }

                    },
                    250
                );
        }
    );
}


/* =========================================================
   VOICE PICKER
========================================================= */

function setupVoicePicker() {

    const selector =
        $("voiceSelect");

    if (!selector) return;


    selector.value =
        selectedVoice;


    selector.addEventListener(
        "change",
        () => {

            selectedVoice =
                selector.value;


            localStorage.setItem(
                "moonplugVoice",
                selectedVoice
            );


            console.log(
                "MoonPlug voice:",
                selectedVoice
            );
        }
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
   TEST VOICE
========================================================= */

async function testVoice() {

    const button =
        $("testVoiceButton");

    if (button) {

        button.disabled = true;

        button.textContent =
            "Loading...";
    }


    try {

        await speakKokoro(
            "Hi. I'm MoonPlug. This is my voice."
        );


    } catch (error) {

        console.error(
            "Test voice failed:",
            error
        );

        updateKokoroStatus(
            "error",
            "Voice test failed. Check the browser console."
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Test Voice";
        }
    }
}


/* =========================================================
   KOKORO SPEECH
========================================================= */

async function speakKokoro(
    text
) {

    const cleanText =
        String(text || "").trim();


    if (!cleanText) return;


    /*
     * Stop previous audio.
     */

    stopSpeaking();


    try {

        const tts =
            await loadKokoro();


        updateKokoroStatus(
            "speaking",
            "Speaking..."
        );


        speaking = true;

        thinking = false;


        setConversationState(
            "talking"
        );


        startVoiceWave();


        /*
         * Generate Kokoro audio.
         */

        const audio =
            await tts.generate(
                cleanText,
                {
                    voice:
                        selectedVoice,
                    speed:
                        0.95
                }
            );


        /*
         * Convert RawAudio into
         * a browser-playable WAV.
         */

        const blob =
            audio.toBlob();


        currentAudioURL =
            URL.createObjectURL(
                blob
            );


        currentAudio =
            new Audio(
                currentAudioURL
            );


        currentAudio.volume =
            1;


        /*
         * This is the actual playback.
         */

        await playAudio(
            currentAudio
        );


    } catch (error) {

        console.error(
            " speech error:",
            error
        );


        speaking = false;

        stopSpeechAnimation();


        setConversationState(
            "idle"
        );


        setConversationText(
            "MoonPlug couldn't play its voice."
        );


        updateKokoroStatus(
            "error",
            "Voice playback failed."
        );


    } finally {

        speaking = false;

        stopSpeechAnimation();


        if (
            $("conversationMode")
        ) {

            setConversationState(
                "idle"
            );
        }


        updateKokoroStatus(
            "ready",
            " ready."
        );


        cleanupAudio();
    }
}


/* =========================================================
   PLAY AUDIO
========================================================= */

function playAudio(
    audio
) {

    return new Promise(
        (resolve, reject) => {

            audio.onended =
                () => {

                    resolve();
                };


            audio.onerror =
                event => {

                    reject(
                        new Error(
                            "Browser audio playback failed."
                        )
                    );
                };


            const promise =
                audio.play();


            if (
                promise &&
                typeof promise.catch ===
                    "function"
            ) {

                promise.catch(
                    reject
                );
            }
        }
    );
}


/* =========================================================
   STOP SPEAKING
========================================================= */

function stopSpeaking() {

    if (currentAudio) {

        try {

            currentAudio.pause();

            currentAudio.currentTime =
                0;

        } catch {}
    }


    cleanupAudio();


    speaking = false;

    stopSpeechAnimation();
}


/* =========================================================
   CLEANUP AUDIO
========================================================= */

function cleanupAudio() {

    if (currentAudio) {

        try {

            currentAudio.pause();

        } catch {}
    }


    currentAudio =
        null;


    if (currentAudioURL) {

        try {

            URL.revokeObjectURL(
                currentAudioURL
            );

        } catch {}
    }


    currentAudioURL =
        null;
}


/* =========================================================
   KOKORO STATUS
========================================================= */

function updateKokoroStatus(
    state,
    message
) {

    const dot =
        $("kokoroStatusDot");

    const text =
        $("kokoroStatusText");

    const voiceStatus =
        $("voiceStatus");


    if (dot) {

        dot.classList.remove(
            "loading",
            "ready",
            "speaking",
            "error"
        );

        dot.classList.add(
            state
        );
    }


    if (text) {

        text.textContent =
            message;
    }


    if (voiceStatus) {

        voiceStatus.textContent =
            message;
    }
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


    /*
     * Make sure the saved voice
     * is displayed.
     */

    const selector =
        $("voiceSelect");

    if (selector) {

        selector.value =
            selectedVoice;
    }
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


/* =========================================================
   PAGE CLEANUP
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        stopSpeaking();

        stopListening();

    }
);
