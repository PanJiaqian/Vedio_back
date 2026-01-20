import { BASE_URL } from "./auth";

function buildQuery(params) {
  const q = Object.entries(params || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return q ? `?${q}` : "";
}

async function request(path, { method = "GET", token, params, body } = {}) {
  const isAbsolute = path.startsWith("http");
  const url =
    (isAbsolute ? path : BASE_URL + path) +
    (method === "GET" ? buildQuery(params || {}) : "");
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
    body: method !== "GET" && body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error("请求失败");
  }
  const json = await res.json();
  if (!json || json.code !== 0) {
    throw new Error((json && json.message) || "操作失败");
  }
  return json;
}

export async function getPricingList(params, token) {
  const json = await request("/admin/v1/ai-pricing/getlist", {
    method: "GET",
    token,
    params,
  });
  return json.data;
}

export async function getPricingDetail(id, token) {
  const json = await request("/admin/v1/ai-pricing/detail", {
    method: "GET",
    token,
    params: { id },
  });
  return json.data;
}

export async function deletePricing(id, token) {
  const json = await request("/admin/v1/ai-pricing/delete", {
    method: "POST",
    token,
    params: { id },
  });
  return json.data;
}

export async function setPricingStatus(payload, token) {
  const json = await request("/admin/v1/ai-pricing/status", {
    method: "POST",
    token,
    body: payload,
  });
  return json.data;
}

export async function updatePricing(payload, token) {
  const json = await request("/admin/v1/ai-pricing/update", {
    method: "POST",
    token,
    body: payload,
  });
  return json.data;
}

export async function createPricing(payload, token) {
  const json = await request("/admin/v1/ai-pricing/create", {
    method: "POST",
    token,
    body: payload,
  });
  return json.data;
}

export async function getUsersList(params, token) {
  const json = await request("/admin/v1/users", {
    method: "GET",
    token,
    params,
  });
  return json.data;
}

export async function getUserDetail(id, token) {
  const json = await request(`/admin/v1/users/${encodeURIComponent(id)}`, {
    method: "GET",
    token,
  });
  return json.data;
}

export async function updateUserStatus(id, status, token) {
  const json = await request(
    `/admin/v1/users/${encodeURIComponent(id)}/status`,
    {
      method: "POST",
      token,
      body: { status },
    }
  );
  return json.data;
}

export async function getMembershipList(params, token) {
  const json = await request("/admin/v1/memberships", {
    method: "GET",
    token,
    params,
  });
  return json.data;
}

export async function getOrderList(params, token) {
  const json = await request("/admin/v1/orders", {
    method: "GET",
    token,
    params,
  });
  return json.data;
}

export async function getRechargeList(params, token) {
  const json = await request("/admin/v1/recharges", {
    method: "GET",
    token,
    params,
  });
  return json.data;
}

export async function getPointsList(params, token) {
  const json = await request("/admin/v1/points", {
    method: "GET",
    token,
    params,
  });
  return json.data;
}

export async function getMembershipMapping(token) {
  const json = await request("/admin/v1/membership-mapping", {
    method: "GET",
    token,
  });
  return json.data;
}

export async function updateMembershipMapping(payload, token) {
  const json = await request("/admin/v1/membership-mapping", {
    method: "POST",
    token,
    body: payload,
  });
  return json.data;
}

export async function getMaterialsList(params, token) {
  const json = await request("/admin/v1/materials", {
    method: "GET",
    token,
    params,
  });
  return json.data;
}

export async function removeMaterial(id, token) {
  const json = await request(
    `/admin/v1/materials/${encodeURIComponent(id)}/remove`,
    {
      method: "POST",
      token,
    }
  );
  return json.data;
}

export async function publishMaterial(id, token) {
  const json = await request(
    `/admin/v1/materials/${encodeURIComponent(id)}/publish`,
    {
      method: "POST",
      token,
    }
  );
  return json.data;
}

export async function getCreativeWorksList(params, token) {
  const json = await request("/admin/v1/creative-works", {
    method: "GET",
    token,
    params,
  });
  return json.data;
}

export async function getCreativeWorkDetail(id, token) {
  const json = await request(
    `/admin/v1/creative-works/${encodeURIComponent(id)}`,
    {
      method: "GET",
      token,
    }
  );
  return json.data;
}

export async function publishCreativeWork(id, token) {
  const json = await request(
    `/admin/v1/creative-works/${encodeURIComponent(id)}/publish`,
    {
      method: "POST",
      token,
    }
  );
  return json.data;
}

export async function unpublishCreativeWork(id, token) {
  const json = await request(
    `/admin/v1/creative-works/${encodeURIComponent(id)}/unpublish`,
    {
      method: "POST",
      token,
    }
  );
  return json.data;
}

export async function searchMemberships(params, token) {
  const ctx =
    params && typeof params.context !== "undefined" ? params.context : "";
  const page = params && typeof params.page !== "undefined" ? params.page : 1;
  const size = params && typeof params.size !== "undefined" ? params.size : 20;
  const path = `/admin/v1/memberships/search?context=${encodeURIComponent(
    ctx
  )}&page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`;
  const json = await request(path, {
    method: "GET",
    token,
  });
  return json.data;
}

export async function searchMaterials(params, token) {
  const ctx =
    params && typeof params.context !== "undefined" ? params.context : "";
  const page = params && typeof params.page !== "undefined" ? params.page : 1;
  const size = params && typeof params.size !== "undefined" ? params.size : 20;
  const path = `/admin/v1/materials/search?context=${encodeURIComponent(
    ctx
  )}&page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`;
  const json = await request(path, {
    method: "GET",
    token,
  });
  return json.data;
}

export async function searchCreativeWorks(params, token) {
  const ctx =
    params && typeof params.context !== "undefined" ? params.context : "";
  const page = params && typeof params.page !== "undefined" ? params.page : 1;
  const size = params && typeof params.size !== "undefined" ? params.size : 20;
  const path = `/admin/v1/creative-works/search?context=${encodeURIComponent(
    ctx
  )}&page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`;
  const json = await request(path, {
    method: "GET",
    token,
  });
  return json.data;
}
