// earnerList.js
// Contains: read earners from localStorage and render in earnerList.html
// Also exposes editEarner, deleteEarner, viewEarner so existing inline onclick handlers keep working.

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname || "/";
    if (!path.includes("earnerList.html") && !path.includes("earner-list")) return;
    renderEarnerList();
});

// =========================
// Render list into #earnerTableBody
// =========================
function renderEarnerList() {
    const tableBody = document.getElementById("earnerTableBody");
    if (!tableBody) return;

    const data = JSON.parse(localStorage.getItem("earners") || "[]");
    tableBody.innerHTML = "";

    data.forEach((e, i) => {
        // ✅ Support both new and old formats
        const firstName = e.firstName || e["First name"] || "";
        const lastName = e.lastName || e["Last name"] || "";
        const fullName = `${firstName} ${lastName}`.trim();

        const address = e.orgLocation || e["location-b1"] || e["Location"] || "";
        const company = e.orgName || e["Company"] || e["organization"] || "";
        const email = e.email || e["email"] || "";
        const contact = e.mobile || e["Mobile Number"] || e["contact"] || "";
        const badgeId = e.badgeId || e["badge1"] || "";
        const issueDate = e.issueDate || e["issuedate-b1"] || "";

        // 🔹 If no badges in data, show a random fallback number (temporary)
        const badges = badgeId ? 1 : Math.floor(Math.random() * 5 + 1);

        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${escapeHtml(email)}</td>
        <td>${escapeHtml(fullName)}</td>
        <td>${escapeHtml(address)}</td>
        <td>${escapeHtml(company)}</td>
        <td>${escapeHtml(badges)}</td>
        <td>${escapeHtml(contact)}</td>
        <td class="text-center">
            <i class="fa-solid fa-pen-to-square text-warning" style="cursor:pointer" onclick="editEarner(${i})"></i>
            <i class="fa-solid fa-trash text-danger ms-2" style="cursor:pointer" onclick="deleteEarner(${i})"></i>
            <i class="fa-solid fa-eye text-primary ms-2" style="cursor:pointer" onclick="viewEarner(${i})"></i>
        </td>
    `;
        tableBody.appendChild(tr);
    });
}


// =========================
// Actions: edit, delete, view
// These are global so HTML inline handlers can call them
// =========================
window.editEarner = function (idx) {
    const data = JSON.parse(localStorage.getItem("earners") || "[]");
    if (!data[idx]) return alert("Record not found");
    localStorage.setItem("earnerEditDraft", JSON.stringify({ index: idx, record: data[idx] }));
    window.location.href = "editEarner.html"; // redirect to edit page
};


window.deleteEarner = function (idx) {
    if (!confirm("Delete this earner? This action cannot be undone.")) return;
    const data = JSON.parse(localStorage.getItem("earners") || "[]");
    if (!data[idx]) return alert("Record not found");
    data.splice(idx, 1);
    localStorage.setItem("earners", JSON.stringify(data));
    renderEarnerList();
};

// Add other columns about issuer details here if required
window.viewEarner = function (idx) {
    const data = JSON.parse(localStorage.getItem("earners") || "[]");
    if (!data[idx]) return alert("Record not found");
    const e = data[idx];

    // ✅ Flexible field mapping (old CSV + new JSON)
    const firstName = e.firstName || e["First name"] || "";
    const lastName = e.lastName || e["Last name"] || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const email = e.email || e["email"] || "";
    const contact = e.mobile || e["Mobile Number"] || "";
    const company = e.orgName || e["Company"] || e["organization"] || "";
    const address = e.orgLocation || e["location-b1"] || e["Location"] || "";
    const issuer = e.issuerName || e["issuerName-b1"] || "";
    const issueDate = e.issueDate || e["issuedate-b1"] || "";
    const expiryDate = e.expDate || e["expDate-b1"] || "";
    const referenceLink = e.issuerRefernceLink || e["issuerRefernceLink"] || "";
    const notes = e.issuerNotes || e["issuerNotes-b1"] || "";

    // ✅ Collect all badges dynamically
    const badges = Object.keys(e)
        .filter(k => k.toLowerCase().startsWith("badge") && e[k])
        .map(k => e[k]);

    // ✅ Build modal body
    const body = document.getElementById("earnerDetailsBody");
    if (!body) return;

    body.innerHTML = `
      <tr>
        <td class="bg-info text-white fw-semibold" style="width: 30%;">Full Name</td>
        <td>${escapeHtml(fullName)}</td>
      </tr>
      <tr>
        <td class="bg-info text-white fw-semibold">Email</td>
        <td>${escapeHtml(email)}</td>
      </tr>
      <tr>
        <td class="bg-info text-white fw-semibold">Mobile Number</td>
        <td>${escapeHtml(contact)}</td>
      </tr>
      <tr>
        <td class="bg-info text-white fw-semibold">Organization / Company</td>
        <td>${escapeHtml(company)}</td>
      </tr>
      <tr>
        <td class="bg-info text-white fw-semibold">Address</td>
        <td>${escapeHtml(address)}</td>
      </tr>
      <tr>
        <td class="bg-info text-white fw-semibold">Badges</td>
        <td>
          ${badges.length > 0
            ? `<ul class="mb-0">${badges
                .map((b, i) => `<li><strong>Badge ${i + 1}:</strong> ${escapeHtml(b)}</li>`)
                .join("")}</ul>`
            : "—"
        }
        </td>
      </tr>
      <tr>
        <td class="bg-info text-white fw-semibold">Issuer</td>
        <td>${escapeHtml(issuer)}</td>
      </tr>
      <tr>
        <td class="bg-info text-white fw-semibold">Issue Date</td>
        <td>${escapeHtml(issueDate)}</td>
      </tr>
      <tr>
        <td class="bg-info text-white fw-semibold">Expiry Date</td>
        <td>${escapeHtml(expiryDate)}</td>
      </tr>
      <tr>
        <td class="bg-info text-white fw-semibold">Issuer Notes</td>
        <td>${escapeHtml(notes)}</td>
      </tr>
      <tr>
        <td class="bg-info text-white fw-semibold">Reference Link</td>
        <td>${referenceLink ? `<a href="${referenceLink}" target="_blank">${escapeHtml(referenceLink)}</a>` : "—"}</td>
      </tr>
    `;

    // ✅ Open modal
    const modal = new bootstrap.Modal(document.getElementById("earnerViewModal"));
    modal.show();
};


// =========================
// Small HTML escape utility
// =========================
function escapeHtml(s) {
    return s.replace?.(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") ?? s;
}
