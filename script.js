
"use strict";

/* =========================================================
   MOONPLUG AI
   COMPLETE FRONTEND JS
   BACKEND UNCHANGED
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

let selectedVoiceName =
    localStorage.getItem("moonplugVoice") || "";

let conversationRequestId = 0;

let speechUnlocked = false;


/* =========================================================
   DOM
========================================================= */

const $ = id =>
    document.getElementById(id);


/* =========================================================
   STARTUP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * NOTHING starts thinking on page load.
         */

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

        loadSpeechVoices();

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

    if (!field) return;

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
            document.createElement(
                "div"
            );

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
            event => {

                event.preventDefault();

                const collapsed =
                    sidebar.classList.toggle(
                        "collapsed"
                    );

                logo.setAttribute(
                    "aria-expanded",
                    String(!collapsed)
                );

                logo.setAttribute(
                    "aria-label",
                    collapsed
                        ? "Expand sidebar"
                        : "Collapse sidebar"
                );

            }
        );
    }


    const conversation =
        $("conversationButton");

    if (conversation) {

        conversation.addEventListener(
            "click",
            () => {

                openConversation();

                collapseSidebarOnSmallScreen();

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

                collapseSidebarOnSmallScreen();

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

                collapseSidebarOnSmallScreen();

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

                collapseSidebarOnSmallScreen();

            }
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

                collapseSidebarOnSmallScreen();

            }
        );
    }


    const study =
        $("studyButton");

    if (study) {

        study.addEventListener(
            "click",
            () => {

                addMessage(
                    "Study Mode is coming soon.",
                    "ai"
                );

                collapseSidebarOnSmallScreen();

            }
        );
    }


    const cook =
        $("cookButton");

    if (cook) {

        cook.addEventListener(
            "click",
            () => {

                addMessage(
                    "Cook Mode is coming soon.",
                    "ai"
                );

                collapseSidebarOnSmallScreen();

            }
        );
    }


    const images =
        $("imagesButton");

    if (images) {

        images.addEventListener(
            "click",
            () => {

                addMessage(
                    "Image Mode is coming soon.",
                    "ai"
                );

                collapseSidebarOnSmallScreen();

            }
        );
    }


    const code =
        $("codeButton");

    if (code) {

        code.addEventListener(
            "click",
            () => {

                addMessage(
                    "Code Mode is coming soon.",
                    "ai"
                );

                collapseSidebarOnSmallScreen();

            }
        );
    }

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function collapseSidebarOnSmallScreen() {

    const sidebar =
        $("sidebar");

    if (!sidebar) return;


    if (
        window.innerWidth <= 900
    ) {

        sidebar.classList.remove(
            "expanded"
        );

        /*
         * Keep the sidebar collapsed.
         * The MoonPlug logo opens it again.
         */

        sidebar.classList.add(
            "collapsed"
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
   NORMAL CHAT REQUEST
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
     * CRITICAL:
     * Empty input does NOTHING.
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
     * IMPORTANT:
     * We DO NOT start speech here.
     * We DO NOT start recognition here.
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
   MICROPHONE BUTTON
========================================================= */

function handleConversationButton() {

    /*
     * Unlock Safari speech while this function
     * is running directly from the user's tap.
     */

    unlockSpeechSynthesis();


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
   SAFARI SPEECH UNLOCK
========================================================= */

function unlockSpeechSynthesis() {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    try {

        window.speechSynthesis.cancel();

        window.speechSynthesis.resume();


        /*
         * Safari/iOS sometimes needs speak()
         * to be called during a user gesture.
         *
         * This tiny silent utterance unlocks
         * the speech engine without saying anything.
         */

        const unlock =
            new SpeechSynthesisUtterance(
                " "
            );

        unlock.volume = 0;

        unlock.rate = 10;

        unlock.pitch = 0;


        window.speechSynthesis.speak(
            unlock
        );


        speechUnlocked = true;


    } catch (error) {

        console.warn(
            "Safari speech unlock:",
            error
        );

    }

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


    if (
        state !== "idle"
    ) {

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


            /*
             * SHOW WHAT THE USER IS SAYING.
             */

            if (transcript) {

                setConversationText(
                    transcript
                );

            }


            const last =
                event.results[
                    event.results.length - 1
                ];


            /*
             * ONLY FINAL SPEECH
             * starts the backend request.
             */

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


    if (!message) {

        thinking = false;

        setConversationState(
            "idle"
        );

        return;

    }


    const requestId =
        ++conversationRequestId;


    /*
     * NOW — AND ONLY NOW —
     * MoonPlug starts thinking.
     */

    thinking = true;


    setConversationState(
        "thinking"
    );


    /*
     * Keep exactly what the user said visible
     * while the backend is processing.
     */

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
         * SHOW USER SPEECH IN NORMAL CHAT.
         */

        addMessage(
            message,
            "user"
        );


        /*
         * SHOW AI RESPONSE IN NORMAL CHAT.
         */

        addMessage(
            cleanReply,
            "ai"
        );


        /*
         * SHOW AI RESPONSE IN CONVERSATION MODE.
         */

        setConversationText(
            cleanReply
        );


        /*
         * SPEAK IT.
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

function setupVoiceLoading() {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    window.speechSynthesis.onvoiceschanged =
        () => {

            loadSpeechVoices();

        };


    /*
     * Safari can populate voices slowly.
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
        1200
    );

    setTimeout(
        loadSpeechVoices,
        2500
    );

}


/* =========================================================
   LOAD VOICES
========================================================= */

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


    populateVoiceSelector();

}


/* =========================================================
   VOICE SELECTOR
========================================================= */

function populateVoiceSelector() {

    const selector =
        $("voiceSelect");

    if (!selector) return;


    const voices =
        window.speechSynthesis
            .getVoices() || [];


    speechVoices =
        voices;


    if (!voices.length) {

        selector.innerHTML = "";

        const option =
            document.createElement(
                "option"
            );

        option.value = "";

        option.textContent =
            "Loading voices...";

        selector.appendChild(
            option
        );

        return;

    }


    const englishVoices =
        voices.filter(
            voice =>
                /^en[-_]/i.test(
                    voice.lang
                )
        );


    const availableVoices =
        englishVoices.length
            ? englishVoices
            : voices;


    selector.innerHTML = "";


    availableVoices.forEach(
        voice => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                voice.name;


            option.textContent =
                `${voice.name} — ${voice.lang}`;


            if (
                voice.name ===
                selectedVoiceName
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
     * Saved voice disappeared from Safari.
     */

    const savedExists =
        availableVoices.some(
            voice =>
                voice.name ===
                selectedVoiceName
        );


    if (
        selectedVoiceName &&
        !savedExists
    ) {

        selectedVoiceName =
            "";

        localStorage.removeItem(
            "moonplugVoice"
        );

    }


    selector.onchange =
        () => {

            selectedVoiceName =
                selector.value;


            localStorage.setItem(
                "moonplugVoice",
                selectedVoiceName
            );


            console.log(
                "MoonPlug voice selected:",
                selectedVoiceName
            );

        };

}


/* =========================================================
   GET USER VOICE
========================================================= */

function getBestVoice() {

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


    /*
     * USER SELECTED VOICE
     */

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


    /*
     * ENGLISH
     */

    const english =
        voices.filter(
            voice =>
                /^en[-_]/i.test(
                    voice.lang
                )
        );


    const candidates =
        english.length
            ? english
            : voices;


    /*
     * DEFAULTS
     */

    const preferred = [

        "Samantha",

        "Alex",

        "Daniel",

        "Karen",

        "Fred",

        "Google US English",

        "Microsoft Aria",

        "Microsoft Jenny",

        "Microsoft Guy"

    ];


    for (
        const name
        of preferred
    ) {

        const found =
            candidates.find(
                voice =>
                    voice.name
                        .toLowerCase()
                        .includes(
                            name.toLowerCase()
                        )
            );


        if (found) {

            return found;

        }

    }


    /*
     * EN-US
     */

    const american =
        candidates.find(
            voice =>
                /^en-US/i.test(
                    voice.lang
                )
        );


    if (american) {

        return american;

    }


    return candidates[0] || null;

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

        window.speechSynthesis.resume();

    } catch {}


    /*
     * Safari voices can become available
     * between the request and this function.
     */

    loadSpeechVoices();


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
        0.92;

    utterance.pitch =
        1;

    utterance.volume =
        1;


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
                "Tap the microphone to talk"
            );

        };


    utterance.onerror =
        error => {

            console.error(
                "Speech synthesis:",
                error
            );


            speaking = false;

            thinking = false;


            stopSpeechAnimation();


            setConversationState(
                "idle"
            );


            setConversationText(
                "Tap the microphone to talk"
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
   TEST SELECTED VOICE
========================================================= */

function testSelectedVoice() {

    if (
        !("speechSynthesis" in window)
    ) {

        return;

    }


    unlockSpeechSynthesis();


    const voice =
        getBestVoice();


    const utterance =
        new SpeechSynthesisUtterance(
            "Hi. I'm MoonPlug."
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


    try {

        window.speechSynthesis.cancel();

        window.speechSynthesis.resume();

        window.speechSynthesis.speak(
            utterance
        );

    } catch (error) {

        console.error(
            "Voice test failed:",
            error
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
                        Date.now() / 90 +
                        index * 0.75
                    );


                const random =
                    Math.random();


                const height =
                    0.25 +
                    (
                        random * 0.55 +
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


    const testVoice =
        $("testVoiceButton");


    if (testVoice) {

        testVoice.addEventListener(
            "click",
            testSelectedVoice
        );

    }

}


/* =========================================================
   OPEN SETTINGS
========================================================= */

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

    if (
        !["small", "medium", "large"]
            .includes(size)
    ) {

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


/* =========================================================
   LOAD TEXT SIZE
========================================================= */

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


/* =========================================================
   OPEN ACCOUNT
========================================================= */

function openAccount() {

    const screen =
        $("accountScreen");

    if (!screen) return;


    screen.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* =========================================================
   CLOSE ACCOUNT
========================================================= */

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
