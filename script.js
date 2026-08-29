
/* =========================================================
   MOONPLUG AI
   WORKING-STYLE VOICE + NEW BLACK HOLE
========================================================= */

"use strict";


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
let speaking = false;
let thinking = false;

let speechAnimationFrame = null;

let speechVoices = [];

let conversationRequestId = 0;


/* =========================================================
   SHORTCUT
========================================================= */

const $ = id => document.getElementById(id);


/* =========================================================
   START
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

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

});


/* =========================================================
   STAR FIELD
========================================================= */

function createStars() {

    const field = $("starField");

    if (!field)
        return;

    field.innerHTML = "";

    const amount =
        window.innerWidth <= 600
            ? 55
            : 100;

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
            `${Math.random() * 1.8 + .5}px`
        );

        star.style.setProperty(
            "--star-opacity",
            `${Math.random() * .55 + .2}`
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

        logo.addEventListener("click", () => {

            const sidebar = $("sidebar");

            if (!sidebar)
                return;

            /*
             * Mobile:
             * open / close the sidebar.
             *
             * Tablet / desktop:
             * collapse / expand it.
             */

            if (window.innerWidth <= 600) {

                sidebar.classList.toggle("expanded");

            } else if (window.innerWidth <= 1000) {

                sidebar.classList.toggle("desktop-expanded");

            }

        });

    }


    const conversation = $("conversationButton");

    if (conversation) {

        conversation.addEventListener(
            "click",
            () => {

                closeSidebarOnMobile();

                openConversation();

            }
        );

    }


    const newChat = $("newChatButton");

    if (newChat) {

        newChat.addEventListener(
            "click",
            () => {

                closeSidebarOnMobile();

                startNewChat();

            }
        );

    }


    const settings = $("settingsButton");

    if (settings) {

        settings.addEventListener(
            "click",
            () => {

                closeSidebarOnMobile();

                openSettings();

            }
        );

    }


    const account = $("accountButton");

    if (account) {

        account.addEventListener(
            "click",
            () => {

                closeSidebarOnMobile();

                openAccount();

            }
        );

    }


    const history = $("historyButton");

    if (history) {

        history.addEventListener(
            "click",
            () => {

                closeSidebarOnMobile();

                alert("Chat history is coming soon.");

            }
        );

    }


    /*
     * Close mobile sidebar when clicking
     * somewhere outside it.
     */

    document.addEventListener("click", event => {

        const sidebar = $("sidebar");
        const logo = $("sidebarLogo");

        if (!sidebar)
            return;

        if (window.innerWidth > 600)
            return;

        if (!sidebar.classList.contains("expanded"))
            return;

        if (
            sidebar.contains(event.target) ||
            (logo && logo.contains(event.target))
        ) {
            return;
        }

        sidebar.classList.remove("expanded");

    });

}


function closeSidebarOnMobile() {

    const sidebar = $("sidebar");

    if (!sidebar)
        return;

    sidebar.classList.remove("expanded");

}


/* =========================================================
   NORMAL CHAT
========================================================= */

function setupChat() {

    const input = $("messageInput");
    const button = $("sendButton");

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

            input.style.height = "auto";

            input.style.height =
                Math.min(
                    input.scrollHeight,
                    180
                ) + "px";

        }
    );

}


async function sendMessage() {

    const input = $("messageInput");
    const button = $("sendButton");

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
    input.style.height = "auto";


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
            "Normal chat error:",
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

function addMessage(text, sender) {

    const messages = $("messages");
    const empty = $("emptyChat");

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


    messages.appendChild(bubble);

    messages.scrollTop =
        messages.scrollHeight;

}


/* =========================================================
   TYPING
========================================================= */

function showTyping() {

    const typing = $("typing");

    if (typing)
        typing.hidden = false;

}


function hideTyping() {

    const typing = $("typing");

    if (typing)
        typing.hidden = true;

}


/* =========================================================
   CONVERSATION
========================================================= */

function setupConversation() {

    const close = $("conversationClose");
    const button = $("conversationMic");


    if (close) {

        close.addEventListener(
            "click",
            closeConversation
        );

    }


    if (button) {

        button.addEventListener(
            "click",
            handleConversationButton
        );

    }

}


function openConversation() {

    const mode =
        $("conversationMode");

    if (!mode)
        return;


    mode.classList.add("active");

    mode.setAttribute(
        "aria-hidden",
        "false"
    );


    thinking = false;

    listening = false;

    speaking = false;


    setConversationState("idle");

    setConversationText(
        "Tap the button to talk"
    );


    /*
     * Important for Safari.
     *
     * We do not start the microphone
     * automatically. The user must tap
     * the single conversation button.
     */

}


function closeConversation() {

    stopListening();

    stopSpeaking();

    thinking = false;

    conversationRequestId++;


    const mode =
        $("conversationMode");

    if (!mode)
        return;


    mode.classList.remove("active");

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
     * Same button controls everything.
     */

    if (speaking) {

        stopSpeaking();

        setConversationState("idle");

        setConversationText(
            "Tap the button to talk"
        );

        return;

    }


    if (thinking) {

        return;

    }


    if (listening) {

        stopListening();

        return;

    }


    startListening();

}


/* =========================================================
   STATE
========================================================= */

function setConversationState(state) {

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
            labels[state] || "Ready";

    }

}


function setConversationText(text) {

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

        recognitionSupported = false;

        console.warn(
            "Speech recognition is unavailable."
        );

        return;

    }


    recognitionSupported = true;


    recognition =
        new Recognition();


    /*
     * These settings intentionally stay
     * close to the older working version.
     */

    recognition.continuous = false;

    recognition.interimResults = false;

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

            processConversation(
                transcript
            );

        }

    };


    recognition.onerror = event => {

        console.warn(
            "Speech recognition error:",
            event.error
        );


        listening = false;


        if (
            event.error === "not-allowed" ||
            event.error === "service-not-allowed"
        ) {

            setConversationState(
                "idle"
            );

            setConversationText(
                "Microphone permission is blocked."
            );

            return;

        }


        if (event.error === "no-speech") {

            setConversationState(
                "idle"
            );

            setConversationText(
                "I didn't hear anything. Tap again."
            );

            return;

        }


        setConversationState("idle");

        setConversationText(
            "Microphone error. Tap again."
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
            "Speech recognition isn't supported here."
        );

        return;

    }


    if (speaking) {

        stopSpeaking();

        return;

    }


    /*
     * Safari audio unlock.
     *
     * This runs directly from the user's
     * button press.
     */

    unlockSpeech();


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

            } catch (retryError) {

                console.warn(
                    "Recognition retry:",
                    retryError
                );

            }

        }, 180);

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


    if (!thinking && !speaking) {

        setConversationState(
            "idle"
        );

    }

}


/* =========================================================
   PROCESS CONVERSATION
========================================================= */

async function processConversation(
    transcript
) {

    stopListening();


    const message =
        String(
            transcript || ""
        ).trim();


    if (!message)
        return;


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
         * ACTUAL SPOKEN RESPONSE.
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
   SPEECH VOICES
========================================================= */

function setupSpeechVoices() {

    if (
        !("speechSynthesis" in window)
    )
        return;


    loadSpeechVoices();


    if (
        "onvoiceschanged" in
        window.speechSynthesis
    ) {

        window.speechSynthesis.onvoiceschanged =
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

        "Microsoft Guy"

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
   SAFARI AUDIO UNLOCK
========================================================= */

function unlockSpeech() {

    if (
        !("speechSynthesis" in window)
    )
        return;


    try {

        window.speechSynthesis.cancel();

        /*
         * Safari can require speech synthesis
         * to be touched from a user gesture
         * before later async speech works.
         */

        const unlock =
            new SpeechSynthesisUtterance("");

        unlock.volume = 0;

        unlock.rate = 1;

        unlock.pitch = 1;

        window.speechSynthesis.speak(
            unlock
        );

    } catch (error) {

        console.warn(
            "Speech unlock:",
            error
        );

    }

}


/* =========================================================
   SPEAK RESPONSE
========================================================= */

function speakConversation(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        speaking = false;
        thinking = false;

        setConversationState(
            "idle"
        );

        setConversationText(
            "Voice playback isn't supported here."
        );

        return;

    }


    stopSpeechAnimation();


    try {

        window.speechSynthesis.cancel();

        window.speechSynthesis.resume();

    } catch {}


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


    /*
     * Loud, clear, natural settings.
     */

    utterance.rate = .94;

    utterance.pitch = 1;

    utterance.volume = 1;


    utterance.onstart = () => {

        thinking = false;

        speaking = true;


        setConversationState(
            "talking"
        );


        startVoiceWave();

    };


    utterance.onend = () => {

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


    utterance.onerror = event => {

        console.error(
            "Speech synthesis error:",
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
                        Date.now() / 75 +
                        index * .7
                    );


                const random =
                    Math.random();


                const height =
                    .2 +
                    (
                        random * .55 +
                        (pulse + 1) * .25
                    ) *
                    (
                        .35 +
                        centerPower * .65
                    );


                bar.style.transform =
                    `scaleY(${Math.min(
                        1.9,
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


function stopSpeechAnimation() {

    if (speechAnimationFrame) {

        cancelAnimationFrame(
            speechAnimationFrame
        );

        speechAnimationFrame = null;

    }


    const wave =
        $("voiceWave");

    if (!wave)
        return;


    wave.querySelectorAll("span")
        .forEach(bar => {

            bar.style.transform =
                "scaleY(.15)";

        });

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

            <div class="empty-moon">
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


function updateTextSize(size) {

    const allowed = [
        "small",
        "medium",
        "large"
    ];


    if (!allowed.includes(size))
        size = "medium";


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
        .querySelectorAll(".size-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.size === size
            );

        });

}


function loadTextSize() {

    let saved = "medium";


    try {

        saved =
            localStorage.getItem(
                "moonplugTextSize"
            ) || "medium";

    } catch {}


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
            "MoonPlug backend:",
            error
        );

    }

}


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        /*
         * Prevent the mobile sidebar from
         * getting stuck open after resizing.
         */

        if (window.innerWidth > 600) {

            const sidebar =
                $("sidebar");

            if (sidebar) {

                sidebar.classList.remove(
                    "expanded"
                );

            }

        }

    }
);

