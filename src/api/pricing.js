const BASE_URL = "https://www.xydriftcraft.com:1770";

function buildQuery(params) {
  const q = Object.entries(params || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return q ? `?${q}` : "";
}

async function request(path, { method = "GET", token, params, body } = {}) {
  const url =
    BASE_URL + path + (method === "GET" ? buildQuery(params || {}) : "");
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
