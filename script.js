"use strict";

/* =========================================================
   MOONPLUG AI
   COMPLETE FRONTEND JS
   BACKEND UNCHANGED
   KOKORO TTS
========================================================= */

const API_BASE = "https://moonplug.onrender.com";

const KOKORO_MODEL =
    "onnx-community/Kokoro-82M-v1.0-ONNX";


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
let kokoroFailed = false;

let currentAudio = null;
let currentAudioURL = null;

let selectedVoice =
    localStorage.getItem("moonplugVoice") ||
    "af_heart";

let conversationRequestId = 0;


/* =========================================================
   DOM HELPER
========================================================= */

const $ = id =>
    document.getElementById(id);


/* =========================================================
   STARTUP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * NEVER start the normal chat
         * in thinking mode.
         */

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

        setupVoiceControls();

        loadTextSize();

        checkBackendHealth();

        updateKokoroStatus(
            "loading",
            "Loading MoonPlug voice..."
        );

        /*
         * The HTML module will dispatch this
         * when KokoroTTS has been imported.
         */

        window.addEventListener(
            "kokoro-ready",
            initializeKokoro,
            {
                once: true
            }
        );

        /*
         * Handles the case where the module
         * loaded before this listener existed.
         */

        if (
            window.MoonPlugKokoro &&
            window.MoonPlugKokoro.KokoroTTS
        ) {

            initializeKokoro();

        } else {

            /*
             * Safety timeout.
             */

            setTimeout(
                () => {

                    if (
                        !kokoroReady &&
                        !kokoroLoading &&
                        !kokoroFailed
                    ) {

                        updateKokoroStatus(
                            "error",
                            "Kokoro could not be loaded."
                        );

                        kokoroFailed = true;
                    }

                },
                15000
            );
        }

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


    /*
     * These buttons currently have no backend
     * feature attached, so don't make them
     * accidentally submit anything.
     */

    [
        "studyButton",
        "cookButton",
        "imagesButton",
        "codeButton"
    ].forEach(
        id => {

            const button = $(id);

            if (!button) return;

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                }
            );
        }
    );
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
     */

    if (!message) {

        thinking = false;

        hideTyping();

        return;
    }


    thinking = true;

    addMessage(
        message,
        "user"
    );


    input.value = "";

    input.style.height =
        "auto";

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
     * Start loading Kokoro if it hasn't
     * loaded yet.
     */

    if (!kokoroReady) {

        initializeKokoro();
    }
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


    setConversationState(
        "idle"
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
   BACKEND UNCHANGED
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
         * Show the spoken conversation
         * in normal chat.
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
         * Kokoro speaks the response.
         */

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
   KOKORO INITIALIZATION
========================================================= */

async function initializeKokoro() {

    if (kokoroReady) {

        updateKokoroStatus(
            "ready",
            "Ready"
        );

        return kokoro;
    }


    if (kokoroLoading) {

        return null;
    }


    if (
        !window.MoonPlugKokoro ||
        !window.MoonPlugKokoro.KokoroTTS
    ) {

        /*
         * The module hasn't loaded yet.
         */

        return null;
    }


    kokoroLoading = true;

    kokoroFailed = false;


    updateKokoroStatus(
        "loading",
        "Loading MoonPlug voice..."
    );


    try {

        const KokoroTTS =
            window.MoonPlugKokoro
                .KokoroTTS;


        /*
         * q8 + WASM is the compatibility
         * path used by kokoro-js.
         *
         * It keeps this browser-side
         * and avoids needing an API.
         */

        kokoro =
            await KokoroTTS.from_pretrained(
                KOKORO_MODEL,
                {
                    dtype: "q8",
                    device: "wasm"
                }
            );


        kokoroReady = true;

        kokoroLoading = false;

        kokoroFailed = false;


        updateKokoroStatus(
            "ready",
            "Ready"
        );


        populateKokoroVoices();


        console.log(
            "MoonPlug Kokoro loaded."
        );


        return kokoro;


    } catch (error) {

        console.error(
            "Kokoro initialization failed:",
            error
        );


        kokoro =
            null;

        kokoroReady =
            false;

        kokoroLoading =
            false;

        kokoroFailed =
            true;


        updateKokoroStatus(
            "error",
            "Couldn't load MoonPlug voice."
        );


        return null;
    }
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
   KOKORO VOICE CONTROLS
========================================================= */

function setupVoiceControls() {

    const selector =
        $("voiceSelect");

    const testButton =
        $("testVoiceButton");


    if (selector) {

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

            }
        );
    }


    if (testButton) {

        testButton.addEventListener(
            "click",
            testSelectedVoice
        );
    }
}


/* =========================================================
   KOKORO VOICE LIST
========================================================= */

function populateKokoroVoices() {

    const selector =
        $("voiceSelect");

    if (!selector) return;


    /*
     * These are voices available in
     * the Kokoro 1.0 model used by
     * the HTML you provided.
     */

    const voices = [

        ["af_heart", "Heart"],

        ["af_bella", "Bella"],

        ["af_nicole", "Nicole"],

        ["af_sarah", "Sarah"],

        ["af_sky", "Sky"],

        ["af_nova", "Nova"],

        ["af_alloy", "Alloy"],

        ["af_aoede", "Aoede"],

        ["af_jessica", "Jessica"],

        ["af_kore", "Kore"],

        ["af_river", "River"],

        ["am_adam", "Adam"],

        ["am_michael", "Michael"],

        ["am_fenrir", "Fenrir"],

        ["am_puck", "Puck"],

        ["am_echo", "Echo"],

        ["am_eric", "Eric"],

        ["am_liam", "Liam"],

        ["am_onyx", "Onyx"],

        ["am_santa", "Santa"],

        ["bf_emma", "Emma"],

        ["bf_isabella", "Isabella"],

        ["bf_alice", "Alice"],

        ["bf_lily", "Lily"],

        ["bm_daniel", "Daniel"],

        ["bm_fable", "Fable"],

        ["bm_george", "George"],

        ["bm_lewis", "Lewis"]

    ];


    selector.innerHTML = "";


    voices.forEach(
        ([value, label]) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                value;

            option.textContent =
                label;


            if (
                value ===
                selectedVoice
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
   TEST VOICE
========================================================= */

async function testSelectedVoice() {

    const button =
        $("testVoiceButton");

    if (button) {

        button.disabled = true;
    }


    try {

        const success =
            await speakConversation(
                "Hi. I'm MoonPlug. This is my selected voice."
            );


        if (!success) {

            console.warn(
                "MoonPlug voice test failed."
            );
        }


    } finally {

        if (button) {

            button.disabled = false;
        }
    }
}


/* =========================================================
   KOKORO SPEAK
========================================================= */

async function speakConversation(
    text
) {

    const cleanText =
        String(
            text || ""
        ).trim();


    if (!cleanText) {

        return false;
    }


    /*
     * Load Kokoro if necessary.
     */

    if (!kokoroReady) {

        await initializeKokoro();
    }


    if (!kokoro) {

        setConversationState(
            "idle"
        );

        setConversationText(
            "MoonPlug voice could not be loaded."
        );

        return false;
    }


    stopCurrentAudio();


    thinking = false;

    speaking = true;


    setConversationState(
        "talking"
    );


    updateKokoroStatus(
        "speaking",
        "Speaking..."
    );


    startVoiceWave();


    try {

        /*
         * Generate the actual WAV audio.
         */

        const audio =
            await kokoro.generate(
                cleanText,
                {
                    voice:
                        selectedVoice
                }
            );


        /*
         * The RawAudio object supplied by
         * kokoro-js can be saved as WAV.
         *
         * For browser playback we create
         * the WAV bytes ourselves.
         */

        const wavBlob =
            createWavBlobFromRawAudio(
                audio
            );


        currentAudioURL =
            URL.createObjectURL(
                wavBlob
            );


        currentAudio =
            new Audio(
                currentAudioURL
            );


        currentAudio.volume =
            1;


        currentAudio.onended =
            () => {

                finishSpeaking();
            };


        currentAudio.onerror =
            error => {

                console.error(
                    "Kokoro audio playback:",
                    error
                );

                finishSpeaking();
            };


        /*
         * PLAY.
         */

        await currentAudio.play();


        return true;


    } catch (error) {

        console.error(
            "Kokoro speech failed:",
            error
        );


        finishSpeaking();


        setConversationText(
            "MoonPlug couldn't play the voice."
        );


        return false;
    }
}


/* =========================================================
   RAW AUDIO → WAV BLOB
========================================================= */

function createWavBlobFromRawAudio(
    audio
) {

    /*
     * kokoro-js RawAudio exposes:
     *
     * audio.data
     * audio.sampling_rate
     *
     * The generated data is Float32 PCM.
     */

    const samples =
        audio.data ||
        audio.audio ||
        audio;


    const sampleRate =
        audio.sampling_rate ||
        audio.sampleRate ||
        24000;


    const floatSamples =
        samples instanceof Float32Array
            ? samples
            : Float32Array.from(
                samples
            );


    const buffer =
        new ArrayBuffer(
            44 +
            floatSamples.length * 2
        );


    const view =
        new DataView(buffer);


    writeString(
        view,
        0,
        "RIFF"
    );

    view.setUint32(
        4,
        36 +
        floatSamples.length * 2,
        true
    );

    writeString(
        view,
        8,
        "WAVE"
    );

    writeString(
        view,
        12,
        "fmt "
    );

    view.setUint32(
        16,
        16,
        true
    );

    view.setUint16(
        20,
        1,
        true
    );

    view.setUint16(
        22,
        1,
        true
    );

    view.setUint32(
        24,
        sampleRate,
        true
    );

    view.setUint32(
        28,
        sampleRate * 2,
        true
    );

    view.setUint16(
        32,
        2,
        true
    );

    view.setUint16(
        34,
        16,
        true
    );

    writeString(
        view,
        36,
        "data"
    );

    view.setUint32(
        40,
        floatSamples.length * 2,
        true
    );


    for (
        let i = 0;
        i < floatSamples.length;
        i++
    ) {

        const sample =
            Math.max(
                -1,
                Math.min(
                    1,
                    floatSamples[i]
                )
            );


        const intSample =
            sample < 0
                ? sample * 0x8000
                : sample * 0x7fff;


        view.setInt16(
            44 + i * 2,
            intSample,
            true
        );
    }


    return new Blob(
        [buffer],
        {
            type:
                "audio/wav"
        }
    );
}


function writeString(
    view,
    offset,
    string
) {

    for (
        let i = 0;
        i < string.length;
        i++
    ) {

        view.setUint8(
            offset + i,
            string.charCodeAt(i)
        );
    }
}


/* =========================================================
   STOP CURRENT AUDIO
========================================================= */

function stopCurrentAudio() {

    if (currentAudio) {

        try {

            currentAudio.pause();

            currentAudio.currentTime =
                0;

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
   FINISH SPEAKING
========================================================= */

function finishSpeaking() {

    stopCurrentAudio();

    speaking = false;

    thinking = false;


    stopSpeechAnimation();


    updateKokoroStatus(
        "ready",
        "Ready"
    );


    setConversationState(
        "idle"
    );


    setConversationText(
        "Tap the microphone to talk"
    );
}


/* =========================================================
   STOP SPEAKING
========================================================= */

function stopSpeaking() {

    stopCurrentAudio();

    speaking = false;

    stopSpeechAnimation();


    if (kokoroReady) {

        updateKokoroStatus(
            "ready",
            "Ready"
        );
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


    /*
     * Refresh the visible status.
     */

    if (kokoroReady) {

        updateKokoroStatus(
            "ready",
            "Ready"
        );

    } else if (kokoroLoading) {

        updateKokoroStatus(
            "loading",
            "Loading MoonPlug voice..."
        );
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
