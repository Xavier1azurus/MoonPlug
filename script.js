document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       ELEMENTS
    ========================================= */

    const sidebar = document.querySelector(".sidebar");
    const messages = document.getElementById("messages");
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const typing = document.getElementById("typing");

    const settingsButton = document.getElementById("settingsButton");
    const settingsPanel = document.getElementById("settingsPanel");
    const closeSettings = document.getElementById("closeSettings");

    const themeButton = document.getElementById("themeButton");

    const ownerButton = document.getElementById("ownerButton");
    const ownerLogin = document.getElementById("ownerLogin");
    const ownerPanel = document.getElementById("ownerPanel");
    const ownerCode = document.getElementById("ownerCode");
    const ownerLoginButton = document.getElementById("ownerLoginButton");
    const ownerCancel = document.getElementById("ownerCancel");
    const ownerLogout = document.getElementById("ownerLogout");
    const ownerError = document.getElementById("ownerError");


    /* =========================================
       SIDEBAR
    ========================================= */

    if (sidebar) {

        sidebar.addEventListener("click", function (event) {

            /*
             * If a real button was clicked,
             * don't expand/collapse the sidebar.
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


    /* =========================================
       SETTINGS
    ========================================= */

    if (settingsButton && settingsPanel) {

        settingsButton.addEventListener("click", function (event) {

            event.stopPropagation();

            settingsPanel.classList.add("open");

        });

    }


    if (closeSettings && settingsPanel) {

        closeSettings.addEventListener("click", function () {

            settingsPanel.classList.remove("open");

        });

    }


    if (settingsPanel) {

        settingsPanel.addEventListener("click", function (event) {

            if (event.target === settingsPanel) {

                settingsPanel.classList.remove("open");

            }

        });

    }


    /* =========================================
       THEME
    ========================================= */

    if (themeButton) {

        themeButton.addEventListener("click", function () {

            document.body.classList.toggle("light-theme");

            if (document.body.classList.contains("light-theme")) {

                themeButton.textContent = "Light";

            } else {

                themeButton.textContent = "Dark";

            }

        });

    }


    /* =========================================
       CREATE MESSAGE
    ========================================= */

    function createMessage(text, type) {

        if (!messages) {
            return;
        }

        const bubble = document.createElement("div");

        bubble.classList.add("message-bubble");
        bubble.classList.add(type);

        bubble.textContent = text;

        messages.appendChild(bubble);

        messages.scrollTop = messages.scrollHeight;

    }


    /* =========================================
       SEND MESSAGE
    ========================================= */

    function sendMessage() {

        if (!messageInput || !messages) {
            return;
        }

        const text = messageInput.value.trim();

        if (text === "") {
            return;
        }


        /* Remove welcome message */

        const emptyChat =
            document.querySelector(".empty-chat");

        if (emptyChat) {
            emptyChat.remove();
        }


        /* User message */

        createMessage(text, "user");


        /* Clear input */

        messageInput.value = "";


        /* Show typing */

        if (typing) {
            typing.style.display = "block";
        }


        /* Temporary AI response */

        setTimeout(function () {

            if (typing) {
                typing.style.display = "none";
            }

            createMessage(
                "I'm ready to help.",
                "ai"
            );

        }, 800);

    }


    /* =========================================
       SEND BUTTON
    ========================================= */

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                sendMessage();

            }
        );

    }


    /* =========================================
       ENTER TO SEND
    ========================================= */

    if (messageInput) {

        messageInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

    }


    /* =========================================
       OWNER PANEL
    ========================================= */

    const OWNER_CODE = "BumsUp1AI1591";


    /* OPEN OWNER LOGIN */

    if (ownerButton && ownerLogin) {

        ownerButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                ownerLogin.classList.add("open");

                if (ownerCode) {

                    ownerCode.value = "";

                    setTimeout(function () {
                        ownerCode.focus();
                    }, 100);

                }

            }
        );

    }


    /* OWNER LOGIN */

    function loginOwner() {

        if (!ownerCode || !ownerLogin || !ownerPanel) {
            return;
        }

        if (ownerCode.value === OWNER_CODE) {

            ownerLogin.classList.remove("open");

            ownerPanel.classList.add("open");

            if (ownerError) {
                ownerError.textContent = "";
            }

        } else {

            if (ownerError) {

                ownerError.textContent =
                    "Incorrect owner code.";

            }

            ownerCode.value = "";
            ownerCode.focus();

        }

    }


    if (ownerLoginButton) {

        ownerLoginButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                loginOwner();

            }
        );

    }


    /* ENTER OWNER CODE */

    if (ownerCode) {

        ownerCode.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    loginOwner();

                }

            }
        );

    }


    /* CANCEL OWNER LOGIN */

    if (ownerCancel && ownerLogin) {

        ownerCancel.addEventListener(
            "click",
            function () {

                ownerLogin.classList.remove("open");

            }
        );

    }


    /* LOGOUT OWNER */

    if (ownerLogout && ownerPanel) {

        ownerLogout.addEventListener(
            "click",
            function () {

                ownerPanel.classList.remove("open");

            }
        );

    }


});
