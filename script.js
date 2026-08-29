
"use strict";

/* =========================================================
   MOONPLUG AI
   COMPLETE FRONTEND JS
   BACKEND UNCHANGED

   CHAT:
   https://moonplug.onrender.com/api/chat

   VOICE:
   Kokoro local browser TTS

   SPEECH INPUT:
   Safari/Web Speech Recognition when available
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

let kokoroAudio = null;
let kokoroAudioURL = null;

let selectedVoiceName =
    localStorage.getItem("moonplugVoice") ||
    "af_heart";


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
         * NEVER start normal chat in thinking mode.
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

        setupVoicePicker();

        loadTextSize();

        checkBackendHealth();

        /*
         * Load Kokoro after the UI is ready.
         * This does NOT call the backend.
         */

        setupKokoro();

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

    if (
        sidebar &&
        logo
    ) {

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


    /*
     * On smaller screens, choosing a feature
     * closes the expanded sidebar.
     */

    document
        .querySelectorAll(
            ".sidebar-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        /*
                         * Do not collapse when
                         * the logo is clicked.
                         */

                        if (
                            event.currentTarget ===
                            logo
                        ) {
                            return;
                        }

                        if (
                            window.innerWidth <= 900 &&
                            sidebar
                        ) {

                            sidebar.classList.remove(
                                "expanded"
                            );
                        }

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

    if (
        !input ||
        !button
    ) {
        return;
    }


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
    ) {
        return;
    }


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
                        message:
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

    if (!messages) {
        return;
    }


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
   THINKING INDICATOR
========================================================= */

function showTyping() {

    const typing =
        $("typing");

    if (!typing) {
        return;
    }


    typing.hidden = false;

    typing.style.display =
        "flex";
}


function hideTyping() {

    const typing =
        $("typing");

    if (!typing) {
        return;
    }


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

    if (!messages) {
        return;
    }


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

    if (!mode) {
        return;
    }


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

    if (!mode) {
        return;
    }


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

    /*
     * Stop current AI speech.
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
     * Stop listening.
     */

    if (listening) {

        stopListening();

        return;
    }


    /*
     * IMPORTANT FOR SAFARI:
     *
     * Unlock audio during the actual
     * microphone button click.
     */

    unlockAudio();


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

    if (!mode) {
        return;
    }


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


/* =========================================================
   CONVERSATION TEXT
========================================================= */

function setConversationText(
    text
) {

    const element =
        $("conversationText");

    if (!element) {
        return;
    }


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


            /*
             * SHOW EXACTLY WHAT
             * THE USER SAID.
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


    /*
     * Keep the user's spoken words
     * visible while processing.
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
                        message:
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
         * KOKORO SPEAKS HERE.
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
   KOKORO LOADING
========================================================= */

async function setupKokoro() {

    /*
     * Load in the background.
     *
     * It does NOT start speaking.
     */

    setTimeout(
        async () => {

            await loadKokoro();

        },
        300
    );
}


/* =========================================================
   LOAD KOKORO
========================================================= */

async function loadKokoro() {

    if (
        kokoroReady &&
        kokoro
    ) {

        return kokoro;
    }


    if (kokoroLoading) {

        while (kokoroLoading) {

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        100
                    )
            );
        }


        return kokoro;
    }


    kokoroLoading =
        true;


    try {

        /*
         * Load kokoro-js dynamically.
         */

        const module =
            await import(
                "https://esm.sh/kokoro-js@1.2.1"
            );


        const KokoroTTS =
            module.KokoroTTS;


        if (!KokoroTTS) {

            throw new Error(
                "KokoroTTS was not found."
            );
        }


        const modelId =
            "onnx-community/Kokoro-82M-v1.0-ONNX";


        /*
         * WASM is used because it has
         * broader browser compatibility.
         */

        kokoro =
            await KokoroTTS.from_pretrained(
                modelId,
                {
                    dtype:
                        "q8",

                    device:
                        "wasm"
                }
            );


        kokoroReady =
            true;


        console.log(
            "MoonPlug Kokoro TTS ready."
        );


        populateVoicePicker();


        return kokoro;


    } catch (error) {

        console.error(
            "MoonPlug Kokoro load failed:",
            error
        );


        kokoro =
            null;

        kokoroReady =
            false;


        return null;


    } finally {

        kokoroLoading =
            false;
    }
}


/* =========================================================
   VOICE PICKER SETUP
========================================================= */

function setupVoicePicker() {

    const selector =
        $("voiceSelect");


    if (!selector) {
        return;
    }


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


    /*
     * If Kokoro isn't loaded yet,
     * show a temporary state.
     */

    selector.innerHTML = `
        <option value="">
            Loading MoonPlug voices...
        </option>
    `;


    /*
     * Try again after the model loads.
     */

    setTimeout(
        populateVoicePicker,
        2500
    );
}


/* =========================================================
   POPULATE VOICE PICKER
========================================================= */

function populateVoicePicker() {

    const selector =
        $("voiceSelect");


    if (
        !selector ||
        !kokoro
    ) {

        return;
    }


    let voices = [];


    /*
     * kokoro-js exposes list_voices().
     */

    try {

        voices =
            kokoro.list_voices();

    } catch (error) {

        console.warn(
            "Could not read Kokoro voices:",
            error
        );

        return;
    }


    if (!Array.isArray(voices)) {

        return;
    }


    selector.innerHTML =
        "";


    const friendlyNames = {

        af_heart:
            "Heart — Natural Female",

        af_bella:
            "Bella — Warm Female",

        af_nicole:
            "Nicole — Smooth Female",

        af_sarah:
            "Sarah — Natural Female",

        af_sky:
            "Sky — Clear Female",

        am_adam:
            "Adam — Natural Male",

        am_michael:
            "Michael — Natural Male",

        am_fenrir:
            "Fenrir — Deep Male",

        am_puck:
            "Puck — Male",

        am_eric:
            "Eric — Male",

        bm_george:
            "George — British Male",

        bf_emma:
            "Emma — British Female"

    };


    voices.forEach(
        voiceName => {

            /*
             * English only for MoonPlug.
             */

            if (
                !/^(a|b)[fm]_/.test(
                    voiceName
                )
            ) {

                return;
            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                voiceName;


            option.textContent =
                friendlyNames[
                    voiceName
                ] ||
                voiceName;


            if (
                voiceName ===
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


    /*
     * If the saved voice isn't available,
     * use Heart.
     */

    const exists =
        Array.from(
            selector.options
        ).some(
            option =>
                option.value ===
                selectedVoiceName
        );


    if (
        !exists
    ) {

        selectedVoiceName =
            "af_heart";


        localStorage.setItem(
            "moonplugVoice",
            selectedVoiceName
        );


        selector.value =
            selectedVoiceName;
    }
}


/* =========================================================
   KOKORO SPEECH
========================================================= */

async function speakConversation(
    text
) {

    const message =
        String(
            text || ""
        ).trim();


    if (!message) {
        return;
    }


    /*
     * Stop old speech first.
     */

    stopKokoro();


    const tts =
        await loadKokoro();


    if (!tts) {

        speaking = false;

        setConversationState(
            "idle"
        );


        setConversationText(
            "MoonPlug voice is still loading."
        );


        return;
    }


    try {

        thinking = false;

        speaking = true;


        setConversationState(
            "talking"
        );


        startVoiceWave();


        /*
         * Generate the audio locally.
         */

        const audio =
            await tts.generate(
                message,
                {
                    voice:
                        selectedVoiceName,

                    speed:
                        0.95
                }
            );


        /*
         * User may have stopped speech
         * while Kokoro was generating.
         */

        if (!speaking) {

            return;
        }


        /*
         * kokoro-js RawAudio supports
         * converting to a Blob.
         */

        const blob =
            audio.toBlob();


        if (!blob) {

            throw new Error(
                "Kokoro returned no audio."
            );
        }


        if (kokoroAudioURL) {

            URL.revokeObjectURL(
                kokoroAudioURL
            );
        }


        kokoroAudioURL =
            URL.createObjectURL(
                blob
            );


        kokoroAudio =
            new Audio(
                kokoroAudioURL
            );


        kokoroAudio.volume =
            1;


        kokoroAudio.onended =
            () => {

                speaking = false;

                stopSpeechAnimation();


                if (
                    kokoroAudioURL
                ) {

                    URL.revokeObjectURL(
                        kokoroAudioURL
                    );

                    kokoroAudioURL =
                        null;
                }


                kokoroAudio =
                    null;


                setConversationState(
                    "idle"
                );


                setConversationText(
                    "Tap the microphone to talk"
                );
            };


        kokoroAudio.onerror =
            error => {

                console.error(
                    "Kokoro audio error:",
                    error
                );


                speaking = false;

                stopSpeechAnimation();


                setConversationState(
                    "idle"
                );


                setConversationText(
                    "MoonPlug couldn't play the voice."
                );
            };


        /*
         * Play the generated audio.
         */

        await kokoroAudio.play();


    } catch (error) {

        console.error(
            "Kokoro speech error:",
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
    }
}


/* =========================================================
   SAFARI AUDIO UNLOCK
========================================================= */

let audioContext = null;

function unlockAudio() {

    /*
     * Safari can be strict about audio playback.
     *
     * We create/resume an AudioContext directly
     * from the microphone button press.
     */

    try {

        if (!audioContext) {

            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;


            if (!AudioContextClass) {
                return;
            }


            audioContext =
                new AudioContextClass();
        }


        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext.resume()
                .catch(
                    () => {}
                );
        }


    } catch (error) {

        console.warn(
            "Audio unlock:",
            error
        );
    }
}


/* =========================================================
   STOP KOKORO
========================================================= */

function stopKokoro() {

    if (kokoroAudio) {

        try {

            kokoroAudio.pause();

            kokoroAudio.currentTime =
                0;

        } catch {}
    }


    kokoroAudio =
        null;


    if (kokoroAudioURL) {

        try {

            URL.revokeObjectURL(
                kokoroAudioURL
            );

        } catch {}
    }


    kokoroAudioURL =
        null;


    speaking =
        false;


    stopSpeechAnimation();
}


/* =========================================================
   STOP SPEAKING
========================================================= */

function stopSpeaking() {

    stopKokoro();
}


/* =========================================================
   VOICE WAVE
========================================================= */

function startVoiceWave() {

    const wave =
        $("voiceWave");

    if (!wave) {
        return;
    }


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


    if (!wave) {
        return;
    }


    wave
        .querySelectorAll(
            "span"
        )
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


/* =========================================================
   OPEN SETTINGS
========================================================= */

function openSettings() {

    const panel =
        $("settingsPanel");


    if (!panel) {
        return;
    }


    panel.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
     * Refresh the voice selector.
     */

    populateVoicePicker();
}


/* =========================================================
   CLOSE SETTINGS
========================================================= */

function closeSettings() {

    const panel =
        $("settingsPanel");


    if (!panel) {
        return;
    }


    panel.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   TEXT SIZE
========================================================= */

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


/* =========================================================
   LOAD TEXT SIZE
========================================================= */

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


    if (!screen) {
        return;
    }


    screen.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeAccount() {

    const screen =
        $("accountScreen");


    if (!screen) {
        return;
    }


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

