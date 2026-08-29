/* =========================================================
   MOONPLUG AI
   COMPLETE JAVASCRIPT
   SIDEBAR + CHAT + CONVERSATION MODE
========================================================= */

"use strict";


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
let speaking = false;
let thinking = false;

let speechAnimationFrame = null;

let speechVoices = [];

let conversationRequestId = 0;


/* =========================================================
   DOM HELPER
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

        setupSpeechVoices();

        loadTextSize();

        checkBackendHealth();

        updateSidebarState();

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

    const logo =
        $("sidebarLogo");


    if (logo) {

        logo.addEventListener(
            "click",
            toggleSidebar
        );
    }


    const conversation =
        $("conversationButton");

    if (conversation) {

        conversation.addEventListener(
            "click",
            () => {

                openConversation();

                closeMobileSidebar();

            }
        );
    }


    const newChat =
        $("newChatButton");

    if (newChat) {

        newChat.addEventListener(
            "click",
            () => {

                startNewChat();

                closeMobileSidebar();

            }
        );
    }


    const settings =
        $("settingsButton");

    if (settings) {

        settings.addEventListener(
            "click",
            () => {

                openSettings();

                closeMobileSidebar();

            }
        );
    }


    const account =
        $("accountButton");

    if (account) {

        account.addEventListener(
            "click",
            () => {

                openAccount();

                closeMobileSidebar();

            }
        );
    }


    const history =
        $("historyButton");

    if (history) {

        history.addEventListener(
            "click",
            () => {

                alert(
                    "Chat history is coming soon."
                );

            }
        );
    }


    const study =
        $("studyButton");

    if (study) {

        study.addEventListener(
            "click",
            () => {

                alert(
                    "Study mode is coming soon."
                );

            }
        );
    }


    const cook =
        $("cookButton");

    if (cook) {

        cook.addEventListener(
            "click",
            () => {

                alert(
                    "Cook mode is coming soon."
                );

            }
        );
    }


    const images =
        $("imagesButton");

    if (images) {

        images.addEventListener(
            "click",
            () => {

                alert(
                    "Images mode is coming soon."
                );

            }
        );
    }


    const code =
        $("codeButton");

    if (code) {

        code.addEventListener(
            "click",
            () => {

                alert(
                    "Code mode is coming soon."
                );

            }
        );
    }
}


/* =========================================================
   SIDEBAR TOGGLE
========================================================= */

function toggleSidebar() {

    const sidebar =
        $("sidebar");

    if (!sidebar)
        return;


    /*
     * PHONE:
     * open/close the actual drawer.
     */

    if (window.innerWidth <= 600) {

        sidebar.classList.toggle(
            "mobile-open"
        );

        const open =
            sidebar.classList.contains(
                "mobile-open"
            );

        sidebar.setAttribute(
            "aria-expanded",
            String(open)
        );

        return;
    }


    /*
     * TABLET + DESKTOP:
     * collapse between 72px and 250px.
     */

    sidebar.classList.toggle(
        "collapsed"
    );


    document.body.classList.toggle(
        "sidebar-collapsed",
        sidebar.classList.contains(
            "collapsed"
        )
    );


    const expanded =
        !sidebar.classList.contains(
            "collapsed"
        );


    sidebar.setAttribute(
        "aria-expanded",
        String(expanded)
    );
}


function closeMobileSidebar() {

    const sidebar =
        $("sidebar");

    if (!sidebar)
        return;


    if (window.innerWidth <= 600) {

        sidebar.classList.remove(
            "mobile-open"
        );
    }
}


function updateSidebarState() {

    const sidebar =
        $("sidebar");

    if (!sidebar)
        return;


    /*
     * On phones the sidebar starts hidden.
     */

    if (window.innerWidth <= 600) {

        sidebar.classList.remove(
            "collapsed"
        );

        sidebar.classList.remove(
            "mobile-open"
        );

        document.body.classList.remove(
            "sidebar-collapsed"
        );

        sidebar.setAttribute(
            "aria-expanded",
            "false"
        );

        return;
    }


    /*
     * Tablet starts collapsed.
     */

    if (window.innerWidth <= 900) {

        sidebar.classList.add(
            "collapsed"
        );

        document.body.classList.add(
            "sidebar-collapsed"
        );

        sidebar.setAttribute(
            "aria-expanded",
            "false"
        );

        return;
    }


    /*
     * Desktop starts expanded.
     */

    sidebar.classList.remove(
        "collapsed"
    );

    document.body.classList.remove(
        "sidebar-collapsed"
    );

    sidebar.setAttribute(
        "aria-expanded",
        "true"
    );
}


/*
 * If the user rotates/resizes the device,
 * keep the sidebar logic correct.
 */

window.addEventListener(
    "resize",
    () => {

        updateSidebarState();

        createStars();

    }
);


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
   NORMAL SEND
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


    button.disabled =
        true;


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
            "Normal chat error:",
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
   ADD MESSAGE
========================================================= */

function addMessage(
    text,
    sender
) {

    const messages =
        $("messages");


    const empty =
        $("emptyChat");


    if (!messages)
        return;


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


    if (!mode)
        return;


    mode.classList.add(
        "active"
    );


    mode.setAttribute(
        "aria-hidden",
        "false"
    );


    stopListening();

    stopSpeaking();


    thinking = false;


    setConversationState(
        "idle"
    );


    setConversationText(
        "Tap the button to talk"
    );


    /*
     * Don't show "thinking" just because
     * conversation mode was opened.
     */

    resumeSpeechEngine();
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


    setConversationState(
        "idle"
    );
}


/* =========================================================
   ONE BUTTON
========================================================= */

function handleConversationButton() {

    /*
     * If MoonPlug is talking,
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
     * If currently listening,
     * the same button stops listening.
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
     * If thinking, don't start another
     * microphone request.
     */

    if (thinking)
        return;


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


    if (
        state &&
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
                last.isFinal
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


            if (
                event.error ===
                "aborted"
            ) {

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

    if (speaking) {

        stopSpeaking();

        return;
    }


    if (thinking)
        return;


    if (!recognitionSupported) {

        setConversationState(
            "idle"
        );

        setConversationText(
            "Speech recognition isn't supported in this browser."
        );

        return;
    }


    stopSpeechAnimation();


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

                    if (!listening) {

                        recognition.start();
                    }

                } catch (retryError) {

                    console.warn(
                        "Recognition retry:",
                        retryError
                    );
                }

            },
            200
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
}


/* =========================================================
   PROCESS CONVERSATION
========================================================= */

async function processConversation(
    transcript
) {

    const message =
        String(
            transcript || ""
        ).trim();


    stopListening();


    if (!message)
        return;


    /*
     * New request ID.
     */

    const requestId =
        ++conversationRequestId;


    thinking =
        true;


    speaking =
        false;


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


        /*
         * Make sure this is still
         * the current request.
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


        thinking =
            false;


        /*
         * Put the conversation into
         * normal chat too.
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
         * This is the actual browser
         * text-to-speech call.
         */

        speakConversation(
            cleanReply
        );


    } catch (error) {

        console.error(
            "Conversation error:",
            error
        );


        /*
         * Only show this if the current
         * request actually failed.
         */

        if (
            requestId ===
            conversationRequestId
        ) {

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


    window.speechSynthesis.onvoiceschanged =
        loadSpeechVoices;


    setTimeout(
        loadSpeechVoices,
        250
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

        speechVoices =
            [];

        return;
    }


    speechVoices =
        window.speechSynthesis
            .getVoices() || [];
}


/* =========================================================
   BEST VOICE
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
        return null;


    const preferred = [

        "Samantha",

        "Alex",

        "Daniel",

        "Karen",

        "Google US English",

        "Microsoft Aria",

        "Microsoft Jenny",

        "Microsoft Guy",

        "Google UK English Female"

    ];


    for (
        const preferredName
        of preferred
    ) {

        const found =
            english.find(
                voice =>
                    voice.name
                        .toLowerCase()
                        .includes(
                            preferredName
                                .toLowerCase()
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

        speaking =
            false;

        thinking =
            false;


        setConversationState(
            "idle"
        );


        setConversationText(
            "Voice playback isn't supported by this browser."
        );


        return;
    }


    stopSpeechAnimation();


    try {

        window.speechSynthesis.cancel();

    } catch {}


    /*
     * Mobile browsers sometimes pause
     * the speech engine.
     */

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


    utterance.rate =
        .92;

    utterance.pitch =
        1.0;

    utterance.volume =
        1.0;


    utterance.onstart =
        () => {

            thinking =
                false;

            speaking =
                true;


            setConversationState(
                "talking"
            );


            startVoiceWave();
        };


    utterance.onend =
        () => {

            speaking =
                false;

            thinking =
                false;


            stopSpeechAnimation();


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


            stopSpeechAnimation();


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

    } catch (error) {

        console.error(
            "Speech start error:",
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
   RESUME SPEECH
========================================================= */

function resumeSpeechEngine() {

    if (
        !("speechSynthesis" in window)
    )
        return;


    try {

        if (
            window.speechSynthesis.paused
        ) {

            window.speechSynthesis.resume();
        }

    } catch {}
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


    stopSpeechAnimation();
}


/* =========================================================
   VOICE WAVE
========================================================= */

function startVoiceWave() {

    const wave =
        $("voiceWave");


    if (!wave)
        return;


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


        const time =
            Date.now();


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


                const waveOne =
                    Math.sin(
                        time / 90 +
                        index * .85
                    );


                const waveTwo =
                    Math.sin(
                        time / 145 +
                        index * 1.7
                    );


                const random =
                    Math.random() * .25;


                const amount =
                    .28 +
                    (
                        (
                            waveOne +
                            1
                        ) / 2
                    ) * .42 +
                    (
                        (
                            waveTwo +
                            1
                        ) / 2
                    ) * .20 +
                    random;


                const height =
                    amount *
                    (
                        .55 +
                        centerPower * .75
                    );


                bar.style.transform =
                    `scaleY(${Math.max(.12, Math.min(1.7, height))})`;
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


    wave
        .querySelectorAll("span")
        .forEach(
            bar => {

                bar.style.transform =
                    "scaleY(.12)";
            }
        );
}


/* =========================================================
   NEW CHAT
========================================================= */

function startNewChat() {

    stopSpeaking();

    stopListening();

    thinking =
        false;


    const messages =
        $("messages");


    if (!messages)
        return;


    messages.innerHTML = `

        <div
            id="emptyChat"
            class="empty-chat"
        >

            <div class="mini-moon">
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


    if (
        !allowed.includes(size)
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
                `${API_BASE}/api/health`
            );


        if (!response.ok)
            throw new Error(
                "Backend unavailable"
            );


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
