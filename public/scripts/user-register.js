const userName = document.getElementById("nameEl");
const phone = document.getElementById("phoneEl");
const password = document.getElementById("passwordEl");
const confirmPassword = document.getElementById("confirmPasswordEl");
const error = document.getElementById("error");
const success = document.getElementById("success");
const loadingSpinner = document.getElementById("loading");

document.getElementById("formEl").addEventListener("submit", async (event) => {
  event.preventDefault();

  // Start loading state
  setLoading(true);

  try {
    if (
      !userName.value ||
      !phone.value ||
      !password.value ||
      !confirmPassword.value
    ) {
      showError("All fields are required");
      return;
    }

    if (password.value !== confirmPassword.value) {
      showError("Passwords do not match");
      return;
    }

    // Basic phone validation
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(phone.value)) {
      showError("Invalid phone number format");
      return;
    }

    const data = {
      name: userName.value,
      phone: phone.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    };

    const apiUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:3000/api/v1/auth/register"
        : window.location.origin + "/api/v1/auth/register";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      showError(result.error);
      return;
    }

    showSuccess(result.message);
    // Redirect to offers page
    setTimeout(() => {
      window.location.href = "index.html";
    }, 3000);
  } catch (error) {
    console.error("Login error:", err);
    showError("An error occurred registration. Please try again.");
  } finally {
    // End loading state
    setLoading(false);
  }
});

const setLoading = (isLoading) => {
  const overlay = document.getElementById("loadingOverlay");
  const spinner = document.getElementById("loadingSpinner");
  const form = document.getElementById("formEl");

  if (isLoading) {
    overlay.style.display = "block";
    spinner.style.display = "block";
    form.classList.add("loading-form");
  } else {
    overlay.style.display = "none";
    spinner.style.display = "none";
    form.classList.remove("loading-form");
  }
};

const showError = (message) => {
  error.innerHTML = `<p>${message}</p>`;
  error.style.opacity = "1";

  setTimeout(() => {
    error.style.opacity = "0";
  }, 3000);
};

const showSuccess = (message) => {
  success.innerHTML = `<p>${message}</p>`;
  success.style.opacity = "1";

  setTimeout(() => {
    success.style.opacity = "0";
  }, 3000);
};

// Functionality for password eye icon
document.addEventListener("DOMContentLoaded", function () {
  // Password field toggle
  const passwordToggle = document.querySelector(
    "#passwordEl + .password-toggle"
  );
  const passwordInput = document.getElementById("passwordEl");

  // Confirm password field toggle
  const confirmToggle = document.querySelector(
    "#confirmPasswordEl + .password-toggle"
  );
  const confirmPasswordInput = document.getElementById("confirmPasswordEl");

  // Password field handler
  passwordToggle.addEventListener("click", function () {
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
  });

  // Confirm password field handler
  confirmToggle.addEventListener("click", function () {
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
    const type = confirmPasswordInput.type === "password" ? "text" : "password";
    confirmPasswordInput.type = type;
  });
});
