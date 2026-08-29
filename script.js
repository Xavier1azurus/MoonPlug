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

let conversationRequestId = 0;

/* =========================================================
VOICE
========================================================= */

let moonplugTTS = null;
let ttsLoading = false;
let ttsReady = false;
let ttsAudioContext = null;
let currentAudioSource = null;

let selectedVoice =
localStorage.getItem("moonplugVoice") ||
"af_heart";

/* =========================================================
DOM HELPER
========================================================= */

const $ = id => document.getElementById(id);

/* =========================================================
STARTUP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

thinking = false;
listening = false;
speaking = false;

hideTyping();

hideEngineUI();

createStars();

setupSidebar();

setupChat();

setupConversation();

setupSettings();

setupAccount();

setupSpeechRecognition();

setupVoiceSelector();

checkBackendHealth();

});

/* =========================================================
HIDE ENGINE UI
========================================================= */

function hideEngineUI() {

const status =
    $("voiceStatus");

const engineCard =
    document.querySelector(
        ".kokoro-status-card"
    );

if (status) {
    status.style.display = "none";
}

if (engineCard) {
    engineCard.style.display = "none";
}

}

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


document
    .querySelectorAll(
        ".sidebar-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

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

    });

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

thinking = true;

showTyping();


/*
 * Built-in MoonPlug identity answers.
 */

const special =
    getMoonPlugIdentityAnswer(
        message
    );


if (special) {

    await wait(250);

    addMessage(
        special,
        "ai"
    );

    thinking = false;

    hideTyping();

    button.disabled = false;

    input.focus();

    return;
}


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

function getMoonPlugIdentityAnswer(
text
) {

const normalized =
    String(text)
        .toLowerCase()
        .replace(
            /[?!.,]/g,
            ""
        )
        .trim();


const whoMadePatterns = [

    "who made you",
    "who created you",
    "who built you",
    "who developed you",
    "who is your creator",
    "who made moonplug",
    "who created moonplug",
    "who built moonplug"

];


const whenMadePatterns = [

    "when were you made",
    "when were you created",
    "when were you built",
    "when was moonplug made",
    "when was moonplug created",
    "when did you get created"

];


if (
    whoMadePatterns.some(
        phrase =>
            normalized.includes(
                phrase
            )
    )
) {

    return (
        "I'm MoonPlug AI, created as part of the MoonPlug AI project."
    );
}


if (
    whenMadePatterns.some(
        phrase =>
            normalized.includes(
                phrase
            )
    )
) {

    return (
        "MoonPlug AI was developed during the MoonPlug project. My exact creation date depends on which version you're using."
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


if (!message) return;


const requestId =
    ++conversationRequestId;


/*
 * Handle identity questions locally.
 */

const special =
    getMoonPlugIdentityAnswer(
        message
    );


if (special) {

    addMessage(
        message,
        "user"
    );

    addMessage(
        special,
        "ai"
    );


    setConversationText(
        special
    );


    await speakConversation(
        special
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
                    message:
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
VOICE SELECTOR
========================================================= */

function setupVoiceSelector() {

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
                selector.value ||
                "af_heart";


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
        async () => {

            await speakConversation(
                "Hi. I'm MoonPlug."
            );

        }
    );

}

}

/* =========================================================
LOAD VOICE MODEL
========================================================= */

async function loadMoonPlugVoice() {

if (ttsReady && moonplugTTS) {

    return moonplugTTS;
}


if (ttsLoading) {

    while (ttsLoading) {

        await wait(100);

    }

    return moonplugTTS;
}


if (
    !window.MoonPlugKokoro ||
    !window.MoonPlugKokoro.KokoroTTS
) {

    console.error(
        "Voice library was not loaded."
    );

    return null;
}


ttsLoading = true;


try {

    const KokoroTTS =
        window.MoonPlugKokoro.KokoroTTS;


    /*
     * q8 + WASM is a practical browser
     * configuration and does not require
     * WebGPU.
     */

    moonplugTTS =
        await KokoroTTS.from_pretrained(
            "onnx-community/Kokoro-82M-v1.0-ONNX",
            {
                dtype: "q8",
                device: "wasm"
            }
        );


    ttsReady = true;


    console.log(
        "MoonPlug voice ready."
    );


    return moonplugTTS;


} catch (error) {

    console.error(
        "Voice model failed to load:",
        error
    );


    moonplugTTS = null;

    ttsReady = false;


    return null;


} finally {

    ttsLoading = false;

}

}

/* =========================================================
SPEAK
========================================================= */

async function speakConversation(
text
) {

const cleanText =
    String(text || "").trim();


if (!cleanText) return;


stopSpeechAudio();


/*
 * Safari requires audio playback to
 * happen in a user-interaction context
 * when possible. The microphone/test
 * button starts this flow.
 */

try {

    const tts =
        await loadMoonPlugVoice();


    if (!tts) {

        setConversationText(
            "Voice could not be loaded."
        );

        setConversationState(
            "idle"
        );

        return;
    }


    speaking = true;

    thinking = false;


    setConversationState(
        "talking"
    );


    setConversationText(
        cleanText
    );


    const audio =
        await tts.generate(
            cleanText,
            {
                voice:
                    selectedVoice ||
                    "af_heart",

                speed:
                    1
            }
        );


    await playGeneratedAudio(
        audio
    );


} catch (error) {

    console.error(
        "MoonPlug voice error:",
        error
    );


} finally {

    speaking = false;

    thinking = false;

    stopVoiceWave();


    if (
        $("conversationMode")
    ) {

        setConversationState(
            "idle"
        );

    }

}

}

/* =========================================================
PLAY GENERATED AUDIO
========================================================= */

async function playGeneratedAudio(
audio
) {

if (!audio) {

    throw new Error(
        "No generated audio."
    );
}


/*
 * Transformers.js RawAudio exposes
 * the samples and sampling rate.
 */

const samples =
    audio.audio ||
    audio.data;


const sampleRate =
    audio.sampling_rate ||
    audio.sampleRate ||
    24000;


if (!samples) {

    /*
     * Some versions expose a helper
     * which can return a WAV blob.
     */

    if (
        typeof audio.save ===
        "function"
    ) {

        throw new Error(
            "Generated audio format could not be read by this browser."
        );
    }


    throw new Error(
        "Generated audio contains no samples."
    );
}


const floatSamples =
    samples instanceof Float32Array
        ? samples
        : Float32Array.from(
            samples
        );


if (!ttsAudioContext) {

    ttsAudioContext =
        new (
            window.AudioContext ||
            window.webkitAudioContext
        )({
            sampleRate:
                sampleRate
        });

}


if (
    ttsAudioContext.state ===
    "suspended"
) {

    await ttsAudioContext.resume();

}


const buffer =
    ttsAudioContext.createBuffer(
        1,
        floatSamples.length,
        sampleRate
    );


buffer.copyToChannel(
    floatSamples,
    0
);


const source =
    ttsAudioContext.createBufferSource();


source.buffer =
    buffer;


source.connect(
    ttsAudioContext.destination
);


currentAudioSource =
    source;


startVoiceWave();


await new Promise(
    resolve => {

        source.onended = () => {

            currentAudioSource =
                null;

            resolve();

        };


        source.start(0);

    }
);

}

/* =========================================================
STOP SPEAKING
========================================================= */

function stopSpeaking() {

stopSpeechAudio();

speaking = false;

stopVoiceWave();

}

/* =========================================================
STOP AUDIO
========================================================= */

function stopSpeechAudio() {

if (currentAudioSource) {

    try {

        currentAudioSource.stop();

    } catch {}

    currentAudioSource =
        null;
}

}

/* =========================================================
VOICE WAVE
========================================================= */

function startVoiceWave() {

const wave =
    $("voiceWave");

if (!wave) return;


stopVoiceWave();


const bars =
    Array.from(
        wave.querySelectorAll(
            "span"
        )
    );


function animate() {

    if (!speaking) {

        stopVoiceWave();

        return;
    }


    bars.forEach(
        (bar, index) => {

            const pulse =
                Math.sin(
                    Date.now() /
                        100 +
                    index *
                        0.7
                );


            const height =
                0.3 +
                (
                    (pulse + 1) /
                    2
                ) *
                0.9;


            bar.style.transform =
                `scaleY(${height})`;

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
STOP WAVE
========================================================= */

function stopVoiceWave() {

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
HELPERS
========================================================= */

function wait(ms) {

return new Promise(
    resolve =>
        setTimeout(
            resolve,
            ms
        )
);

}

/* =========================================================
KOKORO LIBRARY READY EVENT
========================================================= */

window.addEventListener(
"kokoro-ready",
() => {

    console.log(
        "MoonPlug voice library loaded."
    );

}

);
