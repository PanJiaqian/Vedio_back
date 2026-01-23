import {
  getPricingList,
  getPricingDetail,
  deletePricing,
  setPricingStatus,
  updatePricing,
  createPricing,
  getUsersList,
  updateUserStatus,
  getMembershipList,
  getOrderList,
  getRechargeList,
  getPointsList,
  getMembershipMapping,
  updateMembershipMapping,
  deleteMembershipMapping,
  createMembershipMapping,
  getMaterialsList,
  removeMaterial,
  publishMaterial,
  getCreativeWorksList,
  getCreativeWorkDetail,
  publishCreativeWork,
  unpublishCreativeWork,
  searchMemberships,
  searchMaterials,
  searchCreativeWorks,
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
      itemsIdSortAsc: true,
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
      usersFilters: {
        status: 1,
        page: 1,
        size: 20,
      },
      users: [],
      usersSortAsc: true,
      usersIdSortAsc: true,
      membershipsFilters: {
        page: 1,
        size: 20,
        context: "",
      },
      memberships: [],
      ordersFilters: {
        page: 1,
        size: 20,
      },
      orders: [],
      ordersSortAsc: true,
      ordersIdSortAsc: true,
      rechargesFilters: {
        page: 1,
        size: 20,
      },
      recharges: [],
      rechargesSortAsc: true,
      rechargesIdSortAsc: true,
      pointsFilters: {
        resourceType: "",
        page: 1,
        size: 20,
      },
      points: [],
      pointsSortAsc: true,
      pointsIdSortAsc: true,
      mapping: [],
      mappingIdSortAsc: true,
      mappingForm: {
        membership_level: "",
        pay_fee: 0,
        points: 0,
        duration_type: 1,
        duration_value: 1,
      },
      showMappingCreate: false,
      mappingCreateForm: {
        membership_level: "",
        pay_fee: 0,
        points: 0,
        duration_type: 1,
        duration_value: 1,
      },
      materialsFilters: {
        category: "",
        type: "COMMUNITY",
        page: 1,
        size: 20,
        context: "",
      },
      materials: [],
      materialsSearchSeq: 0,
      materialsSortAsc: true,
      materialsIdSortAsc: true,
      worksFilters: {
        page: 1,
        size: 20,
        context: "",
      },
      works: [],
      worksSortAsc: true,
      activeNav: "pricing",
      previewVisible: false,
      previewType: "",
      previewSrc: "",
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
        this.setNav(this.activeNav);
      } else {
        this.error = "请先登录以获取配置列表";
        this.clearActiveData();
      }
    },
  },
  created() {
    this.loadList();
  },
  mounted() {
    this.refreshEllipsisTitles();
  },
  updated() {
    this.refreshEllipsisTitles();
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
    // 用户列表展开式编辑
    setNav(name) {
      this.activeNav = name;
      if (name === "users") this.loadUsers();
      else if (name === "memberships") this.loadMemberships();
      else if (name === "orders") this.loadOrders();
      else if (name === "recharges") this.loadRecharges();
      else if (name === "points") this.loadPoints();
      else if (name === "mapping") this.loadMapping();
      else if (name === "materials") this.loadMaterials();
      else if (name === "works") this.loadWorks();
      else this.loadList();
    },
    toggleExpand(item) {
      item._expanded = !item._expanded;
    },
    async loadMemberships() {
      if (!this.token) {
        this.error = "请先登录以查看会员订阅列表";
        return;
      }
      try {
        const data = await getMembershipList(
          this.membershipsFilters,
          this.token
        );
        this.memberships = (data && data.items) || [];
      } catch (e) {
        this.error = e && e.message ? e.message : "会员订阅列表获取失败";
      }
    },
    async doMembershipsSearch() {
      if (!this.token) {
        this.error = "请先登录以搜索会员订阅记录";
        return;
      }
      const params = {
        context: this.membershipsFilters.context || "",
        page: this.membershipsFilters.page,
        size: this.membershipsFilters.size,
      };
      try {
        const data = await searchMemberships(params, this.token);
        this.memberships = (data && data.items) || [];
      } catch (e) {
        this.error = e && e.message ? e.message : "会员订阅搜索失败";
      }
    },
    clearMembershipsSearch() {
      this.membershipsFilters.context = "";
      this.loadMemberships();
    },
    async loadOrders() {
      if (!this.token) {
        this.error = "请先登录以查看订单列表";
        return;
      }
      try {
        const data = await getOrderList(this.ordersFilters, this.token);
        this.orders = (data && data.items) || [];
        this.applyOrdersSort();
      } catch (e) {
        this.error = e && e.message ? e.message : "订单列表获取失败";
      }
    },
    async loadRecharges() {
      if (!this.token) {
        this.error = "请先登录以查看充值记录";
        return;
      }
      try {
        const data = await getRechargeList(this.rechargesFilters, this.token);
        this.recharges = (data && data.items) || [];
        this.applyRechargesSort();
      } catch (e) {
        this.error = e && e.message ? e.message : "充值记录获取失败";
      }
    },
    async loadPoints() {
      if (!this.token) {
        this.error = "请先登录以查看积分扣除记录";
        return;
      }
      try {
        const data = await getPointsList(this.pointsFilters, this.token);
        this.points = (data && data.items) || [];
        this.applyPointsSort();
      } catch (e) {
        this.error = e && e.message ? e.message : "积分扣除记录获取失败";
      }
    },
    changeMaterialsPage(delta) {
      const next = this.materialsFilters.page + delta;
      this.materialsFilters.page = next < 1 ? 1 : next;
      this.loadMaterials();
    },
    changeWorksPage(delta) {
      const next = this.worksFilters.page + delta;
      this.worksFilters.page = next < 1 ? 1 : next;
      this.loadWorks();
    },
    changeMembershipsPage(delta) {
      const next = this.membershipsFilters.page + delta;
      this.membershipsFilters.page = next < 1 ? 1 : next;
      this.loadMemberships();
    },
    changeOrdersPage(delta) {
      const next = this.ordersFilters.page + delta;
      this.ordersFilters.page = next < 1 ? 1 : next;
      this.loadOrders();
    },
    changeRechargesPage(delta) {
      const next = this.rechargesFilters.page + delta;
      this.rechargesFilters.page = next < 1 ? 1 : next;
      this.loadRecharges();
    },
    changePointsPage(delta) {
      const next = this.pointsFilters.page + delta;
      this.pointsFilters.page = next < 1 ? 1 : next;
      this.loadPoints();
    },
    async loadMapping() {
      if (!this.token) {
        this.error = "请先登录以查看会员积分映射";
        return;
      }
      try {
        const data = await getMembershipMapping(this.token);
        this.mapping = Array.isArray(data) ? data : (data && data.items) || [];
      } catch (e) {
        this.error = e && e.message ? e.message : "会员积分映射获取失败";
      }
    },
    startMappingInline(mm, field) {
      mm._editingField = field;
      this.mappingForm = {
        id: String(mm.id || ""),
        membership_level: mm.membershipLevel || "",
        pay_fee: Number(mm.payFee || 0),
        points: Number(mm.points || 0),
        duration_type: Number(mm.durationType || 1),
        duration_value: Number(mm.durationValue || 1),
      };
      this.$nextTick(() => {
        const input = this.$refs[`mapping-input-${mm.id}-${field}`];
        if (input && input[0]) {
          input[0].focus();
        } else if (input) {
          input.focus();
        }
      });
    },
    refreshEllipsisTitles() {
      try {
        const root = this.$el;
        if (!root) return;
        const nodes = root.querySelectorAll(".td, .th");
        nodes.forEach((n) => {
          const text = (n.textContent || "").trim();
          if (text) n.setAttribute("title", text);
        });
      } catch (e) {
        return;
      }
    },
    clearActiveData() {
      this.items = [];
      this.users = [];
      this.memberships = [];
      this.orders = [];
      this.recharges = [];
      this.points = [];
      this.mapping = [];
      this.materials = [];
      this.works = [];
    },
    async stopMappingInline(mm) {
      if (!mm._editingField) return;
      mm._editingField = null;
      if (!this.token) {
        this.error = "请先登录以更新会员积分映射";
        return;
      }
      try {
        await updateMembershipMapping(this.mappingForm, this.token);
        mm.membershipLevel = this.mappingForm.membership_level;
        mm.payFee = this.mappingForm.pay_fee;
        mm.points = this.mappingForm.points;
        mm.durationType = this.mappingForm.duration_type;
        mm.durationValue = this.mappingForm.duration_value;
      } catch (e) {
        this.error = e && e.message ? e.message : "更新会员积分映射失败";
      }
    },
    openMappingCreate() {
      this.showMappingCreate = true;
      this.mappingCreateForm = {
        membership_level: "",
        pay_fee: 0,
        points: 0,
        duration_type: 1,
        duration_value: 1,
      };
    },
    closeMappingCreate() {
      this.showMappingCreate = false;
    },
    async submitMappingCreate() {
      if (!this.token) {
        this.error = "请先登录以新建会员积分映射";
        return;
      }
      try {
        await createMembershipMapping(this.mappingCreateForm, this.token);
        this.showMappingCreate = false;
        await this.loadMapping();
      } catch (e) {
        this.error = e && e.message ? e.message : "新建会员积分映射失败";
      }
    },
    async saveMapping(mm) {
      if (!this.token) {
        this.error = "请先登录以更新会员积分映射";
        return;
      }
      const payload = {
        id: String((mm && mm.id) || ""),
        membership_level: (mm && mm.membershipLevel) || "",
        pay_fee: Number((mm && mm.payFee) || 0),
        points: Number((mm && mm.points) || 0),
        duration_type: Number((mm && mm.durationType) || 1),
        duration_value: Number((mm && mm.durationValue) || 1),
      };
      try {
        await updateMembershipMapping(payload, this.token);
        await this.loadMapping();
      } catch (e) {
        this.error = e && e.message ? e.message : "更新会员积分映射失败";
      }
    },
    async deleteMapping(mm) {
      if (!this.token) {
        this.error = "请先登录以下架会员映射";
        return;
      }
      try {
        await deleteMembershipMapping(mm.id, this.token);
        await this.loadMapping();
      } catch (e) {
        this.error = e && e.message ? e.message : "下架会员映射失败";
      }
    },
    async loadMaterials() {
      if (!this.token) {
        this.error = "请先登录以查看素材列表";
        return;
      }
      try {
        const data = await getMaterialsList(this.materialsFilters, this.token);
        this.materials = (data && data.items) || [];
        this.applyMaterialsSort();
      } catch (e) {
        this.error = e && e.message ? e.message : "素材列表获取失败";
      }
    },
    async doMaterialsSearch() {
      const seq = ++this.materialsSearchSeq;
      if (!this.token) {
        this.error = "请先登录以搜索素材";
        return;
      }
      this.materials = [];
      const params = {
        context: this.materialsFilters.context || "",
        page: this.materialsFilters.page,
        size: this.materialsFilters.size,
        type: this.materialsFilters.type,
      };
      try {
        const data = await searchMaterials(params, this.token);
        if (seq !== this.materialsSearchSeq) return;
        const t = String(this.materialsFilters.type || "").toUpperCase();
        const list = ((data && data.items) || []).filter(
          (it) => String(it.type || "").toUpperCase() === t
        );
        this.materials = this.uniqueById(list);
        this.applyMaterialsSort();
      } catch (e) {
        this.error = e && e.message ? e.message : "素材搜索失败";
      }
    },
    clearMaterialsSearch() {
      this.materialsFilters.context = "";
      this.loadMaterials();
    },
    async publishMaterialItem(id) {
      if (!this.token) {
        this.error = "请先登录以进行上架操作";
        return;
      }
      try {
        await publishMaterial(id, this.token);
        await this.loadMaterials();
      } catch (e) {
        this.error = e && e.message ? e.message : "上架公共素材失败";
      }
    },
    async removeMaterialItem(id) {
      if (!this.token) {
        this.error = "请先登录以进行删除操作";
        return;
      }
      try {
        await removeMaterial(id, this.token);
        await this.loadMaterials();
      } catch (e) {
        this.error = e && e.message ? e.message : "删除素材失败";
      }
    },
    async loadWorks() {
      if (!this.token) {
        this.error = "请先登录以查看作品列表";
        return;
      }
      try {
        const data = await getCreativeWorksList(this.worksFilters, this.token);
        this.works = (data && data.items) || [];
        this.applyWorksSort();
      } catch (e) {
        this.error = e && e.message ? e.message : "作品列表获取失败";
      }
    },
    async doWorksSearch() {
      if (!this.token) {
        this.error = "请先登录以搜索作品";
        return;
      }
      const params = {
        context: this.worksFilters.context || "",
        page: this.worksFilters.page,
        size: this.worksFilters.size,
      };
      try {
        const data = await searchCreativeWorks(params, this.token);
        const list = (data && data.items) || [];
        this.works = this.uniqueById(list);
        this.applyWorksSort();
      } catch (e) {
        this.error = e && e.message ? e.message : "作品搜索失败";
      }
    },
    clearWorksSearch() {
      this.worksFilters.context = "";
      this.loadWorks();
    },
    uniqueById(list) {
      const s = new Set();
      return (Array.isArray(list) ? list : []).filter((it) => {
        const id = it && it.id;
        if (s.has(id)) return false;
        s.add(id);
        return true;
      });
    },
    toggleMaterialsCreateSort() {
      this.materialsSortAsc = !this.materialsSortAsc;
      this.applyMaterialsSort();
    },
    applyMaterialsSort() {
      const asc = this.materialsSortAsc;
      this.materials = [...(this.materials || [])].sort((a, b) => {
        const ta = new Date(a && a.createTime ? a.createTime : 0).getTime();
        const tb = new Date(b && b.createTime ? b.createTime : 0).getTime();
        return asc ? ta - tb : tb - ta;
      });
    },
    toggleMaterialsIdSort() {
      this.materialsIdSortAsc = !this.materialsIdSortAsc;
      const asc = this.materialsIdSortAsc;
      this.materials = [...(this.materials || [])].sort((a, b) => {
        const ia = Number(a && a.id ? a.id : 0);
        const ib = Number(b && b.id ? b.id : 0);
        return asc ? ia - ib : ib - ia;
      });
    },
    toggleWorksCreateSort() {
      this.worksSortAsc = !this.worksSortAsc;
      this.applyWorksSort();
    },
    applyWorksSort() {
      const asc = this.worksSortAsc;
      this.works = [...(this.works || [])].sort((a, b) => {
        const ta = new Date(a && a.createTime ? a.createTime : 0).getTime();
        const tb = new Date(b && b.createTime ? b.createTime : 0).getTime();
        return asc ? ta - tb : tb - ta;
      });
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
    toggleOrdersTimeSort() {
      this.ordersSortAsc = !this.ordersSortAsc;
      this.applyOrdersSort();
    },
    applyOrdersSort() {
      const asc = this.ordersSortAsc;
      this.orders = [...(this.orders || [])].sort((a, b) => {
        const ta = new Date(
          a && a.transactionDate ? a.transactionDate : 0
        ).getTime();
        const tb = new Date(
          b && b.transactionDate ? b.transactionDate : 0
        ).getTime();
        return asc ? ta - tb : tb - ta;
      });
    },
    toggleOrdersIdSort() {
      this.ordersIdSortAsc = !this.ordersIdSortAsc;
      const asc = this.ordersIdSortAsc;
      this.orders = [...(this.orders || [])].sort((a, b) => {
        const ia = Number(a && a.id ? a.id : 0);
        const ib = Number(b && b.id ? b.id : 0);
        return asc ? ia - ib : ib - ia;
      });
    },
    toggleRechargesTimeSort() {
      this.rechargesSortAsc = !this.rechargesSortAsc;
      this.applyRechargesSort();
    },
    applyRechargesSort() {
      const asc = this.rechargesSortAsc;
      this.recharges = [...(this.recharges || [])].sort((a, b) => {
        const ta = new Date(a && a.rechargeDate ? a.rechargeDate : 0).getTime();
        const tb = new Date(b && b.rechargeDate ? b.rechargeDate : 0).getTime();
        return asc ? ta - tb : tb - ta;
      });
    },
    toggleRechargesIdSort() {
      this.rechargesIdSortAsc = !this.rechargesIdSortAsc;
      const asc = this.rechargesIdSortAsc;
      this.recharges = [...(this.recharges || [])].sort((a, b) => {
        const ia = Number(a && a.id ? a.id : 0);
        const ib = Number(b && b.id ? b.id : 0);
        return asc ? ia - ib : ib - ia;
      });
    },
    togglePointsTimeSort() {
      this.pointsSortAsc = !this.pointsSortAsc;
      this.applyPointsSort();
    },
    applyPointsSort() {
      const asc = this.pointsSortAsc;
      this.points = [...(this.points || [])].sort((a, b) => {
        const ta = new Date(
          a && a.transactionDate ? a.transactionDate : 0
        ).getTime();
        const tb = new Date(
          b && b.transactionDate ? b.transactionDate : 0
        ).getTime();
        return asc ? ta - tb : tb - ta;
      });
    },
    togglePointsIdSort() {
      this.pointsIdSortAsc = !this.pointsIdSortAsc;
      const asc = this.pointsIdSortAsc;
      this.points = [...(this.points || [])].sort((a, b) => {
        const ia = Number(a && a.id ? a.id : 0);
        const ib = Number(b && b.id ? b.id : 0);
        return asc ? ia - ib : ib - ia;
      });
    },
    togglePricingIdSort() {
      this.itemsIdSortAsc = !this.itemsIdSortAsc;
      const asc = this.itemsIdSortAsc;
      this.items = [...(this.items || [])].sort((a, b) => {
        const ia = Number(a && a.id ? a.id : 0);
        const ib = Number(b && b.id ? b.id : 0);
        return asc ? ia - ib : ib - ia;
      });
    },
    toggleMappingIdSort() {
      this.mappingIdSortAsc = !this.mappingIdSortAsc;
      const asc = this.mappingIdSortAsc;
      this.mapping = [...(this.mapping || [])].sort((a, b) => {
        const ia = Number(a && a.id ? a.id : 0);
        const ib = Number(b && b.id ? b.id : 0);
        return asc ? ia - ib : ib - ia;
      });
    },
    async toggleExpandWork(w) {
      w._expanded = !w._expanded;
      if (w._expanded && !w._detail) {
        try {
          const detail = await getCreativeWorkDetail(w.id, this.token);
          w._detail = detail || {};
        } catch (e) {
          this.error = e && e.message ? e.message : "作品详情获取失败";
        }
      }
    },
    async publishWorkItem(id) {
      if (!this.token) {
        this.error = "请先登录以进行上架操作";
        return;
      }
      try {
        await publishCreativeWork(id, this.token);
        await this.loadWorks();
      } catch (e) {
        this.error = e && e.message ? e.message : "上架作品失败";
      }
    },
    async unpublishWorkItem(id) {
      if (!this.token) {
        this.error = "请先登录以进行下架操作";
        return;
      }
      try {
        await unpublishCreativeWork(id, this.token);
        await this.loadWorks();
      } catch (e) {
        this.error = e && e.message ? e.message : "下架作品失败";
      }
    },
    startWorkEdit(w, field) {
      w._editingField = field;
      const current =
        (w._detail && w._detail.isPublic) !== undefined
          ? w._detail.isPublic
          : w.isPublic;
      w._isPublicEdit = !!current;
      this.$nextTick(() => {
        const input = this.$refs[`work-input-${w.id}-${field}`];
        if (input && input[0]) input[0].focus();
        else if (input) input.focus();
      });
    },
    async stopWorkEdit(w) {
      if (w._editingField !== "isPublic") {
        w._editingField = null;
        return;
      }
      const wid = (w._detail && w._detail.id) || w.id;
      const nextPublic = !!w._isPublicEdit;
      const currentPublic =
        (w._detail && w._detail.isPublic) !== undefined
          ? w._detail.isPublic
          : w.isPublic;
      w._editingField = null;
      if (!this.token) {
        this.error = "请先登录以进行状态修改";
        return;
      }
      if (nextPublic === currentPublic) {
        return;
      }
      try {
        if (nextPublic) {
          await publishCreativeWork(wid, this.token);
        } else {
          await unpublishCreativeWork(wid, this.token);
        }
        if (w._detail && w._detail.isPublic !== undefined) {
          w._detail.isPublic = nextPublic;
        } else {
          w.isPublic = nextPublic;
        }
      } catch (e) {
        this.error = e && e.message ? e.message : "状态修改失败";
      }
    },
    async toggleWorkPublic(w) {
      const wid = (w._detail && w._detail.id) || w.id;
      const isPublic =
        (w._detail && w._detail.isPublic) !== undefined
          ? w._detail.isPublic
          : w.isPublic;
      if (!this.token) {
        this.error = "请先登录以进行状态修改";
        return;
      }
      try {
        if (isPublic) {
          await unpublishCreativeWork(wid, this.token);
        } else {
          await publishCreativeWork(wid, this.token);
        }
        await this.loadWorks();
      } catch (e) {
        this.error = e && e.message ? e.message : "状态修改失败";
      }
    },
    startEdit(item, field) {
      item._editingField = field;
      this.$nextTick(() => {
        const input = this.$refs[`input-${item.id}-${field}`];
        if (input && input[0]) {
          input[0].focus();
        } else if (input) {
          input.focus();
        }
      });
    },
    async stopEdit(item) {
      if (!item._editingField) return;
      item._editingField = null;
      const payload = {
        id: item.id,
        service_content: item.serviceContent,
        service_type: item.serviceType,
        function_node: item.functionNode,
        model_name: item.modelName,
        base_points_price: item.basePointsPrice,
        discount_rate: item.discountRate,
        discount_start_time: item.discountStartTime,
        discount_end_time: item.discountEndTime,
        cost_points: item.costPoints,
        points_to_cash_ratio: item.pointsToCashRatio,
      };
      try {
        await updatePricing(payload, this.token);
      } catch (e) {
        this.error = e && e.message ? e.message : "更新失败";
      }
    },
    startUserEdit(user, field) {
      user._editingField = field;
    },
    async stopUserEdit(user) {
      if (!user._editingField) return;
      user._editingField = null;
      try {
        await updateUserStatus(user.id, Number(user.status), this.token);
      } catch (e) {
        this.error = e && e.message ? e.message : "状态更新失败";
        await this.loadUsers();
      }
    },
    formatTime(val) {
      if (!val) return "";
      return String(val).replace("T", " ").replace("Z", "");
    },
    openImagePreview(src) {
      if (!src) return;
      this.previewSrc = src;
      this.previewType = "image";
      this.previewVisible = true;
    },
    openVideoPreview(src) {
      if (!src) return;
      this.previewSrc = src;
      this.previewType = "video";
      this.previewVisible = true;
    },
    closePreview() {
      this.previewVisible = false;
      this.previewSrc = "";
      this.previewType = "";
    },
  },
};
