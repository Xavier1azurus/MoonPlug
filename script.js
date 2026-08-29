
"use strict";

/* =========================================================
MOONPLUG AI
COMPLETE JAVASCRIPT
ONE-BUTTON VOICE CONVERSATION
========================================================= */

/* =========================================================
CONFIG
========================================================= */

const API_BASE =
"https://moonplug.onrender.com";

/* =========================================================
STATE
========================================================= */

let recognition = null;

let recognitionSupported = false;

let listening = false;
let thinking = false;
let speaking = false;

let speechUnlocked = false;

let speechVoices = [];

let animationFrame = null;

let conversationRequestId = 0;

/* =========================================================
SHORT DOM HELPER
========================================================= */

const $ = id =>
document.getElementById(id);

/* =========================================================
START
========================================================= */

document.addEventListener(
"DOMContentLoaded",
() => {

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

}

);

/* =========================================================
STARS
========================================================= */

function createStars() {

const field =
    $("starField");

if (!field)
    return;


field.innerHTML = "";


const amount =
    window.innerWidth <= 600
        ? 60
        : 100;


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
        `${Math.random() * 1.8 + .5}px`
    );


    star.style.setProperty(
        "--star-opacity",
        `${Math.random() * .65 + .2}`
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
========================================================= */

function setupSidebar() {

const logo =
    $("sidebarLogo");


if (logo) {

    logo.addEventListener(
        "click",
        () => {

            if (
                window.innerWidth <= 900
            ) {

                $("sidebar")
                    ?.classList
                    .toggle("expanded");
            }
        }
    );
}


$("conversationButton")
    ?.addEventListener(
        "click",
        openConversation
    );


$("newChatButton")
    ?.addEventListener(
        "click",
        startNewChat
    );


$("settingsButton")
    ?.addEventListener(
        "click",
        openSettings
    );


$("accountButton")
    ?.addEventListener(
        "click",
        openAccount
    );


$("historyButton")
    ?.addEventListener(
        "click",
        () => {

            alert(
                "Chat history is coming soon."
            );

        }
    );


$("studyButton")
    ?.addEventListener(
        "click",
        () => {

            alert(
                "Study mode is coming soon."
            );

        }
    );


$("cookButton")
    ?.addEventListener(
        "click",
        () => {

            alert(
                "Cook mode is coming soon."
            );

        }
    );


$("imagesButton")
    ?.addEventListener(
        "click",
        () => {

            alert(
                "Image mode is coming soon."
            );

        }
    );


$("codeButton")
    ?.addEventListener(
        "click",
        () => {

            alert(
                "Code mode is coming soon."
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


if (!input || !button)
    return;


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
NORMAL CHAT SEND
========================================================= */

async function sendMessage() {

const input =
    $("messageInput");

const button =
    $("sendButton");


if (!input || !button)
    return;


const message =
    input.value.trim();


if (!message)
    return;


addMessage(
    message,
    "user"
);


input.value = "";

input.style.height =
    "auto";


showTyping();

button.disabled =
    true;


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

                body:
                    JSON.stringify({
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
        "Chat error:",
        error
    );


    addMessage(
        "I couldn't connect to MoonPlug right now.",
        "ai"
    );


} finally {

    hideTyping();

    button.disabled =
        false;

    input.focus();
}

}

/* =========================================================
ADD CHAT MESSAGE
========================================================= */

function addMessage(
text,
sender
) {

const messages =
    $("messages");


if (!messages)
    return;


$("emptyChat")
    ?.remove();


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
TYPING
========================================================= */

function showTyping() {

const typing =
    $("typing");


if (typing)
    typing.hidden =
        false;

}

function hideTyping() {

const typing =
    $("typing");


if (typing)
    typing.hidden =
        true;

}

/* =========================================================
CONVERSATION SETUP
========================================================= */

function setupConversation() {

$("conversationClose")
    ?.addEventListener(
        "click",
        closeConversation
    );


/*
 * THIS IS THE ONLY VOICE BUTTON.
 */

$("conversationMic")
    ?.addEventListener(
        "click",
        handleConversationButton
    );

}

/* =========================================================
OPEN CONVERSATION
========================================================= */

function openConversation() {

const mode =
    $("conversationMode");


if (!mode)
    return;


mode.classList.add(
    "active"
);


mode.setAttribute(
    "aria-hidden",
    "false"
);


listening =
    false;

thinking =
    false;

speaking =
    false;


setConversationState(
    "idle"
);


setConversationText(
    "Tap the button to talk"
);


/*
 * Don't automatically start the microphone.
 * The user controls it with the ONE button.
 */

}

/* =========================================================
CLOSE CONVERSATION
========================================================= */

function closeConversation() {

stopListening();

stopSpeaking();


thinking =
    false;


conversationRequestId++;


const mode =
    $("conversationMode");


if (!mode)
    return;


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
THE ONE BUTTON
========================================================= */

function handleConversationButton() {

/*
 * IMPORTANT:
 *
 * This function is directly called by
 * the user's physical tap/click.
 *
 * That allows us to unlock Safari's
 * speech engine here.
 */

unlockSpeech();


/*
 * If MoonPlug is speaking,
 * the same button stops speech.
 */

if (speaking) {

    stopSpeaking();

    setConversationState(
        "idle"
    );

    setConversationText(
        "Tap the button to talk"
    );

    return;
}


/*
 * If listening,
 * stop listening.
 */

if (listening) {

    stopListening();

    return;
}


/*
 * Otherwise:
 * listen.
 */

startListening();

}

/* =========================================================
CONVERSATION STATUS
========================================================= */

function setConversationState(
state
) {

const mode =
    $("conversationMode");

const status =
    $("conversationStatus");


if (!mode)
    return;


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

    recognitionSupported =
        false;

    console.warn(
        "Speech recognition is not supported."
    );

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


recognition.maxAlternatives =
    1;


recognition.onstart =
    () => {

        listening =
            true;

        thinking =
            false;


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


        const lastResult =
            event.results[
                event.results.length - 1
            ];


        if (
            lastResult &&
            lastResult.isFinal
        ) {

            processConversation(
                transcript
            );
        }
    };


recognition.onerror =
    event => {

        console.warn(
            "Recognition error:",
            event.error
        );


        listening =
            false;


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


            return;
        }


        if (
            event.error ===
            "service-not-allowed"
        ) {

            setConversationState(
                "idle"
            );


            setConversationText(
                "The browser blocked microphone access."
            );


            return;
        }


        if (
            event.error ===
            "no-speech"
        ) {

            setConversationState(
                "idle"
            );


            setConversationText(
                "I didn't hear anything. Tap again."
            );


            return;
        }


        setConversationState(
            "idle"
        );


        setConversationText(
            "Microphone error. Tap again."
        );
    };


recognition.onend =
    () => {

        listening =
            false;


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
 * Never start another recognition
 * session while one is already active.
 */

if (listening)
    return;


if (speaking) {

    stopSpeaking();

    return;
}


if (!recognitionSupported) {

    setConversationState(
        "idle"
    );


    setConversationText(
        "Voice input isn't supported in this browser."
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


    /*
     * Some browsers throw if they
     * believe recognition is still
     * shutting down.
     */

    try {

        recognition.stop();

    } catch {}


    setTimeout(
        () => {

            try {

                recognition.start();

            } catch (secondError) {

                console.error(
                    "Recognition restart:",
                    secondError
                );

                setConversationState(
                    "idle"
                );

                setConversationText(
                    "Tap again to start listening."
                );
            }

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


listening =
    false;


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
SEND VOICE TO MOONPLUG
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

    setConversationText(
        "Tap the button to talk"
    );

    return;
}


const requestId =
    ++conversationRequestId;


thinking =
    true;


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

                body:
                    JSON.stringify({
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


    thinking =
        false;


    /*
     * Put the conversation in normal
     * chat history too.
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
     * THIS IS THE ACTUAL VOICE OUTPUT.
     */

    speakConversation(
        cleanReply
    );


} catch (error) {

    console.error(
        "Voice conversation error:",
        error
    );


    thinking =
        false;


    speaking =
        false;


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

    console.warn(
        "Speech synthesis unavailable."
    );

    return;
}


loadSpeechVoices();


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
LOAD VOICES
========================================================= */

function loadSpeechVoices() {

if (
    !("speechSynthesis" in window)
)
    return;


speechVoices =
    window.speechSynthesis
        .getVoices() || [];

}

/* =========================================================
SPEECH UNLOCK
========================================================= */

function unlockSpeech() {

if (
    !("speechSynthesis" in window)
)
    return;


/*
 * Don't repeatedly unlock it.
 */

if (speechUnlocked)
    return;


speechUnlocked =
    true;


try {

    /*
     * This tiny silent utterance is
     * deliberately started directly
     * from the user's tap.
     *
     * Safari/iOS can otherwise reject
     * speech that starts after an
     * asynchronous fetch.
     */

    const unlock =
        new SpeechSynthesisUtterance(
            " "
        );


    unlock.volume =
        0;


    unlock.rate =
        10;


    unlock.pitch =
        1;


    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(
        unlock
    );


    window.speechSynthesis.resume();

} catch (error) {

    console.warn(
        "Speech unlock:",
        error
    );
}

}

/* =========================================================
BEST VOICE
========================================================= */

function getBestVoice() {

loadSpeechVoices();


if (
    !speechVoices.length
) {

    return null;
}


const english =
    speechVoices.filter(
        voice =>
            /^en[-_]/i.test(
                voice.lang
            )
    );


if (
    !english.length
) {

    return speechVoices[0];
}


const preferred = [

    "Samantha",
    "Alex",
    "Daniel",
    "Karen",
    "Google US English",
    "Microsoft Aria",
    "Microsoft Jenny",
    "Microsoft Guy",
    "Microsoft Zira"
];


for (
    const name of preferred
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


    if (found)
        return found;
}


const american =
    english.find(
        voice =>
            /^en-US/i.test(
                voice.lang
            )
    );


return american ||
    english[0];

}

/* =========================================================
SPEAK RESPONSE
========================================================= */

function speakConversation(
text
) {

if (
    !("speechSynthesis" in window)
) {

    thinking =
        false;


    setConversationState(
        "idle"
    );


    setConversationText(
        "This browser does not support voice playback."
    );


    return;
}


const cleanText =
    String(text || "")
        .trim();


if (!cleanText) {

    setConversationState(
        "idle"
    );

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


const utterance =
    new SpeechSynthesisUtterance(
        cleanText
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
 * Voice tuning.
 */

utterance.rate =
    .94;


utterance.pitch =
    1;


utterance.volume =
    1;


utterance.onstart =
    () => {

        thinking =
            false;

        speaking =
            true;


        setConversationState(
            "talking"
        );


        setConversationText(
            cleanText
        );


        startVoiceWave();
    };


utterance.onend =
    () => {

        speaking =
            false;

        thinking =
            false;


        stopVoiceWave();


        setConversationState(
            "idle"
        );


        setConversationText(
            "Tap the button to talk"
        );
    };


utterance.onerror =
    event => {

        console.error(
            "Speech synthesis error:",
            event
        );


        speaking =
            false;

        thinking =
            false;


        stopVoiceWave();


        setConversationState(
            "idle"
        );


        setConversationText(
            "Tap the button to talk"
        );
    };


try {

    window.speechSynthesis.speak(
        utterance
    );


    /*
     * Safari sometimes pauses speech
     * immediately after it is queued.
     */

    setTimeout(
        () => {

            try {

                window.speechSynthesis.resume();

            } catch {}
        },
        50
    );


} catch (error) {

    console.error(
        "Speech start failed:",
        error
    );


    speaking =
        false;


    thinking =
        false;


    setConversationState(
        "idle"
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


speaking =
    false;


stopVoiceWave();

}

/* =========================================================
VOICE WAVE ANIMATION
========================================================= */

function startVoiceWave() {

const wave =
    $("voiceWave");


if (!wave)
    return;


stopVoiceWave();


const bars =
    Array.from(
        wave.querySelectorAll("span")
    );


function animate() {

    if (!speaking) {

        stopVoiceWave();

        return;
    }


    const time =
        Date.now();


    bars.forEach(
        (bar, index) => {

            const center =
                Math.abs(
                    index -
                    (bars.length - 1) / 2
                );


            const distance =
                center /
                ((bars.length - 1) / 2);


            const centerPower =
                1 - distance;


            const waveValue =
                (
                    Math.sin(
                        time / 85 +
                        index * .9
                    ) + 1
                ) / 2;


            const random =
                Math.random();


            const height =
                .12 +
                (
                    waveValue * .6 +
                    random * .4
                ) *
                (
                    .4 +
                    centerPower * .8
                );


            bar.style.transform =
                `scaleY(${Math.min(1.9,height)})`;
        }
    );


    animationFrame =
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
    animationFrame
) {

    cancelAnimationFrame(
        animationFrame
    );


    animationFrame =
        null;
}


const wave =
    $("voiceWave");


if (!wave)
    return;


wave.querySelectorAll("span")
    .forEach(
        bar => {

            bar.style.transform =
                "scaleY(.08)";
        }
    );

}

/* =========================================================
NEW CHAT
========================================================= */

function startNewChat() {

stopSpeaking();

stopListening();


const messages =
    $("messages");


if (!messages)
    return;


messages.innerHTML = `

    <div
        id="emptyChat"
        class="empty-chat"
    >

        <div class="moon-symbol">
            🌙
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
SETTINGS
========================================================= */

function setupSettings() {

$("closeSettings")
    ?.addEventListener(
        "click",
        closeSettings
    );


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


if (!panel)
    return;


panel.setAttribute(
    "aria-hidden",
    "false"
);

}

function closeSettings() {

const panel =
    $("settingsPanel");


if (!panel)
    return;


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

if (
    !["small","medium","large"]
        .includes(size)
) {

    size =
        "medium";
}


document.body.classList.remove(
    "text-small",
    "text-medium",
    "text-large"
);


document.body.classList.add(
    `text-${size}`
);


try {

    localStorage.setItem(
        "moonplugTextSize",
        size
    );

} catch {}


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

let saved =
    "medium";


try {

    saved =
        localStorage.getItem(
            "moonplugTextSize"
        ) ||
        "medium";

} catch {}


updateTextSize(
    saved
);

}

/* =========================================================
ACCOUNT
========================================================= */

function setupAccount() {

$("closeAccount")
    ?.addEventListener(
        "click",
        closeAccount
    );

}

function openAccount() {

const screen =
    $("accountScreen");


if (!screen)
    return;


screen.setAttribute(
    "aria-hidden",
    "false"
);

}

function closeAccount() {

const screen =
    $("accountScreen");


if (!screen)
    return;


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
            `${API_BASE}/api/health`,
            {
                method: "GET"
            }
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
