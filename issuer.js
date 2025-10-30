// issuer.js
// Contains: navbar loader, footer loader, login page + OTP logic
// Vercel-safe: uses root-relative fetch and robust path checks

document.addEventListener("DOMContentLoaded", async () => {
    const path = window.location.pathname || "/";

    await initNavbarIfNeeded(path);
    await loadFooter();

    // Page-specific init
    if (path.includes("index.html") || path === "/" || path.endsWith("/index")) initLoginPage();
    // issuerHome.html remains as-is (no additional logic here)
    // other pages have their own scripts
    initMassUploadToggle(); // common toggle used by add-earner page too (no-op where not present)
});

// =========================
// NAVBAR (async, safe)
// =========================
async function initNavbarIfNeeded(path) {
    const pages = ["issuerHome.html", "addEarner.html", "earnerList.html", "add-earner.html"];
    if (!pages.some(p => path.includes(p))) return;

    try {
        const res = await fetch("issuerNavbar.html");
        if (!res.ok) throw new Error("issuerNavbar not found");
        const html = await res.text();
        const wrap = document.createElement("div");
        wrap.innerHTML = html;
        document.body.prepend(wrap);

        const nameElement = document.getElementById("issuerName");
        if (nameElement) nameElement.textContent = localStorage.getItem("issuerName") || "Issuer";

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("issuerLoggedIn");
            window.location.href = "index.html";
        });
    } catch (err) {
        console.error("Navbar load failed:", err);
    }
}

// =========================
// FOOTER (async, safe)
// =========================
async function loadFooter() {
    const container = document.getElementById("footer-container");
    if (!container) return;

    try {
        const res = await fetch("footer.html");
        if (!res.ok) throw new Error("footer not found");
        container.innerHTML = await res.text();
    } catch (err) {
        console.error("Footer load failed:", err);
    }
}

// =========================
// LOGIN + OTP logic
// =========================
function initLoginPage() {
    const loginEmailBtn = document.getElementById("loginEmailBtn");
    const loginMobileBtn = document.getElementById("loginMobileBtn");
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    const loginBtn = document.getElementById("loginBtn");
    const resendText = document.getElementById("resendText");
    if (!loginBtn) return; // not login page

    let selectedMethod = null;
    let timerInterval = null;

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

    function toggleLogin(method) {
        selectedMethod = method;
        methodSelection?.classList.add("d-none");
        inputSection?.classList.remove("d-none");
        emailInputDiv?.classList.toggle("d-none", method !== "email");
        mobileInputDiv?.classList.toggle("d-none", method !== "mobile");
    }

    loginEmailBtn?.addEventListener("click", () => toggleLogin("email"));
    loginMobileBtn?.addEventListener("click", () => toggleLogin("mobile"));

    sendOtpBtn?.addEventListener("click", () => {
        const value = selectedMethod === "email" ? (document.getElementById("issuerEmail")?.value || "").trim()
            : (document.getElementById("issuerMobile")?.value || "").trim();

        if (!value) return alert(`Enter your ${selectedMethod}`);

        if (readonlyValue) readonlyValue.value = value;
        if (readonlyLabel) readonlyLabel.textContent = selectedMethod === "email" ? "Email" : "Mobile";

        // build OTP inputs
        if (otpInputsDiv) {
            otpInputsDiv.innerHTML = "";
            const inputs = [];
            for (let i = 0; i < 6; i++) {
                const box = document.createElement("input");
                box.type = "text";
                box.maxLength = 1;
                box.className = "otp-input";
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
            inputs[0]?.focus();
        }

        inputSection?.classList.add("d-none");
        otpSection?.classList.remove("d-none");
        if (subtitle) subtitle.textContent = "Please verify your login details";
        startOtpTimer();
    });

    function startOtpTimer() {
        let t = 60;
        clearInterval(timerInterval);
        resendText?.classList.add("disabled");
        if (timerText) timerText.textContent = `Resend in 00:${t < 10 ? "0" + t : t}`;

        timerInterval = setInterval(() => {
            t--;
            if (timerText) timerText.textContent = `Resend in 00:${t < 10 ? "0" + t : t}`;
            if (t <= 0) {
                clearInterval(timerInterval);
                if (timerText) timerText.textContent = "";
                resendText?.classList.remove("disabled");
            }
        }, 1000);
    }

    resendText?.addEventListener("click", () => {
        if (!resendText.classList.contains("disabled")) {
            startOtpTimer();
            alert("OTP resent successfully");
        }
    });

    document.getElementById("cancelBtn")?.addEventListener("click", () => {
        clearInterval(timerInterval);
        otpSection?.classList.add("d-none");
        inputSection?.classList.add("d-none");
        methodSelection?.classList.remove("d-none");
        if (subtitle) subtitle.textContent = "Please select your login method";
    });

    loginBtn.addEventListener("click", () => {
        const entered = [...(document.querySelectorAll("#otpInputs input") || [])]
            .map(i => i.value).join("");
        if (entered !== "123456") return alert("Invalid OTP");
        localStorage.setItem("issuerLoggedIn", "1");
        // keep issuerHome path relative to root
        window.location.href = "issuerHome.html";
    });
}

// =========================
// MASS UPLOAD TOGGLE (shared small helper)
// =========================
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
