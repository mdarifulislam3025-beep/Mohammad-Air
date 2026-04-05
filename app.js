const authDialog = document.getElementById("authDialog");
const authTriggers = document.querySelectorAll("[data-auth-trigger]");
const closeAuth = document.getElementById("closeAuth");
const authTitle = document.getElementById("authTitle");
const authMessage = document.getElementById("authMessage");
const registerForm = document.getElementById("registerForm");
const otpForm = document.getElementById("otpForm");
const loginForm = document.getElementById("loginForm");
const requestList = document.getElementById("requestList");

const tabs = document.querySelectorAll(".tab");
const featureForms = [
  "flightForm",
  "visaForm",
  "hajjForm",
  "workVisaForm",
  "transportForm",
].map((id) => document.getElementById(id));

let pendingRegistration = null;
const OTP = "123456"; // demo-only OTP; backend should send by email.

function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function setUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getSession() {
  return JSON.parse(localStorage.getItem("session") || "null");
}

function setSession(session) {
  localStorage.setItem("session", JSON.stringify(session));
}

function fakeJwt(user) {
  return btoa(`${user.email}:${Date.now()}:customer`);
}

function setMessage(message, success = false) {
  authMessage.textContent = message;
  authMessage.classList.toggle("success", success);
}

function openAuth(tab = "register") {
  authDialog.showModal();
  activateTab(tab);
  setMessage("");
}

authTriggers.forEach((btn) => {
  btn.addEventListener("click", () => openAuth("register"));
});

closeAuth.addEventListener("click", () => authDialog.close());

tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.tab));
});

function activateTab(tabName) {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabName));
  registerForm.classList.toggle("hidden", tabName !== "register");
  loginForm.classList.toggle("hidden", tabName !== "login");
  otpForm.classList.add("hidden");
  authTitle.textContent = tabName === "register" ? "Register" : "Login";
  setMessage("");
}

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(registerForm);
  const email = (formData.get("email") || "").toString().trim().toLowerCase();
  const password = (formData.get("password") || "").toString();

  const users = getUsers();
  if (users.some((u) => u.email === email)) {
    setMessage("This email is already registered.");
    return;
  }

  pendingRegistration = { email, password, role: "customer", verified: false };
  registerForm.classList.add("hidden");
  otpForm.classList.remove("hidden");
  authTitle.textContent = "OTP Verification";
  setMessage("OTP sent to your email. Use 123456 for demo.", true);
});

otpForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const enteredOtp = new FormData(otpForm).get("otp");

  if (enteredOtp !== OTP) {
    setMessage("Invalid OTP. Please try again.");
    return;
  }

  const users = getUsers();
  users.push({ ...pendingRegistration, verified: true });
  setUsers(users);
  setMessage("Registration completed. Please login now.", true);
  otpForm.classList.add("hidden");
  registerForm.reset();
  otpForm.reset();
  activateTab("login");
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const email = (formData.get("email") || "").toString().trim().toLowerCase();
  const password = (formData.get("password") || "").toString();

  const users = getUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    setMessage("Your Email is not registered, Please Sign UP");
    return;
  }

  if (user.password !== password) {
    setMessage("Wrong Password, Please provide your correct Password or Reset your Password.");
    return;
  }

  const token = fakeJwt(user);
  setSession({
    email: user.email,
    role: user.role,
    jwt: token,
  });
  setMessage("Successful login. JWT issued and role validated for customer routes.", true);
  renderRequests();
});

function createRequestId(prefix) {
  return `${prefix}-${Date.now().toString().slice(-8)}`;
}

function getRequests() {
  return JSON.parse(localStorage.getItem("requests") || "[]");
}

function setRequests(items) {
  localStorage.setItem("requests", JSON.stringify(items));
}

function submitFeatureRequest(moduleName, formData) {
  const session = getSession();
  if (!session?.jwt) {
    openAuth("login");
    setMessage("Please login before submitting requests.");
    return false;
  }

  const requests = getRequests();
  const item = {
    id: createRequestId(moduleName.substring(0, 3).toUpperCase()),
    module: moduleName,
    status: "Pending",
    assignedAgent: "Unassigned",
    createdAt: new Date().toISOString(),
    payload: Object.fromEntries(formData.entries()),
    offers: [],
  };

  requests.push(item);
  setRequests(requests);
  renderRequests();
  return true;
}

featureForms.forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const moduleName = form.id.replace("Form", "");
    const ok = submitFeatureRequest(moduleName, new FormData(form));
    if (ok) {
      form.reset();
      alert(`${moduleName} request submitted successfully.`);
    }
  });
});

function renderRequests() {
  requestList.innerHTML = "";
  const tpl = document.getElementById("reqTemplate");
  getRequests()
    .slice()
    .reverse()
    .forEach((req) => {
      const clone = tpl.content.cloneNode(true);
      clone.querySelector(".req-title").textContent = `${req.id} • ${req.module}`;
      clone.querySelector(".req-meta").textContent = `Status: ${req.status} | Agent: ${req.assignedAgent} | Offers: ${req.offers.length}`;
      requestList.append(clone);
    });
}

renderRequests();
