<template>
  <div class="billing">
    <div class="layout">
      <div class="sidebar">
        <div class="menu-title">系统设置</div>
        <div
          :class="['menu-item', activeNav === 'pricing' ? 'active' : '']"
          @click="setNav('pricing')"
        >
          <span class="icon">💰</span>
          服务扣费配置
        </div>
        <div
          :class="['menu-item', activeNav === 'users' ? 'active' : '']"
          @click="setNav('users')"
        >
          <span class="icon">👥</span>
          用户管理
        </div>
        <div
          :class="['menu-item', activeNav === 'memberships' ? 'active' : '']"
          @click="setNav('memberships')"
        >
          <span class="icon">🎟️</span>
          会员订阅
        </div>
        <div
          :class="['menu-item', activeNav === 'orders' ? 'active' : '']"
          @click="setNav('orders')"
        >
          <span class="icon">🧾</span>
          订单列表
        </div>
        <div
          :class="['menu-item', activeNav === 'recharges' ? 'active' : '']"
          @click="setNav('recharges')"
        >
          <span class="icon">⚡</span>
          充值记录
        </div>
        <div
          :class="['menu-item', activeNav === 'points' ? 'active' : '']"
          @click="setNav('points')"
        >
          <span class="icon">➖</span>
          积分扣除记录
        </div>
        <div
          :class="['menu-item', activeNav === 'mapping' ? 'active' : '']"
          @click="setNav('mapping')"
        >
          <span class="icon">🧩</span>
          会员积分映射
        </div>
        <div
          :class="['menu-item', activeNav === 'materials' ? 'active' : '']"
          @click="setNav('materials')"
        >
          <span class="icon">🗂️</span>
          素材管理
        </div>
        <div
          :class="['menu-item', activeNav === 'works' ? 'active' : '']"
          @click="setNav('works')"
        >
          <span class="icon">🎬</span>
          作品列表
        </div>
      </div>

      <div class="content">
        <!-- Pricing View -->
        <template v-if="activeNav === 'pricing'">
          <div class="page-header">
            <h1>服务扣费配置</h1>
            <div class="actions">
              <select
                v-model="filters.service_type"
                class="input"
                @change="loadList"
              >
                <option value="video">视频</option>
                <option value="image">图片</option>
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
              <button class="btn primary" @click="openCreate">新增配置</button>
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
            <div v-if="loading" class="loading">加载中...</div>
            <div v-else-if="items.length === 0" class="empty">暂无数据</div>
            <div v-else>
              <template v-for="it in items" :key="it.id">
                <div class="tr" @click="toggleExpand(it)">
                  <div class="td">{{ it.id }}</div>
                  <div class="td">{{ it.serviceContent }}</div>
                  <div class="td">
                    <span class="tag">{{
                      it.serviceType === "video" ? "视频" : "图片"
                    }}</span>
                  </div>
                  <div class="td">{{ it.functionNode }}</div>
                  <div class="td">{{ it.modelName || "-" }}</div>
                  <div class="td highlight">{{ it.basePointsPrice }}</div>
                  <div class="td">{{ it.costPoints }}</div>
                  <div class="td success">
                    {{ (it.basePointsPrice - it.costPoints).toFixed(2) }}
                  </div>
                  <div class="td">
                    <span
                      :class="[
                        'status',
                        it.status === 1 ? 'online' : 'offline',
                      ]"
                    >
                      {{ it.status === 1 ? "启用" : "停用" }}
                    </span>
                  </div>
                  <div class="td ops">
                    <span
                      class="expand-icon"
                      :class="{ expanded: it._expanded }"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </div>
                </div>
                <div v-if="it._expanded" class="tr-detail">
                  <div class="detail-grid">
                    <div
                      class="detail-item"
                      @click.stop="startEdit(it, 'serviceContent')"
                    >
                      <label>服务内容</label>
                      <input
                        v-if="it._editingField === 'serviceContent'"
                        :ref="`input-${it.id}-serviceContent`"
                        v-model="it.serviceContent"
                        class="inline-input"
                        @blur="stopEdit(it)"
                        @keyup.enter="stopEdit(it)"
                        @click.stop
                      />
                      <span v-else>{{ it.serviceContent }}</span>
                    </div>
                    <div
                      class="detail-item"
                      @click.stop="startEdit(it, 'serviceType')"
                    >
                      <label>服务类型</label>
                      <select
                        v-if="it._editingField === 'serviceType'"
                        :ref="`input-${it.id}-serviceType`"
                        v-model="it.serviceType"
                        class="inline-input"
                        @blur="stopEdit(it)"
                        @change="stopEdit(it)"
                        @click.stop
                      >
                        <option value="video">视频</option>
                        <option value="image">图片</option>
                      </select>
                      <span v-else>{{
                        it.serviceType === "video" ? "视频" : "图片"
                      }}</span>
                    </div>
                    <div
                      class="detail-item"
                      @click.stop="startEdit(it, 'functionNode')"
                    >
                      <label>功能节点</label>
                      <input
                        v-if="it._editingField === 'functionNode'"
                        :ref="`input-${it.id}-functionNode`"
                        v-model="it.functionNode"
                        class="inline-input"
                        @blur="stopEdit(it)"
                        @keyup.enter="stopEdit(it)"
                        @click.stop
                      />
                      <span v-else>{{ it.functionNode }}</span>
                    </div>
                    <div
                      class="detail-item"
                      @click.stop="startEdit(it, 'modelName')"
                    >
                      <label>模型名称</label>
                      <input
                        v-if="it._editingField === 'modelName'"
                        :ref="`input-${it.id}-modelName`"
                        v-model="it.modelName"
                        class="inline-input"
                        @blur="stopEdit(it)"
                        @keyup.enter="stopEdit(it)"
                        @click.stop
                      />
                      <span v-else>{{ it.modelName || "-" }}</span>
                    </div>
                    <div
                      class="detail-item"
                      @click.stop="startEdit(it, 'basePointsPrice')"
                    >
                      <label>基础积分</label>
                      <input
                        v-if="it._editingField === 'basePointsPrice'"
                        :ref="`input-${it.id}-basePointsPrice`"
                        v-model.number="it.basePointsPrice"
                        class="inline-input"
                        type="number"
                        @blur="stopEdit(it)"
                        @keyup.enter="stopEdit(it)"
                        @click.stop
                      />
                      <span v-else>{{ it.basePointsPrice }}</span>
                    </div>
                    <div
                      class="detail-item"
                      @click.stop="startEdit(it, 'discountRate')"
                    >
                      <label>折扣率</label>
                      <div
                        v-if="it._editingField === 'discountRate'"
                        style="display: flex; align-items: center"
                      >
                        <input
                          :ref="`input-${it.id}-discountRate`"
                          v-model.number="it.discountRate"
                          class="inline-input"
                          type="number"
                          @blur="stopEdit(it)"
                          @keyup.enter="stopEdit(it)"
                          @click.stop
                        />
                        <span>%</span>
                      </div>
                      <span v-else>{{ it.discountRate }}%</span>
                    </div>
                    <div class="detail-item">
                      <label>折扣时间</label>
                      <span
                        >{{ formatTime(it.discountStartTime) }} -
                        {{ formatTime(it.discountEndTime) }}</span
                      >
                    </div>
                    <div
                      class="detail-item"
                      @click.stop="startEdit(it, 'costPoints')"
                    >
                      <label>成本积分</label>
                      <input
                        v-if="it._editingField === 'costPoints'"
                        :ref="`input-${it.id}-costPoints`"
                        v-model.number="it.costPoints"
                        class="inline-input"
                        type="number"
                        @blur="stopEdit(it)"
                        @keyup.enter="stopEdit(it)"
                        @click.stop
                      />
                      <span v-else>{{ it.costPoints }}</span>
                    </div>
                    <div
                      class="detail-item"
                      @click.stop="startEdit(it, 'pointsToCashRatio')"
                    >
                      <label>兑换比例</label>
                      <input
                        v-if="it._editingField === 'pointsToCashRatio'"
                        :ref="`input-${it.id}-pointsToCashRatio`"
                        v-model.number="it.pointsToCashRatio"
                        class="inline-input"
                        type="number"
                        @blur="stopEdit(it)"
                        @keyup.enter="stopEdit(it)"
                        @click.stop
                      />
                      <span v-else>{{ it.pointsToCashRatio }}</span>
                    </div>
                    <div class="detail-item full-width">
                      <div class="detail-actions">
                        <button
                          :class="[
                            'btn',
                            it.status === 1 ? 'danger' : 'success',
                          ]"
                          @click.stop="toggleStatus(it)"
                        >
                          {{ it.status === 1 ? "停用" : "启用" }}
                        </button>
                        <button
                          class="btn danger"
                          @click.stop="onDelete(it.id)"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- Membership Mapping View -->
        <template v-if="activeNav === 'mapping'">
          <div class="page-header">
            <h1>会员积分映射</h1>
          </div>
          <div class="table">
            <div class="mapping-thead">
              <div class="th">ID</div>
              <div class="th">会员等级</div>
              <div class="th">付费金额</div>
              <div class="th">积分</div>
              <div class="th">时长类型</div>
              <div class="th">时长值</div>
              <div class="th">操作</div>
            </div>
            <div v-if="mapping.length === 0" class="empty">暂无数据</div>
            <div v-else class="tbody">
              <template v-for="mm in mapping" :key="mm.id">
                <div class="mapping-tr" @click="toggleExpand(mm)">
                  <div class="td">{{ mm.id }}</div>
                  <div class="td">{{ mm.membershipLevel }}</div>
                  <div class="td">{{ mm.payFee }}</div>
                  <div class="td">{{ mm.points }}</div>
                  <div class="td">{{ mm.durationType }}</div>
                  <div class="td">{{ mm.durationValue }}</div>
                  <div class="td ops">
                    <span
                      class="expand-icon"
                      :class="{ expanded: mm._expanded }"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </div>
                </div>
                <div v-if="mm._expanded" class="tr-detail">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <label>ID</label>
                      <span>{{ mm.id }}</span>
                    </div>
                    <div
                      class="detail-item"
                      @click.stop="startMappingInline(mm, 'membership_level')"
                    >
                      <label>会员等级</label>
                      <input
                        v-if="mm._editingField === 'membership_level'"
                        :ref="`mapping-input-${mm.id}-membership_level`"
                        v-model="mappingForm.membership_level"
                        class="inline-input"
                        @blur="stopMappingInline(mm)"
                        @keyup.enter="stopMappingInline(mm)"
                        @click.stop
                      />
                      <span v-else>{{ mm.membershipLevel }}</span>
                    </div>
                    <div
                      class="detail-item"
                      @click.stop="startMappingInline(mm, 'pay_fee')"
                    >
                      <label>付费金额</label>
                      <input
                        v-if="mm._editingField === 'pay_fee'"
                        :ref="`mapping-input-${mm.id}-pay_fee`"
                        v-model.number="mappingForm.pay_fee"
                        class="inline-input"
                        type="number"
                        @blur="stopMappingInline(mm)"
                        @keyup.enter="stopMappingInline(mm)"
                        @click.stop
                      />
                      <span v-else>{{ mm.payFee }}</span>
                    </div>
                    <div
                      class="detail-item"
                      @click.stop="startMappingInline(mm, 'points')"
                    >
                      <label>积分</label>
                      <input
                        v-if="mm._editingField === 'points'"
                        :ref="`mapping-input-${mm.id}-points`"
                        v-model.number="mappingForm.points"
                        class="inline-input"
                        type="number"
                        @blur="stopMappingInline(mm)"
                        @keyup.enter="stopMappingInline(mm)"
                        @click.stop
                      />
                      <span v-else>{{ mm.points }}</span>
                    </div>
                    <div
                      class="detail-item"
                      @click.stop="startMappingInline(mm, 'duration_type')"
                    >
                      <label>时长类型</label>
                      <input
                        v-if="mm._editingField === 'duration_type'"
                        :ref="`mapping-input-${mm.id}-duration_type`"
                        v-model.number="mappingForm.duration_type"
                        class="inline-input"
                        type="number"
                        @blur="stopMappingInline(mm)"
                        @keyup.enter="stopMappingInline(mm)"
                        @click.stop
                      />
                      <span v-else>{{ mm.durationType }}</span>
                    </div>
                    <div
                      class="detail-item"
                      @click.stop="startMappingInline(mm, 'duration_value')"
                    >
                      <label>时长值</label>
                      <input
                        v-if="mm._editingField === 'duration_value'"
                        :ref="`mapping-input-${mm.id}-duration_value`"
                        v-model.number="mappingForm.duration_value"
                        class="inline-input"
                        type="number"
                        @blur="stopMappingInline(mm)"
                        @keyup.enter="stopMappingInline(mm)"
                        @click.stop
                      />
                      <span v-else>{{ mm.durationValue }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- Materials View -->
        <template v-if="activeNav === 'materials'">
          <div class="page-header">
            <h1>素材管理</h1>
            <div class="actions">
              <input
                v-model="materialsFilters.category"
                class="input"
                type="text"
                placeholder="分类"
                @change="loadMaterials"
              />
              <select
                v-model="materialsFilters.type"
                class="input"
                @change="loadMaterials"
              >
                <option value="COMMUNITY">COMMUNITY</option>
                <option value="PERSONAL">PERSONAL</option>
              </select>
              <div class="pagination-buttons">
                <span
                  >第 {{ materialsFilters.page }} 页 / 每页
                  {{ materialsFilters.size }}</span
                >
                <button
                  class="btn"
                  @click="changeMaterialsPage(-1)"
                  :disabled="materialsFilters.page === 1"
                >
                  上一页
                </button>
                <button class="btn" @click="changeMaterialsPage(1)">
                  下一页
                </button>
              </div>
            </div>
          </div>
          <div class="table">
            <div class="materials-thead">
              <div class="th">ID</div>
              <div class="th">名称</div>
              <div class="th">类别</div>
              <div class="th">类型</div>
              <div class="th">创建时间</div>
              <div class="th">操作</div>
            </div>
            <div v-if="materials.length === 0" class="empty">暂无数据</div>
            <div v-else class="tbody">
              <template v-for="m in materials" :key="m.id">
                <div class="materials-tr" @click="toggleExpand(m)">
                  <div class="td">{{ m.id }}</div>
                  <div class="td">{{ m.name }}</div>
                  <div class="td">{{ m.category }}</div>
                  <div class="td">{{ m.type }}</div>
                  <div class="td">{{ formatTime(m.createTime) }}</div>
                  <div class="td ops">
                    <span
                      class="expand-icon"
                      :class="{ expanded: m._expanded }"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </div>
                </div>
                <div v-if="m._expanded" class="tr-detail">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <label>ID</label>
                      <span>{{ m.id }}</span>
                    </div>
                    <div class="detail-item">
                      <label>名称</label>
                      <span>{{ m.name }}</span>
                    </div>
                    <div class="detail-item">
                      <label>分类</label>
                      <span>{{ m.category }}</span>
                    </div>
                    <div class="detail-item">
                      <label>性别</label>
                      <span>{{ m.gender }}</span>
                    </div>
                    <div class="detail-item">
                      <label>年龄段</label>
                      <span>{{ m.ageRange }}</span>
                    </div>
                    <div class="detail-item">
                      <label>主题描述</label>
                      <span>{{ m.themeDescription }}</span>
                    </div>
                    <div class="detail-item">
                      <label>类型</label>
                      <span>{{ m.type }}</span>
                    </div>
                    <div class="detail-item">
                      <label>用户ID</label>
                      <span>{{ m.userId }}</span>
                    </div>
                    <div class="detail-item">
                      <label>文件</label>
                      <span>
                        <img
                          v-if="m.fileUrl"
                          :src="m.fileUrl"
                          alt="material"
                          :style="{
                            width: '120px',
                            height: '120px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                          }"
                          @click.stop="openImagePreview(m.fileUrl)"
                        />
                        <span v-else>-</span>
                      </span>
                    </div>
                    <div class="detail-item">
                      <label>创建时间</label>
                      <span>{{ formatTime(m.createTime) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>更新时间</label>
                      <span>{{ formatTime(m.updateTime) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>昵称</label>
                      <span>{{ m.nickname }}</span>
                    </div>
                    <div class="detail-item">
                      <label>头像</label>
                      <span>
                        <img
                          v-if="m.avatar"
                          :src="m.avatar"
                          alt="avatar"
                          :style="{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }"
                          @click.stop="openImagePreview(m.avatar)"
                        />
                        <span v-else>-</span>
                      </span>
                    </div>
                    <div class="detail-item">
                      <label>用户状态</label>
                      <span>{{ m.userStatus === 1 ? "启用" : "停用" }}</span>
                    </div>
                    <div class="detail-item full-width">
                      <div class="detail-actions">
                        <button
                          class="btn success"
                          @click.stop="publishMaterialItem(m.id)"
                        >
                          上架公共素材
                        </button>
                        <button
                          class="btn danger"
                          @click.stop="removeMaterialItem(m.id)"
                        >
                          下架素材
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- Works View -->
        <template v-if="activeNav === 'works'">
          <div class="page-header">
            <h1>作品列表</h1>
            <div class="actions">
              <div class="pagination-buttons">
                <span
                  >第 {{ worksFilters.page }} 页 / 每页
                  {{ worksFilters.size }}</span
                >
                <button
                  class="btn"
                  @click="changeWorksPage(-1)"
                  :disabled="worksFilters.page === 1"
                >
                  上一页
                </button>
                <button class="btn" @click="changeWorksPage(1)">下一页</button>
              </div>
            </div>
          </div>
          <div class="table">
            <div class="works-thead">
              <div class="th">ID</div>
              <div class="th">标题</div>
              <div class="th">时长</div>
              <div class="th">创建时间</div>
              <div class="th">操作</div>
            </div>
            <div v-if="works.length === 0" class="empty">暂无数据</div>
            <div v-else class="tbody">
              <template v-for="w in works" :key="w.id">
                <div class="works-tr" @click="toggleExpandWork(w)">
                  <div class="td">{{ w.id }}</div>
                  <div class="td">{{ w.title }}</div>
                  <div class="td">{{ w.videoDuration }}</div>
                  <div class="td">{{ formatTime(w.createTime) }}</div>
                  <div class="td ops">
                    <span
                      class="expand-icon"
                      :class="{ expanded: w._expanded }"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </div>
                </div>
                <div v-if="w._expanded" class="tr-detail">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <label>ID</label>
                      <span>{{ (w._detail && w._detail.id) || w.id }}</span>
                    </div>
                    <div class="detail-item">
                      <label>用户ID</label>
                      <span>{{
                        (w._detail && w._detail.userId) || w.userId
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <label>标题</label>
                      <span>{{
                        (w._detail && w._detail.title) || w.title
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <label>描述</label>
                      <span>{{
                        (w._detail && w._detail.description) || w.description
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <label>封面</label>
                      <span>
                        <img
                          v-if="
                            (w._detail && w._detail.coverImageUrl) ||
                            w.coverImageUrl
                          "
                          :src="
                            (w._detail && w._detail.coverImageUrl) ||
                            w.coverImageUrl
                          "
                          alt="cover"
                          :style="{
                            width: '120px',
                            height: '120px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                          }"
                          @click.stop="
                            openImagePreview(
                              (w._detail && w._detail.coverImageUrl) ||
                                w.coverImageUrl
                            )
                          "
                        />
                        <span v-else>-</span>
                      </span>
                    </div>
                    <div class="detail-item">
                      <label>视频</label>
                      <span>
                        <video
                          v-if="(w._detail && w._detail.videoUrl) || w.videoUrl"
                          :src="(w._detail && w._detail.videoUrl) || w.videoUrl"
                          :style="{ width: '240px', height: '160px' }"
                          controls
                          @click.stop="
                            openImagePreview(
                              (w._detail && w._detail.coverImageUrl) ||
                                w.coverImageUrl ||
                                (w._detail && w._detail.videoUrl) ||
                                w.videoUrl
                            )
                          "
                        ></video>
                        <span v-else>-</span>
                      </span>
                    </div>
                    <div class="detail-item">
                      <label>时长</label>
                      <span>{{
                        (w._detail && w._detail.videoDuration) ||
                        w.videoDuration
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <label>大小</label>
                      <span>{{
                        (w._detail && w._detail.videoSize) || w.videoSize
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <label>脚本</label>
                      <span>{{
                        (w._detail && w._detail.scriptContent) ||
                        w.scriptContent
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <label>类型</label>
                      <span>{{
                        (w._detail && w._detail.genre) || w.genre
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <label>比例</label>
                      <span>{{
                        (w._detail && w._detail.aspectRatio) || w.aspectRatio
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <label>公开</label>
                      <select
                        v-if="w._editingField === 'isPublic'"
                        :ref="`work-input-${w.id}-isPublic`"
                        v-model="w._isPublicEdit"
                        class="inline-input"
                        @blur="stopWorkEdit(w)"
                        @change="stopWorkEdit(w)"
                        @click.stop
                      >
                        <option :value="true">上架</option>
                        <option :value="false">下架</option>
                      </select>
                      <span v-else @click.stop="startWorkEdit(w, 'isPublic')">
                        {{
                          (w._detail && w._detail.isPublic) ?? w.isPublic
                            ? "已上架"
                            : "未上架"
                        }}
                      </span>
                    </div>
                    <div class="detail-item">
                      <label>点赞</label>
                      <span>{{
                        (w._detail && w._detail.likeCount) || w.likeCount
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <label>权重</label>
                      <span>{{
                        (w._detail && w._detail.featuredWeight) ||
                        w.featuredWeight
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <label>状态</label>
                      <span>{{
                        (w._detail && w._detail.status) || w.status
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <label>发布时间</label>
                      <span>{{
                        formatTime(
                          (w._detail && w._detail.publishTime) || w.publishTime
                        )
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <label>创建时间</label>
                      <span>{{
                        formatTime(
                          (w._detail && w._detail.createTime) || w.createTime
                        )
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <label>更新时间</label>
                      <span>{{
                        formatTime(
                          (w._detail && w._detail.updateTime) || w.updateTime
                        )
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <label>昵称</label>
                      <span>{{
                        (w._detail && w._detail.nickname) || w.nickname
                      }}</span>
                    </div>
                    <div class="detail-item">
                      <label>头像</label>
                      <span>
                        <img
                          v-if="(w._detail && w._detail.avatar) || w.avatar"
                          :src="(w._detail && w._detail.avatar) || w.avatar"
                          alt="avatar"
                          :style="{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }"
                          @click.stop="
                            openImagePreview(
                              (w._detail && w._detail.avatar) || w.avatar
                            )
                          "
                        />
                        <span v-else>-</span>
                      </span>
                    </div>
                    <div class="detail-item">
                      <label>用户状态</label>
                      <span>{{
                        ((w._detail && w._detail.userStatus) ??
                          w.userStatus) === 1
                          ? "启用"
                          : "停用"
                      }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
        <!-- Memberships View -->
        <template v-if="activeNav === 'memberships'">
          <div class="page-header">
            <h1>会员订阅列表</h1>
            <div class="actions">
              <div class="pagination-buttons">
                <span
                  >第 {{ membershipsFilters.page }} 页 / 每页
                  {{ membershipsFilters.size }}</span
                >
                <button
                  class="btn"
                  @click="changeMembershipsPage(-1)"
                  :disabled="membershipsFilters.page === 1"
                >
                  上一页
                </button>
                <button class="btn" @click="changeMembershipsPage(1)">
                  下一页
                </button>
              </div>
            </div>
          </div>
          <div class="table">
            <div class="users-thead">
              <div class="th">ID</div>
              <div class="th">用户ID</div>
              <div class="th">会员等级</div>
              <div class="th">状态</div>
              <div class="th">开始时间</div>
              <div class="th">操作</div>
            </div>
            <div v-if="memberships.length === 0" class="empty">暂无数据</div>
            <div v-else class="tbody">
              <template v-for="m in memberships" :key="m.id">
                <div class="users-tr" @click="toggleExpand(m)">
                  <div class="td">{{ m.id }}</div>
                  <div class="td">{{ m.userId }}</div>
                  <div class="td">{{ m.membershipLevel || "-" }}</div>
                  <div class="td">{{ m.status ?? "-" }}</div>
                  <div class="td">
                    {{ formatTime(m.subscriptionStartDate) }}
                  </div>
                  <div class="td ops">
                    <span
                      class="expand-icon"
                      :class="{ expanded: m._expanded }"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </div>
                </div>
                <div v-if="m._expanded" class="tr-detail">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <label>ID</label>
                      <span>{{ m.id }}</span>
                    </div>
                    <div class="detail-item">
                      <label>用户ID</label>
                      <span>{{ m.userId }}</span>
                    </div>
                    <div class="detail-item">
                      <label>会员等级</label>
                      <span>{{ m.membershipLevel || "-" }}</span>
                    </div>
                    <div class="detail-item">
                      <label>状态</label>
                      <span>{{ m.status ?? "-" }}</span>
                    </div>
                    <div class="detail-item">
                      <label>积分余额</label>
                      <span>{{ m.pointsBalance }}</span>
                    </div>
                    <div class="detail-item">
                      <label>开始时间</label>
                      <span>{{ formatTime(m.subscriptionStartDate) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>结束时间</label>
                      <span>{{ formatTime(m.subscriptionEndDate) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>创建时间</label>
                      <span>{{ formatTime(m.createTime) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>更新时间</label>
                      <span>{{ formatTime(m.updateTime) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>昵称</label>
                      <span>{{ m.nickname }}</span>
                    </div>
                    <div class="detail-item">
                      <label>头像</label>
                      <span>
                        <img
                          v-if="m.avatar"
                          :src="m.avatar"
                          alt="avatar"
                          :style="{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }"
                          @click.stop="openImagePreview(m.avatar)"
                        />
                        <span v-else>-</span>
                      </span>
                    </div>
                    <div class="detail-item">
                      <label>用户状态</label>
                      <span>{{ m.userStatus === 1 ? "启用" : "停用" }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- Orders View -->
        <template v-if="activeNav === 'orders'">
          <div class="page-header">
            <h1>订单列表</h1>
            <div class="actions">
              <div class="pagination-buttons">
                <span
                  >第 {{ ordersFilters.page }} 页 / 每页
                  {{ ordersFilters.size }}</span
                >
                <button
                  class="btn"
                  @click="changeOrdersPage(-1)"
                  :disabled="ordersFilters.page === 1"
                >
                  上一页
                </button>
                <button class="btn" @click="changeOrdersPage(1)">下一页</button>
              </div>
            </div>
          </div>
          <div class="table">
            <div class="users-thead">
              <div class="th">ID</div>
              <div class="th">用户ID</div>
              <div class="th">金额</div>
              <div class="th">类型</div>
              <div class="th">交易时间</div>
              <div class="th">操作</div>
            </div>
            <div v-if="orders.length === 0" class="empty">暂无数据</div>
            <div v-else class="tbody">
              <template v-for="o in orders" :key="o.id">
                <div class="users-tr" @click="toggleExpand(o)">
                  <div class="td">{{ o.id }}</div>
                  <div class="td">{{ o.userId }}</div>
                  <div class="td">
                    {{ o.amount ?? 0 }}
                  </div>
                  <div class="td">{{ o.orderType ?? "-" }}</div>
                  <div class="td">
                    {{ formatTime(o.transactionDate) }}
                  </div>
                  <div class="td ops">
                    <span
                      class="expand-icon"
                      :class="{ expanded: o._expanded }"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </div>
                </div>
                <div v-if="o._expanded" class="tr-detail">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <label>ID</label>
                      <span>{{ o.id }}</span>
                    </div>
                    <div class="detail-item">
                      <label>订单号</label>
                      <span>{{ o.orderNo }}</span>
                    </div>
                    <div class="detail-item">
                      <label>用户ID</label>
                      <span>{{ o.userId }}</span>
                    </div>
                    <div class="detail-item">
                      <label>订单类型</label>
                      <span>{{ o.orderType ?? "-" }}</span>
                    </div>
                    <div class="detail-item">
                      <label>金额</label>
                      <span>{{ o.amount ?? 0 }}</span>
                    </div>
                    <div class="detail-item">
                      <label>支付渠道</label>
                      <span>{{ o.payChannel ?? "-" }}</span>
                    </div>
                    <div class="detail-item">
                      <label>外部交易号</label>
                      <span>{{ o.outTradeNo ?? "-" }}</span>
                    </div>
                    <div class="detail-item">
                      <label>交易时间</label>
                      <span>{{ formatTime(o.transactionDate) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>状态</label>
                      <span>{{ o.status ?? "-" }}</span>
                    </div>
                    <div class="detail-item">
                      <label>支付时间</label>
                      <span>{{ formatTime(o.payTime) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>创建时间</label>
                      <span>{{ formatTime(o.createTime) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>更新时间</label>
                      <span>{{ formatTime(o.updateTime) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>昵称</label>
                      <span>{{ o.nickname }}</span>
                    </div>
                    <div class="detail-item">
                      <label>头像</label>
                      <span>
                        <img
                          v-if="o.avatar"
                          :src="o.avatar"
                          alt="avatar"
                          :style="{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }"
                          @click.stop="openImagePreview(o.avatar)"
                        />
                        <span v-else>-</span>
                      </span>
                    </div>
                    <div class="detail-item">
                      <label>用户状态</label>
                      <span>{{ o.userStatus === 1 ? "启用" : "停用" }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- Points View -->
        <template v-if="activeNav === 'points'">
          <div class="page-header">
            <h1>积分扣除记录</h1>
            <div class="actions">
              <div class="pagination-buttons">
                <span
                  >第 {{ pointsFilters.page }} 页 / 每页
                  {{ pointsFilters.size }}</span
                >
                <button
                  class="btn"
                  @click="changePointsPage(-1)"
                  :disabled="pointsFilters.page === 1"
                >
                  上一页
                </button>
                <button class="btn" @click="changePointsPage(1)">下一页</button>
              </div>
            </div>
          </div>
          <div class="table">
            <div class="points-thead">
              <div class="th">ID</div>
              <div class="th">昵称</div>
              <div class="th">扣除积分</div>
              <div class="th">资源类型</div>
              <div class="th">资源ID</div>
              <div class="th">扣除时间</div>
              <div class="th">操作</div>
            </div>
            <div v-if="points.length === 0" class="empty">暂无数据</div>
            <div v-else class="tbody">
              <template v-for="p in points" :key="p.id">
                <div class="points-tr" @click="toggleExpand(p)">
                  <div class="td">{{ p.id }}</div>
                  <div class="td">{{ p.nickname }}</div>
                  <div class="td">{{ p.deductedPoints }}</div>
                  <div class="td">{{ p.resourceType }}</div>
                  <div class="td">{{ p.resourceId }}</div>
                  <div class="td">{{ formatTime(p.transactionDate) }}</div>
                  <div class="td ops">
                    <span
                      class="expand-icon"
                      :class="{ expanded: p._expanded }"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </div>
                </div>
                <div v-if="p._expanded" class="tr-detail">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <label>ID</label>
                      <span>{{ p.id }}</span>
                    </div>
                    <div class="detail-item">
                      <label>用户ID</label>
                      <span>{{ p.userId }}</span>
                    </div>
                    <div class="detail-item">
                      <label>扣除积分</label>
                      <span>{{ p.deductedPoints }}</span>
                    </div>
                    <div class="detail-item">
                      <label>资源类型</label>
                      <span>{{ p.resourceType }}</span>
                    </div>
                    <div class="detail-item">
                      <label>资源ID</label>
                      <span>{{ p.resourceId }}</span>
                    </div>
                    <div class="detail-item">
                      <label>扣除时间</label>
                      <span>{{ formatTime(p.transactionDate) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>创建时间</label>
                      <span>{{ formatTime(p.createTime) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>更新时间</label>
                      <span>{{ formatTime(p.updateTime) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>昵称</label>
                      <span>{{ p.nickname }}</span>
                    </div>
                    <div class="detail-item">
                      <label>头像</label>
                      <span>
                        <img
                          v-if="p.avatar"
                          :src="p.avatar"
                          alt="avatar"
                          :style="{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }"
                          @click.stop="openImagePreview(p.avatar)"
                        />
                        <span v-else>-</span>
                      </span>
                    </div>
                    <div class="detail-item">
                      <label>用户状态</label>
                      <span>{{ p.userStatus === 1 ? "启用" : "停用" }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- Recharges View -->
        <template v-if="activeNav === 'recharges'">
          <div class="page-header">
            <h1>充值记录</h1>
            <div class="actions">
              <div class="pagination-buttons">
                <span
                  >第 {{ rechargesFilters.page }} 页 / 每页
                  {{ rechargesFilters.size }}</span
                >
                <button
                  class="btn"
                  @click="changeRechargesPage(-1)"
                  :disabled="rechargesFilters.page === 1"
                >
                  上一页
                </button>
                <button class="btn" @click="changeRechargesPage(1)">
                  下一页
                </button>
              </div>
            </div>
          </div>
          <div class="table">
            <div class="users-thead">
              <div class="th">ID</div>
              <div class="th">昵称</div>
              <div class="th">充值金额</div>
              <div class="th">充值积分</div>
              <div class="th">充值时间</div>
              <div class="th">操作</div>
            </div>
            <div v-if="recharges.length === 0" class="empty">暂无数据</div>
            <div v-else class="tbody">
              <template v-for="r in recharges" :key="r.id">
                <div class="users-tr" @click="toggleExpand(r)">
                  <div class="td">{{ r.id }}</div>
                  <div class="td">{{ r.nickname }}</div>
                  <div class="td">{{ r.rechargeAmount }}</div>
                  <div class="td">{{ r.rechargePoints }}</div>
                  <div class="td">{{ formatTime(r.rechargeDate) }}</div>
                  <div class="td ops">
                    <span
                      class="expand-icon"
                      :class="{ expanded: r._expanded }"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </div>
                </div>
                <div v-if="r._expanded" class="tr-detail">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <label>ID</label>
                      <span>{{ r.id }}</span>
                    </div>
                    <div class="detail-item">
                      <label>昵称</label>
                      <span>{{ r.nickname }}</span>
                    </div>
                    <div class="detail-item">
                      <label>用户ID</label>
                      <span>{{ r.userId }}</span>
                    </div>
                    <div class="detail-item">
                      <label>充值金额</label>
                      <span>{{ r.rechargeAmount }}</span>
                    </div>
                    <div class="detail-item">
                      <label>充值积分</label>
                      <span>{{ r.rechargePoints }}</span>
                    </div>
                    <div class="detail-item">
                      <label>充值时间</label>
                      <span>{{ formatTime(r.rechargeDate) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>头像</label>
                      <span>
                        <img
                          v-if="r.avatar"
                          :src="r.avatar"
                          alt="avatar"
                          :style="{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }"
                          @click.stop="openImagePreview(r.avatar)"
                        />
                        <span v-else>-</span>
                      </span>
                    </div>
                    <div class="detail-item">
                      <label>用户状态</label>
                      <span>{{ r.userStatus === 1 ? "启用" : "停用" }}</span>
                    </div>
                    <div class="detail-item">
                      <label>创建时间</label>
                      <span>{{ formatTime(r.createTime) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>更新时间</label>
                      <span>{{ formatTime(r.updateTime) }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- Users View -->
        <template v-if="activeNav === 'users'">
          <div class="page-header">
            <h1>用户管理</h1>
            <div class="actions">
              <select
                v-model="usersFilters.status"
                class="input"
                @change="loadUsers"
              >
                <option :value="1">启用</option>
                <option :value="0">停用</option>
              </select>
            </div>
          </div>

          <div class="table">
            <div class="users-thead">
              <div class="th">ID</div>
              <div class="th">昵称</div>
              <div class="th">语言</div>
              <div class="th">状态</div>
              <div class="th">创建时间</div>
              <div class="th">操作</div>
            </div>
            <div v-if="users.length === 0" class="empty">暂无用户</div>
            <div v-else class="tbody">
              <template v-for="u in users" :key="u.id">
                <div class="users-tr" @click="toggleExpand(u)">
                  <div class="td">{{ u.id }}</div>
                  <div class="td">{{ u.nickname }}</div>
                  <div class="td">{{ u.language }}</div>
                  <div class="td">
                    <span
                      :class="['status', u.status === 1 ? 'online' : 'offline']"
                    >
                      {{ u.status === 1 ? "启用" : "停用" }}
                    </span>
                  </div>
                  <div class="td">{{ formatTime(u.createTime) }}</div>
                  <div class="td ops">
                    <span
                      class="expand-icon"
                      :class="{ expanded: u._expanded }"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </div>
                </div>
                <div v-if="u._expanded" class="tr-detail">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <label>ID</label>
                      <span>{{ u.id }}</span>
                    </div>
                    <div class="detail-item">
                      <label>昵称</label>
                      <span>{{ u.nickname }}</span>
                    </div>
                    <div class="detail-item">
                      <label>头像</label>
                      <span>
                        <img
                          v-if="u.avatar"
                          :src="u.avatar"
                          alt="avatar"
                          :style="{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }"
                          @click.stop="openImagePreview(u.avatar)"
                        />
                        <span v-else>-</span>
                      </span>
                    </div>
                    <div class="detail-item">
                      <label>语言</label>
                      <span>{{ u.language }}</span>
                    </div>
                    <div
                      class="detail-item"
                      @click.stop="startUserEdit(u, 'status')"
                    >
                      <label>状态</label>
                      <select
                        v-if="u._editingField === 'status'"
                        :ref="`input-${u.id}-status`"
                        v-model.number="u.status"
                        class="inline-input"
                        @blur="stopUserEdit(u)"
                        @change="stopUserEdit(u)"
                        @click.stop
                      >
                        <option :value="1">启用</option>
                        <option :value="0">停用</option>
                      </select>
                      <span v-else>{{ u.status === 1 ? "启用" : "停用" }}</span>
                    </div>
                    <div class="detail-item">
                      <label>最后登录时间</label>
                      <span>{{ formatTime(u.lastLoginTime) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>创建时间</label>
                      <span>{{ formatTime(u.createTime) }}</span>
                    </div>
                    <div class="detail-item">
                      <label>更新时间</label>
                      <span>{{ formatTime(u.updateTime) }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>

        <div v-if="error" class="error">{{ error }}</div>
      </div>
    </div>

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
            <div class="value">
              {{ detail?.serviceType === "video" ? "视频" : "图片" }}
            </div>
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
            <div class="label">折扣率</div>
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
                <option value="video">视频</option>
                <option value="image">图片</option>
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
              <label class="label">折扣率</label>
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
                <option value="video">视频</option>
                <option value="image">图片</option>
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
              <label class="label">折扣率</label>
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
    <div v-if="previewVisible" class="preview-overlay">
      <img :src="previewSrc" class="preview-img" />
      <button class="preview-close" @click="closePreview">×</button>
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
  getUsersList,
  updateUserStatus,
  getMembershipList,
  getOrderList,
  getRechargeList,
  getPointsList,
  getMembershipMapping,
  updateMembershipMapping,
  getMaterialsList,
  removeMaterial,
  publishMaterial,
  getCreativeWorksList,
  getCreativeWorkDetail,
  publishCreativeWork,
  unpublishCreativeWork,
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
      usersFilters: {
        status: 1,
        page: 1,
        size: 20,
      },
      users: [],
      membershipsFilters: {
        page: 1,
        size: 20,
      },
      memberships: [],
      ordersFilters: {
        page: 1,
        size: 20,
      },
      orders: [],
      rechargesFilters: {
        page: 1,
        size: 20,
      },
      recharges: [],
      pointsFilters: {
        page: 1,
        size: 20,
      },
      points: [],
      mapping: [],
      mappingForm: {
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
      },
      materials: [],
      worksFilters: {
        page: 1,
        size: 20,
      },
      works: [],
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
    async loadUsers() {
      if (!this.token) {
        this.error = "请先登录以查看用户列表";
        return;
      }
      try {
        const data = await getUsersList(this.usersFilters, this.token);
        this.users = (data && data.items) || [];
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
    async loadOrders() {
      if (!this.token) {
        this.error = "请先登录以查看订单列表";
        return;
      }
      try {
        const data = await getOrderList(this.ordersFilters, this.token);
        this.orders = (data && data.items) || [];
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
    async loadMaterials() {
      if (!this.token) {
        this.error = "请先登录以查看素材列表";
        return;
      }
      try {
        const data = await getMaterialsList(this.materialsFilters, this.token);
        this.materials = (data && data.items) || [];
      } catch (e) {
        this.error = e && e.message ? e.message : "素材列表获取失败";
      }
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
        this.error = "请先登录以进行下架操作";
        return;
      }
      try {
        await removeMaterial(id, this.token);
        await this.loadMaterials();
      } catch (e) {
        this.error = e && e.message ? e.message : "下架素材失败";
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
      } catch (e) {
        this.error = e && e.message ? e.message : "作品列表获取失败";
      }
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
</script>

<style scoped>
.billing {
  /* max-width: 1280px; */
  margin: 32px auto;
  padding: 0 24px;
  animation: fade-in 0.3s ease-out;
  min-height: calc(100vh - 128px);
  display: flex;
  flex-direction: column;
}

.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 32px;
  align-items: stretch;
  flex: 1;
}

/* Sidebar */
.sidebar {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
  /* Removed sticky to allow full stretch if desired, or keep sticky but full height */
  height: calc(100vh - 128px);
  position: sticky;
  top: 96px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.menu-title {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
  padding-left: 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  margin-bottom: 4px;
}

.menu-item:hover {
  background: #f3f4f6;
  color: var(--primary-color);
}

.menu-item.active {
  background: #eff6ff;
  color: var(--primary-color);
}

.menu-item .icon {
  margin-right: 12px;
  font-size: 18px;
}

/* Page Header */
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

/* Table */
.table {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--border-color);
}

.thead {
  display: grid;
  grid-template-columns: 80px 2fr 100px 120px 120px 100px 100px 100px 80px 80px;
  gap: 16px;
  align-items: center;
  padding: 16px 24px;
  background: #f9fafb;
  border-bottom: 1px solid var(--border-color);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tr {
  display: grid;
  grid-template-columns: 80px 2fr 100px 120px 120px 100px 100px 100px 80px 80px;
  gap: 16px;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
  color: var(--text-main);
  transition: background-color 0.15s;
  cursor: pointer;
}

.tr:hover {
  background-color: #f9fafb;
}

.tr:last-child {
  border-bottom: none;
}

.th,
.td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.td.ops {
  display: flex;
  justify-content: center;
  align-items: center;
}

.expand-icon {
  font-size: 12px;
  color: #9ca3af;
  transition: transform 0.3s;
}

.expand-icon.expanded {
  transform: rotate(180deg);
  color: var(--primary-color);
}

.tr-detail {
  background: #f8fafc;
  border-bottom: 1px solid #f3f4f6;
  padding: 24px;
  animation: slide-down 0.3s ease-out;
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.detail-item span {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.detail-item.full-width {
  grid-column: 1 / -1;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.detail-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Status Badge */
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

/* Modal Overrides */
.modal {
  width: 600px;
  max-width: 90vw;
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

/* Form Grid for Modal */
.modal-body .form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.modal-body .form .field:nth-last-child(2),
.modal-body .form .field:last-child,
.modal-body .form button {
  grid-column: span 2;
}

.empty {
  padding: 64px 0;
  text-align: center;
  color: var(--text-secondary);
}
.preview-modal {
  width: 80vw;
  max-width: 90vw;
}
.preview-img {
  max-width: 80vw;
  max-height: 80vh;
  border-radius: 8px;
}
.preview-video {
  width: 80vw;
  max-height: 80vh;
  border-radius: 8px;
}
/* Lightweight preview (no backdrop) */
.preview-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.preview-close {
  position: fixed;
  top: 24px;
  right: 24px;
  background: #111827;
  color: #fff;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  cursor: pointer;
  font-size: 18px;
  line-height: 32px;
}

/* Users Table Specifics */
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

/* Mapping Table Specifics */
.mapping-thead,
.mapping-tr {
  display: grid;
  grid-template-columns: 80px 1.5fr 1fr 1fr 1fr 1fr 100px;
  gap: 16px;
  padding: 12px 24px;
  align-items: center;
}

.mapping-thead {
  background: #f9fafb;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  font-size: 13px;
  color: var(--text-secondary);
}

.mapping-tr {
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
}

.mapping-tr:last-child {
  border-bottom: none;
}

/* Materials Table Specifics */
.materials-thead,
.materials-tr {
  display: grid;
  grid-template-columns: 80px 1.5fr 1fr 1fr 1.5fr 100px;
  gap: 16px;
  padding: 12px 24px;
  align-items: center;
}

.materials-thead {
  background: #f9fafb;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  font-size: 13px;
  color: var(--text-secondary);
}

.materials-tr {
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
}

.materials-tr:last-child {
  border-bottom: none;
}
/* Points Table Specifics */
/* Works Table Specifics */
.works-thead,
.works-tr {
  display: grid;
  grid-template-columns: 80px 2fr 1fr 1.5fr 100px;
  gap: 16px;
  padding: 12px 24px;
  align-items: center;
}

.works-thead {
  background: #f9fafb;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  font-size: 13px;
  color: var(--text-secondary);
}

.works-tr {
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
}

.works-tr:last-child {
  border-bottom: none;
}
/* Points Table Specifics */
.points-thead,
.points-tr {
  display: grid;
  grid-template-columns: 80px 1.5fr 1fr 1fr 1fr 1.5fr 100px;
  gap: 16px;
  padding: 12px 24px;
  align-items: center;
}

.points-thead {
  background: #f9fafb;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  font-size: 13px;
  color: var(--text-secondary);
}

.points-tr {
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
}

.points-tr:last-child {
  border-bottom: none;
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
.inline-input {
  font-size: 14px;
  padding: 4px 8px;
  border: 1px solid var(--primary-color);
  border-radius: 4px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  background: #fff;
  color: var(--text-main);
  min-height: 28px;
}
</style>
