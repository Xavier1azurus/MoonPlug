/* =========================================================
   MOONPLUG AI
   COMPLETE MATCHED JAVASCRIPT
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

let conversationOpen = false;

let normalChatBusy = false;

let speechAnimationFrame = null;

let speechVoices = [];

let conversationRequestId = 0;

let sidebarOpen = false;


/* =========================================================
   HELPER
========================================================= */

const $ = id =>
    document.getElementById(id);


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        createStars();

        setupSidebar();

        setupChat();

        setupConversation();

        setupSpeechRecognition();

        setupSpeechSynthesis();

        setupSettings();

        setupAccount();

        loadTextSize();

        checkBackendHealth();

        window.addEventListener(
            "resize",
            handleResize
        );

    }
);


/* =========================================================
   RESIZE
========================================================= */

function handleResize() {

    if (window.innerWidth > 1100) {

        closeSidebar();
    }
}


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

    const toggle =
        $("sidebarToggle");

    const headerMenu =
        $("headerMenuButton");

    const close =
        $("sidebarClose");

    const backdrop =
        $("sidebarBackdrop");

    const logo =
        $("sidebarLogo");


    if (toggle) {

        toggle.addEventListener(
            "click",
            toggleSidebar
        );
    }


    if (headerMenu) {

        headerMenu.addEventListener(
            "click",
            toggleSidebar
        );
    }


    if (close) {

        close.addEventListener(
            "click",
            closeSidebar
        );
    }


    if (backdrop) {

        backdrop.addEventListener(
            "click",
            closeSidebar
        );
    }


    if (logo) {

        logo.addEventListener(
            "click",
            () => {

                if (window.innerWidth <= 1100) {

                    closeSidebar();
                }

            }
        );
    }


    const buttons =
        document.querySelectorAll(
            ".sidebar-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    /*
                     * Conversation must stay
                     * open after clicking it.
                     */

                    if (
                        button.id ===
                        "conversationButton"
                    ) {

                        closeSidebar();

                        openConversation();

                        return;
                    }


                    /*
                     * Other buttons close
                     * the mobile menu.
                     */

                    if (
                        window.innerWidth <= 1100
                    ) {

                        closeSidebar();
                    }

                }
            );
        }
    );


    /*
     * Existing conversation listener
     * is intentionally NOT added here.
     *
     * The button is handled above.
     */


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

                alert(
                    "Chat history is coming soon."
                );

            }
        );
    }
}


function toggleSidebar() {

    if (sidebarOpen) {

        closeSidebar();

    } else {

        openSidebar();
    }
}


function openSidebar() {

    const sidebar =
        $("sidebar");

    const toggle =
        $("sidebarToggle");

    const backdrop =
        $("sidebarBackdrop");


    if (!sidebar)
        return;


    sidebarOpen = true;


    sidebar.classList.add(
        "open"
    );


    if (toggle) {

        toggle.classList.add(
            "active"
        );

        toggle.setAttribute(
            "aria-expanded",
            "true"
        );
    }


    if (backdrop) {

        backdrop.classList.add(
            "active"
        );
    }
}


function closeSidebar() {

    const sidebar =
        $("sidebar");

    const toggle =
        $("sidebarToggle");

    const backdrop =
        $("sidebarBackdrop");


    sidebarOpen = false;


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );
    }


    if (toggle) {

        toggle.classList.remove(
            "active"
        );

        toggle.setAttribute(
            "aria-expanded",
            "false"
        );
    }


    if (backdrop) {

        backdrop.classList.remove(
            "active"
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

    if (normalChatBusy)
        return;


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


    normalChatBusy = true;

    button.disabled = true;


    addMessage(
        message,
        "user"
    );


    input.value = "";

    input.style.height =
        "auto";


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
                `Server error ${response.status}`
            );
        }


        const reply =
            getReplyText(data);


        addMessage(
            reply,
            "ai"
        );


    } catch (error) {

        console.error(
            "Normal chat:",
            error
        );


        addMessage(
            "I couldn't connect to MoonPlug right now.",
            "ai"
        );

    } finally {

        /*
         * IMPORTANT:
         * Thinking ALWAYS turns off here.
         */

        hideTyping();


        normalChatBusy = false;


        button.disabled = false;


        input.focus();
    }
}


/* =========================================================
   GET API RESPONSE
========================================================= */

function getReplyText(data) {

    if (!data)
        return "I received your message.";


    const possible =
        [
            data.response,
            data.message,
            data.answer,
            data.reply,
            data.text
        ];


    for (
        const value of possible
    ) {

        if (
            typeof value === "string" &&
            value.trim()
        ) {

            return value.trim();
        }
    }


    return "I received your message.";
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

    if (!messages)
        return;


    const empty =
        $("emptyChat");


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


    requestAnimationFrame(
        () => {

            messages.scrollTop =
                messages.scrollHeight;
        }
    );
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

    const button =
        $("conversationMic");


    if (close) {

        close.addEventListener(
            "click",
            closeConversation
        );
    }


    if (button) {

        /*
         * ONLY ONE conversation
         * button listener.
         */

        button.addEventListener(
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


    conversationOpen = true;


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
     * Helps Safari unlock its
     * speech engine after user interaction.
     */

    unlockSpeechEngine();
}


/* =========================================================
   CLOSE CONVERSATION
========================================================= */

function closeConversation() {

    conversationOpen = false;


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


    setConversationText(
        "Tap the button to talk"
    );
}


/* =========================================================
   ONE BUTTON
========================================================= */

function handleConversationButton() {

    /*
     * SPEAKING
     * Tap = stop speaking.
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
     * THINKING
     *
     * Don't start another request.
     */

    if (thinking) {

        return;
    }


    /*
     * LISTENING
     *
     * Tap = stop listening.
     */

    if (listening) {

        stopListening();

        return;
    }


    /*
     * IDLE
     *
     * Start microphone.
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
            "Speech recognition is unavailable."
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
                finalResult.isFinal
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


            } else if (
                event.error ===
                "audio-capture"
            ) {

                setConversationState(
                    "idle"
                );

                setConversationText(
                    "I couldn't access the microphone."
                );


            } else {

                setConversationState(
                    "idle"
                );

                setConversationText(
                    "Microphone error. Tap to try again."
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

    if (speaking) {

        stopSpeaking();

        return;
    }


    if (thinking) {

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


    if (
        !conversationOpen
    ) {

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


        /*
         * Browser sometimes thinks
         * recognition is already running.
         */

        try {

            recognition.stop();

        } catch {}


        setTimeout(
            () => {

                if (
                    conversationOpen &&
                    !listening &&
                    !thinking
                ) {

                    try {

                        recognition.start();

                    } catch (
                        retryError
                    ) {

                        console.warn(
                            retryError
                        );
                    }
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
   CONVERSATION API
========================================================= */

async function processConversation(
    transcript
) {

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


    /*
     * Stop microphone first.
     */

    stopListening();


    /*
     * New request ID.
     */

    const requestId =
        ++conversationRequestId;


    /*
     * THIS is the ONLY place where
     * conversation thinking begins.
     */

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
                `Server error ${response.status}`
            );
        }


        /*
         * If another conversation
         * started, ignore this one.
         */

        if (
            requestId !==
            conversationRequestId
        ) {

            return;
        }


        const reply =
            getReplyText(data);


        /*
         * Request is finished.
         */

        thinking = false;


        /*
         * Add to normal chat.
         */

        addMessage(
            message,
            "user"
        );


        addMessage(
            reply,
            "ai"
        );


        /*
         * Display answer.
         */

        setConversationText(
            reply
        );


        /*
         * Actually speak.
         */

        speakConversation(
            reply
        );


    } catch (error) {

        console.error(
            "Conversation API:",
            error
        );


        /*
         * ALWAYS clear thinking
         * if request fails.
         */

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

        console.warn(
            "Speech synthesis unavailable."
        );

        return;
    }


    loadSpeechVoices();


    if (
        "onvoiceschanged" in
        window.speechSynthesis
    ) {

        window.speechSynthesis.onvoiceschanged =
            () => {

                loadSpeechVoices();
            };
    }


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

        speechVoices = [];

        return;
    }


    speechVoices =
        window.speechSynthesis
            .getVoices() || [];
}


/* =========================================================
   SAFARI AUDIO UNLOCK
========================================================= */

function unlockSpeechEngine() {

    if (
        !("speechSynthesis" in window)
    )
        return;


    try {

        window.speechSynthesis.resume();

    } catch {}
}


/* =========================================================
   VOICE SELECTION
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


    if (!english.length) {

        return null;
    }


    const preferred =
        [
            "Samantha",
            "Alex",
            "Daniel",
            "Karen",
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

        speaking = false;

        thinking = false;

        setConversationState(
            "idle"
        );

        setConversationText(
            "Voice playback isn't supported."
        );

        return;
    }


    stopSpeechAnimation();


    /*
     * Cancel previous queued speech.
     */

    try {

        window.speechSynthesis.cancel();

    } catch {}


    /*
     * Safari fix.
     */

    try {

        window.speechSynthesis.resume();

    } catch {}


    const cleanText =
        String(text)
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    if (!cleanText) {

        setConversationState(
            "idle"
        );

        return;
    }


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
        .92;


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
                "Speech synthesis:",
                event
            );


            speaking = false;

            thinking = false;


            stopSpeechAnimation();


            setConversationState(
                "idle"
            );


            setConversationText(
                "Tap the button to talk"
            );
        };


    /*
     * Start speech.
     */

    try {

        window.speechSynthesis.speak(
            utterance
        );


        /*
         * Safari sometimes needs
         * another resume after speak().
         */

        setTimeout(
            () => {

                try {

                    window.speechSynthesis.resume();

                } catch {}

            },
            100
        );


    } catch (error) {

        console.error(
            "Speech start:",
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

            window.speechSynthesis.resume();

        } catch {}
    }


    speaking = false;


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


                const pulse =
                    Math.sin(
                        Date.now() / 85 +
                        index * .75
                    );


                const noise =
                    Math.random();


                const amount =
                    .2 +
                    (
                        noise * .55 +
                        (
                            pulse + 1
                        ) * .225
                    ) *
                    (
                        .35 +
                        centerPower * .65
                    );


                bar.style.transform =
                    `scaleY(${Math.min(
                        1.9,
                        Math.max(.15, amount)
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


    conversationRequestId++;


    const messages =
        $("messages");


    if (!messages)
        return;


    messages.innerHTML = `
        <div id="emptyChat" class="empty-chat">
            <div class="empty-moon">🌙</div>
            <h1>What can I help with?</h1>
            <p>Ask MoonPlug anything.</p>
        </div>
    `;


    hideTyping();


    normalChatBusy =
        false;


    const input =
        $("messageInput");


    const button =
        $("sendButton");


    if (input) {

        input.value = "";

        input.style.height =
            "auto";
    }


    if (button) {

        button.disabled =
            false;
    }
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

    const allowed =
        [
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
            "MoonPlug backend:",
            error
        );
    }
}
