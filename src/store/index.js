import { createStore } from "vuex";
import { adminLogin, adminRegister } from "@/api/auth";

const persistedUser = JSON.parse(localStorage.getItem("user") || "null");

export default createStore({
  state: {
    user: persistedUser || {
      loggedIn: false,
      identifier: "",
      role: "",
      permissions: [],
      token: "",
      expiresAt: "",
    },
  },
  getters: {
    isLoggedIn(state) {
      return !!state.user && !!state.user.token && state.user.loggedIn;
    },
    userName(state) {
      return state.user ? state.user.identifier || "" : "";
    },
    userRole(state) {
      return state.user ? state.user.role || "" : "";
    },
    userPermissions(state) {
      return state.user ? state.user.permissions || [] : [];
    },
  },
  mutations: {
    setUser(state, payload) {
      state.user = { ...payload, loggedIn: !!payload && !!payload.token };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    logout(state) {
      state.user = {
        loggedIn: false,
        identifier: "",
        role: "",
        permissions: [],
        token: "",
        expiresAt: "",
      };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
  actions: {
    async adminLogin({ commit }, { identifier, credential }) {
      const data = await adminLogin({ identifier, credential });
      if (data) {
        const { role, permissions, expiresAt, token } = data;
        commit("setUser", {
          identifier,
          role,
          permissions,
          token,
          expiresAt,
        });
        return data;
      }
      throw new Error("登录失败");
    },
    async adminRegister(_ctx, { loginName, email, password, role }) {
      const data = await adminRegister({
        loginName,
        email,
        password,
        role,
      });
      return data || true;
    },
    logout({ commit }) {
      commit("logout");
    },
  },
});
