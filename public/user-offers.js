let allPlans = [];

const setLoading = (isLoading) => {
  const overlay = document.getElementById("loadingOverlay");
  const spinner = document.getElementById("loadingSpinner");

  if (isLoading) {
    overlay.style.display = "block";
    spinner.style.display = "block";
  } else {
    overlay.style.display = "none";
    spinner.style.display = "none";
  }
};

const showError = (message) => {
  const error = document.getElementById("error");
  error.innerHTML = `<p>${message}</p>`;
  error.style.opacity = "1";

  setTimeout(() => {
    error.style.opacity = "0";
  }, 3000);
};

const showSuccess = (message) => {
  const success = document.getElementById("success");
  success.innerHTML = `<p>${message}</p>`;
  success.style.opacity = "1";

  setTimeout(() => {
    success.style.opacity = "0";
  }, 3000);
};

const fetchOffers = async () => {
  setLoading(true);
  try {
    const apiUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:3000/api/v1/plans/get-plans"
        : window.location.origin + "/api/v1/plans/get-plans";
    
    const response = await fetch(
      apiUrl,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch offers");
    }

    const data = await response.json();
    allPlans = data;
    renderOffers(data);
  } catch (error) {
    console.error("Error fetching offers:", error);
    showError("Failed to load offers. Please try again later.");
  } finally {
    setLoading(false);
  }
};

const renderOffers = (plans) => {
  const container = document.getElementById("offers-container");

  if (!plans || plans.length === 0) {
    container.innerHTML =
      '<p class="no-offers">No offers available at the moment.</p>';
    return;
  }

  container.innerHTML = plans
    .map(
      (plan) => `
    <div class="offer-card ${plan.is_popular ? "special-offer" : ""}">
      <div class="offer-header">
        <div class="offer-name">${plan.name}</div>
        <div class="offer-price">KES ${parseFloat(plan.cost).toFixed(2)}</div>
        <div class="offer-duration">${plan.duration}</div>
      </div>
      <div class="offer-body">
        <ul class="offer-features">
          ${(plan.features || [])
            .map(
              (feature) => `
            <li><i class="fas fa-check"></i> ${feature}</li>
          `
            )
            .join("")}
        </ul>
        <div class="offer-actions">
          <button class="btn btn-primary" data-plan-id="${plan.plan_id}">
            Get Started
          </button>
        </div>
        ${
          plan.is_popular
            ? '<div class="offer-savings">Popular Choice</div>'
            : ""
        }
      </div>
    </div>
  `
    )
    .join("");

  // Add event listeners to buttons
  document.querySelectorAll(".btn-primary").forEach((button) => {
    button.addEventListener("click", handlePurchase);
  });
};

const handlePurchase = async (event) => {
  const planId = event.target.getAttribute("data-plan-id");
  const plan = allPlans.find((p) => p.plan_id == planId);

  if (!plan) {
    showError("Plan not found");
    return;
  }

  setLoading(true);
  try {
    const apiUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:3000/api/v1/plans/purchase-plan"
        : window.location.origin + "/api/v1/plans/purchase-plan";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan_id: planId }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Purchase failed");
    }

    showSuccess("Check your phone for the M-Pesa pop-up...");

    // Poll backend for confirmation
    const pollResult = await pollPaymentStatus();

    if (pollResult.status === "success") {
      showSuccess("Payment successful. Thank you!");
    } else if (pollResult.status === "cancelled") {
      showError("You dismissed the M-Pesa pop-up.");
    } else {
      showError("Payment failed. Please try again.");
    }
  } catch (error) {
    console.error("Purchase error:", error);
    showError(error.message);
  } finally {
    setLoading(false);
  }
};

const pollPaymentStatus = async () => {
  const apiUrl =
    window.location.hostname === "localhost"
      ? "http://localhost:3000/api/v1/plans/payment-status"
      : window.location.origin + "/api/v1/plans/payment-status";
  const maxAttempts = 10;
  const delay = 1000; // 1 seconds
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((res) => setTimeout(res, delay));
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.status !== "pending") {
      return data;
    }
  }
  return { status: "timeout" };
};

// Initialize when DOM loads
document.addEventListener("DOMContentLoaded", () => {
  fetchOffers();
});