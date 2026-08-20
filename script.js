
/*
=============================================================
                    MOONPLUG AI
              FRONTEND CONTROLLER
=============================================================

Backend:
    http://127.0.0.1:5000

Owner login:
    Hidden from normal users.
    Type 15912014 into the normal chat box.

The actual owner password is NOT stored here.
=============================================================
*/


// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE = "https://moonplug.onrender.com";


// ============================================================
// GLOBAL STATE
// ============================================================

let currentChat = [];

let isOwnerAuthenticated = false;

let currentTextSize = "medium";


// ============================================================
// DOM HELPER
// ============================================================

function $(id) {
    return document.getElementById(id);
}


// ============================================================
// SHOW / HIDE HELPERS
// ============================================================

function showElement(element) {

    if (!element) {
        return;
    }

    element.style.display = "flex";
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
// API REQUEST
// ============================================================

async function apiRequest(endpoint, options = {}) {

    const url = `${API_BASE}${endpoint}`;

    const config = {
        ...options,

        credentials: "include",

        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    };

    const response = await fetch(url, config);

    let data;

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
}


// ============================================================
// BACKEND HEALTH
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
            "MoonPlug backend unavailable:",
            error
        );

        return false;
    }
}


// ============================================================
// OWNER SESSION
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
            "MoonPlug: ownerCode element not found."
        );

        return;
    }

    const password =
        codeInput.value.trim();

    if (!password) {

        if (errorElement) {
            errorElement.textContent =
                "Please enter the owner password.";
        }

        return;
    }

    if (loginButton) {

        loginButton.disabled = true;
        loginButton.textContent = "Checking...";
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
            data.success === true &&
            data.authenticated === true
        ) {

            isOwnerAuthenticated = true;

            codeInput.value = "";

            hideOwnerLogin();

            await openOwnerPanel();

        } else {

            throw new Error(
                data.error ||
                "Incorrect owner password."
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
                    "Incorrect owner password.";
            }
        }

    } finally {

        if (loginButton) {

            loginButton.disabled = false;
            loginButton.textContent = "Enter";
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
            "Owner logout failed:",
            error
        );

    } finally {

        isOwnerAuthenticated = false;

        hideOwnerPanel();
    }
}


// ============================================================
// OWNER LOGIN SCREEN
// ============================================================

function showOwnerLogin() {

    const overlay = $("ownerLogin");
    const codeInput = $("ownerCode");
    const errorElement = $("ownerError");

    if (!overlay) {

        console.error(
            "MoonPlug: ownerLogin element not found."
        );

        return;
    }

    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");

    if (errorElement) {
        errorElement.textContent = "";
    }

    if (codeInput) {

        codeInput.value = "";

        setTimeout(
            () => codeInput.focus(),
            100
        );
    }
}


function hideOwnerLogin() {

    const overlay = $("ownerLogin");

    if (!overlay) {
        return;
    }

    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
}


// ============================================================
// OWNER PANEL
// ============================================================

async function openOwnerPanel() {

    if (!isOwnerAuthenticated) {

        showOwnerLogin();

        return;
    }

    const panel = $("ownerPanel");

    if (!panel) {

        console.error(
            "MoonPlug: ownerPanel element not found."
        );

        return;
    }

    panel.style.display = "flex";
    panel.setAttribute("aria-hidden", "false");

    await loadOwnerDashboard();
}


function hideOwnerPanel() {

    const panel = $("ownerPanel");

    if (!panel) {
        return;
    }

    panel.style.display = "none";
    panel.setAttribute("aria-hidden", "true");
}


// ============================================================
// OWNER DASHBOARD
// ============================================================

async function loadOwnerDashboard() {

    if (!isOwnerAuthenticated) {
        return;
    }

    try {

        const data = await apiRequest(
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

        const users = $("ownerUsers");
        const chats = $("ownerChats");

        if (users) {
            users.textContent =
                stats.users ?? 0;
        }

        if (chats) {
            chats.textContent =
                stats.chats ?? 0;
        }

    } catch (error) {

        if (error.status === 401) {

            isOwnerAuthenticated = false;

            hideOwnerPanel();
            showOwnerLogin();

            return;
        }

        console.error(
            "Owner dashboard error:",
            error
        );
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

        const data = await apiRequest(
            "/api/owner/users",
            {
                method: "GET"
            }
        );

        return data.users || [];

    } catch (error) {

        if (error.status === 401) {

            isOwnerAuthenticated = false;
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

        const data = await apiRequest(
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


async function updateOwnerSettings(settings) {

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

                body: JSON.stringify(settings)
            }
        );

    } catch (error) {

        if (error.status === 401) {

            isOwnerAuthenticated = false;

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
// OWNER TRAINING
// ============================================================

async function loadTraining() {

    if (!isOwnerAuthenticated) {
        return [];
    }

    try {

        const data = await apiRequest(
            "/api/owner/training",
            {
                method: "GET"
            }
        );

        return data.training || [];

    } catch (error) {

        return [];
    }
}


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

        return await apiRequest(
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

    } catch (error) {

        return {
            success: false,
            error:
                error.message ||
                "Could not add training."
        };
    }
}


async function deleteTraining(trainingId) {

    if (!isOwnerAuthenticated) {

        return {
            success: false,
            error: "Owner authentication required."
        };
    }

    try {

        return await apiRequest(
            `/api/owner/training/${encodeURIComponent(trainingId)}`,
            {
                method: "DELETE"
            }
        );

    } catch (error) {

        return {
            success: false,
            error:
                error.message ||
                "Could not delete training."
        };
    }
}


// ============================================================
// CHAT
// ============================================================

function removeEmptyChat() {

    const empty =
        document.querySelector(".empty-chat");

    if (empty) {
        empty.remove();
    }
}


// ============================================================
// FIXED MESSAGE BUBBLE FUNCTION
// ============================================================

function addMessage(text, sender) {

    const messages = $("messages");

    if (!messages) {

        console.error(
            "MoonPlug: #messages was not found."
        );

        return;
    }

    removeEmptyChat();

    const bubble =
        document.createElement("div");

    /*
        IMPORTANT:

        The CSS uses:

        .message-bubble.user
        .message-bubble.ai

        So JavaScript must create those
        exact classes.
    */

    if (sender === "user") {

        bubble.className =
            "message-bubble user";

    } else {

        bubble.className =
            "message-bubble ai";
    }

    bubble.textContent = text;

    messages.appendChild(bubble);

    messages.scrollTop =
        messages.scrollHeight;
}


// ============================================================
// TYPING INDICATOR
// ============================================================

function showTyping() {

    const typing = $("typing");

    if (typing) {
        typing.style.display = "flex";
    }
}


function hideTyping() {

    const typing = $("typing");

    if (typing) {
        typing.style.display = "none";
    }
}


// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage() {

    const input =
        $("messageInput");

    if (!input) {

        console.error(
            "MoonPlug: messageInput not found."
        );

        return;
    }

    const message =
        input.value.trim();

    if (!message) {
        return;
    }


    /*
        DO NOT SEND THE OWNER TRIGGER
        AS A NORMAL MESSAGE.
    */

    if (message === "15912014") {

        input.value = "";

        showOwnerLogin();

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
        Temporary response until
        the actual AI generation endpoint
        is connected.
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
        "ai"
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

    const panel =
        $("settingsPanel");

    if (panel) {
        panel.style.display = "flex";
        panel.setAttribute("aria-hidden", "false");
    }
}


function closeSettings() {

    const panel =
        $("settingsPanel");

    if (panel) {
        panel.style.display = "none";
        panel.setAttribute("aria-hidden", "true");
    }
}


function updateTextSize(size) {

    currentTextSize = size;

    document.body.dataset.textSize = size;

    document
        .querySelectorAll(".size-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.size === size
            );
        });

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

        updateTextSize(saved);

    } else {

        updateTextSize("medium");
    }
}


// ============================================================
// ACCOUNT SCREEN
// ============================================================

function openAccount() {

    const account =
        $("accountScreen");

    if (!account) {

        console.error(
            "MoonPlug: accountScreen not found."
        );

        return;
    }

    account.style.display = "flex";

    account.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeAccount() {

    const account =
        $("accountScreen");

    if (!account) {
        return;
    }

    account.style.display = "none";

    account.setAttribute(
        "aria-hidden",
        "true"
    );
}


// ============================================================
// ACCOUNT TABS
// ============================================================

function showLoginTab() {

    const loginForm = $("loginForm");
    const signupForm = $("signupForm");

    const loginTab = $("loginTab");
    const signupTab = $("signupTab");

    if (loginForm) {
        loginForm.style.display = "flex";
    }

    if (signupForm) {
        signupForm.style.display = "none";
    }

    loginTab?.classList.add("active");
    signupTab?.classList.remove("active");
}


function showSignupTab() {

    const loginForm = $("loginForm");
    const signupForm = $("signupForm");

    const loginTab = $("loginTab");
    const signupTab = $("signupTab");

    if (loginForm) {
        loginForm.style.display = "none";
    }

    if (signupForm) {
        signupForm.style.display = "flex";
    }

    loginTab?.classList.remove("active");
    signupTab?.classList.add("active");
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
// PASSWORD SHOW / HIDE
// ============================================================

function setupPasswordToggle() {

    const passwordInput =
        $("ownerCode");

    const toggleButton =
        $("showPassword");

    if (!passwordInput || !toggleButton) {
        return;
    }

    toggleButton.addEventListener(
        "click",
        () => {

            if (
                passwordInput.type === "password"
            ) {

                passwordInput.type = "text";

                toggleButton.textContent =
                    "Hide";

            } else {

                passwordInput.type = "password";

                toggleButton.textContent =
                    "Show";
            }
        }
    );
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


    /*
        Account button.

        This does NOT expose the owner panel.
    */

    $("ownerButton")?.addEventListener(
        "click",
        openAccount
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

            try {

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

            } catch (error) {

                alert(
                    "Could not load chat information."
                );
            }
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

function showTrainer(training) {

    const existing =
        $("trainerPanel");

    if (existing) {

        existing.remove();

    }

    const panel =
        document.createElement("div");

    panel.id =
        "trainerPanel";

    panel.className =
        "trainer-panel";

    panel.innerHTML = `

        <div class="trainer-header">

            <div>

                <h2>
                    🧠 MoonPlug Trainer
                </h2>

                <p>
                    Teach MoonPlug new knowledge.
                </p>

            </div>

            <button
                id="closeTrainer"
                type="button"
            >
                Close
            </button>

        </div>


        <div class="trainer-form">

            <label>
                Question
            </label>

            <textarea
                id="trainerQuestion"
                placeholder="What should MoonPlug learn?"
                maxlength="2000"
            ></textarea>


            <label>
                Answer
            </label>

            <textarea
                id="trainerAnswer"
                placeholder="What should MoonPlug answer?"
                maxlength="10000"
            ></textarea>


            <label>
                Category
            </label>

            <input
                id="trainerCategory"
                type="text"
                placeholder="general"
                value="general"
            >


            <button
                id="teachMoonPlug"
                type="button"
            >
                + Teach MoonPlug
            </button>

        </div>


        <div class="trainer-knowledge">

            <div class="trainer-knowledge-header">

                <h3>
                    Learned Knowledge
                </h3>

                <button
                    id="refreshTraining"
                    type="button"
                >
                    Refresh
                </button>

            </div>

            <div id="trainingList"></div>

        </div>

    `;

    document.body.appendChild(panel);


    renderTrainingList(training);


    $("closeTrainer")?.addEventListener(
        "click",
        () => {

            panel.remove();

        }
    );


    $("refreshTraining")?.addEventListener(
        "click",
        async () => {

            const updated =
                await loadTraining();

            renderTrainingList(updated);

        }
    );


    $("teachMoonPlug")?.addEventListener(
        "click",
        teachMoonPlug
    );

}


function renderTrainingList(training) {

    const list =
        $("trainingList");

    if (!list) return;


    list.innerHTML = "";


    if (!training.length) {

        list.innerHTML = `
            <p class="trainer-empty">
                MoonPlug hasn't been taught anything yet.
            </p>
        `;

        return;

    }


    training.forEach(
        item => {

            const card =
                document.createElement("div");

            card.className =
                "training-card";

            card.innerHTML = `

                <strong>
                    ${escapeHTML(item.question)}
                </strong>

                <p>
                    ${escapeHTML(item.answer)}
                </p>

                <small>
                    Category:
                    ${escapeHTML(item.category || "general")}
                </small>

            `;

            list.appendChild(card);

        }
    );

}


async function teachMoonPlug() {

    const question =
        $("trainerQuestion")?.value.trim();

    const answer =
        $("trainerAnswer")?.value.trim();

    const category =
        $("trainerCategory")?.value.trim()
        || "general";


    if (!question) {

        alert("Please enter a question.");

        return;

    }


    if (!answer) {

        alert("Please enter an answer.");

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/api/owner/training`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    credentials:
                        "include",

                    body:
                        JSON.stringify({

                            question,

                            answer,

                            category

                        })

                }
            );


        const result =
            await response.json();


        if (!response.ok ||
            !result.success) {

            throw new Error(
                result.error ||
                "Training failed."
            );

        }


        $("trainerQuestion").value =
            "";

        $("trainerAnswer").value =
            "";

        $("trainerCategory").value =
            "general";


        const training =
            await loadTraining();

        renderTrainingList(training);


        alert(
            "MoonPlug learned something new!"
        );

    }
    catch (error) {

        console.error(
            "Trainer error:",
            error
        );

        alert(
            error.message ||
            "Could not teach MoonPlug."
        );

    }

}
  $("trainerButton")?.addEventListener(
    "click",
    () => {

        const trainer =
            document.getElementById(
                "trainerPanel"
            );

        if (trainer) {

            trainer.remove();

            return;

        }

        const panel =
            document.createElement("div");

        panel.id =
            "trainerPanel";

        panel.innerHTML = `

            <div>

                <h2>
                    AI Trainer
                </h2>

                <button
                    id="closeTrainer"
                    type="button"
                >
                    Close
                </button>

            </div>

            <label>
                Question
            </label>

            <textarea
                id="trainerQuestion"
                placeholder="What should MoonPlug learn?"
            ></textarea>


            <label>
                Answer
            </label>

            <textarea
                id="trainerAnswer"
                placeholder="What should MoonPlug answer?"
            ></textarea>


            <label>
                Category
            </label>

            <input
                id="trainerCategory"
                type="text"
                value="general"
            >


            <button
                id="teachMoonPlug"
                type="button"
            >
                Teach MoonPlug
            </button>

        `;

        document
            .getElementById("ownerPanel")
            .appendChild(panel);


        document
            .getElementById("closeTrainer")
            .addEventListener(
                "click",
                () => {

                    panel.remove();

                }
            );

    }
);


// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

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

    setupPasswordToggle();

    setupKeyboardShortcuts();

    loadTextSize();


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


    await checkOwnerSession();


    /*
        Protected screens stay hidden
        until the correct owner password
        is entered.
    */

    hideOwnerLogin();

    hideOwnerPanel();


    console.log(
        "✓ MoonPlug ready."
    );
}


// ============================================================
// START APP
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

