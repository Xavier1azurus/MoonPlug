
"use strict";

/* =========================================================
   MOONPLUG AI
   COMPLETE JAVASCRIPT
   CHAT + ONE-BUTTON VOICE CONVERSATION
========================================================= */


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

let speechAnimationFrame = null;

let speechVoices = [];

let conversationRequestId = 0;


/* =========================================================
   DOM HELPER
========================================================= */

function $(id) {
    return document.getElementById(id);
}


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

        setupSpeechRecognition();

        setupSpeechVoices();

        loadTextSize();

        /*
         * IMPORTANT:
         * Do NOT start conversation mode here.
         * Do NOT start speech here.
         * Do NOT show thinking here.
         */

        hideTyping();

        checkBackendHealth();

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
========================================================= */

function setupSidebar() {

    const logo = $("sidebarLogo");

    if (logo) {

        logo.addEventListener(
            "click",
            toggleSidebar
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


    const conversation =
        $("conversationButton");

    if (conversation) {

        conversation.addEventListener(
            "click",
            openConversation
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


    /*
     * Buttons that aren't implemented yet
     * are deliberately prevented from doing
     * anything weird.
     */

    [
        "studyButton",
        "cookButton",
        "imagesButton",
        "codeButton",
        "historyButton"
    ].forEach(id => {

        const button = $(id);

        if (button) {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    console.log(
                        `${id} is not connected yet.`
                    );
                }
            );
        }
    });
}


function toggleSidebar() {

    const sidebar =
        $("sidebar");

    if (!sidebar)
        return;


    /*
     * Desktop:
     * collapsed <-> expanded
     */

    if (window.innerWidth > 900) {

        sidebar.classList.toggle(
            "collapsed"
        );

        document.body.classList.toggle(
            "sidebar-collapsed"
        );

        return;
    }


    /*
     * Tablet + mobile:
     * expanded <-> collapsed
     */

    sidebar.classList.toggle(
        "expanded"
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

    button.disabled = true;


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
            "Chat error:",
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
   ADD MESSAGE
========================================================= */

function addMessage(
    text,
    sender
) {

    const messages =
        $("messages");

    if (!messages)
        return;


    const empty =
        $("emptyChat");

    if (empty)
        empty.remove();


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

    if (!typing)
        return;

    typing.hidden = false;
}


function hideTyping() {

    const typing =
        $("typing");

    if (!typing)
        return;

    typing.hidden = true;
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

        /*
         * THIS IS THE ONLY VOICE BUTTON.
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

    const mode =
        $("conversationMode");

    if (!mode)
        return;


    /*
     * Completely reset conversation mode.
     */

    stopListening();

    stopSpeaking();

    thinking = false;

    mode.classList.remove(
        "listening",
        "thinking",
        "talking"
    );


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
        "Tap the button to talk"
    );


    /*
     * IMPORTANT:
     * Opening the screen DOES NOT speak.
     * Opening the screen DOES NOT call API.
     * Opening the screen DOES NOT listen.
     */
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
   ONE BUTTON
========================================================= */

function handleConversationButton() {

    /*
     * If MoonPlug is talking,
     * same button stops it.
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
     * If currently listening,
     * same button stops listening.
     */

    if (listening) {

        stopListening();

        setConversationState(
            "idle"
        );

        setConversationText(
            "Tap the button to talk"
        );

        return;
    }


    /*
     * Otherwise:
     * START listening.
     */

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

    if (!mode)
        return;


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


    /*
     * FALSE is intentional.
     *
     * We only want one spoken request
     * at a time.
     */

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


            const finalResult =
                event.results[
                    event.results.length - 1
                ];


            if (
                finalResult &&
                finalResult.isFinal &&
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
                "Recognition error:",
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
                    "I didn't hear anything. Tap to try again."
                );

                return;
            }


            setConversationState(
                "idle"
            );

            setConversationText(
                "Microphone error. Tap to try again."
            );
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
            "Speech recognition isn't supported here."
        );

        return;
    }


    if (!recognition)
        return;


    /*
     * Never allow old speech to interfere.
     */

    stopSpeaking();


    try {

        recognition.start();

    } catch (error) {

        console.warn(
            "Recognition start:",
            error
        );

        /*
         * Recognition may already be
         * running. Don't create another
         * recognition object.
         */
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
}


/* =========================================================
   SEND VOICE MESSAGE
========================================================= */

async function processConversation(
    transcript
) {

    const message =
        String(
            transcript || ""
        ).trim();


    if (!message)
        return;


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
                .catch(
                    () => ({})
                );


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Chat request failed."
            );
        }


        /*
         * Ignore stale responses.
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


        thinking = false;


        /*
         * Add conversation to normal chat.
         */

        addMessage(
            message,
            "user"
        );

        addMessage(
            cleanReply,
            "ai"
        );


        /*
         * Put answer on conversation screen.
         */

        setConversationText(
            cleanReply
        );


        /*
         * NOW — and only now —
         * MoonPlug speaks.
         */

        speakConversation(
            cleanReply
        );

    } catch (error) {

        console.error(
            "Voice conversation error:",
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
   SPEECH VOICES
========================================================= */

function setupSpeechVoices() {

    if (
        !("speechSynthesis" in window)
    )
        return;


    loadSpeechVoices();


    speechSynthesis.onvoiceschanged =
        () => {

            loadSpeechVoices();
        };


    setTimeout(
        loadSpeechVoices,
        300
    );

    setTimeout(
        loadSpeechVoices,
        1000
    );
}


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


/* =========================================================
   FIND BEST VOICE
========================================================= */

function getBestVoice() {

    loadSpeechVoices();


    if (!speechVoices.length)
        return null;


    const english =
        speechVoices.filter(
            voice =>
                /^en[-_]/i.test(
                    voice.lang
                )
        );


    if (!english.length)
        return speechVoices[0];


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


    return (
        english.find(
            voice =>
                /^en-US/i.test(
                    voice.lang
                )
        ) ||
        english[0]
    );
}


/* =========================================================
   SPEAK
========================================================= */

function speakConversation(
    text
) {

    if (
        !("speechSynthesis" in window)
    ) {

        thinking = false;

        speaking = false;


        setConversationState(
            "idle"
        );


        setConversationText(
            "Voice playback isn't supported by this browser."
        );

        return;
    }


    const cleanText =
        String(text || "").trim();


    if (!cleanText)
        return;


    /*
     * Cancel any previous speech.
     */

    try {

        window.speechSynthesis.cancel();

    } catch {}


    /*
     * Safari can occasionally leave
     * the engine paused.
     */

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


    utterance.rate =
        0.94;

    utterance.pitch =
        1.0;

    utterance.volume =
        1.0;


    utterance.onstart =
        () => {

            thinking = false;

            speaking = true;


            setConversationState(
                "talking"
            );


            startVoiceWave();
        };


    utterance.onend =
        () => {

            speaking = false;

            thinking = false;


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
                "Speech synthesis:",
                event
            );


            speaking = false;

            thinking = false;


            stopVoiceWave();


            setConversationState(
                "idle"
            );


            setConversationText(
                "Tap the button to talk"
            );
        };


    /*
     * This is the actual browser
     * speech call.
     */

    try {

        window.speechSynthesis.speak(
            utterance
        );

    } catch (error) {

        console.error(
            "Speech failed:",
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

    if (
        "speechSynthesis" in window
    ) {

        try {

            window.speechSynthesis.cancel();

        } catch {}
    }


    speaking = false;

    stopVoiceWave();
}


/* =========================================================
   VOICE WAVE
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


                const waveValue =
                    Math.sin(
                        Date.now() / 75 +
                        index * .75
                    );


                const randomValue =
                    Math.random();


                const height =
                    .2 +
                    (
                        randomValue * .55 +
                        (waveValue + 1) * .225
                    ) *
                    (
                        .4 +
                        centerPower * .6
                    );


                bar.style.transform =
                    `scaleY(${Math.min(2,height)})`;
            }
        );


        speechAnimationFrame =
            requestAnimationFrame(
                animate
            );
    }


    animate();
}


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

    if (!wave)
        return;


    wave.querySelectorAll("span")
        .forEach(
            bar => {

                bar.style.transform =
                    "scaleY(.15)";
            }
        );
}


/* =========================================================
   NEW CHAT
========================================================= */

function startNewChat() {

    stopSpeaking();

    stopListening();

    thinking = false;

    conversationRequestId++;


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


function updateTextSize(
    size
) {

    const allowed = [
        "small",
        "medium",
        "large"
    ];


    if (!allowed.includes(size)) {

        size = "medium";
    }


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

