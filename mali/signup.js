const form = document.getElementById("signupForm");
const message = document.getElementById("message");

form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from refreshing

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  // 1. Check the password is long enough
  if (password.length < 6) {
    message.textContent = "Password must be at least 6 characters";
    return;
  }

  // 2. Check both passwords match
  if (password !== confirm) {
    message.textContent = "Passwords do not match";
    return;
  }

  // 3. Get the list of saved accounts (or an empty list if none yet)
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // 4. Check the email is not already used
  const exists = users.some(function (user) {
    return user.email === email;
  });
  if (exists) {
    message.textContent = "This email already has an account";
    return;
  }

  // 5. Save the new account
  users.push({ email: email, password: password });
  localStorage.setItem("users", JSON.stringify(users));

  // 6. Log them in and go into the website
  localStorage.setItem("loggedInUser", email);
  window.location.href = "index.html";
});