/* =====================================================
   MOONPLUG AI
   COMPLETE JAVASCRIPT
   NO API REQUIRED
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";


    /* =================================================
       ELEMENTS
    ================================================= */

    const sidebar =
        document.getElementById("sidebar");

    const sidebarLogo =
        document.getElementById("sidebarLogo");

    const chatSection =
        document.getElementById("chatSection");

    const messages =
        document.getElementById("messages");

    const emptyChat =
        document.getElementById("emptyChat");

    const messageInput =
        document.getElementById("messageInput");

    const sendButton =
        document.getElementById("sendButton");

    const typing =
        document.getElementById("typing");


    /* SETTINGS */

    const settingsButton =
        document.getElementById("settingsButton");

    const settingsPanel =
        document.getElementById("settingsPanel");

    const closeSettings =
        document.getElementById("closeSettings");

    const themeButton =
        document.getElementById("themeButton");

    const sidebarToggleSetting =
        document.getElementById("sidebarToggleSetting");


    /* ACCOUNT */

    const accountButton =
        document.getElementById("accountButton");

    const accountScreen =
        document.getElementById("accountScreen");

    const closeAccount =
        document.getElementById("closeAccount");

    const loginTab =
        document.getElementById("loginTab");

    const signupTab =
        document.getElementById("signupTab");

    const loginForm =
        document.getElementById("loginForm");

    const signupForm =
        document.getElementById("signupForm");

    const accountMessage =
        document.getElementById("accountMessage");


    /* OWNER */

    const ownerLogin =
        document.getElementById("ownerLogin");

    const ownerCode =
        document.getElementById("ownerCode");

    const ownerLoginButton =
        document.getElementById("ownerLoginButton");

    const ownerCancel =
        document.getElementById("ownerCancel");

    const ownerError =
        document.getElementById("ownerError");

    const ownerPanel =
        document.getElementById("ownerPanel");

    const ownerLogout =
        document.getElementById("ownerLogout");


    /* OWNER STATISTICS */

    const ownerUsers =
        document.getElementById("ownerUsers");

    const ownerChats =
        document.getElementById("ownerChats");

    const ownerMessages =
        document.getElementById("ownerMessages");


    /* OWNER CONTROLS */

    const manageUsersButton =
        document.getElementById("manageUsersButton");

    const manageChatsButton =
        document.getElementById("manageChatsButton");

    const appSettingsButton =
        document.getElementById("appSettingsButton");

    const ownerActionMessage =
        document.getElementById("ownerActionMessage");


    /* TRAINER */

    const trainingInput =
        document.getElementById("trainingInput");

    const saveTrainingButton =
        document.getElementById("saveTrainingButton");

    const clearTrainingButton =
        document.getElementById("clearTrainingButton");

    const trainingStatus =
        document.getElementById("trainingStatus");


    /* OWNER CHAT */

    const ownerChatMessages =
        document.getElementById("ownerChatMessages");

    const ownerChatInput =
        document.getElementById("ownerChatInput");

    const ownerChatSend =
        document.getElementById("ownerChatSend");


    /* =================================================
       STORAGE
    ================================================= */

    const STORAGE = {

        users: "moonplug_users",

        chats: "moonplug_chats",

        messages: "moonplug_messages",

        training: "moonplug_training",

        theme: "moonplug_theme",

        textSize: "moonplug_text_size"

    };


    /* =================================================
       OWNER CODE
       
       IMPORTANT:
       This is only client-side protection.
       A real secure owner system requires a server.
    ================================================= */

    const OWNER_CODE =
        "BumsUp1AI1591";


    /* =================================================
       SAFE STORAGE FUNCTIONS
    ================================================= */

    function getStorage(key, fallback) {

        try {

            const value =
                localStorage.getItem(key);

            if (value === null) {
                return fallback;
            }

            return JSON.parse(value);

        } catch (error) {

            console.warn(
                "Storage read error:",
                error
            );

            return fallback;

        }

    }


    function setStorage(key, value) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;

        } catch (error) {

            console.warn(
                "Storage write error:",
                error
            );

            return false;

        }

    }


    /* =================================================
       INITIALIZE STORAGE
    ================================================= */

    if (!localStorage.getItem(STORAGE.users)) {

        setStorage(
            STORAGE.users,
            []
        );

    }


    if (!localStorage.getItem(STORAGE.chats)) {

        setStorage(
            STORAGE.chats,
            []
        );

    }


    if (!localStorage.getItem(STORAGE.messages)) {

        setStorage(
            STORAGE.messages,
            []
        );

    }


    if (!localStorage.getItem(STORAGE.training)) {

        setStorage(
            STORAGE.training,
            []
        );

    }


    /* =================================================
       SIDEBAR
    ================================================= */

    function setSidebarExpanded(expanded) {

        if (!sidebar) {
            return;
        }


        if (expanded) {

            sidebar.classList.add(
                "expanded"
            );

            sidebar.classList.remove(
                "collapsed"
            );

        } else {

            sidebar.classList.add(
                "collapsed"
            );

            sidebar.classList.remove(
                "expanded"
            );

        }

    }


    function toggleSidebar() {

        if (!sidebar) {
            return;
        }


        const expanded =
            sidebar.classList.contains(
                "expanded"
            );


        setSidebarExpanded(
            !expanded
        );

    }


    /*
     * Desktop starts expanded.
     * iPad/iPhone starts collapsed.
     */

    function initializeSidebar() {

        if (!sidebar) {
            return;
        }


        if (
            window.matchMedia(
                "(max-width: 1200px)"
            ).matches
        ) {

            setSidebarExpanded(false);

        } else {

            setSidebarExpanded(true);

        }

    }


    initializeSidebar();


    /*
     * Clicking the logo toggles sidebar.
     */

    if (sidebarLogo) {

        sidebarLogo.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                toggleSidebar();

            }
        );

    }


    /*
     * Clicking EMPTY SPACE in sidebar
     * also toggles sidebar.
     *
     * Buttons themselves do not.
     */

    if (sidebar) {

        sidebar.addEventListener(
            "click",
            (event) => {

                const clickedButton =
                    event.target.closest(
                        ".sidebar-button"
                    );


                const clickedLogo =
                    event.target.closest(
                        ".sidebar-logo"
                    );


                if (
                    clickedButton ||
                    clickedLogo
                ) {

                    return;

                }


                toggleSidebar();

            }
        );

    }


    /* =================================================
       SIDEBAR BUTTONS
    ================================================= */

    function sidebarNotice(text) {

        if (messages) {

            removeEmptyChat();

            addMessage(
                text,
                "ai"
            );

        }

    }


    const newChatButton =
        document.getElementById(
            "newChatButton"
        );

    if (newChatButton) {

        newChatButton.addEventListener(
            "click",
            () => {

                clearChat();

            }
        );

    }


    const learnButton =
        document.getElementById(
            "learnButton"
        );

    if (learnButton) {

        learnButton.addEventListener(
            "click",
            () => {

                sidebarNotice(
                    "AI Learn is ready. You can train MoonPlug from the Owner Panel."
                );

            }
        );

    }


    const studyButton =
        document.getElementById(
            "studyButton"
        );

    if (studyButton) {

        studyButton.addEventListener(
            "click",
            () => {

                sidebarNotice(
                    "Study mode is ready."
                );

            }
        );

    }


    const cookButton =
        document.getElementById(
            "cookButton"
        );

    if (cookButton) {

        cookButton.addEventListener(
            "click",
            () => {

                sidebarNotice(
                    "Cook mode is ready."
                );

            }
        );

    }


    const imagesButton =
        document.getElementById(
            "imagesButton"
        );

    if (imagesButton) {

        imagesButton.addEventListener(
            "click",
            () => {

                sidebarNotice(
                    "Image mode is ready."
                );

            }
        );

    }


    const codeButton =
        document.getElementById(
            "codeButton"
        );

    if (codeButton) {

        codeButton.addEventListener(
            "click",
            () => {

                sidebarNotice(
                    "Code mode is ready."
                );

            }
        );

    }


    const switchButton =
        document.getElementById(
            "switchButton"
        );

    if (switchButton) {

        switchButton.addEventListener(
            "click",
            () => {

                sidebarNotice(
                    "AI Switch is ready."
                );

            }
        );

    }


    const historyButton =
        document.getElementById(
            "historyButton"
        );

    if (historyButton) {

        historyButton.addEventListener(
            "click",
            () => {

                const chats =
                    getStorage(
                        STORAGE.chats,
                        []
                    );


                sidebarNotice(
                    `You currently have ${chats.length} saved chat session(s).`
                );

            }
        );

    }


    /* =================================================
       SETTINGS
    ================================================= */

    function openSettings() {

        if (!settingsPanel) {
            return;
        }


        settingsPanel.classList.add(
            "open"
        );

        settingsPanel.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    function closeSettingsPanel() {

        if (!settingsPanel) {
            return;
        }


        settingsPanel.classList.remove(
            "open"
        );

        settingsPanel.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    if (settingsButton) {

        settingsButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                openSettings();

            }
        );

    }


    if (closeSettings) {

        closeSettings.addEventListener(
            "click",
            closeSettingsPanel
        );

    }


    if (settingsPanel) {

        settingsPanel.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    settingsPanel
                ) {

                    closeSettingsPanel();

                }

            }
        );

    }


    if (sidebarToggleSetting) {

        sidebarToggleSetting.addEventListener(
            "click",
            () => {

                toggleSidebar();

            }
        );

    }


    /* =================================================
       THEME
    ================================================= */

    function loadTheme() {

        const theme =
            localStorage.getItem(
                STORAGE.theme
            );


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


    loadTheme();


    if (themeButton) {

        themeButton.addEventListener(
            "click",
            () => {

                const light =
                    document.body.classList.toggle(
                        "light-theme"
                    );


                localStorage.setItem(
                    STORAGE.theme,
                    light
                        ? "light"
                        : "dark"
                );


                themeButton.textContent =
                    light
                        ? "Light"
                        : "Dark";

            }
        );

    }


    /* =================================================
       TEXT SIZE
    ================================================= */

    function loadTextSize() {

        const size =
            localStorage.getItem(
                STORAGE.textSize
            ) || "medium";


        document.body.classList.remove(
            "text-small",
            "text-medium",
            "text-large"
        );


        document.body.classList.add(
            "text-" + size
        );


        document
            .querySelectorAll(".size-button")
            .forEach((button) => {

                button.classList.toggle(
                    "active",
                    button.dataset.size === size
                );

            });

    }


    loadTextSize();


    document
        .querySelectorAll(".size-button")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const size =
                        button.dataset.size;


                    localStorage.setItem(
                        STORAGE.textSize,
                        size
                    );


                    loadTextSize();

                }
            );

        });


    /* =================================================
       CHAT
    ================================================= */

    function removeEmptyChat() {

        const currentEmpty =
            document.getElementById(
                "emptyChat"
            );


        if (currentEmpty) {

            currentEmpty.remove();

        }

    }


    function addMessage(
        text,
        type,
        save = true
    ) {

        if (!messages) {
            return null;
        }


        removeEmptyChat();


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


        requestAnimationFrame(
            () => {

                messages.scrollTop =
                    messages.scrollHeight;

            }
        );


        if (save) {

            const savedMessages =
                getStorage(
                    STORAGE.messages,
                    []
                );


            savedMessages.push({

                text: text,

                type: type,

                time:
                    new Date()
                    .toISOString()

            });


            setStorage(
                STORAGE.messages,
                savedMessages
            );


            updateOwnerStats();

        }


        return bubble;

    }


    function showTyping() {

        if (!typing) {
            return;
        }


        typing.style.display =
            "flex";

    }


    function hideTyping() {

        if (!typing) {
            return;
        }


        typing.style.display =
            "none";

    }


    /* =================================================
       LOCAL RESPONSE SYSTEM
    ================================================= */

    function getTraining() {

        return getStorage(
            STORAGE.training,
            []
        );

    }


    function findTrainingResponse(
        text
    ) {

        const training =
            getTraining();


        const lower =
            text.toLowerCase();


        for (
            let i = 0;
            i < training.length;
            i++
        ) {

            const item =
                training[i];


            if (
                item &&
                item.input &&
                lower.includes(
                    item.input.toLowerCase()
                )
            ) {

                return item.response;

            }

        }


        return null;

    }


    function generateLocalResponse(
        text
    ) {

        const lower =
            text.toLowerCase().trim();


        /*
         * First check owner training.
         */

        const trained =
            findTrainingResponse(
                lower
            );


        if (trained) {

            return trained;

        }


        /*
         * Basic built-in responses.
         */

        if (
            lower === "hi" ||
            lower === "hello" ||
            lower.includes("hey moonplug")
        ) {

            return "Hey! I'm MoonPlug AI. What would you like to work on?";

        }


        if (
            lower.includes("who are you")
        ) {

            return "I'm MoonPlug AI, your local AI assistant.";

        }


        if (
            lower.includes("what can you do")
        ) {

            return "I can chat, help with coding, explain things, study with you, and use information you've added to my local training system.";

        }


        if (
            lower.includes("python")
        ) {

            return "Python is a great language to learn. I can help you understand Python concepts and build projects step by step.";

        }


        if (
            lower.includes("thank")
        ) {

            return "You're welcome!";

        }


        if (
            lower.includes("bye")
        ) {

            return "See you later!";

        }


        if (
            lower.endsWith("?")
        ) {

            return "That's a good question. I can work through it with you step by step.";

        }


        /*
         * Default response.
         */

        return "I received your message. I'm currently running MoonPlug's local response system without an API. You can add custom knowledge through the Owner Panel.";

    }


    /* =================================================
       SEND MESSAGE
    ================================================= */

    function sendMessage() {

        if (!messageInput) {
            return;
        }


        const text =
            messageInput.value.trim();


        if (!text) {
            return;
        }


        /*
         * HIDDEN OWNER CODE DETECTION
         *
         * The code can be typed into the chat.
         */

        if (
            text === OWNER_CODE
        ) {

            messageInput.value = "";

            openOwnerPanel();

            return;

        }


        addMessage(
            text,
            "user"
        );


        messageInput.value = "";


        showTyping();


        const chats =
            getStorage(
                STORAGE.chats,
                []
            );


        chats.push({

            message: text,

            time:
                new Date()
                .toISOString()

        });


        setStorage(
            STORAGE.chats,
            chats
        );


        updateOwnerStats();


        setTimeout(
            () => {

                hideTyping();


                const response =
                    generateLocalResponse(
                        text
                    );


                addMessage(
                    response,
                    "ai"
                );

            },
            650
        );

    }


    if (sendButton) {

        sendButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                sendMessage();

            }
        );

    }


    if (messageInput) {

        messageInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

    }


    /* =================================================
       NEW CHAT
    ================================================= */

    function clearChat() {

        if (!messages) {
            return;
        }


        messages.innerHTML = "";


        const newEmpty =
            document.createElement(
                "div"
            );


        newEmpty.id =
            "emptyChat";


        newEmpty.className =
            "empty-chat";


        newEmpty.innerHTML = `
            <h1>What can I help with?</h1>
            <p>Ask MoonPlug anything.</p>
        `;


        messages.appendChild(
            newEmpty
        );


        if (messageInput) {

            messageInput.value = "";

            messageInput.focus();

        }

    }


    /* =================================================
       ACCOUNT
    ================================================= */

    function openAccount() {

        if (!accountScreen) {
            return;
        }


        accountScreen.classList.add(
            "open"
        );


        accountScreen.setAttribute(
            "aria-hidden",
            "false"
        );


        if (loginEmail) {

            loginEmail.focus();

        }

    }


    function closeAccountScreen() {

        if (!accountScreen) {
            return;
        }


        accountScreen.classList.remove(
            "open"
        );


        accountScreen.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    if (accountButton) {

        accountButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                openAccount();

            }
        );

    }


    if (closeAccount) {

        closeAccount.addEventListener(
            "click",
            closeAccountScreen
        );

    }


    /* =================================================
       ACCOUNT TABS
    ================================================= */

    function showLogin() {

        if (!loginForm || !signupForm) {
            return;
        }


        loginForm.hidden =
            false;


        signupForm.hidden =
            true;


        loginTab?.classList.add(
            "active"
        );


        signupTab?.classList.remove(
            "active"
        );


        if (accountMessage) {

            accountMessage.textContent =
                "";

        }

    }


    function showSignup() {

        if (!loginForm || !signupForm) {
            return;
        }


        loginForm.hidden =
            true;


        signupForm.hidden =
            false;


        signupTab?.classList.add(
            "active"
        );


        loginTab?.classList.remove(
            "active"
        );


        if (accountMessage) {

            accountMessage.textContent =
                "";

        }

    }


    if (loginTab) {

        loginTab.addEventListener(
            "click",
            showLogin
        );

    }


    if (signupTab) {

        signupTab.addEventListener(
            "click",
            showSignup
        );

    }


    /* =================================================
       LOGIN
    ================================================= */

    const loginEmail =
        document.getElementById(
            "loginEmail"
        );

    const loginPassword =
        document.getElementById(
            "loginPassword"
        );


    function isOwnerCode(value) {

        if (!value) {
            return false;
        }


        return (
            value.trim() ===
            OWNER_CODE
        );

    }


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();


                const email =
                    loginEmail?.value.trim()
                    || "";


                const password =
                    loginPassword?.value
                    || "";


                /*
                 * Owner code can be placed
                 * in email OR password.
                 */

                if (
                    isOwnerCode(email) ||
                    isOwnerCode(password)
                ) {

                    openOwnerPanel();

                    return;

                }


                if (
                    !email ||
                    !password
                ) {

                    accountMessage.textContent =
                        "Please enter your email and password.";

                    return;

                }


                const users =
                    getStorage(
                        STORAGE.users,
                        []
                    );


                const user =
                    users.find(
                        (item) =>
                            item.email ===
                            email &&
                            item.password ===
                            password
                    );


                if (!user) {

                    accountMessage.textContent =
                        "Account not found. Create an account first.";

                    return;

                }


                accountMessage.textContent =
                    "Logged in successfully!";


                setTimeout(
                    () => {

                        closeAccountScreen();

                    },
                    600
                );

            }
        );

    }


    /* =================================================
       SIGN UP
    ================================================= */

    const signupEmail =
        document.getElementById(
            "signupEmail"
        );

    const signupPassword =
        document.getElementById(
            "signupPassword"
        );

    const signupConfirm =
        document.getElementById(
            "signupConfirm"
        );


    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();


                const email =
                    signupEmail?.value.trim()
                    || "";


                const password =
                    signupPassword?.value
                    || "";


                const confirm =
                    signupConfirm?.value
                    || "";


                /*
                 * Hidden owner detection.
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
                    !email ||
                    !password ||
                    !confirm
                ) {

                    accountMessage.textContent =
                        "Please fill in every field.";

                    return;

                }


                if (
                    password !== confirm
                ) {

                    accountMessage.textContent =
                        "Passwords do not match.";

                    return;

                }


                if (
                    password.length < 4
                ) {

                    accountMessage.textContent =
                        "For this demo, use at least 4 characters.";

                    return;

                }


                const users =
                    getStorage(
                        STORAGE.users,
                        []
                    );


                const existing =
                    users.some(
                        (user) =>
                            user.email ===
                            email
                    );


                if (existing) {

                    accountMessage.textContent =
                        "That account already exists.";

                    return;

                }


                users.push({

                    email: email,

                    password: password,

                    created:
                        new Date()
                        .toISOString()

                });


                setStorage(
                    STORAGE.users,
                    users
                );


                accountMessage.textContent =
                    "Account created successfully!";


                updateOwnerStats();


                setTimeout(
                    () => {

                        showLogin();

                    },
                    700
                );

            }
        );

    }


    /* =================================================
       OWNER PANEL
    ================================================= */

    function openOwnerPanel() {

        closeAccountScreen();


        if (ownerLogin) {

            ownerLogin.classList.remove(
                "open"
            );

        }


        if (ownerPanel) {

            ownerPanel.classList.add(
                "open"
            );


            ownerPanel.setAttribute(
                "aria-hidden",
                "false"
            );

        }


        updateOwnerStats();

    }


    function closeOwnerPanel() {

        if (!ownerPanel) {
            return;
        }


        ownerPanel.classList.remove(
            "open"
        );


        ownerPanel.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    function openOwnerLogin() {

        if (!ownerLogin) {
            return;
        }


        ownerLogin.classList.add(
            "open"
        );


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


    /*
     * Clicking Account opens public account.
     *
     * Owner panel can be reached by:
     *
     * 1. Entering owner code in chat
     * 2. Entering owner code into email
     * 3. Entering owner code into password
     *
     * We also keep the owner login function available.
     */

    if (ownerLoginButton) {

        ownerLoginButton.addEventListener(
            "click",
            () => {

                const value =
                    ownerCode?.value.trim()
                    || "";


                if (
                    value ===
                    OWNER_CODE
                ) {

                    openOwnerPanel();

                } else {

                    if (ownerError) {

                        ownerError.textContent =
                            "Incorrect owner code.";

                    }

                }

            }
        );

    }


    if (ownerCode) {

        ownerCode.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    ownerLoginButton?.click();

                }

            }
        );

    }


    if (ownerCancel) {

        ownerCancel.addEventListener(
            "click",
            () => {

                ownerLogin.classList.remove(
                    "open"
                );

            }
        );

    }


    if (ownerLogout) {

        ownerLogout.addEventListener(
            "click",
            () => {

                closeOwnerPanel();

            }
        );

    }


    /* =================================================
       OWNER STATISTICS
    ================================================= */

    function updateOwnerStats() {

        const users =
            getStorage(
                STORAGE.users,
                []
            );


        const chats =
            getStorage(
                STORAGE.chats,
                []
            );


        const savedMessages =
            getStorage(
                STORAGE.messages,
                []
            );


        if (ownerUsers) {

            ownerUsers.textContent =
                users.length;

        }


        if (ownerChats) {

            ownerChats.textContent =
                chats.length;

        }


        if (ownerMessages) {

            ownerMessages.textContent =
                savedMessages.length;

        }

    }


    updateOwnerStats();


    /* =================================================
       OWNER CONTROLS
    ================================================= */

    if (manageUsersButton) {

        manageUsersButton.addEventListener(
            "click",
            () => {

                const users =
                    getStorage(
                        STORAGE.users,
                        []
                    );


                ownerActionMessage.textContent =
                    `There are currently ${users.length} local account(s).`;

            }
        );

    }


    if (manageChatsButton) {

        manageChatsButton.addEventListener(
            "click",
            () => {

                const chats =
                    getStorage(
                        STORAGE.chats,
                        []
                    );


                ownerActionMessage.textContent =
                    `There are currently ${chats.length} saved chat message(s).`;

            }
        );

    }


    if (appSettingsButton) {

        appSettingsButton.addEventListener(
            "click",
            () => {

                ownerActionMessage.textContent =
                    "App settings are controlled from the Settings panel.";

                closeOwnerPanel();

                openSettings();

            }
        );

    }


    /* =================================================
       TRAINER
    ================================================= */

    if (saveTrainingButton) {

        saveTrainingButton.addEventListener(
            "click",
            () => {

                const value =
                    trainingInput?.value.trim()
                    || "";


                if (!value) {

                    trainingStatus.textContent =
                        "Type something first.";

                    return;

                }


                /*
                 * Format:
                 *
                 * question
                 * =>
                 * response
                 *
                 * If no => is supplied,
                 * store the whole thing.
                 */

                let input =
                    value;

                let response =
                    value;


                if (
                    value.includes(
                        "=>"
                    )
                ) {

                    const parts =
                        value.split(
                            "=>"
                        );


                    input =
                        parts.shift()
                            .trim();


                    response =
                        parts
                            .join("=>")
                            .trim();

                }


                const training =
                    getStorage(
                        STORAGE.training,
                        []
                    );


                training.push({

                    input: input,

                    response:
                        response || input,

                    time:
                        new Date()
                        .toISOString()

                });


                setStorage(
                    STORAGE.training,
                    training
                );


                trainingInput.value =
                    "";


                trainingStatus.textContent =
                    "Training saved locally.";

            }
        );

    }


    if (clearTrainingButton) {

        clearTrainingButton.addEventListener(
            "click",
            () => {

                const confirmed =
                    window.confirm(
                        "Clear all MoonPlug training?"
                    );


                if (!confirmed) {
                    return;
                }


                setStorage(
                    STORAGE.training,
                    []
                );


                trainingStatus.textContent =
                    "All local training was cleared.";

            }
        );

    }


    /* =================================================
       OWNER CHAT
    ================================================= */

    function addOwnerChatMessage(
        text,
        type
    ) {

        if (!ownerChatMessages) {
            return;
        }


        const bubble =
            document.createElement(
                "div"
            );


        bubble.className =
            "owner-chat-bubble " +
            type;


        bubble.textContent =
            text;


        ownerChatMessages.appendChild(
            bubble
        );


        ownerChatMessages.scrollTop =
            ownerChatMessages.scrollHeight;

    }


    function sendOwnerChat() {

        if (!ownerChatInput) {
            return;
        }


        const text =
            ownerChatInput.value.trim();


        if (!text) {
            return;
        }


        addOwnerChatMessage(
            text,
            "user"
        );


        ownerChatInput.value =
            "";


        const response =
            generateLocalResponse(
                text
            );


        setTimeout(
            () => {

                addOwnerChatMessage(
                    response,
                    "ai"
                );

            },
            250
        );

    }


    if (ownerChatSend) {

        ownerChatSend.addEventListener(
            "click",
            sendOwnerChat
        );

    }


    if (ownerChatInput) {

        ownerChatInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    sendOwnerChat();

                }

            }
        );

    }


    /* =================================================
       ESCAPE KEY
    ================================================= */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                "Escape"
            ) {

                closeSettingsPanel();

                closeAccountScreen();

                if (ownerLogin) {

                    ownerLogin.classList.remove(
                        "open"
                    );

                }

            }

        }
    );


    /* =================================================
       WINDOW RESIZE
    ================================================= */

    window.addEventListener(
        "resize",
        () => {

            /*
             * Don't automatically change the
             * sidebar after the user has manually
             * expanded/collapsed it.
             */

            if (
                window.innerWidth <= 1200 &&
                !sidebar?.classList.contains(
                    "expanded"
                )
            ) {

                sidebar?.classList.add(
                    "collapsed"
                );

            }

        }
    );


    /* =================================================
       STARTUP
    ================================================= */

    if (messageInput) {

        setTimeout(
            () => {

                messageInput.focus();

            },
            150
        );

    }


    console.log(
        "MoonPlug AI loaded successfully."
    );

});
