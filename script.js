

/*
=============================================================
                     MOONPLUG AI
                 FRONTEND CONTROLLER
=============================================================

Connects the GitHub MoonPlug website to the local Python
backend.

Backend:
    http://127.0.0.1:5000

Security:
    - No owner password is stored in this file.
    - Login is handled by the Python backend.
    - Owner session is checked by the backend.
    - Owner routes require server authentication.

=============================================================
*/


// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE = "http://127.0.0.1:5000";


// ============================================================
// GLOBAL STATE
// ============================================================

let currentChat = [];

let isOwnerAuthenticated = false;

let currentTextSize = "medium";


// ============================================================
// DOM HELPERS
// ============================================================

function $(id) {
    return document.getElementById(id);
}


function showElement(element) {

    if (!element) {
        return;
    }

    element.style.display = "";
    element.setAttribute("aria-hidden", "false");
}


function hideElement(element) {

    if (!element) {
        return;
    }

    element.style.display = "none";
    element.setAttribute("aria-hidden", "true");
}


// ============================================================
// API REQUEST HELPER
// ============================================================

async function apiRequest(
    endpoint,
    options = {}
) {

    const url = `${API_BASE}${endpoint}`;

    const config = {
        ...options,

        credentials: "include",

        headers: {
            "Content-Type": "application/json",

            ...(options.headers || {})
        }
    };


    try {

        const response = await fetch(
            url,
            config
        );


        let data = null;


        try {

            data = await response.json();

        } catch {

            data = {
                success: false,
                error: "Server returned an invalid response."
            };

        }


        if (!response.ok) {

            const error = new Error(
                data.error ||
                `Request failed with status ${response.status}.`
            );

            error.status = response.status;

            error.data = data;

            throw error;
        }


        return data;

    } catch (error) {

        console.error(
            "MoonPlug API error:",
            error
        );

        throw error;
    }
}


// ============================================================
// BACKEND HEALTH CHECK
// ============================================================

async function checkBackendHealth() {

    try {

        const data = await apiRequest(
            "/api/health",
            {
                method: "GET"
            }
        );


        console.log(
            "MoonPlug backend:",
            data
        );


        return true;

    } catch (error) {

        console.warn(
            "MoonPlug backend is unavailable."
        );


        return false;
    }
}


// ============================================================
// OWNER SESSION CHECK
// ============================================================

async function checkOwnerSession() {

    try {

        const data = await apiRequest(
            "/api/owner/session",
            {
                method: "GET"
            }
        );


        isOwnerAuthenticated =
            data.authenticated === true;


        if (isOwnerAuthenticated) {

            console.log(
                "Owner session is active."
            );

        } else {

            console.log(
                "No owner session."
            );
        }


        return isOwnerAuthenticated;

    } catch (error) {

        isOwnerAuthenticated = false;

        return false;
    }
}


// ============================================================
// OWNER LOGIN
// ============================================================

async function loginOwner() {

    const codeInput = $("ownerCode");

    const errorElement = $("ownerError");

    const loginButton = $("ownerLoginButton");


    if (!codeInput) {

        console.error(
            "ownerCode element not found."
        );

        return;
    }


    const password =
        codeInput.value;


    if (!password) {

        if (errorElement) {

            errorElement.textContent =
                "Please enter the owner code.";
        }

        return;
    }


    if (password.length > 256) {

        if (errorElement) {

            errorElement.textContent =
                "Invalid owner code.";
        }

        return;
    }


    if (loginButton) {

        loginButton.disabled = true;

        loginButton.textContent =
            "Checking...";
    }


    if (errorElement) {

        errorElement.textContent = "";
    }


    try {

        const data = await apiRequest(
            "/api/owner/login",
            {
                method: "POST",

                body: JSON.stringify({
                    password: password
                })
            }
        );


        if (
            data.success &&
            data.authenticated
        ) {

            isOwnerAuthenticated = true;


            codeInput.value = "";


            hideOwnerLogin();


            await openOwnerPanel();


        } else {

            throw new Error(
                data.error ||
                "Owner login failed."
            );
        }


    } catch (error) {

        isOwnerAuthenticated = false;


        if (errorElement) {

            if (error.status === 429) {

                errorElement.textContent =
                    "Too many attempts. Please wait a few minutes.";

            } else {

                errorElement.textContent =
                    error.message ||
                    "Incorrect owner code.";
            }
        }


    } finally {

        if (loginButton) {

            loginButton.disabled = false;

            loginButton.textContent =
                "Enter";
        }
    }
}


// ============================================================
// OWNER LOGOUT
// ============================================================

async function logoutOwner() {

    try {

        await apiRequest(
            "/api/owner/logout",
            {
                method: "POST"
            }
        );

    } catch (error) {

        console.warn(
            "Logout request failed:",
            error
        );

    } finally {

        isOwnerAuthenticated = false;

        hideOwnerPanel();
    }
}


// ============================================================
// OWNER LOGIN UI
// ============================================================

function showOwnerLogin() {

    const overlay =
        $("ownerLogin");

    const errorElement =
        $("ownerError");

    const codeInput =
        $("ownerCode");


    if (!overlay) {
        return;
    }


    showElement(
        overlay
    );


    if (errorElement) {

        errorElement.textContent = "";
    }


    if (codeInput) {

        codeInput.value = "";

        setTimeout(
            () => codeInput.focus(),
            50
        );
    }
}


function hideOwnerLogin() {

    const overlay =
        $("ownerLogin");


    hideElement(
        overlay
    );
}


// ============================================================
// OWNER PANEL
// ============================================================

async function openOwnerPanel() {

    if (!isOwnerAuthenticated) {

        showOwnerLogin();

        return;
    }


    const panel =
        $("ownerPanel");


    if (!panel) {

        console.error(
            "Owner panel not found."
        );

        return;
    }


    showElement(
        panel
    );


    await loadOwnerDashboard();
}


function hideOwnerPanel() {

    const panel =
        $("ownerPanel");


    hideElement(
        panel
    );
}


// ============================================================
// OWNER DASHBOARD
// ============================================================

async function loadOwnerDashboard() {

    if (!isOwnerAuthenticated) {

        return;
    }


    try {

        const data =
            await apiRequest(
                "/api/owner/dashboard",
                {
                    method: "GET"
                }
            );


        if (!data.success) {

            return;
        }


        const stats =
            data.stats || {};


        const users =
            $("ownerUsers");

        const chats =
            $("ownerChats");


        if (users) {

            users.textContent =
                stats.users ?? 0;
        }


        if (chats) {

            chats.textContent =
                stats.chats ?? 0;
        }


        console.log(
            "Owner dashboard loaded:",
            data
        );


    } catch (error) {

        if (error.status === 401) {

            isOwnerAuthenticated =
                false;

            hideOwnerPanel();

            showOwnerLogin();

            return;
        }


        console.error(
            "Could not load owner dashboard:",
            error
        );
    }
}


// ============================================================
// LOAD TRAINING
// ============================================================

async function loadTraining() {

    if (!isOwnerAuthenticated) {

        return [];
    }


    try {

        const data =
            await apiRequest(
                "/api/owner/training",
                {
                    method: "GET"
                }
            );


        return data.training || [];


    } catch (error) {

        if (error.status === 401) {

            isOwnerAuthenticated =
                false;

            hideOwnerPanel();
        }


        return [];
    }
}


// ============================================================
// ADD TRAINING
// ============================================================

async function addTraining(
    question,
    answer,
    category = "general"
) {

    if (!isOwnerAuthenticated) {

        return {
            success: false,
            error: "Owner authentication required."
        };
    }


    try {

        const data =
            await apiRequest(
                "/api/owner/training",
                {
                    method: "POST",

                    body: JSON.stringify({
                        question,
                        answer,
                        category
                    })
                }
            );


        return data;


    } catch (error) {

        if (error.status === 401) {

            isOwnerAuthenticated =
                false;

            hideOwnerPanel();
        }


        return {
            success: false,

            error:
                error.message ||
                "Could not add training."
        };
    }
}


// ============================================================
// DELETE TRAINING
// ============================================================

async function deleteTraining(
    trainingId
) {

    if (!isOwnerAuthenticated) {

        return {
            success: false,
            error: "Owner authentication required."
        };
    }


    try {

        const data =
            await apiRequest(
                `/api/owner/training/${encodeURIComponent(trainingId)}`,
                {
                    method: "DELETE"
                }
            );


        return data;


    } catch (error) {

        if (error.status === 401) {

            isOwnerAuthenticated =
                false;

            hideOwnerPanel();
        }


        return {
            success: false,

            error:
                error.message ||
                "Could not delete training."
        };
    }
}


// ============================================================
// OWNER USERS
// ============================================================

async function loadOwnerUsers() {

    if (!isOwnerAuthenticated) {

        return [];
    }


    try {

        const data =
            await apiRequest(
                "/api/owner/users",
                {
                    method: "GET"
                }
            );


        return data.users || [];


    } catch (error) {

        if (error.status === 401) {

            isOwnerAuthenticated =
                false;

            hideOwnerPanel();
        }


        return [];
    }
}


// ============================================================
// OWNER SETTINGS
// ============================================================

async function loadOwnerSettings() {

    if (!isOwnerAuthenticated) {

        return null;
    }


    try {

        const data =
            await apiRequest(
                "/api/owner/settings",
                {
                    method: "GET"
                }
            );


        return data.settings || null;


    } catch (error) {

        return null;
    }
}


async function updateOwnerSettings(
    settings
) {

    if (!isOwnerAuthenticated) {

        return {
            success: false,
            error: "Owner authentication required."
        };
    }


    try {

        return await apiRequest(
            "/api/owner/settings",
            {
                method: "POST",

                body: JSON.stringify(
                    settings
                )
            }
        );


    } catch (error) {

        if (error.status === 401) {

            isOwnerAuthenticated =
                false;

            hideOwnerPanel();
        }


        return {
            success: false,

            error:
                error.message ||
                "Could not update settings."
        };
    }
}


// ============================================================
// CHAT UI
// ============================================================

function removeEmptyChat() {

    const empty =
        document.querySelector(
            ".empty-chat"
        );


    if (empty) {

        empty.remove();
    }
}


function addMessage(
    text,
    sender
) {

    const messages =
        $("messages");


    if (!messages) {

        return;
    }


    removeEmptyChat();


    const message =
        document.createElement(
            "div"
        );


    message.className =
        `message ${sender}`;


    const content =
        document.createElement(
            "div"
        );


    content.className =
        "message-content";


    content.textContent =
        text;


    message.appendChild(
        content
    );


    messages.appendChild(
        message
    );


    messages.scrollTop =
        messages.scrollHeight;
}


// ============================================================
// TYPING INDICATOR
// ============================================================

function showTyping() {

    const typing =
        $("typing");


    if (typing) {

        typing.style.display =
            "block";
    }
}


function hideTyping() {

    const typing =
        $("typing");


    if (typing) {

        typing.style.display =
            "none";
    }
}


// ============================================================
// LOCAL CHAT
// ============================================================

async function sendMessage() {

    const input =
        $("messageInput");

    if (!input) {

        return;
    }


    const message =
        input.value.trim();


    if (!message) {

        return;
    }


    input.value = "";


    addMessage(
        message,
        "user"
    );


    currentChat.push({
        role: "user",
        content: message
    });


    showTyping();


    /*
        The current Python backend is primarily an
        owner/training backend.

        It does not yet provide a public AI generation
        endpoint, so we don't pretend that it does.

        For now, MoonPlug gives a clear response.
    */


    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                500
            )
    );


    hideTyping();


    const response =
        "I'm connected to the MoonPlug backend. The AI chat engine can be connected next.";


    addMessage(
        response,
        "assistant"
    );


    currentChat.push({
        role: "assistant",
        content: response
    });
}


// ============================================================
// NEW CHAT
// ============================================================

function startNewChat() {

    const messages =
        $("messages");


    if (!messages) {

        return;
    }


    currentChat = [];


    messages.innerHTML = `
        <div class="empty-chat">
            <h1>What can I help with?</h1>
            <p>Ask MoonPlug anything.</p>
        </div>
    `;
}


// ============================================================
// SETTINGS
// ============================================================

function openSettings() {

    showElement(
        $("settingsPanel")
    );
}


function closeSettings() {

    hideElement(
        $("settingsPanel")
    );
}


function updateTextSize(
    size
) {

    currentTextSize =
        size;


    document.body.dataset.textSize =
        size;


    document
        .querySelectorAll(
            ".size-button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.size === size
                );

            }
        );


    localStorage.setItem(
        "moonplug_text_size",
        size
    );
}


function loadTextSize() {

    const saved =
        localStorage.getItem(
            "moonplug_text_size"
        );


    if (
        saved === "small" ||
        saved === "medium" ||
        saved === "large"
    ) {

        updateTextSize(
            saved
        );

    } else {

        updateTextSize(
            "medium"
        );
    }
}


// ============================================================
// ACCOUNT SCREEN
// ============================================================

function openAccount() {

    showElement(
        $("accountScreen")
    );
}


function closeAccount() {

    hideElement(
        $("accountScreen")
    );
}


// ============================================================
// ACCOUNT TABS
// ============================================================

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

        loginForm.style.display =
            "flex";
    }


    if (signupForm) {

        signupForm.style.display =
            "none";
    }


    loginTab?.classList.add(
        "active"
    );

    signupTab?.classList.remove(
        "active"
    );
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

        loginForm.style.display =
            "none";
    }


    if (signupForm) {

        signupForm.style.display =
            "flex";
    }


    loginTab?.classList.remove(
        "active"
    );

    signupTab?.classList.add(
        "active"
    );
}


// ============================================================
// PUBLIC ACCOUNT FORMS
// ============================================================

function setupAccountForms() {

    const loginForm =
        $("loginForm");


    const signupForm =
        $("signupForm");


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const message =
                    $("accountMessage");


                if (message) {

                    message.textContent =
                        "Public accounts are not connected yet.";
                }

            }
        );
    }


    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const message =
                    $("accountMessage");


                if (message) {

                    message.textContent =
                        "Public accounts are not connected yet.";
                }

            }
        );
    }
}


// ============================================================
// BUTTON EVENTS
// ============================================================

function setupButtons() {

    $("sendButton")?.addEventListener(
        "click",
        sendMessage
    );


    $("messageInput")?.addEventListener(
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


    $("newChatButton")?.addEventListener(
        "click",
        startNewChat
    );


    $("settingsButton")?.addEventListener(
        "click",
        openSettings
    );


    $("closeSettings")?.addEventListener(
        "click",
        closeSettings
    );

$("ownerButton")?.addEventListener(
    "click",
    () => {
        openAccount();
    }
);


    $("ownerLoginButton")?.addEventListener(
        "click",
        loginOwner
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


    $("ownerCancel")?.addEventListener(
        "click",
        hideOwnerLogin
    );


    $("ownerLogout")?.addEventListener(
        "click",
        logoutOwner
    );


    $("closeAccount")?.addEventListener(
        "click",
        closeAccount
    );


    $("loginTab")?.addEventListener(
        "click",
        showLoginTab
    );


    $("signupTab")?.addEventListener(
        "click",
        showSignupTab
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

                        updateTextSize(
                            button.dataset.size
                        );

                    }
                );

            }
        );
}


// ============================================================
// OWNER PANEL BUTTONS
// ============================================================

function setupOwnerPanelButtons() {

    $("manageUsersButton")?.addEventListener(
        "click",
        async () => {

            const users =
                await loadOwnerUsers();


            alert(
                `MoonPlug currently has ${users.length} user(s).`
            );
        }
    );


    $("manageChatsButton")?.addEventListener(
        "click",
        async () => {

            const dashboard =
                await apiRequest(
                    "/api/owner/dashboard",
                    {
                        method: "GET"
                    }
                );


            alert(
                `MoonPlug has ${dashboard.stats?.chats ?? 0} saved chat(s).`
            );
        }
    );


    $("appSettingsButton")?.addEventListener(
        "click",
        async () => {

            const settings =
                await loadOwnerSettings();


            if (!settings) {

                alert(
                    "Could not load settings."
                );

                return;
            }


            alert(
                `Minimum match score: ${settings.minimum_score}`
                +
                `\nRemember conversations: ${settings.remember_conversations}`
            );
        }
    );


    $("trainerButton")?.addEventListener(
        "click",
        async () => {

            const training =
                await loadTraining();


            alert(
                `MoonPlug has ${training.length} training example(s).`
            );
        }
    );
}


// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                hideOwnerLogin();

                closeSettings();

                closeAccount();
            }
        }
    );
}


// ============================================================
// INITIALIZATION
// ============================================================

async function initializeMoonPlug() {

    console.log(
        "🌙 MoonPlug AI starting..."
    );


    setupButtons();

    setupOwnerPanelButtons();

    setupAccountForms();

    setupKeyboardShortcuts();

    loadTextSize();


    /*
        Check the backend without blocking
        the entire website.
    */

    const backendOnline =
        await checkBackendHealth();


    if (backendOnline) {

        console.log(
            "✓ MoonPlug backend online."
        );

    } else {

        console.warn(
            "⚠ MoonPlug backend unavailable."
        );
    }


    /*
        Check whether an owner session already exists.
    */

    await checkOwnerSession();


    /*
        Make sure protected screens are hidden
        when the page first loads.
    */

    hideOwnerLogin();

    hideOwnerPanel();


    console.log(
        "✓ MoonPlug ready."
    );
}


// ============================================================
// START
// ============================================================

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

document.addEventListener("DOMContentLoaded", function () {

    const accountButton = document.getElementById("ownerButton");
    const accountScreen = document.getElementById("accountScreen");

    if (!accountButton) {
        console.error("MoonPlug: Account button not found.");
        return;
    }

    if (!accountScreen) {
        console.error("MoonPlug: Account screen not found.");
        return;
    }

    accountButton.onclick = function () {

        accountScreen.style.display = "flex";
        accountScreen.setAttribute("aria-hidden", "false");

    };

});
// ============================================================
// HIDDEN OWNER LOGIN TRIGGER
// Trigger: 15912014 typed into the normal chat box
// ============================================================

const messageInput = document.getElementById("messageInput");

if (messageInput) {

    messageInput.addEventListener("input", function () {

        const value = messageInput.value.trim();

        if (value === "15912014") {

            // Clear the code so it isn't sent as a chat message
            messageInput.value = "";

            // Open the hidden owner login
            const ownerLogin =
                document.getElementById("ownerLogin");

            if (ownerLogin) {

                ownerLogin.style.display = "flex";

                ownerLogin.setAttribute(
                    "aria-hidden",
                    "false"
                );

                const ownerCode =
                    document.getElementById("ownerCode");

                if (ownerCode) {

                    ownerCode.value = "";

                    setTimeout(function () {
                        ownerCode.focus();
                    }, 100);
                }

            } else {

                console.error(
                    "MoonPlug: ownerLogin element not found."
                );

            }
        }

    });

}
