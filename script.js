/* =========================================================
   MOONPLUG AI
   FINAL FRONTEND
========================================================= */

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const API_BASE =
    "https://moonplug.onrender.com";


const STORAGE_KEYS = {

    theme: "moonplugTheme",

    textSize: "moonplugTextSize",

    history: "moonplugChatHistory",

    voice: "moonplugVoice"

};


/* =========================================================
   DOM HELPER
========================================================= */

const $ = id =>
    document.getElementById(id);


/* =========================================================
   STATE
========================================================= */

let currentChat = [];

let isSending = false;

let animationRunning = false;

let thinking = false;

let listening = false;

let speaking = false;

let speechRecognition = null;

let speechVoices = [];

let selectedVoiceName = "";

let voiceReady = false;

let conversationRequestId = 0;

let conversationPermissionBlocked = false;


/* =========================================================
   STARTUP
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

        setupVoiceLoading();

        setupTestVoice();

        loadTextSize();

        loadSpeechVoices();

        checkBackendHealth();

        const messageInput =
            $("messageInput");

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

    const width =
        window.innerWidth;

    let count = 320;

    if (width <= 600) {

        count = 170;

    } else if (width <= 1200) {

        count = 240;

    }

    for (
        let i = 0;
        i < count;
        i++
    ) {

        const star =
            document.createElement("span");

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

        const size =
            Math.random() * 1.7 + .5;

        star.style.setProperty(
            "--star-size",
            `${size}px`
        );

        star.style.setProperty(
            "--star-opacity",
            `${Math.random() * .65 + .2}`
        );

        star.style.setProperty(
            "--star-glow",
            `${Math.random() * 5 + 1}px`
        );

        star.style.setProperty(
            "--star-duration",
            `${Math.random() * 4 + 3}s`
        );

        star.style.setProperty(
            "--star-delay",
            `${Math.random() * 4}s`
        );

        star.style.setProperty(
            "--star-scale",
            `${Math.random() * .5 + .7}`
        );

        star.style.setProperty(
            "--star-move-x",
            `${Math.random() * 8 - 4}px`
        );

        star.style.setProperty(
            "--star-move-y",
            `${Math.random() * 8 - 4}px`
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

    if (!sidebar || !logo) return;


    logo.addEventListener(
        "click",
        () => {

            if (
                window.innerWidth <= 900
            ) {

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


    const buttons =
        document.querySelectorAll(
            ".sidebar-button"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                if (
                    window.innerWidth <= 900 &&
                    !sidebar.classList.contains(
                        "expanded"
                    )
                ) {

                    sidebar.classList.add(
                        "expanded"
                    );

                    event.stopPropagation();

                }

            },
            true
        );

    });


    $("newChatButton")
        ?.addEventListener(
            "click",
            startNewChat
        );

    $("conversationButton")
        ?.addEventListener(
            "click",
            openConversation
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

}


/* =========================================================
   CHAT INPUT
========================================================= */

function setupChat() {

    $("sendButton")
        ?.addEventListener(
            "click",
            sendMessage
        );

}


function autoResizeMessageInput() {

    const input =
        $("messageInput");

    if (!input) return;

    input.style.height =
        "auto";

    const maxHeight = 180;

    input.style.height =
        `${Math.min(
            input.scrollHeight,
            maxHeight
        )}px`;
}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (isSending) return;

    const input =
        $("messageInput");

    if (!input) return;

    const text =
        input.value.trim();

    if (!text) return;


    addMessage(
        text,
        "user"
    );

    input.value = "";

    autoResizeMessageInput();

    showTyping(true);

    isSending = true;

    $("sendButton").disabled = true;


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
                        message: text
                    })
                }
            );


        let data;

        try {

            data =
                await response.json();

        } catch {

            data = {
                success: false,
                error:
                    "Server returned an invalid response."
            };

        }


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                `Server error ${response.status}`
            );

        }


        const answer =
            data.response ||
            data.message ||
            data.answer;


        if (!answer) {

            throw new Error(
                "MoonPlug returned an empty response."
            );

        }


        addMessage(
            answer,
            "ai"
        );


        saveCurrentChat();

    } catch (error) {

        console.error(
            "MoonPlug chat error:",
            error
        );


        addMessage(
            `Sorry, I couldn't connect to MoonPlug right now.\n\n${error.message}`,
            "ai"
        );

    } finally {

        showTyping(false);

        isSending = false;

        $("sendButton").disabled = false;

        input.focus();

    }

}


/* =========================================================
   IDENTITY ANSWERS
========================================================= */

function getIdentityAnswer(text) {

    const value =
        String(text || "")
            .toLowerCase()
            .trim();


    if (
        value.includes("who made you") ||
        value.includes("who created you") ||
        value.includes("who built you")
    ) {

        return (
            "I was made by Xavier as part " +
            "of the MoonPlug AI project."
        );

    }


    if (
        value.includes("when were you made") ||
        value.includes("when were you created") ||
        value.includes("when was moonplug made")
    ) {

        return (
            "MoonPlug was created in 2026 " +
            "as an AI project."
        );

    }


    return null;

}


/* =========================================================
   ADD MESSAGE
========================================================= */

function addMessage(
    text,
    type
) {

    const messages =
        $("messages");

    if (!messages) return;


    const empty =
        $("emptyChat");

    if (empty) {

        empty.remove();

    }


    const row =
        document.createElement("div");

    row.className =
        `message-row ${type}`;


    const message =
        document.createElement("div");

    message.className =
        `message ${type}`;


    message.textContent =
        String(text || "");


    row.appendChild(message);

    messages.appendChild(row);


    messages.scrollTop =
        messages.scrollHeight;


    currentChat.push({

        role:
            type === "user"
                ? "user"
                : "assistant",

        content:
            String(text || ""),

        timestamp:
            Date.now()

    });


    return message;

}


/* =========================================================
   TYPING
========================================================= */

function showTyping(show) {

    const typing =
        $("typing");

    if (!typing) return;

    typing.hidden =
        !show;

}


/* =========================================================
   NEW CHAT
========================================================= */

function startNewChat() {

    currentChat = [];

    const messages =
        $("messages");

    if (!messages) return;


    messages.innerHTML = `

        <div id="emptyChat"
             class="empty-chat">

            <div
                class="home-orb"
                aria-hidden="true"
            >
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


    const input =
        $("messageInput");

    input?.focus();

    saveCurrentChat();

}


/* =========================================================
   SAVE CHAT
========================================================= */

function saveCurrentChat() {

    try {

        localStorage.setItem(
            STORAGE_KEYS.history,
            JSON.stringify(currentChat)
        );

    } catch (error) {

        console.warn(
            "Could not save chat:",
            error
        );

    }

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


    $("conversationMic")
        ?.addEventListener(
            "click",
            toggleConversationListening
        );

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

    conversationPermissionBlocked =
        false;


    mode.classList.add(
        "active"
    );

    mode.setAttribute(
        "aria-hidden",
        "false"
    );


    initializeConversationVoice();


    setConversationState(
        "listening"
    );

    setConversationText(
        "Listening..."
    );


    setTimeout(
        () => {

            if (
                mode.classList.contains(
                    "active"
                ) &&
                !speaking &&
                !thinking &&
                !listening
            ) {

                startListening();

            }

        },
        150
    );

}


/* =========================================================
   CLOSE CONVERSATION
========================================================= */

function closeConversation() {

    conversationRequestId++;

    thinking = false;

    conversationPermissionBlocked =
        false;

    stopListening();

    stopSpeaking();

    stopVoiceWave();


    const mode =
        $("conversationMode");

    if (!mode) return;


    mode.classList.remove(
        "active"
    );

    mode.classList.remove(
        "listening"
    );

    mode.classList.remove(
        "talking"
    );

    mode.setAttribute(
        "aria-hidden",
        "true"
    );


    setConversationState(
        "idle"
    );

    setConversationText(
        "Tap Conversation to start again."
    );

}


/* =========================================================
   TOGGLE LISTENING
========================================================= */

function toggleConversationListening() {

    const mode =
        $("conversationMode");

    if (
        !mode ||
        !mode.classList.contains(
            "active"
        )
    ) {

        return;

    }


    if (speaking) {

        stopSpeaking();

        if (
            mode.classList.contains(
                "active"
            )
        ) {

            setConversationState(
                "listening"
            );

            setConversationText(
                "Listening..."
            );

            setTimeout(
                () => {

                    if (
                        mode.classList.contains(
                            "active"
                        ) &&
                        !speaking &&
                        !thinking &&
                        !listening
                    ) {

                        startListening();

                    }

                },
                150
            );

        }

        return;

    }


    if (listening) {

        stopListening();

        setConversationState(
            "idle"
        );

        setConversationText(
            "Conversation paused."
        );

        return;

    }


    conversationPermissionBlocked =
        false;

    setConversationState(
        "listening"
    );

    setConversationText(
        "Listening..."
    );

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

    if (!mode || !status) return;


    mode.classList.remove(
        "listening",
        "thinking",
        "talking"
    );


    if (state === "listening") {

        mode.classList.add(
            "listening"
        );

        status.textContent =
            "Listening";

        return;

    }


    if (state === "thinking") {

        mode.classList.add(
            "thinking"
        );

        status.textContent =
            "Thinking";

        return;

    }


    if (state === "talking") {

        mode.classList.add(
            "talking"
        );

        status.textContent =
            "Speaking";

        return;

    }


    status.textContent =
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

    if (!element) return;

    element.textContent =
        String(text || "");

}


/* =========================================================
   SPEECH RECOGNITION
========================================================= */

function setupSpeechRecognition() {

    const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!Recognition) {

        setConversationState(
            "idle"
        );

        setConversationText(
            "Voice input is not supported in this browser."
        );

        return;

    }


    speechRecognition =
        new Recognition();


    speechRecognition.continuous =
        false;

    speechRecognition.interimResults =
        true;

    speechRecognition.lang =
        "en-US";


    speechRecognition.onstart =
        () => {

            listening = true;

            setConversationState(
                "listening"
            );

            setConversationText(
                "Listening..."
            );

        };


    speechRecognition.onresult =
        event => {

            let interim = "";

            let finalText = "";


            for (
                let i =
                    event.resultIndex;

                i <
                    event.results.length;

                i++
            ) {

                const result =
                    event.results[i];

                const transcript =
                    result[0].transcript;


                if (result.isFinal) {

                    finalText +=
                        transcript;

                } else {

                    interim +=
                        transcript;

                }

            }


            if (interim) {

                setConversationText(
                    interim
                );

            }


            if (finalText.trim()) {

                const transcript =
                    finalText.trim();


                setConversationText(
                    transcript
                );


                stopListening();


                processConversation(
                    transcript
                );

            }

        };


    speechRecognition.onerror =
        event => {

            listening = false;


            if (
                event.error ===
                "not-allowed"
            ) {

                conversationPermissionBlocked =
                    true;

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

                conversationPermissionBlocked =
                    true;

                setConversationState(
                    "idle"
                );

                setConversationText(
                    "Voice input is unavailable."
                );

                return;

            }


            if (
                event.error ===
                "no-speech"
            ) {

                return;

            }


            console.warn(
                "Speech recognition:",
                event.error
            );

        };


    speechRecognition.onend =
        () => {

            listening = false;


            const mode =
                $("conversationMode");


            const active =
                mode &&
                mode.classList.contains(
                    "active"
                );


            if (
                active &&
                !conversationPermissionBlocked &&
                !thinking &&
                !speaking
            ) {

                setConversationState(
                    "listening"
                );

                setConversationText(
                    "Listening..."
                );


                setTimeout(
                    () => {

                        if (
                            mode.classList.contains(
                                "active"
                            ) &&
                            !conversationPermissionBlocked &&
                            !thinking &&
                            !speaking &&
                            !listening
                        ) {

                            startListening();

                        }

                    },
                    250
                );


                return;

            }


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

    if (
        !speechRecognition ||
        listening ||
        thinking ||
        speaking
    ) {

        return;

    }


    const mode =
        $("conversationMode");


    if (
        !mode ||
        !mode.classList.contains(
            "active"
        )
    ) {

        return;

    }


    try {

        speechRecognition.start();

    } catch (error) {

        if (
            !String(error.message)
                .toLowerCase()
                .includes(
                    "already started"
                )
        ) {

            console.warn(
                "Could not start microphone:",
                error
            );

        }

    }

}


/* =========================================================
   STOP LISTENING
========================================================= */

function stopListening() {

    if (!speechRecognition) return;


    try {

        speechRecognition.stop();

    } catch {}

    listening = false;

}


/* =========================================================
   PROCESS CONVERSATION
========================================================= */

async function processConversation(
    transcript
) {

    const text =
        String(transcript || "")
            .trim();

    if (!text) return;


    const requestId =
        ++conversationRequestId;


    thinking = true;

    setConversationState(
        "thinking"
    );

    setConversationText(
        text
    );


    addMessage(
        text,
        "user"
    );


    saveCurrentChat();


    const identityAnswer =
        getIdentityAnswer(text);


    if (identityAnswer) {

        if (
            requestId !==
            conversationRequestId
        ) {

            return;

        }


        thinking = false;


        addMessage(
            identityAnswer,
            "ai"
        );


        saveCurrentChat();


        await speakConversation(
            identityAnswer
        );


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
                        message: text
                    })
                }
            );


        let data;

        try {

            data =
                await response.json();

        } catch {

            data = null;

        }


        if (!response.ok) {

            throw new Error(
                data?.error ||
                data?.message ||
                `Server error ${response.status}`
            );

        }


        if (
            requestId !==
            conversationRequestId
        ) {

            return;

        }


        const answer =
            data?.response ||
            data?.message ||
            data?.answer;


        if (!answer) {

            throw new Error(
                "MoonPlug returned an empty response."
            );

        }


        thinking = false;


        addMessage(
            answer,
            "ai"
        );


        saveCurrentChat();


        await speakConversation(
            answer
        );


    } catch (error) {

        console.error(
            "Conversation error:",
            error
        );


        if (
            requestId !==
            conversationRequestId
        ) {

            return;

        }


        thinking = false;


        const message =
            "Sorry, I couldn't connect " +
            "to MoonPlug right now.";


        addMessage(
            message,
            "ai"
        );


        setConversationText(
            error.message ||
            message
        );


        await speakConversation(
            message
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

        setVoiceStatus(
            "Voice playback is unavailable."
        );

        return;

    }


    window.speechSynthesis.onvoiceschanged =
        loadSpeechVoices;


    loadSpeechVoices();


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
    ) {

        return;

    }


    const voices =
        window.speechSynthesis
            .getVoices();


    if (!voices.length) {

        return;

    }


    speechVoices =
        voices;


    const stored =
        localStorage.getItem(
            STORAGE_KEYS.voice
        );


    if (
        stored &&
        voices.some(
            voice =>
                voice.name === stored
        )
    ) {

        selectedVoiceName =
            stored;

    } else {

        const preferred =
            voices.find(
                voice =>
                    voice.lang
                        ?.toLowerCase()
                        .startsWith(
                            "en-us"
                        )
            ) ||

            voices.find(
                voice =>
                    voice.lang
                        ?.toLowerCase()
                        .startsWith("en")
            ) ||

            voices[0];


        selectedVoiceName =
            preferred?.name || "";

    }


    populateVoiceSelector();

    voiceReady =
        Boolean(
            getSelectedVoice()
        );

}


/* =========================================================
   INITIALIZE DEFAULT VOICE
========================================================= */

function initializeConversationVoice() {

    if (
        !("speechSynthesis" in window)
    ) {

        voiceReady = false;

        setVoiceStatus(
            "Voice playback is unavailable."
        );

        return false;

    }


    try {

        window.speechSynthesis.cancel();

        window.speechSynthesis.resume();

    } catch {}


    loadSpeechVoices();


    const voices =
        window.speechSynthesis
            .getVoices() || [];


    if (voices.length) {

        const voice =
            getSelectedVoice();


        if (voice) {

            selectedVoiceName =
                voice.name;

            voiceReady = true;


            localStorage.setItem(
                STORAGE_KEYS.voice,
                selectedVoiceName
            );


            setVoiceStatus(
                "Voice ready."
            );


            return true;

        }

    }


    voiceReady = false;


    setTimeout(
        () => {

            loadSpeechVoices();


            const laterVoices =
                window.speechSynthesis
                    .getVoices() || [];


            if (laterVoices.length) {

                const voice =
                    getSelectedVoice();


                if (voice) {

                    selectedVoiceName =
                        voice.name;

                    voiceReady = true;


                    localStorage.setItem(
                        STORAGE_KEYS.voice,
                        selectedVoiceName
                    );


                    setVoiceStatus(
                        "Voice ready."
                    );

                }

            }

        },
        100
    );


    return false;

}


/* =========================================================
   VOICE SELECTOR
========================================================= */

function populateVoiceSelector() {

    const select =
        $("voiceSelect");

    if (!select) return;


    select.innerHTML = "";


    speechVoices.forEach(
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


            select.appendChild(
                option
            );

        }
    );


    if (!speechVoices.length) {

        const option =
            document.createElement(
                "option"
            );

        option.value = "";

        option.textContent =
            "No voices available";

        select.appendChild(
            option
        );

    }

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
            .getVoices();


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


    const stored =
        localStorage.getItem(
            STORAGE_KEYS.voice
        );


    if (stored) {

        const storedVoice =
            voices.find(
                voice =>
                    voice.name === stored
            );


        if (storedVoice) {

            selectedVoiceName =
                storedVoice.name;

            return storedVoice;

        }

    }


    const englishUS =
        voices.find(
            voice =>
                voice.lang
                    ?.toLowerCase()
                    .startsWith(
                        "en-us"
                    )
        );


    if (englishUS) {

        selectedVoiceName =
            englishUS.name;

        return englishUS;

    }


    const english =
        voices.find(
            voice =>
                voice.lang
                    ?.toLowerCase()
                    .startsWith(
                        "en"
                    )
        );


    if (english) {

        selectedVoiceName =
            english.name;

        return english;

    }


    selectedVoiceName =
        voices[0].name;


    return voices[0];

}


/* =========================================================
   SPEAK CONVERSATION
========================================================= */

function speakConversation(
    text
) {

    return new Promise(
        resolve => {

            const message =
                String(text || "")
                    .trim();


            if (!message) {

                resolve();

                return;

            }


            if (!voiceReady) {

                initializeConversationVoice();

            }


            if (
                !("speechSynthesis" in window)
            ) {

                setConversationState(
                    "idle"
                );

                resolve();

                return;

            }


            const voice =
                getSelectedVoice();


            if (!voice) {

                setConversationState(
                    "idle"
                );

                setConversationText(
                    "Voice playback is unavailable."
                );

                resolve();

                return;

            }


            stopListening();


            speaking = true;

            thinking = false;


            setConversationState(
                "talking"
            );


            setConversationText(
                message
            );


            startVoiceWave();


            try {

                window.speechSynthesis.cancel();

                window.speechSynthesis.resume();

            } catch {}


            const utterance =
                new SpeechSynthesisUtterance(
                    message
                );


            utterance.voice =
                voice;


            utterance.rate =
                0.95;

            utterance.pitch =
                1;

            utterance.volume =
                1;


            utterance.onstart =
                () => {

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


                    const mode =
                        $("conversationMode");


                    if (
                        mode &&
                        mode.classList.contains(
                            "active"
                        )
                    ) {

                        setConversationState(
                            "listening"
                        );

                        setConversationText(
                            "Listening..."
                        );


                        setTimeout(
                            () => {

                                if (
                                    mode.classList.contains(
                                        "active"
                                    ) &&
                                    !speaking &&
                                    !thinking &&
                                    !listening &&
                                    !conversationPermissionBlocked
                                ) {

                                    startListening();

                                }

                            },
                            200
                        );

                    } else {

                        setConversationState(
                            "idle"
                        );

                    }


                    resolve();

                };


            utterance.onerror =
                event => {

                    speaking = false;

                    thinking = false;

                    stopVoiceWave();


                    console.warn(
                        "Speech synthesis:",
                        event.error
                    );


                    const mode =
                        $("conversationMode");


                    if (
                        mode &&
                        mode.classList.contains(
                            "active"
                        )
                    ) {

                        setConversationState(
                            "listening"
                        );

                        setConversationText(
                            "Listening..."
                        );


                        setTimeout(
                            () => {

                                if (
                                    mode.classList.contains(
                                        "active"
                                    ) &&
                                    !speaking &&
                                    !thinking &&
                                    !listening &&
                                    !conversationPermissionBlocked
                                ) {

                                    startListening();

                                }

                            },
                            250
                        );

                    }


                    resolve();

                };


            try {

                window.speechSynthesis
                    .speak(utterance);

            } catch (error) {

                speaking = false;

                thinking = false;

                stopVoiceWave();

                console.error(
                    "Speech failed:",
                    error
                );

                resolve();

            }

        }
    );

}


/* =========================================================
   TEST VOICE
========================================================= */

function setupTestVoice() {

    $("testVoiceButton")
        ?.addEventListener(
            "click",
            () => {

                initializeConversationVoice();


                const voice =
                    getSelectedVoice();


                if (!voice) {

                    setVoiceStatus(
                        "No voice is available."
                    );

                    return;

                }


                if (
                    !("speechSynthesis" in window)
                ) {

                    return;

                }


                try {

                    window.speechSynthesis.cancel();

                    window.speechSynthesis.resume();

                } catch {}


                const utterance =
                    new SpeechSynthesisUtterance(
                        "Hi. I'm MoonPlug."
                    );


                utterance.voice =
                    voice;

                utterance.rate =
                    .95;

                utterance.pitch =
                    1;

                utterance.volume =
                    1;


                window.speechSynthesis
                    .speak(
                        utterance
                    );

            }
        );

}


/* =========================================================
   STOP SPEAKING
========================================================= */

function stopSpeaking() {

    speaking = false;

    thinking = false;

    stopVoiceWave();


    if (
        "speechSynthesis" in window
    ) {

        try {

            window.speechSynthesis.cancel();

        } catch {}

    }

}


/* =========================================================
   VOICE WAVE
========================================================= */

function startVoiceWave() {

    animationRunning =
        true;


    const wave =
        $("voiceWave");

    if (!wave) return;

    wave.style.opacity =
        "1";

}


function stopVoiceWave() {

    animationRunning =
        false;


    const wave =
        $("voiceWave");

    if (!wave) return;

    wave.style.opacity =
        "";

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


    $("voiceSelect")
        ?.addEventListener(
            "change",
            event => {

                selectedVoiceName =
                    event.target.value;


                localStorage.setItem(
                    STORAGE_KEYS.voice,
                    selectedVoiceName
                );


                voiceReady =
                    Boolean(
                        getSelectedVoice()
                    );


                setVoiceStatus(
                    "Voice ready."
                );

            }
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

                        setTextSize(
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

function setTextSize(
    size
) {

    const body =
        document.body;


    body.classList.remove(
        "text-small",
        "text-medium",
        "text-large"
    );


    const validSizes = [
        "small",
        "medium",
        "large"
    ];


    if (
        !validSizes.includes(size)
    ) {

        size = "medium";

    }


    body.classList.add(
        `text-${size}`
    );


    localStorage.setItem(
        STORAGE_KEYS.textSize,
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

    const size =
        localStorage.getItem(
            STORAGE_KEYS.textSize
        ) ||
        "medium";


    setTextSize(
        size
    );

}


/* =========================================================
   VOICE STATUS
========================================================= */

function setVoiceStatus(
    text
) {

    const status =
        $("voiceStatus");

    if (!status) return;

    status.textContent =
        String(text || "");

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
   MODAL ESCAPE
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
            conversation?.classList.contains(
                "active"
            )
        ) {

            closeConversation();

            return;

        }


        closeSettings();

        closeAccount();

    }
);


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

            console.warn(
                "MoonPlug backend health check failed."
            );

            return;

        }


        console.log(
            "MoonPlug backend online."
        );

    } catch (error) {

        console.warn(
            "MoonPlug backend is unreachable:",
            error
        );

    }

}


/* =========================================================
   WINDOW RESIZE
========================================================= */

let starResizeTimer = null;


window.addEventListener(
    "resize",
    () => {

        clearTimeout(
            starResizeTimer
        );


        starResizeTimer =
            setTimeout(
                createStars,
                250
            );

    }
);
