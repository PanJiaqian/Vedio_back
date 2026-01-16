<template>
  <div class="billing">
    <div class="page-header">
      <h1>服务扣费配置</h1>
      <div class="actions">
        <select v-model="filters.service_type" class="input" @change="loadList">
          <option value="video">video</option>
          <option value="image">image</option>
        </select>
        <select v-model="filters.status" class="input" @change="loadList">
          <option :value="1">启用</option>
          <option :value="0">停用</option>
        </select>
        <input
          v-model="filters.function_node"
          class="input"
          type="text"
          placeholder="功能"
          @input="loadList"
        />
      </div>
    </div>

    <div class="table">
      <div class="thead">
        <div class="th">ID</div>
        <div class="th">服务内容</div>
        <div class="th">类型</div>
        <div class="th">功能节点</div>
        <div class="th">模型</div>
        <div class="th">基础积分</div>
        <div class="th">成本</div>
        <div class="th">实际收入</div>
        <div class="th">状态</div>
        <div class="th">操作</div>
      </div>
      <div v-if="items.length === 0" class="empty">暂无数据</div>
      <div v-else class="tbody">
        <div v-for="it in items" :key="it.id" class="tr">
          <div class="td">{{ it.id }}</div>
          <div class="td">{{ it.serviceContent }}</div>
          <div class="td">{{ it.serviceType }}</div>
          <div class="td">{{ it.functionNode }}</div>
          <div class="td">{{ it.modelName }}</div>
          <div class="td">{{ it.basePointsPrice }}</div>
          <div class="td">{{ it.costPoints }}</div>
          <div class="td">{{ it.actualPointsIncome }}</div>
          <div class="td">
            <span :class="['status', it.status === 1 ? 'online' : 'offline']">
              {{ it.status === 1 ? "启用" : "停用" }}
            </span>
          </div>
          <div class="td ops">
            <span class="op-link" @click="openDetail(it.id)">详情</span>
            <span class="op-link" @click="openEdit(it)">编辑</span>
            <span
              class="op-link"
              @click="toggleStatus(it)"
              :class="{ disabled: loading }"
            >
              {{ it.status === 1 ? "停用" : "启用" }}
            </span>
            <span class="op-link danger" @click="onDelete(it.id)"> 删除 </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="showDetail" class="modal-backdrop" @click.self="closeDetail">
      <div class="modal">
        <div class="modal-header">
          <div class="title">配置详情</div>
          <button class="close" @click="closeDetail">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <div class="label">ID</div>
            <div class="value">{{ detail?.id }}</div>
          </div>
          <div class="detail-row">
            <div class="label">服务内容</div>
            <div class="value">{{ detail?.serviceContent }}</div>
          </div>
          <div class="detail-row">
            <div class="label">类型</div>
            <div class="value">{{ detail?.serviceType }}</div>
          </div>
          <div class="detail-row">
            <div class="label">功能节点</div>
            <div class="value">{{ detail?.functionNode }}</div>
          </div>
          <div class="detail-row">
            <div class="label">模型</div>
            <div class="value">{{ detail?.modelName }}</div>
          </div>
          <div class="detail-row">
            <div class="label">基础积分</div>
            <div class="value">{{ detail?.basePointsPrice }}</div>
          </div>
          <div class="detail-row">
            <div class="label">折扣</div>
            <div class="value">{{ detail?.discountRate }}%</div>
          </div>
          <div class="detail-row">
            <div class="label">成本</div>
            <div class="value">{{ detail?.costPoints }}</div>
          </div>
          <div class="detail-row">
            <div class="label">实际收入</div>
            <div class="value">{{ detail?.actualPointsIncome }}</div>
          </div>
          <div class="detail-row">
            <div class="label">创建时间</div>
            <div class="value">{{ formatTime(detail?.createdAt) }}</div>
          </div>
          <div class="detail-row">
            <div class="label">更新时间</div>
            <div class="value">{{ formatTime(detail?.updatedAt) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEdit" class="modal-backdrop" @click.self="closeEdit">
      <div class="modal">
        <div class="modal-header">
          <div class="title">编辑配置</div>
          <button class="close" @click="closeEdit">×</button>
        </div>
        <div class="modal-body">
          <div class="form">
            <div class="field">
              <label class="label">服务内容</label>
              <input
                v-model="editForm.service_content"
                class="input"
                type="text"
              />
            </div>
            <div class="field">
              <label class="label">类型</label>
              <select v-model="editForm.service_type" class="input">
                <option value="video">video</option>
                <option value="image">image</option>
              </select>
            </div>
            <div class="field">
              <label class="label">功能节点</label>
              <input
                v-model="editForm.function_node"
                class="input"
                type="text"
              />
            </div>
            <div class="field">
              <label class="label">模型</label>
              <input v-model="editForm.model_name" class="input" type="text" />
            </div>
            <div class="field">
              <label class="label">基础积分</label>
              <input
                v-model.number="editForm.base_points_price"
                class="input"
                type="number"
              />
            </div>
            <div class="field">
              <label class="label">折扣</label>
              <input
                v-model.number="editForm.discount_rate"
                class="input"
                type="number"
              />
            </div>
            <div class="field">
              <label class="label">成本积分</label>
              <input
                v-model.number="editForm.cost_points"
                class="input"
                type="number"
              />
            </div>
            <div class="field">
              <label class="label">积分兑现金比</label>
              <input
                v-model.number="editForm.points_to_cash_ratio"
                class="input"
                type="number"
              />
            </div>
            <button class="btn primary" @click="submitEdit" :disabled="loading">
              保存
            </button>
          </div>
          <div v-if="error" class="error">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="showCreate" class="modal-backdrop" @click.self="closeCreate">
      <div class="modal">
        <div class="modal-header">
          <div class="title">上架新配置</div>
          <button class="close" @click="closeCreate">×</button>
        </div>
        <div class="modal-body">
          <div class="form">
            <div class="field">
              <label class="label">服务内容</label>
              <input
                v-model="createForm.service_content"
                class="input"
                type="text"
              />
            </div>
            <div class="field">
              <label class="label">类型</label>
              <select v-model="createForm.service_type" class="input">
                <option value="video">video</option>
                <option value="image">image</option>
              </select>
            </div>
            <div class="field">
              <label class="label">功能节点</label>
              <input
                v-model="createForm.function_node"
                class="input"
                type="text"
              />
            </div>
            <div class="field">
              <label class="label">模型</label>
              <input
                v-model="createForm.model_name"
                class="input"
                type="text"
              />
            </div>
            <div class="field">
              <label class="label">基础积分</label>
              <input
                v-model.number="createForm.base_points_price"
                class="input"
                type="number"
              />
            </div>
            <div class="field">
              <label class="label">折扣</label>
              <input
                v-model.number="createForm.discount_rate"
                class="input"
                type="number"
              />
            </div>
            <div class="field">
              <label class="label">成本积分</label>
              <input
                v-model.number="createForm.cost_points"
                class="input"
                type="number"
              />
            </div>
            <div class="field">
              <label class="label">积分兑现金比</label>
              <input
                v-model.number="createForm.points_to_cash_ratio"
                class="input"
                type="number"
              />
            </div>
            <button
              class="btn primary"
              @click="submitCreate"
              :disabled="loading"
            >
              上架
            </button>
          </div>
          <div v-if="error" class="error">{{ error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getPricingList,
  getPricingDetail,
  deletePricing,
  setPricingStatus,
  updatePricing,
  createPricing,
} from "@/api/pricing";
export default {
  name: "BillingView",
  data() {
    return {
      filters: {
        service_type: "video",
        status: 1,
        function_node: "",
      },
      items: [],
      loading: false,
      error: "",
      showDetail: false,
      detail: null,
      showEdit: false,
      editForm: {
        id: "",
        service_content: "",
        service_type: "video",
        function_node: "",
        model_name: "",
        base_points_price: 0,
        discount_rate: 100,
        discount_start_time: null,
        discount_end_time: null,
        cost_points: 0,
        points_to_cash_ratio: 10,
      },
      showCreate: false,
      createForm: {
        service_content: "",
        service_type: "video",
        function_node: "分镜生成",
        model_name: "",
        base_points_price: 0,
        discount_rate: 100,
        discount_start_time: null,
        discount_end_time: null,
        cost_points: 0,
        points_to_cash_ratio: 10,
      },
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
        this.loadList();
      } else {
        this.items = [];
        this.error = "请先登录以获取配置列表";
      }
    },
  },
  created() {
    this.loadList();
  },
  methods: {
    async loadList() {
      this.error = "";
      if (!this.token) {
        this.error = "请先登录以获取配置列表";
        return;
      }
      this.loading = true;
      try {
        const data = await getPricingList(this.filters, this.token);
        this.items = (data && data.items) || [];
      } catch (e) {
        this.error = e && e.message ? e.message : "列表获取失败";
      } finally {
        this.loading = false;
      }
    },
    async openDetail(id) {
      this.error = "";
      try {
        const data = await getPricingDetail(id, this.token);
        this.detail = data;
        this.showDetail = true;
      } catch (e) {
        this.error = e && e.message ? e.message : "详情获取失败";
      }
    },
    closeDetail() {
      this.showDetail = false;
      this.detail = null;
    },
    openEdit(it) {
      this.editForm = {
        id: it.id,
        service_content: it.serviceContent,
        service_type: it.serviceType,
        function_node: it.functionNode,
        model_name: it.modelName,
        base_points_price: it.basePointsPrice,
        discount_rate: it.discountRate,
        discount_start_time: it.discountStartTime,
        discount_end_time: it.discountEndTime,
        cost_points: it.costPoints,
        points_to_cash_ratio: it.pointsToCashRatio,
      };
      this.showEdit = true;
    },
    closeEdit() {
      this.showEdit = false;
    },
    async submitEdit() {
      this.error = "";
      try {
        await updatePricing(this.editForm, this.token);
        this.showEdit = false;
        await this.loadList();
      } catch (e) {
        this.error = e && e.message ? e.message : "更新失败";
      }
    },
    openCreate() {
      this.showCreate = true;
    },
    closeCreate() {
      this.showCreate = false;
    },
    async submitCreate() {
      this.error = "";
      try {
        await createPricing(this.createForm, this.token);
        this.showCreate = false;
        await this.loadList();
      } catch (e) {
        this.error = e && e.message ? e.message : "上架失败";
      }
    },
    async onDelete(id) {
      this.error = "";
      try {
        await deletePricing(id, this.token);
        await this.loadList();
      } catch (e) {
        this.error = e && e.message ? e.message : "删除失败";
      }
    },
    async toggleStatus(it) {
      this.error = "";
      try {
        await setPricingStatus(
          { id: String(it.id), status: String(it.status === 1 ? 0 : 1) },
          this.token
        );
        await this.loadList();
      } catch (e) {
        this.error = e && e.message ? e.message : "状态变更失败";
      }
    },
    formatTime(val) {
      if (!val) return "";
      return String(val).replace("T", " ").replace("Z", "");
    },
  },
};
</script>

<style scoped>
.billing {
  max-width: 1200px;
  margin: 40px auto;
  padding: 24px;
  background-color: #f5f7fa;
  border-radius: 12px;
  min-height: 80vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  color: #1f2937;
  font-weight: 700;
  margin: 0;
}

.actions {
  display: flex;
  gap: 12px;
}

.input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  transition: all 0.2s;
  font-size: 14px;
  color: #374151;
}

.input:focus {
  border-color: #1e80ff;
  box-shadow: 0 0 0 2px rgba(30, 128, 255, 0.2);
}

.btn {
  padding: 8px 16px;
  background: #1e80ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.btn:hover {
  background: #105bd8;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn.primary {
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(30, 128, 255, 0.3);
}

.btn.danger {
  background: #ef4444;
}

.btn.danger:hover {
  background: #dc2626;
}

.table {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.thead,
.tr {
  display: grid;
  grid-template-columns: 80px 1.5fr 1fr 1.2fr 1.2fr 1fr 0.8fr 1fr 0.8fr 1.6fr;
  gap: 12px;
}

.thead {
  padding: 16px;
  background: #f3f4f6;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

.tbody .tr {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
  transition: background-color 0.15s;
  font-size: 14px;
  color: #4b5563;
}

.tbody .tr:hover {
  background-color: #f9fafb;
}

.tbody .tr:last-child {
  border-bottom: none;
}

.td,
.th {
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ops {
  display: flex;
  gap: 12px;
}

.op-link {
  color: #1e80ff;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s;
}

.op-link:hover {
  color: #004fc4;
  text-decoration: underline;
}

.op-link.danger {
  color: #ef4444;
}

.op-link.danger:hover {
  color: #b91c1c;
}

.status {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.status.online {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.status.offline {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.empty {
  padding: 40px;
  text-align: center;
  color: #9ca3af;
  font-size: 15px;
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
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  color: #6b7280;
  font-size: 14px;
}

.detail-row .value {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.form .field {
  margin-bottom: 16px;
}

.form .label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form .input {
  width: 100%;
  box-sizing: border-box;
}

.form .btn {
  width: 100%;
  margin-top: 8px;
  padding: 10px;
}
</style>
