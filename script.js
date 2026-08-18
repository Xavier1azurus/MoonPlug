document.addEventListener("DOMContentLoaded", () => {

    /* ===============================
       BASIC ELEMENTS
    =============================== */

    const sidebar = document.querySelector(".sidebar");
    const messages = document.getElementById("messages");
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const typing = document.getElementById("typing");

    const settingsButton = document.getElementById("settingsButton");
    const settingsPanel = document.getElementById("settingsPanel");
    const closeSettings = document.getElementById("closeSettings");
    const themeButton = document.getElementById("themeButton");

    const accountScreen = document.getElementById("accountScreen");
    const ownerButton = document.getElementById("ownerButton");

    const loginTab = document.getElementById("loginTab");
    const signupTab = document.getElementById("signupTab");

    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");

    const closeAccount = document.getElementById("closeAccount");
    const accountMessage = document.getElementById("accountMessage");

    const ownerPanel = document.getElementById("ownerPanel");
    const ownerLogout = document.getElementById("ownerLogout");


    /* ===============================
       SIDEBAR
    =============================== */

    if (sidebar) {

        sidebar.addEventListener("click", (event) => {

            /*
             * Clicking a button should NOT
             * expand/collapse the sidebar.
             */

            if (event.target.closest(".sidebar-button")) {
                return;
            }

            /*
             * Clicking the logo or empty sidebar
             * space expands/collapses it.
             */

            sidebar.classList.toggle("expanded");

        });

    }


    /* ===============================
       SETTINGS
    =============================== */

    if (settingsButton && settingsPanel) {

        settingsButton.addEventListener("click", (event) => {

            event.stopPropagation();

            settingsPanel.classList.add("open");

        });

    }


    if (closeSettings && settingsPanel) {

        closeSettings.addEventListener("click", () => {

            settingsPanel.classList.remove("open");

        });

    }


    if (settingsPanel) {

        settingsPanel.addEventListener("click", (event) => {

            if (event.target === settingsPanel) {

                settingsPanel.classList.remove("open");

            }

        });

    }


    /* ===============================
       THEME
    =============================== */

    if (themeButton) {

        themeButton.addEventListener("click", () => {

            document.body.classList.toggle("light-theme");

            if (
                document.body.classList.contains("light-theme")
            ) {

                themeButton.textContent = "Light";

            } else {

                themeButton.textContent = "Dark";

            }

        });

    }


    /* ===============================
       CREATE MESSAGE
    =============================== */

    function addMessage(text, type) {

        if (!messages) {
            return;
        }

        const bubble = document.createElement("div");

        bubble.className =
            "message-bubble " + type;

        bubble.textContent = text;

        messages.appendChild(bubble);

        messages.scrollTop =
            messages.scrollHeight;

    }


    /* ===============================
       SEND MESSAGE
    =============================== */

    function sendMessage() {

        if (!messageInput || !messages) {
            return;
        }

        const text =
            messageInput.value.trim();

        if (!text) {
            return;
        }


        const emptyChat =
            document.querySelector(".empty-chat");

        if (emptyChat) {
            emptyChat.remove();
        }


        /* USER MESSAGE */

        addMessage(
            text,
            "user"
        );


        messageInput.value = "";


        /* TYPING */

        if (typing) {
            typing.style.display = "block";
        }


        /* TEMPORARY AI RESPONSE */

        setTimeout(() => {

            if (typing) {
                typing.style.display = "none";
            }

            addMessage(
                "I'm ready to help.",
                "ai"
            );

        }, 800);

    }


    /* ===============================
       SEND BUTTON
    =============================== */

    if (sendButton) {

        sendButton.addEventListener("click", (event) => {

            event.preventDefault();

            sendMessage();

        });

    }


    /* ===============================
       ENTER TO SEND
    =============================== */

    if (messageInput) {

        messageInput.addEventListener("keydown", (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();

            }

        });

    }


    /* ===============================
       ACCOUNT SCREEN
    =============================== */

    if (ownerButton && accountScreen) {

        ownerButton.addEventListener("click", (event) => {

            event.preventDefault();

            event.stopPropagation();

            accountScreen.classList.add("open");

        });

    }


    /* ===============================
       LOGIN TAB
    =============================== */

    if (loginTab && signupTab && loginForm && signupForm) {

        loginTab.addEventListener("click", () => {

            loginTab.classList.add("active");

            signupTab.classList.remove("active");

            loginForm.style.display = "flex";

            signupForm.style.display = "none";

            if (accountMessage) {
                accountMessage.textContent = "";
            }

        });


        /* ===============================
           SIGN UP TAB
        =============================== */

        signupTab.addEventListener("click", () => {

            signupTab.classList.add("active");

            loginTab.classList.remove("active");

            signupForm.style.display = "flex";

            loginForm.style.display = "none";

            if (accountMessage) {
                accountMessage.textContent = "";
            }

        });

    }


    /* ===============================
       CLOSE ACCOUNT
    =============================== */

    if (closeAccount && accountScreen) {

        closeAccount.addEventListener("click", () => {

            accountScreen.classList.remove("open");

        });

    }


    /* ===============================
       OWNER CODE
    =============================== */

    const OWNER_CODE = "BumsUp1AI1591";


    function isOwnerCode(value) {

        if (!value) {
            return false;
        }

        return value.trim() === OWNER_CODE;

    }


    /* ===============================
       LOGIN
    =============================== */

    if (loginForm) {

        loginForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const email =
                document.getElementById("loginEmail")?.value || "";

            const password =
                document.getElementById("loginPassword")?.value || "";


            if (
                isOwnerCode(email) ||
                isOwnerCode(password)
            ) {

                openOwnerPanel();

                return;

            }


            if (accountMessage) {

                accountMessage.textContent =
                    "Login will be connected to authentication next.";

            }

        });

    }


    /* ===============================
       SIGN UP
    =============================== */

    if (signupForm) {

        signupForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const email =
                document.getElementById("signupEmail")?.value || "";

            const password =
                document.getElementById("signupPassword")?.value || "";

            const confirm =
                document.getElementById("signupConfirm")?.value || "";


            if (
                isOwnerCode(email) ||
                isOwnerCode(password)
            ) {

                openOwnerPanel();

                return;

            }


            if (password !== confirm) {

                if (accountMessage) {

                    accountMessage.textContent =
                        "Passwords do not match.";

                }

                return;

            }


            if (accountMessage) {

                accountMessage.textContent =
                    "Account signup will be connected to authentication next.";

            }

        });

    }


    /* ===============================
       OPEN OWNER PANEL
    =============================== */

    function openOwnerPanel() {

        if (accountScreen) {
            accountScreen.classList.remove("open");
        }

        if (ownerPanel) {
            ownerPanel.classList.add("open");
        }

    }


    /* ===============================
       OWNER LOGOUT
    =============================== */

    if (ownerLogout && ownerPanel) {

        ownerLogout.addEventListener("click", () => {

            ownerPanel.classList.remove("open");

        });

    }

});
