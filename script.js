/* =====================================================
   MOONPLUG AI
   MAIN JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* =================================================
       ELEMENTS
    ================================================= */

    const sidebar = document.querySelector(".sidebar");
    const sidebarLogo = document.querySelector(".sidebar-logo");

    const settingsButton =
        document.getElementById("settingsButton");

    const settingsPanel =
        document.getElementById("settingsPanel");

    const closeSettings =
        document.getElementById("closeSettings");

    const themeButton =
        document.getElementById("themeButton");

    const messageInput =
        document.getElementById("messageInput");

    const sendButton =
        document.getElementById("sendButton");

    const messages =
        document.getElementById("messages");

    const typing =
        document.getElementById("typing");


    /* =================================================
       SIDEBAR
    ================================================= */

   /* =================================================
   SIDEBAR CLICK TO EXPAND
================================================= */

if (sidebar) {

    sidebar.addEventListener("click", function (event) {

        /* Don't expand when clicking a button */

        if (event.target.closest(".sidebar-button")) {
            return;
        }

        /* Don't toggle when clicking the logo itself */

        if (event.target.closest(".sidebar-logo")) {
            sidebar.classList.toggle("expanded");
            return;
        }

        /* Empty sidebar space */

        sidebar.classList.toggle("expanded");

    });

}

    /* =================================================
       SETTINGS
    ================================================= */

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


    /* =================================================
       THEME
    ================================================= */

    if (themeButton) {

        themeButton.addEventListener("click", function () {

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


    /* =================================================
       TEXT SIZE
    ================================================= */

    const sizeButtons =
        document.querySelectorAll(".size-button");

    sizeButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            sizeButtons.forEach(function (item) {

                item.classList.remove("active");

            });

            button.classList.add("active");

            document.body.classList.remove(
                "text-small",
                "text-medium",
                "text-large"
            );

            const size =
                button.dataset.size;

            if (size === "small") {

                document.body.classList.add("text-small");

            }

            if (size === "medium") {

                document.body.classList.add("text-medium");

            }

            if (size === "large") {

                document.body.classList.add("text-large");

            }

        });

    });


    /* =================================================
       SIDEBAR SIZE SETTINGS
    ================================================= */

    const sidebarSizeButtons =
        document.querySelectorAll(
            ".sidebar-size-button"
        );

    sidebarSizeButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            sidebarSizeButtons.forEach(function (item) {

                item.classList.remove("active");

            });

            button.classList.add("active");

            const size =
                button.dataset.sidebarSize;

            sidebar.classList.remove(
                "sidebar-normal",
                "sidebar-compact",
                "sidebar-wide"
            );

            if (size === "normal") {

                sidebar.classList.add(
                    "sidebar-normal"
                );

            }

            if (size === "compact") {

                sidebar.classList.add(
                    "sidebar-compact"
                );

            }

            if (size === "wide") {

                sidebar.classList.add(
                    "sidebar-wide"
                );

            }

        });

    });


    /* =================================================
       REMOVE EMPTY CHAT
    ================================================= */

    function removeEmptyChat() {

        const emptyChat =
            document.querySelector(".empty-chat");

        if (emptyChat) {

            emptyChat.remove();

        }

    }


    /* =================================================
       CREATE MESSAGE BUBBLE
    ================================================= */

    function createMessage(text, type) {

        if (!messages) {
            return;
        }

        const bubble =
            document.createElement("div");

        bubble.classList.add(
            "message-bubble"
        );

        if (type === "user") {

            bubble.classList.add("user");

        } else {

            bubble.classList.add("ai");

        }

        bubble.textContent = text;

        messages.appendChild(bubble);

        messages.scrollTop =
            messages.scrollHeight;

    }


    /* =================================================
       SEND MESSAGE
    ================================================= */

    function sendMessage() {

        if (!messageInput || !messages) {
            return;
        }

        const text =
            messageInput.value.trim();

        if (text.length === 0) {
            return;
        }


        /* Remove "What can I help with?" */

        removeEmptyChat();


        /* Add USER bubble */

        createMessage(
            text,
            "user"
        );


        /* Clear input */

        messageInput.value = "";


        /* Show typing */

        if (typing) {

            typing.style.display =
                "block";

        }


        /* Temporary MoonPlug response */

        setTimeout(function () {

            if (typing) {

                typing.style.display =
                    "none";

            }

            createMessage(
                "I'm ready to help.",
                "ai"
            );

        }, 900);

    }


    /* =================================================
       SEND BUTTON
    ================================================= */

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendMessage
        );

    }


    /* =================================================
       ENTER TO SEND
    ================================================= */

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


    /* =================================================
       PREVENT FORM-LIKE BEHAVIOR
    ================================================= */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                document.activeElement === messageInput
            ) {

                event.preventDefault();

            }

        }
    );


});
/* =================================================
   OWNER PANEL
================================================= */

const ownerButton =
    document.getElementById("ownerButton");

const ownerLogin =
    document.getElementById("ownerLogin");

const ownerPanel =
    document.getElementById("ownerPanel");

const ownerCode =
    document.getElementById("ownerCode");

const ownerLoginButton =
    document.getElementById("ownerLoginButton");

const ownerCancel =
    document.getElementById("ownerCancel");

const ownerLogout =
    document.getElementById("ownerLogout");

const ownerError =
    document.getElementById("ownerError");


/* TEMPORARY TEST CODE */

const OWNER_CODE = "1234";


/* OPEN OWNER LOGIN */

if (ownerButton) {

    ownerButton.addEventListener("click", function () {

        if (ownerLogin) {

            ownerLogin.classList.add("open");

        }

        if (ownerCode) {

            ownerCode.value = "";

            ownerCode.focus();

        }

    });

}


/* LOGIN */

function loginOwner() {

    if (!ownerCode) {
        return;
    }

    if (ownerCode.value === OWNER_CODE) {

        if (ownerLogin) {

            ownerLogin.classList.remove("open");

        }

        if (ownerPanel) {

            ownerPanel.classList.add("open");

        }

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


/* LOGIN BUTTON */

if (ownerLoginButton) {

    ownerLoginButton.addEventListener(
        "click",
        loginOwner
    );

}


/* ENTER KEY */

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


/* CANCEL */

if (ownerCancel) {

    ownerCancel.addEventListener(
        "click",
        function () {

            ownerLogin.classList.remove("open");

        }
    );

}


/* LOGOUT */

if (ownerLogout) {

    ownerLogout.addEventListener(
        "click",
        function () {

            ownerPanel.classList.remove("open");

        }
    );

}
