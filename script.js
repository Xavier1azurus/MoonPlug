"use strict";

/* =========================================================
   MOONPLUG AI
   COMPLETE FRONTEND JS
========================================================= */

const API_BASE = "https://moonplug.onrender.com";

let recognition = null;
let recognitionSupported = false;

let listening = false;
let speaking = false;
let thinking = false;

let speechAnimationFrame = null;
let speechVoices = [];
let voiceReady = false;

let selectedVoiceName =
    localStorage.getItem("moonplugVoice") || "";

let conversationRequestId = 0;
let conversationPermissionBlocked = false;

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
    setupVoiceLoading();

    loadTextSize();
    loadSpeechVoices();

    const messageInput = $("messageInput");

    if (messageInput) {

        messageInput.addEventListener(
            "input",
            autoResizeMessageInput
        );

        messageInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.isComposing
                ) {

                    event.preventDefault();

                    $("sendButton")?.click();
                }
            }
        );

        autoResizeMessageInput();
    }

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
        window.innerWidth <= 600
            ? 55
            : window.innerWidth <= 1200
                ? 80
                : 95;

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

    const sidebar = $("sidebar");
    const logo = $("sidebarLogo");

    if (logo && sidebar) {

        logo.addEventListener(
            "click",
            () => {

                if (window.innerWidth <= 900) {

                    sidebar.classList.toggle(
                        "expanded"
                    );

                } else {

                    sidebar.classList.toggle(
                        "collapsed"
                    );
                }
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
     * On phones/tablets, tapping empty
     * sidebar space expands it.
     */

    if (sidebar) {

        sidebar.addEventListener(
            "click",
            event => {

                if (
                    window.innerWidth > 900
                ) {
                    return;
                }

                const clickedButton =
                    event.target.closest(
                        "button"
                    );

                if (
                    !clickedButton &&
                    !sidebar.classList.contains(
                        "expanded"
                    )
                ) {

                    sidebar.classList.add(
                        "expanded"
                    );
                }
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

    if (!input || !button) {
        return;
    }

    button.addEventListener(
        "click",
        sendMessage
    );
}


/* =========================================================
   SEND NORMAL MESSAGE
========================================================= */

async function sendMessage() {

    const input =
        $("messageInput");

    const button =
        $("sendButton");

    if (!input || !button) {
        return;
    }


    const message =
        input.value.trim();


    if (!message) {

        thinking = false;

        hideTyping();

        return;
    }


    /*
     * Built-in identity answers.
     */

    const localAnswer =
        getMoonPlugIdentityAnswer(
            message
        );


    addMessage(
        message,
        "user"
    );


    input.value = "";

    input.style.height =
        "auto";


    if (localAnswer) {

        addMessage(
            localAnswer,
            "ai"
        );

        return;
    }


    thinking = true;

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


        /*
         * Some MoonPlug backends return
         * normal JSON while others may
         * return streamed NDJSON.
         */

        const data =
            await readChatResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                "MoonPlug request failed."
            );
        }


        const reply =
            data.response ||
            data.message ||
            data.answer ||
            data.content ||
            "MoonPlug couldn't respond right now. Please try again.";


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
            "MoonPlug couldn't respond right now. Please try again.",
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
   CHAT RESPONSE READER
========================================================= */

async function readChatResponse(response) {

    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    /*
     * Normal JSON response.
     */

    if (
        contentType.includes(
            "application/json"
        )
    ) {

        return await response
            .json()
            .catch(() => ({}));
    }


    /*
     * Streaming / NDJSON response.
     */

    const text =
        await response.text();


    if (!text.trim()) {

        return {};
    }


    /*
     * First try to parse the entire
     * response as JSON.
     */

    try {

        return JSON.parse(text);

    } catch {}


    /*
     * Otherwise process each JSON line.
     */

    const lines =
        text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);


    let combined = "";

    let finalObject = {};


    for (const line of lines) {

        try {

            const chunk =
                JSON.parse(line);


            finalObject =
                {
                    ...finalObject,
                    ...chunk
                };


            if (
                typeof chunk.response ===
                "string"
            ) {

                combined +=
                    chunk.response;
            }


            if (
                typeof chunk.message?.content ===
                "string"
            ) {

                combined +=
                    chunk.message.content;
            }


            if (
                typeof chunk.content ===
                "string"
            ) {

                combined +=
                    chunk.content;
            }

        } catch {

            /*
             * Ignore malformed stream lines.
             */
        }
    }


    if (combined) {

        finalObject.response =
            combined;
    }


    return finalObject;
}


/* =========================================================
   MOONPLUG IDENTITY ANSWERS
========================================================= */

function getMoonPlugIdentityAnswer(
    message
) {

    const text =
        message
            .toLowerCase()
            .replace(/[?!.,]/g, "")
            .trim();


    const whoMadePatterns = [

        "who made you",

        "who created you",

        "who built you",

        "who developed you",

        "who is your creator",

        "who created moonplug",

        "who made moonplug"

    ];


    const madeWhenPatterns = [

        "when were you made",

        "when was moonplug made",

        "when were you created",

        "when was moonplug created",

        "what year were you made",

        "what year was moonplug made"

    ];


    if (
        whoMadePatterns.some(
            pattern =>
                text.includes(pattern)
        )
    ) {

        return (
            "I was made by Xavier as part of the MoonPlug AI project."
        );
    }


    if (
        madeWhenPatterns.some(
            pattern =>
                text.includes(pattern)
        )
    ) {

        return (
            "MoonPlug was created in 2026 as an AI project."
        );
    }


    return null;
}


/* =========================================================
   MESSAGE DISPLAY
========================================================= */

function addMessage(
    text,
    role
) {

    const messages =
        $("messages");

    if (!messages) {
        return;
    }


    const emptyChat =
        $("emptyChat");


    if (emptyChat) {

        emptyChat.remove();
    }


    const row =
        document.createElement(
            "div"
        );


    row.className =
        `message-row ${role}`;


    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        `message ${role}`;


    bubble.textContent =
        String(text ?? "");


    row.appendChild(
        bubble
    );


    messages.appendChild(
        row
    );


    requestAnimationFrame(
        () => {

            messages.scrollTo({
                top:
                    messages.scrollHeight,

                behavior:
                    "smooth"
            });
        }
    );


    return bubble;
}


/* =========================================================
   TYPING
========================================================= */

function showTyping() {

    const typing =
        $("typing");

    if (typing) {

        typing.hidden = false;
    }
}


function hideTyping() {

    const typing =
        $("typing");

    if (typing) {

        typing.hidden = true;
    }
}


/* =========================================================
   MESSAGE INPUT RESIZE
========================================================= */

function autoResizeMessageInput() {

    const input =
        $("messageInput");

    if (!input) {
        return;
    }


    input.style.height =
        "auto";


    input.style.height =
        `${Math.min(
            input.scrollHeight,
            180
        )}px`;
}


/* =========================================================
   NEW CHAT
========================================================= */

function startNewChat() {

    const messages =
        $("messages");

    if (!messages) {
        return;
    }


    stopConversationCompletely();


    messages.innerHTML = `

        <div
            id="emptyChat"
            class="empty-chat"
        >

            <h1>
                What can I help with?
            </h1>

            <p>
                Ask MoonPlug anything.
            </p>

        </div>

    `;


    const input =
        $("messageInput");


    if (input) {

        input.value = "";

        input.style.height =
            "auto";

        input.focus();
    }
}


/* =========================================================
   CONVERSATION MODE SETUP
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
            () => {

                if (listening) {

                    stopListening();

                } else {

                    startListening();
                }
            }
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


    mode.classList.add(
        "open"
    );


    mode.setAttribute(
        "aria-hidden",
        "false"
    );


    conversationPermissionBlocked =
        false;


    setConversationState(
        "ready"
    );


    setConversationText(
        "Listening..."
    );


    /*
     * Prepare the default browser
     * voice automatically.
     *
     * We do NOT speak a random
     * test sentence.
     */

    initializeConversationVoice();


    /*
     * Prepare speech recognition.
     */

    if (
        !recognitionSupported
    ) {

        setupSpeechRecognition();
    }


    setTimeout(
        () => {

            if (
                mode.classList.contains(
                    "open"
                )
            ) {

                startListening();
            }

        },
        350
    );
}


/* =========================================================
   CLOSE CONVERSATION
========================================================= */

function closeConversation() {

    stopConversationCompletely();


    const mode =
        $("conversationMode");


    if (!mode) {
        return;
    }


    mode.classList.remove(
        "open"
    );


    mode.setAttribute(
        "aria-hidden",
        "true"
    );


    setConversationState(
        "idle"
    );


    setConversationText(
        "Conversation mode closed."
    );
}


/* =========================================================
   STOP EVERYTHING
========================================================= */

function stopConversationCompletely() {

    listening = false;
    speaking = false;
    thinking = false;


    conversationRequestId++;


    stopListening();


    if (
        "speechSynthesis" in window
    ) {

        try {

            window.speechSynthesis.cancel();

            window.speechSynthesis.resume();

        } catch {}
    }


    stopSpeechAnimation();


    setConversationState(
        "idle"
    );
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


    mode.dataset.state =
        state;


    if (!status) {
        return;
    }


    const labels = {

        idle: "Ready",

        ready: "Ready",

        listening: "Listening",

        thinking: "Thinking",

        speaking: "Speaking",

        error: "Ready"

    };


    status.textContent =
        labels[state] ||
        "Ready";
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
            String(text ?? "");
    }
}/* =========================================================
   SPEECH RECOGNITION
========================================================= */

function setupSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        recognitionSupported = false;

        setConversationText(
            "Voice input isn't supported in this browser."
        );

        return;
    }


    recognitionSupported = true;


    recognition =
        new SpeechRecognition();


    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.lang = "en-US";

    recognition.maxAlternatives = 1;


    recognition.onstart = () => {

        listening = true;

        setConversationState(
            "listening"
        );

        setConversationText(
            "Listening..."
        );

        updateConversationMic();
    };


    recognition.onresult = event => {

        let interimText = "";
        let finalText = "";


        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            const result =
                event.results[i];

            const transcript =
                result[0]?.transcript || "";


            if (result.isFinal) {

                finalText +=
                    transcript;

            } else {

                interimText +=
                    transcript;
            }
        }


        const visibleText =
            finalText ||
            interimText;


        if (visibleText) {

            setConversationText(
                visibleText
            );
        }


        if (finalText.trim()) {

            handleFinalSpeech(
                finalText.trim()
            );
        }
    };


    recognition.onerror = event => {

        console.warn(
            "Speech recognition:",
            event.error
        );


        listening = false;

        updateConversationMic();


        if (
            event.error ===
            "not-allowed" ||
            event.error ===
            "service-not-allowed"
        ) {

            conversationPermissionBlocked =
                true;


            setConversationState(
                "error"
            );


            setConversationText(
                "Microphone permission is needed for Conversation Mode."
            );


            return;
        }


        if (
            event.error ===
            "no-speech"
        ) {

            setConversationText(
                "I didn't hear anything. Listening again..."
            );


            if (
                isConversationOpen()
            ) {

                scheduleListeningRestart();
            }


            return;
        }


        if (
            event.error ===
            "aborted"
        ) {

            return;
        }


        setConversationState(
            "error"
        );


        setConversationText(
            "Voice input isn't available right now."
        );


        if (
            isConversationOpen()
        ) {

            scheduleListeningRestart();
        }
    };


    recognition.onend = () => {

        listening = false;

        updateConversationMic();


        /*
         * Do not automatically restart here
         * when permission was denied.
         */

        if (
            conversationPermissionBlocked
        ) {

            return;
        }


        /*
         * If we're not thinking or speaking,
         * resume listening.
         */

        if (
            isConversationOpen() &&
            !thinking &&
            !speaking
        ) {

            scheduleListeningRestart();
        }
    };
}


/* =========================================================
   START LISTENING
========================================================= */

function startListening() {

    if (
        !isConversationOpen()
    ) {
        return;
    }


    if (
        !recognitionSupported ||
        !recognition
    ) {

        setupSpeechRecognition();
    }


    if (
        !recognitionSupported ||
        !recognition
    ) {
        return;
    }


    if (
        listening ||
        thinking ||
        speaking
    ) {
        return;
    }


    if (
        conversationPermissionBlocked
    ) {
        return;
    }


    try {

        recognition.start();

    } catch (error) {

        /*
         * Browser can throw if recognition
         * was already starting.
         */

        console.warn(
            "Recognition start:",
            error
        );
    }
}


/* =========================================================
   STOP LISTENING
========================================================= */

function stopListening() {

    if (
        !recognition
    ) {

        listening = false;

        updateConversationMic();

        return;
    }


    try {

        recognition.stop();

    } catch {}


    listening = false;

    updateConversationMic();
}


/* =========================================================
   RESTART LISTENING
========================================================= */

let listeningRestartTimer = null;


function scheduleListeningRestart() {

    clearTimeout(
        listeningRestartTimer
    );


    if (
        !isConversationOpen() ||
        thinking ||
        speaking ||
        conversationPermissionBlocked
    ) {

        return;
    }


    listeningRestartTimer =
        setTimeout(
            () => {

                if (
                    isConversationOpen() &&
                    !thinking &&
                    !speaking &&
                    !listening
                ) {

                    startListening();
                }

            },
            500
        );
}


/* =========================================================
   FINAL SPEECH
========================================================= */

async function handleFinalSpeech(
    text
) {

    if (!text.trim()) {
        return;
    }


    stopListening();


    const requestId =
        ++conversationRequestId;


    /*
     * Put the spoken words into the
     * normal chat as a user message.
     */

    addMessage(
        text,
        "user"
    );


    setConversationText(
        text
    );


    const localAnswer =
        getMoonPlugIdentityAnswer(
            text
        );


    if (localAnswer) {

        if (
            requestId !==
            conversationRequestId
        ) {
            return;
        }


        addMessage(
            localAnswer,
            "ai"
        );


        setConversationState(
            "speaking"
        );


        setConversationText(
            localAnswer
        );


        await speakText(
            localAnswer
        );


        if (
            requestId ===
            conversationRequestId
        ) {

            finishConversationTurn();
        }


        return;
    }


    thinking = true;


    setConversationState(
        "thinking"
    );


    setConversationText(
        "Thinking..."
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
                            message: text
                        })
                }
            );


        if (
            requestId !==
            conversationRequestId
        ) {
            return;
        }


        const data =
            await readChatResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                "MoonPlug request failed."
            );
        }


        const reply =
            data.response ||
            data.message ||
            data.answer ||
            data.content;


        if (
            !reply ||
            !String(reply).trim()
        ) {

            throw new Error(
                "Empty MoonPlug response."
            );
        }


        const cleanReply =
            String(reply).trim();


        addMessage(
            cleanReply,
            "ai"
        );


        thinking = false;

        speaking = true;


        setConversationState(
            "speaking"
        );


        setConversationText(
            cleanReply
        );


        await speakText(
            cleanReply
        );


        if (
            requestId ===
            conversationRequestId
        ) {

            finishConversationTurn();
        }


    } catch (error) {

        console.error(
            "MoonPlug conversation:",
            error
        );


        if (
            requestId !==
            conversationRequestId
        ) {
            return;
        }


        thinking = false;

        speaking = false;


        const fallback =
            "MoonPlug couldn't respond right now. Please try again.";


        addMessage(
            fallback,
            "ai"
        );


        setConversationState(
            "error"
        );


        setConversationText(
            fallback
        );


        /*
         * Don't speak the error.
         * Return to listening so the user
         * can try again.
         */

        finishConversationTurn();
    }
}


/* =========================================================
   FINISH CONVERSATION TURN
========================================================= */

function finishConversationTurn() {

    thinking = false;

    speaking = false;


    stopSpeechAnimation();


    updateConversationMic();


    if (
        !isConversationOpen()
    ) {
        return;
    }


    setConversationState(
        "listening"
    );


    setConversationText(
        "Listening..."
    );


    scheduleListeningRestart();
}


/* =========================================================
   CONVERSATION OPEN CHECK
========================================================= */

function isConversationOpen() {

    const mode =
        $("conversationMode");


    return Boolean(
        mode &&
        mode.classList.contains(
            "open"
        )
    );
}


/* =========================================================
   MICROPHONE BUTTON
========================================================= */

function updateConversationMic() {

    const mic =
        $("conversationMic");


    if (!mic) {
        return;
    }


    mic.classList.toggle(
        "listening",
        listening
    );


    mic.classList.toggle(
        "speaking",
        speaking
    );


    mic.classList.toggle(
        "thinking",
        thinking
    );


    if (listening) {

        mic.setAttribute(
            "aria-label",
            "Pause listening"
        );

    } else {

        mic.setAttribute(
            "aria-label",
            "Start listening"
        );
    }
}


/* =========================================================
   VOICE LOADING
========================================================= */

function setupVoiceLoading() {

    if (
        !("speechSynthesis" in window)
    ) {

        voiceReady = false;

        return;
    }


    const synthesis =
        window.speechSynthesis;


    if (
        "onvoiceschanged" in synthesis
    ) {

        synthesis.onvoiceschanged =
            loadSpeechVoices;
    }


    /*
     * Some browsers don't fire
     * voiceschanged immediately.
     */

    setTimeout(
        loadSpeechVoices,
        100
    );


    setTimeout(
        loadSpeechVoices,
        500
    );


    setTimeout(
        loadSpeechVoices,
        1500
    );
}


/* =========================================================
   LOAD SPEECH VOICES
========================================================= */

function loadSpeechVoices() {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    speechVoices =
        window.speechSynthesis
            .getVoices();


    if (
        !speechVoices.length
    ) {
        return;
    }


    voiceReady = true;


    populateVoiceSelect();


    initializeConversationVoice();
}


/* =========================================================
   VOICE SELECT
========================================================= */

function populateVoiceSelect() {

    const select =
        $("voiceSelect");


    if (!select) {
        return;
    }


    const previous =
        selectedVoiceName;


    select.innerHTML = "";


    const sorted =
        [...speechVoices].sort(
            (a, b) => {

                const aEnglish =
                    /^en(-|_)/i.test(
                        a.lang
                    );

                const bEnglish =
                    /^en(-|_)/i.test(
                        b.lang
                    );


                if (
                    aEnglish !==
                    bEnglish
                ) {

                    return aEnglish
                        ? -1
                        : 1;
                }


                return a.name.localeCompare(
                    b.name
                );
            }
        );


    for (const voice of sorted) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            voice.name;


        option.textContent =
            `${voice.name} — ${voice.lang}`;


        if (
            voice.name === previous
        ) {

            option.selected =
                true;
        }


        select.appendChild(
            option
        );
    }


    /*
     * If the saved voice no longer
     * exists, choose a sensible default.
     */

    if (
        previous &&
        !sorted.some(
            voice =>
                voice.name === previous
        )
    ) {

        selectedVoiceName = "";

        localStorage.removeItem(
            "moonplugVoice"
        );
    }


    if (
        !selectedVoiceName
    ) {

        const preferred =
            findPreferredVoice();


        if (preferred) {

            selectedVoiceName =
                preferred.name;

            select.value =
                preferred.name;
        }
    }


    updateVoiceStatus();
}


/* =========================================================
   FIND DEFAULT VOICE
========================================================= */

function findPreferredVoice() {

    if (
        !speechVoices.length
    ) {
        return null;
    }


    const preferredNames = [

        "Samantha",

        "Google US English",

        "Microsoft Zira",

        "Microsoft Jenny",

        "Karen",

        "Daniel"

    ];


    for (
        const preferredName
        of preferredNames
    ) {

        const match =
            speechVoices.find(
                voice =>
                    voice.name
                        .toLowerCase()
                        .includes(
                            preferredName
                                .toLowerCase()
                        )
            );


        if (match) {
            return match;
        }
    }


    return (
        speechVoices.find(
            voice =>
                /^en-US$/i.test(
                    voice.lang
                )
        ) ||
        speechVoices.find(
            voice =>
                /^en/i.test(
                    voice.lang
                )
        ) ||
        speechVoices[0]
    );
}


/* =========================================================
   INITIALIZE CONVERSATION VOICE
========================================================= */

function initializeConversationVoice() {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    if (
        !speechVoices.length
    ) {

        loadSpeechVoices();

        return;
    }


    if (
        !selectedVoiceName
    ) {

        const preferred =
            findPreferredVoice();


        if (preferred) {

            selectedVoiceName =
                preferred.name;

            localStorage.setItem(
                "moonplugVoice",
                selectedVoiceName
            );
        }
    }


    updateVoiceStatus();
}


/* =========================================================
   VOICE STATUS
========================================================= */

function updateVoiceStatus() {

    const status =
        $("voiceStatus");


    if (!status) {
        return;
    }


    if (
        !("speechSynthesis" in window)
    ) {

        status.textContent =
            "Voice playback isn't supported in this browser.";

        return;
    }


    if (!speechVoices.length) {

        status.textContent =
            "Loading voice options...";

        return;
    }


    const selected =
        getSelectedVoice();


    if (selected) {

        status.textContent =
            `Ready — ${selected.name}`;

    } else {

        status.textContent =
            "Ready";
    }
}


/* =========================================================
   GET SELECTED VOICE
========================================================= */

function getSelectedVoice() {

    if (
        !speechVoices.length
    ) {
        return null;
    }


    if (
        selectedVoiceName
    ) {

        const saved =
            speechVoices.find(
                voice =>
                    voice.name ===
                    selectedVoiceName
            );


        if (saved) {
            return saved;
        }
    }


    return findPreferredVoice();
}


/* =========================================================
   VOICE SELECT EVENT
========================================================= */

function setupVoiceSelectEvents() {

    const select =
        $("voiceSelect");


    if (!select) {
        return;
    }


    select.addEventListener(
        "change",
        () => {

            selectedVoiceName =
                select.value;


            localStorage.setItem(
                "moonplugVoice",
                selectedVoiceName
            );


            updateVoiceStatus();
        }
    );


    const test =
        $("testVoiceButton");


    if (test) {

        test.addEventListener(
            "click",
            () => {

                speakText(
                    "Hello. This is the MoonPlug voice."
                );
            }
        );
    }
}


/* =========================================================
   SPEAK TEXT
========================================================= */

function speakText(text) {

    return new Promise(
        resolve => {

            if (
                !("speechSynthesis" in window)
            ) {

                resolve();

                return;
            }


            const cleanText =
                String(text ?? "")
                    .trim();


            if (!cleanText) {

                resolve();

                return;
            }


            window.speechSynthesis.cancel();


            const utterance =
                new SpeechSynthesisUtterance(
                    cleanText
                );


            const voice =
                getSelectedVoice();


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
             * Natural but not excessively
             * slow speech.
             */

            utterance.rate =
                1.0;

            utterance.pitch =
                1.0;

            utterance.volume =
                1.0;


            utterance.onstart = () => {

                speaking = true;

                setConversationState(
                    "speaking"
                );

                updateConversationMic();

                startSpeechAnimation();
            };


            utterance.onend = () => {

                speaking = false;

                stopSpeechAnimation();

                updateConversationMic();

                resolve();
            };


            utterance.onerror = event => {

                console.warn(
                    "Speech synthesis:",
                    event
                );


                speaking = false;

                stopSpeechAnimation();

                updateConversationMic();

                resolve();
            };


            try {

                window.speechSynthesis
                    .speak(
                        utterance
                    );

            } catch (error) {

                console.warn(
                    "Speech synthesis:",
                    error
                );


                speaking = false;

                stopSpeechAnimation();

                updateConversationMic();

                resolve();
            }
        }
    );
}


/* =========================================================
   SPEECH ANIMATION
========================================================= */

function startSpeechAnimation() {

    const wave =
        $("voiceWave");


    const mode =
        $("conversationMode");


    if (!wave || !mode) {
        return;
    }


    mode.classList.add(
        "speaking"
    );


    stopSpeechAnimation();


    const bars =
        wave.querySelectorAll(
            "span"
        );


    function animate() {

        if (!speaking) {
            return;
        }


        const time =
            performance.now();


        bars.forEach(
            (bar, index) => {

                const waveValue =
                    Math.sin(
                        time * .009 +
                        index * .75
                    );


                const secondWave =
                    Math.sin(
                        time * .004 +
                        index * .31
                    );


                const height =
                    8 +
                    (
                        (waveValue + 1) *
                        .5 *
                        17
                    ) +
                    (
                        (secondWave + 1) *
                        .5 *
                        7
                    );


                bar.style.height =
                    `${height}px`;
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
   STOP SPEECH ANIMATION
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


    const mode =
        $("conversationMode");


    if (mode) {

        mode.classList.remove(
            "speaking"
        );
    }


    const bars =
        document.querySelectorAll(
            "#voiceWave span"
        );


    bars.forEach(
        bar => {

            bar.style.height =
                "";
        }
    );
}/* =========================================================
   SETTINGS
========================================================= */

function setupSettings() {

    const settingsButton =
        $("settingsButton");

    const closeButton =
        $("closeSettings");

    const panel =
        $("settingsPanel");


    if (settingsButton) {

        settingsButton.addEventListener(
            "click",
            openSettings
        );
    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeSettings
        );
    }


    if (panel) {

        panel.addEventListener(
            "click",
            event => {

                if (
                    event.target === panel
                ) {

                    closeSettings();
                }
            }
        );
    }


    document
        .querySelectorAll(
            ".size-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const size =
                        button.dataset.size;

                    if (!size) {
                        return;
                    }

                    setTextSize(size);
                }
            );
        });


    setupVoiceSelectEvents();
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


    panel.classList.add(
        "open"
    );


    panel.setAttribute(
        "aria-hidden",
        "false"
    );


    loadSpeechVoices();
    updateVoiceStatus();
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


    panel.classList.remove(
        "open"
    );


    panel.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   TEXT SIZE
========================================================= */

function setTextSize(size) {

    const body =
        document.body;


    body.classList.remove(
        "text-small",
        "text-medium",
        "text-large"
    );


    if (
        size === "small" ||
        size === "large"
    ) {

        body.classList.add(
            `text-${size}`
        );

    } else {

        body.classList.add(
            "text-medium"
        );

        size = "medium";
    }


    localStorage.setItem(
        "moonplugTextSize",
        size
    );


    document
        .querySelectorAll(
            ".size-button"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.size ===
                    size
            );
        });
}


/* =========================================================
   LOAD TEXT SIZE
========================================================= */

function loadTextSize() {

    const saved =
        localStorage.getItem(
            "moonplugTextSize"
        ) || "medium";


    setTextSize(
        saved
    );
}


/* =========================================================
   ACCOUNT
========================================================= */

function setupAccount() {

    const accountButton =
        $("accountButton");

    const closeAccount =
        $("closeAccount");

    const accountScreen =
        $("accountScreen");


    if (accountButton) {

        accountButton.addEventListener(
            "click",
            openAccount
        );
    }


    if (closeAccount) {

        closeAccount.addEventListener(
            "click",
            closeAccountScreen
        );
    }


    if (accountScreen) {

        accountScreen.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    accountScreen
                ) {

                    closeAccountScreen();
                }
            }
        );
    }
}


/* =========================================================
   OPEN ACCOUNT
========================================================= */

function openAccount() {

    const screen =
        $("accountScreen");


    if (!screen) {
        return;
    }


    screen.classList.add(
        "open"
    );


    screen.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* =========================================================
   CLOSE ACCOUNT
========================================================= */

function closeAccountScreen() {

    const screen =
        $("accountScreen");


    if (!screen) {
        return;
    }


    screen.classList.remove(
        "open"
    );


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
                `${API_BASE}/health`,
                {
                    method: "GET"
                }
            );


        if (!response.ok) {

            setOnlineStatus(
                false
            );

            return;
        }


        const data =
            await response
                .json()
                .catch(() => null);


        setOnlineStatus(
            Boolean(
                data?.success
            )
        );


    } catch (error) {

        console.warn(
            "MoonPlug health check:",
            error
        );


        /*
         * Don't show technical backend
         * details to the user.
         */

        setOnlineStatus(
            false
        );
    }
}


/* =========================================================
   ONLINE STATUS
========================================================= */

function setOnlineStatus(
    online
) {

    const element =
        document.querySelector(
            ".online"
        );


    if (!element) {
        return;
    }


    const dot =
        element.querySelector(
            "i"
        );


    if (online) {

        element.lastChild.textContent =
            "Online";


        element.classList.remove(
            "offline"
        );

    } else {

        element.lastChild.textContent =
            "Offline";


        element.classList.add(
            "offline"
        );
    }


    if (dot) {

        dot.setAttribute(
            "aria-label",
            online
                ? "Online"
                : "Offline"
        );
    }
}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function closeMobileSidebar() {

    const sidebar =
        $("sidebar");


    if (!sidebar) {
        return;
    }


    if (
        window.innerWidth <= 900
    ) {

        sidebar.classList.remove(
            "expanded"
        );
    }
}


/* =========================================================
   RESIZE
========================================================= */

let resizeTimer = null;


window.addEventListener(
    "resize",
    () => {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(
                () => {

                    createStars();

                    autoResizeMessageInput();


                    /*
                     * Desktop doesn't need
                     * the mobile expanded state.
                     */

                    const sidebar =
                        $("sidebar");


                    if (
                        sidebar &&
                        window.innerWidth > 900
                    ) {

                        sidebar.classList.remove(
                            "expanded"
                        );
                    }

                },
                150
            );
    }
);


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {
            return;
        }


        const conversation =
            $("conversationMode");


        if (
            conversation &&
            conversation.classList.contains(
                "open"
            )
        ) {

            closeConversation();

            return;
        }


        const settings =
            $("settingsPanel");


        if (
            settings &&
            settings.classList.contains(
                "open"
            )
        ) {

            closeSettings();

            return;
        }


        const account =
            $("accountScreen");


        if (
            account &&
            account.classList.contains(
                "open"
            )
        ) {

            closeAccountScreen();
        }
    }
);


/* =========================================================
   VISIBILITY CHANGE
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden
        ) {

            /*
             * Stop recognition when the
             * browser hides the page.
             */

            if (listening) {

                stopListening();
            }

            return;
        }


        /*
         * Don't automatically restart voice
         * if the user already denied permission.
         */

        if (
            isConversationOpen() &&
            !conversationPermissionBlocked &&
            !thinking &&
            !speaking &&
            !listening
        ) {

            scheduleListeningRestart();
        }
    }
);


/* =========================================================
   PAGE UNLOAD
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        try {

            stopConversationCompletely();

        } catch {}
    }
);


/* =========================================================
   ACCESSIBILITY
========================================================= */

function setModalState(
    element,
    open
) {

    if (!element) {
        return;
    }


    element.classList.toggle(
        "open",
        open
    );


    element.setAttribute(
        "aria-hidden",
        open
            ? "false"
            : "true"
    );
}


/* =========================================================
   BUTTON RIPPLE
========================================================= */

document.addEventListener(
    "pointerdown",
    event => {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {
            return;
        }


        button.classList.add(
            "pressed"
        );


        setTimeout(
            () => {

                button.classList.remove(
                    "pressed"
                );

            },
            150
        );
    }
);


/* =========================================================
   PREVENT BACKGROUND SCROLL
========================================================= */

function updateBodyModalState() {

    const modalOpen =
        document.querySelector(
            ".modal.open"
        );


    const conversationOpen =
        document.querySelector(
            ".conversation-mode.open"
        );


    document.body.classList.toggle(
        "modal-open",
        Boolean(
            modalOpen ||
            conversationOpen
        )
    );
}


/* =========================================================
   OBSERVE MODALS
========================================================= */

const modalObserver =
    new MutationObserver(
        () => {

            updateBodyModalState();
        }
    );


document
    .querySelectorAll(
        ".modal, .conversation-mode"
    )
    .forEach(element => {

        modalObserver.observe(
            element,
            {
                attributes: true,
                attributeFilter: [
                    "class"
                ]
            }
        );
    });


/* =========================================================
   INITIAL BODY STATE
========================================================= */

updateBodyModalState();


/* =========================================================
   SIMPLE HTML ESCAPER
   Used only when HTML must be created
   dynamically.
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =========================================================
   SAFE TEXT
========================================================= */

function safeText(value) {

    return String(
        value ?? ""
    ).trim();
}


/* =========================================================
   CONVERSATION VOICE INITIALIZATION
========================================================= */

function prepareConversationVoice() {

    if (
        !("speechSynthesis" in window)
    ) {
        return false;
    }


    if (
        !speechVoices.length
    ) {

        loadSpeechVoices();
    }


    const voice =
        getSelectedVoice();


    if (voice) {

        voiceReady = true;

        return true;
    }


    return false;
}


/* =========================================================
   BROWSER SPEECH SUPPORT
========================================================= */

function getSpeechSupport() {

    return {

        recognition:
            Boolean(
                window.SpeechRecognition ||
                window.webkitSpeechRecognition
            ),

        synthesis:
            "speechSynthesis" in window

    };
}


/* =========================================================
   DEBUG INFO
========================================================= */

function getMoonPlugDebugInfo() {

    return {

        speech:
            getSpeechSupport(),

        voiceCount:
            speechVoices.length,

        selectedVoice:
            selectedVoiceName,

        conversationOpen:
            isConversationOpen(),

        listening,

        speaking,

        thinking

    };
}


/* =========================================================
   OPTIONAL GLOBAL DEBUG ACCESS
========================================================= */

window.MoonPlug =
    window.MoonPlug || {};


window.MoonPlug.debug =
    getMoonPlugDebugInfo;


/* =========================================================
   END OF PART 3
========================================================= *//* =========================================================
   FINAL MOBILE / TABLET BEHAVIOR
========================================================= */

/*
 * Keep the sidebar usable on iPhone and iPad.
 */

function setupMobileNavigation() {

    const sidebar =
        $("sidebar");

    if (!sidebar) {
        return;
    }


    document.addEventListener(
        "click",
        event => {

            if (
                window.innerWidth > 900
            ) {
                return;
            }


            const clickedInsideSidebar =
                sidebar.contains(
                    event.target
                );


            if (
                !clickedInsideSidebar
            ) {

                sidebar.classList.remove(
                    "expanded"
                );
            }
        }
    );


    sidebar
        .querySelectorAll(
            ".sidebar-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    /*
                     * Keep Conversation Mode
                     * open normally.
                     */

                    if (
                        button.id ===
                        "conversationButton"
                    ) {
                        return;
                    }


                    /*
                     * Give the action time to
                     * happen before collapsing.
                     */

                    setTimeout(
                        () => {

                            if (
                                window.innerWidth <= 900
                            ) {

                                sidebar.classList.remove(
                                    "expanded"
                                );
                            }

                        },
                        120
                    );
                }
            );
        });
}


/* =========================================================
   TOUCH SUPPORT
========================================================= */

function setupTouchBehavior() {

    const sidebar =
        $("sidebar");


    if (!sidebar) {
        return;
    }


    let touchStartX = 0;


    sidebar.addEventListener(
        "touchstart",
        event => {

            touchStartX =
                event.touches[0]?.clientX ||
                0;
        },
        {
            passive: true
        }
    );


    sidebar.addEventListener(
        "touchend",
        event => {

            const touchEndX =
                event.changedTouches[0]?.clientX ||
                0;


            const distance =
                touchEndX -
                touchStartX;


            /*
             * Swipe right to expand.
             */

            if (
                window.innerWidth <= 900 &&
                distance > 50
            ) {

                sidebar.classList.add(
                    "expanded"
                );
            }


            /*
             * Swipe left to collapse.
             */

            if (
                window.innerWidth <= 900 &&
                distance < -50
            ) {

                sidebar.classList.remove(
                    "expanded"
                );
            }
        },
        {
            passive: true
        }
    );
}


/* =========================================================
   CONVERSATION TOUCH SAFETY
========================================================= */

function setupConversationTouch() {

    const mode =
        $("conversationMode");


    if (!mode) {
        return;
    }


    let startY = 0;


    mode.addEventListener(
        "touchstart",
        event => {

            startY =
                event.touches[0]?.clientY ||
                0;
        },
        {
            passive: true
        }
    );


    mode.addEventListener(
        "touchend",
        event => {

            const endY =
                event.changedTouches[0]?.clientY ||
                0;


            /*
             * Small downward swipe closes
             * Conversation Mode.
             */

            if (
                endY - startY > 100
            ) {

                closeConversation();
            }
        },
        {
            passive: true
        }
    );
}


/* =========================================================
   INITIALIZE MOBILE FEATURES
========================================================= */

setupMobileNavigation();

setupTouchBehavior();

setupConversationTouch();


/* =========================================================
   KEEP VOICE READY
========================================================= */

function keepVoiceReady() {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    /*
     * Chrome sometimes needs a small delay
     * before its voices become available.
     */

    if (
        !speechVoices.length
    ) {

        loadSpeechVoices();
    }


    /*
     * Don't speak anything automatically.
     * We only prepare the voice.
     */

    prepareConversationVoice();
}


keepVoiceReady();


/* =========================================================
   PERIODIC VOICE CHECK
========================================================= */

setTimeout(
    () => {

        keepVoiceReady();

    },
    2000
);


/* =========================================================
   CLEAN SPEECH WHEN PAGE CLOSES
========================================================= */

window.addEventListener(
    "pagehide",
    () => {

        try {

            stopConversationCompletely();

        } catch {}
    }
);


/* =========================================================
   FINAL FALLBACK FOR SPEECH SYNTHESIS
========================================================= */

if (
    "speechSynthesis" in window
) {

    /*
     * Some browsers pause long utterances
     * automatically. Resume periodically
     * while MoonPlug is speaking.
     */

    setInterval(
        () => {

            if (
                speaking &&
                window.speechSynthesis
            ) {

                try {

                    window.speechSynthesis.resume();

                } catch {}
            }

        },
        5000
    );
}


/* =========================================================
   INITIALIZE EVERYTHING AFTER DOM LOAD
========================================================= */

function initializeMoonPlug() {

    /*
     * These are safe to call even if some
     * elements aren't present.
     */

    createStars();

    autoResizeMessageInput();

    loadTextSize();

    loadSpeechVoices();

    updateConversationMic();
}


/*
 * Run immediately because this script
 * is loaded at the end of <body>.
 */

initializeMoonPlug();


/* =========================================================
   FINAL GLOBAL HELPERS
========================================================= */

window.MoonPlug.openConversation =
    openConversation;

window.MoonPlug.closeConversation =
    closeConversation;

window.MoonPlug.startListening =
    startListening;

window.MoonPlug.stopListening =
    stopListening;

window.MoonPlug.sendMessage =
    sendMessage;

window.MoonPlug.startNewChat =
    startNewChat;


/* =========================================================
   END OF MOONPLUG SCRIPT
