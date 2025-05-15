const phone = document.getElementById("phoneEl");
const password = document.getElementById("passwordEl");
const error = document.getElementById("error");
const success = document.getElementById("success");
const loadingSpinner = document.getElementById("loading");
const form = document.getElementById("formEl");

document.getElementById("formEl").addEventListener("submit", async (event) => {
  event.preventDefault();

  // Start loading state
  setLoading(true);

  try {
    if (!phone.value || !password.value) {
      showError("All fields are required");
      return;
    }

    // Basic phone validation
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(phone.value)) {
      showError("Invalid phone number format");
      return;
    }

    const data = {
      phone: phone.value,
      password: password.value,
    };

    const apiUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:3000/api/v1/auth/login"
        : window.location.origin + "/api/v1/auth/login";

    const response = await fetch(apiUrl, {
      method: "POST",
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
document.addEventListener('DOMContentLoaded', function() {
  const passwordToggle = document.querySelector('.password-toggle');
  const passwordInput = document.getElementById('passwordEl');

  passwordToggle.addEventListener('click', function() {
    // Toggle the eye icon
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
    
    // Toggle the password input type
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
  });
});
