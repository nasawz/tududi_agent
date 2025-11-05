import axios from 'axios';
import https__default from 'https';

const API_CONFIG = {
  BASE_URL: process.env.TUDUDI_BASE_URL || "https://competent_shaw.orb.local",
  TIMEOUT: 15e3
};
const httpsAgent = new https__default.Agent({
  rejectUnauthorized: false
});
async function apiRequest(endpoint, options = {}, cookie) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  try {
    const axiosConfig = {
      method: (options.method || "GET").toLowerCase(),
      url,
      headers: {
        "Cookie": cookie || "",
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...options.headers
      },
      httpsAgent,
      withCredentials: true,
      timeout: API_CONFIG.TIMEOUT,
      validateStatus: (status) => status < 500,
      // 只在5xx错误时抛出异常
      data: options.body
    };
    const response = await axios(axiosConfig);
    const data = response.data;
    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data
      };
    } else {
      return {
        success: false,
        error: data?.error || `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        error: error.response.data?.error || `HTTP ${error.response.status}: ${error.response.statusText}`
      };
    } else if (error.request) {
      return {
        success: false,
        error: "\u6CA1\u6709\u6536\u5230\u670D\u52A1\u5668\u54CD\u5E94"
      };
    } else {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}
async function apiRequestWithRetry(endpoint, options = {}, maxAttempts = 3, cookie) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await apiRequest(endpoint, options, cookie);
    if (result.success) {
      return result;
    }
    const isLockError = result.error?.includes("database is locked") || result.error?.includes("SQLITE_BUSY");
    if (!isLockError || attempt === maxAttempts) {
      return result;
    }
    const delay = Math.pow(2, attempt - 1) * 1e3;
    await new Promise((resolve) => setTimeout(resolve, delay));
    lastError = result.error;
  }
  return {
    success: false,
    error: lastError
  };
}
async function apiGet(endpoint, params, cookie) {
  const url = new URL(endpoint, API_CONFIG.BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== void 0 && value !== null && value !== "") {
        url.searchParams.append(key, value);
      }
    });
  }
  return apiRequestWithRetry(url.pathname + url.search, {
    method: "GET"
  }, 3, cookie);
}
async function apiPost(endpoint, data, cookie) {
  return apiRequestWithRetry(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : void 0
  }, 3, cookie);
}
async function apiPatch(endpoint, data, cookie) {
  return apiRequestWithRetry(endpoint, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : void 0
  }, 3, cookie);
}
async function apiDelete(endpoint, cookie) {
  return apiRequestWithRetry(endpoint, {
    method: "DELETE"
  }, 3, cookie);
}

function getTududiCookie(runtimeContext) {
  const registry = runtimeContext?.registry;
  return registry?.get("TUDUDI_COOKIE") || "";
}

export { apiPost as a, apiDelete as b, apiGet as c, apiPatch as d, getTududiCookie as g };
