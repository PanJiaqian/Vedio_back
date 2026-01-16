<template>
  <header class="header">
    <div class="brand" @click="$router.push('/billing')">管理平台</div>
    <nav class="nav">
      <router-link to="/billing">服务扣费</router-link>
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}
.brand {
  font-weight: 700;
  cursor: pointer;
}

.nav a {
  font-weight: bold;
  color: #2c3e50;
  margin-right: 16px;
}

.nav a.router-link-exact-active {
  color: #1e80ff;
}
.user {
  display: flex;
  align-items: center;
}
.name {
  margin-right: 12px;
}
.input {
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  margin-right: 8px;
}
.btn {
  padding: 6px 12px;
  background: #1e80ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn:hover {
  background: #1668e3;
}
.btn.primary {
  height: 40px;
  border-radius: 8px;
  font-weight: 600;
}
.link {
  color: #2c3e50;
  cursor: pointer;
}
.error {
  color: #ef4444;
  margin-top: 8px;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.modal {
  width: 480px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}
.title {
  font-weight: 700;
  font-size: 18px;
}
.close {
  background: transparent;
  border: none;
  font-size: 22px;
  cursor: pointer;
}
.modal-body {
  padding: 16px;
}
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}
.tab {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;
}
.tab.active {
  background: #e8f0fe;
  border-color: #1e80ff;
  color: #1e80ff;
  font-weight: 600;
}
.form {
  display: flex;
  flex-direction: column;
  max-width: 360px;
  margin: 0 auto;
}
.field {
  margin-bottom: 10px;
}
.label {
  display: block;
  text-align: left;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}
.input.wide {
  width: 100%;
  margin-bottom: 10px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
}
.btn.wide {
  width: 100%;
}
.muted {
  margin-top: 8px;
  color: #6b7280;
  font-size: 12px;
}
.center {
  text-align: center;
}
.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.divider::before,
.divider::after {
  content: "";
  display: inline-block;
  height: 1px;
  width: 100%;
  background: #e5e7eb;
}
</style>
