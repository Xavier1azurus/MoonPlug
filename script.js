# /*

```
                MOONPLUG AI
          FRONTEND CONTROLLER
```

=============================================================
*/

/* ============================================================
CONFIGURATION
============================================================ */

const API_BASE = "https://moonplug.onrender.com";

/* ============================================================
GLOBAL STATE
============================================================ */

let currentChat = [];
let isOwnerAuthenticated = false;
let currentTextSize = "medium";
let moonPlugInitialized = false;

/* ============================================================
DOM HELPER
============================================================ */

function $(id) {
return document.getElementById(id);
}

/* ============================================================
API REQUEST
============================================================ */

async function apiRequest(endpoint, options = {}) {

const url = `${API_BASE}${endpoint}`;

const config = {
    method: options.method || "GET",
    credentials: "include",
    ...options,

    headers: {
        ...(options.body !== undefined
            ? {
                "Content-Type": "application/json"
            }
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

        const text =
            await response.text();

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
```

}

/* ============================================================
HTML SAFETY
============================================================ */

function escapeHTML(value) {

```
const div =
    document.createElement("div");

div.textContent =
    String(value ?? "");

return div.innerHTML;
```

}

/* ============================================================
BACKEND HEALTH
============================================================ */

async function checkBackendHealth() {

```
try {

    const data =
        await apiRequest(
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
```

}

/* ============================================================
OWNER SESSION
============================================================ */

async function checkOwnerSession() {

```
try {

    const data =
        await apiRequest(
            "/api/owner/session"
        );

    isOwnerAuthenticated =
        data.authenticated === true;

    return isOwnerAuthenticated;

} catch (error) {

    isOwnerAuthenticated = false;

    return false;
}
```

}

/* ============================================================
OWNER LOGIN
============================================================ */

async function loginOwner() {

```
const codeInput =
    $("ownerCode");

const errorElement =
    $("ownerError");

const loginButton =
    $("ownerLoginButton");


if (!codeInput) {

    console.error(
        "MoonPlug: #ownerCode was not found."
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

    const data =
        await apiRequest(
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

        return;
    }


    throw new Error(
        data.error ||
        "Incorrect owner password."
    );

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
```

}

/* ============================================================
OWNER LOGOUT
============================================================ */

async function logoutOwner() {

```
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
    hideOwnerLogin();
    closeTrainer();
}
```

}

/* ============================================================
OWNER LOGIN SCREEN
============================================================ */

function showOwnerLogin() {

```
const overlay =
    $("ownerLogin");

const codeInput =
    $("ownerCode");

const errorElement =
    $("ownerError");


if (!overlay) {

    console.error(
        "MoonPlug: #ownerLogin was not found."
    );

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

        try {
            codeInput.focus();
        } catch {}
        
    }, 100);
}
```

}

function hideOwnerLogin() {

```
const overlay =
    $("ownerLogin");

if (!overlay) {
    return;
}


overlay.style.display = "none";

overlay.setAttribute(
    "aria-hidden",
    "true"
);
```

}

/* ============================================================
OWNER PANEL
============================================================ */

async function openOwnerPanel() {

```
if (!isOwnerAuthenticated) {

    showOwnerLogin();

    return;
}


const panel =
    $("ownerPanel");


if (!panel) {

    console.error(
        "MoonPlug: #ownerPanel was not found."
    );

    return;
}


panel.style.display = "flex";

panel.setAttribute(
    "aria-hidden",
    "false"
);


await loadOwnerDashboard();
```

}

function hideOwnerPanel() {

```
const panel =
    $("ownerPanel");


if (!panel) {
    return;
}


panel.style.display = "none";

panel.setAttribute(
    "aria-hidden",
    "true"
);


closeTrainer();
```

}

/* ============================================================
OWNER DASHBOARD
============================================================ */

async function loadOwnerDashboard() {

```
if (!isOwnerAuthenticated) {
    return;
}


try {

    const data =
        await apiRequest(
            "/api/owner/dashboard"
        );


    if (data.success === false) {
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
```

}

/* ============================================================
OWNER USERS
============================================================ */

async function loadOwnerUsers() {

```
if (!isOwnerAuthenticated) {
    return [];
}


try {

    const data =
        await apiRequest(
            "/api/owner/users"
        );


    return Array.isArray(data.users)
        ? data.users
        : [];


} catch (error) {

    if (error.status === 401) {

        isOwnerAuthenticated = false;

        hideOwnerPanel();
        showOwnerLogin();
    }


    console.error(
        "Could not load owner users:",
        error
    );


    return [];
}
```

}

/* ============================================================
OWNER SETTINGS
============================================================ */

async function loadOwnerSettings() {

```
if (!isOwnerAuthenticated) {
    return null;
}


try {

    const data =
        await apiRequest(
            "/api/owner/settings"
        );


    return data.settings || null;


} catch (error) {

    if (error.status === 401) {

        isOwnerAuthenticated = false;

        hideOwnerPanel();
        showOwnerLogin();
    }


    console.error(
        "Could not load owner settings:",
        error
    );


    return null;
}
```

}

async function updateOwnerSettings(settings) {

```
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
        showOwnerLogin();
    }


    return {
        success: false,

        error:
            error.message ||
            "Could not update settings."
    };
}
```

}

/* ============================================================
CHAT UI
============================================================ */

function removeEmptyChat() {

```
const empty =
    document.querySelector(".empty-chat");


if (empty) {

    empty.remove();
}
```

}

function addMessage(text, sender) {

```
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


bubble.className =
    sender === "user"
        ? "message-bubble user"
        : "message-bubble ai";


const content =
    document.createElement("div");


content.className =
    "message-content";


content.textContent =
    String(text ?? "");


bubble.appendChild(
    content
);


messages.appendChild(
    bubble
);


requestAnimationFrame(() => {

    messages.scrollTop =
        messages.scrollHeight;
});
```

}

/* ============================================================
TYPING INDICATOR
============================================================ */

function showTyping() {

```
const typing =
    $("typing");


if (typing) {

    typing.style.display =
        "flex";
}
```

}

function hideTyping() {

```
const typing =
    $("typing");


if (typing) {

    typing.style.display =
        "none";
}
```

}

/* ============================================================
SEND MESSAGE
============================================================ */

async function sendMessage() {

```
const input =
    $("messageInput");


if (!input) {

    console.error(
        "MoonPlug: #messageInput was not found."
    );

    return;
}


const message =
    input.value.trim();


if (!message) {
    return;
}


/* ========================================================
   HIDDEN OWNER ACCESS
======================================================== */

if (message === "15912014") {

    input.value = "";

    showOwnerLogin();

    return;
}


/* ========================================================
   SAVE PREVIOUS HISTORY
======================================================== */

const previousHistory =
    currentChat.map(item => ({

        role: item.role,
        content: item.content

    }));


/* ========================================================
   CLEAR INPUT
======================================================== */

input.value = "";


/* ========================================================
   SHOW USER MESSAGE
======================================================== */

addMessage(
    message,
    "user"
);


/* ========================================================
   SHOW TYPING
======================================================== */

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

                    message: message,

                    history:
                        previousHistory

                })
            }
        );


    console.log(
        "MoonPlug response:",
        data
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


    /* ====================================================
       SHOW AI RESPONSE
    ==================================================== */

    addMessage(
        responseText,
        "ai"
    );


    /* ====================================================
       SAVE CONVERSATION
    ==================================================== */

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


    let messageToShow =
        error.message ||
        "MoonPlug couldn't connect to the AI backend.";


    if (error.network) {

        messageToShow =
            "MoonPlug couldn't connect to the backend. Check that your backend is running.";
    }


    addMessage(
        messageToShow,
        "ai"
    );

} finally {

    hideTyping();
}
```

}

/* ============================================================
NEW CHAT
============================================================ */

function startNewChat() {

```
const messages =
    $("messages");


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
```

}

/* ============================================================
SETTINGS
============================================================ */

function openSettings() {

```
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
```

}

function closeSettings() {

```
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
```

}

/* ============================================================
TEXT SIZE
============================================================ */

function updateTextSize(size) {

```
if (
    size !== "small" &&
    size !== "medium" &&
    size !== "large"
) {

    return;
}


currentTextSize =
    size;


document.body.dataset.textSize =
    size;


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


try {

    localStorage.setItem(
        "moonplug_text_size",
        size
    );

} catch {}
```

}

function loadTextSize() {

```
let saved = null;


try {

    saved =
        localStorage.getItem(
            "moonplug_text_size"
        );

} catch {}


if (
    saved === "small" ||
    saved === "medium" ||
    saved === "large"
) {

    updateTextSize(saved);

} else {

    updateTextSize("medium");
}
```

}

/* ============================================================
ACCOUNT
============================================================ */

function openAccount() {

```
const account =
    $("accountScreen");


if (!account) {
    return;
}


account.style.display =
    "flex";


account.setAttribute(
    "aria-hidden",
    "false"
);
```

}

function closeAccount() {

```
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
```

}

/* ============================================================
ACCOUNT TABS
============================================================ */

function showLoginTab() {

```
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
```

}

function showSignupTab() {

```
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
```

}

/* ============================================================
ACCOUNT FORMS
============================================================ */

function setupAccountForms() {

```
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
```

}

/* ============================================================
PASSWORD TOGGLE
============================================================ */

function setupPasswordToggle() {

```
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
    event => {

        event.preventDefault();


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
```

}

/* ============================================================
SIDEBAR
============================================================ */

function toggleSidebar() {

```
const sidebar =
    document.querySelector(".sidebar");


if (!sidebar) {
    return;
}


const isTablet =
    window.innerWidth <= 1200;


if (isTablet) {

    sidebar.classList.toggle(
        "expanded"
    );

} else {

    sidebar.classList.toggle(
        "collapsed"
    );
}
```

}

function setupSidebar() {

```
const sidebar =
    document.querySelector(".sidebar");


if (!sidebar) {
    return;
}


const logo =
    document.querySelector(
        ".sidebar-logo"
    );


if (logo) {

    logo.addEventListener(
        "click",
        event => {

            event.preventDefault();

            toggleSidebar();
        }
    );
}
```

}

/* ============================================================
TRAINER API
============================================================ */

async function loadTraining() {

```
if (!isOwnerAuthenticated) {
    return [];
}


try {

    const data =
        await apiRequest(
            "/api/owner/training"
        );


    return Array.isArray(
        data.training
    )
        ? data.training
        : [];


} catch (error) {

    if (error.status === 401) {

        isOwnerAuthenticated =
            false;

        hideOwnerPanel();
        showOwnerLogin();
    }


    console.error(
        "Could not load training:",
        error
    );


    return [];
}
```

}

async function addTraining(
question,
answer,
category = "general"
) {

```
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

                question:
                    question,

                answer:
                    answer,

                category:
                    category

            })
        }
    );


} catch (error) {

    if (error.status === 401) {

        isOwnerAuthenticated =
            false;

        hideOwnerPanel();
        showOwnerLogin();
    }


    return {

        success: false,

        error:
            error.message ||
            "Could not add training."

    };
}
```

}

async function deleteTraining(
trainingId
) {

```
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
        `/api/owner/training/${encodeURIComponent(
            trainingId
        )}`,
        {
            method: "DELETE"
        }
    );


} catch (error) {

    if (error.status === 401) {

        isOwnerAuthenticated =
            false;

        hideOwnerPanel();
        showOwnerLogin();
    }


    return {

        success: false,

        error:
            error.message ||
            "Could not delete training."

    };
}
```

}

/* ============================================================
TRAINER PANEL
============================================================ */

function openTrainer() {

```
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

        <h3>
            Generate Training
        </h3>

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
```

}

function closeTrainer() {

```
const panel =
    $("trainerPanel");


if (panel) {

    panel.remove();
}
```

}

/* ============================================================
GENERATE TRAINING
============================================================ */

async function generateTraining() {

```
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

                    category:
                        category,

                    amount:
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
```

}

/* ============================================================
GENERATED TRAINING DISPLAY
============================================================ */

function renderGeneratedTraining(
training
) {

```
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


        const title =
            document.createElement("strong");


        title.textContent =
            question ||
            `Training Example ${index + 1}`;


        const answerElement =
            document.createElement("p");


        answerElement.textContent =
            answer;


        const categoryElement =
            document.createElement("small");


        categoryElement.textContent =
            `Category: ${category}`;


        card.appendChild(title);
        card.appendChild(answerElement);
        card.appendChild(categoryElement);


        container.appendChild(card);
    }
);
```

}

/* ============================================================
TRAINING LIST
============================================================ */

async function loadAndRenderTraining() {

```
const training =
    await loadTraining();


renderTrainingList(
    training
);
```

}

async function refreshTraining() {

```
await loadAndRenderTraining();
```

}

function renderTrainingList(
training
) {

```
const list =
    $("trainingList");


if (!list) {
    return;
}


list.innerHTML = "";


if (!training.length) {

    const empty =
        document.createElement("p");


    empty.textContent =
        "MoonPlug hasn't been taught anything yet.";


    list.appendChild(
        empty
    );


    return;
}


training.forEach(item => {

    const card =
        document.createElement("div");


    card.className =
        "training-card";


    const question =
        document.createElement("strong");


    question.textContent =
        item?.question ||
        "Untitled training";


    const answer =
        document.createElement("p");


    answer.textContent =
        item?.answer || "";


    const category =
        document.createElement("small");


    category.textContent =
        `Category: ${
            item?.category ||
            "general"
        }`;


    const deleteButton =
        document.createElement("button");


    deleteButton.type =
        "button";


    deleteButton.className =
        "delete-training-button";


    deleteButton.textContent =
        "Delete";


    card.appendChild(
        question
    );

    card.appendChild(
        answer
    );

    card.appendChild(
        category
    );

    card.appendChild(
        document.createElement("br")
    );

    card.appendChild(
        deleteButton
    );


    deleteButton.addEventListener(
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


            const confirmed =
                confirm(
                    "Delete this training example?"
                );


            if (!confirmed) {
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


    list.appendChild(
        card
    );
});
```

}

/* ============================================================
MANUAL TRAINING
============================================================ */

async function teachMoonPlug() {

```
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


    const questionInput =
        $("trainerQuestion");

    const answerInput =
        $("trainerAnswer");

    const categoryInput =
        $("trainerCategory");


    if (questionInput) {

        questionInput.value =
            "";
    }


    if (answerInput) {

        answerInput.value =
            "";
    }


    if (categoryInput) {

        categoryInput.value =
            "general";
    }


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
```

}

/* ============================================================
BUTTON EVENTS
============================================================ */

function setupButtons() {

```
const sendButton =
    $("sendButton");


if (sendButton) {

    sendButton.addEventListener(
        "click",
        sendMessage
    );
}


const messageInput =
    $("messageInput");


if (messageInput) {

    messageInput.addEventListener(
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
}


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
```

}

/* ============================================================
OWNER PANEL BUTTONS
============================================================ */

function setupOwnerPanelButtons() {

```
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
```

}

/* ============================================================
KEYBOARD SHORTCUTS
============================================================ */

function setupKeyboardShortcuts() {

```
document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {
            return;
        }


        hideOwnerLogin();
        closeSettings();
        closeAccount();
        closeTrainer();
    }
);
```

}

/* ============================================================
CLOSE OVERLAYS WHEN CLICKING OUTSIDE
============================================================ */

function setupOverlayClicks() {

```
const settings =
    $("settingsPanel");


if (settings) {

    settings.addEventListener(
        "click",
        event => {

            if (
                event.target === settings
            ) {

                closeSettings();
            }
        }
    );
}


const ownerLogin =
    $("ownerLogin");


if (ownerLogin) {

    ownerLogin.addEventListener(
        "click",
        event => {

            if (
                event.target === ownerLogin
            ) {

                hideOwnerLogin();
            }
        }
    );
}
```

}

/* ============================================================
INITIALIZATION
============================================================ */

async function initializeMoonPlug() {

```
if (moonPlugInitialized) {
    return;
}


moonPlugInitialized = true;


console.log(
    "🌙 MoonPlug AI starting..."
);


/* --------------------------------------------------------
   UI SETUP
-------------------------------------------------------- */

setupButtons();

setupOwnerPanelButtons();

setupAccountForms();

setupPasswordToggle();

setupKeyboardShortcuts();

setupOverlayClicks();

setupSidebar();

loadTextSize();


/* --------------------------------------------------------
   BACKEND CHECK
-------------------------------------------------------- */

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


/* --------------------------------------------------------
   OWNER SESSION
-------------------------------------------------------- */

await checkOwnerSession();


/* --------------------------------------------------------
   HIDE PRIVATE OWNER UI ON STARTUP
-------------------------------------------------------- */

hideOwnerLogin();


if (!isOwnerAuthenticated) {

    hideOwnerPanel();
}


console.log(
    "✓ MoonPlug ready."
);
```

}

/* ============================================================
START APP
============================================================ */

if (
document.readyState ===
"loading"
) {

```
document.addEventListener(
    "DOMContentLoaded",
    initializeMoonPlug,
    {
        once: true
    }
);
```

} else {

```
initializeMoonPlug();


}
