const phone = document.getElementById("phoneEl");
const password = document.getElementById("passwordEl");
const error = document.getElementById("error");
const success = document.getElementById("success");
const loadingSpinner = document.getElementById("loading");
const form = document.getElementById("formEl");

document.getElementById("formEl").addEventListener("submit", async (event) => {
  event.preventDefault();

  const phoneValue = phone.value.trim();
  const passwordValue = password.value.trim();

  if (!phoneValue || !passwordValue) {
    showError("All fields are required");
    return;
  }

  const phoneRegex = /^\d{10,15}$/;
  if (!phoneRegex.test(phoneValue)) {
    showError("Invalid phone number format");
    return;
  }

  // Start loading state
  setLoading(true);

  try {

    const data = {
      phone: phoneValue,
      password: passwordValue,
    };

    const apiUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:4000/api/v1/auth/login"
        : window.location.origin + "/api/v1/auth/login";

    const response = await fetch(apiUrl, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      showError(result.error || "Login failed");
      return;
    }

    showSuccess(result.message || "Login successful");
    // Redirect to offers page
    setTimeout(() => {
      window.location.href = window.location.origin + "/offers.html";
    }, 1000);
  } catch (err) {
    console.error("Login error:", err);
    showError("An error occurred during login. Please try again.");
  } finally {
    // End loading state
    setLoading(false);
  }
});

const setLoading = (isLoading) => {
  const overlay = document.getElementById("loadingOverlay");
  const spinner = document.getElementById("loadingSpinner");

  overlay.style.display = isLoading ? "block" : "none";
  spinner.style.display = isLoading ? "block" : "none";
  form.classList.toggle("loading-form", isLoading);
};

const showError = (message) => {
  error.innerHTML = `<p>${sanitize(message)}</p>`;
  error.style.opacity = "1";
  setTimeout(() => (error.style.opacity = "0"), 3000);
};

const showSuccess = (message) => {
  success.innerHTML = `<p>${sanitize(message)}</p>`;
  success.style.opacity = "1";
  setTimeout(() => (success.style.opacity = "0"), 3000);
};

// Simple sanitizer to prevent injection
function sanitize(str) {
  const div = document.createElement("div");
  div.innerText = str;
  return div.innerHTML;
}

// Password eye toggle
document.addEventListener("DOMContentLoaded", () => {
  const passwordToggle = document.querySelector(".password-toggle");
  if (!passwordToggle) return;

  passwordToggle.addEventListener("click", () => {
    const type =
      password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);
    passwordToggle.classList.toggle("fa-eye");
    passwordToggle.classList.toggle("fa-eye-slash");
  });
});
