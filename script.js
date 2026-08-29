"use strict";

/* =========================================================
MOONPLUG AI
COMPLETE FRONTEND JS
BACKEND UNCHANGED
SAFARI VOICE VERSION
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
DOM
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
setupSpeechSynthesis();

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


document
    .querySelectorAll(".sidebar-button")
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
SPECIAL MOONPLUG QUESTIONS
========================================================= */

function getSpecialResponse(message) {

const text =
    String(message)
        .toLowerCase()
        .trim();


if (
    text.includes("who made you") ||
    text.includes("who created you") ||
    text.includes("who built you") ||
    text.includes("who is your creator")
) {

    return "I was made by Xavier as part of the MoonPlug AI project.";
}


if (
    text.includes("when were you made") ||
    text.includes("when were you created") ||
    text.includes("when did you get made") ||
    text.includes("when was moonplug made")
) {

    return "MoonPlug was created in 2026.";
}


return null;

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

input.style.height = "auto";

button.disabled = true;

thinking = true;

showTyping();


try {

    /*
     * Handle built-in MoonPlug identity
     * questions without touching the backend.
     */

    const special =
        getSpecialResponse(message);


    if (special) {

        addMessage(
            special,
            "ai"
        );

        return;
    }


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
MESSAGES
========================================================= */

function addMessage(text, sender) {

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
CONVERSATION SETUP
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
MIC BUTTON
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
        labels[state] ||
        "Ready";
}

}

/* =========================================================
CONVERSATION TEXT
========================================================= */

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
        "Speech recognition:",
        event.error
    );


    listening = false;


    if (
        event.error === "not-allowed"
    ) {

        setConversationState("idle");

        setConversationText(
            "Microphone permission was denied."
        );

        return;
    }


    if (
        event.error === "no-speech"
    ) {

        setConversationState("idle");

        setConversationText(
            "I didn't hear anything. Tap to try again."
        );

        return;
    }


    setConversationState("idle");

    setConversationText(
        "Microphone error. Try again."
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
    String(transcript || "")
        .trim();


if (!message) {

    setConversationState("idle");

    return;
}


const requestId =
    ++conversationRequestId;


setConversationText(
    message
);


/*
 * Built-in answers.
 */

const special =
    getSpecialResponse(message);


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

    speakConversation(
        special
    );

    return;
}


thinking = true;

setConversationState(
    "thinking"
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
SPEECH SYNTHESIS SETUP
========================================================= */

function setupSpeechSynthesis() {

if (
    !("speechSynthesis" in window)
) {

    setVoiceStatus(
        "Voice isn't supported in this browser."
    );

    return;
}


const synth =
    window.speechSynthesis;


/*
 * Safari can initially return an empty
 * voice list. Refresh when voices appear.
 */

loadSpeechVoices();


if (
    "onvoiceschanged" in synth
) {

    synth.onvoiceschanged =
        loadSpeechVoices;
}


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
        testSelectedVoice
    );
}


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

    setVoiceStatus(
        `${speechVoices.length} voices available`
    );

} else {

    setVoiceStatus(
        "Waiting for available voices..."
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


if (!speechVoices.length) {

    selector.innerHTML = `
        <option value="">
            Loading voices...
        </option>
    `;

    return;
}


const english =
    speechVoices.filter(
        voice =>
            /^en[-_]/i.test(
                voice.lang
            )
    );


const voices =
    english.length
        ? english
        : speechVoices;


selector.innerHTML = "";


voices.forEach(voice => {

    const option =
        document.createElement(
            "option"
        );


    option.value =
        voice.name;


    option.textContent =
        `${voice.name} — ${voice.lang}`;


    selector.appendChild(
        option
    );
});


let selected =
    voices.find(
        voice =>
            voice.name ===
            selectedVoiceName
    );


if (!selected) {

    selected =
        voices.find(
            voice => voice.default
        ) ||
        voices[0];


    selectedVoiceName =
        selected.name;


    localStorage.setItem(
        "moonplugVoice",
        selectedVoiceName
    );
}


selector.value =
    selectedVoiceName;

}

/* =========================================================
GET SELECTED VOICE
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


return (
    voices.find(
        voice => voice.default
    ) ||
    voices.find(
        voice =>
            /^en-US/i.test(
                voice.lang
            )
    ) ||
    voices[0]
);

}

/* =========================================================
TEST VOICE
========================================================= */

function testSelectedVoice() {

if (
    !("speechSynthesis" in window)
) {

    setVoiceStatus(
        "Voice isn't supported in this browser."
    );

    return;
}


/*
 * This function is called directly by
 * the user's button click, which is important
 * for browsers with speech restrictions.
 */

stopSpeaking();


const voice =
    getSelectedVoice();


if (!voice) {

    setVoiceStatus(
        "No voice is available yet. Try again."
    );

    return;
}


speakText(
    "Hi. I'm MoonPlug. This is my voice."
);

}

/* =========================================================
SPEAK CONVERSATION
========================================================= */

function speakConversation(text) {

speakText(text);

}

/* =========================================================
ACTUAL SPEECH
========================================================= */

function speakText(text) {

if (
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance ===
        "undefined"
) {

    speaking = false;

    setConversationState("idle");

    setConversationText(
        "Voice playback isn't supported."
    );

    setVoiceStatus(
        "Voice isn't supported."
    );

    return;
}


const synth =
    window.speechSynthesis;


const voice =
    getSelectedVoice();


/*
 * Cancel anything already waiting.
 */

try {
    synth.cancel();
} catch {}


/*
 * Safari sometimes needs resume()
 * before speaking.
 */

try {
    synth.resume();
} catch {}


const utterance =
    new SpeechSynthesisUtterance(
        String(text)
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


    setVoiceStatus(
        "Speaking"
    );


    startVoiceWave();
};


utterance.onend = () => {

    speaking = false;

    thinking = false;


    stopSpeechAnimation();


    setVoiceStatus(
        "Ready"
    );


    setConversationState(
        "idle"
    );


    setConversationText(
        "Tap the microphone to talk"
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


    setVoiceStatus(
        "Voice playback failed"
    );


    setConversationState(
        "idle"
    );


    setConversationText(
        "Tap the microphone to talk"
    );
};


try {

    synth.speak(
        utterance
    );

} catch (error) {

    console.error(
        "Speech failed:",
        error
    );


    speaking = false;

    thinking = false;


    setVoiceStatus(
        "Voice playback failed"
    );
}

}

/* =========================================================
VOICE STATUS
========================================================= */

function setVoiceStatus(text) {

const status =
    $("voiceStatus");

if (status) {

    status.textContent =
        String(text);
}


const statusText =
    $("kokoroStatusText");

if (statusText) {

    statusText.textContent =
        String(text);
}


const dot =
    $("kokoroStatusDot");

if (dot) {

    dot.classList.toggle(
        "speaking",
        String(text)
            .toLowerCase()
            .includes("speaking")
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


const wave =
    $("voiceWave");

if (!wave) return;


wave.querySelectorAll("span")
    .forEach(bar => {

        bar.style.transform =
            "scaleY(.15)";
    });

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
    } catch {}


    try {
        window.speechSynthesis.resume();
    } catch {}
}


speaking = false;

stopSpeechAnimation();

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

/* =========================================================
TEXT SIZE
========================================================= */

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
