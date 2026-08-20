
document.addEventListener("DOMContentLoaded", function () {

    "use strict";


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const sidebar =
        document.getElementById("sidebar");

    const sidebarLogo =
        document.getElementById("sidebarLogo");

    const messages =
        document.getElementById("messages");

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


    /* ACCOUNT */

    const ownerButton =
        document.getElementById("ownerButton");

    const accountScreen =
        document.getElementById("accountScreen");

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


    /* OWNER */

    const ownerLogin =
        document.getElementById("ownerLogin");

    const ownerCodeInput =
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



    /* =====================================================
       OWNER CODE
    ===================================================== */

    const OWNER_CODE =
        "BumsUp1AI1591";



    /* =====================================================
       SIDEBAR
       
       IMPORTANT:
       Clicking ANY empty sidebar space expands it.
       
       Clicking a sidebar button does not accidentally
       toggle it.
    ===================================================== */

    function toggleSidebar() {

        if (!sidebar) {
            return;
        }

        sidebar.classList.toggle("expanded");

    }


    if (sidebar) {

        sidebar.addEventListener("click", function (event) {

            const clickedButton =
                event.target.closest(".sidebar-button");

            const clickedLogo =
                event.target.closest(".sidebar-logo");


            /*
             * Logo always toggles sidebar.
             */

            if (clickedLogo) {

                toggleSidebar();

                return;

            }


            /*
             * If they clicked a real button,
             * don't toggle the sidebar.
             */

            if (clickedButton) {

                return;

            }


            /*
             * Anything else inside the sidebar
             * is empty space.
             */

            toggleSidebar();

        });

    }



    /* =====================================================
       SETTINGS
    ===================================================== */

    function openSettings() {

        if (!settingsPanel) {
            return;
        }

        settingsPanel.classList.add("open");

        settingsPanel.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    function closeSettingsPanel() {

        if (!settingsPanel) {
            return;
        }

        settingsPanel.classList.remove("open");

        settingsPanel.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    if (settingsButton) {

        settingsButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                openSettings();

            }
        );

    }


    if (closeSettings) {

        closeSettings.addEventListener(
            "click",
            function () {

                closeSettingsPanel();

            }
        );

    }


    if (settingsPanel) {

        settingsPanel.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === settingsPanel
                ) {

                    closeSettingsPanel();

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
            function () {

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
       TEXT SIZE
    ===================================================== */

    const sizeButtons =
        document.querySelectorAll(
            ".size-button"
        );


    sizeButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const size =
                    button.dataset.size;


                document.body.classList.remove(
                    "text-small",
                    "text-medium",
                    "text-large"
                );


                document.body.classList.add(
                    "text-" + size
                );


                sizeButtons.forEach(
                    function (otherButton) {

                        otherButton.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add("active");

            }
        );

    });



    /* =====================================================
       MESSAGE BUBBLE
    ===================================================== */

    function addMessage(text, type) {

        if (!messages) {
            return;
        }


        const bubble =
            document.createElement("div");


        bubble.className =
            "message-bubble " + type;


        bubble.textContent =
            text;


        messages.appendChild(
            bubble
        );


        requestAnimationFrame(
            function () {

                messages.scrollTop =
                    messages.scrollHeight;

            }
        );

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
       SEND MESSAGE
    ===================================================== */

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
         * Remove the "What can I help with?"
         * screen once the first message is sent.
         */

        removeEmptyChat();


        /*
         * USER BUBBLE
         */

        addMessage(
            text,
            "user"
        );


        /*
         * CLEAR INPUT
         */

        messageInput.value = "";


        /*
         * SHOW TYPING
         */

        if (typing) {

            typing.style.display =
                "block";

        }


        /*
         * TEMPORARY RESPONSE
         *
         * This is NOT the final AI.
         * It simply proves the chat system works.
         */

        window.setTimeout(
            function () {

                if (typing) {

                    typing.style.display =
                        "none";

                }


                addMessage(
                    "I'm ready to help.",
                    "ai"
                );

            },
            700
        );

    }



    /* =====================================================
       SEND BUTTON
    ===================================================== */

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            function (event) {

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
            function (event) {

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
       NEW CHAT
    ===================================================== */

    const newChatButton =
        document.getElementById(
            "newChatButton"
        );


    if (newChatButton) {

        newChatButton.addEventListener(
            "click",
            function () {

                if (!messages) {
                    return;
                }


                messages.innerHTML = "";


                const empty =
                    document.createElement(
                        "div"
                    );


                empty.className =
                    "empty-chat";


                empty.innerHTML =
                    `
                    <h1>What can I help with?</h1>
                    <p>Ask MoonPlug anything.</p>
                    `;


                messages.appendChild(
                    empty
                );


                if (messageInput) {

                    messageInput.value = "";

                    messageInput.focus();

                }

            }
        );

    }



    /* =====================================================
       ACCOUNT SCREEN
    ===================================================== */

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


        if (accountMessage) {

            accountMessage.textContent =
                "";

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


    if (ownerButton) {

        ownerButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                openAccount();

            }
        );

    }


    if (closeAccount) {

        closeAccount.addEventListener(
            "click",
            function () {

                closeAccountScreen();

            }
        );

    }



    /* =====================================================
       LOGIN / SIGNUP TABS
    ===================================================== */

    function showLogin() {

        if (
            !loginForm ||
            !signupForm ||
            !loginTab ||
            !signupTab
        ) {
            return;
        }


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


    function showSignup() {

        if (
            !loginForm ||
            !signupForm ||
            !loginTab ||
            !signupTab
        ) {
            return;
        }


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



    /* =====================================================
       OWNER CODE CHECK
    ===================================================== */

    function isOwnerCode(value) {

        if (!value) {
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

        /*
         * Close account screen.
         */

        if (accountScreen) {

            accountScreen.classList.remove(
                "open"
            );

            accountScreen.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        /*
         * Close owner login.
         */

        if (ownerLogin) {

            ownerLogin.classList.remove(
                "open"
            );

            ownerLogin.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        /*
         * Open owner panel.
         */

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



    /* =====================================================
       CLOSE OWNER PANEL
    ===================================================== */

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



    /* =====================================================
       OWNER LOGIN POPUP
       
       The Account button itself opens the public
       login/signup screen.
       
       The owner code can also be detected inside
       login/signup fields.
    ===================================================== */

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


        if (ownerError) {

            ownerError.textContent =
                "";

        }


        if (ownerCodeInput) {

            ownerCodeInput.value = "";

            ownerCodeInput.focus();

        }

    }



    function closeOwnerLogin() {

        if (!ownerLogin) {
            return;
        }


        ownerLogin.classList.remove(
            "open"
        );


        ownerLogin.setAttribute(
            "aria-hidden",
            "true"
        );

    }



    /* =====================================================
       OWNER LOGIN BUTTON
    ===================================================== */

    if (ownerLoginButton) {

        ownerLoginButton.addEventListener(
            "click",
            function () {

                const value =
                    ownerCodeInput
                        ? ownerCodeInput.value
                        : "";


                if (
                    isOwnerCode(value)
                ) {

                    openOwnerPanel();

                    return;

                }


                if (ownerError) {

                    ownerError.textContent =
                        "Incorrect owner code.";

                }

            }
        );

    }



    /* =====================================================
       OWNER CODE ENTER KEY
    ===================================================== */

    if (ownerCodeInput) {

        ownerCodeInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();


                    if (ownerLoginButton) {

                        ownerLoginButton.click();

                    }

                }

            }
        );

    }



    /* =====================================================
       OWNER CANCEL
    ===================================================== */

    if (ownerCancel) {

        ownerCancel.addEventListener(
            "click",
            function () {

                closeOwnerLogin();

            }
        );

    }



    /* =====================================================
       LOGIN FORM
       
       Owner code works if placed in either
       email OR password.
    ===================================================== */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            function (event) {

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
                 * OWNER DETECTION
                 */

                if (
                    isOwnerCode(email) ||
                    isOwnerCode(password)
                ) {

                    openOwnerPanel();

                    return;

                }


                /*
                 * NORMAL LOGIN
                 */

                if (accountMessage) {

                    accountMessage.textContent =
                        "Authentication will be connected next.";

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
            function (event) {

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
                 * OWNER DETECTION
                 */

                if (
                    isOwnerCode(email) ||
                    isOwnerCode(password) ||
                    isOwnerCode(confirm)
                ) {

                    openOwnerPanel();

                    return;

                }


                /*
                 * PASSWORD CHECK
                 */

                if (
                    password !== confirm
                ) {

                    if (accountMessage) {

                        accountMessage.textContent =
                            "Passwords do not match.";

                    }

                    return;

                }


                /*
                 * NORMAL SIGNUP
                 */

                if (accountMessage) {

                    accountMessage.textContent =
                        "Account creation will be connected to authentication next.";

                }

            }
        );

    }



    /* =====================================================
       OWNER LOGOUT
    ===================================================== */

    if (ownerLogout) {

        ownerLogout.addEventListener(
            "click",
            function () {

                closeOwnerPanel();

            }
        );

    }



    /* =====================================================
       OWNER STATS
    ===================================================== */

    function updateOwnerStats() {

        const usersElement =
            document.getElementById(
                "ownerUsers"
            );


        const chatsElement =
            document.getElementById(
                "ownerChats"
            );


        /*
         * These are placeholders until we
         * connect a real database/storage system.
         */

        if (usersElement) {

            usersElement.textContent =
                "0";

        }


        if (chatsElement) {

            const chatCount =
                document.querySelectorAll(
                    ".message-bubble.user"
                ).length;


            chatsElement.textContent =
                chatCount;

        }

    }



    /* =====================================================
       OWNER CONTROL BUTTONS
    ===================================================== */

    const manageUsersButton =
        document.getElementById(
            "manageUsersButton"
        );


    const manageChatsButton =
        document.getElementById(
            "manageChatsButton"
        );


    const appSettingsButton =
        document.getElementById(
            "appSettingsButton"
        );


    const trainerButton =
        document.getElementById(
            "trainerButton"
        );


    if (manageUsersButton) {

        manageUsersButton.addEventListener(
            "click",
            function () {

                alert(
                    "User management will be added to the Owner Panel."
                );

            }
        );

    }


    if (manageChatsButton) {

        manageChatsButton.addEventListener(
            "click",
            function () {

                alert(
                    "Chat management will be added to the Owner Panel."
                );

            }
        );

    }


    if (appSettingsButton) {

        appSettingsButton.addEventListener(
            "click",
            function () {

                closeOwnerPanel();

                openSettings();

            }
        );

    }


    if (trainerButton) {

        trainerButton.addEventListener(
            "click",
            function () {

                alert(
                    "The MoonPlug AI Trainer will go here."
                );

            }
        );

    }



    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            closeSettingsPanel();

            closeAccountScreen();

            closeOwnerLogin();

            closeOwnerPanel();

        }
    );


    /* =====================================================
       INITIAL STATE
    ===================================================== */

    /*
     * Make sure the sidebar starts thin
     * on tablet/phone through CSS.
     */

    if (sidebar) {

        sidebar.classList.remove(
            "expanded"
        );

    }


    /*
     * Make sure owner screens start closed.
     */

    if (ownerPanel) {

        ownerPanel.classList.remove(
            "open"
        );

    }


    if (ownerLogin) {

        ownerLogin.classList.remove(
            "open"
        );

    }


    if (accountScreen) {

        accountScreen.classList.remove(
            "open"
        );

    }


    console.log(
        "MoonPlug AI loaded successfully."
    );

});

