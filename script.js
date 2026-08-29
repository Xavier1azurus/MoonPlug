/* =========================================================
   MOONPLUG AI — COMPLETE SCRIPT
========================================================= */

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const API_BASE = "https://moonplug.onrender.com";

const STORAGE_KEYS = {
    theme: "moonplug_theme",
    textSize: "moonplug_text_size",
    history: "moonplug_chat_history"
};


/* =========================================================
   STATE
========================================================= */

let ownerAuthenticated = false;
let currentChat = [];
let isSending = false;
let animationRunning = false;


/* =========================================================
   DOM HELPER
========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   STAR FIELD
========================================================= */

function createStarField() {

    const starField = $("starField");

    if (!starField) return;

    starField.innerHTML = "";

    const width = window.innerWidth;

    let starCount = 320;

    if (width <= 600) {
        starCount = 170;
    } else if (width <= 1200) {
        starCount = 240;
    }

    for (let i = 0; i < starCount; i++) {

        const star = document.createElement("span");

        star.className = "random-star";

        star.style.setProperty(
            "--star-size",
            `${Math.random() * 2.3 + .7}px`
        );

        star.style.setProperty(
            "--star-x",
            `${Math.random() * 100}%`
        );

        star.style.setProperty(
            "--star-y",
            `${Math.random() * 100}%`
        );

        star.style.setProperty(
            "--star-opacity",
            `${Math.random() * .65 + .30}`
        );

        star.style.setProperty(
            "--star-glow",
            `${Math.random() * 5 + 2}px`
        );

        star.style.setProperty(
            "--star-scale",
            `${Math.random() * .65 + .75}`
        );

        star.style.setProperty(
            "--star-move-x",
            `${Math.random() * 8 - 4}px`
        );

        star.style.setProperty(
            "--star-move-y",
            `${Math.random() * 8 - 4}px`
        );

        star.style.setProperty(
            "--star-duration",
            `${Math.random() * 4 + 3}s`
        );

        star.style.setProperty(
            "--star-delay",
            `${Math.random() * 5}s`
        );

        starField.appendChild(star);
    }
}


/* =========================================================
   SIDEBAR
========================================================= */

function setupSidebar() {

    const sidebar = $("sidebar");
    const logo = $("sidebarLogo");

    if (!sidebar || !logo) return;

    logo.addEventListener("click", () => {

        if (window.innerWidth <= 1200) {

            sidebar.classList.toggle("expanded");

        } else {

            sidebar.classList.toggle("collapsed");
        }
    });
}


/* =========================================================
   MESSAGES
========================================================= */

function removeEmptyChat() {

    const empty = document.querySelector(".empty-chat");

    if (empty) empty.remove();
}


function addMessage(text, type) {

    const messages = $("messages");

    if (!messages) return;

    removeEmptyChat();

    const bubble = document.createElement("div");

    bubble.className =
        `message-bubble ${type}`;

    bubble.textContent = text;

    messages.appendChild(bubble);

    messages.scrollTop =
        messages.scrollHeight;

    return bubble;
}


/* =========================================================
   THINKING ANIMATION
========================================================= */

function createThinkingAnimation() {

    const typing = $("typing");

    if (!typing) return null;

    typing.innerHTML = `
        <div class="moonplug-animation">

            <div class="animation-moon">
                🌙
            </div>

            <div class="animation-plug">
                🔌
            </div>

            <div class="plug-glow"></div>

            <div class="typing-text">
                MoonPlug is thinking
            </div>

        </div>
    `;

    typing.classList.remove("animating-out");

    return typing;
}


function wait(ms) {

    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}


async function playMoonPlugAnimation() {

    if (animationRunning) return;

    animationRunning = true;

    const typing = createThinkingAnimation();

    if (!typing) {
        animationRunning = false;
        return;
    }

    typing.style.display = "block";
    typing.setAttribute("aria-hidden", "false");

    const messages = $("messages");

    if (messages) {
        messages.scrollTop =
            messages.scrollHeight;
    }

    await wait(450);
    await wait(2800);
    await wait(900);

    typing.classList.add("animating-out");

    await wait(280);

    typing.style.display = "none";
    typing.setAttribute("aria-hidden", "true");

    typing.innerHTML = "";

    animationRunning = false;
}


function showTyping() {

    createThinkingAnimation();

    const typing = $("typing");

    if (!typing) return;

    typing.style.display = "block";
    typing.setAttribute("aria-hidden", "false");
}


function hideTyping() {

    const typing = $("typing");

    if (!typing) return;

    typing.style.display = "none";
    typing.setAttribute("aria-hidden", "true");

    typing.innerHTML = "";

    animationRunning = false;
}


/* =========================================================
   INPUT
========================================================= */

function setupInput() {

    const input = $("messageInput");
    const sendButton = $("sendButton");

    if (!input || !sendButton) return;

    input.addEventListener("input", () => {

        autoResizeInput();

        sendButton.disabled =
            !input.value.trim();
    });

    input.addEventListener("keydown", event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    });

    sendButton.addEventListener(
        "click",
        sendMessage
    );

    sendButton.disabled = true;
}


function autoResizeInput() {

    const input = $("messageInput");

    if (!input) return;

    input.style.height = "auto";

    const height = Math.min(
        input.scrollHeight,
        180
    );

    input.style.height = `${height}px`;
}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (isSending) return;

    const input = $("messageInput");
    const sendButton = $("sendButton");

    if (!input) return;

    const message = input.value.trim();

    if (!message) return;

    isSending = true;

    if (sendButton) {
        sendButton.disabled = true;
    }

    addMessage(message, "user");

    currentChat.push({
        role: "user",
        content: message
    });

    saveHistory();

    input.value = "";

    autoResizeInput();

    showTyping();

    const animationPromise =
        playMoonPlugAnimation();

    try {

        const response = await fetch(
            `${API_BASE}/api/chat`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    message,
                    history: currentChat
                })
            }
        );

        let data;

        try {
            data = await response.json();
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
                `Server error ${response.status}`
            );
        }

        let aiResponse = data.response;

        if (typeof aiResponse !== "string") {
            aiResponse =
                "MoonPlug received an invalid response.";
        }

        aiResponse = aiResponse.trim();

        if (!aiResponse) {
            aiResponse =
                "MoonPlug didn't return a response.";
        }

        await animationPromise;

        addMessage(aiResponse, "ai");

        currentChat.push({
            role: "assistant",
            content: aiResponse
        });

        saveHistory();

    } catch (error) {

        console.error(
            "MoonPlug chat error:",
            error
        );

        hideTyping();

        addMessage(
            "I couldn't connect to the MoonPlug AI backend. Please check the backend URL and make sure the server is online.",
            "ai"
        );

    } finally {

        isSending = false;

        if (sendButton) {
            sendButton.disabled =
                !input.value.trim();
        }

        input.focus();
    }
}


/* =========================================================
   NEW CHAT
========================================================= */

function startNewChat() {

    currentChat = [];

    const messages = $("messages");

    if (!messages) return;

    messages.innerHTML = `
        <div class="empty-chat">

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

    const input = $("messageInput");

    if (input) {

        input.value = "";

        autoResizeInput();

        input.focus();
    }

    saveHistory();
}


/* =========================================================
   HISTORY
========================================================= */

function saveHistory() {

    try {

        localStorage.setItem(
            STORAGE_KEYS.history,
            JSON.stringify(currentChat)
        );

    } catch (error) {

        console.error(
            "Could not save chat history:",
            error
        );
    }
}


function loadHistory() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEYS.history
            );

        if (!saved) return;

        const history = JSON.parse(saved);

        if (!Array.isArray(history)) return;

        currentChat = history;

        if (!history.length) return;

        const messages = $("messages");

        if (!messages) return;

        messages.innerHTML = "";

        history.forEach(item => {

            if (!item || typeof item !== "object") {
                return;
            }

            if (
                item.role !== "user" &&
                item.role !== "assistant"
            ) {
                return;
            }

            if (typeof item.content !== "string") {
                return;
            }

            addMessage(
                item.content,
                item.role === "user"
                    ? "user"
                    : "ai"
            );
        });

    } catch (error) {

        console.error(
            "Could not load chat history:",
            error
        );
    }
}


/* =========================================================
   SETTINGS
========================================================= */

function openSettings() {

    const panel = $("settingsPanel");

    if (!panel) return;

    panel.style.display = "flex";
    panel.setAttribute("aria-hidden", "false");
}


function closeSettings() {

    const panel = $("settingsPanel");

    if (!panel) return;

    panel.style.display = "none";
    panel.setAttribute("aria-hidden", "true");
}


function setupSettings() {

    const settingsButton = $("settingsButton");
    const closeButton = $("closeSettings");
    const themeButton = $("themeButton");

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

    if (themeButton) {
        themeButton.addEventListener(
            "click",
            toggleTheme
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


/* =========================================================
   THEME
========================================================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            STORAGE_KEYS.theme
        ) || "dark";

    document.body.classList.toggle(
        "light-theme",
        theme === "light"
    );

    updateThemeButton();
}


function toggleTheme() {

    const isLight =
        document.body.classList.contains(
            "light-theme"
        );

    document.body.classList.toggle(
        "light-theme",
        !isLight
    );

    localStorage.setItem(
        STORAGE_KEYS.theme,
        isLight ? "dark" : "light"
    );

    updateThemeButton();
}


function updateThemeButton() {

    const button = $("themeButton");

    if (!button) return;

    button.textContent =
        document.body.classList.contains(
            "light-theme"
        )
            ? "Light"
            : "Dark";
}


/* =========================================================
   TEXT SIZE
========================================================= */

function updateTextSize(size) {

    if (
        size !== "small" &&
        size !== "medium" &&
        size !== "large"
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
        STORAGE_KEYS.textSize,
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

    updateTextSize(
        localStorage.getItem(
            STORAGE_KEYS.textSize
        ) || "medium"
    );
}


/* =========================================================
   ACCOUNT
========================================================= */

function openAccount() {

    const screen = $("accountScreen");

    if (!screen) return;

    screen.style.display = "flex";
    screen.setAttribute("aria-hidden", "false");
}


function closeAccount() {

    const screen = $("accountScreen");

    if (!screen) return;

    screen.style.display = "none";
    screen.setAttribute("aria-hidden", "true");
}


function showLoginTab() {

    $("loginForm").hidden = false;
    $("signupForm").hidden = true;

    $("loginTab").classList.add("active");
    $("signupTab").classList.remove("active");
}


function showSignupTab() {

    $("loginForm").hidden = true;
    $("signupForm").hidden = false;

    $("loginTab").classList.remove("active");
    $("signupTab").classList.add("active");
}


function setupAccountForms() {

    const accountButton = $("ownerButton");
    const closeButton = $("closeAccount");

    const loginTab = $("loginTab");
    const signupTab = $("signupTab");

    const loginForm = $("loginForm");
    const signupForm = $("signupForm");

    if (accountButton) {
        accountButton.addEventListener(
            "click",
            openAccount
        );
    }

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeAccount
        );
    }

    if (loginTab) {
        loginTab.addEventListener(
            "click",
            showLoginTab
        );
    }

    if (signupTab) {
        signupTab.addEventListener(
            "click",
            showSignupTab
        );
    }

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                $("accountMessage").textContent =
                    "Account login will be connected to the backend next.";
            }
        );
    }

    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const password = $("signupPassword");
                const confirm = $("signupConfirm");
                const message = $("accountMessage");

                if (
                    password.value !==
                    confirm.value
                ) {

                    message.textContent =
                        "Passwords do not match.";

                    return;
                }

                message.textContent =
                    "Account creation will be connected to the backend next.";
            }
        );
    }
}


/* =========================================================
   OWNER
========================================================= */

function showOwnerLogin() {

    const overlay = $("ownerLogin");

    if (!overlay) return;

    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");

    const code = $("ownerCode");

    if (code) {

        code.value = "";

        setTimeout(
            () => code.focus(),
            50
        );
    }

    $("ownerError").textContent = "";
}


function hideOwnerLogin() {

    const overlay = $("ownerLogin");

    if (!overlay) return;

    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
}


async function loginOwner() {

    const code = $("ownerCode");
    const error = $("ownerError");

    if (!code) return;

    const ownerCode = code.value.trim();

    if (!ownerCode) {

        error.textContent =
            "Enter the owner code.";

        return;
    }

    error.textContent =
        "Checking owner access...";

    try {

        const response = await fetch(
            `${API_BASE}/api/owner/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    code: ownerCode
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
                "Owner login failed."
            );
        }

        ownerAuthenticated = true;

        hideOwnerLogin();
        openOwnerPanel();
        loadOwnerDashboard();

    } catch (err) {

        console.error(
            "Owner login error:",
            err
        );

        error.textContent =
            err.message ||
            "Owner login failed.";
    }
}


function openOwnerPanel() {

    const panel = $("ownerPanel");

    if (!panel) return;

    panel.style.display = "flex";
    panel.setAttribute("aria-hidden", "false");
}


function closeOwnerPanel() {

    const panel = $("ownerPanel");

    if (!panel) return;

    panel.style.display = "none";
    panel.setAttribute("aria-hidden", "true");
}


async function logoutOwner() {

    try {

        await fetch(
            `${API_BASE}/api/owner/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        );

    } catch (error) {

        console.error(
            "Owner logout error:",
            error
        );
    }

    ownerAuthenticated = false;

    closeOwnerPanel();
}


async function loadOwnerDashboard() {

    try {

        const response = await fetch(
            `${API_BASE}/api/owner/dashboard`,
            {
                credentials: "include"
            }
        );

        const data =
            await response
                .json()
                .catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.error ||
                "Could not load dashboard."
            );
        }

        if (typeof data.users === "number") {
            $("ownerUsers").textContent =
                data.users;
        }

        if (typeof data.chats === "number") {
            $("ownerChats").textContent =
                data.chats;
        }

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );
    }
}


/* =========================================================
   OWNER CONTROLS
========================================================= */

function setupPasswordToggle() {

    const input = $("ownerCode");
    const button = $("showPassword");

    if (!input || !button) return;

    button.addEventListener(
        "click",
        () => {

            const visible =
                input.type === "text";

            input.type =
                visible
                    ? "password"
                    : "text";

            button.textContent =
                visible
                    ? "Show"
                    : "Hide";
        }
    );
}


function setupHiddenOwnerTrigger() {

    const input = $("messageInput");

    if (!input) return;

    input.addEventListener(
        "input",
        () => {

            if (
                input.value
                    .trim()
                    .toLowerCase() ===
                "moonplug-owner"
            ) {

                input.value = "";

                showOwnerLogin();
            }
        }
    );
}


function setupOwnerControls() {

    $("ownerLoginButton")?.addEventListener(
        "click",
        loginOwner
    );

    $("ownerCancel")?.addEventListener(
        "click",
        hideOwnerLogin
    );

    $("ownerLogout")?.addEventListener(
        "click",
        logoutOwner
    );

    $("ownerCode")?.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                loginOwner();
            }
        }
    );
}


/* =========================================================
   TRAINER
========================================================= */

function openTrainer() {

    const message =
        $("ownerActionMessage");

    if (message) {
        message.textContent =
            "Trainer controls are available from the owner backend.";
    }
}

function closeTrainer() {}

function generateTraining() {}

function loadAndRenderTraining() {}

function teachMoonPlug() {}

function refreshTraining() {
    loadAndRenderTraining();
}


function setupTrainer() {

    $("trainerButton")?.addEventListener(
        "click",
        openTrainer
    );
}


/* =========================================================
   SIDEBAR BUTTONS
========================================================= */

function setupSidebarButtons() {

    $("newChatButton")?.addEventListener(
        "click",
        startNewChat
    );

    $("studyButton")?.addEventListener(
        "click",
        () => addMessage(
            "Study mode is coming soon.",
            "ai"
        )
    );

    $("cookButton")?.addEventListener(
        "click",
        () => addMessage(
            "Cook mode is coming soon.",
            "ai"
        )
    );

    $("imagesButton")?.addEventListener(
        "click",
        () => addMessage(
            "Image mode is coming soon.",
            "ai"
        )
    );

    $("codeButton")?.addEventListener(
        "click",
        () => addMessage(
            "Code mode is coming soon.",
            "ai"
        )
    );

    $("historyButton")?.addEventListener(
        "click",
        () => addMessage(
            "Your current conversation is saved locally.",
            "ai"
        )
    );
}


/* =========================================================
   BACKEND
========================================================= */

async function checkBackendHealth() {

    try {

        const response = await fetch(
            `${API_BASE}/api/health`
        );

        updateOnlineStatus(response.ok);

        return response.ok;

    } catch (error) {

        console.error(
            "Backend health error:",
            error
        );

        updateOnlineStatus(false);

        return false;
    }
}


function updateOnlineStatus(online) {

    const onlineBox =
        document.querySelector(".online");

    if (!onlineBox) return;

    const dot =
        onlineBox.querySelector(".online-dot");

    if (dot) {
        dot.style.opacity =
            online ? "1" : ".45";
    }

    onlineBox.lastChild.textContent =
        online
            ? " Online"
            : " Offline";
}


/* =========================================================
   ESCAPE
========================================================= */

function setupEscapeKey() {

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }

            closeSettings();
            closeAccount();
            hideOwnerLogin();
            closeOwnerPanel();

            closeConversationMode();
        }
    );
}


/* =========================================================
   RESIZE
========================================================= */

function setupResize() {

    let timer;

    window.addEventListener(
        "resize",
        () => {

            clearTimeout(timer);

            timer = setTimeout(
                createStarField,
                200
            );
        }
    );
}


/* =========================================================
   MOBILE CONVERSATION MODE
========================================================= */

let conversationListening = false;

let conversationMode;
let moonOrb;
let conversationStatus;
let conversationText;
let conversationMic;
let conversationClose;


function cacheConversationElements() {

    conversationMode =
        $("conversationMode");

    moonOrb =
        $("moonOrb");

    conversationStatus =
        $("conversationStatus");

    conversationText =
        $("conversationText");

    conversationMic =
        $("conversationMic");

    conversationClose =
        $("conversationClose");
}


/* =========================================================
   OPEN
========================================================= */

function openConversationMode() {

    if (
        !conversationMode ||
        window.innerWidth > 1200
    ) {
        return;
    }

    conversationMode.classList.add("active");

    conversationMode.setAttribute(
        "aria-hidden",
        "false"
    );

    startConversationListening();
}


/* =========================================================
   CLOSE
========================================================= */

function closeConversationMode() {

    if (!conversationMode) return;

    conversationMode.classList.remove("active");

    conversationMode.setAttribute(
        "aria-hidden",
        "true"
    );

    conversationListening = false;

    moonOrb?.classList.remove("listening");
    moonOrb?.classList.remove("thinking");

    if (conversationStatus) {
        conversationStatus.textContent =
            "Listening...";
    }

    if (conversationText) {
        conversationText.textContent =
            "Talk to MoonPlug";
    }
}


/* =========================================================
   LISTENING
========================================================= */

function startConversationListening() {

    conversationListening = true;

    moonOrb?.classList.remove("thinking");
    moonOrb?.classList.add("listening");

    if (conversationStatus) {
        conversationStatus.textContent =
            "Listening...";
    }

    if (conversationText) {
        conversationText.textContent =
            "Talk to MoonPlug";
    }
}


/* =========================================================
   TOGGLE
========================================================= */

function toggleConversationListening() {

    if (!moonOrb) return;

    if (conversationListening) {

        conversationListening = false;

        moonOrb.classList.remove("listening");
        moonOrb.classList.add("thinking");

        if (conversationStatus) {
            conversationStatus.textContent =
                "Thinking...";
        }

        if (conversationText) {
            conversationText.textContent =
                "MoonPlug is thinking";
        }

        setTimeout(() => {

            if (
                !conversationMode ||
                !conversationMode.classList.contains("active")
            ) {
                return;
            }

            moonOrb.classList.remove("thinking");
            moonOrb.classList.add("listening");

            conversationListening = true;

            if (conversationStatus) {
                conversationStatus.textContent =
                    "Listening...";
            }

            if (conversationText) {
                conversationText.textContent =
                    "Talk to MoonPlug";
            }

        }, 1800);

    } else {

        startConversationListening();
    }
}


/* =========================================================
   CONVERSATION CONTROLS
========================================================= */

function setupConversationMode() {

    cacheConversationElements();

    if (!conversationMode) return;

    conversationClose?.addEventListener(
        "click",
        closeConversationMode
    );

    conversationMic?.addEventListener(
        "click",
        toggleConversationListening
    );
}


/* =========================================================
   INITIALIZE
========================================================= */

function initializeMoonPlug() {

    console.log(
        "MoonPlug AI starting..."
    );

    createStarField();

    setupSidebar();
    setupSidebarButtons();

    setupInput();

    setupSettings();
    setupAccountForms();

    setupPasswordToggle();
    setupOwnerControls();

    setupHiddenOwnerTrigger();

    setupTrainer();

    setupConversationMode();

    setupEscapeKey();
    setupResize();

    loadTheme();
    loadTextSize();
    loadHistory();

    hideTyping();
    hideOwnerLogin();
    closeSettings();
    closeAccount();
    closeOwnerPanel();

    checkBackendHealth();

    console.log(
        "MoonPlug AI initialized."
    );
}


/* =========================================================
   START
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeMoonPlug
    );

} else {

    initializeMoonPlug();
}
