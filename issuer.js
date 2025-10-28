// ============================================================
// ✅ SINGLE DOM READY INIT — NO DUPLICATION
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
    const path = window.location.pathname;

    await initNavbarIfNeeded(path);  // Load first → DOM stable
    await loadFooter();              // Load second → No UI flicker

    // Page-specific initialization
    if (path.endsWith("/index.html")) initLoginPage();
    else if (path.endsWith("addEarner.html")) initAddEarnerPage();
    else if (path.endsWith("earnerList.html")) initEarnerListPage();

    initMassUploadToggle();
});

// ============================================================
// ✅ NAVBAR LOADER (WITH EVENT ATTACHMENTS AFTER LOAD)
// ============================================================
async function initNavbarIfNeeded(path) {
    const pages = ["issuerHome.html", "addEarner.html", "earnerList.html"];
    if (!pages.some(p => path.endsWith(p))) return; // Skip if no navbar needed

    try {
        const res = await fetch("issuerNavbar.html");
        const html = await res.text();
        const wrap = document.createElement("div");
        wrap.innerHTML = html;
        document.body.prepend(wrap);

        const nameElement = document.getElementById("issuerName");
        if (nameElement) nameElement.textContent = localStorage.getItem("issuerName") || "Issuer";

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) logoutBtn.onclick = () => {
            localStorage.removeItem("issuerLoggedIn");
            window.location.href = "/index.html";
        };

    } catch (err) {
        console.error("Navbar load failed:", err);
    }
}

// ============================================================
// ✅ FOOTER LOADER (NOW SAFE AND SEQUENTIAL)
// ============================================================
async function loadFooter() {
    const container = document.getElementById("footer-container");
    if (!container) return;

    try {
        const res = await fetch("footer.html");
        container.innerHTML = await res.text();
    } catch (err) {
        console.error("Footer load failed:", err);
    }
}

// ============================================================
// ✅ LOGIN PAGE LOGIC
// ============================================================
function initLoginPage() {
    const loginEmailBtn = document.getElementById("loginEmailBtn");
    const loginMobileBtn = document.getElementById("loginMobileBtn");
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    const loginBtn = document.getElementById("loginBtn");
    const resendText = document.getElementById("resendText");

    if (!loginBtn) return;

    let selectedMethod = null;
    let timerInterval;

    const methodSelection = document.getElementById("method-selection");
    const inputSection = document.getElementById("input-section");
    const emailInputDiv = document.getElementById("emailInputDiv");
    const mobileInputDiv = document.getElementById("mobileInputDiv");
    const otpSection = document.getElementById("otp-section");
    const otpInputsDiv = document.getElementById("otpInputs");
    const timerText = document.getElementById("timerText");
    const subtitle = document.getElementById("form-subtitle");
    const readonlyValue = document.getElementById("readonlyValue");
    const readonlyLabel = document.getElementById("readonlyLabel");

    loginEmailBtn.onclick = () => toggleLogin("email");
    loginMobileBtn.onclick = () => toggleLogin("mobile");

    function toggleLogin(method) {
        selectedMethod = method;
        methodSelection.classList.add("d-none");
        inputSection.classList.remove("d-none");
        emailInputDiv.classList.toggle("d-none", method !== "email");
        mobileInputDiv.classList.toggle("d-none", method !== "mobile");
    }

    sendOtpBtn.onclick = () => {
        const value =
            selectedMethod === "email"
                ? document.getElementById("issuerEmail").value.trim()
                : document.getElementById("issuerMobile").value.trim();

        if (!value) return alert(`Enter your ${selectedMethod}`);

        readonlyValue.value = value;
        readonlyLabel.textContent = selectedMethod === "email" ? "Email" : "Mobile";

        otpInputsDiv.innerHTML = "";
        const inputs = [];

        for (let i = 0; i < 6; i++) {
            const box = document.createElement("input");
            box.maxLength = 1;
            box.className = "otp-input";
            otpInputsDiv.appendChild(box);
            inputs.push(box);

            box.oninput = () => {
                box.value = box.value.replace(/[^0-9]/g, "");
                if (box.value && i < 5) inputs[i + 1].focus();
            };
            box.onkeydown = (e) => {
                if (e.key === "Backspace" && i > 0 && !box.value) inputs[i - 1].focus();
            };
        }
        inputs[0].focus();

        inputSection.classList.add("d-none");
        otpSection.classList.remove("d-none");
        subtitle.textContent = "Please verify your login details";

        startOtpTimer();
    };

    function startOtpTimer() {
        let t = 60;
        clearInterval(timerInterval);
        resendText.classList.add("disabled");
        updateTimerText();

        timerInterval = setInterval(() => {
            t--;
            updateTimerText();
            if (t <= 0) {
                clearInterval(timerInterval);
                timerText.textContent = "";
                resendText.classList.remove("disabled");
            }
        }, 1000);

        function updateTimerText() {
            timerText.textContent = `Resend in 00:${t < 10 ? "0" + t : t}`;
        }
    }

    resendText.onclick = () => {
        if (!resendText.classList.contains("disabled")) startOtpTimer();
    };

    document.getElementById("cancelBtn").onclick = () => {
        clearInterval(timerInterval);
        otpSection.classList.add("d-none");
        inputSection.classList.add("d-none");
        methodSelection.classList.remove("d-none");
        subtitle.textContent = "Please select your login method";
    };

    loginBtn.onclick = () => {
        const entered = [...otpInputsDiv.querySelectorAll("input")]
            .map(i => i.value).join("");

        if (entered !== "123456") return alert("Invalid OTP");

        localStorage.setItem("issuerLoggedIn", "1");
        window.location.href = "issuerHome.html";
    };
}

// ============================================================
// ✅ ADD EARNER PAGE LOGIC
// ============================================================
function initAddEarnerPage() {
    const tabButtons = [...document.querySelectorAll("#earnerFormTabs .nav-link")];
    const prevBtn = document.getElementById("prevTabBtn");
    const nextBtn = document.getElementById("nextTabBtn");
    const submitBtn = document.getElementById("submitEarnerBtn");

    if (!tabButtons.length) return;

    function goToTab(i) {
        if (!tabButtons[i]) return;
        tabButtons[i].click();
        prevBtn.classList.toggle("d-none", i === 0);
        nextBtn.classList.toggle("d-none", i === tabButtons.length - 1);
        submitBtn.classList.toggle("d-none", i !== tabButtons.length - 1);
    }

    nextBtn.onclick = () => goToTab(tabButtons.findIndex(t => t.classList.contains("active")) + 1);
    prevBtn.onclick = () => goToTab(tabButtons.findIndex(t => t.classList.contains("active")) - 1);
}

// ============================================================
// ✅ EARNER LIST PAGE LOGIC
// ============================================================
function initEarnerListPage() {
    const tableBody = document.getElementById("earnerTableBody");
    if (!tableBody) return;

    const data = JSON.parse(localStorage.getItem("earners")) || [];
    tableBody.innerHTML = "";
    data.forEach((e, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${i + 1}</td>
            <td>${e.email}</td>
            <td>${e.contact}</td>
            <td>${e.firstName}</td>
            <td>${e.lastName}</td>
            <td>${e.badgeId}</td>
            <td>${e.organization}</td>
            <td>${e.location}</td>
            <td>${e.issueDate}</td>
            <td class="text-center"> - - - </td>
        `;
        tableBody.appendChild(tr);
    });
}

// ============================================================
// ✅ MASS UPLOAD TOGGLE
// ============================================================
function initMassUploadToggle() {
    const section = document.getElementById("massUploadSection");
    const form = document.getElementById("singleEarnerForm");
    if (!section || !form) return;

    document.getElementById("addSingleEarnerBtn").onclick = () => {
        section.classList.add("d-none");
        form.classList.remove("d-none");
    };

    document.getElementById("backToUploadBtn").onclick = () => {
        form.classList.add("d-none");
        section.classList.remove("d-none");
    };
}
