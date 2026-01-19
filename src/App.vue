<template>
  <header class="header">
    <div class="brand" @click="$router.push('/billing')">管理平台</div>
    <nav class="nav">
      <!-- <router-link to="/billing">服务扣费</router-link> -->
    </nav>
    <div class="user">
      <template v-if="isLoggedIn">
        <span class="name">你好，{{ userName }}</span>
        <button class="btn" @click="onLogout">退出</button>
      </template>
      <template v-else>
        <button class="btn" @click="openAuthModal">登录</button>
      </template>
    </div>
  </header>
  <div v-if="showAuthModal" class="modal-backdrop" @click.self="closeAuthModal">
    <div class="modal">
      <div class="modal-header">
        <div class="title">
          {{ mode === "login" ? "管理员登录" : "管理员注册" }}
        </div>
        <button class="close" @click="closeAuthModal">×</button>
      </div>
      <div class="modal-body">
        <div v-if="mode === 'login'" class="form">
          <div class="field">
            <label class="label">登录名</label>
            <input
              v-model="identifier"
              class="input wide"
              type="text"
              placeholder="请输入登录名"
            />
          </div>
          <div class="field">
            <label class="label">密码</label>
            <input
              v-model="credential"
              class="input wide"
              type="password"
              placeholder="密码须包含字母、数字和特殊字符，不少于6位"
            />
          </div>
          <button
            class="btn primary wide"
            @click="onAdminLogin"
            :disabled="loading"
          >
            {{ loading ? "登录中..." : "登录" }}
          </button>
          <div class="muted center divider"><span>或</span></div>
          <div class="muted">
            还没有账号？ <a class="link" @click="mode = 'register'">去注册</a>
          </div>
        </div>
        <div v-else class="form">
          <div class="field">
            <label class="label">登录名</label>
            <input
              v-model="loginName"
              class="input wide"
              type="text"
              placeholder="请输入登录名"
            />
          </div>
          <div class="field">
            <label class="label">邮箱</label>
            <input
              v-model="email"
              class="input wide"
              type="email"
              placeholder="请输入邮箱地址"
            />
          </div>
          <div class="field">
            <label class="label">密码</label>
            <input
              v-model="password"
              class="input wide"
              type="password"
              placeholder="密码须包含字母、数字和特殊字符，不少于6位"
            />
          </div>
          <div class="field">
            <label class="label">确认密码</label>
            <input
              v-model="confirmPassword"
              class="input wide"
              type="password"
              placeholder="请再次输入密码"
            />
          </div>
          <button
            class="btn primary wide"
            @click="onAdminRegister"
            :disabled="loading"
          >
            {{ loading ? "注册中..." : "注册" }}
          </button>
          <div class="muted center divider"><span>或</span></div>
          <div class="muted">
            已有账号？ <a class="link" @click="mode = 'login'">去登录</a>
          </div>
        </div>
        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>
  </div>
  <router-view />
</template>
<script>
export default {
  name: "App",
  data() {
    return {
      mode: "login",
      showAuthModal: false,
      identifier: "",
      credential: "",
      loginName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "ADMIN",
      loading: false,
      error: "",
    };
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
    userName() {
      return this.$store.getters.userName;
    },
  },
  methods: {
    openAuthModal() {
      this.error = "";
      this.showAuthModal = true;
    },
    closeAuthModal() {
      this.showAuthModal = false;
    },
    async onAdminLogin() {
      this.error = "";
      const identifier = this.identifier && this.identifier.trim();
      const credential = this.credential && this.credential.trim();
      if (!identifier || !credential) {
        this.error = "请输入标识和密码";
        return;
      }
      this.loading = true;
      try {
        await this.$store.dispatch("adminLogin", { identifier, credential });
        this.showAuthModal = false;
        this.$router.push("/billing");
      } catch (e) {
        this.error = e && e.message ? e.message : "登录失败";
      } finally {
        this.loading = false;
      }
    },
    async onAdminRegister() {
      this.error = "";
      const confirmPassword =
        this.confirmPassword && this.confirmPassword.trim();
      const payload = {
        loginName: this.loginName && this.loginName.trim(),
        email: this.email && this.email.trim(),
        password: this.password && this.password.trim(),
        role: "ADMIN",
      };
      if (
        !payload.loginName ||
        !payload.email ||
        !payload.password ||
        !confirmPassword
      ) {
        this.error = "请完整填写注册信息";
        return;
      }
      if (payload.password !== confirmPassword) {
        this.error = "两次输入的密码不一致";
        return;
      }
      this.loading = true;
      try {
        await this.$store.dispatch("adminRegister", payload);
        this.mode = "login";
      } catch (e) {
        this.error = e && e.message ? e.message : "注册失败";
      } finally {
        this.loading = false;
      }
    },
    onLogout() {
      this.$store.dispatch("logout");
      this.identifier = "";
      this.credential = "";
      this.loginName = "";
      this.email = "";
      this.password = "";
      this.mode = "login";
      this.showAuthModal = false;
    },
  },
};
</script>

<style>
:root {
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --text-main: #1f2937;
  --text-secondary: #6b7280;
  --bg-color: #f3f4f6;
  --border-color: #e5e7eb;
  --danger-color: #ef4444;
  --success-color: #10b981;
}

body {
  margin: 0;
  background-color: var(--bg-color);
}

#app {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-main);
  min-height: 100vh;
}

.header {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.brand {
  font-weight: 800;
  font-size: 20px;
  color: var(--primary-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav {
  display: flex;
  gap: 24px;
}

.nav a {
  text-decoration: none;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.2s;
  font-size: 14px;
}

.nav a:hover {
  color: var(--primary-color);
}

.nav a.router-link-exact-active {
  color: var(--primary-color);
  font-weight: 600;
}

.user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
}

.input {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  outline: none;
  background: #fff;
}

.input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.btn {
  padding: 8px 16px;
  background: white;
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn.primary {
  background: var(--primary-color);
  color: white;
  border: 1px solid transparent;
}

.btn.primary:hover {
  background: var(--primary-hover);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link {
  color: var(--primary-color);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.error {
  color: var(--danger-color);
  font-size: 13px;
  margin-top: 8px;
  background: #fef2f2;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #fee2e2;
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fade-in 0.2s ease-out;
}

.modal {
  width: 100%;
  max-width: 440px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: scale-in 0.2s ease-out;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header .title {
  font-weight: 700;
  font-size: 18px;
  color: var(--text-main);
}

.close {
  background: transparent;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s;
  padding: 4px;
  border-radius: 4px;
  line-height: 1;
}

.close:hover {
  color: var(--text-main);
  background: #f3f4f6;
}

.modal-body {
  padding: 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
}

.input.wide {
  width: 100%;
  box-sizing: border-box;
}

.btn.wide {
  width: 100%;
  justify-content: center;
}

.muted {
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
}

.divider {
  display: flex;
  align-items: center;
  color: var(--border-color);
  font-size: 12px;
  margin: 8px 0;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.divider span {
  padding: 0 10px;
  color: var(--text-secondary);
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scale-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
