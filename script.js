
/* =========================================================
   MOONPLUG AI
   COMPLETE SCRIPT.JS
   CHAT + OWNER + SETTINGS + CONVERSATION MODE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIG
    ===================================================== */

    const API_BASE = "https://moonplug.onrender.com";


    /* =====================================================
       DOM HELPER
    ===================================================== */

    const $ = (id) => document.getElementById(id);


    /* =====================================================
       MAIN ELEMENTS
    ===================================================== */

    const sidebar = $("sidebar");
    const sidebarLogo = $("sidebarLogo");

    const messages = $("messages");
    const messageInput = $("messageInput");
    const sendButton = $("sendButton");
    const typing = $("typing");

    const settingsPanel = $("settingsPanel");
    const closeSettingsButton = $("closeSettings");
    const themeButton = $("themeButton");

    const accountScreen = $("accountScreen");
    const ownerButton = $("ownerButton");
    const closeAccount = $("closeAccount");

    const loginTab = $("loginTab");
    const signupTab = $("signupTab");
    const loginForm = $("loginForm");
    const signupForm = $("signupForm");
    const accountMessage = $("accountMessage");

    const ownerLogin = $("ownerLogin");
    const ownerCode = $("ownerCode");
    const ownerLoginButton = $("ownerLoginButton");
    const ownerCancel = $("ownerCancel");
    const ownerError = $("ownerError");
    const showPassword = $("showPassword");

    const ownerPanel = $("ownerPanel");
    const ownerLogout = $("ownerLogout");
    const ownerUsers = $("ownerUsers");
    const ownerChats = $("ownerChats");

    const trainerButton = $("trainerButton");
    const trainerContainer = $("trainerContainer");


    /* =====================================================
       CONVERSATION MODE ELEMENTS
    ===================================================== */

    const conversationMode =
        $("conversationMode");

    const conversationButton =
        $("conversationButton");

    const conversationClose =
        $("conversationClose") ||
        document.querySelector(".conversation-close");

    const conversationMic =
        $("conversationMic");

    const conversationStatus =
        $("conversationStatus");

    const conversationText =
        $("conversationText");

    const moonOrb =
        $("moonOrb");


    /* =====================================================
       STATE
    ===================================================== */

    let conversationListening = false;
    let conversationRecognition = null;
    let conversationSpeaking = false;

    let currentConversationId = null;

    let moonPlugVoices = [];
    let moonPlugVoice = null;


    /* =====================================================
       CONVERSATION STORAGE
    ===================================================== */

    const CONVERSATIONS_KEY =
        "moonplug-conversations";

    const CURRENT_CONVERSATION_KEY =
        "moonplug-current-conversation";


    function getConversations() {

        try {

            const saved =
                localStorage.getItem(
                    CONVERSATIONS_KEY
                );

            if (!saved) return [];

            const parsed =
                JSON.parse(saved);

            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            console.error(
                "Conversation storage error:",
                error
            );

            return [];
        }
    }


    function saveAllConversations(conversations) {

        try {

            localStorage.setItem(
                CONVERSATIONS_KEY,
                JSON.stringify(conversations)
            );

        } catch (error) {

            console.error(
                "Could not save conversations:",
                error
            );
        }
    }


    function createConversation() {

        const conversation = {

            id:
                Date.now().toString(),

            title:
                "New Conversation",

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString(),

            messages: []

        };


        const conversations =
            getConversations();

        conversations.unshift(
            conversation
        );

        saveAllConversations(
            conversations
        );


        currentConversationId =
            conversation.id;


        localStorage.setItem(
            CURRENT_CONVERSATION_KEY,
            currentConversationId
        );


        return conversation;
    }


    function getCurrentConversation() {

        const conversations =
            getConversations();

        if (!currentConversationId) {

            currentConversationId =
                localStorage.getItem(
                    CURRENT_CONVERSATION_KEY
                );
        }


        if (!currentConversationId) {

            return createConversation();
        }


        let conversation =
            conversations.find(
                item =>
                    item.id ===
                    currentConversationId
            );


        if (!conversation) {

            conversation =
                createConversation();
        }


        return conversation;
    }


    function saveConversationMessage(
        role,
        text
    ) {

        if (!text) return;


        let conversations =
            getConversations();


        let conversation =
            conversations.find(
                item =>
                    item.id ===
                    currentConversationId
            );


        if (!conversation) {

            conversation =
                createConversation();

            conversations =
                getConversations();
        }


        conversation.messages.push({

            role: role,

            text: String(text),

            timestamp:
                new Date().toISOString()

        });


        /*
           Use the first user message as
           the conversation title.
        */

        if (
            role === "user" &&
            (
                !conversation.title ||
                conversation.title ===
                    "New Conversation"
            )
        ) {

            conversation.title =
                String(text)
                    .slice(0, 40);
        }


        conversation.updatedAt =
            new Date().toISOString();


        saveAllConversations(
            conversations
        );
    }


    function loadConversation(
        conversationId
    ) {

        const conversations =
            getConversations();


        const conversation =
            conversations.find(
                item =>
                    item.id ===
                    conversationId
            );


        if (!conversation) {
            return;
        }


        currentConversationId =
            conversation.id;


        localStorage.setItem(
            CURRENT_CONVERSATION_KEY,
            currentConversationId
        );


        if (messages) {

            messages.innerHTML = "";
        }


        conversation.messages.forEach(
            item => {

                addMessage(
                    item.text,
                    item.role === "user"
                        ? "user"
                        : "ai"
                );

            }
        );


        if (
            conversation.messages.length === 0
        ) {

            showEmptyChat();
        }
    }


    function startNewConversation() {

        currentConversationId = null;


        localStorage.removeItem(
            CURRENT_CONVERSATION_KEY
        );


        if (messages) {

            messages.innerHTML = "";
        }


        createConversation();

        showEmptyChat();


        if (messageInput) {
            messageInput.value = "";
            autoResizeInput();
            messageInput.focus();
        }
    }


    function showEmptyChat() {

        if (!messages) return;


        messages.innerHTML = `

            <div
                id="emptyChat"
                class="empty-chat"
            >

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
    }


    function openConversationHistory() {

        const conversations =
            getConversations();


        if (!conversations.length) {

            createConversation();

            return;
        }


        const latest =
            conversations[0];


        loadConversation(
            latest.id
        );
    }


    /* =====================================================
       NORMAL NEW CHAT
    ===================================================== */

    function startNewChat() {

        currentConversationId = null;

        localStorage.removeItem(
            CURRENT_CONVERSATION_KEY
        );

        showEmptyChat();

        createConversation();

        if (messageInput) {

            messageInput.value = "";

            autoResizeInput();

            messageInput.focus();
        }
    }


    $("newChatButton")?.addEventListener(
        "click",
        startNewChat
    );


    $("historyButton")?.addEventListener(
        "click",
        openConversationHistory
    );


    /* =====================================================
       STAR FIELD
    ===================================================== */

    function createStars() {

        const field =
            $("starField");

        if (!field) return;


        field.innerHTML = "";


        const count =
            window.innerWidth < 700
                ? 90
                : 150;


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const star =
                document.createElement(
                    "span"
                );


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


            star.style.setProperty(
                "--star-size",
                `${Math.random() * 2 + 1}px`
            );


            star.style.setProperty(
                "--star-opacity",
                `${Math.random() * 0.6 + 0.25}`
            );


            star.style.setProperty(
                "--star-scale",
                `${Math.random() * 0.7 + 0.6}`
            );


            star.style.setProperty(
                "--star-duration",
                `${Math.random() * 4 + 3}s`
            );


            star.style.setProperty(
                "--star-delay",
                `${Math.random() * 4}s`
            );


            field.appendChild(star);
        }
    }


    /* =====================================================
       SIDEBAR
    ===================================================== */

    function toggleSidebar() {

        if (!sidebar) return;


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


    sidebarLogo?.addEventListener(
        "click",
        toggleSidebar
    );


    sidebarLogo?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                toggleSidebar();
            }
        }
    );


    /* =====================================================
       ADD NORMAL CHAT MESSAGE
    ===================================================== */

    function addMessage(
        text,
        type = "ai"
    ) {

        if (!messages) return;


        const empty =
            $("emptyChat");


        if (empty) {
            empty.remove();
        }


        const bubble =
            document.createElement(
                "div"
            );


        bubble.className =
            `message-bubble ${type}`;


        bubble.textContent =
            String(text);


        messages.appendChild(
            bubble
        );


        messages.scrollTop =
            messages.scrollHeight;


        return bubble;
    }


    /* =====================================================
       TYPING
    ===================================================== */

    function showTyping() {

        if (!typing) return;

        typing.style.display =
            "block";
    }


    function hideTyping() {

        if (!typing) return;

        typing.style.display =
            "none";
    }


    /* =====================================================
       NORMAL AI CHAT
    ===================================================== */

    async function sendMessage() {

        if (!messageInput) return;


        const text =
            messageInput.value.trim();


        if (!text) return;


        /*
           Hidden owner trigger.
        */

        if (
            text === "15912014"
        ) {

            messageInput.value = "";

            autoResizeInput();

            showOwnerLogin();

            return;
        }


        /*
           Make sure there is a conversation.
        */

        getCurrentConversation();


        addMessage(
            text,
            "user"
        );


        saveConversationMessage(
            "user",
            text
        );


        messageInput.value = "";

        autoResizeInput();


        if (sendButton) {
            sendButton.disabled = true;
        }


        showTyping();


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


            const data =
                await response
                    .json()
                    .catch(() => ({}));


            hideTyping();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Chat request failed"
                );
            }


            const reply =
                data.response ||
                data.message ||
                data.answer ||
                "MoonPlug received your message.";


            const cleanReply =
                String(reply);


            addMessage(
                cleanReply,
                "ai"
            );


            saveConversationMessage(
                "assistant",
                cleanReply
            );


        } catch (error) {

            hideTyping();


            console.error(
                "MoonPlug chat error:",
                error
            );


            addMessage(
                "MoonPlug is having trouble connecting to the server.",
                "ai"
            );

        } finally {

            if (sendButton) {
                sendButton.disabled = false;
            }

            messageInput.focus();
        }
    }


    sendButton?.addEventListener(
        "click",
        sendMessage
    );


    /* =====================================================
       ENTER TO SEND
    ===================================================== */

    messageInput?.addEventListener(
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


    /* =====================================================
       AUTO RESIZE
    ===================================================== */

    function autoResizeInput() {

        if (!messageInput) return;


        messageInput.style.height =
            "auto";


        messageInput.style.height =
            `${Math.min(
                messageInput.scrollHeight,
                180
            )}px`;
    }


    messageInput?.addEventListener(
        "input",
        autoResizeInput
    );


    /* =====================================================
       SETTINGS
    ===================================================== */

    function openSettings() {

        if (!settingsPanel) return;


        settingsPanel.style.display =
            "flex";


        settingsPanel.setAttribute(
            "aria-hidden",
            "false"
        );
    }


    function closeSettings() {

        if (!settingsPanel) return;


        settingsPanel.style.display =
            "none";


        settingsPanel.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    $("settingsButton")?.addEventListener(
        "click",
        openSettings
    );


    closeSettingsButton?.addEventListener(
        "click",
        closeSettings
    );


    settingsPanel?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                settingsPanel
            ) {

                closeSettings();
            }
        }
    );


    /* =====================================================
       THEME
    ===================================================== */

    function loadTheme() {

        const theme =
            localStorage.getItem(
                "moonplug-theme"
            ) || "dark";


        if (theme === "light") {

            document.body.classList.add(
                "light-theme"
            );


            if (themeButton) {
                themeButton.textContent =
                    "Light";
            }

        } else {

            document.body.classList.remove(
                "light-theme"
            );


            if (themeButton) {
                themeButton.textContent =
                    "Dark";
            }
        }
    }


    function toggleTheme() {

        const isLight =
            document.body.classList.toggle(
                "light-theme"
            );


        localStorage.setItem(
            "moonplug-theme",
            isLight
                ? "light"
                : "dark"
        );


        if (themeButton) {

            themeButton.textContent =
                isLight
                    ? "Light"
                    : "Dark";
        }
    }


    themeButton?.addEventListener(
        "click",
        toggleTheme
    );


    /* =====================================================
       TEXT SIZE
    ===================================================== */

    function updateTextSize(size) {

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


        document.body.classList.remove(
            "text-small",
            "text-medium",
            "text-large"
        );


        document.body.classList.add(
            `text-${size}`
        );


        localStorage.setItem(
            "moonplug-text-size",
            size
        );


        document
            .querySelectorAll(
                ".size-button"
            )
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.size ===
                        size
                );
            });
    }


    function loadTextSize() {

        const saved =
            localStorage.getItem(
                "moonplug-text-size"
            ) || "medium";


        updateTextSize(
            saved
        );
    }


    document
        .querySelectorAll(
            ".size-button"
        )
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


    /* =====================================================
       ACCOUNT
    ===================================================== */

    function openAccount() {

        if (!accountScreen) return;


        accountScreen.style.display =
            "flex";


        accountScreen.setAttribute(
            "aria-hidden",
            "false"
        );
    }


    function closeAccountScreen() {

        if (!accountScreen) return;


        accountScreen.style.display =
            "none";


        accountScreen.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    ownerButton?.addEventListener(
        "click",
        openAccount
    );


    closeAccount?.addEventListener(
        "click",
        closeAccountScreen
    );


    /* =====================================================
       ACCOUNT TABS
    ===================================================== */

    function showLoginTab() {

        loginTab?.classList.add(
            "active"
        );

        signupTab?.classList.remove(
            "active"
        );


        if (loginForm) {
            loginForm.hidden = false;
        }


        if (signupForm) {
            signupForm.hidden = true;
        }


        if (accountMessage) {
            accountMessage.textContent =
                "";
        }
    }


    function showSignupTab() {

        signupTab?.classList.add(
            "active"
        );

        loginTab?.classList.remove(
            "active"
        );


        if (loginForm) {
            loginForm.hidden = true;
        }


        if (signupForm) {
            signupForm.hidden = false;
        }


        if (accountMessage) {
            accountMessage.textContent =
                "";
        }
    }


    loginTab?.addEventListener(
        "click",
        showLoginTab
    );


    signupTab?.addEventListener(
        "click",
        showSignupTab
    );


    /* =====================================================
       ACCOUNT FORMS
    ===================================================== */

    loginForm?.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            accountMessage.textContent =
                "Account login can be connected to the MoonPlug backend here.";
        }
    );


    signupForm?.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const password =
                $("signupPassword")?.value ||
                "";


            const confirm =
                $("signupConfirm")?.value ||
                "";


            if (
                password !== confirm
            ) {

                accountMessage.textContent =
                    "Passwords do not match.";

                return;
            }


            accountMessage.textContent =
                "Account creation can be connected to the MoonPlug backend here.";
        }
    );


    /* =====================================================
       HIDDEN OWNER LOGIN
    ===================================================== */

    function showOwnerLogin() {

        if (!ownerLogin) return;


        ownerLogin.style.display =
            "flex";


        ownerLogin.setAttribute(
            "aria-hidden",
            "false"
        );


        if (ownerCode) {

            ownerCode.value = "";

            ownerCode.focus();
        }


        if (ownerError) {
            ownerError.textContent =
                "";
        }
    }


    function hideOwnerLogin() {

        if (!ownerLogin) return;


        ownerLogin.style.display =
            "none";


        ownerLogin.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    showPassword?.addEventListener(
        "click",
        () => {

            if (
                ownerCode.type ===
                "password"
            ) {

                ownerCode.type =
                    "text";

                showPassword.textContent =
                    "Hide";

            } else {

                ownerCode.type =
                    "password";

                showPassword.textContent =
                    "Show";
            }
        }
    );


    ownerCancel?.addEventListener(
        "click",
        hideOwnerLogin
    );


    /* =====================================================
       OWNER LOGIN
    ===================================================== */

    async function loginOwner() {

        const code =
            ownerCode?.value.trim();


        if (!code) {

            ownerError.textContent =
                "Enter the owner code.";

            return;
        }


        ownerLoginButton.disabled =
            true;


        ownerError.textContent =
            "Checking...";


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
                            code
                        })
                    }
                );


            const data =
                await response
                    .json()
                    .catch(() => ({}));


            if (!response.ok) {

                ownerError.textContent =
                    data.error ||
                    "Invalid owner code.";

                return;
            }


            hideOwnerLogin();

            openOwnerPanel();


        } catch (error) {

            console.error(
                "Owner login:",
                error
            );


            ownerError.textContent =
                "Unable to connect to MoonPlug.";
        }


        finally {

            ownerLoginButton.disabled =
                false;
        }
    }


    ownerLoginButton?.addEventListener(
        "click",
        loginOwner
    );


    ownerCode?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                loginOwner();
            }
        }
    );


    /* =====================================================
       OWNER PANEL
    ===================================================== */

    function openOwnerPanel() {

        if (!ownerPanel) return;


        ownerPanel.style.display =
            "flex";


        ownerPanel.setAttribute(
            "aria-hidden",
            "false"
        );


        loadOwnerDashboard();
    }


    function closeOwnerPanel() {

        if (!ownerPanel) return;


        ownerPanel.style.display =
            "none";


        ownerPanel.setAttribute(
            "aria-hidden",
            "true"
        );
    }


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
                    .catch(() => ({}));


            if (!response.ok) {
                return;
            }


            if (
                ownerUsers &&
                data.users !== undefined
            ) {

                ownerUsers.textContent =
                    data.users;
            }


            if (
                ownerChats &&
                data.chats !== undefined
            ) {

                ownerChats.textContent =
                    data.chats;
            }

        } catch (error) {

            console.error(
                "Owner dashboard:",
                error
            );
        }
    }


    ownerLogout?.addEventListener(
        "click",
        async () => {

            try {

                await fetch(
                    `${API_BASE}/api/owner/logout`,
                    {
                        method: "POST",

                        credentials:
                            "include"
                    }
                );

            } catch {}


            closeOwnerPanel();
        }
    );


    /* =====================================================
       TRAINER
    ===================================================== */

    function openTrainer() {

        if (!trainerContainer) return;


        trainerContainer.style.display =
            "block";


        trainerContainer.innerHTML = `

            <div class="trainer-box">

                <h3>
                    MoonPlug Trainer
                </h3>

                <input
                    id="trainingQuestion"
                    type="text"
                    placeholder="Question"
                >

                <textarea
                    id="trainingAnswer"
                    placeholder="Answer"
                ></textarea>

                <input
                    id="trainingCategory"
                    type="text"
                    placeholder="Category"
                >

                <button
                    id="addTrainingButton"
                    type="button"
                >
                    Teach MoonPlug
                </button>

                <div
                    id="trainingMessage"
                ></div>

            </div>

        `;


        $("addTrainingButton")
            ?.addEventListener(
                "click",
                addTraining
            );
    }


    function closeTrainer() {

        if (!trainerContainer) return;

        trainerContainer.style.display =
            "none";
    }


    trainerButton?.addEventListener(
        "click",
        openTrainer
    );


    async function addTraining() {

        const question =
            $("trainingQuestion")
                ?.value.trim();


        const answer =
            $("trainingAnswer")
                ?.value.trim();


        const category =
            $("trainingCategory")
                ?.value.trim();


        if (
            !question ||
            !answer
        ) {

            $("trainingMessage").textContent =
                "Enter a question and answer.";

            return;
        }


        try {

            const response =
                await fetch(
                    `${API_BASE}/api/owner/training`,
                    {
                        method: "POST",

                        credentials:
                            "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            question,

                            answer,

                            category:
                                category ||
                                "general"

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
                    "Training failed."
                );
            }


            $("trainingMessage").textContent =
                "MoonPlug learned it.";

        } catch (error) {

            console.error(
                "Training error:",
                error
            );


            $("trainingMessage").textContent =
                "Could not save training.";
        }
    }


    /* =====================================================
       CONVERSATION MODE
    ===================================================== */

    /*
       This button can be placed in the sidebar
       by the HTML.

       The JS also creates it automatically if
       your current HTML does not have it.
    */

    function ensureConversationSidebarButton() {

        if (!sidebar) return;


        let button =
            $("conversationButton");


        if (button) return;


        const buttons =
            sidebar.querySelector(
                ".sidebar-buttons"
            );


        if (!buttons) return;


        button =
            document.createElement(
                "button"
            );


        button.id =
            "conversationButton";


        button.className =
            "sidebar-button";


        button.type =
            "button";


        button.innerHTML = `

            <span class="sidebar-icon">
                🎙️
            </span>

            <span class="sidebar-label">
                Conversation Mode
            </span>

        `;


        buttons.appendChild(
            button
        );


        button.addEventListener(
            "click",
            openConversationMode
        );
    }


    ensureConversationSidebarButton();


    /* =====================================================
       SPEECH RECOGNITION
    ===================================================== */

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (SpeechRecognition) {

        conversationRecognition =
            new SpeechRecognition();


        conversationRecognition.continuous =
            false;


        conversationRecognition.interimResults =
            false;


        conversationRecognition.lang =
            "en-US";


        conversationRecognition.onstart =
            () => {

                conversationListening =
                    true;


                setConversationState(
                    "listening"
                );
            };


        conversationRecognition.onresult =
            async event => {

                const transcript =
                    event
                        .results[0][0]
                        .transcript
                        .trim();


                conversationListening =
                    false;


                if (!transcript) {

                    setConversationState(
                        "idle"
                    );

                    return;
                }


                if (conversationText) {

                    conversationText.textContent =
                        transcript;
                }


                await processConversationMessage(
                    transcript
                );
            };


        conversationRecognition.onerror =
            event => {

                console.error(
                    "Speech recognition:",
                    event.error
                );


                conversationListening =
                    false;


                if (
                    event.error ===
                    "not-allowed"
                ) {

                    conversationStatus.textContent =
                        "Microphone permission needed.";

                    conversationText.textContent =
                        "Allow microphone access and try again.";

                } else {

                    setConversationState(
                        "idle"
                    );

                    conversationText.textContent =
                        "I couldn't hear you. Try again.";
                }
            };


        conversationRecognition.onend =
            () => {

                conversationListening =
                    false;


                if (
                    !conversationSpeaking &&
                    conversationMode?.classList.contains(
                        "active"
                    )
                ) {

                    setConversationState(
                        "idle"
                    );
                }
            };
    }


    /* =====================================================
       OPEN CONVERSATION MODE
    ===================================================== */

    function openConversationMode() {

        if (!conversationMode) return;


        /*
           Conversation Mode is designed for
           iPhone and iPad.

           If you want it on desktop too,
           simply remove this condition.
        */

        if (
            window.innerWidth >= 700
        ) {

            /*
               Still allow desktop if the
               sidebar button is pressed.
            */

        }


        conversationMode.classList.add(
            "active"
        );


        conversationMode.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "conversation-open"
        );


        setConversationState(
            "idle"
        );
    }


    conversationButton?.addEventListener(
        "click",
        openConversationMode
    );


    /* =====================================================
       CLOSE CONVERSATION MODE
    ===================================================== */

    function closeConversationMode() {

        stopConversationListening();


        if (
            "speechSynthesis" in window
        ) {

            window.speechSynthesis.cancel();
        }


        conversationSpeaking =
            false;


        conversationMode?.classList.remove(
            "active"
        );


        conversationMode?.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "conversation-open"
        );


        setConversationState(
            "idle"
        );
    }


    conversationClose?.addEventListener(
        "click",
        closeConversationMode
    );


    /* =====================================================
       CONVERSATION STATE
    ===================================================== */

    function setConversationState(
        state
    ) {

        if (!moonOrb) return;


        moonOrb.classList.remove(
            "listening",
            "thinking",
            "talking"
        );


        conversationMic?.classList.remove(
            "active"
        );


        switch (state) {

            case "listening":

                moonOrb.classList.add(
                    "listening"
                );


                conversationStatus.textContent =
                    "Listening...";


                conversationText.textContent =
                    "I'm listening";


                if (conversationMic) {

                    conversationMic.innerHTML =
                        "✕";

                    conversationMic.classList.add(
                        "active"
                    );
                }

                break;


            case "thinking":

                moonOrb.classList.add(
                    "thinking"
                );


                conversationStatus.textContent =
                    "Thinking...";


                conversationText.textContent =
                    "MoonPlug is thinking";


                if (conversationMic) {

                    conversationMic.innerHTML =
                        "🎙️";
                }

                break;


            case "talking":

                moonOrb.classList.add(
                    "talking"
                );


                conversationStatus.textContent =
                    "MoonPlug is talking...";


                if (conversationMic) {

                    conversationMic.innerHTML =
                        "🔊";
                }

                break;


            default:

                conversationStatus.textContent =
                    "Ready";


                conversationText.textContent =
                    "Tap the microphone to talk";


                if (conversationMic) {

                    conversationMic.innerHTML =
                        "🎙️";
                }
        }
    }


    /* =====================================================
       MICROPHONE TOGGLE
    ===================================================== */

    function toggleConversationListening() {

        if (!conversationRecognition) {

            conversationStatus.textContent =
                "Speech recognition unavailable";


            conversationText.textContent =
                "This browser does not support microphone speech recognition.";


            return;
        }


        if (conversationSpeaking) {

            if (
                "speechSynthesis" in window
            ) {

                window.speechSynthesis.cancel();
            }


            conversationSpeaking =
                false;


            setConversationState(
                "idle"
            );


            return;
        }


        if (conversationListening) {

            stopConversationListening();

        } else {

            startConversationListening();
        }
    }


    conversationMic?.addEventListener(
        "click",
        toggleConversationListening
    );


    /* =====================================================
       START LISTENING
    ===================================================== */

    function startConversationListening() {

        if (!conversationRecognition) {
            return;
        }


        if (
            conversationSpeaking &&
            "speechSynthesis" in window
        ) {

            window.speechSynthesis.cancel();

            conversationSpeaking =
                false;
        }


        try {

            conversationRecognition.start();

        } catch (error) {

            console.log(
                "Recognition could not start:",
                error
            );
        }
    }


    /* =====================================================
       STOP LISTENING
    ===================================================== */

    function stopConversationListening() {

        if (!conversationRecognition) {
            return;
        }


        conversationListening =
            false;


        try {

            conversationRecognition.stop();

        } catch {}
    }


    /* =====================================================
       CONVERSATION → AI
    ===================================================== */

    async function processConversationMessage(
        transcript
    ) {

        const cleanTranscript =
            String(
                transcript || ""
            ).trim();


        if (!cleanTranscript) {

            setConversationState(
                "idle"
            );

            return;
        }


        /*
           Make sure a saved conversation exists.
        */

        getCurrentConversation();


        /*
           SAVE USER MESSAGE
        */

        saveConversationMessage(
            "user",
            cleanTranscript
        );


        setConversationState(
            "thinking"
        );


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
                                cleanTranscript
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
                    "Chat request failed"
                );
            }


            const reply =
                data.response ||
                data.message ||
                data.answer ||
                "I received your message.";


            const cleanReply =
                String(reply).trim();


            /*
               SAVE AI RESPONSE
            */

            saveConversationMessage(
                "assistant",
                cleanReply
            );


            /*
               NORMAL CHAT
            */

            addMessage(
                cleanTranscript,
                "user"
            );


            addMessage(
                cleanReply,
                "ai"
            );


            /*
               BLACK HOLE TEXT
            */

            if (conversationText) {

                conversationText.textContent =
                    cleanReply;
            }


            /*
               ACTUALLY SPEAK RESPONSE
            */

            await speakConversation(
                cleanReply
            );


        } catch (error) {

            console.error(
                "Conversation mode error:",
                error
            );


            conversationSpeaking =
                false;


            setConversationState(
                "idle"
            );


            if (conversationText) {

                conversationText.textContent =
                    "I couldn't connect to MoonPlug right now.";
            }
        }
    }


    /* =====================================================
       LOAD DEVICE VOICES
    ===================================================== */

    function loadMoonPlugVoices() {

        if (
            !("speechSynthesis" in window)
        ) {

            return;
        }


        moonPlugVoices =
            window.speechSynthesis
                .getVoices();


        if (
            !moonPlugVoices.length
        ) {

            return;
        }


        /*
           Prefer an English voice.

           en-CA → en-US → en-GB
           → any English voice
           → default voice
        */

        const englishVoices =
            moonPlugVoices.filter(
                voice =>
                    /^en[-_]/i.test(
                        voice.lang
                    )
            );


        moonPlugVoice =

            englishVoices.find(
                voice =>
                    /^en-CA/i.test(
                        voice.lang
                    )
            ) ||

            englishVoices.find(
                voice =>
                    /^en-US/i.test(
                        voice.lang
                    )
            ) ||

            englishVoices.find(
                voice =>
                    /^en-GB/i.test(
                        voice.lang
                    )
            ) ||

            englishVoices[0] ||

            moonPlugVoices.find(
                voice =>
                    voice.default
            ) ||

            moonPlugVoices[0];


        console.log(
            "MoonPlug voice:",
            moonPlugVoice
                ? `${moonPlugVoice.name} (${moonPlugVoice.lang})`
                : "No voice available"
        );
    }


    /* =====================================================
       WAIT FOR VOICES
    ===================================================== */

    function waitForMoonPlugVoices() {

        return new Promise(
            resolve => {

                if (
                    !("speechSynthesis" in window)
                ) {

                    resolve([]);

                    return;
                }


                loadMoonPlugVoices();


                if (
                    moonPlugVoices.length
                ) {

                    resolve(
                        moonPlugVoices
                    );

                    return;
                }


                let finished =
                    false;


                const finish = () => {

                    if (finished) {
                        return;
                    }


                    finished = true;


                    window.speechSynthesis
                        .removeEventListener(
                            "voiceschanged",
                            finish
                        );


                    loadMoonPlugVoices();


                    resolve(
                        moonPlugVoices
                    );
                };


                window.speechSynthesis
                    .addEventListener(
                        "voiceschanged",
                        finish,
                        {
                            once: true
                        }
                    );


                setTimeout(
                    () => {

                        loadMoonPlugVoices();


                        if (
                            moonPlugVoices.length
                        ) {

                            finish();
                        }

                    },
                    500
                );


                setTimeout(
                    finish,
                    2500
                );
            }
        );
    }


    /* =====================================================
       SPEAK MOONPLUG RESPONSE
    ===================================================== */

    async function speakConversation(
        text
    ) {

        if (
            !text ||
            !String(text).trim()
        ) {

            setConversationState(
                "idle"
            );

            return;
        }


        if (
            !("speechSynthesis" in window)
        ) {

            conversationSpeaking =
                false;


            setConversationState(
                "idle"
            );


            conversationStatus.textContent =
                "Voice unavailable";


            conversationText.textContent =
                "This browser cannot play MoonPlug's voice.";


            return;
        }


        /*
           Wait for device voices.
        */

        await waitForMoonPlugVoices();


        const synth =
            window.speechSynthesis;


        /*
           Stop previous speech.
        */

        synth.cancel();


        conversationSpeaking =
            false;


        const utterance =
            new SpeechSynthesisUtterance(
                String(text)
            );


        /*
           English.
        */

        utterance.lang =
            "en-US";


        /*
           Device English voice.
        */

        if (moonPlugVoice) {

            utterance.voice =
                moonPlugVoice;
        }


        /*
           MoonPlug voice tuning.
        */

        utterance.rate =
            0.96;


        utterance.pitch =
            0.95;


        utterance.volume =
            1;


        /* =================================================
           SPEECH START
        ================================================= */

        utterance.onstart =
            () => {

                conversationSpeaking =
                    true;


                setConversationState(
                    "talking"
                );
            };


        /* =================================================
           SPEECH END
        ================================================= */

        utterance.onend =
            () => {

                conversationSpeaking =
                    false;


                if (
                    conversationMode &&
                    conversationMode.classList.contains(
                        "active"
                    )
                ) {

                    setConversationState(
                        "idle"
                    );
                }
            };


        /* =================================================
           SPEECH ERROR
        ================================================= */

        utterance.onerror =
            event => {

                console.error(
                    "MoonPlug speech error:",
                    event.error
                );


                conversationSpeaking =
                    false;


                setConversationState(
                    "idle"
                );


                if (
                    conversationText
                ) {

                    conversationText.textContent =
                        "MoonPlug couldn't play its voice.";
                }
            };


        /*
           Start speech.
        */

        synth.cancel();

        synth.resume();

        synth.speak(
            utterance
        );


        /*
           Browser safety fallback.
        */

        setTimeout(
            () => {

                if (
                    synth.paused &&
                    !synth.speaking
                ) {

                    synth.resume();
                }

            },
            150
        );
    }


    /* =====================================================
       INITIALIZE CONVERSATION STORAGE
    ===================================================== */

    function initializeConversationStorage() {

        const conversations =
            getConversations();


        if (!conversations.length) {

            createConversation();

            return;
        }


        currentConversationId =
            localStorage.getItem(
                CURRENT_CONVERSATION_KEY
            );


        /*
           If there is a previous conversation,
           don't automatically dump it into the
           main chat. The user can continue it
           through Chat History.
        */

        if (!currentConversationId) {

            createConversation();
        }
    }


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            if (
                conversationMode?.classList.contains(
                    "active"
                )
            ) {

                closeConversationMode();

                return;
            }


            if (
                settingsPanel?.style.display ===
                "flex"
            ) {

                closeSettings();

                return;
            }


            if (
                ownerLogin?.style.display ===
                "flex"
            ) {

                hideOwnerLogin();

                return;
            }


            if (
                accountScreen?.style.display ===
                "flex"
            ) {

                closeAccountScreen();
            }
        }
    );


    /* =====================================================
       RESIZE
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            createStars();

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initializeMoonPlug() {

        createStars();

        loadTheme();

        loadTextSize();

        autoResizeInput();

        initializeConversationStorage();

        loadMoonPlugVoices();


        if (
            "speechSynthesis" in window
        ) {

            window.speechSynthesis
                .addEventListener(
                    "voiceschanged",
                    loadMoonPlugVoices
                );
        }


        console.log(
            "MoonPlug AI initialized."
        );
    }


    initializeMoonPlug();

});

