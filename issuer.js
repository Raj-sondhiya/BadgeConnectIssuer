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
    // common toggle used by add-earner page too (no-op where not present)
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
// LOGIN + OTP logic (with SweetAlert2)
// =========================
function initLoginPage() {
    const loginForm = document.getElementById("loginForm");
    const otpForm = document.getElementById("otpForm");
    const emailField = document.getElementById("email");
    const verifyEmail = document.getElementById("verifyEmail");
    const formSubtitle = document.getElementById("form-subtitle");
    const resendLink = document.getElementById("resendLink");
    const timerText = document.getElementById("timer");
    const otpInputs = document.querySelectorAll(".otp-input");

    let timer;
    let countdown = 60;

    // ✅ Handle Send OTP
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = emailField.value.trim();
            if (!email) {
                Swal.fire({
                    icon: "warning",
                    title: "Missing Information",
                    text: "Please enter a valid email or phone number!",
                });
                return;
            }

            // Hide login form, show OTP form
            loginForm.classList.add("d-none");
            otpForm.classList.remove("d-none");

            // populate verify email/phone
            if (verifyEmail) verifyEmail.value = email;

            // update subtitle
            if (formSubtitle) formSubtitle.textContent = "Please verify your login details";

            startTimer(); // start resend timer

            // focus first OTP input
            if (otpInputs && otpInputs.length) otpInputs[0].focus();
        });
    }

    // ✅ OTP Input Navigation
    if (otpInputs && otpInputs.length) {
        otpInputs.forEach((input, index) => {
            input.addEventListener("input", () => {
                input.value = input.value.replace(/[^0-9]/g, "");
                if (input.value && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            });

            input.addEventListener("keydown", (event) => {
                if (event.key === "Backspace" && !input.value && index > 0) {
                    otpInputs[index - 1].focus();
                } else if (event.key === "ArrowLeft" && index > 0) {
                    otpInputs[index - 1].focus();
                } else if (event.key === "ArrowRight" && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            });
        });
    }

    // ✅ OTP Timer Logic
    function startTimer() {
        clearInterval(timer);
        countdown = 60;

        if (resendLink) {
            resendLink.style.pointerEvents = "none";
            resendLink.style.opacity = "0.6";
        }
        if (timerText) timerText.textContent = `00:60`;

        timer = setInterval(() => {
            countdown--;
            const seconds = countdown < 10 ? "0" + countdown : countdown;
            if (timerText) timerText.textContent = `00:${seconds}`;

            if (countdown <= 0) {
                clearInterval(timer);
                if (resendLink) {
                    resendLink.style.pointerEvents = "auto";
                    resendLink.style.opacity = "1";
                }
                if (timerText) timerText.textContent = "00:00";
            }
        }, 1000);
    }

    // ✅ Handle Resend Click
    if (resendLink) {
        resendLink.addEventListener("click", () => {
            if (resendLink.style.pointerEvents === "auto") {
                Swal.fire({
                    icon: "info",
                    title: "OTP Resent",
                    text: "A new OTP has been sent!",
                    timer: 2000,
                    showConfirmButton: false
                });
                startTimer();
            }
        });
    }

    // ✅ Handle OTP Verification
    if (otpForm) {
        otpForm.addEventListener("submit", function (e) {
            e.preventDefault();

            let enteredOTP = "";
            otpInputs.forEach(input => enteredOTP += input.value);

            if (enteredOTP.length < 6) {
                Swal.fire({
                    icon: "warning",
                    title: "Incomplete OTP",
                    text: "Please enter all 6 digits of the OTP.",
                });
                return;
            }

            if (enteredOTP === "123456") {
                // Successful login (for demo)
                Swal.fire({
                    icon: "success",
                    title: "Login Successful!",
                    text: "Redirecting to your dashboard...",
                    timer: 1000,
                    showConfirmButton: false
                });
                setTimeout(() => {
                    localStorage.setItem("issuerLoggedIn", "1");
                    window.location.href = "issuerHome.html";
                }, 2000);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Invalid OTP",
                    text: "Please try again.",
                });
                otpInputs.forEach(inp => inp.value = "");
                if (otpInputs.length) otpInputs[0].focus();
            }
        });
    }
}



