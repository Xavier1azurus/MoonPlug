
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
let backendStatus = null;


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
        method: options.method || "GET",
        credentials: "include",
        ...options,

        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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

    try {

        data = await response.json();

    } catch {

        data = {
            success: false,
            error: "The backend returned an invalid response."
        };
    }

    if (!response.ok) {

        const error = new Error(
            data?.error ||
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

    const div = document.createElement("div");

    div.textContent = String(value ?? "");

    return div.innerHTML;
}


// ============================================================
// BACKEND HEALTH
// ============================================================

async function checkBackendHealth() {

    try {

        const data = await apiRequest(
            "/api/health"
        );

        backendStatus = data;

        console.log(
            "MoonPlug backend health:",
            data
        );

        return data;

    } catch (error) {

        backendStatus = null;

        console.warn(
            "MoonPlug backend unavailable:",
            error
        );

        return null;
    }
}


// ============================================================
// OWNER SESSION
// ============================================================

async function checkOwnerSession() {

    try {

        const data = await apiRequest(
            "/api/owner/session"
        );

        isOwnerAuthenticated =
            data.authenticated === true;

        return isOwnerAuthenticated;

    } catch (error) {

        console.warn(
            "Could not check owner session:",
            error
        );

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

        } else {

            throw new Error(
                data.error ||
                "Incorrect owner password."
            );
        }

    } catch (error) {

        isOwnerAuthenticated = false;

        if (errorElement) {

            errorElement.textContent =
                error.message ||
                "Owner login failed.";
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
        closeTrainer();
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


// ============================================================
// OWNER DASHBOARD
// ============================================================

async function loadOwnerDashboard() {

    if (!isOwnerAuthenticated) {
        return;
    }

    try {

        const data = await apiRequest(
            "/api/owner/dashboard"
        );

        if (!data.success) {
            return;
        }

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

        if ($("ownerTraining")) {
            $("ownerTraining").textContent =
                stats.training ?? 0;
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


// ============================================================
// OWNER SETTINGS
// ============================================================

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
// CHAT UI
// ============================================================

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
        return;
    }

    const message =
        input.value.trim();

    if (!message) {
        return;
    }


    // --------------------------------------------------------
    // HIDDEN OWNER ACCESS
    // --------------------------------------------------------

    if (message === "15912014") {

        input.value = "";

        showOwnerLogin();

        return;
    }


    // --------------------------------------------------------
    // SAVE HISTORY BEFORE CURRENT MESSAGE
    // --------------------------------------------------------

    const previousHistory =
        currentChat.slice(-20);


    input.value = "";

    addMessage(
        message,
        "user"
    );

    showTyping();


    try {

        console.log(
            "Sending message to MoonPlug:",
            message
        );

        const data =
            await apiRequest(
                "/api/chat",
                {
                    method: "POST",

                    body: JSON.stringify({
                        message,
                        history:
                            previousHistory
                    })
                }
            );


        if (
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data?.error ||
                "MoonPlug returned an error."
            );
        }


        const response =
            typeof data.response === "string"
                ? data.response.trim()
                : "";


        if (!response) {

            throw new Error(
                "MoonPlug returned an empty response."
            );
        }


        console.log(
            "MoonPlug response:",
            data
        );


        addMessage(
            response,
            "ai"
        );


        // ----------------------------------------------------
        // SAVE CHAT HISTORY
        // ----------------------------------------------------

        currentChat.push({
            role: "user",
            content: message
        });

        currentChat.push({
            role: "assistant",
            content: response
        });


        // Keep browser memory from becoming huge.
        if (currentChat.length > 40) {
            currentChat =
                currentChat.slice(-40);
        }


        // ----------------------------------------------------
        // OPTIONAL DEBUG INFORMATION
        // ----------------------------------------------------

        if (data.source) {

            console.log(
                "MoonPlug source:",
                data.source
            );
        }

        if (
            data.trainingId !== null &&
            data.trainingId !== undefined
        ) {

            console.log(
                "Training ID:",
                data.trainingId
            );
        }


    } catch (error) {

        console.error(
            "MoonPlug chat error:",
            error
        );


        let messageText =
            "MoonPlug couldn't connect to the AI backend.";


        if (error.network) {

            messageText =
                "MoonPlug could not reach the backend.";

        } else if (error.status === 400) {

            messageText =
                error.message ||
                "MoonPlug rejected the message.";

        } else if (error.status >= 500) {

            messageText =
                error.message ||
                "The MoonPlug server had a problem.";
        }


        addMessage(
            messageText,
            "ai"
        );

    } finally {

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

    const panel =
        $("settingsPanel");

    if (!panel) {
        return;
    }

    panel.style.display = "none";

    panel.setAttribute(
        "aria-hidden",
        "true"
    );
}


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

    document.body.dataset.textSize =
        size;

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


// ============================================================
// ACCOUNT
// ============================================================

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


// ============================================================
// ACCOUNT TABS
// ============================================================

function showLoginTab() {

    $("loginForm")?.style &&
        ($("loginForm").style.display = "flex");

    $("signupForm")?.style &&
        ($("signupForm").style.display = "none");

    $("loginTab")?.classList.add("active");
    $("signupTab")?.classList.remove("active");
}


function showSignupTab() {

    $("loginForm")?.style &&
        ($("loginForm").style.display = "none");

    $("signupForm")?.style &&
        ($("signupForm").style.display = "flex");

    $("loginTab")?.classList.remove("active");
    $("signupTab")?.classList.add("active");
}


// ============================================================
// ACCOUNT FORMS
// ============================================================

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

                passwordInput.type = "text";
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
// TRAINER API
// ============================================================

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


async function deleteTraining(
    trainingId
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


// ============================================================
// TRAINER PANEL
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

    panel.id = "trainerPanel";
    panel.className = "trainer-panel";


    panel.innerHTML = `

        <div class="trainer-header">

            <div>
                <h2>AI Trainer</h2>

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


        <div class="trainer-generator">

            <h3>Generate Training</h3>

            <p>
                Choose a category and amount.
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

            <select id="trainingAmount">

                <option value="1">1</option>
                <option value="5">5</option>
                <option value="10" selected>10</option>
                <option value="25">25</option>
                <option value="50">50</option>

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

            <div id="generatedTrainingResults"></div>

        </div>


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

    $("trainerPanel")?.remove();
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

    const button =
        $("generateTraining");

    const status =
        $("trainingGenerateStatus");

    const resultsSection =
        $("generatedTrainingSection");

    const results =
        $("generatedTrainingResults");


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
        amount < 1 ||
        amount > 50
    ) {

        if (status) {
            status.textContent =
                "Choose an amount between 1 and 50.";
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


        if (
            data.success !== true
        ) {

            throw new Error(
                data.error ||
                "Training generation failed."
            );
        }


        const generated =
            Array.isArray(data.training)
                ? data.training
                : [];


        if (!generated.length) {

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
                `Generated and saved ${
                    generated.length
                } training example${
                    generated.length === 1
                        ? ""
                        : "s"
                }.`;
        }


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

        if (button) {

            button.disabled = false;
            button.textContent =
                "Generate";
        }
    }
}


// ============================================================
// GENERATED TRAINING DISPLAY
// ============================================================

function renderGeneratedTraining(
    training
) {

    const container =
        $("generatedTrainingResults");

    if (!container) {
        return;
    }

    container.innerHTML = "";


    training.forEach(
        (item, index) => {

            const question =
                item.question || "";

            const answer =
                item.answer || "";

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
                        `Training Example ${
                            index + 1
                        }`
                    )}
                </strong>

                <p>
                    ${escapeHTML(answer)}
                </p>

                <small>
                    Category:
                    ${escapeHTML(category)}
                </small>
            `;


            container.appendChild(
                card
            );
        }
    );
}


// ============================================================
// TRAINING LIST
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

    list.innerHTML = "";


    if (!training.length) {

        list.innerHTML = `
            <p>
                MoonPlug hasn't been taught anything yet.
            </p>
        `;

        return;
    }


    training.forEach(item => {

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
                    !confirm(
                        "Delete this training example?"
                    )
                ) {
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
    });
}


// ============================================================
// MANUAL TRAINING
// ============================================================

async function teachMoonPlug() {

    if (!isOwnerAuthenticated) {

        showOwnerLogin();

        return;
    }


    const question =
        $("trainerQuestion")
            ?.value
            .trim();

    const answer =
        $("trainerAnswer")
            ?.value
            .trim();

    const category =
        $("trainerCategory")
            ?.value
            .trim() ||
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


    $("trainerQuestion").value = "";
    $("trainerAnswer").value = "";
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

            if (
                event.key === "Enter"
            ) {

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
                `MoonPlug currently has ${
                    users.length
                } user(s).`
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

                alert(
                    error.message ||
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


    const health =
        await checkBackendHealth();


    if (health) {

        console.log(
            "✓ MoonPlug backend online."
        );

        console.log(
            "Database:",
            health.database
        );

        console.log(
            "Ollama configured:",
            health.ollama_configured
        );

        console.log(
            "Model:",
            health.ollama_model
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
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeMoonPlug
    );

} else {

    initializeMoonPlug();
}


