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

let recognition = null;
let recognitionSupported = false;

let listening = false;
let speaking = false;
let thinking = false;

let speechAnimationFrame = null;

let kokoro = null;
let kokoroLoading = false;
let kokoroReady = false;
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

    setupKokoroEvents();

    setupVoiceSelector();

    loadTextSize();

    checkBackendHealth();

    /*
     * Do NOT load Kokoro automatically.
     *
     * The browser may block audio unless the user
     * has interacted with the page first.
     *
     * Kokoro will load when:
     * - Conversation Mode opens
     * - Test Voice is pressed
     */

    setKokoroStatus(
        "idle",
        "Voice engine will load when needed."
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
        "MoonPlug chat:",
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

/* =========================================================
OPEN CONVERSATION
========================================================= */

async function openConversation() {

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
 * Load Kokoro after the user explicitly
 * opens Conversation Mode.
 */

await loadKokoro();

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


setConversationState(
    "idle"
);

}

/* =========================================================
MIC BUTTON
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


    /*
     * Show what the user said
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
     * NOW actually generate
     * and play Kokoro audio.
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
            "loading",
            "Kokoro voice engine is loading..."
        );
    }
);

}

/* =========================================================
KOKORO STATUS
========================================================= */

function setKokoroStatus(
state,
text
) {

const dot =
    $("kokoroStatusDot");

const statusText =
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

    if (state) {

        dot.classList.add(
            state
        );
    }
}


if (statusText) {

    statusText.textContent =
        text;
}


if (voiceStatus) {

    if (state === "ready") {

        voiceStatus.textContent =
            "Kokoro voice engine ready.";

    } else if (
        state === "speaking"
    ) {

        voiceStatus.textContent =
            "MoonPlug is speaking.";

    } else if (
        state === "loading"
    ) {

        voiceStatus.textContent =
            "Loading Kokoro voice engine...";

    } else if (
        state === "error"
    ) {

        voiceStatus.textContent =
            "Kokoro could not be loaded.";

    } else {

        voiceStatus.textContent =
            "Kokoro voice engine";
    }
}

}

/* =========================================================
LOAD KOKORO
========================================================= */

async function loadKokoro() {

if (kokoroReady && kokoro) {

    setKokoroStatus(
        "ready",
        "Kokoro voice engine is ready."
    );

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


/*
 * The HTML module exposes:
 *
 * window.MoonPlugKokoro.KokoroTTS
 */

if (
    !window.MoonPlugKokoro ||
    !window.MoonPlugKokoro.KokoroTTS
) {

    setKokoroStatus(
        "error",
        "Kokoro library could not be loaded."
    );

    console.error(
        "MoonPlugKokoro is missing."
    );

    return null;
}


kokoroLoading = true;


setKokoroStatus(
    "loading",
    "Loading Kokoro voice engine..."
);


try {

    const KokoroTTS =
        window.MoonPlugKokoro
            .KokoroTTS;


    /*
     * Use WASM/q8 because it is the
     * safest browser fallback.
     *
     * This works without requiring
     * WebGPU support.
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


    /*
     * Populate voices from the
     * actual Kokoro model.
     */

    populateKokoroVoices();


    setKokoroStatus(
        "ready",
        "Kokoro voice engine is ready."
    );


    console.log(
        "Kokoro loaded successfully.",
        kokoro
    );


    return kokoro;


} catch (error) {

    console.error(
        "Kokoro loading failed:",
        error
    );


    kokoro =
        null;

    kokoroReady =
        false;


    setKokoroStatus(
        "error",
        "Kokoro failed to load. Check the browser console."
    );


    return null;


} finally {

    kokoroLoading =
        false;
}

}

/* =========================================================
POPULATE KOKORO VOICES
========================================================= */

function populateKokoroVoices() {

const selector =
    $("voiceSelect");

if (!selector || !kokoro) return;


selector.innerHTML = "";


const voices =
    kokoro.voices ||
    {};


Object.entries(
    voices
).forEach(
    ([id, info]) => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            id;


        option.textContent =
            info &&
            info.name
                ? info.name
                : id;


        if (
            id ===
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


/*
 * If the saved voice doesn't exist,
 * use Heart.
 */

const exists =
    Object.prototype.hasOwnProperty.call(
        voices,
        selectedVoice
    );


if (!exists) {

    selectedVoice =
        "af_heart";

    localStorage.setItem(
        "moonplugVoice",
        selectedVoice
    );


    if (
        voices[selectedVoice]
    ) {

        selector.value =
            selectedVoice;
    }
}

}

/* =========================================================
VOICE SELECTOR
========================================================= */

function setupVoiceSelector() {

const selector =
    $("voiceSelect");

if (!selector) return;


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
            "MoonPlug Kokoro voice:",
            selectedVoice
        );
    }
);


const test =
    $("testVoiceButton");


if (test) {

    test.addEventListener(
        "click",
        testKokoroVoice
    );
}

}

/* =========================================================
TEST VOICE
========================================================= */

async function testKokoroVoice() {

const button =
    $("testVoiceButton");


if (button) {

    button.disabled =
        true;

    button.textContent =
        "Loading...";
}


try {

    const engine =
        await loadKokoro();


    if (!engine) {

        throw new Error(
            "Kokoro is not available."
        );
    }


    await speakConversation(
        "Hi. I'm MoonPlug. This is my Kokoro voice."
    );


} catch (error) {

    console.error(
        "Test voice failed:",
        error
    );


    setKokoroStatus(
        "error",
        "The test voice could not be played."
    );


} finally {

    if (button) {

        button.disabled =
            false;

        button.textContent =
            "Test Voice";
    }
}

}

/* =========================================================
KOKORO SPEECH
========================================================= */

async function speakConversation(
text
) {

const engine =
    await loadKokoro();


if (!engine) {

    setConversationState(
        "idle"
    );

    setConversationText(
        "Kokoro voice isn't available."
    );

    return;
}


stopSpeaking();


const cleanText =
    String(text || "").trim();


if (!cleanText) return;


speaking = true;

thinking = false;


setConversationState(
    "talking"
);


setKokoroStatus(
    "speaking",
    "MoonPlug is speaking."
);


startVoiceWave();


try {

    /*
     * Generate the actual WAV audio.
     */

    const audio =
        await engine.generate(
            cleanText,
            {
                voice:
                    selectedVoice ||
                    "af_heart",

                speed: 1
            }
        );


    /*
     * Convert Kokoro RawAudio
     * into a browser-playable Blob.
     */

    const blob =
        audio.toBlob();


    const url =
        URL.createObjectURL(
            blob
        );


    currentAudioURL =
        url;


    currentAudio =
        new Audio();


    currentAudio.preload =
        "auto";


    currentAudio.src =
        url;


    /*
     * When the audio starts,
     * keep the UI in Speaking mode.
     */

    currentAudio.onplay =
        () => {

            speaking = true;

            setConversationState(
                "talking"
            );

            setKokoroStatus(
                "speaking",
                "MoonPlug is speaking."
            );
        };


    /*
     * When the audio finishes,
     * return to Ready.
     */

    currentAudio.onended =
        () => {

            finishSpeaking();
        };


    currentAudio.onerror =
        error => {

            console.error(
                "Kokoro audio error:",
                error
            );

            finishSpeaking();
        };


    /*
     * IMPORTANT:
     * This is the line that actually
     * starts playback.
     */

    await currentAudio.play();


} catch (error) {

    console.error(
        "Kokoro speech failed:",
        error
    );


    finishSpeaking();


    setConversationText(
        "Kokoro couldn't play the voice."
    );
}

}

/* =========================================================
FINISH SPEAKING
========================================================= */

function finishSpeaking() {

speaking =
    false;

thinking =
    false;


stopSpeechAnimation();


if (currentAudio) {

    currentAudio.onended =
        null;

    currentAudio.onerror =
        null;

    currentAudio.onplay =
        null;
}


if (currentAudioURL) {

    URL.revokeObjectURL(
        currentAudioURL
    );

    currentAudioURL =
        null;
}


currentAudio =
    null;


setKokoroStatus(
    "ready",
    "Kokoro voice engine is ready."
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

    currentAudioURL =
        null;
}


speaking =
    false;


stopSpeechAnimation();


if (kokoroReady) {

    setKokoroStatus(
        "ready",
        "Kokoro voice engine is ready."
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

/* =========================================================
OPEN SETTINGS
========================================================= */

async function openSettings() {

const panel =
    $("settingsPanel");

if (!panel) return;


panel.setAttribute(
    "aria-hidden",
    "false"
);


/*
 * Load Kokoro only when the user
 * actually interacts with voice settings.
 */

await loadKokoro();

}

/* =========================================================
CLOSE SETTINGS
========================================================= */

function closeSettings() {

const panel =
    $("settingsPanel");

if (!panel) return;


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
