
document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       MOONPLUG AI
       SECURE-STRUCTURE FRONTEND
       =====================================================

       IMPORTANT:
       This is a frontend security structure.

       GitHub Pages is static hosting, so a secret stored
       inside JavaScript can still be discovered.

       Real authentication should eventually be handled by
       a backend/server.

       ===================================================== */


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


    /* =====================================================
       OWNER LOGIN
       ===================================================== */

    const ownerOverlay =
        document.getElementById("ownerOverlay");

    const ownerLoginForm =
        document.getElementById("ownerLoginForm");

    const ownerPassword =
        document.getElementById("ownerPassword");

    const ownerError =
        document.getElementById("ownerError");

    const ownerCancel =
        document.getElementById("ownerCancel");


    /* =====================================================
       OWNER SESSION
       ===================================================== */

    const OWNER_SESSION_KEY =
        "moonplug_owner_session";

    const SESSION_LENGTH =
        30 * 60 * 1000;


    /* =====================================================
       FRONTEND DEMO AUTHENTICATION
       =====================================================

       TEMPORARY ONLY.

       DO NOT consider this a real secret on GitHub Pages.

       We will replace this with server-side authentication
       when the backend is added.
       ===================================================== */

    const OWNER_SECRET =
        "BumsUp1AI1591";


    /* =====================================================
       SIDEBAR
       ===================================================== */

    if (sidebar) {

        sidebar.addEventListener(
            "click",
            (event) => {

                if (
                    event.target.closest(
                        ".sidebar-button"
                    )
                ) {
                    return;
                }

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
            (event) => {

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
            (event) => {

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

                if (
                    document.body.classList.contains(
                        "light-theme"
                    )
                ) {

                    themeButton.textContent =
                        "Light";

                } else {

                    themeButton.textContent =
                        "Dark";

                }

            }
        );

    }


    /* =====================================================
       ADD MESSAGE
       ===================================================== */

    function addMessage(
        text,
        type
    ) {

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

        messages.scrollTop =
            messages.scrollHeight;

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
            messageInput.value.trim();

        if (!text) {
            return;
        }


        const emptyChat =
            document.querySelector(
                ".empty-chat"
            );

        if (emptyChat) {

            emptyChat.remove();

        }


        addMessage(
            text,
            "user"
        );


        messageInput.value =
            "";


        if (typing) {

            typing.style.display =
                "block";

        }


        setTimeout(
            () => {

                if (typing) {

                    typing.style.display =
                        "none";

                }

                addMessage(
                    "I'm ready to help.",
                    "ai"
                );

            },
            800
        );

    }


    /* =====================================================
       SEND BUTTON
       ===================================================== */

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            (event) => {

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
            (event) => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

    }


    /* =====================================================
       OWNER LOGIN OPEN
       ===================================================== */

    if (
        ownerButton &&
        ownerOverlay
    ) {

        ownerButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();

                openOwnerLogin();

            }
        );

    }


    /* =====================================================
       OPEN OWNER LOGIN
       ===================================================== */

    function openOwnerLogin() {

        if (!ownerOverlay) {
            return;
        }

        if (ownerError) {

            ownerError.textContent =
                "";

        }

        if (ownerPassword) {

            ownerPassword.value =
                "";

        }

        ownerOverlay.classList.add(
            "open"
        );

        setTimeout(
            () => {

                if (ownerPassword) {

                    ownerPassword.focus();

                }

            },
            50
        );

    }


    /* =====================================================
       CLOSE OWNER LOGIN
       ===================================================== */

    function closeOwnerLogin() {

        if (!ownerOverlay) {
            return;
        }

        ownerOverlay.classList.remove(
            "open"
        );

        if (ownerPassword) {

            ownerPassword.value =
                "";

        }

        if (ownerError) {

            ownerError.textContent =
                "";

        }

    }


    /* =====================================================
       OWNER LOGIN FORM
       ===================================================== */

    if (ownerLoginForm) {

        ownerLoginForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                const enteredCode =
                    ownerPassword
                        ?.value
                        ?.trim() || "";


                if (!enteredCode) {

                    showOwnerError(
                        "Please enter the owner code."
                    );

                    return;

                }


                if (
                    enteredCode !==
                    OWNER_SECRET
                ) {

                    showOwnerError(
                        "Incorrect owner code."
                    );

                    return;

                }


                createOwnerSession();

                closeOwnerLogin();

                openOwnerPanel();

            }
        );

    }


    /* =====================================================
       OWNER LOGIN ERROR
       ===================================================== */

    function showOwnerError(
        message
    ) {

        if (!ownerError) {
            return;
        }

        ownerError.textContent =
            message;

    }


    /* =====================================================
       OWNER SESSION
       ===================================================== */

    function createOwnerSession() {

        const session = {

            authenticated: true,

            created:
                Date.now(),

            expires:
                Date.now()
                + SESSION_LENGTH

        };


        try {

            sessionStorage.setItem(
                OWNER_SESSION_KEY,
                JSON.stringify(session)
            );

        } catch (error) {

            console.warn(
                "Could not create owner session.",
                error
            );

        }

    }


    /* =====================================================
       GET OWNER SESSION
       ===================================================== */

    function getOwnerSession() {

        try {

            const raw =
                sessionStorage.getItem(
                    OWNER_SESSION_KEY
                );

            if (!raw) {
                return null;
            }

            const session =
                JSON.parse(raw);

            if (
                !session ||
                !session.authenticated
            ) {

                return null;

            }

            return session;

        } catch (error) {

            return null;

        }

    }


    /* =====================================================
       CHECK OWNER SESSION
       ===================================================== */

    function isOwnerAuthenticated() {

        const session =
            getOwnerSession();

        if (!session) {

            return false;

        }


        if (
            Date.now() >=
            session.expires
        ) {

            destroyOwnerSession();

            return false;

        }


        return true;

    }


    /* =====================================================
       DESTROY OWNER SESSION
       ===================================================== */

    function destroyOwnerSession() {

        try {

            sessionStorage.removeItem(
                OWNER_SESSION_KEY
            );

        } catch (error) {

            console.warn(
                "Could not clear owner session.",
                error
            );

        }

    }


    /* =====================================================
       OPEN OWNER PANEL
       ===================================================== */

    function openOwnerPanel() {

        if (!ownerPanel) {
            return;
        }


        if (
            !isOwnerAuthenticated()
        ) {

            openOwnerLogin();

            return;

        }


        if (accountScreen) {

            accountScreen.classList.remove(
                "open"
            );

        }


        ownerPanel.classList.add(
            "open"
        );

    }


    /* =====================================================
       OWNER LOGOUT
       ===================================================== */

    if (ownerLogout) {

        ownerLogout.addEventListener(
            "click",
            () => {

                destroyOwnerSession();

                if (ownerPanel) {

                    ownerPanel.classList.remove(
                        "open"
                    );

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
            () => {

                closeOwnerLogin();

            }
        );

    }


    /* =====================================================
       CLOSE OWNER LOGIN WITH BACKDROP
       ===================================================== */

    if (ownerOverlay) {

        ownerOverlay.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    ownerOverlay
                ) {

                    closeOwnerLogin();

                }

            }
        );

    }


    /* =====================================================
       ACCOUNT SCREEN
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
       LOGIN / SIGNUP TABS
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
       NORMAL LOGIN
       ===================================================== */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();


                if (accountMessage) {

                    accountMessage.textContent =
                        "Normal account authentication will be connected to the MoonPlug backend.";

                }

            }
        );

    }


    /* =====================================================
       NORMAL SIGNUP
       ===================================================== */

    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();


                const password =
                    document.getElementById(
                        "signupPassword"
                    )?.value || "";


                const confirm =
                    document.getElementById(
                        "signupConfirm"
                    )?.value || "";


                if (
                    password !==
                    confirm
                ) {

                    if (accountMessage) {

                        accountMessage.textContent =
                            "Passwords do not match.";

                    }

                    return;

                }


                if (accountMessage) {

                    accountMessage.textContent =
                        "Account signup will be connected to the MoonPlug backend.";

                }

            }
        );

    }


    /* =====================================================
       SESSION EXPIRATION CHECK
       ===================================================== */

    setInterval(
        () => {

            if (
                ownerPanel &&
                ownerPanel.classList.contains(
                    "open"
                )
            ) {

                if (
                    !isOwnerAuthenticated()
                ) {

                    ownerPanel.classList.remove(
                        "open"
                    );

                    openOwnerLogin();

                }

            }

        },
        10 * 1000
    );


    /* =====================================================
       PAGE VISIBILITY SECURITY CHECK
       ===================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.visibilityState ===
                "visible"
            ) {

                if (
                    ownerPanel &&
                    ownerPanel.classList.contains(
                        "open"
                    )
                ) {

                    if (
                        !isOwnerAuthenticated()
                    ) {

                        ownerPanel.classList.remove(
                            "open"
                        );

                        openOwnerLogin();

                    }

                }

            }

        }
    );


    /* =====================================================
       ESCAPE KEY
       ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !== "Escape"
            ) {

                return;

            }


            if (
                ownerOverlay &&
                ownerOverlay.classList.contains(
                    "open"
                )
            ) {

                closeOwnerLogin();

                return;

            }


            if (
                settingsPanel &&
                settingsPanel.classList.contains(
                    "open"
                )
            ) {

                settingsPanel.classList.remove(
                    "open"
                );

                return;

            }

        }
    );


    /* =====================================================
       STARTUP
       ===================================================== */

    if (
        ownerPanel &&
        ownerPanel.classList.contains(
            "open"
        )
    ) {

        if (
            !isOwnerAuthenticated()
        ) {

            ownerPanel.classList.remove(
                "open"
            );

        }

    }

});

