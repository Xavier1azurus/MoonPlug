
/*
=============================================================
                    MOONPLUG AI
              FRONTEND CONTROLLER
=============================================================
*/

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
// HTML SAFETY
// ============================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;
}


// ============================================================
// BACKEND HEALTH
// ============================================================

async function checkBackendHealth() {

    try {

        const data =
            await apiRequest(
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

        const data =
            await apiRequest(
                "/api/owner/session",
                {
                    method: "GET"
                }
            );

        isOwnerAuthenticated =
            data.authenticated === true;

        return isOwnerAuthenticated;

    } catch {

        isOwnerAuthenticated = false;

        return false;
    }
}


// ============================================================
// OWNER LOGIN
// ============================================================

async function loginOwner() {

    const codeInput =
        $("ownerCode");

    const errorElement =
        $("ownerError");

    const loginButton =
        $("ownerLoginButton");

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

        loginButton.textContent =
            "Checking...";
    }

    if (errorElement) {

        errorElement.textContent =
            "";
    }

    try {

        const data =
            await apiRequest(
                "/api/owner/login",
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            password
                        })
                }
            );

        if (
            data.success === true &&
            data.authenticated === true
        ) {

            isOwnerAuthenticated =
                true;

            codeInput.value =
                "";

            hideOwnerLogin();

            await openOwnerPanel();

        } else {

            throw new Error(
                data.error ||
                "Incorrect owner password."
            );
        }

    } catch (error) {

        isOwnerAuthenticated =
            false;

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

            loginButton.disabled =
                false;

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
            "Owner logout failed:",
            error
        );

    } finally {

        isOwnerAuthenticated =
            false;

        hideOwnerPanel();

        closeTrainer();
    }
}


// ============================================================
// OWNER LOGIN SCREEN
// ============================================================

function showOwnerLogin() {

    const overlay =
        $("ownerLogin");

    const codeInput =
        $("ownerCode");

    const errorElement =
        $("ownerError");

    if (!overlay) {

        console.error(
            "MoonPlug: ownerLogin element not found."
        );

        return;
    }

    overlay.style.display =
        "flex";

    overlay.setAttribute(
        "aria-hidden",
        "false"
    );

    if (errorElement) {

        errorElement.textContent =
            "";
    }

    if (codeInput) {

        codeInput.value =
            "";

        setTimeout(
            () => codeInput.focus(),
            100
        );
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
            "MoonPlug: ownerPanel element not found."
        );

        return;
    }

    panel.style.display =
        "flex";

    panel.setAttribute(
        "aria-hidden",
        "false"
    );

    await loadOwnerDashboard();
}


function hideOwnerPanel() {

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

    closeTrainer();
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

    } catch (error) {

        if (error.status === 401) {

            isOwnerAuthenticated =
                false;

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

    } catch {

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
                body:
                    JSON.stringify(settings)
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
// OWNER TRAINING API
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

        console.error(
            "Could not load training:",
            error
        );

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

                body:
                    JSON.stringify({
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

        console.error(
            "MoonPlug: #messages was not found."
        );

        return;
    }

    removeEmptyChat();

    const bubble =
        document.createElement("div");

    if (sender === "user") {

        bubble.className =
            "message-bubble user";

    } else {

        bubble.className =
            "message-bubble ai";
    }

    bubble.textContent =
        text;

    messages.appendChild(
        bubble
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
            "flex";
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
// SEND MESSAGE
// ============================================================

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


    // ========================================================
    // HIDDEN OWNER ACCESS
    // ========================================================

    if (message === "15912014") {

        input.value = "";

        showOwnerLogin();

        return;
    }


    // ========================================================
    // ADD USER MESSAGE
    // ========================================================

    input.value = "";

    addMessage(
        message,
        "user"
    );

    currentChat.push({
        role: "user",
        content: message
    });


    // ========================================================
    // SHOW TYPING
    // ========================================================

    showTyping();


    try {

        // ====================================================
        // SEND MESSAGE TO MOONPLUG BACKEND
        // ====================================================

        const data =
            await apiRequest(
                "/api/chat",
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            message: message,
                            history: currentChat
                        })
                }
            );


        // ====================================================
        // GET AI RESPONSE
        // ====================================================

        const response =
            data.response ||
            data.message ||
            data.reply ||
            data.answer;


        if (!response) {

            throw new Error(
                data.error ||
                "The backend returned no AI response."
            );
        }


        // ====================================================
        // ADD AI MESSAGE
        // ====================================================

        addMessage(
            response,
            "ai"
        );

        currentChat.push({
            role: "assistant",
            content: response
        });


    } catch (error) {

        console.error(
            "MoonPlug chat error:",
            error
        );


        addMessage(
            error.message ||
            "Sorry, MoonPlug couldn't connect to the AI backend.",
            "ai"
        );

    } finally {

        // ====================================================
        // HIDE TYPING
        // ====================================================

        hideTyping();

    }
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

    currentChat =
        [];

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

        panel.style.display =
            "flex";

        panel.setAttribute(
            "aria-hidden",
            "false"
        );
    }
}


function closeSettings() {

    const panel =
        $("settingsPanel");

    if (panel) {

        panel.style.display =
            "none";

        panel.setAttribute(
            "aria-hidden",
            "true"
        );
    }
}


function updateTextSize(size) {

    currentTextSize =
        size;

    document.body.dataset.textSize =
        size;

    document
        .querySelectorAll(
            ".size-button"
        )
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
// ACCOUNT
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

    account.style.display =
        "flex";

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

    account.style.display =
        "none";

    account.setAttribute(
        "aria-hidden",
        "true"
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
// PASSWORD TOGGLE
// ============================================================

function setupPasswordToggle() {

    const passwordInput =
        $("ownerCode");

    const toggleButton =
        $("showPassword");

    if (
        !passwordInput ||
        !toggleButton
    ) {

        return;
    }

    toggleButton.addEventListener(
        "click",
        () => {

            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type =
                    "text";

                toggleButton.textContent =
                    "Hide";

            } else {

                passwordInput.type =
                    "password";

                toggleButton.textContent =
                    "Show";
            }
        }
    );
}


// ============================================================
// TRAINER
// ============================================================

// ============================================================
// TRAINER
// ============================================================

function openTrainer() {

    if (!isOwnerAuthenticated) {

        showOwnerLogin();

        return;
    }

    const existing =
        $("trainerPanel");

    if (existing) {

        existing.remove();

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
                    Generate training knowledge for MoonPlug.
                </p>

            </div>

            <button
                id="closeTrainer"
                type="button"
            >
                Close
            </button>

        </div>


        <!-- GENERATOR -->

        <div class="trainer-generator">

            <h3>
                Generate Training
            </h3>

            <p>
                Choose a category and how many training examples
                MoonPlug should generate.
            </p>


            <label for="trainingCategory">
                Category
            </label>

            <input
                id="trainingCategory"
                type="text"
                placeholder="Example: Python"
                autocomplete="off"
            >


            <label for="trainingAmount">
                Amount
            </label>

            <select
                id="trainingAmount"
            >

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
                Generate
            </button>


            <p
                id="trainingGenerateStatus"
                class="training-generate-status"
            ></p>

        </div>


        <!-- GENERATED RESULTS -->

        <div
            id="generatedTrainingSection"
            class="trainer-knowledge"
            style="display: none;"
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


        <!-- MANUAL TRAINING -->

        <div class="trainer-form">

            <h3>
                Add Training Manually
            </h3>

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
                value="general"
                placeholder="general"
            >


            <button
                id="teachMoonPlug"
                type="button"
            >
                Teach MoonPlug
            </button>

        </div>


        <!-- LEARNED KNOWLEDGE -->

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

            <div
                id="trainingList"
            ></div>

        </div>
    `;


    $("ownerPanel")?.appendChild(
        panel
    );


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


    loadAndRenderTraining();
}


function closeTrainer() {

    const panel =
        $("trainerPanel");

    if (panel) {

        panel.remove();
    }
}


// ============================================================
// GENERATE TRAINING
// ============================================================

async function generateTraining() {

    if (!isOwnerAuthenticated) {

        showOwnerLogin();

        return;
    }


    const categoryInput =
        $("trainingCategory");

    const amountInput =
        $("trainingAmount");

    const generateButton =
        $("generateTraining");

    const status =
        $("trainingGenerateStatus");

    const resultsSection =
        $("generatedTrainingSection");

    const resultsContainer =
        $("generatedTrainingResults");


    const category =
        categoryInput?.value.trim();


    const amount =
        Number(
            amountInput?.value
        );


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


    if (generateButton) {

        generateButton.disabled =
            true;

        generateButton.textContent =
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


    if (resultsContainer) {

        resultsContainer.innerHTML =
            "";
    }


    try {

        const data =
            await apiRequest(
                "/api/owner/training/generate",
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            category,
                            amount
                        })
                }
            );


        if (!data.success) {

            throw new Error(
                data.error ||
                "Training generation failed."
            );
        }


        /*
         * The backend may return the generated
         * training under one of these names.
         */

        const generated =
            data.training ||
            data.results ||
            data.generated ||
            [];


        if (
            !Array.isArray(generated) ||
            generated.length === 0
        ) {

            throw new Error(
                "The server generated no training examples."
            );
        }


        renderGeneratedTraining(
            generated
        );


        if (resultsSection) {

            resultsSection.style.display =
                "block";
        }


        if (status) {

            status.textContent =
                `Generated ${generated.length} training example${
                    generated.length === 1 ? "" : "s"
                }.`;
        }


        /*
         * Refresh the learned knowledge list
         * because the backend may automatically
         * save generated training.
         */

        await loadAndRenderTraining();


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

        if (generateButton) {

            generateButton.disabled =
                false;

            generateButton.textContent =
                "Generate";
        }
    }
}


// ============================================================
// RENDER GENERATED TRAINING
// ============================================================

function renderGeneratedTraining(
    training
) {

    const container =
        $("generatedTrainingResults");


    if (!container) {

        return;
    }


    container.innerHTML =
        "";


    training.forEach(
        (item, index) => {

            const question =
                item.question ||
                item.prompt ||
                "";


            const answer =
                item.answer ||
                item.response ||
                "";


            const category =
                item.category ||
                "general";


            const card =
                document.createElement(
                    "div"
                );


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


            container.appendChild(
                card
            );
        }
    );
}


// ============================================================
// LEARNED TRAINING
// ============================================================

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


function renderTrainingList(
    training
) {

    const list =
        $("trainingList");


    if (!list) {

        return;
    }


    list.innerHTML =
        "";


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
                document.createElement(
                    "div"
                );


            card.className =
                "training-card";


            card.innerHTML = `

                <strong>
                    ${escapeHTML(
                        item.question
                    )}
                </strong>


                <p>
                    ${escapeHTML(
                        item.answer
                    )}
                </p>


                <small>
                    Category:
                    ${escapeHTML(
                        item.category ||
                        "general"
                    )}
                </small>


                <br>


                <button
                    type="button"
                    class="delete-training-button"
                    data-training-id="${escapeHTML(
                        item.id
                    )}"
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

                    const confirmed =
                        confirm(
                            "Delete this training example?"
                        );


                    if (!confirmed) {

                        return;
                    }


                    const result =
                        await deleteTraining(
                            item.id
                        );


                    if (
                        result.success === true
                    ) {

                        card.remove();

                    } else {

                        alert(
                            result.error ||
                            "Could not delete training."
                        );
                    }
                }
            );


            list.appendChild(
                card
            );
        }
    );
}


// ============================================================
// MANUAL TRAINING
// ============================================================

async function teachMoonPlug() {

    const question =
        $("trainerQuestion")?.value.trim();


    const answer =
        $("trainerAnswer")?.value.trim();


    const category =
        $("trainerCategory")?.value.trim() ||
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

        alert(
            result?.error ||
            "Could not teach MoonPlug."
        );

        return;
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

            } catch {

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
                `Minimum match score: ${settings.minimum_score}` +
                `\nRemember conversations: ${settings.remember_conversations}`
            );
        }
    );


    $("trainerButton")?.addEventListener(
        "click",
        openTrainer
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

                closeTrainer();
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


    hideOwnerLogin();


    if (!isOwnerAuthenticated) {

        hideOwnerPanel();
    }


    console.log(
        "✓ MoonPlug ready."
    );

}


// ============================================================
// START APP
// ============================================================

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
