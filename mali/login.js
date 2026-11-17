const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from refreshing

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // For now we check against one fixed account (practice only)
  if (email === "test@gmail.com" && password === "123456") {
    window.location.href = "Index.html"; // go to your website
  } else {
    message.textContent = "Wrong email or password";
  }
});