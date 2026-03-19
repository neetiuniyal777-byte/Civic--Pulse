/**
 * CIVIC PULSE — Shared API Client
 * Include this in every HTML page: <script src="/static/js/api.js"></script>
 */

const CivicAPI = {
  base: "",   // same-origin — Flask serves everything

  async call(method, path, data = null, isForm = false) {
    const opts = {
      method,
      credentials: "include",
      headers: isForm ? {} : { "Content-Type": "application/json" },
    };
    if (data) opts.body = isForm ? data : JSON.stringify(data);
    try {
      const res = await fetch(this.base + path, opts);
      const json = await res.json();
      return json;
    } catch (e) {
      return { error: "Network error: " + e.message };
    }
  },

  // ── AUTH ──────────────────────────────────────────────
  auth: {
    async register(payload) { return CivicAPI.call("POST", "/api/auth/register", payload); },
    async login(email, password) { return CivicAPI.call("POST", "/api/auth/login", { email, password }); },
    async logout() { return CivicAPI.call("POST", "/api/auth/logout"); },
    async me() { return CivicAPI.call("GET", "/api/auth/me"); },
    async sendOTP(phone) { return CivicAPI.call("POST", "/api/auth/send-otp", { phone }); },
    async verifyOTP(phone, otp) { return CivicAPI.call("POST", "/api/auth/verify-otp", { phone, otp }); },
  },

  // ── REPORTS ───────────────────────────────────────────
  reports: {
    async analyze(formData) { return CivicAPI.call("POST", "/api/reports/analyze", formData, true); },
    async submit(payload) { return CivicAPI.call("POST", "/api/reports/submit", payload); },
    async genLetter(payload) { return CivicAPI.call("POST", "/api/reports/letter", payload); },
    async list(params = {}) {
      const q = new URLSearchParams(params).toString();
      return CivicAPI.call("GET", `/api/reports?${q}`);
    },
    async get(id) { return CivicAPI.call("GET", `/api/reports/${id}`); },
    async updateStatus(id, status) { return CivicAPI.call("PATCH", `/api/reports/${id}/status`, { status }); },
    async heatmap() { return CivicAPI.call("GET", "/api/reports/heatmap"); },
  },

  // ── PETITIONS ─────────────────────────────────────────
  petitions: {
    async list() { return CivicAPI.call("GET", "/api/petitions"); },
    async create(report_id) { return CivicAPI.call("POST", "/api/petitions/create", { report_id }); },
    async sign(pid, name, phone) { return CivicAPI.call("POST", `/api/petitions/${pid}/sign`, { name, phone }); },
  },

  // ── ADOPTIONS ─────────────────────────────────────────
  adoptions: {
    async list() { return CivicAPI.call("GET", "/api/adoptions"); },
    async create(payload) { return CivicAPI.call("POST", "/api/adoptions/create", payload); },
    async fund(aid, amount) { return CivicAPI.call("POST", `/api/adoptions/${aid}/fund`, { amount }); },
  },

  // ── SOCIAL ────────────────────────────────────────────
  social: {
    async posts(city = "") { return CivicAPI.call("GET", `/api/posts?city=${city}`); },
    async create(formData) { return CivicAPI.call("POST", "/api/posts/create", formData, true); },
    async like(pid) { return CivicAPI.call("POST", `/api/posts/${pid}/like`); },
  },

  // ── STATS ─────────────────────────────────────────────
  stats: {
    async get() { return CivicAPI.call("GET", "/api/stats"); },
  },

  // ── UTILITY ───────────────────────────────────────────
  utils: {
    formatDate(dt) {
      if (!dt) return "";
      return new Date(dt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    },
    timeAgo(dt) {
      const diff = (Date.now() - new Date(dt)) / 1000;
      if (diff < 60) return "just now";
      if (diff < 3600) return Math.floor(diff / 60) + "m ago";
      if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
      return Math.floor(diff / 86400) + "d ago";
    },
    toast(msg, type = "info") {
      const colors = { info: "#1565C0", success: "#2E7D32", error: "#C62828" };
      const t = document.createElement("div");
      t.style.cssText = `position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);
        background:${colors[type]||colors.info};color:#fff;padding:.7rem 1.4rem;
        font-size:.82rem;font-weight:600;z-index:9999;letter-spacing:.5px;
        box-shadow:0 8px 24px rgba(0,0,0,.3);opacity:0;transition:opacity .3s;
        white-space:nowrap;border-radius:4px;font-family:'DM Sans',sans-serif`;
      t.textContent = msg;
      document.body.appendChild(t);
      requestAnimationFrame(() => {
        t.style.opacity = "1";
        setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 350); }, 2800);
      });
    }
  }
};

// ── Auto-load stats into hero on main page ──
document.addEventListener("DOMContentLoaded", async () => {
  const statCities   = document.getElementById("stat-cities");
  const statFiled    = document.getElementById("stat-filed");
  const statResolved = document.getElementById("stat-resolved");
  if (statCities || statFiled) {
    const data = await CivicAPI.stats.get();
    if (data && !data.error) {
      animCount(statCities,   data.cities);
      animCount(statFiled,    data.cases_filed);
      animCount(statResolved, data.cases_resolved);
    }
  }
});

function animCount(el, target) {
  if (!el) return;
  let n = 0;
  const step = Math.max(1, Math.floor(target / 60));
  const t = setInterval(() => {
    n = Math.min(n + step, target);
    el.textContent = n.toLocaleString("en-IN");
    if (n >= target) clearInterval(t);
  }, 25);
}
