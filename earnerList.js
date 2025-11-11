// earnerList.js
// Contains: read earners from localStorage and render in earnerList.html
// Uses SweetAlert2 for alerts and confirmations.

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

  if (data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-muted py-4">
          No earners found. Add a new one to get started.
        </td>
      </tr>`;
    return;
  }

  data.forEach((e, i) => {
    const firstName = e.firstName || e["First name"] || "";
    const lastName = e.lastName || e["Last name"] || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const profileId = e.id || e["id"] || "";
    const address = e.orgLocation || e["location-b1"] || e["Location"] || "";
    const company = e.orgName || e["Company"] || e["organization"] || "";
    const email = e.email || e["email"] || "";
    const contact = e.mobile || e["Mobile Number"] || e["contact"] || "";
    const badgeCount = (e.badges && Array.isArray(e.badges)) ? e.badges.length : 0;

    const issueDate = e.issueDate || e["issuedate-b1"] || e["issueDate"] || "";

    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${profileId}</td>
        <td>${escapeHtml(email)}</td>
        <td>${escapeHtml(fullName)}</td>
        <td>${escapeHtml(address)}</td>
        <td>${escapeHtml(company)}</td>
        <td>${badgeCount}</td>
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
// =========================

// Edit - redirect to editEarner.html with draft in localStorage
window.editEarner = async function (idx) {
  const data = JSON.parse(localStorage.getItem("earners") || "[]");
  if (!data[idx]) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Record not found."
    });
    return;
  }
  localStorage.setItem("earnerEditDraft", JSON.stringify({ index: idx, record: data[idx] }));
  window.location.href = "editEarner.html";
};

// Delete with confirmation
window.deleteEarner = async function (idx) {
  const data = JSON.parse(localStorage.getItem("earners") || "[]");
  if (!data[idx]) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Record not found."
    });
    return;
  }

  const result = await Swal.fire({
    icon: "warning",
    title: "Delete this earner?",
    text: "This action cannot be undone.",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d"
  });

  if (!result.isConfirmed) return;

  data.splice(idx, 1);
  localStorage.setItem("earners", JSON.stringify(data));
  renderEarnerList();

  Swal.fire({
    icon: "success",
    title: "Deleted",
    text: "Earner record has been deleted successfully.",
    timer: 1500,
    showConfirmButton: false
  });
};

// View modal
window.viewEarner = function (idx) {
  const data = JSON.parse(localStorage.getItem("earners") || "[]");
  if (!data[idx]) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Record not found."
    });
    return;
  }

  const e = data[idx];
  const profileId = e.id || e["id"] || "";
  const fullName = `${e.firstName || ""} ${e.lastName || ""}`.trim();
  const email = e.email || "";
  const contact = e.mobile || "";
  const company = e.orgName || "";
  const address = e.orgLocation || "";
  const issuer = e.issuerName || "";

  // ✅ Get badges
  const earnedBadges = Array.isArray(e.badges) ? e.badges : [];

  // ✅ Get all badge details from issuerHome cache
  const masterBadges = JSON.parse(localStorage.getItem("issuerBadges") || "[]");

  // ✅ Build badge display HTML
  let badgeHtml = "—";
  if (earnedBadges.length > 0) {
    badgeHtml = `
    <div class="d-flex flex-wrap gap-3">
      ${earnedBadges.map((b) => {
      const match = masterBadges.find(m => String(m.id) === String(b.id));
      const img = match?.image || "";
      const name = match?.name || b.name || "Unknown Badge";
      // ✅ Random paid/unpaid label
      const status = Math.random() < 0.5 ? "Paid" : "Unpaid";
      const statusColor = status === "Paid" ? "green" : "red";

      return `
          <div class="badgeCard position-relative text-center p-2" 
               style="width:140px; border:1px solid #ddd; border-radius:8px; background:white;">
               <!-- ✅ Paid/Unpaid Label -->
              <div class="fw-semibold" style="font-size:13px; color:${statusColor}; margin-bottom:4px;">
                ${status}
              </div>
            <div class="badgeImgContainer position-relative" style="width:100%; height:100px;">
              <img src="${img}" alt="${name}" 
                   style="width:100%; height:100%; object-fit:contain; border-radius:6px;">
              
              <i class="fa-solid fa-repeat text-primary resendBadge position-absolute" 
                 data-badgeid="${b.id}"
                 title="Resend Badge"
                 style="
                   right: 0px;
                   top: -12px;
                   font-size:18px; 
                   cursor:pointer; 
                   display:none;
                 ">
              </i>
            </div>
            <div class="fw-semibold mt-2" style="font-size:14px;">${b.id}</div>
            <div class="text-muted" style="font-size:13px;">${name}</div>
          </div>
        `;
    }).join("")}
    </div>
  `;
  }


  const body = document.getElementById("earnerDetailsBody");
  if (!body) return;

  body.innerHTML = `
      <tr><td class="bg-info text-white fw-semibold" style="width:30%;">Full Name</td><td>${escapeHtml(fullName)}</td></tr>
      <tr><td class="bg-info text-white fw-semibold">Email</td><td>${escapeHtml(email)}</td></tr>
      <tr><td class="bg-info text-white fw-semibold">Mobile Number</td><td>${escapeHtml(contact)}</td></tr>
      <tr><td class="bg-info text-white fw-semibold">Organization / Company</td><td>${escapeHtml(company)}</td></tr>
      <tr><td class="bg-info text-white fw-semibold">Address</td><td>${escapeHtml(address)}</td></tr>
      <tr><td class="bg-info text-white fw-semibold">Issuer</td><td>${escapeHtml(issuer)}</td></tr>
      <tr>
        <td class="bg-info text-white fw-semibold">Badges</td>
        <td>${badgeHtml}</td>
      </tr>
  `;

  const modal = new bootstrap.Modal(document.getElementById("earnerViewModal"));
  modal.show();

  // ✅ Resend Event Handler
  setTimeout(() => {
    // resend button click action
    document.querySelectorAll(".resendBadge").forEach(btn => {
      btn.addEventListener("click", () => {
        Swal.fire({
          icon: "success",
          title: "Badge Resent",
          text: "Badge resent successfully.",
          timer: 2000,
          showConfirmButton: false
        });
      });
    });

    // Show resend icon on hover
    document.querySelectorAll(".badgeCard").forEach(card => {
      card.addEventListener("mouseenter", () => {
        const icon = card.querySelector(".resendBadge");
        if (icon) icon.style.display = "block";
      });
      card.addEventListener("mouseleave", () => {
        const icon = card.querySelector(".resendBadge");
        if (icon) icon.style.display = "none";
      });
    });

  }, 50);
};


// =========================
// Small HTML escape utility
// =========================
function escapeHtml(s) {
  return s.replace?.(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") ?? s;
}
