document.addEventListener("DOMContentLoaded", () => {

    /* =================================================
       ELEMENTS
    ================================================= */

    const sidebar =
        document.querySelector(".sidebar");

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


    /* OWNER LOGIN */

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


    /* OWNER PANEL */

    const ownerPanel =
        document.getElementById("ownerPanel");

    const ownerLogout =
        document.getElementById("ownerLogout");


    /* TRAINER */

    const trainerStart =
        document.getElementById("trainerStart");

    const trainerPause =
        document.getElementById("trainerPause");

    const trainerStop =
        document.getElementById("trainerStop");

    const trainerStatusBadge =
        document.getElementById("trainerStatusBadge");

    const trainerQuestions =
        document.getElementById("trainerQuestions");

    const trainerKnowledge =
        document.getElementById("trainerKnowledge");

    const trainerSources =
        document.getElementById("trainerSources");

    const trainerProgressBar =
        document.getElementById("trainerProgressBar");

    const trainerProgressText =
        document.getElementById("trainerProgressText");

    const trainerCurrent =
        document.getElementById("trainerCurrent");

    const trainerLog =
        document.getElementById("trainerLog");

    const clearTrainerLog =
        document.getElementById("clearTrainerLog");

    const pythonStatus =
        document.getElementById("pythonStatus");

    const pythonStatusDot =
        document.getElementById("pythonStatusDot");


    /* =================================================
       SIDEBAR
    ================================================= */

    function toggleSidebar() {

        if (!sidebar) {
            return;
        }

        sidebar.classList.toggle("expanded");

    }


    if (sidebar) {

        sidebar.addEventListener("click", (event) => {

            const clickedButton =
                event.target.closest(".sidebar-button");

            const clickedLogo =
                event.target.closest(".sidebar-logo");


            if (clickedButton) {
                return;
            }

            if (clickedLogo) {

                toggleSidebar();

                return;

            }

            toggleSidebar();

        });

    }


    /* =================================================
       SETTINGS
    ================================================= */

    if (settingsButton) {

        settingsButton.addEventListener("click", (event) => {

            event.preventDefault();
            event.stopPropagation();

            if (settingsPanel) {
                settingsPanel.classList.add("open");
            }

        });

    }


    if (closeSettings) {

        closeSettings.addEventListener("click", () => {

            if (settingsPanel) {
                settingsPanel.classList.remove("open");
            }

        });

    }


    if (settingsPanel) {

        settingsPanel.addEventListener("click", (event) => {

            if (event.target === settingsPanel) {

                settingsPanel.classList.remove("open");

            }

        });

    }


    /* =================================================
       THEME
    ================================================= */

    if (themeButton) {

        themeButton.addEventListener("click", () => {

            document.body.classList.toggle(
                "light-theme"
            );

            const light =
                document.body.classList.contains(
                    "light-theme"
                );

            themeButton.textContent =
                light ? "Light" : "Dark";

        });

    }


    /* =================================================
       TEXT SIZE
    ================================================= */

    const sizeButtons =
        document.querySelectorAll(".size-button");

    sizeButtons.forEach((button) => {

        button.addEventListener("click", () => {

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

            sizeButtons.forEach((item) => {

                item.classList.remove("active");

            });

            button.classList.add("active");

        });

    });


    /* =================================================
       MESSAGE BUBBLES
    ================================================= */

    function addMessage(text, type) {

        if (!messages) {
            return;
        }

        const bubble =
            document.createElement("div");

        bubble.className =
            "message-bubble " + type;

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

        if (!text) {
            return;
        }


        const emptyChat =
            document.querySelector(".empty-chat");

        if (emptyChat) {
            emptyChat.remove();
        }


        addMessage(
            text,
            "user"
        );

        messageInput.value = "";


        if (typing) {
            typing.style.display = "block";
        }


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

                if (event.key === "Enter") {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

    }


    /* =================================================
       ACCOUNT
    ================================================= */

    if (ownerButton) {

        ownerButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();

                if (accountScreen) {
                    accountScreen.classList.add("open");
                }

            }
        );

    }


    /* =================================================
       LOGIN TAB
    ================================================= */

    if (loginTab) {

        loginTab.addEventListener("click", () => {

            loginTab.classList.add("active");

            if (signupTab) {
                signupTab.classList.remove("active");
            }

            if (loginForm) {
                loginForm.style.display = "flex";
            }

            if (signupForm) {
                signupForm.style.display = "none";
            }

            if (accountMessage) {
                accountMessage.textContent = "";
            }

        });

    }


    /* =================================================
       SIGNUP TAB
    ================================================= */

    if (signupTab) {

        signupTab.addEventListener("click", () => {

            signupTab.classList.add("active");

            if (loginTab) {
                loginTab.classList.remove("active");
            }

            if (signupForm) {
                signupForm.style.display = "flex";
            }

            if (loginForm) {
                loginForm.style.display = "none";
            }

            if (accountMessage) {
                accountMessage.textContent = "";
            }

        });

    }


    /* =================================================
       CLOSE ACCOUNT
    ================================================= */

    if (closeAccount) {

        closeAccount.addEventListener("click", () => {

            if (accountScreen) {
                accountScreen.classList.remove("open");
            }

        });

    }


    /* =================================================
       OWNER CODE
    ================================================= */

    /*
     * IMPORTANT:
     * This is only client-side testing.
     * A real secure owner system must verify
     * the code on the server/Python side.
     */

    const OWNER_CODE =
        "BumsUp1AI1591";


    function isOwnerCode(value) {

        if (!value) {
            return false;
        }

        return value.trim() === OWNER_CODE;

    }


    /* =================================================
       OPEN OWNER PANEL
    ================================================= */

    function openOwnerPanel() {

        if (accountScreen) {
            accountScreen.classList.remove("open");
        }

        if (ownerLogin) {
            ownerLogin.classList.remove("open");
        }

        if (ownerPanel) {
            ownerPanel.classList.add("open");
        }

    }


    /* =================================================
       OPEN OWNER LOGIN
    ================================================= */

    function openOwnerLogin() {

        if (ownerLogin) {

            ownerLogin.classList.add("open");

        }

        if (ownerCodeInput) {

            ownerCodeInput.value = "";

            setTimeout(() => {
                ownerCodeInput.focus();
            }, 100);

        }

        if (ownerError) {
            ownerError.textContent = "";
        }

    }


    /* =================================================
       OWNER CODE FROM ACCOUNT
    ================================================= */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                const email =
                    document.getElementById(
                        "loginEmail"
                    )?.value || "";

                const password =
                    document.getElementById(
                        "loginPassword"
                    )?.value || "";


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

            }
        );

    }


    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            (event) => {

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

            }
        );

    }


    /* =================================================
       OWNER LOGIN BUTTON
    ================================================= */

    if (ownerLoginButton) {

        ownerLoginButton.addEventListener(
            "click",
            () => {

                const code =
                    ownerCodeInput?.value || "";

                if (isOwnerCode(code)) {

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


    /* =================================================
       OWNER LOGIN ENTER KEY
    ================================================= */

    if (ownerCodeInput) {

        ownerCodeInput.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    if (ownerLoginButton) {
                        ownerLoginButton.click();
                    }

                }

            }
        );

    }


    if (ownerCancel) {

        ownerCancel.addEventListener(
            "click",
            () => {

                if (ownerLogin) {
                    ownerLogin.classList.remove("open");
                }

            }
        );

    }


    /* =================================================
       OWNER LOGOUT
    ================================================= */

    if (ownerLogout) {

        ownerLogout.addEventListener(
            "click",
            () => {

                if (ownerPanel) {
                    ownerPanel.classList.remove("open");
                }

            }
        );

    }


    /* =================================================
       TRAINER STATE
    ================================================= */

    let trainerState = "stopped";

    let trainerQuestionsValue = 0;

    let trainerKnowledgeValue = 0;

    let trainerSourcesValue = 0;

    let trainerProgressValue = 0;

    let trainerTimer = null;


    /* =================================================
       TRAINER LOG
    ================================================= */

    function addTrainerLog(text) {

        if (!trainerLog) {
            return;
        }

        const empty =
            trainerLog.querySelector(
                ".trainer-log-empty"
            );

        if (empty) {
            empty.remove();
        }

        const entry =
            document.createElement("div");

        entry.className =
            "trainer-log-entry";

        const time =
            new Date().toLocaleTimeString();

        entry.textContent =
            "[" + time + "] " + text;

        trainerLog.prepend(entry);

    }


    /* =================================================
       TRAINER STATUS
    ================================================= */

    function updateTrainerStatus(status) {

        trainerState = status;

        if (!trainerStatusBadge) {
            return;
        }

        trainerStatusBadge.classList.remove(
            "running",
            "paused",
            "stopped"
        );

        if (status === "running") {

            trainerStatusBadge.classList.add(
                "running"
            );

            trainerStatusBadge.textContent =
                "● Training";

        } else if (status === "paused") {

            trainerStatusBadge.classList.add(
                "paused"
            );

            trainerStatusBadge.textContent =
                "● Paused";

        } else {

            trainerStatusBadge.classList.add(
                "stopped"
            );

            trainerStatusBadge.textContent =
                "● Stopped";

        }


        if (trainerStart) {

            trainerStart.disabled =
                status === "running";

        }

        if (trainerPause) {

            trainerPause.disabled =
                status !== "running";

        }

        if (trainerStop) {

            trainerStop.disabled =
                status === "stopped";

        }

    }


    /* =================================================
       TRAINER DISPLAY
    ================================================= */

    function updateTrainerDisplay() {

        if (trainerQuestions) {

            trainerQuestions.textContent =
                trainerQuestionsValue;

        }

        if (trainerKnowledge) {

            trainerKnowledge.textContent =
                trainerKnowledgeValue;

        }

        if (trainerSources) {

            trainerSources.textContent =
                trainerSourcesValue;

        }

        if (trainerProgressBar) {

            trainerProgressBar.style.width =
                trainerProgressValue + "%";

        }

        if (trainerProgressText) {

            trainerProgressText.textContent =
                trainerProgressValue + "%";

        }

    }


    /* =================================================
       TRAINER START
    ================================================= */

    function startTrainer() {

        if (
            trainerState === "running"
        ) {
            return;
        }

        updateTrainerStatus("running");

        addTrainerLog(
            "Trainer started."
        );

        if (trainerCurrent) {

            trainerCurrent.textContent =
                "Waiting for the Python trainer...";

        }


        /*
         * This is deliberately only the UI simulation.
         * The real Python trainer will replace this
         * when we connect the Python program.
         */

        clearInterval(trainerTimer);

        trainerTimer =
            setInterval(() => {

                if (
                    trainerState !== "running"
                ) {
                    return;
                }

                trainerQuestionsValue++;

                trainerKnowledgeValue++;

                trainerSourcesValue++;

                trainerProgressValue++;

                if (
                    trainerProgressValue > 100
                ) {

                    trainerProgressValue = 0;

                }


                if (trainerCurrent) {

                    trainerCurrent.textContent =
                        "Preparing knowledge item #" +
                        trainerQuestionsValue +
                        "...";

                }

                updateTrainerDisplay();

            }, 2500);

    }


    /* =================================================
       TRAINER PAUSE
    ================================================= */

    function pauseTrainer() {

        if (
            trainerState !== "running"
        ) {
            return;
        }

        updateTrainerStatus("paused");

        addTrainerLog(
            "Trainer paused."
        );

        if (trainerCurrent) {

            trainerCurrent.textContent =
                "Training paused.";

        }

    }


    /* =================================================
       TRAINER STOP
    ================================================= */

    function stopTrainer() {

        updateTrainerStatus("stopped");

        clearInterval(trainerTimer);

        trainerTimer = null;

        addTrainerLog(
            "Trainer stopped."
        );

        if (trainerCurrent) {

            trainerCurrent.textContent =
                "Trainer is stopped.";

        }

    }


    if (trainerStart) {

        trainerStart.addEventListener(
            "click",
            startTrainer
        );

    }


    if (trainerPause) {

        trainerPause.addEventListener(
            "click",
            pauseTrainer
        );

    }


    if (trainerStop) {

        trainerStop.addEventListener(
            "click",
            stopTrainer
        );

    }


    /* =================================================
       CLEAR TRAINER LOG
    ================================================= */

    if (clearTrainerLog) {

        clearTrainerLog.addEventListener(
            "click",
            () => {

                if (!trainerLog) {
                    return;
                }

                trainerLog.innerHTML = `
                    <div class="trainer-log-empty">
                        No training activity yet.
                    </div>
                `;

            }
        );

    }


    /* =================================================
       INITIAL TRAINER STATE
    ================================================= */

    updateTrainerStatus("stopped");

    updateTrainerDisplay();


    /* =================================================
       PYTHON STATUS
    ================================================= */

    /*
     * Python is NOT executed by GitHub Pages.
     *
     * This simply shows the connection state.
     * Later we will connect this to the Python
     * trainer running on your computer/server.
     */

    function setPythonStatus(connected) {

        if (pythonStatus) {

            pythonStatus.textContent =
                connected
                    ? "Connected"
                    : "Not connected";

        }

        if (pythonStatusDot) {

            pythonStatusDot.classList.toggle(
                "connected",
                connected
            );

        }

    }


    setPythonStatus(false);

});
