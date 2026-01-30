export const BASE_URL = "https://www.xydriftcraft.com:1770";

async function request(path, method, data) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch (e) {
    json = null;
  }
  if (!res.ok) {
    throw new Error((json && json.message) || "请求失败");
  }
  if (!json || typeof json.code === "undefined") {
    throw new Error("响应格式错误");
  }
  if (json.code !== 0) {
    throw new Error(json.message || "操作失败");
  }
  return json;
}

export async function adminLogin(payload) {
  const json = await request("/admin/v1/auth/login", "POST", payload);
  return json.data;
}

export async function adminRegister(payload) {
  const json = await request("/admin/v1/auth/register", "POST", payload);
  return json.data;
}
