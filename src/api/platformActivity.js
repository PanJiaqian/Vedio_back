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

export async function getPlatformActivityList(params, token) {
  const json = await request("/admin/v1/platform-activity/list", {
    method: "GET",
    token,
    params,
  });
  return json.data;
}

export async function createPlatformActivity(payload, token) {
  const json = await request("/admin/v1/platform-activity/create", {
    method: "POST",
    token,
    body: payload,
  });
  return json.data;
}

export async function updatePlatformActivity(payload, token) {
  const json = await request("/admin/v1/platform-activity/update", {
    method: "POST",
    token,
    body: payload,
  });
  return json.data;
}

export async function deletePlatformActivity(id, token) {
  const json = await request(`/admin/v1/platform-activity/delete/${id}`, {
    method: "POST",
    token,
  });
  return json.data;
}
