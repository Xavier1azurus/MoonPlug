/* =========================================================
   🌙 MOONPLUG AI
   LOCAL JAVASCRIPT TRAINER
   =========================================================

   NO API
   NO PYTHON
   NO SERVER REQUIRED

   Features:
   - Chat
   - Training examples
   - Keyword matching
   - Similarity matching
   - Exact matching
   - Conversation memory
   - Statistics
   - Search
   - Delete training
   - Export
   - Import
   - Browser persistence
   - Owner panel
   - Trainer chat
   - Settings
   - Account screen
   - Responsive website support

   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const APP_NAME = "MoonPlug AI";
    const APP_VERSION = "2.0.0";

    /*
       IMPORTANT:
       Change this to your private owner code.
    */
    const OWNER_CODE = "BumsUp1AI1591";

    /*
       Browser storage key.
    */
    const MEMORY_KEY = "moonplug_ai_memory_v2";


    /* =====================================================
       BASIC ELEMENTS
    ===================================================== */

    const sidebar =
        document.querySelector(".sidebar");

    const messages =
        document.getElementById("messages");

    const messageInput =
        document.getElementById("messageInput");

    const sendButton =
        document.getElementById("sendButton");

    const typing =
        document.getElementById("typing");


    /* =====================================================
       SETTINGS
    ===================================================== */

    const settingsButton =
        document.getElementById("settingsButton");

    const settingsPanel =
        document.getElementById("settingsPanel");

    const closeSettings =
        document.getElementById("closeSettings");

    const themeButton =
        document.getElementById("themeButton");


    /* =====================================================
       ACCOUNT
    ===================================================== */

    const accountScreen =
        document.getElementById("accountScreen");

    const ownerButton =
        document.getElementById("ownerButton");

    const loginTab =
        document.getElementById("loginTab");

    const signupTab =
        document.getElementById("signupTab");

    const loginForm =
        document.getElementById("loginForm");

    const signupForm =
        document.getElementById("signupForm");

    const closeAccount =
        document.getElementById("closeAccount");

    const accountMessage =
        document.getElementById("accountMessage");


    /* =====================================================
       OWNER PANEL
    ===================================================== */

    const ownerPanel =
        document.getElementById("ownerPanel");

    const ownerLogout =
        document.getElementById("ownerLogout");

    const ownerUsers =
        document.getElementById("ownerUsers");

    const ownerChats =
        document.getElementById("ownerChats");


    /* =====================================================
       MEMORY
    ===================================================== */

    let memory = loadMemory();


    /* =====================================================
       CREATE EMPTY MEMORY
    ===================================================== */

    function createEmptyMemory() {

        return {

            version: APP_VERSION,

            created:
                new Date().toISOString(),

            updated:
                new Date().toISOString(),

            settings: {

                minimumScore: 0.30,

                rememberConversations: true,

                caseSensitive: false

            },

            training: [],

            conversations: [],

            users: [],

            statistics: {

                totalMessages: 0,

                totalResponses: 0,

                totalTraining: 0

            }

        };

    }


    /* =====================================================
       LOAD MEMORY
    ===================================================== */

    function loadMemory() {

        try {

            const stored =
                localStorage.getItem(
                    MEMORY_KEY
                );

            if (!stored) {

                const fresh =
                    createEmptyMemory();

                saveMemory(fresh);

                return fresh;

            }

            const parsed =
                JSON.parse(stored);

            return normalizeMemory(parsed);

        } catch (error) {

            console.error(
                "MoonPlug memory error:",
                error
            );

            return createEmptyMemory();

        }

    }


    /* =====================================================
       NORMALIZE MEMORY
    ===================================================== */

    function normalizeMemory(data) {

        if (
            !data ||
            typeof data !== "object"
        ) {

            return createEmptyMemory();

        }


        const fresh =
            createEmptyMemory();


        fresh.version =
            data.version ||
            APP_VERSION;

        fresh.created =
            data.created ||
            fresh.created;

        fresh.updated =
            data.updated ||
            fresh.updated;


        if (
            data.settings &&
            typeof data.settings === "object"
        ) {

            fresh.settings =
                {
                    ...fresh.settings,
                    ...data.settings
                };

        }


        if (
            Array.isArray(
                data.training
            )
        ) {

            fresh.training =
                data.training;

        }


        if (
            Array.isArray(
                data.conversations
            )
        ) {

            fresh.conversations =
                data.conversations;

        }


        if (
            Array.isArray(
                data.users
            )
        ) {

            fresh.users =
                data.users;

        }


        if (
            data.statistics &&
            typeof data.statistics === "object"
        ) {

            fresh.statistics =
                {
                    ...fresh.statistics,
                    ...data.statistics
                };

        }


        return fresh;

    }


    /* =====================================================
       SAVE MEMORY
    ===================================================== */

    function saveMemory(data = memory) {

        try {

            data.updated =
                new Date().toISOString();

            localStorage.setItem(
                MEMORY_KEY,
                JSON.stringify(data)
            );

        } catch (error) {

            console.error(
                "Could not save MoonPlug memory:",
                error
            );

        }

    }


    /* =====================================================
       BACKUP MEMORY
    ===================================================== */

    function createBackup() {

        const backup = {

            exported:
                new Date().toISOString(),

            version:
                APP_VERSION,

            memory:
                memory

        };


        downloadJSON(
            backup,
            `moonplug_backup_${Date.now()}.json`
        );

    }


    /* =====================================================
       CLEAN TEXT
    ===================================================== */

    function cleanText(text) {

        if (
            typeof text !== "string"
        ) {

            return "";

        }

        return text
            .trim()
            .replace(/\s+/g, " ");

    }


    /* =====================================================
       TOKENIZE
    ===================================================== */

    const STOP_WORDS = new Set([

        "a",
        "an",
        "the",
        "and",
        "or",
        "but",
        "if",
        "then",
        "is",
        "are",
        "am",
        "was",
        "were",
        "be",
        "to",
        "of",
        "in",
        "on",
        "for",
        "with",
        "at",
        "by",
        "from",
        "it",
        "this",
        "that",
        "i",
        "you",
        "we",
        "they",
        "he",
        "she",
        "my",
        "your",
        "our",
        "me"

    ]);


    function tokenize(text) {

        const cleaned =
            cleanText(text)
                .toLowerCase();

        const words =
            cleaned.match(
                /[a-zA-Z0-9']+/g
            ) || [];


        return words.filter(
            word =>
                !STOP_WORDS.has(
                    word
                )
        );

    }


    /* =====================================================
       WORD SET
    ===================================================== */

    function wordSet(text) {

        return new Set(
            tokenize(text)
        );

    }


    /* =====================================================
       EXACT MATCH
    ===================================================== */

    function exactMatchScore(
        userText,
        trainingText
    ) {

        const user =
            cleanText(
                userText
            ).toLowerCase();

        const training =
            cleanText(
                trainingText
            ).toLowerCase();


        if (
            !user ||
            !training
        ) {

            return 0;

        }


        return user === training
            ? 1
            : 0;

    }


    /* =====================================================
       KEYWORD SCORE
    ===================================================== */

    function keywordScore(
        userText,
        trainingText
    ) {

        const userWords =
            wordSet(userText);

        const trainingWords =
            wordSet(trainingText);


        if (
            userWords.size === 0 ||
            trainingWords.size === 0
        ) {

            return 0;

        }


        let common = 0;


        for (
            const word of userWords
        ) {

            if (
                trainingWords.has(word)
            ) {

                common++;

            }

        }


        if (common === 0) {

            return 0;

        }


        const userRatio =
            common /
            userWords.size;

        const trainingRatio =
            common /
            trainingWords.size;


        return (
            userRatio +
            trainingRatio
        ) / 2;

    }


    /* =====================================================
       SEQUENCE SIMILARITY
       JavaScript version of SequenceMatcher
    ===================================================== */

    function sequenceScore(
        userText,
        trainingText
    ) {

        const a =
            cleanText(
                userText
            ).toLowerCase();

        const b =
            cleanText(
                trainingText
            ).toLowerCase();


        if (!a || !b) {

            return 0;

        }


        return similarityRatio(
            a,
            b
        );

    }


    /* =====================================================
       STRING SIMILARITY
    ===================================================== */

    function similarityRatio(
        a,
        b
    ) {

        if (a === b) {

            return 1;

        }


        if (!a.length || !b.length) {

            return 0;

        }


        const matrix =
            Array.from(
                {
                    length:
                        a.length + 1
                },
                () =>
                    new Array(
                        b.length + 1
                    ).fill(0)
            );


        for (
            let i = 0;
            i <= a.length;
            i++
        ) {

            matrix[i][0] = i;

        }


        for (
            let j = 0;
            j <= b.length;
            j++
        ) {

            matrix[0][j] = j;

        }


        for (
            let i = 1;
            i <= a.length;
            i++
        ) {

            for (
                let j = 1;
                j <= b.length;
                j++
            ) {

                const cost =
                    a[i - 1] ===
                    b[j - 1]
                        ? 0
                        : 1;


                matrix[i][j] =
                    Math.min(

                        matrix[i - 1][j] + 1,

                        matrix[i][j - 1] + 1,

                        matrix[i - 1][j - 1] +
                            cost

                    );

            }

        }


        const distance =
            matrix[a.length][b.length];

        const longest =
            Math.max(
                a.length,
                b.length
            );


        return (
            1 -
            distance / longest
        );

    }


    /* =====================================================
       COMBINED SCORE
    ===================================================== */

    function combinedScore(
        userText,
        trainingText
    ) {

        const exact =
            exactMatchScore(
                userText,
                trainingText
            );


        const keyword =
            keywordScore(
                userText,
                trainingText
            );


        const sequence =
            sequenceScore(
                userText,
                trainingText
            );


        const score =
            exact * 0.60 +
            keyword * 0.25 +
            sequence * 0.15;


        return Math.min(
            score,
            1
        );

    }


    /* =====================================================
       NEXT TRAINING ID
    ===================================================== */

    function nextTrainingId() {

        if (
            memory.training.length === 0
        ) {

            return 1;

        }


        const ids =
            memory.training
                .map(
                    item =>
                        Number(item.id)
                )
                .filter(
                    Number.isFinite
                );


        if (!ids.length) {

            return 1;

        }


        return (
            Math.max(...ids) + 1
        );

    }


    /* =====================================================
       ADD TRAINING
    ===================================================== */

    function addTraining(
        question,
        answer,
        category = "general"
    ) {

        question =
            cleanText(question);

        answer =
            cleanText(answer);

        category =
            cleanText(category) ||
            "general";


        if (!question) {

            return {

                success: false,

                error:
                    "Question cannot be empty."

            };

        }


        if (!answer) {

            return {

                success: false,

                error:
                    "Answer cannot be empty."

            };

        }


        const example = {

            id:
                nextTrainingId(),

            question,

            answer,

            category,

            created:
                new Date().toISOString(),

            uses: 0

        };


        memory.training.push(
            example
        );


        memory.statistics.totalTraining =
            memory.training.length;


        saveMemory();


        return {

            success: true,

            example

        };

    }


    /* =====================================================
       FIND BEST RESPONSE
    ===================================================== */

    function findBestResponse(
        userMessage
    ) {

        const cleaned =
            cleanText(
                userMessage
            );


        if (!cleaned) {

            return null;

        }


        let bestExample = null;

        let bestScore = 0;


        for (
            const example
            of memory.training
        ) {

            const question =
                example.question ||
                "";


            const score =
                combinedScore(
                    cleaned,
                    question
                );


            if (
                score > bestScore
            ) {

                bestScore =
                    score;

                bestExample =
                    example;

            }

        }


        const minimumScore =
            Number(
                memory.settings
                    .minimumScore
            ) || 0.30;


        if (
            !bestExample ||
            bestScore < minimumScore
        ) {

            return null;

        }


        bestExample.uses =
            Number(
                bestExample.uses || 0
            ) + 1;


        memory.statistics.totalResponses++;

        saveMemory();


        return {

            answer:
                bestExample.answer,

            score:
                bestScore,

            trainingId:
                bestExample.id,

            question:
                bestExample.question

        };

    }


    /* =====================================================
       SAVE CONVERSATION
    ===================================================== */

    function saveConversation(
        userMessage,
        assistantMessage,
        source = "local"
    ) {

        if (
            !memory.settings
                .rememberConversations
        ) {

            return;

        }


        memory.conversations.push({

            user:
                userMessage,

            assistant:
                assistantMessage,

            source,

            time:
                new Date().toISOString()

        });


        /*
         * Prevent unlimited browser storage growth.
         * Keep the newest 5,000 conversations.
         */

        if (
            memory.conversations.length >
            5000
        ) {

            memory.conversations =
                memory.conversations.slice(
                    -5000
                );

        }


        memory.statistics.totalMessages++;

        saveMemory();

    }


    /* =====================================================
       ADD CHAT MESSAGE
    ===================================================== */

    function addMessage(
        text,
        type
    ) {

        if (!messages) {

            return;

        }


        const bubble =
            document.createElement(
                "div"
            );


        bubble.className =
            "message-bubble " +
            type;


        bubble.textContent =
            text;


        messages.appendChild(
            bubble
        );


        messages.scrollTop =
            messages.scrollHeight;

    }


    /* =====================================================
       REMOVE EMPTY CHAT
    ===================================================== */

    function removeEmptyChat() {

        const emptyChat =
            document.querySelector(
                ".empty-chat"
            );


        if (emptyChat) {

            emptyChat.remove();

        }

    }


    /* =====================================================
       MOONPLUG RESPONSE
    ===================================================== */

    function generateResponse(
        userMessage
    ) {

        const result =
            findBestResponse(
                userMessage
            );


        if (result) {

            return result;

        }


        return {

            answer:
                "I don't have a strong answer for that yet.",

            score: 0,

            trainingId: null,

            question: null

        };

    }


    /* =====================================================
       SEND MESSAGE
    ===================================================== */

    function sendMessage() {

        if (
            !messageInput ||
            !messages
        ) {

            return;

        }


        const text =
            cleanText(
                messageInput.value
            );


        if (!text) {

            return;

        }


        /*
         * Hidden owner code detection.
         */

        if (
            isOwnerCode(text)
        ) {

            messageInput.value = "";

            openOwnerPanel();

            return;

        }


        removeEmptyChat();


        addMessage(
            text,
            "user"
        );


        messageInput.value = "";


        if (typing) {

            typing.style.display =
                "block";

        }


        setTimeout(
            () => {

                const result =
                    generateResponse(
                        text
                    );


                if (typing) {

                    typing.style.display =
                        "none";

                }


                addMessage(
                    result.answer,
                    "ai"
                );


                saveConversation(
                    text,
                    result.answer,
                    "local"
                );


            },
            450
        );

    }


    /* =====================================================
       SEND BUTTON
    ===================================================== */

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                sendMessage();

            }
        );

    }


    /* =====================================================
       ENTER TO SEND
    ===================================================== */

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


    /* =====================================================
       SIDEBAR
    ===================================================== */

    if (sidebar) {

        sidebar.addEventListener(
            "click",
            event => {

                /*
                 * Buttons don't toggle
                 * the sidebar.
                 */

                if (
                    event.target.closest(
                        ".sidebar-button"
                    )
                ) {

                    return;

                }


                /*
                 * Any empty sidebar
                 * area expands/collapses.
                 */

                sidebar.classList.toggle(
                    "expanded"
                );

            }
        );

    }


    /* =====================================================
       SETTINGS
    ===================================================== */

    if (
        settingsButton &&
        settingsPanel
    ) {

        settingsButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();

                settingsPanel.classList.add(
                    "open"
                );

            }
        );

    }


    if (
        closeSettings &&
        settingsPanel
    ) {

        closeSettings.addEventListener(
            "click",
            () => {

                settingsPanel.classList.remove(
                    "open"
                );

            }
        );

    }


    if (settingsPanel) {

        settingsPanel.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    settingsPanel
                ) {

                    settingsPanel.classList.remove(
                        "open"
                    );

                }

            }
        );

    }


    /* =====================================================
       THEME
    ===================================================== */

    if (themeButton) {

        themeButton.addEventListener(
            "click",
            () => {

                document.body.classList.toggle(
                    "light-theme"
                );


                const light =
                    document.body.classList.contains(
                        "light-theme"
                    );


                themeButton.textContent =
                    light
                        ? "Light"
                        : "Dark";

            }
        );

    }


    /* =====================================================
       ACCOUNT SCREEN
    ===================================================== */

    if (
        ownerButton &&
        accountScreen
    ) {

        ownerButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();

                accountScreen.classList.add(
                    "open"
                );

            }
        );

    }


    /* =====================================================
       LOGIN TAB
    ===================================================== */

    if (
        loginTab &&
        signupTab &&
        loginForm &&
        signupForm
    ) {

        loginTab.addEventListener(
            "click",
            () => {

                loginTab.classList.add(
                    "active"
                );

                signupTab.classList.remove(
                    "active"
                );


                loginForm.style.display =
                    "flex";

                signupForm.style.display =
                    "none";


                if (accountMessage) {

                    accountMessage.textContent =
                        "";

                }

            }
        );


        /* =================================================
           SIGNUP TAB
        ================================================= */

        signupTab.addEventListener(
            "click",
            () => {

                signupTab.classList.add(
                    "active"
                );

                loginTab.classList.remove(
                    "active"
                );


                signupForm.style.display =
                    "flex";

                loginForm.style.display =
                    "none";


                if (accountMessage) {

                    accountMessage.textContent =
                        "";

                }

            }
        );

    }


    /* =====================================================
       CLOSE ACCOUNT
    ===================================================== */

    if (
        closeAccount &&
        accountScreen
    ) {

        closeAccount.addEventListener(
            "click",
            () => {

                accountScreen.classList.remove(
                    "open"
                );

            }
        );

    }


    /* =====================================================
       OWNER CODE
    ===================================================== */

    function isOwnerCode(value) {

        if (
            typeof value !==
            "string"
        ) {

            return false;

        }


        return (
            value.trim() ===
            OWNER_CODE
        );

    }


    /* =====================================================
       OPEN OWNER PANEL
    ===================================================== */

    function openOwnerPanel() {

        if (accountScreen) {

            accountScreen.classList.remove(
                "open"
            );

        }


        if (ownerPanel) {

            ownerPanel.classList.add(
                "open"
            );

        }


        updateOwnerStats();

    }


    /* =====================================================
       OWNER LOGOUT
    ===================================================== */

    if (
        ownerLogout &&
        ownerPanel
    ) {

        ownerLogout.addEventListener(
            "click",
            () => {

                ownerPanel.classList.remove(
                    "open"
                );

            }
        );

    }


    /* =====================================================
       LOGIN FORM
    ===================================================== */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const email =
                    document.getElementById(
                        "loginEmail"
                    )?.value || "";


                const password =
                    document.getElementById(
                        "loginPassword"
                    )?.value || "";


                /*
                 * Owner code can be placed
                 * in either field.
                 */

                if (
                    isOwnerCode(email) ||
                    isOwnerCode(password)
                ) {

                    openOwnerPanel();

                    return;

                }


                /*
                 * Local demo account system.
                 */

                const user =
                    memory.users.find(
                        item =>
                            item.email ===
                            email.trim()
                    );


                if (
                    !user ||
                    user.password !==
                    password
                ) {

                    if (accountMessage) {

                        accountMessage.textContent =
                            "Incorrect email or password.";

                    }

                    return;

                }


                if (accountMessage) {

                    accountMessage.textContent =
                        "You are logged in.";

                }

            }
        );

    }


    /* =====================================================
       SIGNUP FORM
    ===================================================== */

    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const email =
                    document.getElementById(
                        "signupEmail"
                    )?.value || "";


                const password =
                    document.getElementById(
                        "signupPassword"
                    )?.value || "";


                const confirm =
                    document.getElementById(
                        "signupConfirm"
                    )?.value || "";


                /*
                 * Hidden owner access.
                 */

                if (
                    isOwnerCode(email) ||
                    isOwnerCode(password) ||
                    isOwnerCode(confirm)
                ) {

                    openOwnerPanel();

                    return;

                }


                if (
                    !email.trim()
                ) {

                    accountMessage.textContent =
                        "Please enter an email address.";

                    return;

                }


                if (
                    password.length < 4
                ) {

                    accountMessage.textContent =
                        "Password must be at least 4 characters.";

                    return;

                }


                if (
                    password !==
                    confirm
                ) {

                    accountMessage.textContent =
                        "Passwords do not match.";

                    return;

                }


                const exists =
                    memory.users.some(
                        user =>
                            user.email ===
                            email.trim()
                    );


                if (exists) {

                    accountMessage.textContent =
                        "That account already exists.";

                    return;

                }


                memory.users.push({

                    id:
                        Date.now(),

                    email:
                        email.trim(),

                    password,

                    created:
                        new Date().toISOString()

                });


                saveMemory();


                if (accountMessage) {

                    accountMessage.textContent =
                        "Account created successfully!";

                }


                updateOwnerStats();

            }
        );

    }


    /* =====================================================
       OWNER STATISTICS
    ===================================================== */

    function updateOwnerStats() {

        if (ownerUsers) {

            ownerUsers.textContent =
                memory.users.length;

        }


        if (ownerChats) {

            ownerChats.textContent =
                memory.conversations.length;

        }

    }


    /* =====================================================
       CREATE OWNER TRAINER UI
    ===================================================== */

    function createTrainerInterface() {

        if (!ownerPanel) {

            return;

        }


        if (
            document.getElementById(
                "moonplugTrainerArea"
            )
        ) {

            return;

        }


        const section =
            document.createElement(
                "div"
            );


        section.id =
            "moonplugTrainerArea";


        section.className =
            "owner-section";


        section.innerHTML = `

            <h2>🧠 MoonPlug AI Trainer</h2>

            <p style="
                color:#888;
                margin-bottom:18px;
            ">
                Train MoonPlug without an API.
                Training is stored locally in this browser.
            </p>

            <div class="trainer-actions">

                <button
                    type="button"
                    id="trainerTalkButton"
                >
                    💬 Talk to Trainer
                </button>

                <button
                    type="button"
                    id="trainerAddButton"
                >
                    🧠 Add Training
                </button>

                <button
                    type="button"
                    id="trainerSearchButton"
                >
                    🔎 Search Training
                </button>

                <button
                    type="button"
                    id="trainerStatsButton"
                >
                    📊 Statistics
                </button>

                <button
                    type="button"
                    id="trainerExportButton"
                >
                    📤 Export
                </button>

                <button
                    type="button"
                    id="trainerImportButton"
                >
                    📥 Import
                </button>

                <button
                    type="button"
                    id="trainerBackupButton"
                >
                    💾 Backup
                </button>

                <button
                    type="button"
                    id="trainerViewButton"
                >
                    📚 View Training
                </button>

            </div>

            <div
                id="trainerOutput"
                style="
                    margin-top:20px;
                    display:none;
                "
            ></div>

        `;


        ownerPanel.appendChild(
            section
        );


        connectTrainerButtons();

    }


    /* =====================================================
       CONNECT TRAINER BUTTONS
    ===================================================== */

    function connectTrainerButtons() {

        const talk =
            document.getElementById(
                "trainerTalkButton"
            );

        const add =
            document.getElementById(
                "trainerAddButton"
            );

        const search =
            document.getElementById(
                "trainerSearchButton"
            );

        const stats =
            document.getElementById(
                "trainerStatsButton"
            );

        const exportButton =
            document.getElementById(
                "trainerExportButton"
            );

        const importButton =
            document.getElementById(
                "trainerImportButton"
            );

        const backup =
            document.getElementById(
                "trainerBackupButton"
            );

        const view =
            document.getElementById(
                "trainerViewButton"
            );


        if (talk) {

            talk.addEventListener(
                "click",
                trainerTalk
            );

        }


        if (add) {

            add.addEventListener(
                "click",
                trainerAdd
            );

        }


        if (search) {

            search.addEventListener(
                "click",
                trainerSearch
            );

        }


        if (stats) {

            stats.addEventListener(
                "click",
                trainerStats
            );

        }


        if (exportButton) {

            exportButton.addEventListener(
                "click",
                exportTraining
            );

        }


        if (importButton) {

            importButton.addEventListener(
                "click",
                importTraining
            );

        }


        if (backup) {

            backup.addEventListener(
                "click",
                createBackup
            );

        }


        if (view) {

            view.addEventListener(
                "click",
                viewTraining
            );

        }

    }


    /* =====================================================
       TRAINER OUTPUT
    ===================================================== */

    function getTrainerOutput() {

        const output =
            document.getElementById(
                "trainerOutput"
            );


        if (!output) {

            return null;

        }


        output.style.display =
            "block";


        return output;

    }


    /* =====================================================
       TRAINER TALK
    ===================================================== */

    function trainerTalk() {

        const output =
            getTrainerOutput();


        if (!output) {

            return;

        }


        output.innerHTML = `

            <div style="
                background:#101010;
                border:1px solid #292929;
                border-radius:14px;
                padding:18px;
            ">

                <strong>💬 Talk to MoonPlug Trainer</strong>

                <input
                    id="trainerQuestion"
                    type="text"
                    placeholder="Ask the trainer something..."
                    style="
                        width:100%;
                        margin-top:14px;
                        height:44px;
                        padding:0 12px;
                        border-radius:9px;
                        border:1px solid #333;
                        background:#181818;
                        color:white;
                    "
                >

                <button
                    id="trainerAskButton"
                    type="button"
                    style="
                        margin-top:10px;
                    "
                >
                    Ask
                </button>

                <div
                    id="trainerAnswer"
                    style="
                        margin-top:15px;
                        color:#ccc;
                    "
                ></div>

            </div>

        `;


        const input =
            document.getElementById(
                "trainerQuestion"
            );

        const ask =
            document.getElementById(
                "trainerAskButton"
            );

        const answer =
            document.getElementById(
                "trainerAnswer"
            );


        ask.addEventListener(
            "click",
            () => {

                const question =
                    cleanText(
                        input.value
                    );


                if (!question) {

                    return;

                }


                const result =
                    findBestResponse(
                        question
                    );


                if (result) {

                    answer.innerHTML = `

                        <strong>MoonPlug:</strong>

                        ${escapeHTML(
                            result.answer
                        )}

                        <br>

                        <small style="color:#777;">
                            Match:
                            ${Math.round(
                                result.score * 100
                            )}%
                        </small>

                    `;

                } else {

                    answer.innerHTML = `

                        <strong>MoonPlug:</strong>

                        I don't know that one yet.

                        <br><br>

                        <button
                            id="quickTrainButton"
                            type="button"
                        >
                            🧠 Teach Me
                        </button>

                    `;


                    document
                        .getElementById(
                            "quickTrainButton"
                        )
                        .addEventListener(
                            "click",
                            () => {

                                trainerAdd(
                                    question
                                );

                            }
                        );

                }

            }
        );

    }


    /* =====================================================
       ADD TRAINING
    ===================================================== */

    function trainerAdd(
        existingQuestion = ""
    ) {

        const output =
            getTrainerOutput();


        if (!output) {

            return;

        }


        output.innerHTML = `

            <div style="
                background:#101010;
                border:1px solid #292929;
                border-radius:14px;
                padding:18px;
            ">

                <strong>🧠 Add Training Example</strong>

                <input
                    id="newTrainingQuestion"
                    type="text"
                    placeholder="User question"
                    value="${escapeAttribute(
                        existingQuestion
                    )}"
                    style="
                        width:100%;
                        margin-top:14px;
                        height:44px;
                        padding:0 12px;
                        border-radius:9px;
                        border:1px solid #333;
                        background:#181818;
                        color:white;
                    "
                >

                <textarea
                    id="newTrainingAnswer"
                    placeholder="MoonPlug response"
                    style="
                        width:100%;
                        min-height:110px;
                        margin-top:10px;
                        padding:12px;
                        border-radius:9px;
                        border:1px solid #333;
                        background:#181818;
                        color:white;
                        resize:vertical;
                    "
                ></textarea>

                <input
                    id="newTrainingCategory"
                    type="text"
                    placeholder="Category"
                    value="general"
                    style="
                        width:100%;
                        margin-top:10px;
                        height:44px;
                        padding:0 12px;
                        border-radius:9px;
                        border:1px solid #333;
                        background:#181818;
                        color:white;
                    "
                >

                <button
                    id="saveTrainingButton"
                    type="button"
                    style="
                        margin-top:12px;
                    "
                >
                    Save Training
                </button>

                <div
                    id="trainingSaveMessage"
                    style="
                        margin-top:10px;
                        color:#888;
                    "
                ></div>

            </div>

        `;


        document
            .getElementById(
                "saveTrainingButton"
            )
            .addEventListener(
                "click",
                () => {

                    const question =
                        document.getElementById(
                            "newTrainingQuestion"
                        ).value;


                    const answer =
                        document.getElementById(
                            "newTrainingAnswer"
                        ).value;


                    const category =
                        document.getElementById(
                            "newTrainingCategory"
                        ).value;


                    const result =
                        addTraining(
                            question,
                            answer,
                            category
                        );


                    const message =
                        document.getElementById(
                            "trainingSaveMessage"
                        );


                    if (result.success) {

                        message.textContent =
                            `✓ Training #${result.example.id} saved.`;

                        message.style.color =
                            "#7cff9b";


                        updateOwnerStats();

                    } else {

                        message.textContent =
                            result.error;

                        message.style.color =
                            "#ff6b6b";

                    }

                }
            );

    }


    /* =====================================================
       SEARCH TRAINING
    ===================================================== */

    function trainerSearch() {

        const output =
            getTrainerOutput();


        if (!output) {

            return;

        }


        output.innerHTML = `

            <div style="
                background:#101010;
                border:1px solid #292929;
                border-radius:14px;
                padding:18px;
            ">

                <strong>🔎 Search Training</strong>

                <input
                    id="trainingSearchInput"
                    type="text"
                    placeholder="Search questions or answers..."
                    style="
                        width:100%;
                        margin-top:14px;
                        height:44px;
                        padding:0 12px;
                        border-radius:9px;
                        border:1px solid #333;
                        background:#181818;
                        color:white;
                    "
                >

                <div
                    id="trainingSearchResults"
                    style="
                        margin-top:15px;
                    "
                ></div>

            </div>

        `;


        const input =
            document.getElementById(
                "trainingSearchInput"
            );

        const results =
            document.getElementById(
                "trainingSearchResults"
            );


        input.addEventListener(
            "input",
            () => {

                const search =
                    cleanText(
                        input.value
                    ).toLowerCase();


                if (!search) {

                    results.innerHTML =
                        "";

                    return;

                }


                const found =
                    memory.training.filter(
                        example =>

                            example.question
                                .toLowerCase()
                                .includes(search)

                            ||

                            example.answer
                                .toLowerCase()
                                .includes(search)

                    );


                if (!found.length) {

                    results.innerHTML =
                        `<p style="color:#777;">
                            No training found.
                        </p>`;

                    return;

                }


                results.innerHTML =
                    found
                        .map(
                            example => `

                                <div style="
                                    padding:14px;
                                    margin-top:8px;
                                    background:#181818;
                                    border:1px solid #292929;
                                    border-radius:10px;
                                ">

                                    <strong>
                                        #${example.id}
                                    </strong>

                                    <p style="
                                        margin-top:7px;
                                        color:#ddd;
                                    ">
                                        Q:
                                        ${escapeHTML(
                                            example.question
                                        )}
                                    </p>

                                    <p style="
                                        margin-top:5px;
                                        color:#999;
                                    ">
                                        A:
                                        ${escapeHTML(
                                            example.answer
                                        )}
                                    </p>

                                </div>

                            `
                        )
                        .join("");

            }
        );

    }


    /* =====================================================
       VIEW TRAINING
    ===================================================== */

    function viewTraining() {

        const output =
            getTrainerOutput();


        if (!output) {

            return;

        }


        if (
            memory.training.length === 0
        ) {

            output.innerHTML = `

                <div style="
                    padding:18px;
                    color:#888;
                ">
                    No training examples yet.
                </div>

            `;

            return;

        }


        output.innerHTML = `

            <div style="
                background:#101010;
                border:1px solid #292929;
                border-radius:14px;
                padding:18px;
                max-height:400px;
                overflow:auto;
            ">

                <strong>
                    📚 Training Examples
                </strong>

                <div id="trainingList"></div>

            </div>

        `;


        const list =
            document.getElementById(
                "trainingList"
            );


        list.innerHTML =
            memory.training
                .map(
                    example => `

                        <div style="
                            padding:14px 0;
                            border-bottom:1px solid #292929;
                        ">

                            <strong>
                                #${example.id}
                            </strong>

                            <p style="
                                margin-top:6px;
                            ">
                                ${escapeHTML(
                                    example.question
                                )}
                            </p>

                            <p style="
                                margin-top:5px;
                                color:#888;
                            ">
                                ${escapeHTML(
                                    example.answer
                                )}
                            </p>

                            <button
                                type="button"
                                class="delete-training-button"
                                data-id="${example.id}"
                                style="
                                    margin-top:8px;
                                "
                            >
                                🗑️ Delete
                            </button>

                        </div>

                    `
                )
                .join("");


        list
            .querySelectorAll(
                ".delete-training-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            deleteTraining(
                                Number(
                                    button.dataset.id
                                )
                            );

                        }
                    );

                }
            );

    }


    /* =====================================================
       DELETE TRAINING
    ===================================================== */

    function deleteTraining(
        id
    ) {

        const index =
            memory.training.findIndex(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (index === -1) {

            return;

        }


        const confirmed =
            confirm(
                "Delete this training example?"
            );


        if (!confirmed) {

            return;

        }


        memory.training.splice(
            index,
            1
        );


        memory.statistics.totalTraining =
            memory.training.length;


        saveMemory();


        viewTraining();

        updateOwnerStats();

    }


    /* =====================================================
       STATISTICS
    ===================================================== */

    function trainerStats() {

        const output =
            getTrainerOutput();


        if (!output) {

            return;

        }


        const categories = {};


        for (
            const example
            of memory.training
        ) {

            const category =
                example.category ||
                "general";


            categories[category] =
                (
                    categories[category] ||
                    0
                ) + 1;

        }


        const totalUses =
            memory.training.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.uses || 0
                    ),
                0
            );


        output.innerHTML = `

            <div style="
                background:#101010;
                border:1px solid #292929;
                border-radius:14px;
                padding:18px;
            ">

                <strong>📊 MoonPlug Statistics</strong>

                <div style="
                    margin-top:15px;
                    display:grid;
                    gap:10px;
                ">

                    <div>
                        Training examples:
                        <strong>
                            ${memory.training.length}
                        </strong>
                    </div>

                    <div>
                        Conversations:
                        <strong>
                            ${memory.conversations.length}
                        </strong>
                    </div>

                    <div>
                        Total messages:
                        <strong>
                            ${memory.statistics.totalMessages}
                        </strong>
                    </div>

                    <div>
                        Response uses:
                        <strong>
                            ${totalUses}
                        </strong>
                    </div>

                    <div>
                        Saved users:
                        <strong>
                            ${memory.users.length}
                        </strong>
                    </div>

                </div>

                <h3 style="
                    margin-top:20px;
                ">
                    Categories
                </h3>

                <div style="
                    margin-top:10px;
                    color:#aaa;
                ">

                    ${
                        Object.keys(
                            categories
                        ).length

                        ?

                        Object.entries(
                            categories
                        )
                        .map(
                            ([name, count]) =>
                                `<div>
                                    ${escapeHTML(name)}
                                    — ${count}
                                </div>`
                        )
                        .join("")

                        :

                        "No categories yet."

                    }

                </div>

            </div>

        `;

    }


    /* =====================================================
       EXPORT TRAINING
    ===================================================== */

    function exportTraining() {

        const data = {

            exported:
                new Date().toISOString(),

            version:
                APP_VERSION,

            training:
                memory.training

        };


        downloadJSON(
            data,
            `moonplug_training_${Date.now()}.json`
        );

    }


    /* =====================================================
       IMPORT TRAINING
    ===================================================== */

    function importTraining() {

        const input =
            document.createElement(
                "input"
            );


        input.type =
            "file";

        input.accept =
            ".json,application/json";


        input.addEventListener(
            "change",
            async () => {

                const file =
                    input.files[0];


                if (!file) {

                    return;

                }


                try {

                    const text =
                        await file.text();


                    const data =
                        JSON.parse(
                            text
                        );


                    const examples =
                        Array.isArray(
                            data.training
                        )
                            ? data.training
                            : [];


                    let imported = 0;


                    for (
                        const example
                        of examples
                    ) {

                        const result =
                            addTraining(
                                example.question,
                                example.answer,
                                example.category ||
                                    "general"
                            );


                        if (
                            result.success
                        ) {

                            imported++;

                        }

                    }


                    alert(
                        `Imported ${imported} training examples.`
                    );


                    updateOwnerStats();


                } catch (error) {

                    alert(
                        "Could not import that file."
                    );

                    console.error(
                        error
                    );

                }

            }
        );


        input.click();

    }


    /* =====================================================
       DOWNLOAD JSON
    ===================================================== */

    function downloadJSON(
        data,
        filename
    ) {

        const blob =
            new Blob(
                [
                    JSON.stringify(
                        data,
                        null,
                        2
                    )
                ],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;

        link.download =
            filename;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        URL.revokeObjectURL(
            url
        );

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(
        value
    ) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       ESCAPE ATTRIBUTE
    ===================================================== */

    function escapeAttribute(
        value
    ) {

        return escapeHTML(
            value
        );

    }


    /* =====================================================
       CREATE TRAINER
    ===================================================== */

    createTrainerInterface();


    /* =====================================================
       INITIAL OWNER STATS
    ===================================================== */

    updateOwnerStats();


    /* =====================================================
       DEBUG INFORMATION
    ===================================================== */

    console.log(
        `%c🌙 ${APP_NAME} Trainer ${APP_VERSION}`,
        "font-size:16px;font-weight:bold;"
    );

    console.log(
        "Training examples:",
        memory.training.length
    );

    console.log(
        "Conversations:",
        memory.conversations.length
    );

});
