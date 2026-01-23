<template>
  <div class="billing">
    <div class="page-header">
      <h1>用户管理</h1>
      <div class="actions">
        <select v-model="usersFilters.status" class="input" @change="loadUsers">
          <option :value="1">启用</option>
          <option :value="0">停用</option>
        </select>
      </div>
    </div>

    <div class="table">
      <div class="users-thead">
        <div class="th" @click="toggleUsersIdSort">ID</div>
        <div class="th">昵称</div>
        <div class="th">语言</div>
        <div class="th">状态</div>
        <div class="th" @click="toggleUsersCreateSort">创建时间</div>
        <div class="th">操作</div>
      </div>
      <div v-if="users.length === 0" class="empty">暂无用户</div>
      <div v-else class="tbody">
        <div class="users-tr" v-for="u in users" :key="u.id">
          <div class="td">{{ u.id }}</div>
          <div class="td">{{ u.nickname }}</div>
          <div class="td">{{ u.language }}</div>
          <div class="td">
            <span :class="['status', u.status === 1 ? 'online' : 'offline']">
              {{ u.status === 1 ? "启用" : "停用" }}
            </span>
          </div>
          <div class="td">{{ formatTime(u.createTime) }}</div>
          <div class="td">
            <span class="op-link" @click="openUserDetail(u.id)">详情</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div
      v-if="showUserDetail"
      class="modal-backdrop"
      @click.self="closeUserDetail"
    >
      <div class="modal">
        <div class="modal-header">
          <div class="title">用户详情</div>
          <button class="close" @click="closeUserDetail">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <div class="label">ID</div>
            <div class="value">{{ userDetail?.id }}</div>
          </div>
          <div class="detail-row">
            <div class="label">昵称</div>
            <div class="value">{{ userDetail?.nickname }}</div>
          </div>
          <div class="detail-row">
            <div class="label">语言</div>
            <div class="value">{{ userDetail?.language }}</div>
          </div>
          <div class="detail-row">
            <div class="label">状态</div>
            <div class="value">
              {{ userDetail?.status === 1 ? "启用" : "停用" }}
            </div>
          </div>
          <div class="detail-row">
            <div class="label">更新状态</div>
            <div
              class="value"
              style="display: flex; gap: 8px; align-items: center"
            >
              <select
                v-model.number="userStatus"
                class="input"
                style="width: 140px"
              >
                <option :value="1">启用</option>
                <option :value="0">停用</option>
              </select>
              <button class="btn" @click="submitUserStatus">更新</button>
            </div>
          </div>
          <div class="detail-row">
            <div class="label">创建时间</div>
            <div class="value">{{ formatTime(userDetail?.createTime) }}</div>
          </div>
          <div class="detail-row">
            <div class="label">更新时间</div>
            <div class="value">{{ formatTime(userDetail?.updateTime) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUsersList, getUserDetail, updateUserStatus } from "@/api/pricing";

export default {
  name: "UsersView",
  data() {
    return {
      usersFilters: {
        status: 1,
        page: 1,
        size: 20,
      },
      users: [],
      usersSortAsc: true,
      usersIdSortAsc: true,
      showUserDetail: false,
      userDetail: null,
      userStatus: 1,
      loading: false,
      error: "",
    };
  },
  computed: {
    token() {
      return this.$store.state.user && this.$store.state.user.token;
    },
  },
  watch: {
    token(newToken) {
      if (newToken) {
        this.error = "";
        this.loadUsers();
      } else {
        this.users = [];
        this.error = "请先登录以查看用户列表";
      }
    },
  },
  created() {
    this.loadUsers();
  },
  methods: {
    async loadUsers() {
      if (!this.token) {
        this.error = "请先登录以查看用户列表";
        return;
      }
      try {
        const data = await getUsersList(this.usersFilters, this.token);
        this.users = (data && data.items) || [];
        this.applyUsersSort();
      } catch (e) {
        this.error = e && e.message ? e.message : "用户列表获取失败";
      }
    },
    async openUserDetail(id) {
      this.error = "";
      try {
        const data = await getUserDetail(id, this.token);
        this.userDetail = data;
        this.userStatus = typeof data?.status === "number" ? data.status : 1;
        this.showUserDetail = true;
      } catch (e) {
        this.error = e && e.message ? e.message : "用户详情获取失败";
      }
    },
    closeUserDetail() {
      this.showUserDetail = false;
      this.userDetail = null;
    },
    async submitUserStatus() {
      if (!this.userDetail || !this.userDetail.id) return;
      try {
        await updateUserStatus(
          this.userDetail.id,
          Number(this.userStatus),
          this.token
        );
        this.userDetail.status = Number(this.userStatus);
        await this.loadUsers();
      } catch (e) {
        this.error = e && e.message ? e.message : "状态更新失败";
      }
    },
    formatTime(val) {
      if (!val) return "";
      return String(val).replace("T", " ").replace("Z", "");
    },
    toggleUsersCreateSort() {
      this.usersSortAsc = !this.usersSortAsc;
      this.applyUsersSort();
    },
    applyUsersSort() {
      const asc = this.usersSortAsc;
      this.users = [...(this.users || [])].sort((a, b) => {
        const ta = new Date(a && a.createTime ? a.createTime : 0).getTime();
        const tb = new Date(b && b.createTime ? b.createTime : 0).getTime();
        return asc ? ta - tb : tb - ta;
      });
    },
    toggleUsersIdSort() {
      this.usersIdSortAsc = !this.usersIdSortAsc;
      const asc = this.usersIdSortAsc;
      this.users = [...(this.users || [])].sort((a, b) => {
        const ia = Number(a && a.id ? a.id : 0);
        const ib = Number(b && b.id ? b.id : 0);
        return asc ? ia - ib : ib - ia;
      });
    },
  },
};
</script>

<style scoped>
.billing {
  max-width: 1280px;
  margin: 32px auto;
  padding: 0 24px;
  animation: fade-in 0.3s ease-out;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  background: #fff;
  padding: 20px 24px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.page-header h1 {
  font-size: 20px;
  color: var(--text-main);
  font-weight: 700;
  margin: 0;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.actions .input {
  width: auto;
  min-width: 120px;
}

.table {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--border-color);
}

.users-thead,
.users-tr {
  display: grid;
  grid-template-columns: 80px 1.5fr 1fr 1fr 1.5fr 100px;
  gap: 16px;
  padding: 12px 24px;
  align-items: center;
}

.users-thead {
  background: #f9fafb;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  font-size: 13px;
  color: var(--text-secondary);
}

.users-tr {
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
}

.users-tr:last-child {
  border-bottom: none;
}

.td,
.th {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.op-link {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s;
}

.op-link:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.status {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
}

.status::before {
  content: "";
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
}

.status.online {
  background: #ecfdf5;
  color: #059669;
}

.status.online::before {
  background: #10b981;
}

.status.offline {
  background: #f3f4f6;
  color: #6b7280;
}

.status.offline::before {
  background: #9ca3af;
}

.empty {
  padding: 64px 0;
  text-align: center;
  color: var(--text-secondary);
}

.error {
  margin-top: 16px;
  color: #dc2626;
  background: #fef2f2;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #fecaca;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(2px);
}

.modal {
  width: 580px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: modal-pop 0.3s ease-out;
}

@keyframes modal-pop {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header .title {
  font-weight: 700;
  font-size: 18px;
  color: #111827;
}

.close {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s;
  line-height: 1;
}

.close:hover {
  color: #4b5563;
}

.modal-body {
  padding: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  color: var(--text-secondary);
}

.detail-row .value {
  font-weight: 600;
  color: var(--text-main);
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
