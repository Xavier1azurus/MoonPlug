
"use strict";

/* =========================================================
   MOONPLUG AI
   COMPLETE FRONTEND JS
   STREAMING + VOICE + CONVERSATION MODE
========================================================= */

const API_BASE = "https://innovation-latinas-separately-accounting.trycloudflare.com";

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
let listeningRestartTimer = null;
let resizeTimer = null;

const $ = id => document.getElementById(id);


/* =========================================================
   STARTUP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    listening = false;
    speaking = false;
    thinking = false;

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

    setupMobileNavigation();
    setupTouchBehavior();
    setupConversationTouch();

    updateConversationMic();
    updateBodyModalState();
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

            if (window.innerWidth <= 900) {

                sidebar.classList.toggle("expanded");

            } else {

                sidebar.classList.toggle("collapsed");
            }
        });
    }


    const conversation = $("conversationButton");

    if (conversation) {

        conversation.addEventListener(
            "click",
            openConversation
        );
    }


    const newChat = $("newChatButton");

    if (newChat) {

        newChat.addEventListener(
            "click",
            startNewChat
        );
    }


    const settings = $("settingsButton");

    if (settings) {

        settings.addEventListener(
            "click",
            openSettings
        );
    }


    const account = $("accountButton");

    if (account) {

        account.addEventListener(
            "click",
            openAccount
        );
    }


    const history = $("historyButton");

    if (history) {

        history.addEventListener("click", () => {

            addMessage(
                "Chat history is coming soon.",
                "ai"
            );
        });
    }


    const study = $("studyButton");

    if (study) {

        study.addEventListener("click", () => {

            addMessage(
                "Study mode selected. Ask me what you want to learn.",
                "ai"
            );
        });
    }


    const cook = $("cookButton");

    if (cook) {

        cook.addEventListener("click", () => {

            addMessage(
                "Cook mode selected. Ask me for a recipe or cooking help.",
                "ai"
            );
        });
    }


    const images = $("imagesButton");

    if (images) {

        images.addEventListener("click", () => {

            addMessage(
                "Images mode is ready for the image feature to be connected.",
                "ai"
            );
        });
    }


    const code = $("codeButton");

    if (code) {

        code.addEventListener("click", () => {

            addMessage(
                "Code mode selected. Ask me about code or a programming problem.",
                "ai"
            );
        });
    }


    if (sidebar) {

        sidebar.addEventListener("click", event => {

            if (window.innerWidth > 900) {
                return;
            }

            const clickedButton =
                event.target.closest("button");

            if (
                !clickedButton &&
                !sidebar.classList.contains("expanded")
            ) {

                sidebar.classList.add("expanded");
            }
        });
    }
}


/* =========================================================
   NORMAL CHAT SETUP
========================================================= */

function setupChat() {

    const input = $("messageInput");
    const button = $("sendButton");

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

    const input = $("messageInput");
    const button = $("sendButton");

    if (!input || !button) {
        return;
    }

    const message = input.value.trim();

    if (!message || thinking) {
        return;
    }


    const localAnswer =
        getMoonPlugIdentityAnswer(message);


    addMessage(
        message,
        "user"
    );


    input.value = "";
    input.style.height = "auto";


    if (localAnswer) {

        addMessage(
            localAnswer,
            "ai"
        );

        return;
    }


    thinking = true;
    button.disabled = true;

    startThinkingIndicator();
    startResponseAnimation();


    let aiBubble = null;


    try {

        aiBubble =
            addStreamingMessage("");


        const reply =
            await streamChatResponse(
                message,
                chunk => {

                    if (!aiBubble) {

                        aiBubble =
                            addStreamingMessage("");
                    }

                    aiBubble.textContent += chunk;

                    scrollMessages();
                }
            );


        if (!reply.trim()) {

            aiBubble.textContent =
                "MoonPlug couldn't respond right now. Please try again.";
        }


        finishResponseAnimation();


    } catch (error) {

        console.error(
            "MoonPlug chat:",
            error
        );


        if (aiBubble) {

            aiBubble.textContent =
                "MoonPlug couldn't respond right now. Please try again.";

        } else {

            addMessage(
                "MoonPlug couldn't respond right now. Please try again.",
                "ai"
            );
        }


        cancelResponseAnimation();


    } finally {

        thinking = false;

        stopThinkingIndicator();

        button.disabled = false;

        input.focus();
    }
}


/* =========================================================
   STREAM CHAT RESPONSE
========================================================= */

async function streamChatResponse(
    message,
    onChunk
) {

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
                    message,
                    stream: true
                })
            }
        );


    if (!response.ok) {

        throw new Error(
            "MoonPlug request failed."
        );
    }


    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    /*
     * Normal JSON fallback.
     */

    if (
        contentType.includes(
            "application/json"
        )
    ) {

        const data =
            await response.json();


        const reply =
            extractResponseText(data);


        if (reply) {

            onChunk(reply);
        }


        return reply;
    }


    /*
     * Real streaming response.
     */

    if (!response.body) {

        const text =
            await response.text();

        const fallback =
            extractStreamText(text);

        if (fallback) {
            onChunk(fallback);
        }

        return fallback;
    }


    const reader =
        response.body.getReader();


    const decoder =
        new TextDecoder();


    let buffer = "";
    let fullText = "";


    while (true) {

        const {
            value,
            done
        } =
            await reader.read();


        if (done) {
            break;
        }


        buffer +=
            decoder.decode(
                value,
                {
                    stream: true
                }
            );


        const lines =
            buffer.split(/\r?\n/);


        buffer =
            lines.pop() || "";


        for (const rawLine of lines) {

            const line =
                rawLine.trim();


            if (!line) {
                continue;
            }


            if (
                line === "[DONE]" ||
                line === "data: [DONE]"
            ) {
                continue;
            }


            let jsonText = line;


            if (
                jsonText.startsWith("data:")
            ) {

                jsonText =
                    jsonText
                        .slice(5)
                        .trim();
            }


            if (!jsonText) {
                continue;
            }


            let data;

            try {

                data =
                    JSON.parse(jsonText);

            } catch {

                continue;
            }


            const chunk =
                extractResponseText(data);


            if (!chunk) {
                continue;
            }


            fullText += chunk;

            onChunk(chunk);
        }
    }


    /*
     * Process anything left in the buffer.
     */

    const finalLine =
        buffer.trim();


    if (finalLine) {

        let jsonText =
            finalLine;


        if (
            jsonText.startsWith("data:")
        ) {

            jsonText =
                jsonText
                    .slice(5)
                    .trim();
        }


        if (
            jsonText &&
            jsonText !== "[DONE]"
        ) {

            try {

                const data =
                    JSON.parse(jsonText);


                const chunk =
                    extractResponseText(data);


                if (chunk) {

                    fullText += chunk;

                    onChunk(chunk);
                }

            } catch {}
        }
    }


    return fullText;
}


/* =========================================================
   EXTRACT RESPONSE TEXT
========================================================= */

function extractResponseText(data) {

    if (!data) {
        return "";
    }


    if (
        typeof data === "string"
    ) {

        return data;
    }


    if (
        typeof data.message?.content ===
        "string"
    ) {

        return data.message.content;
    }


    if (
        typeof data.response ===
        "string"
    ) {

        return data.response;
    }


    if (
        typeof data.delta?.content ===
        "string"
    ) {

        return data.delta.content;
    }


    if (
        typeof data.content ===
        "string"
    ) {

        return data.content;
    }


    if (
        typeof data.answer ===
        "string"
    ) {

        return data.answer;
    }


    return "";
}


/* =========================================================
   STREAM TEXT FALLBACK
========================================================= */

function extractStreamText(text) {

    if (!text.trim()) {
        return "";
    }


    try {

        const data =
            JSON.parse(text);

        return extractResponseText(data);

    } catch {}


    let result = "";


    const lines =
        text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);


    for (const line of lines) {

        let jsonText = line;


        if (
            jsonText.startsWith("data:")
        ) {

            jsonText =
                jsonText
                    .slice(5)
                    .trim();
        }


        if (
            !jsonText ||
            jsonText === "[DONE]"
        ) {
            continue;
        }


        try {

            const data =
                JSON.parse(jsonText);


            const chunk =
                extractResponseText(data);


            if (chunk) {

                result += chunk;
            }

        } catch {}
    }


    return result;
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
        return null;
    }


    const emptyChat =
        $("emptyChat");


    if (emptyChat) {
        emptyChat.remove();
    }


    const row =
        document.createElement("div");


    row.className =
        `message-row ${role}`;


    const bubble =
        document.createElement("div");


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


    scrollMessages();


    return bubble;
}


/* =========================================================
   STREAMING MESSAGE
========================================================= */

function addStreamingMessage(
    text
) {

    return addMessage(
        text,
        "ai"
    );
}


/* =========================================================
   SCROLL MESSAGES
========================================================= */

function scrollMessages() {

    const messages =
        $("messages");

    if (!messages) {
        return;
    }


    requestAnimationFrame(() => {

        messages.scrollTo({
            top:
                messages.scrollHeight,

            behavior:
                "auto"
        });
    });
}


/* =========================================================
   THINKING INDICATOR
   Dynamically created — no #typing needed.
========================================================= */

function startThinkingIndicator() {

    stopThinkingIndicator();


    const messages =
        $("messages");

    if (!messages) {
        return;
    }


    const indicator =
        document.createElement("div");


    indicator.id =
        "dynamicThinking";


    indicator.className =
        "typing";


    indicator.innerHTML = `
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span>MoonPlug is thinking...</span>
    `;


    messages.appendChild(
        indicator
    );


    scrollMessages();
}


function stopThinkingIndicator() {

    const indicator =
        $("dynamicThinking");


    if (indicator) {
        indicator.remove();
    }
}


/* =========================================================
   RESPONSE ANIMATION
========================================================= */

function getResponseAnimation() {

    let animation =
        $("responseAnimation");


    /*
     * Safety fallback:
     * if the HTML was not updated,
     * create the animation automatically.
     */

    if (!animation) {

        const messages =
            $("messages");

        if (!messages) {
            return null;
        }


        animation =
            document.createElement("div");


        animation.id =
            "responseAnimation";


        animation.className =
            "response-animation";


        animation.setAttribute(
            "aria-hidden",
            "true"
        );


        animation.innerHTML = `
            <div class="response-moon">☾</div>

            <div class="response-cable"></div>

            <div class="response-plug">
                <span class="plug-pin plug-pin-one"></span>
                <span class="plug-pin plug-pin-two"></span>
                <span class="plug-body"></span>
                <span class="plug-cable"></span>
            </div>

            <span class="response-spark spark-one">✦</span>
            <span class="response-spark spark-two">✦</span>
            <span class="response-spark spark-three">✧</span>
            <span class="response-spark spark-four">✧</span>
        `;


        messages.appendChild(
            animation
        );
    }


    return animation;
}


/* =========================================================
   START RESPONSE ANIMATION
========================================================= */

function startResponseAnimation() {

    const animation =
        getResponseAnimation();


    if (!animation) {
        return;
    }


    animation.classList.remove(
        "plug-complete",
        "plug-sparks",
        "plug-error"
    );


    /*
     * Force animation restart.
     */

    void animation.offsetWidth;


    animation.classList.add(
        "response-active"
    );
}


/* =========================================================
   FINISH RESPONSE ANIMATION
========================================================= */

function finishResponseAnimation() {

    const animation =
        $("responseAnimation");


    if (!animation) {
        return;
    }


    /*
     * Response is completely finished.
     * Now connect the plug.
     */

    animation.classList.remove(
        "response-active"
    );


    animation.classList.add(
        "plug-complete"
    );


    /*
     * Give the plug a moment to connect,
     * then fire the sparks.
     */

    setTimeout(() => {

        if (!animation.isConnected) {
            return;
        }


        animation.classList.add(
            "plug-sparks"
        );

    }, 220);


    /*
     * Clean animation state after
     * the sparks have disappeared.
     */

    setTimeout(() => {

        if (!animation.isConnected) {
            return;
        }


        animation.classList.remove(
            "plug-complete",
            "plug-sparks"
        );

    }, 1200);
}


/* =========================================================
   CANCEL RESPONSE ANIMATION
========================================================= */

function cancelResponseAnimation() {

    const animation =
        $("responseAnimation");


    if (!animation) {
        return;
    }


    animation.classList.remove(
        "response-active",
        "plug-complete",
        "plug-sparks",
        "plug-error"
    );
}


/* =========================================================
   IDENTITY ANSWERS
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
   INPUT RESIZE
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

    stopConversationCompletely();

    cancelResponseAnimation();
    stopThinkingIndicator();


    const messages =
        $("messages");


    if (!messages) {
        return;
    }


    messages.innerHTML = `
        <div
            id="emptyChat"
            class="empty-chat"
        >
            <h1>What can I help with?</h1>
            <p>Ask MoonPlug anything.</p>
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
            () => {

                if (listening) {

                    stopListening();

                    setConversationState(
                        "ready"
                    );

                    setConversationText(
                        "Paused"
                    );

                } else {

                    conversationPermissionBlocked =
                        false;

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


    document.body.classList.add(
        "modal-open"
    );


    conversationPermissionBlocked =
        false;


    thinking = false;
    speaking = false;


    setConversationState(
        "ready"
    );


    setConversationText(
        "Listening..."
    );


    initializeConversationVoice();


    if (!recognitionSupported) {

        setupSpeechRecognition();
    }


    setTimeout(() => {

        if (
            isConversationOpen()
        ) {

            startListening();
        }

    }, 350);
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


    updateBodyModalState();
}


/* =========================================================
   STOP EVERYTHING
========================================================= */

function stopConversationCompletely() {

    conversationRequestId++;


    clearTimeout(
        listeningRestartTimer
    );


    listeningRestartTimer =
        null;


    listening = false;
    speaking = false;
    thinking = false;


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

    cancelResponseAnimation();

    stopThinkingIndicator();

    updateConversationMic();
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
}


/* =========================================================
   SPEECH RECOGNITION
========================================================= */

function setupSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        recognitionSupported =
            false;

        return;
    }


    recognitionSupported =
        true;


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;

    recognition.interimResults =
        true;

    recognition.lang =
        "en-US";

    recognition.maxAlternatives =
        1;


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
                result[0]?.transcript ||
                "";


            if (result.isFinal) {

                finalText += transcript;

            } else {

                interimText += transcript;
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
            event.error === "not-allowed" ||
            event.error === "service-not-allowed"
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
            event.error === "no-speech"
        ) {

            setConversationText(
                "I didn't hear anything. Listening again..."
            );


            scheduleListeningRestart();

            return;
        }


        if (
            event.error === "aborted"
        ) {

            return;
        }


        setConversationState(
            "error"
        );


        setConversationText(
            "Voice input isn't available right now."
        );


        scheduleListeningRestart();
    };


    recognition.onend = () => {

        listening = false;

        updateConversationMic();


        if (
            conversationPermissionBlocked
        ) {
            return;
        }


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

    if (!isConversationOpen()) {
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

        setConversationState(
            "error"
        );


        setConversationText(
            "Voice input isn't supported in this browser."
        );


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

    clearTimeout(
        listeningRestartTimer
    );


    listeningRestartTimer =
        null;


    if (recognition) {

        try {

            recognition.stop();

        } catch {}
    }


    listening = false;

    updateConversationMic();
}


/* =========================================================
   RESTART LISTENING
========================================================= */

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
        setTimeout(() => {

            if (
                isConversationOpen() &&
                !thinking &&
                !speaking &&
                !listening
            ) {

                startListening();
            }

        }, 500);
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


    startResponseAnimation();


    let reply = "";
    let firstChunk = true;


    try {

        reply =
            await streamChatResponse(
                text,
                chunk => {

                    if (
                        requestId !==
                        conversationRequestId
                    ) {
                        return;
                    }


                    if (firstChunk) {

                        setConversationText(
                            chunk
                        );

                        firstChunk = false;

                    } else {

                        setConversationText(
                            reply + chunk
                        );
                    }


                    reply += chunk;
                }
            );


        if (
            requestId !==
            conversationRequestId
        ) {
            return;
        }


        const cleanReply =
            reply.trim();


        if (!cleanReply) {

            throw new Error(
                "Empty MoonPlug response."
            );
        }


        /*
         * The complete response has now
         * arrived, so connect the plug.
         */

        thinking = false;

        finishResponseAnimation();


        addMessage(
            cleanReply,
            "ai"
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

        cancelResponseAnimation();


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


    if (!isConversationOpen()) {
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
        mode.classList.contains("open")
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
        window.speechSynthesis.getVoices();


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
   INITIALIZE VOICE
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
   VOICE SELECT EVENTS
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
                String(text ?? "").trim();


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

                window.speechSynthesis.speak(
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
   SPEECH WAVE
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
                        time * 0.009 +
                        index * 0.75
                    );


                const secondWave =
                    Math.sin(
                        time * 0.004 +
                        index * 0.31
                    );


                const height =
                    8 +
                    (
                        (waveValue + 1) *
                        0.5 *
                        17
                    ) +
                    (
                        (secondWave + 1) *
                        0.5 *
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
   STOP SPEECH WAVE
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


    document
        .querySelectorAll(
            "#voiceWave span"
        )
        .forEach(
            bar => {

                bar.style.height =
                    "";
            }
        );
}
/* =========================================================
   RESPONSE ANIMATION
========================================================= */

function startResponseAnimation() {

    const animation =
        $("responseAnimation");

    if (!animation) {
        return;
    }

    animation.classList.remove(
        "plug-complete",
        "plug-sparks"
    );

    animation.classList.add(
        "response-active"
    );
}


function finishResponseAnimation() {

    const animation =
        $("responseAnimation");

    if (!animation) {
        return;
    }

    animation.classList.remove(
        "response-active"
    );

    animation.classList.add(
        "plug-complete",
        "plug-sparks"
    );


    setTimeout(
        () => {

            animation.classList.remove(
                "plug-complete",
                "plug-sparks"
            );

        },
        1250
    );
}


function cancelResponseAnimation() {

    const animation =
        $("responseAnimation");

    if (!animation) {
        return;
    }

    animation.classList.remove(
        "response-active",
        "plug-complete",
        "plug-sparks"
    );
}

/* =========================================================
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


                    if (size) {
                        setTextSize(size);
                    }
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

    updateBodyModalState();
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


    updateBodyModalState();
}


/* =========================================================
   TEXT SIZE
========================================================= */

function setTextSize(size) {

    document.body.classList.remove(
        "text-small",
        "text-medium",
        "text-large"
    );


    if (
        size !== "small" &&
        size !== "large"
    ) {

        size = "medium";
    }


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


    updateBodyModalState();
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


    updateBodyModalState();
}


/* =========================================================
   BACKEND HEALTH
========================================================= */

async function checkBackendHealth() {

    try {

        const response =
            await fetch(
                `${API_BASE}/health`
            );


        if (!response.ok) {

            setOnlineStatus(false);

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


        setOnlineStatus(false);
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


    if (online) {

        element.innerHTML =
            "<i></i>Online";


        element.classList.remove(
            "offline"
        );

    } else {

        element.innerHTML =
            "<i></i>Offline";


        element.classList.add(
            "offline"
        );
    }
}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

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


            if (
                !sidebar.contains(
                    event.target
                )
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

                    if (
                        button.id ===
                        "conversationButton"
                    ) {
                        return;
                    }


                    setTimeout(() => {

                        if (
                            window.innerWidth <= 900
                        ) {

                            sidebar.classList.remove(
                                "expanded"
                            );
                        }

                    }, 120);
                }
            );
        });
}


/* =========================================================
   TOUCH SIDEBAR
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


            if (
                window.innerWidth <= 900 &&
                distance > 50
            ) {

                sidebar.classList.add(
                    "expanded"
                );
            }


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
   CONVERSATION TOUCH
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
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(() => {

                createStars();

                autoResizeMessageInput();


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

            }, 150);
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


        if (
            isConversationOpen()
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
   VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (document.hidden) {

            if (listening) {
                stopListening();
            }

            return;
        }


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
   BUTTON PRESS EFFECT
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


        setTimeout(() => {

            button.classList.remove(
                "pressed"
            );

        }, 150);
    }
);


/* =========================================================
   MODAL BODY STATE
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
   MODAL OBSERVER
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const modalObserver =
            new MutationObserver(() => {

                updateBodyModalState();
            });


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
    }
);


/* =========================================================
   PAGE EXIT
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        try {

            stopConversationCompletely();

        } catch {}
    }
);


window.addEventListener(
    "pagehide",
    () => {

        try {

            stopConversationCompletely();

        } catch {}
    }
);


/* =========================================================
   KEEP VOICE READY
========================================================= */

function keepVoiceReady() {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    if (
        !speechVoices.length
    ) {

        loadSpeechVoices();
    }


    initializeConversationVoice();
}


setTimeout(
    keepVoiceReady,
    2000
);


/* =========================================================
   PREVENT CHROME SPEECH PAUSE
========================================================= */

if (
    "speechSynthesis" in window
) {

    setInterval(() => {

        if (
            speaking &&
            window.speechSynthesis
        ) {

            try {

                window.speechSynthesis.resume();

            } catch {}
        }

    }, 5000);
}


/* =========================================================
   DEBUG
========================================================= */

function getMoonPlugDebugInfo() {

    return {

        speechRecognition:
            recognitionSupported,

        speechSynthesis:
            "speechSynthesis" in window,

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
   GLOBAL MOONPLUG OBJECT
========================================================= */

window.MoonPlug =
    window.MoonPlug || {};


window.MoonPlug.debug =
    getMoonPlugDebugInfo;

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
   END OF MOONPLUG
========================================================= */
