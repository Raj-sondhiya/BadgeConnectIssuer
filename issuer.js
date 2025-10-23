document.addEventListener("DOMContentLoaded", () => {
    const methodSelection = document.getElementById("method-selection");
    const inputSection = document.getElementById("input-section");
    const emailInputDiv = document.getElementById("emailInputDiv");
    const mobileInputDiv = document.getElementById("mobileInputDiv");
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    const otpSection = document.getElementById("otp-section");
    const otpInputsDiv = document.getElementById("otpInputs");
    const timerText = document.getElementById("timerText");
    const resendText = document.getElementById("resendText");
    const cancelBtn = document.getElementById("cancelBtn");
    const loginBtn = document.getElementById("loginBtn");
    const subtitle = document.getElementById("form-subtitle");
    const readonlyValue = document.getElementById("readonlyValue");
    const readonlyLabel = document.getElementById("readonlyLabel");

    let selectedMethod = null;
    let timerInterval;

    // ✅ Handle login method selection
    document.getElementById("loginEmailBtn").addEventListener("click", () => {
        selectedMethod = "email";
        methodSelection.classList.add("d-none");
        inputSection.classList.remove("d-none");
        emailInputDiv.classList.remove("d-none");
        mobileInputDiv.classList.add("d-none");
    });

    document.getElementById("loginMobileBtn").addEventListener("click", () => {
        selectedMethod = "mobile";
        methodSelection.classList.add("d-none");
        inputSection.classList.remove("d-none");
        mobileInputDiv.classList.remove("d-none");
        emailInputDiv.classList.add("d-none");
    });

    // ✅ Send OTP button
    sendOtpBtn.addEventListener("click", () => {
        const value =
            selectedMethod === "email"
                ? document.getElementById("issuerEmail").value.trim()
                : document.getElementById("issuerMobile").value.trim();

        if (!value) {
            alert(`Please enter your ${selectedMethod === "email" ? "email" : "mobile number"}`);
            return;
        }

        // Show readonly field with label
        readonlyValue.value = value;
        readonlyLabel.textContent =
            selectedMethod === "email" ? "Email address" : "Mobile number";

        // Build 6 OTP input boxes
        otpInputsDiv.innerHTML = "";
        const otpInputs = [];
        for (let i = 0; i < 6; i++) {
            const input = document.createElement("input");
            input.type = "text";
            input.maxLength = 1;
            input.classList.add("otp-input");
            otpInputs.push(input);
            otpInputsDiv.appendChild(input);
        }

        // OTP input navigation
        otpInputs.forEach((input, index) => {
            input.addEventListener("input", () => {
                input.value = input.value.replace(/[^0-9]/g, "");
                if (input.value && index < otpInputs.length - 1) otpInputs[index + 1].focus();
            });
            input.addEventListener("keydown", (e) => {
                if (e.key === "Backspace" && !input.value && index > 0)
                    otpInputs[index - 1].focus();
            });
        });

        otpInputs[0].focus();

        // Switch UI sections
        inputSection.classList.add("d-none");
        otpSection.classList.remove("d-none");
        subtitle.textContent = "Please verify your login details";

        startTimer();
    });

    // ✅ Start 60s timer
    function startTimer() {
        let timeLeft = 60;
        resendText.classList.add("disabled");
        resendText.style.color = "gray";
        timerText.textContent = `Resend in 00:${timeLeft < 10 ? "0" + timeLeft : timeLeft}`;

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            const formatted = `00:${timeLeft < 10 ? "0" + timeLeft : timeLeft}`;
            timerText.textContent = `Resend in ${formatted}`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerText.textContent = "";
                resendText.classList.remove("disabled");
                resendText.style.color = "#0d6efd"; // blue
            }
        }, 1000);
    }

    // ✅ Resend text click handler
    resendText.addEventListener("click", () => {
        if (!resendText.classList.contains("disabled")) {
            alert("OTP resent successfully!");
            startTimer();
        }
    });

    // ✅ Cancel button → go back to method selection
    cancelBtn.addEventListener("click", () => {
        otpSection.classList.add("d-none");
        inputSection.classList.add("d-none");
        methodSelection.classList.remove("d-none");
        subtitle.textContent = "Please select your login method";
        clearInterval(timerInterval);
    });

    // ✅ Login button with fixed OTP
    loginBtn.addEventListener("click", () => {
        const enteredOtp = Array.from(otpInputsDiv.querySelectorAll("input"))
            .map(input => input.value)
            .join("");

        if (enteredOtp === "123456") {
            alert("Login successful!");
            window.location.href = "issuerHome.html";
        } else {
            alert("Invalid OTP. Try again.");
        }
    });
});




// ============ ISSUER NAVBAR LOGIC ============

// ============================================================
// ============ UNIVERSAL NAVBAR LOADER FOR ISSUER PAGES ======
// ============================================================

function loadIssuerNavbar() {
    fetch("issuerNavbar.html")
        .then(response => response.text())
        .then(html => {
            const navbarContainer = document.createElement("div");
            navbarContainer.innerHTML = html;
            document.body.prepend(navbarContainer);

            // Set fixed issuer name (for now)
            const nameElement = document.getElementById("issuerName");
            if (nameElement) nameElement.textContent = "Ramraj";

            // Logout functionality
            const logoutBtn = document.getElementById("logoutBtn");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", () => {
                    alert("You have been logged out successfully.");
                    window.location.href = "index.html";
                });
            }
        })
        .catch(err => console.error("Error loading issuer navbar:", err));
}

// ✅ Pages where navbar should load
const pagesRequiringNavbar = [
    "issuerHome.html",
    "addEarner.html",
    "earnerList.html"
];

// ✅ Auto-load navbar if page matches
document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname;
    if (pagesRequiringNavbar.some(page => currentPath.endsWith(page))) {
        loadIssuerNavbar();
    }
});




// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;

    // ---------- ADD EARNER PAGE ----------
    if (path.endsWith("addEarner.html")) {
        const form = document.getElementById("earnerForm");
        const toggleBtn = document.getElementById("addSingleEarnerBtn");
        const singleForm = document.getElementById("singleEarnerForm");

        if (toggleBtn && singleForm) {
            toggleBtn.addEventListener("click", () => {
                singleForm.classList.toggle("d-none");
            });
        }

        if (form) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();

                const earner = {
                    email: form.querySelector('input[placeholder="Enter email address"]').value.trim(),
                    contact: form.querySelector('input[placeholder="Enter mobile number"]').value.trim(),
                    firstName: form.querySelector('input[placeholder="Enter first name"]').value.trim(),
                    lastName: form.querySelector('input[placeholder="Enter last name"]').value.trim(),
                    badgeTitle: form.querySelector('input[placeholder="Enter Badge title"]').value.trim(),
                    badgeId: form.querySelector('input[placeholder="Enter badge id"]').value.trim(),
                    organization: form.querySelector('input[placeholder="Enter organization name"]').value.trim(),
                    address: form.querySelector('input[placeholder="Enter address"]').value.trim(),
                    createdAt: new Date().toLocaleString()
                };

                // Save to localStorage
                const earners = JSON.parse(localStorage.getItem("earners")) || [];
                earners.push(earner);
                localStorage.setItem("earners", JSON.stringify(earners));

                alert("Earner added successfully!");
                form.reset();
                singleForm.classList.add("d-none");

                // Redirect to list page
                window.location.href = "earnerList.html";
            });
        }
    }

    // ---------- EARNER LIST PAGE ----------
    if (path.endsWith("earnerList.html")) {
        const tableBody = document.getElementById("earnerTableBody");
        if (!tableBody) return;

        const earners = JSON.parse(localStorage.getItem("earners")) || [];
        tableBody.innerHTML = "";

        earners.forEach((earner, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${earner.email}</td>
                <td>${earner.contact}</td>
                <td>${earner.firstName}</td>
                <td>${earner.lastName}</td>
                <td>${earner.badgeTitle}</td>
                <td>${earner.badgeId}</td>
                <td>${earner.organization}</td>
                <td>${earner.address}</td>
                <td>${earner.createdAt}</td>
                <td class="text-center">
                    <i class="fa-solid fa-pen-to-square text-warning" title="Edit"></i>
                    <i class="fa-solid fa-trash text-danger" title="Delete"></i>
                    <i class="fa-solid fa-eye text-primary" title="View"></i>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
});

// ---------- Helper Functions ----------
function deleteEarner(index) {
    if (confirm("Are you sure you want to delete this record?")) {
        const earners = JSON.parse(localStorage.getItem("earners")) || [];
        earners.splice(index, 1);
        localStorage.setItem("earners", JSON.stringify(earners));
        location.reload();
    }
}

function viewEarner(index) {
    const earners = JSON.parse(localStorage.getItem("earners")) || [];
    const e = earners[index];
    alert(
        `Earner Details:\n\n` +
        `Name: ${e.firstName} ${e.lastName}\n` +
        `Email: ${e.email}\n` +
        `Contact: ${e.contact}\n` +
        `Badge: ${e.badgeTitle} (${e.badgeId})\n` +
        `Organization: ${e.organization}\n` +
        `Address: ${e.address}\n` +
        `Created At: ${e.createdAt}`
    );
}
