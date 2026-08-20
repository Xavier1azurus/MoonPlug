
/* ============================================================
   MOONPLUG AI
   SECURE FRONT-END STRUCTURE
   ============================================================

   IMPORTANT SECURITY NOTE
   ------------------------------------------------------------
   MoonPlug is currently hosted on GitHub Pages.

   GitHub Pages is a static hosting service, which means that
   JavaScript running in the browser cannot contain a truly
   secret password.

   This version improves the front-end security by:

   • Never storing the owner code in plain text
   • SHA-256 hashing the entered owner code
   • Failed-login protection
   • Temporary lockout after too many attempts
   • sessionStorage owner sessions
   • No automatic owner access
   • Separate owner authentication flow
   • Safer DOM handling
   • Existing MoonPlug chat functionality
   • Existing account screen functionality

   For TRUE authentication later:
       MoonPlug Website
              ↓
       Secure Backend
              ↓
       Password verification
              ↓
       Owner session/token
              ↓
       Owner Panel

   ============================================================ */


/* ============================================================
   DOM READY
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {


    /* ========================================================
       BASIC ELEMENTS
    ======================================================== */

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


    /* ========================================================
       SETTINGS
    ======================================================== */

    const settingsButton =
        document.getElementById("settingsButton");

    const settingsPanel =
        document.getElementById("settingsPanel");

    const closeSettings =
        document.getElementById("closeSettings");

    const themeButton =
        document.getElementById("themeButton");


    /* ========================================================
       ACCOUNT
    ======================================================== */

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


    /* ========================================================
       OWNER PANEL
    ======================================================== */

    const ownerPanel =
        document.getElementById("ownerPanel");

    const ownerLogout =
        document.getElementById("ownerLogout");


    /* ========================================================
       OWNER LOGIN ELEMENTS
       --------------------------------------------------------
       These support the owner overlay from your CSS.

       Expected HTML IDs:

           ownerLogin
           ownerCode
           ownerLoginButton
           ownerCancel
           ownerError

       If some don't exist, the code safely continues.
    ======================================================== */

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


    /* ========================================================
       SECURITY CONFIGURATION
    ======================================================== */

    /*
     * IMPORTANT:
     *
     * This is NOT your owner password.
     *
     * It is a SHA-256 hash.
     *
     * You should generate the hash of your desired owner
     * password and put ONLY the hash here.
     *
     * Example:
     *
     * Password:
     *     MySecret123
     *
     * SHA-256:
     *     <generated hash>
     *
     * The actual password should never be written into
     * this JavaScript file.
     */

    const OWNER_PASSWORD_HASH =
        "REPLACE_WITH_YOUR_SHA256_HASH";


    /*
     * Maximum failed attempts before temporary lockout.
     */

    const MAX_OWNER_ATTEMPTS = 5;


    /*
     * Lockout duration.
     *
     * 60,000 ms = 1 minute.
     */

    const LOCKOUT_TIME =
        60 * 1000;


    /*
     * Session key.
     */

    const OWNER_SESSION_KEY =
        "moonplug_owner_session";


    /*
     * Failed attempt storage.
     */

    const OWNER_ATTEMPTS_KEY =
        "moonplug_owner_attempts";


    /*
     * Lockout storage.
     */

    const OWNER_LOCKOUT_KEY =
        "moonplug_owner_lockout";


    /* ========================================================
       SIDEBAR
    ======================================================== */

    if (sidebar) {

        sidebar.addEventListener(
            "click",
            (event) => {

                /*
                 * Clicking an actual sidebar button should
                 * not expand or collapse the sidebar.
                 */

                if (
                    event.target.closest(
                        ".sidebar-button"
                    )
                ) {

                    return;

                }


                /*
                 * Clicking the logo or empty sidebar space
                 * toggles the sidebar.
                 */

                sidebar.classList.toggle(
                    "expanded"
                );

            }
        );

    }


    /* ========================================================
       SETTINGS
    ======================================================== */

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


    /* ========================================================
       CLOSE SETTINGS
    ======================================================== */

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


    /* ========================================================
       CLICK OUTSIDE SETTINGS
    ======================================================== */

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


    /* ========================================================
       THEME
    ======================================================== */

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
                        "Dark";

                } else {

                    themeButton.textContent =
                        "Light";

                }

            }
        );

    }


    /* ========================================================
       CREATE MESSAGE
    ======================================================== */

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


        /*
         * textContent is intentionally used instead
         * of innerHTML.
         *
         * This prevents user messages from injecting
         * arbitrary HTML into the page.
         */

        bubble.textContent =
            String(text);


        messages.appendChild(
            bubble
        );


        messages.scrollTop =
            messages.scrollHeight;

    }


    /* ========================================================
       SEND MESSAGE
    ======================================================== */

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


        /*
         * Remove the empty-chat screen after the first
         * message.
         */

        const emptyChat =
            document.querySelector(
                ".empty-chat"
            );


        if (emptyChat) {

            emptyChat.remove();

        }


        /*
         * USER MESSAGE
         */

        addMessage(
            text,
            "user"
        );


        messageInput.value =
            "";


        /*
         * TYPING INDICATOR
         */

        if (typing) {

            typing.style.display =
                "block";

        }


        /*
         * TEMPORARY LOCAL AI RESPONSE
         *
         * Later this can connect to the MoonPlug
         * Python/backend AI system.
         */

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


    /* ========================================================
       SEND BUTTON
    ======================================================== */

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                sendMessage();

            }
        );

    }


    /* ========================================================
       ENTER TO SEND
    ======================================================== */

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


    /* ========================================================
       ACCOUNT SCREEN
    ======================================================== */

    if (
        ownerButton &&
        accountScreen
    ) {

        ownerButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();


                /*
                 * IMPORTANT:
                 *
                 * Clicking Owner does NOT open the
                 * owner panel directly.
                 *
                 * It opens the authentication screen.
                 */

                openOwnerLogin();

            }
        );

    }


    /* ========================================================
       LOGIN TAB
    ======================================================== */

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


        /* ====================================================
           SIGNUP TAB
        ==================================================== */

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


    /* ========================================================
       CLOSE ACCOUNT
    ======================================================== */

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


    /* ========================================================
       OWNER LOGIN
    ======================================================== */

    function openOwnerLogin() {

        /*
         * If the owner is already authenticated,
         * open the panel directly.
         */

        if (isOwnerSessionValid()) {

            openOwnerPanel();

            return;

        }


        /*
         * Otherwise show the login overlay.
         */

        if (ownerLogin) {

            ownerLogin.classList.add(
                "open"
            );

        } else if (accountScreen) {

            /*
             * Fallback for the current account UI.
             */

            accountScreen.classList.add(
                "open"
            );

        }


        if (ownerCodeInput) {

            ownerCodeInput.value =
                "";

            setTimeout(
                () => {

                    ownerCodeInput.focus();

                },
                100
            );

        }


        clearOwnerError();

    }


    /* ========================================================
       CLOSE OWNER LOGIN
    ======================================================== */

    function closeOwnerLogin() {

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


        if (ownerCodeInput) {

            ownerCodeInput.value =
                "";

        }


        clearOwnerError();

    }


    /* ========================================================
       OWNER ERROR
    ======================================================== */

    function showOwnerError(
        message
    ) {

        if (ownerError) {

            ownerError.textContent =
                message;

        }

    }


    function clearOwnerError() {

        if (ownerError) {

            ownerError.textContent =
                "";

        }

    }


    /* ========================================================
       SHA-256 HASH
    ======================================================== */

    async function sha256(
        text
    ) {

        /*
         * Web Crypto API is built into modern browsers.
         */

        const encoder =
            new TextEncoder();


        const data =
            encoder.encode(
                text
            );


        const hashBuffer =
            await crypto.subtle.digest(
                "SHA-256",
                data
            );


        const hashArray =
            Array.from(
                new Uint8Array(
                    hashBuffer
                )
            );


        return hashArray
            .map(
                byte =>
                    byte
                        .toString(16)
                        .padStart(
                            2,
                            "0"
                        )
            )
            .join("");

    }


    /* ========================================================
       OWNER ATTEMPT STORAGE
    ======================================================== */

    function getOwnerAttempts() {

        const value =
            sessionStorage.getItem(
                OWNER_ATTEMPTS_KEY
            );


        const attempts =
            Number(
                value
            );


        if (
            Number.isNaN(
                attempts
            )
        ) {

            return 0;

        }


        return attempts;

    }


    function setOwnerAttempts(
        attempts
    ) {

        sessionStorage.setItem(
            OWNER_ATTEMPTS_KEY,
            String(
                attempts
            )
        );

    }


    /* ========================================================
       LOCKOUT
    ======================================================== */

    function getLockoutTime() {

        const value =
            sessionStorage.getItem(
                OWNER_LOCKOUT_KEY
            );


        const timestamp =
            Number(
                value
            );


        if (
            Number.isNaN(
                timestamp
            )
        ) {

            return 0;

        }


        return timestamp;

    }


    function isOwnerLocked() {

        const lockout =
            getLockoutTime();


        if (!lockout) {

            return false;

        }


        if (
            Date.now() >=
            lockout
        ) {

            sessionStorage.removeItem(
                OWNER_LOCKOUT_KEY
            );

            setOwnerAttempts(
                0
            );

            return false;

        }


        return true;

    }


    function getRemainingLockoutSeconds() {

        const lockout =
            getLockoutTime();


        if (!lockout) {

            return 0;

        }


        const remaining =
            lockout -
            Date.now();


        return Math.ceil(
            remaining / 1000
        );

    }


    function lockOwnerLogin() {

        sessionStorage.setItem(
            OWNER_LOCKOUT_KEY,
            String(
                Date.now() +
                LOCKOUT_TIME
            )
        );

    }


    /* ========================================================
       OWNER SESSION
    ======================================================== */

    function createOwnerSession() {

        /*
         * A random session identifier is generated.
         *
         * This is only a front-end session indicator.
         *
         * A real backend should issue a server-side
         * authenticated session later.
         */

        const randomValues =
            new Uint8Array(
                32
            );


        crypto.getRandomValues(
            randomValues
        );


        const token =
            Array.from(
                randomValues
            )
                .map(
                    value =>
                        value
                            .toString(16)
                            .padStart(
                                2,
                                "0"
                            )
                )
                .join("");


        sessionStorage.setItem(
            OWNER_SESSION_KEY,
            token
        );

    }


    function isOwnerSessionValid() {

        const session =
            sessionStorage.getItem(
                OWNER_SESSION_KEY
            );


        return (
            typeof session ===
            "string" &&
            session.length >= 32
        );

    }


    function destroyOwnerSession() {

        sessionStorage.removeItem(
            OWNER_SESSION_KEY
        );

        sessionStorage.removeItem(
            OWNER_ATTEMPTS_KEY
        );

        sessionStorage.removeItem(
            OWNER_LOCKOUT_KEY
        );

    }


    /* ========================================================
       VERIFY OWNER CODE
    ======================================================== */

    async function verifyOwnerCode(
        enteredCode
    ) {

        /*
         * Check lockout BEFORE processing the password.
         */

        if (
            isOwnerLocked()
        ) {

            const seconds =
                getRemainingLockoutSeconds();


            showOwnerError(
                "Too many attempts. Try again in " +
                seconds +
                " seconds."
            );


            return false;

        }


        if (
            !enteredCode ||
            !enteredCode.trim()
        ) {

            showOwnerError(
                "Please enter the owner code."
            );


            return false;

        }


        /*
         * Hash the entered code.
         */

        const enteredHash =
            await sha256(
                enteredCode.trim()
            );


        /*
         * Compare hashes.
         */

        const correct =
            enteredHash ===
            OWNER_PASSWORD_HASH;


        if (correct) {

            /*
             * Successful authentication.
             */

            setOwnerAttempts(
                0
            );


            sessionStorage.removeItem(
                OWNER_LOCKOUT_KEY
            );


            createOwnerSession();


            return true;

        }


        /*
         * Incorrect password.
         */

        const attempts =
            getOwnerAttempts() +
            1;


        setOwnerAttempts(
            attempts
        );


        const remaining =
            MAX_OWNER_ATTEMPTS -
            attempts;


        if (
            attempts >=
            MAX_OWNER_ATTEMPTS
        ) {

            lockOwnerLogin();


            showOwnerError(
                "Too many incorrect attempts. " +
                "Owner login is temporarily locked."
            );

        } else {

            showOwnerError(
                "Incorrect owner code. " +
                remaining +
                " attempt(s) remaining."
            );

        }


        return false;

    }


    /* ========================================================
       OWNER LOGIN SUBMIT
    ======================================================== */

    async function handleOwnerLogin() {

        if (
            !ownerCodeInput
        ) {

            return;

        }


        clearOwnerError();


        if (
            isOwnerLocked()
        ) {

            const seconds =
                getRemainingLockoutSeconds();


            showOwnerError(
                "Login locked. Try again in " +
                seconds +
                " seconds."
            );


            return;

        }


        const code =
            ownerCodeInput.value;


        /*
         * Disable login button while hashing.
         */

        if (ownerLoginButton) {

            ownerLoginButton.disabled =
                true;

            ownerLoginButton.textContent =
                "Checking...";

        }


        try {

            const authenticated =
                await verifyOwnerCode(
                    code
                );


            if (authenticated) {

                closeOwnerLogin();

                openOwnerPanel();

            }

        } catch (error) {

            console.error(
                "Owner authentication error:",
                error
            );


            showOwnerError(
                "Authentication failed. Please try again."
            );

        } finally {

            if (ownerLoginButton) {

                ownerLoginButton.disabled =
                    false;

                ownerLoginButton.textContent =
                    "Enter Owner Panel";

            }

        }

    }


    /* ========================================================
       OWNER LOGIN BUTTON
    ======================================================== */

    if (ownerLoginButton) {

        ownerLoginButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                handleOwnerLogin();

            }
        );

    }


    /* ========================================================
       ENTER KEY FOR OWNER LOGIN
    ======================================================== */

    if (ownerCodeInput) {

        ownerCodeInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    handleOwnerLogin();

                }

            }
        );

    }


    /* ========================================================
       CANCEL OWNER LOGIN
    ======================================================== */

    if (ownerCancel) {

        ownerCancel.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                closeOwnerLogin();

            }
        );

    }


    /* ========================================================
       CLOSE OWNER LOGIN WITH ESCAPE
    ======================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            if (
                ownerLogin &&
                ownerLogin.classList.contains(
                    "open"
                )
            ) {

                closeOwnerLogin();

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

            }

        }
    );


    /* ========================================================
       OPEN OWNER PANEL
    ======================================================== */

    function openOwnerPanel() {

        /*
         * NEVER open the owner panel unless a valid
         * front-end session exists.
         */

        if (
            !isOwnerSessionValid()
        ) {

            openOwnerLogin();

            return;

        }


        if (ownerPanel) {

            ownerPanel.classList.add(
                "open"
            );

        }

    }


    /* ========================================================
       OWNER LOGOUT
    ======================================================== */

    if (ownerLogout) {

        ownerLogout.addEventListener(
            "click",
            () => {

                /*
                 * Destroy the owner session.
                 */

                destroyOwnerSession();


                /*
                 * Close the panel.
                 */

                if (ownerPanel) {

                    ownerPanel.classList.remove(
                        "open"
                    );

                }


                /*
                 * Make sure the login screen is
                 * ready for another login.
                 */

                if (ownerCodeInput) {

                    ownerCodeInput.value =
                        "";

                }


                clearOwnerError();

            }
        );

    }


    /* ========================================================
       PROTECT OWNER PANEL ON PAGE LOAD
    ======================================================== */

    if (
        ownerPanel &&
        ownerPanel.classList.contains(
            "open"
        )
    ) {

        /*
         * If the HTML accidentally contains
         * the open class, remove it unless a
         * valid session exists.
         */

        if (
            !isOwnerSessionValid()
        ) {

            ownerPanel.classList.remove(
                "open"
            );

        }

    }


    /* ========================================================
       NORMAL LOGIN
    ======================================================== */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();


                /*
                 * Normal user authentication is not
                 * connected to owner authentication.
                 */

                if (accountMessage) {

                    accountMessage.textContent =
                        "Normal account authentication will be connected later.";

                }

            }
        );

    }


    /* ========================================================
       NORMAL SIGNUP
    ======================================================== */

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
                        "Account creation will be connected to authentication later.";

                }

            }
        );

    }


    /* ========================================================
       OWNER PANEL SAFETY CHECK
    ======================================================== */

    /*
     * This watches for code attempting to add the
     * "open" class to the owner panel without an
     * authenticated session.
     *
     * This is not a replacement for backend security,
     * but it prevents accidental front-end exposure.
     */

    if (ownerPanel) {

        const observer =
            new MutationObserver(
                () => {

                    if (
                        ownerPanel.classList.contains(
                            "open"
                        ) &&
                        !isOwnerSessionValid()
                    ) {

                        ownerPanel.classList.remove(
                            "open"
                        );

                        openOwnerLogin();

                    }

                }
            );


        observer.observe(
            ownerPanel,
            {
                attributes: true,
                attributeFilter: [
                    "class"
                ]
            }
        );

    }


    /* ========================================================
       INITIAL STATE
    ======================================================== */

    /*
     * Owner panel should never automatically appear
     * without an authenticated session.
     */

    if (
        ownerPanel &&
        !isOwnerSessionValid()
    ) {

        ownerPanel.classList.remove(
            "open"
        );

    }


    /*
     * Make sure owner login starts closed.
     */

    if (ownerLogin) {

        ownerLogin.classList.remove(
            "open"
        );

    }


    /* ========================================================
       DEBUG INFORMATION
    ======================================================== */

    console.log(
        "%cMoonPlug AI",
        "font-size:20px;font-weight:bold;"
    );


    console.log(
        "Secure front-end authentication loaded."
    );


    console.log(
        "Owner panel protected:",
        Boolean(ownerPanel)
    );


    console.log(
        "Owner session:",
        isOwnerSessionValid()
            ? "active"
            : "inactive"
    );


});


