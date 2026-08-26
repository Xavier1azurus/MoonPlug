
/* =====================================================
                MOONPLUG AI
          FRONTEND CONTROLLER
===================================================== */

const API_BASE = "https://computation-matched-gibson-sleeps.trycloudflare.com";

let currentChat = [];
let isOwnerAuthenticated = false;
let currentTextSize = "medium";
let currentTheme = "dark";


/* =====================================================
DOM HELPER
===================================================== */

function $(id) {
    return document.getElementById(id);
}


/* =====================================================
API REQUEST
===================================================== */

async function apiRequest(endpoint, options = {}) {

    const url = `${API_BASE}${endpoint}`;

    const config = {
        method: options.method || "GET",
        credentials: "include",
        ...options,

        headers: {
            ...(options.body !== undefined
                ? { "Content-Type": "application/json" }
                : {}),
            ...(options.headers || {})
        }
    };

    let response;

    try {

        response = await fetch(url, config);

    } catch (error) {

        const networkError = new Error(
            "Could not connect to the MoonPlug backend."
        );

        networkError.network = true;
        networkError.originalError = error;

        throw networkError;
    }


    let data = null;

    const contentType =
        response.headers.get("content-type") || "";


    if (contentType.includes("application/json")) {

        try {

            data = await response.json();

        } catch {

            data = null;
        }

    } else {

        try {

            const text = await response.text();

            if (text) {

                data = {
                    success: false,
                    error: text
                };
            }

        } catch {

            data = null;
        }
    }


    if (!response.ok) {

        const error = new Error(
            data?.error ||
            data?.message ||
            `Request failed with status ${response.status}.`
        );

        error.status = response.status;
        error.data = data;

        throw error;
    }


    return data || {};
}


/* =====================================================
HTML SAFETY
===================================================== */

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = String(value ?? "");

    return div.innerHTML;
}


/* =====================================================
BACKEND HEALTH
===================================================== */

async function checkBackendHealth() {

    try {

        const data = await apiRequest(
            "/api/health"
        );

        console.log(
            "MoonPlug backend health:",
            data
        );

        return data.success === true;

    } catch (error) {

        console.warn(
            "MoonPlug backend unavailable:",
            error
        );

        return false;
    }
}


/* =====================================================
OWNER SESSION
===================================================== */

async function checkOwnerSession() {

    try {

        const data = await apiRequest(
            "/api/owner/session"
        );

        isOwnerAuthenticated =
            data.authenticated === true;

        return isOwnerAuthenticated;

    } catch {

        isOwnerAuthenticated = false;

        return false;
    }
}


/* =====================================================
OWNER LOGIN
===================================================== */

async function loginOwner() {

    const codeInput = $("ownerCode");
    const errorElement = $("ownerError");
    const loginButton = $("ownerLoginButton");


    if (!codeInput) {
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
                    password
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

            return;
        }


        throw new Error(
            data.error ||
            "Incorrect owner password."
        );


    } catch (error) {

        isOwnerAuthenticated = false;


        if (errorElement) {

            errorElement.textContent =
                error.status === 429
                    ? "Too many attempts. Please wait a few minutes."
                    : error.message ||
                      "Incorrect owner password.";
        }


    } finally {

        if (loginButton) {

            loginButton.disabled = false;
            loginButton.textContent = "Enter";
        }
    }
}


/* =====================================================
OWNER LOGOUT
===================================================== */

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

        closeTrainer();
    }
}


/* =====================================================
OWNER LOGIN UI
===================================================== */

function showOwnerLogin() {

    const overlay = $("ownerLogin");
    const codeInput = $("ownerCode");
    const errorElement = $("ownerError");


    if (!overlay) {
        return;
    }


    overlay.style.display = "flex";

    overlay.setAttribute(
        "aria-hidden",
        "false"
    );


    if (errorElement) {

        errorElement.textContent = "";
    }


    if (codeInput) {

        codeInput.value = "";

        setTimeout(() => {

            codeInput.focus();

        }, 100);
    }
}


function hideOwnerLogin() {

    const overlay = $("ownerLogin");


    if (!overlay) {
        return;
    }


    overlay.style.display = "none";

    overlay.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =====================================================
OWNER PANEL
===================================================== */

async function openOwnerPanel() {

    if (!isOwnerAuthenticated) {

        showOwnerLogin();

        return;
    }


    const panel = $("ownerPanel");


    if (!panel) {

        console.error(
            "MoonPlug: ownerPanel was not found."
        );

        return;
    }


    panel.style.display = "flex";

    panel.setAttribute(
        "aria-hidden",
        "false"
    );


    await loadOwnerDashboard();
}


function hideOwnerPanel() {

    const panel = $("ownerPanel");


    if (!panel) {
        return;
    }


    panel.style.display = "none";

    panel.setAttribute(
        "aria-hidden",
        "true"
    );


    closeTrainer();
}


/* =====================================================
OWNER DASHBOARD
===================================================== */

async function loadOwnerDashboard() {

    if (!isOwnerAuthenticated) {
        return;
    }


    try {

        const data = await apiRequest(
            "/api/owner/dashboard"
        );


        const stats =
            data.stats || {};


        if ($("ownerUsers")) {

            $("ownerUsers").textContent =
                stats.users ?? 0;
        }


        if ($("ownerChats")) {

            $("ownerChats").textContent =
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


/* =====================================================
OWNER USERS
===================================================== */

async function loadOwnerUsers() {

    if (!isOwnerAuthenticated) {
        return [];
    }


    try {

        const data = await apiRequest(
            "/api/owner/users"
        );


        return Array.isArray(data.users)
            ? data.users
            : [];


    } catch (error) {

        if (error.status === 401) {

            isOwnerAuthenticated = false;

            hideOwnerPanel();
        }


        return [];
    }
}


/* =====================================================
OWNER SETTINGS
===================================================== */

async function loadOwnerSettings() {

    if (!isOwnerAuthenticated) {
        return null;
    }


    try {

        const data = await apiRequest(
            "/api/owner/settings"
        );


        return data.settings || null;


    } catch (error) {

        if (error.status === 401) {

            isOwnerAuthenticated = false;

            hideOwnerPanel();
        }


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

                body: JSON.stringify(
                    settings || {}
                )
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


/* =====================================================
CHAT UI
===================================================== */

function removeEmptyChat() {

    const empty =
        document.querySelector(".empty-chat");


    if (empty) {
        empty.remove();
    }
}


function addMessage(text, sender) {

    const messages = $("messages");


    if (!messages) {
        return;
    }


    removeEmptyChat();


    const bubble =
        document.createElement("div");


    bubble.className =
        sender === "user"
            ? "message-bubble user"
            : "message-bubble ai";


    bubble.textContent =
        String(text ?? "");


    messages.appendChild(bubble);


    messages.scrollTop =
        messages.scrollHeight;
}


/* =====================================================
TYPING
===================================================== */

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


/* =====================================================
SEND MESSAGE
===================================================== */

async function sendMessage() {

    const input = $("messageInput");


    if (!input) {
        return;
    }


    const message =
        input.value.trim();


    if (!message) {
        return;
    }


    /*
       PRIVATE OWNER TRIGGER

       This is intentionally NOT
       displayed as a public button.
    */

    if (message === "15912014") {

        input.value = "";

        showOwnerLogin();

        return;
    }


    const previousHistory =
        currentChat.map(item => ({

            role: item.role,

            content: item.content

        }));


    input.value = "";


    addMessage(
        message,
        "user"
    );


    showTyping();


    try {

        const data = await apiRequest(
            "/api/chat",
            {
                method: "POST",

                body: JSON.stringify({

                    message,

                    history: previousHistory

                })
            }
        );


        if (data.success === false) {

            throw new Error(
                data.error ||
                "MoonPlug returned an error."
            );
        }


        const response =
            data.response ??
            data.message ??
            data.reply ??
            data.answer;


        if (
            response === undefined ||
            response === null ||
            String(response).trim() === ""
        ) {

            throw new Error(
                "MoonPlug returned no response."
            );
        }


        const responseText =
            String(response);


        addMessage(
            responseText,
            "ai"
        );


        currentChat.push({

            role: "user",

            content: message

        });


        currentChat.push({

            role: "assistant",

            content: responseText

        });


    } catch (error) {

        console.error(
            "MoonPlug chat error:",
            error
        );


        let errorMessage =
            error.message ||
            "MoonPlug couldn't connect to the AI backend.";


        if (error.network) {

            errorMessage =
                "MoonPlug couldn't connect to the backend. Check that your backend is running.";
        }


        addMessage(
            errorMessage,
            "ai"
        );


    } finally {

        hideTyping();
    }
}


/* =====================================================
NEW CHAT
===================================================== */

function startNewChat() {

    const messages = $("messages");


    if (!messages) {
        return;
    }


    currentChat = [];


    messages.innerHTML = `

        <div class="empty-chat">

            <h1>
                What can I help with?
            </h1>

            <p>
                Ask MoonPlug anything.
            </p>

        </div>

    `;


    $("messageInput")?.focus();
}


/* =====================================================
SETTINGS
===================================================== */

function openSettings() {

    const panel = $("settingsPanel");


    if (!panel) {
        return;
    }


    panel.style.display = "flex";


    panel.setAttribute(
        "aria-hidden",
        "false"
    );
}


function closeSettings() {

    const panel = $("settingsPanel");


    if (!panel) {
        return;
    }


    panel.style.display = "none";


    panel.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =====================================================
TEXT SIZE
===================================================== */

function updateTextSize(size) {

    if (
        ![
            "small",
            "medium",
            "large"
        ].includes(size)
    ) {

        return;
    }


    currentTextSize = size;


    document.body.classList.remove(
        "text-small",
        "text-medium",
        "text-large"
    );


    document.body.classList.add(
        `text-${size}`
    );


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


    updateTextSize(

        [
            "small",
            "medium",
            "large"
        ].includes(saved)

            ? saved

            : "medium"

    );
}


/* =====================================================
THEME
===================================================== */

function applyTheme(theme) {

    currentTheme =
        theme === "light"
            ? "light"
            : "dark";


    document.body.classList.toggle(
        "light-theme",
        currentTheme === "light"
    );


    const themeButton =
        $("themeButton");


    if (themeButton) {

        themeButton.textContent =
            currentTheme === "light"
                ? "Light"
                : "Dark";
    }


    localStorage.setItem(
        "moonplug_theme",
        currentTheme
    );
}


function toggleTheme() {

    applyTheme(

        currentTheme === "dark"
            ? "light"
            : "dark"

    );
}


function loadTheme() {

    const saved =
        localStorage.getItem(
            "moonplug_theme"
        );


    applyTheme(

        saved === "light"
            ? "light"
            : "dark"

    );
}


/* =====================================================
ACCOUNT
===================================================== */

function openAccount() {

    const account =
        $("accountScreen");


    if (!account) {
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


/* =====================================================
ACCOUNT TABS
===================================================== */

function showLoginTab() {

    const loginForm =
        $("loginForm");

    const signupForm =
        $("signupForm");


    if (loginForm) {

        loginForm.hidden = false;

        loginForm.style.display =
            "flex";
    }


    if (signupForm) {

        signupForm.hidden = true;

        signupForm.style.display =
            "none";
    }


    $("loginTab")
        ?.classList.add("active");


    $("signupTab")
        ?.classList.remove("active");
}


function showSignupTab() {

    const loginForm =
        $("loginForm");

    const signupForm =
        $("signupForm");


    if (loginForm) {

        loginForm.hidden = true;

        loginForm.style.display =
            "none";
    }


    if (signupForm) {

        signupForm.hidden = false;

        signupForm.style.display =
            "flex";
    }


    $("loginTab")
        ?.classList.remove("active");


    $("signupTab")
        ?.classList.add("active");
}


/* =====================================================
ACCOUNT FORMS
===================================================== */

function setupAccountForms() {

    $("loginForm")?.addEventListener(

        "submit",

        event => {

            event.preventDefault();


            if ($("accountMessage")) {

                $("accountMessage").textContent =
                    "Public accounts are not connected yet.";
            }

        }

    );


    $("signupForm")?.addEventListener(

        "submit",

        event => {

            event.preventDefault();


            if ($("accountMessage")) {

                $("accountMessage").textContent =
                    "Public accounts are not connected yet.";
            }

        }

    );
}


/* =====================================================
PASSWORD TOGGLE
===================================================== */

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

            const showing =
                passwordInput.type === "text";


            passwordInput.type =
                showing
                    ? "password"
                    : "text";


            toggleButton.textContent =
                showing
                    ? "Show"
                    : "Hide";
        }

    );
}


/* =====================================================
SIDEBAR
===================================================== */

function toggleSidebar() {

    const sidebar =
        $("sidebar");


    if (!sidebar) {
        return;
    }


    if (window.innerWidth <= 1200) {

        sidebar.classList.toggle(
            "expanded"
        );

    } else {

        sidebar.classList.toggle(
            "collapsed"
        );
    }
}


function setupSidebar() {

    const logo =
        $("sidebarLogo");


    logo?.addEventListener(
        "click",
        toggleSidebar
    );


    document
        .querySelectorAll(".sidebar-button")
        .forEach(button => {

            button.addEventListener(

                "click",

                () => {

                    if (

                        window.innerWidth <= 1200 &&

                        button.id !== "settingsButton" &&

                        button.id !== "ownerButton"

                    ) {

                        $("sidebar")
                            ?.classList.remove(
                                "expanded"
                            );
                    }

                }

            );

        });
}


/* =====================================================
TRAINING API
===================================================== */

async function loadTraining() {

    if (!isOwnerAuthenticated) {
        return [];
    }


    try {

        const data =
            await apiRequest(
                "/api/owner/training"
            );


        return Array.isArray(data.training)

            ? data.training

            : [];


    } catch (error) {

        if (error.status === 401) {

            isOwnerAuthenticated = false;

            hideOwnerPanel();
        }


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

            error:
                "Owner authentication required."

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

        if (error.status === 401) {

            isOwnerAuthenticated = false;

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


async function deleteTraining(trainingId) {

    if (!isOwnerAuthenticated) {

        return {

            success: false,

            error:
                "Owner authentication required."

        };
    }


    if (

        trainingId === undefined ||

        trainingId === null ||

        String(trainingId).trim() === ""

    ) {

        return {

            success: false,

            error:
                "Training ID is missing."

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

        if (error.status === 401) {

            isOwnerAuthenticated = false;

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


/* =====================================================
TRAINER PANEL
===================================================== */

function openTrainer() {

    if (!isOwnerAuthenticated) {

        showOwnerLogin();

        return;
    }


    if ($("trainerPanel")) {
        return;
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
                    AI Trainer
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


        <!-- =================================================
             AUTO TRAINER
        ================================================== -->

        <div class="trainer-generator">

            <h3>
                Auto Trainer
            </h3>

            <p>
                Generate training and automatically teach MoonPlug.
            </p>


            <label for="trainingCategory">

                Category

            </label>


            <input
                id="trainingCategory"
                type="text"
                placeholder="Example: Python"
                autocomplete="off"
                maxlength="100"
            >


            <label for="trainingAmount">

                Amount

            </label>


            <select id="trainingAmount">

                <option value="1">
                    1
                </option>

                <option value="5">
                    5
                </option>

                <option value="10" selected>
                    10
                </option>

                <option value="25">
                    25
                </option>

                <option value="50">
                    50
                </option>

            </select>


            <button
                id="generateTraining"
                type="button"
            >
                Generate & Teach
            </button>


            <p
                id="trainingGenerateStatus"
                class="training-generate-status"
            ></p>

        </div>


        <!-- =================================================
             GENERATED TRAINING
        ================================================== -->

        <div
            id="generatedTrainingSection"
            class="trainer-knowledge"
            style="display:none;"
        >

            <div class="trainer-knowledge-header">

                <h3>
                    Generated Training
                </h3>

            </div>


            <div
                id="generatedTrainingResults"
            ></div>

        </div>


        <!-- =================================================
             MANUAL TRAINING
        ================================================== -->

        <div class="trainer-form">

            <h3>
                Teach MoonPlug Manually
            </h3>


            <label for="trainerQuestion">
                Question
            </label>


            <textarea
                id="trainerQuestion"
                placeholder="What should MoonPlug learn?"
                maxlength="2000"
            ></textarea>


            <label for="trainerAnswer">
                Answer
            </label>


            <textarea
                id="trainerAnswer"
                placeholder="What should MoonPlug answer?"
                maxlength="10000"
            ></textarea>


            <label for="trainerCategory">
                Category
            </label>


            <input
                id="trainerCategory"
                type="text"
                value="general"
                placeholder="general"
                maxlength="100"
            >


            <button
                id="teachMoonPlug"
                type="button"
            >
                Teach MoonPlug
            </button>

        </div>


        <!-- =================================================
             LEARNED KNOWLEDGE
        ================================================== -->

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


    const ownerPanel =
        $("ownerPanel");


    if (!ownerPanel) {

        console.error(
            "MoonPlug: ownerPanel was not found."
        );

        return;
    }


    ownerPanel.appendChild(panel);


    /* =====================================================
       TRAINER BUTTONS
    ===================================================== */

    $("closeTrainer")?.addEventListener(
        "click",
        closeTrainer
    );


    $("refreshTraining")?.addEventListener(
        "click",
        refreshTraining
    );


    $("teachMoonPlug")?.addEventListener(
        "click",
        teachMoonPlug
    );


    $("generateTraining")?.addEventListener(
        "click",
        generateTraining
    );


    /* =====================================================
       AUTO TRAINER ENTER KEY
    ===================================================== */

    $("trainingCategory")?.addEventListener(

        "keydown",

        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                generateTraining();
            }

        }

    );


    loadAndRenderTraining();
}


function closeTrainer() {

    $("trainerPanel")?.remove();
}


/* =====================================================
GENERATE TRAINING
===================================================== */

async function generateTraining() {

    if (!isOwnerAuthenticated) {

        showOwnerLogin();

        return;
    }


    const categoryInput =
        $("trainingCategory");


    const amountInput =
        $("trainingAmount");


    const button =
        $("generateTraining");


    const status =
        $("trainingGenerateStatus");


    const resultsSection =
        $("generatedTrainingSection");


    const results =
        $("generatedTrainingResults");


    /*
       IMPORTANT:
       This reads ONLY the Auto Trainer
       category field.
    */

    const category =
        categoryInput?.value.trim();


    const amount =
        Number(amountInput?.value);


    if (!category) {

        if (status) {

            status.textContent =
                "Please enter a category.";
        }


        categoryInput?.focus();

        return;
    }


    if (

        !Number.isInteger(amount) ||

        amount < 1

    ) {

        if (status) {

            status.textContent =
                "Please choose a valid amount.";
        }

        return;
    }


    if (button) {

        button.disabled = true;

        button.textContent =
            "Generating...";
    }


    if (status) {

        status.textContent =
            "MoonPlug is generating training...";
    }


    if (resultsSection) {

        resultsSection.style.display =
            "none";
    }


    if (results) {

        results.innerHTML = "";
    }


    try {

        const data =
            await apiRequest(

                "/api/owner/training/generate",

                {

                    method: "POST",

                    body: JSON.stringify({

                        category,

                        amount

                    })

                }

            );


        if (data.success === false) {

            throw new Error(

                data.error ||
                "Training generation failed."

            );
        }


        const generated =

            Array.isArray(data.training)

                ? data.training

                : Array.isArray(data.results)

                    ? data.results

                    : Array.isArray(data.generated)

                        ? data.generated

                        : [];


        if (!generated.length) {

            throw new Error(

                "The server generated no training examples."

            );
        }


        /*
           SHOW GENERATED TRAINING
        */

        renderGeneratedTraining(
            generated
        );


        if (resultsSection) {

            resultsSection.style.display =
                "block";
        }


        /*
           =================================================
           AUTO-SAVE GENERATED TRAINING
           =================================================

           This is the important part.

           Every generated question/answer is
           sent to /api/owner/training.
        */

        let savedCount = 0;


        for (const item of generated) {

            const question =
                item?.question ??
                item?.prompt ??
                "";


            const answer =
                item?.answer ??
                item?.response ??
                "";


            const itemCategory =
                item?.category ||
                category;


            if (!question || !answer) {

                continue;
            }


            const saveResult =
                await addTraining(

                    String(question),

                    String(answer),

                    String(itemCategory)

                );


            if (
                saveResult &&
                saveResult.success === true
            ) {

                savedCount++;
            }
        }


        /*
           REFRESH LEARNED KNOWLEDGE
        */

        await loadAndRenderTraining();


        if (status) {

            status.textContent =
                `Auto Trainer finished! MoonPlug learned ${savedCount} new example${
                    savedCount === 1
                        ? ""
                        : "s"
                } about ${category}.`;
        }


    } catch (error) {

        console.error(

            "Training generation error:",

            error

        );


        if (status) {

            status.textContent =
                error.message ||
                "Could not generate training.";
        }


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Generate & Teach";
        }
    }
}


/* =====================================================
GENERATED TRAINING DISPLAY
===================================================== */

function renderGeneratedTraining(training) {

    const container =
        $("generatedTrainingResults");


    if (!container) {
        return;
    }


    container.innerHTML = "";


    training.forEach(

        (item, index) => {

            const question =
                item?.question ??
                item?.prompt ??
                "";


            const answer =
                item?.answer ??
                item?.response ??
                "";


            const category =
                item?.category ||
                "general";


            const card =
                document.createElement("div");


            card.className =
                "training-card generated";


            card.innerHTML = `

                <strong>

                    ${escapeHTML(

                        question ||

                        `Training Example ${index + 1}`

                    )}

                </strong>


                <p>

                    ${escapeHTML(
                        answer
                    )}

                </p>


                <small>

                    Category:
                    ${escapeHTML(
                        category
                    )}

                </small>

            `;


            container.appendChild(card);
        }
    );
}


/* =====================================================
TRAINING LIST
===================================================== */

async function loadAndRenderTraining() {

    const training =
        await loadTraining();


    renderTrainingList(
        training
    );
}


async function refreshTraining() {

    await loadAndRenderTraining();
}


function renderTrainingList(training) {

    const list =
        $("trainingList");


    if (!list) {
        return;
    }


    list.innerHTML = "";


    if (!training.length) {

        list.innerHTML = `

            <p>
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

                    ${escapeHTML(

                        item?.question ||
                        "Untitled training"

                    )}

                </strong>


                <p>

                    ${escapeHTML(

                        item?.answer ||
                        ""

                    )}

                </p>


                <small>

                    Category:
                    ${escapeHTML(

                        item?.category ||
                        "general"

                    )}

                </small>


                <br>


                <button
                    type="button"
                    class="delete-training-button"
                >
                    Delete
                </button>

            `;


            const deleteButton =
                card.querySelector(
                    ".delete-training-button"
                );


            deleteButton?.addEventListener(

                "click",

                async () => {

                    if (

                        item?.id === undefined ||

                        item?.id === null

                    ) {

                        alert(
                            "This training item has no ID."
                        );

                        return;
                    }


                    if (

                        !confirm(
                            "Delete this training example?"
                        )

                    ) {

                        return;
                    }


                    deleteButton.disabled =
                        true;


                    deleteButton.textContent =
                        "Deleting...";


                    const result =
                        await deleteTraining(
                            item.id
                        );


                    if (

                        result?.success === true

                    ) {

                        card.remove();

                    } else {

                        deleteButton.disabled =
                            false;


                        deleteButton.textContent =
                            "Delete";


                        alert(

                            result?.error ||

                            "Could not delete training."

                        );
                    }

                }

            );


            list.appendChild(card);

        }

    );
}


/* =====================================================
MANUAL TRAINING
===================================================== */

async function teachMoonPlug() {

    if (!isOwnerAuthenticated) {

        showOwnerLogin();

        return;
    }


    const question =
        $("trainerQuestion")
            ?.value.trim();


    const answer =
        $("trainerAnswer")
            ?.value.trim();


    /*
       IMPORTANT:
       Manual training uses trainerCategory,
       NOT trainingCategory.
    */

    const category =
        $("trainerCategory")
            ?.value.trim() ||
        "general";


    if (!question) {

        alert(
            "Please enter a question."
        );

        return;
    }


    if (!answer) {

        alert(
            "Please enter an answer."
        );

        return;
    }


    const button =
        $("teachMoonPlug");


    if (button) {

        button.disabled = true;

        button.textContent =
            "Teaching...";
    }


    try {

        const result =
            await addTraining(

                question,

                answer,

                category

            );


        if (

            !result ||

            result.success !== true

        ) {

            throw new Error(

                result?.error ||

                "Could not teach MoonPlug."

            );
        }


        $("trainerQuestion").value =
            "";


        $("trainerAnswer").value =
            "";


        $("trainerCategory").value =
            "general";


        await loadAndRenderTraining();


        alert(
            "MoonPlug learned something new!"
        );


    } catch (error) {

        console.error(

            "Manual training error:",

            error

        );


        alert(

            error.message ||

            "Could not teach MoonPlug."

        );


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Teach MoonPlug";
        }
    }
}


/* =====================================================
BUTTON EVENTS
===================================================== */

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


    $("themeButton")?.addEventListener(
        "click",
        toggleTheme
    );


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


/* =====================================================
OWNER PANEL BUTTONS
===================================================== */

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
                        "/api/owner/dashboard"
                    );


                alert(

                    `MoonPlug has ${
                        dashboard.stats?.chats ?? 0
                    } saved chat(s).`

                );


            } catch (error) {

                if (error.status === 401) {

                    isOwnerAuthenticated =
                        false;

                    hideOwnerPanel();

                    showOwnerLogin();

                    return;
                }


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

                `Minimum match score: ${
                    settings.minimum_score
                }\nRemember conversations: ${
                    settings.remember_conversations
                }`

            );

        }

    );


    $("trainerButton")?.addEventListener(
        "click",
        openTrainer
    );


    $("ownerPanel")?.addEventListener(

        "click",

        event => {

            if (
                event.target ===
                $("ownerPanel")
            ) {

                hideOwnerPanel();
            }

        }

    );
}


/* =====================================================
KEYBOARD SHORTCUTS
===================================================== */

function setupKeyboardShortcuts() {

    document.addEventListener(

        "keydown",

        event => {

            if (event.key !== "Escape") {
                return;
            }


            hideOwnerLogin();

            closeSettings();

            closeAccount();

            closeTrainer();


            $("sidebar")
                ?.classList.remove(
                    "expanded"
                );
        }

    );
}


/* =====================================================
INITIALIZATION
===================================================== */

async function initializeMoonPlug() {

    console.log(
        "🌙 MoonPlug AI starting..."
    );


    setupButtons();

    setupOwnerPanelButtons();

    setupAccountForms();

    setupPasswordToggle();

    setupSidebar();

    setupKeyboardShortcuts();

    loadTextSize();

    loadTheme();


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
       Owner login is NEVER automatically shown.
       It is only triggered privately.
    */

    hideOwnerLogin();


    if (!isOwnerAuthenticated) {

        hideOwnerPanel();
    }


    console.log(
        "✓ MoonPlug ready."
    );
}


/* =====================================================
START APP
===================================================== */

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


