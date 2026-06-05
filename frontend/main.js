const API_BASE = window.APP_CONFIG?.API_BASE || "http://localhost:5000";

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

function isPublicPage() {
  const page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  return ["index.html", "login.html", "register.html"].includes(page);
}

function handleSessionExpired() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  if (!isPublicPage()) {
    showToast("Session expired, please login again", "error");
    window.location.href = "login.html";
  }
}

function getJsonHeaders() {
  return { "Content-Type": "application/json" };
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (token && isTokenExpired(token)) {
    handleSessionExpired();
    return getJsonHeaders();
  }
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function showToast(message, type = "success") {
  const el = document.createElement("div");
  el.textContent = message;
  const bg =
    type === "error"
      ? "#c0392b"
      : type === "success"
        ? "#27ae60"
        : "#2980b9";
  el.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 10000;
    padding: 12px 18px;
    border-radius: 8px;
    color: #fff;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.25);
    background: ${bg};
    max-width: min(90vw, 360px);
  `;
  document.body.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 3000);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function validatePassword(pw) {
  if (typeof pw !== "string" || pw.length < 8) return false;
  if (!/[A-Z]/.test(pw)) return false;
  if (!/[0-9]/.test(pw)) return false;
  if (!/[^A-Za-z0-9]/.test(pw)) return false;
  return true;
}

function getPasswordError(pw) {
  if (typeof pw !== "string" || !pw) {
    return "Password is required.";
  }
  if (pw.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!/[A-Z]/.test(pw)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[0-9]/.test(pw)) {
    return "Password must contain at least one number.";
  }
  if (!/[^A-Za-z0-9]/.test(pw)) {
    return "Password must contain at least one special character.";
  }
  return "";
}

function normalizePhoneDigits(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function validatePhone(phone) {
  const d = normalizePhoneDigits(phone);
  return /^[6-9]\d{9}$/.test(d);
}

function getPhoneError(phone) {
  const d = normalizePhoneDigits(phone);
  if (!d) {
    return "Phone number is required.";
  }
  if (d.length !== 10) {
    return "Enter a valid 10-digit Indian mobile number.";
  }
  if (!/^[6-9]/.test(d)) {
    return "Indian mobile numbers must start with 6, 7, 8, or 9.";
  }
  if (!validatePhone(phone)) {
    return "Enter a valid 10-digit Indian mobile number.";
  }
  return "";
}

function validateAppointmentTime(time) {
  return /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(
    String(time || "").trim()
  );
}

function setBtnLoading(btn, loading, loadingText = "Loading...") {
  if (!btn) return;
  if (loading) {
    if (!btn.dataset.originalDisabled) {
      btn.dataset.originalDisabled = btn.disabled ? "1" : "0";
    }
    btn.dataset.originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = `⏳ ${loadingText}`;
  } else {
    btn.disabled = btn.dataset.originalDisabled === "1";
    delete btn.dataset.originalDisabled;
    if (btn.dataset.originalText !== undefined) {
      btn.textContent = btn.dataset.originalText;
      delete btn.dataset.originalText;
    }
  }
}

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

window.logout = logout;

function getDashboardUrl(role) {
  if (role === "patient") return "patient.html";
  if (role === "doctor") return "doctor.html";
  if (role === "admin") return "admin.html";
  return "login.html";
}

function updateHomeNav() {
  const authWrap = document.querySelector(".auth-buttons");
  if (!authWrap) return;

  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  let user = null;
  try {
    if (userStr && token) user = JSON.parse(userStr);
  } catch {
    user = null;
  }

  if (user && token) {
    authWrap.innerHTML = `
      <button type="button" class="sign-in" id="dashboardBtn">Go to Dashboard</button>
    `;
    document.getElementById("dashboardBtn")?.addEventListener("click", () => {
      window.location.href = getDashboardUrl(user.role);
    });
  }
}

async function fetchDoctorsForSelect(selectEl) {
  const res = await fetch(`${API_BASE}/api/appointments/doctors`, {
    headers: getAuthHeaders(),
  });
  const list = await res.json();
  selectEl.innerHTML =
    '<option value="">Select Doctor</option>' +
    list
      .map(
        (d) =>
          `<option value="${escapeHtml(d.fullname)}">${escapeHtml(d.fullname)}</option>`
      )
      .join("");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showEl(el) {
  if (el) el.classList.remove("hidden");
}

function hideEl(el) {
  if (el) el.classList.add("hidden");
}

async function openBookAppointmentModal(user) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal-card">
      <h2>Book Appointment</h2>
      <form id="appointmentForm">
        <label>Doctor</label>
        <select name="doctorName" required></select>
        <label>Date</label>
        <input type="date" name="appointmentDate" required />
        <label>Time</label>
        <select name="appointmentTime" required>
          <option value="">Select Time</option>
          <option value="09:00 AM">09:00 AM</option>
          <option value="10:00 AM">10:00 AM</option>
          <option value="11:00 AM">11:00 AM</option>
          <option value="02:00 PM">02:00 PM</option>
          <option value="03:00 PM">03:00 PM</option>
          <option value="04:00 PM">04:00 PM</option>
        </select>
        <label>Reason for Visit</label>
        <textarea name="reason" required rows="3"></textarea>
        <div class="modal-actions">
          <button type="submit" id="bookSubmitBtn" class="btn-primary">Book Appointment</button>
          <button type="button" id="cancelModal" class="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  const sel = modal.querySelector('select[name="doctorName"]');
  const form = modal.querySelector("#appointmentForm");
  const submitBtn = modal.querySelector("#bookSubmitBtn");
  const cancelBtn = modal.querySelector("#cancelModal");

  const closeModal = () => {
    form.removeEventListener("submit", onSubmit);
    cancelBtn.removeEventListener("click", onCancel);
    if (modal.parentNode) {
      document.body.removeChild(modal);
    }
  };

  const onCancel = () => closeModal();

  const onSubmit = async (e) => {
    e.preventDefault();
    const appointmentData = {
      patientName: user.fullname,
      patientEmail: user.email,
      doctorName: form.doctorName.value,
      appointmentDate: form.appointmentDate.value,
      appointmentTime: form.appointmentTime.value,
      reason: form.reason.value,
    };

    if (!validateAppointmentTime(appointmentData.appointmentTime)) {
      showToast(
        "Appointment time must be in HH:MM AM/PM format (e.g. 09:00 AM).",
        "error"
      );
      return;
    }

    setBtnLoading(submitBtn, true);
    try {
      const response = await fetch(`${API_BASE}/api/appointments/book`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(appointmentData),
      });
      const result = await response.json();
      if (response.ok) {
        showToast("Appointment booked successfully!", "success");
        closeModal();
        location.reload();
      } else {
        showToast(result.message || "Booking failed", "error");
      }
    } catch {
      showToast("Error connecting to server.", "error");
    } finally {
      setBtnLoading(submitBtn, false);
    }
  };

  try {
    await fetchDoctorsForSelect(sel);
  } catch {
    showToast("Could not load doctors.", "error");
    closeModal();
    return;
  }

  form.addEventListener("submit", onSubmit);
  cancelBtn.addEventListener("click", onCancel);
}

async function cancelAppointment(id, reload = true) {
  try {
    const response = await fetch(
      `${API_BASE}/api/appointments/cancel/${encodeURIComponent(id)}`,
      { method: "DELETE", headers: getAuthHeaders() }
    );
    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      showToast("Appointment cancelled.", "success");
      if (reload) location.reload();
    } else {
      showToast(result.message || "Could not cancel appointment", "error");
    }
  } catch {
    showToast("Error connecting to server.", "error");
  }
}

function initPatientPage() {
  const user = checkRole("patient");
  if (!user) return;

  const nameEl = document.getElementById("patientName");
  if (nameEl) nameEl.textContent = user.fullname;

  async function load() {
    let activeUser = user;
    try {
      const userResponse = await fetch(
        `${API_BASE}/api/auth/users/id/${user._id}`,
        { headers: getAuthHeaders() }
      );
      if (userResponse.ok) {
        const latestUser = await userResponse.json();
        localStorage.setItem("user", JSON.stringify(latestUser));
        activeUser = latestUser;
        if (nameEl) nameEl.textContent = latestUser.fullname;
        const profileEl = document.getElementById("profileInfo");
        if (profileEl) {
          profileEl.innerHTML = `
            <p><strong>Name:</strong> ${escapeHtml(latestUser.fullname)}</p>
            <p><strong>Email:</strong> ${escapeHtml(latestUser.email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(latestUser.phone || "N/A")}</p>
            <p><strong>Role:</strong> ${escapeHtml(latestUser.role)}</p>
          `;
        }
      }
    } catch {
      /* keep cached user */
    }

    const profileEl = document.getElementById("profileInfo");
    if (profileEl && !profileEl.querySelector("strong")) {
      profileEl.innerHTML = `
        <p><strong>Name:</strong> ${escapeHtml(activeUser.fullname)}</p>
        <p><strong>Email:</strong> ${escapeHtml(activeUser.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(activeUser.phone || "N/A")}</p>
        <p><strong>Role:</strong> ${escapeHtml(activeUser.role)}</p>
      `;
    }

    try {
      const aptResponse = await fetch(
        `${API_BASE}/api/appointments/patient/${encodeURIComponent(activeUser.email)}`,
        { headers: getAuthHeaders() }
      );
      const appointments = aptResponse.ok ? await aptResponse.json() : [];

      const nextAppointmentDiv = document.getElementById("nextAppointment");
      if (nextAppointmentDiv) {
        if (appointments.length > 0) {
          const upcoming = appointments
            .filter((apt) => new Date(apt.appointmentDate) >= new Date())
            .sort(
              (a, b) =>
                new Date(a.appointmentDate) - new Date(b.appointmentDate)
            )[0];
          if (upcoming) {
            const date = new Date(upcoming.appointmentDate).toLocaleDateString();
            nextAppointmentDiv.innerHTML = `
              <p><strong>${escapeHtml(date)}</strong> - ${escapeHtml(upcoming.appointmentTime)}</p>
              <p>With: ${escapeHtml(upcoming.doctorName)}</p>
              <p>Reason: ${escapeHtml(upcoming.reason)}</p>
              <p>Status: ${escapeHtml(upcoming.status || "scheduled")}</p>
            `;
          } else {
            nextAppointmentDiv.innerHTML = "<p>No upcoming appointments.</p>";
          }
        } else {
          nextAppointmentDiv.innerHTML = "<p>No appointments scheduled.</p>";
        }
      }

      const allAppointmentsDiv = document.getElementById("allAppointments");
      if (allAppointmentsDiv) {
        if (appointments.length === 0) {
          allAppointmentsDiv.innerHTML =
            "<p>No appointments yet.</p>";
        } else {
          const rows = appointments
            .map((apt) => {
              const date = new Date(apt.appointmentDate).toLocaleDateString();
              const st = (apt.status || "scheduled").toLowerCase();
              const canCancel =
                st === "scheduled" || st === "rescheduled";
              const cancelBtn = canCancel
                ? `<button type="button" class="btn-danger btn-sm cancel-apt-btn" data-id="${escapeHtml(apt._id)}">Cancel</button>`
                : "";
              return `<tr>
                <td>${escapeHtml(apt.doctorName)}</td>
                <td>${escapeHtml(date)}</td>
                <td>${escapeHtml(apt.appointmentTime)}</td>
                <td>${escapeHtml(apt.reason)}</td>
                <td>${escapeHtml(apt.status || "scheduled")}</td>
                <td>${cancelBtn}</td>
              </tr>`;
            })
            .join("");
          allAppointmentsDiv.innerHTML = `
            <div class="table-wrap"><table class="dash-table">
              <thead><tr>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table></div>`;
          allAppointmentsDiv.querySelectorAll(".cancel-apt-btn").forEach((btn) => {
            btn.addEventListener("click", () =>
              cancelAppointment(btn.dataset.id, true)
            );
          });
        }
      }

      const presResponse = await fetch(
        `${API_BASE}/api/prescriptions/${encodeURIComponent(activeUser.fullname)}`,
        { headers: getAuthHeaders() }
      );
      const prescriptions = presResponse.ok ? await presResponse.json() : [];

      const prescriptionsList = document.getElementById("prescriptionsList");
      if (prescriptionsList) {
        if (prescriptions.length > 0) {
          prescriptionsList.innerHTML = "";
          prescriptions.slice(0, 5).forEach((p) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${escapeHtml(p.medication)}</strong> - ${escapeHtml(p.dosage)}`;
            prescriptionsList.appendChild(li);
          });
        } else {
          prescriptionsList.innerHTML = "<li>No prescriptions found.</li>";
        }
      }

      const prescriptionHistory = document.getElementById("prescriptionHistory");
      if (prescriptionHistory) {
        if (prescriptions.length === 0) {
          prescriptionHistory.innerHTML = "<p>No prescriptions yet.</p>";
        } else {
          const rows = prescriptions
            .map((p) => {
              const dt = p.createdAt
                ? new Date(p.createdAt).toLocaleDateString()
                : "";
              return `<tr>
                <td>${escapeHtml(p.medication)}</td>
                <td>${escapeHtml(p.dosage)}</td>
                <td>${escapeHtml(p.notes || "—")}</td>
                <td>${escapeHtml(p.createdBy)}</td>
                <td>${escapeHtml(dt)}</td>
              </tr>`;
            })
            .join("");
          prescriptionHistory.innerHTML = `
            <div class="table-wrap"><table class="dash-table">
              <thead><tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Notes</th>
                <th>Doctor</th>
                <th>Date</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table></div>`;
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load dashboard data.", "error");
    }
  }

  load();

  const bookBtn = document.querySelector(".btn-book, .btn_book");
  if (bookBtn) {
    bookBtn.addEventListener("click", async () => {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (!u.email) {
        showToast("Please login first.", "error");
        window.location.href = "login.html";
        return;
      }
      await openBookAppointmentModal(u);
    });
  }
}

async function updateAppointmentStatus(id, status) {
  try {
    const response = await fetch(
      `${API_BASE}/api/appointments/update/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      }
    );
    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      showToast("Appointment updated.", "success");
      location.reload();
    } else {
      showToast(result.message || "Update failed", "error");
    }
  } catch {
    showToast("Error connecting to server.", "error");
  }
}

function initDoctorPage() {
  const user = checkRole("doctor");
  if (!user) return;

  const createdByField = document.getElementById("prescriptionCreatedBy");
  if (createdByField) createdByField.value = user.fullname || "";

  const welcomeTitle = document.getElementById("welcomeTitle");
  if (welcomeTitle) welcomeTitle.textContent = `Welcome, ${user.fullname}`;

  async function load() {
    let activeDoctor = user;
    try {
      const doctorResponse = await fetch(
        `${API_BASE}/api/auth/users/id/${user._id}`,
        { headers: getAuthHeaders() }
      );
      if (doctorResponse.ok) {
        const latestDoctor = await doctorResponse.json();
        localStorage.setItem("user", JSON.stringify(latestDoctor));
        activeDoctor = latestDoctor;
        if (createdByField) createdByField.value = latestDoctor.fullname || "";
        if (welcomeTitle)
          welcomeTitle.textContent = `Welcome, ${latestDoctor.fullname}`;
      }
    } catch {
      /* ignore */
    }

    const dn = encodeURIComponent(activeDoctor.fullname);

    try {
      const aptResponse = await fetch(
        `${API_BASE}/api/appointments/doctor/${dn}`,
        { headers: getAuthHeaders() }
      );
      const doctorAppointments = aptResponse.ok ? await aptResponse.json() : [];

      const appointmentsList = document.getElementById("appointmentsList");
      if (appointmentsList) {
        if (doctorAppointments.length === 0) {
          appointmentsList.innerHTML =
            '<li>No appointments scheduled.</li>';
        } else {
          appointmentsList.innerHTML = "";
          const wrap = document.createElement("div");
          wrap.className = "table-wrap";
          const tbl = document.createElement("table");
          tbl.className = "dash-table";
          tbl.innerHTML = `
            <thead><tr>
              <th>Patient</th>
              <th>Email</th>
              <th>Date</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr></thead><tbody></tbody>`;
          const tbody = tbl.querySelector("tbody");
          doctorAppointments.forEach((apt) => {
            const date = new Date(apt.appointmentDate).toLocaleDateString();
            const tr = document.createElement("tr");
            const st = (apt.status || "scheduled").toLowerCase();
            const viewBtn = `<button type="button" class="btn-primary btn-sm view-patient-btn" data-patient="${escapeHtml(apt.patientName)}">View</button>`;
            const statusActions =
              st === "scheduled" || st === "rescheduled"
                ? ` <button type="button" class="btn-primary btn-sm apt-complete" data-id="${escapeHtml(apt._id)}">Completed</button>
                   <button type="button" class="btn-danger btn-sm apt-cancel" data-id="${escapeHtml(apt._id)}">Cancelled</button>`
                : "";
            tr.innerHTML = `
              <td>${escapeHtml(apt.patientName)}</td>
              <td>${escapeHtml(apt.patientEmail)}</td>
              <td>${escapeHtml(date)}</td>
              <td>${escapeHtml(apt.appointmentTime)}</td>
              <td>${escapeHtml(apt.reason)}</td>
              <td>${escapeHtml(apt.status || "scheduled")}</td>
              <td>${viewBtn}${statusActions}</td>`;
            tbody.appendChild(tr);
          });
          wrap.appendChild(tbl);
          appointmentsList.appendChild(wrap);

          appointmentsList.querySelectorAll(".apt-complete").forEach((btn) => {
            btn.addEventListener("click", () =>
              updateAppointmentStatus(btn.dataset.id, "completed")
            );
          });
          appointmentsList.querySelectorAll(".apt-cancel").forEach((btn) => {
            btn.addEventListener("click", () =>
              updateAppointmentStatus(btn.dataset.id, "cancelled")
            );
          });
        }
      }

      const presResponse = await fetch(
        `${API_BASE}/api/prescriptions/doctor/${dn}`,
        { headers: getAuthHeaders() }
      );
      const myPrescriptions = presResponse.ok ? await presResponse.json() : [];

      const rxHost = document.getElementById("doctorPrescriptionsTable");
      if (rxHost) {
        if (myPrescriptions.length === 0) {
          rxHost.innerHTML = "<p>No prescriptions yet.</p>";
        } else {
          const rows = myPrescriptions
            .map((p) => {
              const dt = p.createdAt
                ? new Date(p.createdAt).toLocaleDateString()
                : "";
              return `<tr data-id="${escapeHtml(p._id)}">
                <td>${escapeHtml(p.patientName)}</td>
                <td>${escapeHtml(p.medication)}</td>
                <td>${escapeHtml(p.dosage)}</td>
                <td>${escapeHtml(p.notes || "—")}</td>
                <td>${escapeHtml(dt)}</td>
                <td>
                   <button type="button" class="btn-primary btn-sm doc-edit-rx" data-id="${escapeHtml(p._id)}" data-med="${escapeHtml(p.medication)}" data-dosage="${escapeHtml(p.dosage)}" data-notes="${escapeHtml(p.notes || "")}" data-patient="${escapeHtml(p.patientName)}">Edit</button>
                  <button type="button" class="btn-danger btn-sm doc-delete-rx" data-id="${escapeHtml(p._id)}">Delete</button>
                </td>
              </tr>`;
            })
            .join("");
          rxHost.innerHTML = `
            <div class="table-wrap"><table class="dash-table">
              <thead><tr>
                <th>Patient</th>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Notes</th>
                <th>Date</th>
                <th>Actions</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table></div>`;

          rxHost.querySelectorAll(".doc-delete-rx").forEach((btn) => {
            btn.addEventListener("click", async () => {
              setBtnLoading(btn, true, "...");
              try {
                const res = await fetch(
                  `${API_BASE}/api/prescriptions/delete/${btn.dataset.id}`,
                  { method: "DELETE", headers: getAuthHeaders() }
                );
                if (res.ok) {
                  showToast("Prescription deleted.", "success");
                  location.reload();
                } else {
                  const j = await res.json().catch(() => ({}));
                  showToast(j.message || "Delete failed", "error");
                }
              } catch {
                showToast("Error connecting to server.", "error");
              } finally {
                setBtnLoading(btn, false);
              }
            });
          });

          rxHost.querySelectorAll(".doc-edit-rx").forEach((btn) => {
            btn.addEventListener("click", () => {
              document.getElementById("editPrescriptionId").value =
                btn.dataset.id;
              document.getElementById("editMedication").value =
                btn.dataset.med || "";
              document.getElementById("editDosage").value =
                btn.dataset.dosage || "";
              document.getElementById("editNotes").value =
                btn.dataset.notes || "";
              document.getElementById("editPatientName").value =
                btn.dataset.patient || "";
              const patientLabel = document.getElementById("editPrescriptionPatient");
              if (patientLabel) patientLabel.textContent = `Patient: ${btn.dataset.patient || ""}`;
              const card = document.getElementById("editPrescriptionCard");
              showEl(card);
              card.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          });
        }
      }

      const usersResponse = await fetch(
        `${API_BASE}/api/auth/users/role/patient`,
        { headers: getAuthHeaders() }
      );
      const patients = usersResponse.ok ? await usersResponse.json() : [];

      const patientsList = document.getElementById("patientsList");
      if (patientsList) {
        if (patients.length === 0) {
          patientsList.innerHTML = "<p>No patients registered.</p>";
        } else {
          patientsList.innerHTML = "";
          patients.forEach((p) => {
            const div = document.createElement("div");
            div.className = "patient-row";
            div.innerHTML = `<strong>${escapeHtml(p.fullname)}</strong> - ${escapeHtml(p.email)} | ${escapeHtml(p.phone || "N/A")}`;
            patientsList.appendChild(div);
          });
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load doctor dashboard.", "error");
    }
  }

  load();

  const prescriptionForm = document.getElementById("prescriptionForm");
  if (prescriptionForm) {
    prescriptionForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = document.getElementById("prescriptionStatus");
      const submitBtn = prescriptionForm.querySelector('button[type="submit"]');
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      const prescription = {
        patientName: prescriptionForm.patientName.value.trim(),
        medication: prescriptionForm.medication.value.trim(),
        dosage: prescriptionForm.dosage.value.trim(),
        notes: prescriptionForm.notes?.value.trim() || "",
        createdBy: u.fullname,
      };
      if (
        !prescription.patientName ||
        !prescription.medication ||
        !prescription.dosage
      ) {
        showToast("Please fill all prescription fields.", "error");
        return;
      }
      setBtnLoading(submitBtn, true);
      try {
        const response = await fetch(`${API_BASE}/api/prescriptions/add`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(prescription),
        });
        const result = await response.json();
        if (response.ok) {
          showToast("Prescription added.", "success");
          prescriptionForm.reset();
          hideEl(prescriptionForm);
          showEl(document.getElementById("prescriptionCard"));
          if (status) status.textContent = "";
          location.reload();
        } else {
          if (status) {
            status.textContent = result.message || "Error";
            status.style.color = "red";
          }
          showToast(result.message || "Error saving prescription", "error");
        }
      } catch {
        if (status) {
          status.textContent = "Error connecting to server";
          status.style.color = "red";
        }
        showToast("Error connecting to server.", "error");
      } finally {
        setBtnLoading(submitBtn, false);
      }
    });
  }

  document.getElementById("searchPrescriptionBtn")?.addEventListener(
    "click",
    async () => {
      const patientName = document.getElementById("searchPatientName")?.value;
      const resultsDiv = document.getElementById("searchResults");
      const btn = document.getElementById("searchPrescriptionBtn");
      if (!patientName?.trim()) {
        if (resultsDiv)
          resultsDiv.innerHTML = "<p>Please enter a patient name.</p>";
        return;
      }
      setBtnLoading(btn, true);
      try {
        const response = await fetch(
          `${API_BASE}/api/prescriptions/${encodeURIComponent(patientName.trim())}`,
          { headers: getAuthHeaders() }
        );
        const prescriptions = await response.json();
        if (!resultsDiv) return;
        if (prescriptions.length === 0) {
          resultsDiv.innerHTML = "<p>No prescriptions found.</p>";
        } else {
          resultsDiv.innerHTML = "";
          prescriptions.forEach((p) => {
            const div = document.createElement("div");
            div.className = "search-result-item";
            div.innerHTML = `
              <strong>${escapeHtml(p.medication)}</strong> - ${escapeHtml(p.dosage)}<br>
              <span>${escapeHtml(p.notes || "")}</span><br>
              <small>${escapeHtml(p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "")}</small><br>
              <button type="button" class="btn-primary btn-sm edit-pres-btn" data-id="${escapeHtml(p._id)}" data-med="${escapeHtml(p.medication)}" data-dosage="${escapeHtml(p.dosage)}" data-notes="${escapeHtml(p.notes || "")}" data-patient="${escapeHtml(p.patientName)}">Edit</button>
              <button type="button" class="btn-danger btn-sm delete-pres-btn" data-id="${escapeHtml(p._id)}">Delete</button>`;
            resultsDiv.appendChild(div);
          });
        }
      } catch {
        if (resultsDiv) resultsDiv.innerHTML = "<p>Error searching.</p>";
      } finally {
        setBtnLoading(btn, false);
      }
    }
  );

  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("view-patient-btn")) {
      const patientName = e.target.getAttribute("data-patient") || "";
      const sp = document.getElementById("searchPatientName");
      if (sp) sp.value = patientName;
      document.getElementById("searchPrescriptionBtn")?.click();
    }

    if (e.target.classList.contains("edit-pres-btn")) {
      document.getElementById("editPrescriptionId").value =
        e.target.dataset.id;
      document.getElementById("editMedication").value =
        e.target.dataset.med || "";
      document.getElementById("editDosage").value = e.target.dataset.dosage || "";
      document.getElementById("editNotes").value = e.target.dataset.notes || "";
      document.getElementById("editPatientName").value =
        e.target.dataset.patient || "";
      const patientLabel = document.getElementById("editPrescriptionPatient");
      if (patientLabel) patientLabel.textContent = `Patient: ${e.target.dataset.patient || ""}`;
      const sr = document.getElementById("searchResults");
      hideEl(sr);
      const card = document.getElementById("editPrescriptionCard");
      showEl(card);
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (e.target.classList.contains("delete-pres-btn")) {
      const id = e.target.dataset.id;
      const btn = e.target;
      setBtnLoading(btn, true, "...");
      try {
        const response = await fetch(
          `${API_BASE}/api/prescriptions/delete/${id}`,
          { method: "DELETE", headers: getAuthHeaders() }
        );
        if (response.ok) {
          showToast("Deleted.", "success");
          document.getElementById("searchPrescriptionBtn")?.click();
        } else {
          const j = await response.json().catch(() => ({}));
          showToast(j.message || "Delete failed", "error");
        }
      } catch {
        showToast("Error connecting to server.", "error");
      } finally {
        setBtnLoading(btn, false);
      }
    }

    if (e.target.id === "cancelEditBtn") {
      hideEl(document.getElementById("editPrescriptionCard"));
      showEl(document.getElementById("searchResults"));
    }
  });

  document.getElementById("editPrescriptionForm")?.addEventListener(
    "submit",
    async (e) => {
      e.preventDefault();
      const id = document.getElementById("editPrescriptionId").value;
      const status = document.getElementById("editPrescriptionStatus");
      const submitBtn = e.target.querySelector('button[type="submit"]');
      setBtnLoading(submitBtn, true);
      try {
        const response = await fetch(
          `${API_BASE}/api/prescriptions/update/${id}`,
          {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              medication: document.getElementById("editMedication").value,
              dosage: document.getElementById("editDosage").value,
              notes: document.getElementById("editNotes").value,
            }),
          }
        );
        if (response.ok) {
          showToast("Prescription updated.", "success");
          setTimeout(() => location.reload(), 500);
        } else {
          const j = await response.json().catch(() => ({}));
          if (status) {
            status.textContent = j.message || "Error";
            status.style.color = "red";
          }
          showToast(j.message || "Update failed", "error");
        }
      } catch {
        if (status) status.textContent = "Error";
        showToast("Error connecting to server.", "error");
      } finally {
        setBtnLoading(submitBtn, false);
      }
    }
  );

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("update")) {
      const patientName = e.target.dataset.patient;
      const card = document.getElementById("prescriptionCard");
      const form = document.getElementById("prescriptionForm");
      hideEl(card);
      if (form) {
        showEl(form);
        form.patientName.value = patientName || "";
        form.medication.value = "";
        form.dosage.value = "";
        if (form.notes) form.notes.value = "";
      }
    }
  });
}

function initAdminPage() {
  const user = checkRole("admin");
  if (!user) return;

  const adminNameEl = document.getElementById("adminName");
  if (adminNameEl) adminNameEl.textContent = user.fullname;

  const editDialog = document.getElementById("editUserDialog");
  const editForm = document.getElementById("editUserForm");
  const createAdminDialog = document.getElementById("createAdminDialog");
  const createAdminForm = document.getElementById("createAdminForm");

  async function load() {
    try {
      const adminResponse = await fetch(
        `${API_BASE}/api/auth/users/id/${user._id}`,
        { headers: getAuthHeaders() }
      );
      if (adminResponse.ok) {
        const latestAdmin = await adminResponse.json();
        localStorage.setItem("user", JSON.stringify(latestAdmin));
        if (adminNameEl) adminNameEl.textContent = latestAdmin.fullname;
      }

      const response = await fetch(`${API_BASE}/api/auth/users`, {
        headers: getAuthHeaders(),
      });
      if (response.status === 401 || response.status === 403) {
        showToast("Session expired. Please login again.", "error");
        logout();
        return;
      }
      const users = await response.json();

      const patients = users.filter((u) => u.role === "patient").length;
      const doctors = users.filter((u) => u.role === "doctor").length;
      const admins = users.filter((u) => u.role === "admin").length;
      const userStats = document.getElementById("userStats");
      if (userStats) {
        userStats.textContent = `Patients: ${patients} | Doctors: ${doctors} | Admins: ${admins}`;
      }
      const recentActivity = document.getElementById("recentActivity");
      if (recentActivity) {
        recentActivity.textContent = `Total registered users: ${users.length}`;
      }

      const usersList = document.getElementById("usersList");
      if (usersList) {
        usersList.innerHTML = `
          <div class="table-wrap"><table class="dash-table">
            <thead><tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr></thead>
            <tbody>
              ${users
                .map(
                  (u) => `
                <tr>
                  <td>${escapeHtml(u.fullname)}</td>
                  <td>${escapeHtml(u.email)}</td>
                  <td>${escapeHtml(u.phone || "N/A")}</td>
                  <td>${escapeHtml(u.role)}</td>
                  <td>
                    <button type="button" class="btn-primary btn-sm edit-user" data-id="${escapeHtml(u._id)}">Edit</button>
                    <button type="button" class="btn-danger btn-sm delete-user" data-id="${escapeHtml(u._id)}">Delete</button>
                  </td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table></div>`;
      }

      const aptRes = await fetch(`${API_BASE}/api/appointments/all`, {
        headers: getAuthHeaders(),
      });
      const appointments = aptRes.ok ? await aptRes.json() : [];
      const adminApts = document.getElementById("adminAppointmentsTable");
      if (adminApts) {
        if (appointments.length === 0) {
          adminApts.innerHTML = "<p>No appointments.</p>";
        } else {
          adminApts.innerHTML = `
            <div class="table-wrap"><table class="dash-table">
              <thead><tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
              </tr></thead>
              <tbody>
                ${appointments
                  .map((a) => {
                    const d = new Date(a.appointmentDate).toLocaleDateString();
                    return `<tr>
                      <td>${escapeHtml(a.patientName)}</td>
                      <td>${escapeHtml(a.doctorName)}</td>
                      <td>${escapeHtml(d)}</td>
                      <td>${escapeHtml(a.appointmentTime)}</td>
                      <td>${escapeHtml(a.reason)}</td>
                      <td>${escapeHtml(a.status || "scheduled")}</td>
                    </tr>`;
                  })
                  .join("")}
              </tbody>
            </table></div>`;
        }
      }

      const rxRes = await fetch(`${API_BASE}/api/prescriptions/all`, {
        headers: getAuthHeaders(),
      });
      const rx = rxRes.ok ? await rxRes.json() : [];
      const adminRx = document.getElementById("adminPrescriptionsTable");
      if (adminRx) {
        if (rx.length === 0) {
          adminRx.innerHTML = "<p>No prescriptions.</p>";
        } else {
          adminRx.innerHTML = `
            <div class="table-wrap"><table class="dash-table">
              <thead><tr>
                <th>Patient</th>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Notes</th>
                <th>Doctor</th>
                <th>Date</th>
              </tr></thead>
              <tbody>
                ${rx
                  .map((p) => {
                    const dt = p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString()
                      : "";
                    return `<tr>
                      <td>${escapeHtml(p.patientName)}</td>
                      <td>${escapeHtml(p.medication)}</td>
                      <td>${escapeHtml(p.dosage)}</td>
                      <td>${escapeHtml(p.notes || "—")}</td>
                      <td>${escapeHtml(p.createdBy)}</td>
                      <td>${escapeHtml(dt)}</td>
                    </tr>`;
                  })
                  .join("")}
              </tbody>
            </table></div>`;
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load admin data.", "error");
    }
  }

  load();

  document.getElementById("createAdminBtn")?.addEventListener("click", () => {
    createAdminDialog?.showModal();
  });

  document.getElementById("cancelCreateAdminBtn")?.addEventListener(
    "click",
    () => createAdminDialog?.close()
  );

  createAdminForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = createAdminForm.querySelector('button[type="submit"]');
    const fullname = createAdminForm.fullname.value.trim();
    const email = createAdminForm.email.value.trim();
    const phone = createAdminForm.phone.value.trim();
    const password = createAdminForm.password.value;

    const errEl = document.getElementById("createAdminError");
    if (errEl) errEl.textContent = "";

    if (!validateEmail(email)) {
      if (errEl) errEl.textContent = "Invalid email format.";
      return;
    }
    if (!validatePassword(password)) {
      if (errEl) errEl.textContent = getPasswordError(password);
      return;
    }
    if (!validatePhone(phone)) {
      if (errEl) errEl.textContent = getPhoneError(phone);
      return;
    }

    setBtnLoading(btn, true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fullname,
          email,
          phone: normalizePhoneDigits(phone),
          password,
          role: "admin",
        }),
      });
      const result = await response.json();
      if (response.ok) {
        showToast("Admin user created.", "success");
        createAdminDialog.close();
        createAdminForm.reset();
        load();
      } else {
        if (errEl) errEl.textContent = result.message || "Failed";
        showToast(result.message || "Failed to create admin", "error");
      }
    } catch {
      if (errEl) errEl.textContent = "Network error.";
      showToast("Error connecting to server.", "error");
    } finally {
      setBtnLoading(btn, false);
    }
  });

  document.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("edit-user")) return;

    const userId = e.target.dataset.id;
    try {
      const existingResponse = await fetch(
        `${API_BASE}/api/auth/users/id/${userId}`,
        { headers: getAuthHeaders() }
      );
      const existingUser = await existingResponse.json();
      if (!existingResponse.ok) {
        showToast(existingUser.message || "Failed to load user", "error");
        return;
      }
      editForm.fullname.value = existingUser.fullname || "";
      editForm.email.value = existingUser.email || "";
      editForm.phone.value = existingUser.phone || "";
      editForm.dataset.userId = userId;
      editDialog.showModal();
    } catch {
      showToast("Error loading user.", "error");
    }
  });

  editForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userId = editForm.dataset.userId;
    const btn = editForm.querySelector('button[type="submit"]');
    const fullname = editForm.fullname.value.trim();
    const email = editForm.email.value.trim();
    const phone = editForm.phone.value.trim();

    const errEl = document.getElementById("editUserError");
    if (errEl) errEl.textContent = "";

    if (!validateEmail(email)) {
      if (errEl) errEl.textContent = "Invalid email.";
      return;
    }
    if (!validatePhone(phone)) {
      if (errEl) errEl.textContent = getPhoneError(phone);
      return;
    }

    setBtnLoading(btn, true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/users/${userId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fullname,
          email,
          phone: normalizePhoneDigits(phone),
        }),
      });
      const result = await response.json();
      if (response.ok) {
        showToast("User updated.", "success");
        editDialog.close();
        load();
      } else {
        if (errEl) errEl.textContent = result.message || "Update failed";
        showToast(result.message || "Update failed", "error");
      }
    } catch {
      if (errEl) errEl.textContent = "Network error.";
      showToast("Error updating user.", "error");
    } finally {
      setBtnLoading(btn, false);
    }
  });

  document.getElementById("cancelEditUserBtn")?.addEventListener("click", () =>
    editDialog?.close()
  );

  document.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("delete-user")) return;
    const userId = e.target.dataset.id;
    const btn = e.target;
    setBtnLoading(btn, true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        showToast("User deleted.", "success");
        load();
      } else {
        showToast(result.message || "Delete failed", "error");
      }
    } catch {
      showToast("Error deleting user.", "error");
    } finally {
      setBtnLoading(btn, false);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop() || "index.html";
  const currentPage = path.toLowerCase();

  const hero = document.querySelector(".container_data");
  hero?.classList.add("fade-in");
  document
    .querySelector(".navbar")
    ?.style.setProperty("animation-play-state", "running");

  if (currentPage === "index.html") {
    updateHomeNav();
    document.getElementById("loginBtn")?.addEventListener("click", () => {
      window.location.href = "login.html";
    });
    document.getElementById("registerBtn")?.addEventListener("click", () => {
      window.location.href = "register.html";
    });
  }

  const registerForm = document.querySelector(".loginForm");
  if (registerForm && currentPage === "register.html") {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const errEl = document.getElementById("registerError");
      const okEl = document.getElementById("registerSuccess");
      const phoneErrEl = document.getElementById("phoneError");
      const passwordErrEl = document.getElementById("passwordError");
      if (errEl) errEl.textContent = "";
      if (okEl) okEl.textContent = "";
      if (phoneErrEl) phoneErrEl.textContent = "";
      if (passwordErrEl) passwordErrEl.textContent = "";

      const data = {
        fullname: registerForm.fullname.value.trim(),
        email: registerForm.email.value.trim(),
        phone: normalizePhoneDigits(registerForm.phone.value),
        password: registerForm.password.value,
        role: registerForm.role.value,
      };

      if (!data.fullname) {
        if (errEl) errEl.textContent = "Full name is required.";
        return;
      }
      if (!validateEmail(data.email)) {
        if (errEl) errEl.textContent = "Enter a valid email address.";
        return;
      }
      if (!validatePhone(registerForm.phone.value)) {
        const msg = getPhoneError(registerForm.phone.value);
        if (phoneErrEl) phoneErrEl.textContent = msg;
        return;
      }
      const passwordErr = getPasswordError(data.password);
      if (passwordErr) {
        if (passwordErrEl) passwordErrEl.textContent = passwordErr;
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      setBtnLoading(submitBtn, true);
      try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: getJsonHeaders(),
          body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok) {
          if (result.token) localStorage.setItem("token", result.token);
          if (result.user)
            localStorage.setItem("user", JSON.stringify(result.user));
          if (okEl) {
            okEl.style.color = "green";
            okEl.textContent =
              "Registration successful! Redirecting to login...";
          }
          setTimeout(() => {
            window.location.href = "login.html";
          }, 2000);
        } else {
          if (errEl) errEl.textContent = result.message || "Registration failed";
        }
      } catch {
        if (errEl) {
          errEl.textContent = `Cannot reach server at ${API_BASE}. Start the backend with: node backend/server.js`;
        }
      } finally {
        setBtnLoading(submitBtn, false);
      }
    });
  }

  if (currentPage === "login.html") {
    const loginBtn = document.getElementById("submit");
    const loginError = document.getElementById("loginError");
    const emailInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const roleInput = document.getElementById("role");

    function clearFieldErrors() {
      ["usernameError", "passwordError", "roleError"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
      });
      if (loginError) loginError.textContent = "";
    }

    loginBtn?.addEventListener("click", async () => {
      clearFieldErrors();
      const email = emailInput?.value.trim() || "";
      const password = passwordInput?.value || "";
      const role = roleInput?.value || "";

      let hasErr = false;
      if (!email) {
        const el = document.getElementById("usernameError");
        if (el) el.textContent = "Email is required.";
        hasErr = true;
      } else if (!validateEmail(email)) {
        const el = document.getElementById("usernameError");
        if (el) el.textContent = "Enter a valid email address.";
        hasErr = true;
      }
      if (!password) {
        const el = document.getElementById("passwordError");
        if (el) el.textContent = "Password is required.";
        hasErr = true;
      }
      if (!role) {
        const el = document.getElementById("roleError");
        if (el) el.textContent = "Select a role.";
        hasErr = true;
      }
      if (hasErr) return;

      setBtnLoading(loginBtn, true);
      try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: getJsonHeaders(),
          body: JSON.stringify({ email, password, role }),
        });

        const result = await response.json();
        if (response.ok) {
          if (result.token) localStorage.setItem("token", result.token);
          if (result.user)
            localStorage.setItem("user", JSON.stringify(result.user));

          if (role === "patient") window.location.href = "patient.html";
          else if (role === "doctor") window.location.href = "doctor.html";
          else window.location.href = "admin.html";
        } else {
          if (loginError) loginError.textContent = result.message || "Login failed";
        }
      } catch {
        if (loginError) {
          loginError.textContent = `Cannot reach server at ${API_BASE}. Start the backend with: node backend/server.js`;
        }
      } finally {
        setBtnLoading(loginBtn, false);
      }
    });
  }

  if (currentPage === "patient.html") {
    initPatientPage();
  }

  if (currentPage === "doctor.html") {
    initDoctorPage();
  }

  if (currentPage === "admin.html") {
    initAdminPage();
  }
});
