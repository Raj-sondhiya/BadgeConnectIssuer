// ====================================================================
// ✅ SINGLE DOMContentLoaded HANDLER (VERCEL SAFE VERSION)
// ====================================================================
document.addEventListener("DOMContentLoaded", async () => {
    const path = window.location.pathname;

    await initNavbarIfNeeded(path);
    await loadFooter();

    initLoginPage(path);
    initAddEarnerPage(path);
    initEarnerListPage(path);
    initMassUploadToggle();
});

// ====================================================================
// ✅ NAVBAR LOGIC (ASYNC + PATH SAFE)
// ====================================================================
async function initNavbarIfNeeded(path) {
    const pages = ["issuerHome.html", "addEarner.html", "earnerList.html"];
    if (!pages.some(page => path.includes(page))) return;

    try {
        const res = await fetch("/issuerNavbar.html");
        if (!res.ok) throw new Error("Navbar not found");
        const html = await res.text();

        const wrap = document.createElement("div");
        wrap.innerHTML = html;
        document.body.prepend(wrap);

        const nameElement = document.getElementById("issuerName");
        if (nameElement) nameElement.textContent = localStorage.getItem("issuerName") || "Issuer";

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("issuerLoggedIn");
                window.location.href = "/index.html";
            });
        }
    } catch (err) {
        console.error("Navbar load failed:", err);
    }
}

// ====================================================================
// ✅ FOOTER LOADER (ASYNC + PATH SAFE)
// ====================================================================
async function loadFooter() {
    const footerContainer = document.getElementById("footer-container");
    if (!footerContainer) return;

    try {
        const res = await fetch("/footer.html");
        if (!res.ok) throw new Error("Footer not found");
        const html = await res.text();
        footerContainer.innerHTML = html;
    } catch (err) {
        console.error("Error loading footer:", err);
    }
}

// ====================================================================
// ✅ LOGIN PAGE LOGIC
// ====================================================================
function initLoginPage(path) {
    if (!path.includes("index.html") && !path.endsWith("/")) return;

    const loginEmailBtn = document.getElementById("loginEmailBtn");
    const loginMobileBtn = document.getElementById("loginMobileBtn");
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    const resendText = document.getElementById("resendText");
    const cancelBtn = document.getElementById("cancelBtn");
    const loginBtn = document.getElementById("loginBtn");
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

    const resetToMethodSelection = () => {
        otpSection?.classList.add("d-none");
        inputSection?.classList.add("d-none");
        methodSelection?.classList.remove("d-none");
        subtitle.textContent = "Please select your login method";
        clearInterval(timerInterval);
    };

    loginEmailBtn?.addEventListener("click", () => toggleLogin("email"));
    loginMobileBtn?.addEventListener("click", () => toggleLogin("mobile"));

    function toggleLogin(method) {
        selectedMethod = method;
        methodSelection.classList.add("d-none");
        inputSection.classList.remove("d-none");
        emailInputDiv.classList.toggle("d-none", method !== "email");
        mobileInputDiv.classList.toggle("d-none", method !== "mobile");
    }

    sendOtpBtn?.addEventListener("click", () => {
        const value = selectedMethod === "email"
            ? document.getElementById("issuerEmail").value.trim()
            : document.getElementById("issuerMobile").value.trim();

        if (!value) {
            alert(`Enter your ${selectedMethod}`);
            return;
        }

        readonlyValue.value = value;
        readonlyLabel.textContent = selectedMethod === "email" ? "Email" : "Mobile";

        otpInputsDiv.innerHTML = "";
        const inputs = [];
        for (let i = 0; i < 6; i++) {
            const box = document.createElement("input");
            box.type = "text";
            box.maxLength = 1;
            box.classList.add("otp-input");
            otpInputsDiv.appendChild(box);
            inputs.push(box);

            box.addEventListener("input", () => {
                box.value = box.value.replace(/[^0-9]/g, "");
                if (box.value && i < 5) inputs[i + 1].focus();
            });
            box.addEventListener("keydown", (e) => {
                if (e.key === "Backspace" && !box.value && i > 0) inputs[i - 1].focus();
            });
        }
        inputs[0].focus();

        inputSection.classList.add("d-none");
        otpSection.classList.remove("d-none");
        subtitle.textContent = "Please verify your login details";
        startOtpTimer();
    });

    function startOtpTimer() {
        let t = 60;
        resendText.classList.add("disabled");
        timerText.textContent = `Resend in 00:${t}`;
        clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            t--;
            timerText.textContent = `Resend in 00:${t < 10 ? "0" + t : t}`;
            if (t <= 0) {
                clearInterval(timerInterval);
                timerText.textContent = "";
                resendText.classList.remove("disabled");
            }
        }, 1000);
    }

    resendText?.addEventListener("click", () => {
        if (!resendText.classList.contains("disabled")) {
            startOtpTimer();
            alert("OTP resent successfully");
        }
    });

    cancelBtn?.addEventListener("click", resetToMethodSelection);

    loginBtn.addEventListener("click", () => {
        const entered = [...otpInputsDiv.querySelectorAll("input")].map(i => i.value).join("");
        if (entered !== "123456") return alert("Invalid OTP");

        localStorage.setItem("issuerLoggedIn", "1");
        window.location.href = "/issuerHome.html";
    });
}

// ====================================================================
// ✅ ADD EARNER PAGE LOGIC
// ====================================================================
function initAddEarnerPage(path) {
    if (!path.includes("addEarner.html")) return;

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

    nextBtn?.addEventListener("click", () => goToTab(tabButtons.findIndex(t => t.classList.contains("active")) + 1));
    prevBtn?.addEventListener("click", () => goToTab(tabButtons.findIndex(t => t.classList.contains("active")) - 1));
}

// ====================================================================
// ✅ EARNER LIST PAGE LOGIC
// ====================================================================
function initEarnerListPage(path) {
    if (!path.includes("earnerList.html")) return;

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
            <td class="text-center">
                <i class="fa-solid fa-pen-to-square text-warning"></i>
                <i class="fa-solid fa-trash text-danger"></i>
                <i class="fa-solid fa-eye text-primary"></i>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// ====================================================================
// ✅ MASS UPLOAD TOGGLE
// ====================================================================
function initMassUploadToggle() {
    const section = document.getElementById("massUploadSection");
    const form = document.getElementById("singleEarnerForm");
    if (!section || !form) return;

    document.getElementById("addSingleEarnerBtn")?.addEventListener("click", () => {
        section.classList.add("d-none");
        form.classList.remove("d-none");
    });

    document.getElementById("backToUploadBtn")?.addEventListener("click", () => {
        form.classList.add("d-none");
        section.classList.remove("d-none");
    });
}
