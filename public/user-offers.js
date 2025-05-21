let allPlans = [];

const setLoading = (isLoading) => {
  const overlay = document.getElementById("loadingOverlay");
  const spinner = document.getElementById("loadingSpinner");

  if (overlay && spinner) {
    overlay.style.display = isLoading ? "block" : "none";
    spinner.style.display = isLoading ? "block" : "none";
  }
};

const sanitize = (unsafe) => {
  const div = document.createElement("div");
  div.textContent = unsafe;
  return div.innerHTML;
};

const showError = (message) => {
  const error = document.getElementById("error");
  if (error) {
    error.innerHTML = `<p>${sanitize(message)}</p>`;
    error.style.opacity = "1";
    setTimeout(() => {
      error.style.opacity = "0";
    }, 3000);
  }
};

const showSuccess = (message) => {
  const success = document.getElementById("success");
  if (success) {
    success.innerHTML = `<p>${sanitize(message)}</p>`;
    success.style.opacity = "1";
    setTimeout(() => {
      success.style.opacity = "0";
    }, 3000);
  }
};

const fetchOffers = async () => {
  setLoading(true);
  try {
    const apiUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:4000/api/v1/plans/get-plans"
        : window.location.origin + "/api/v1/plans/get-plans";

    const response = await fetch(apiUrl, {
      method: "GET",
      credentials:"include",
      headers: {
        "Content-Type": "application/json",
      },
    });

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

  if (!container) return;

  if (!plans || plans.length === 0) {
    container.innerHTML =
      '<p class="no-offers">No offers available at the moment.</p>';
    return;
  }

  container.innerHTML = plans
    .map((plan) => {
      const safeName = sanitize(plan.name);
      const safeCost = sanitize(plan.cost.toString());
      const safeDuration = sanitize(plan.duration);
      const features = (plan.features || [])
        .map(
          (feature) =>
            `<li><i class="fas fa-check"></i> ${sanitize(feature)}</li>`
        )
        .join("");

      return `
        <div class="offer-card ${plan.is_popular ? "special-offer" : ""}">
          <div class="offer-header">
            <div class="offer-name">${safeName}</div>
            <div class="offer-price">KES ${safeCost}</div>
            <div class="offer-duration">${safeDuration}</div>
          </div>
          <div class="offer-body">
            <ul class="offer-features">${features}</ul>
            <div class="offer-actions">
              <button class="btn btn-primary" data-plan-id="${sanitize(
                plan.plan_id
              )}">
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
      `;
    })
    .join("");

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
        ? "http://localhost:4000/api/v1/plans/purchase-plan"
        : window.location.origin + "/api/v1/plans/purchase-plan";

    const response = await fetch(apiUrl, {
      method: "POST",
      credentials:"include",
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

let isPolling = false;

const pollPaymentStatus = async () => {
  if (isPolling) return { status: "pending" };
  isPolling = true;

  const apiUrl =
    window.location.hostname === "localhost"
      ? "http://localhost:4000/api/v1/plans/payment-status"
      : window.location.origin + "/api/v1/plans/payment-status";

  const maxAttempts = 5;
  const delay = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((res) => setTimeout(res, delay));
    const res = await fetch(apiUrl);
    const data = await res.json();
    if (data.status !== "pending") {
      isPolling = false;
      return data;
    }
  }

  isPolling = false;
  return { status: "timeout" };
};

document.addEventListener("DOMContentLoaded", () => {
  fetchOffers();
});
