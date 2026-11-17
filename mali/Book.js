/* =====================================================
   book.js - makes the Reserve A Table form work
   ===================================================== */

const form = document.getElementById("reserveForm");
const message = document.getElementById("formMessage");

/* ---------- 1. Don't allow dates in the past ---------- */
const dateInput = document.getElementById("datetime");
const now = new Date();
now.setMinutes(now.getMinutes() - now.getTimezoneOffset());   // fix timezone
dateInput.min = now.toISOString().slice(0, 16);               // "2026-10-19T14:30"

/* ---------- 2. Helpers to show / clear an error under a field ---------- */
function showError(input, text) {
  input.classList.add("has-error");
  input.nextElementSibling.textContent = text;   // the <p class="error"> right after the input
}
function clearError(input) {
  input.classList.remove("has-error");
  input.nextElementSibling.textContent = "";
}

/* ---------- 3. When the Submit button is clicked ---------- */
form.addEventListener("submit", function (event) {
  event.preventDefault();          // stop the page from refreshing
  message.textContent = "";

  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const guests = document.getElementById("guests");
  const datetime = document.getElementById("datetime");
  const type = document.getElementById("type");

  [name, email, phone, guests, datetime, type].forEach(clearError);
  let ok = true;

  // Check each field. If something is wrong, show a message and set ok = false
  if (name.value.trim().length < 2) {
    showError(name, "Please enter your name."); ok = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    showError(email, "Enter a valid email address."); ok = false;
  }
  if (!/^\+?\d{7,15}$/.test(phone.value.replace(/[\s-]/g, ""))) {
    showError(phone, "Enter a valid phone number."); ok = false;
  }
  if (guests.value < 1 || guests.value > 20) {
    showError(guests, "Guests must be between 1 and 20."); ok = false;
  }
  if (!datetime.value) {
    showError(datetime, "Choose a date and time."); ok = false;
  }
  if (!type.value) {
    showError(type, "Choose a reservation type."); ok = false;
  }

  if (!ok) return;                 // stop here if anything was wrong

  /* ---------- 4. Save the reservation in the browser ---------- */
  const reservations = JSON.parse(localStorage.getItem("reservations")) || [];
  reservations.push({
    name: name.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    guests: guests.value,
    datetime: datetime.value,
    type: type.value
  });
  localStorage.setItem("reservations", JSON.stringify(reservations));

  /* ---------- 5. Show a thank-you message and clear the form ---------- */
  message.textContent = "Thank you, " + name.value.trim() + "! Your table has been reserved.";
  form.reset();
});