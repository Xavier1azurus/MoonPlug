document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       ELEMENTS
    ========================================= */

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


    /* =========================================
       SIDEBAR
    ========================================= */

    if (sidebar && sidebarLogo) {

        sidebarLogo.addEventListener("click", function () {

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

            if (
                document.body.classList.contains("light-theme")
            ) {

                themeButton.textContent = "Light";

            } else {

                themeButton.textContent = "Dark";

            }

        });

    }


    /* =========================================
       TEXT SIZE
    ========================================= */

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


    /* =========================================
       SIDEBAR SIZE BUTTONS
    ========================================= */

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

            sidebar.classList.remove(
                "sidebar-normal",
                "sidebar-compact",
                "sidebar-wide"
            );

            const size =
                button.dataset.sidebarSize;

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


    /* =========================================
       SEND MESSAGE
    ========================================= */

    function sendMessage() {

        if (!messageInput || !messages) {
            return;
        }

        const text =
            messageInput.value.trim();

        if (text === "") {
            return;
        }


        const emptyChat =
            document.querySelector(".empty-chat");

        if (emptyChat) {

            emptyChat.remove();

        }


        const userMessage =
            document.createElement("div");

        userMessage.className =
            "message-bubble user";

        userMessage.textContent =
            text;

        messages.appendChild(
            userMessage
        );


        messageInput.value = "";

        messages.scrollTop =
            messages.scrollHeight;


        if (typing) {

            typing.style.display =
                "block";

        }


        setTimeout(function () {

            if (typing) {

                typing.style.display =
                    "none";

            }

        }, 1000);

    }


    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendMessage
        );

    }


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

});
