
/* =========================================================
   MOONPLUG AI
   COMPLETE FRONTEND SCRIPT
   GALAXY + MOON/PLUG RESPONSE ANIMATION
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE =
    "https://moonplug.onrender.com";

const STORAGE_KEYS = {
    theme: "moonplug_theme",
    textSize: "moonplug_text_size",
    history: "moonplug_chat_history"
};


/* =========================================================
   GLOBAL STATE
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

    const starField =
        $("starField");

    if (!starField) {

        console.error(
            "MoonPlug: starField element not found."
        );

        return;
    }

    starField.innerHTML = "";

    const width =
        window.innerWidth;

    let starCount;

    if (width <= 600) {

        starCount = 170;

    } else if (width <= 1200) {

        starCount = 240;

    } else {

        starCount = 320;
    }


    for (
        let i = 0;
        i < starCount;
        i++
    ) {

        const star =
            document.createElement("span");

        star.className =
            "random-star";


        star.style.setProperty(
            "--star-size",
            `${Math.random() * 2.3 + 0.7}px`
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
            `${Math.random() * 0.65 + 0.30}`
        );


        star.style.setProperty(
            "--star-glow",
            `${Math.random() * 5 + 2}px`
        );


        star.style.setProperty(
            "--star-scale",
            `${Math.random() * 0.65 + 0.75}`
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


        starField.appendChild(
            star
        );
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

    if (!sidebar || !logo) {
        return;
    }

    logo.addEventListener(
        "click",
        () => {

            if (
                window.innerWidth <= 1200
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
}


/* =========================================================
   EMPTY CHAT
========================================================= */

function removeEmptyChat() {

    const empty =
        document.querySelector(
            ".empty-chat"
        );

    if (empty) {
        empty.remove();
    }
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

    if (!messages) {
        return;
    }

    removeEmptyChat();


    const bubble =
        document.createElement("div");


    bubble.className =
        `message-bubble ${type}`;


    bubble.textContent =
        text;


    messages.appendChild(
        bubble
    );


    messages.scrollTop =
        messages.scrollHeight;


    return bubble;
}


/* =========================================================
   CREATE AI THINKING ANIMATION
========================================================= */

function createThinkingAnimation() {

    const typing =
        $("typing");

    if (!typing) {
        return null;
    }


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


    typing.classList.remove(
        "animating-out"
    );


    return typing;
}


/* =========================================================
   WAIT
========================================================= */

function wait(ms) {

    return new Promise(
        resolve => {
            setTimeout(
                resolve,
                ms
            );
        }
    );
}


/* =========================================================
   MOON + PLUG ANIMATION
========================================================= */

async function playMoonPlugAnimation() {

    if (animationRunning) {
        return;
    }

    animationRunning = true;


    const typing =
        createThinkingAnimation();


    if (!typing) {

        animationRunning = false;

        return;
    }


    typing.style.display =
        "block";

    typing.setAttribute(
        "aria-hidden",
        "false"
    );


    const messages =
        $("messages");


    if (messages) {

        messages.scrollTop =
            messages.scrollHeight;
    }


    /*
       STEP 1
       Let the moon appear first.
    */

    await wait(450);


    /*
       STEP 2
       Plug slowly rises.
       CSS animation handles the movement.
    */

    await wait(2500);


    /*
       STEP 3
       Plug has reached the moon.
       Give the connection a moment.
    */

    await wait(700);


    /*
       STEP 4
       Fade the entire animation away.
    */

    typing.classList.add(
        "animating-out"
    );


    await wait(280);


    /*
       STEP 5
       Remove animation completely.
    */

    typing.style.display =
        "none";

    typing.setAttribute(
        "aria-hidden",
        "true"
    );

    typing.innerHTML =
        "";


    animationRunning = false;
}


/* =========================================================
   SHOW TYPING
========================================================= */

function showTyping() {

    createThinkingAnimation();

    const typing =
        $("typing");

    if (!typing) {
        return;
    }

    typing.style.display =
        "block";

    typing.setAttribute(
        "aria-hidden",
        "false"
    );


    const messages =
        $("messages");

    if (messages) {

        messages.scrollTop =
            messages.scrollHeight;
    }
}


/* =========================================================
   HIDE TYPING
========================================================= */

function hideTyping() {

    const typing =
        $("typing");

    if (!typing) {
        return;
    }

    typing.style.display =
        "none";

    typing.setAttribute(
        "aria-hidden",
        "true"
    );

    typing.innerHTML =
        "";

    animationRunning = false;
}


/* =========================================================
   INPUT
========================================================= */

function setupInput() {

    const input =
        $("messageInput");

    const sendButton =
        $("sendButton");


    if (!input || !sendButton) {
        return;
    }


    input.addEventListener(
        "input",
        () => {

            autoResizeInput();

            sendButton.disabled =
                !input.value.trim();
        }
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


    sendButton.addEventListener(
        "click",
        sendMessage
    );


    sendButton.disabled =
        true;
}


/* =========================================================
   AUTO RESIZE INPUT
========================================================= */

function autoResizeInput() {

    const input =
        $("messageInput");

    if (!input) {
        return;
    }

    input.style.height =
        "auto";


    const height =
        Math.min(
            input.scrollHeight,
            180
        );


    input.style.height =
        `${height}px`;
}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (isSending) {
        return;
    }


    const input =
        $("messageInput");

    const sendButton =
        $("sendButton");


    if (!input) {
        return;
    }


    const message =
        input.value.trim();


    if (!message) {
        return;
    }


    isSending = true;


    if (sendButton) {

        sendButton.disabled =
            true;
    }


    addMessage(
        message,
        "user"
    );


    currentChat.push({

        role: "user",

        content: message
    });


    saveHistory();


    input.value =
        "";

    autoResizeInput();


    /*
       START THE ANIMATION
    */

    showTyping();


    /*
       Start animation immediately.
       We don't await it yet because
       the backend request should happen
       at the same time.
    */

    const animationPromise =
        playMoonPlugAnimation();


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

                        message:
                            message,

                        history:
                            currentChat
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
                `Server error ${response.status}`
            );
        }


        let aiResponse =
            data.response;


        if (
            typeof aiResponse !==
            "string"
        ) {

            aiResponse =
                "MoonPlug received an invalid response.";
        }


        aiResponse =
            aiResponse.trim();


        if (!aiResponse) {

            aiResponse =
                "MoonPlug didn't return a response.";
        }


        /*
           WAIT UNTIL THE MOON/PLUG
           ANIMATION HAS COMPLETELY FINISHED.
        */

        await animationPromise;


        /*
           NOW THE AI TEXT APPEARS.
        */

        addMessage(
            aiResponse,
            "ai"
        );


        currentChat.push({

            role: "assistant",

            content:
                aiResponse
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


    const messages =
        $("messages");


    if (!messages) {
        return;
    }


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


    const input =
        $("messageInput");


    if (input) {

        input.value =
            "";

        autoResizeInput();

        input.focus();
    }


    saveHistory();
}


/* =========================================================
   CHAT HISTORY
========================================================= */

function saveHistory() {

    try {

        localStorage.setItem(
            STORAGE_KEYS.history,
            JSON.stringify(
                currentChat
            )
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


        if (!saved) {
            return;
        }


        const history =
            JSON.parse(saved);


        if (!Array.isArray(history)) {
            return;
        }


        currentChat =
            history;


        if (
            history.length === 0
        ) {
            return;
        }


        const messages =
            $("messages");


        if (!messages) {
            return;
        }


        messages.innerHTML =
            "";


        history.forEach(
            item => {

                if (
                    !item ||
                    typeof item !==
                    "object"
                ) {
                    return;
                }


                if (
                    item.role !==
                    "user" &&
                    item.role !==
                    "assistant"
                ) {
                    return;
                }


                if (
                    typeof item.content !==
                    "string"
                ) {
                    return;
                }


                addMessage(
                    item.content,

                    item.role === "user"
                        ? "user"
                        : "ai"
                );
            }
        );


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

    const panel =
        $("settingsPanel");

    if (!panel) {
        return;
    }

    panel.style.display =
        "flex";

    panel.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeSettings() {

    const panel =
        $("settingsPanel");

    if (!panel) {
        return;
    }

    panel.style.display =
        "none";

    panel.setAttribute(
        "aria-hidden",
        "true"
    );
}


function setupSettings() {

    const settingsButton =
        $("settingsButton");

    const closeButton =
        $("closeSettings");

    const themeButton =
        $("themeButton");


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


/* =========================================================
   THEME
========================================================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            STORAGE_KEYS.theme
        ) || "dark";


    if (theme === "light") {

        document.body.classList.add(
            "light-theme"
        );

    } else {

        document.body.classList.remove(
            "light-theme"
        );
    }


    updateThemeButton();
}


function toggleTheme() {

    const isLight =
        document.body.classList.contains(
            "light-theme"
        );


    if (isLight) {

        document.body.classList.remove(
            "light-theme"
        );

        localStorage.setItem(
            STORAGE_KEYS.theme,
            "dark"
        );

    } else {

        document.body.classList.add(
            "light-theme"
        );

        localStorage.setItem(
            STORAGE_KEYS.theme,
            "light"
        );
    }


    updateThemeButton();
}


function updateThemeButton() {

    const button =
        $("themeButton");


    if (!button) {
        return;
    }


    const isLight =
        document.body.classList.contains(
            "light-theme"
        );


    button.textContent =
        isLight
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
            STORAGE_KEYS.textSize
        ) || "medium";


    updateTextSize(
        saved
    );
}


/* =========================================================
   ACCOUNT
========================================================= */

function openAccount() {

    const screen =
        $("accountScreen");

    if (!screen) {
        return;
    }

    screen.style.display =
        "flex";

    screen.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeAccount() {

    const screen =
        $("accountScreen");

    if (!screen) {
        return;
    }

    screen.style.display =
        "none";

    screen.setAttribute(
        "aria-hidden",
        "true"
    );
}


function showLoginTab() {

    const loginForm =
        $("loginForm");

    const signupForm =
        $("signupForm");

    const loginTab =
        $("loginTab");

    const signupTab =
        $("signupTab");


    if (loginForm) {
        loginForm.hidden =
            false;
    }

    if (signupForm) {
        signupForm.hidden =
            true;
    }

    if (loginTab) {
        loginTab.classList.add(
            "active"
        );
    }

    if (signupTab) {
        signupTab.classList.remove(
            "active"
        );
    }
}


function showSignupTab() {

    const loginForm =
        $("loginForm");

    const signupForm =
        $("signupForm");

    const loginTab =
        $("loginTab");

    const signupTab =
        $("signupTab");


    if (loginForm) {
        loginForm.hidden =
            true;
    }

    if (signupForm) {
        signupForm.hidden =
            false;
    }

    if (loginTab) {
        loginTab.classList.remove(
            "active"
        );
    }

    if (signupTab) {
        signupTab.classList.add(
            "active"
        );
    }
}


/* =========================================================
   ACCOUNT FORMS
========================================================= */

function setupAccountForms() {

    const accountButton =
        $("ownerButton");

    const closeButton =
        $("closeAccount");

    const loginTab =
        $("loginTab");

    const signupTab =
        $("signupTab");

    const loginForm =
        $("loginForm");

    const signupForm =
        $("signupForm");


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

                const message =
                    $("accountMessage");


                if (message) {

                    message.textContent =
                        "Account login will be connected to the backend next.";
                }
            }
        );
    }


    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const password =
                    $("signupPassword");

                const confirm =
                    $("signupConfirm");

                const message =
                    $("accountMessage");


                if (
                    password &&
                    confirm &&
                    password.value !==
                    confirm.value
                ) {

                    if (message) {

                        message.textContent =
                            "Passwords do not match.";
                    }

                    return;
                }


                if (message) {

                    message.textContent =
                        "Account creation will be connected to the backend next.";
                }
            }
        );
    }
}


/* =========================================================
   HIDDEN OWNER LOGIN
========================================================= */

function showOwnerLogin() {

    const overlay =
        $("ownerLogin");


    if (!overlay) {
        return;
    }


    overlay.style.display =
        "flex";


    overlay.setAttribute(
        "aria-hidden",
        "false"
    );


    const code =
        $("ownerCode");


    if (code) {

        code.value =
            "";

        code.focus();
    }


    const error =
        $("ownerError");


    if (error) {

        error.textContent =
            "";
    }
}


function hideOwnerLogin() {

    const overlay =
        $("ownerLogin");


    if (!overlay) {
        return;
    }


    overlay.style.display =
        "none";


    overlay.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   OWNER LOGIN
========================================================= */

async function loginOwner() {

    const code =
        $("ownerCode");

    const error =
        $("ownerError");


    if (!code) {
        return;
    }


    const ownerCode =
        code.value.trim();


    if (!ownerCode) {

        if (error) {

            error.textContent =
                "Enter the owner code.";
        }

        return;
    }


    if (error) {

        error.textContent =
            "Checking owner access...";
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/api/owner/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials:
                        "include",

                    body: JSON.stringify({
                        code:
                            ownerCode
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
                "Owner login failed."
            );
        }


        ownerAuthenticated =
            true;


        hideOwnerLogin();

        openOwnerPanel();

        loadOwnerDashboard();


    } catch (err) {

        console.error(
            "Owner login error:",
            err
        );


        if (error) {

            error.textContent =
                err.message ||
                "Owner login failed.";
        }
    }
}


/* =========================================================
   OWNER PANEL
========================================================= */

function openOwnerPanel() {

    const panel =
        $("ownerPanel");


    if (!panel) {
        return;
    }


    panel.style.display =
        "flex";


    panel.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeOwnerPanel() {

    const panel =
        $("ownerPanel");


    if (!panel) {
        return;
    }


    panel.style.display =
        "none";


    panel.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   OWNER LOGOUT
========================================================= */

async function logoutOwner() {

    try {

        await fetch(
            `${API_BASE}/api/owner/logout`,
            {
                method: "POST",

                credentials:
                    "include"
            }
        );

    } catch (error) {

        console.error(
            "Owner logout error:",
            error
        );
    }


    ownerAuthenticated =
        false;


    closeOwnerPanel();
}


/* =========================================================
   OWNER DASHBOARD
========================================================= */

async function loadOwnerDashboard() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/owner/dashboard`,
                {
                    credentials:
                        "include"
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
                "Could not load dashboard."
            );
        }


        if (
            typeof data.users ===
            "number"
        ) {

            const users =
                $("ownerUsers");

            if (users) {

                users.textContent =
                    data.users;
            }
        }


        if (
            typeof data.chats ===
            "number"
        ) {

            const chats =
                $("ownerChats");

            if (chats) {

                chats.textContent =
                    data.chats;
            }
        }


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );
    }
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


        const online =
            response.ok;


        updateOnlineStatus(
            online
        );


        return online;


    } catch (error) {

        console.error(
            "Backend health error:",
            error
        );


        updateOnlineStatus(
            false
        );


        return false;
    }
}


function updateOnlineStatus(
    online
) {

    const onlineBox =
        document.querySelector(
            ".online"
        );


    const dot =
        document.querySelector(
            ".online-dot"
        );


    if (!onlineBox || !dot) {
        return;
    }


    if (online) {

        onlineBox.lastChild.textContent =
            " Online";

    } else {

        onlineBox.lastChild.textContent =
            " Offline";
    }
}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

function setupPasswordToggle() {

    const input =
        $("ownerCode");

    const button =
        $("showPassword");


    if (!input || !button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            if (
                input.type ===
                "password"
            ) {

                input.type =
                    "text";

                button.textContent =
                    "Hide";

            } else {

                input.type =
                    "password";

                button.textContent =
                    "Show";
            }
        }
    );
}


/* =========================================================
   HIDDEN OWNER TRIGGER
========================================================= */

function setupHiddenOwnerTrigger() {

    const input =
        $("messageInput");


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        () => {

            const value =
                input.value
                    .trim()
                    .toLowerCase();


            if (
                value ===
                "moonplug-owner"
            ) {

                input.value =
                    "";

                showOwnerLogin();
            }
        }
    );
}


/* =========================================================
   OWNER CONTROLS
========================================================= */

function setupOwnerControls() {

    const loginButton =
        $("ownerLoginButton");

    const cancelButton =
        $("ownerCancel");

    const logoutButton =
        $("ownerLogout");

    const ownerCode =
        $("ownerCode");


    if (loginButton) {

        loginButton.addEventListener(
            "click",
            loginOwner
        );
    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            hideOwnerLogin
        );
    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logoutOwner
        );
    }


    if (ownerCode) {

        ownerCode.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    loginOwner();
                }
            }
        );
    }
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


function generateTraining() {

    const message =
        $("ownerActionMessage");


    if (message) {

        message.textContent =
            "Training generation is ready to connect to the backend.";
    }
}


function loadAndRenderTraining() {}


function teachMoonPlug() {}


function refreshTraining() {

    loadAndRenderTraining();
}


function setupTrainer() {

    const trainerButton =
        $("trainerButton");


    if (trainerButton) {

        trainerButton.addEventListener(
            "click",
            openTrainer
        );
    }
}


/* =========================================================
   SIDEBAR BUTTONS
========================================================= */

function setupSidebarButtons() {

    const newChat =
        $("newChatButton");

    const learn =
        $("learnButton");

    const study =
        $("studyButton");

    const cook =
        $("cookButton");

    const images =
        $("imagesButton");

    const code =
        $("codeButton");

    const switchButton =
        $("switchButton");

    const history =
        $("historyButton");


    if (newChat) {

        newChat.addEventListener(
            "click",
            startNewChat
        );
    }


    if (learn) {

        learn.addEventListener(
            "click",
            () => {

                addMessage(
                    "AI Learn is coming soon.",
                    "ai"
                );
            }
        );
    }


    if (study) {

        study.addEventListener(
            "click",
            () => {

                addMessage(
                    "Study mode is coming soon.",
                    "ai"
                );
            }
        );
    }


    if (cook) {

        cook.addEventListener(
            "click",
            () => {

                addMessage(
                    "Cook mode is coming soon.",
                    "ai"
                );
            }
        );
    }


    if (images) {

        images.addEventListener(
            "click",
            () => {

                addMessage(
                    "Image mode is coming soon.",
                    "ai"
                );
            }
        );
    }


    if (code) {

        code.addEventListener(
            "click",
            () => {

                addMessage(
                    "Code mode is coming soon.",
                    "ai"
                );
            }
        );
    }


    if (switchButton) {

        switchButton.addEventListener(
            "click",
            () => {

                addMessage(
                    "AI switching is coming soon.",
                    "ai"
                );
            }
        );
    }


    if (history) {

        history.addEventListener(
            "click",
            () => {

                addMessage(
                    "Your current conversation is saved locally.",
                    "ai"
                );
            }
        );
    }
}


/* =========================================================
   ESCAPE
========================================================= */

function setupEscapeKey() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }


            closeSettings();

            closeAccount();

            hideOwnerLogin();

            closeOwnerPanel();
        }
    );
}


/* =========================================================
   RESIZE
========================================================= */

function setupResize() {

    let resizeTimer;


    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    createStarField,
                    200
                );
        }
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
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeMoonPlug
    );

} else {

    initializeMoonPlug();
}

