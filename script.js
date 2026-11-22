let records = JSON.parse(localStorage.getItem("studentPortfolio") || "[]");
let editingId = null;

const form = document.getElementById("activityForm");

function saveRecords() {
  localStorage.setItem("studentPortfolio", JSON.stringify(records));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function renderRecords() {
  const query = document.getElementById("search").value.trim().toLowerCase();
  const selectedCategory = document.getElementById("categoryFilter").value;
  const selectedStatus = document.getElementById("statusFilter").value;

  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.activity.toLowerCase().includes(query) ||
      record.organization.toLowerCase().includes(query);

    return matchesSearch &&
      (!selectedCategory || record.category === selectedCategory) &&
      (!selectedStatus || record.status === selectedStatus);
  });

  document.getElementById("activityList").innerHTML =
    filteredRecords.map(record => `
      <tr>
        <td>${escapeHTML(record.activity)}</td>
        <td>${escapeHTML(record.organization)}</td>
        <td>${escapeHTML(record.category)}</td>
        <td>${escapeHTML(record.date)}</td>
        <td>${record.hours}</td>
        <td>
          <span class="status ${escapeHTML(record.status)}">
            ${escapeHTML(record.status)}
          </span>
        </td>
        <td>
          <button class="row-button edit" type="button"
            onclick="editRecord(${record.id})">Edit</button>
          <button class="row-button delete" type="button"
            onclick="deleteRecord(${record.id})">Delete</button>
        </td>
      </tr>
    `).join("");

  document.getElementById("emptyMessage").hidden = filteredRecords.length > 0;
  document.getElementById("activityCount").textContent = records.length;
  document.getElementById("approvedCount").textContent =
    records.filter(record => record.status === "Approved").length;
  document.getElementById("hoursCount").textContent =
    records.reduce((total, record) => total + Number(record.hours), 0);
}

form.addEventListener("submit", event => {
  event.preventDefault();

  if (!form.reportValidity()) return;

  const record = {
    id: editingId || Date.now(),
    activity: document.getElementById("activity").value.trim(),
    organization: document.getElementById("organization").value.trim(),
    category: document.getElementById("category").value,
    date: document.getElementById("date").value,
    hours: Number(document.getElementById("hours").value),
    status: document.getElementById("status").value
  };

  if (!record.activity || !record.organization || record.hours <= 0) {
    document.getElementById("message").textContent =
      "Please enter valid information in all required fields.";
    return;
  }

  if (editingId) {
    records = records.map(item => item.id === editingId ? record : item);
    document.getElementById("message").textContent =
      "Record updated successfully.";
  } else {
    records.push(record);
    document.getElementById("message").textContent =
      "Record added successfully.";
  }

  editingId = null;
  form.reset();
  document.getElementById("formTitle").textContent = "Add Participation Record";
  saveRecords();
  renderRecords();
});

function editRecord(id) {
  const record = records.find(item => item.id === id);
  if (!record) return;

  editingId = id;
  document.getElementById("formTitle").textContent =
    "Update Participation Record";
  document.getElementById("activity").value = record.activity;
  document.getElementById("organization").value = record.organization;
  document.getElementById("category").value = record.category;
  document.getElementById("date").value = record.date;
  document.getElementById("hours").value = record.hours;
  document.getElementById("status").value = record.status;
  document.getElementById("message").textContent =
    "Edit the record and save your changes.";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteRecord(id) {
  if (!confirm("Delete this participation record?")) return;

  records = records.filter(record => record.id !== id);
  saveRecords();
  renderRecords();
  document.getElementById("message").textContent = "Record deleted.";
}

["search", "categoryFilter", "statusFilter"].forEach(id => {
  document.getElementById(id).addEventListener("input", renderRecords);
});

renderRecords();
