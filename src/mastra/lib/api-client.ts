/**
 * Tududi API 客户端
 * 基于笔记API测试经验创建
 */

import axios, { AxiosRequestConfig } from 'axios';
import https from 'https';
// API 配置
const API_CONFIG = {
  BASE_URL: process.env.TUDUDI_BASE_URL || 'https://competent_shaw.orb.local',
  TIMEOUT: 15000,
};

// 创建HTTPS代理实例，忽略自签名证书错误
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// 创建通用的 API 请求函数
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  cookie?: string
): Promise<{ success: boolean; data?: T; error?: string }> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  try {
    // 将 RequestInit 转换为 axios 配置
    const axiosConfig: AxiosRequestConfig = {
      method: (options.method || 'GET').toLowerCase() as any,
      url,
      headers: {
        'Cookie': cookie || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers as Record<string, string>),
      },
      httpsAgent,
      withCredentials: true,
      timeout: API_CONFIG.TIMEOUT,
      validateStatus: (status) => status < 500, // 只在5xx错误时抛出异常
      data: options.body,
    };

    const response = await axios(axiosConfig);

    const data = response.data;

    // 检查响应状态
    if (response.status >= 200 && response.status < 300) {
      // 即使状态码是 2xx，也要检查数据是否是错误对象
      if (data && typeof data === 'object' && data.error) {
        return {
          success: false,
          error: data.error,
        };
      }
      return {
        success: true,
        data,
      };
    } else {
      const errorMsg = data?.error || `HTTP ${response.status}: ${response.statusText}`;
      return {
        success: false,
        error: errorMsg,
      };
    }
  } catch (error: any) {
    // 处理 axios 错误
    if (error.response) {
      // 服务器响应了错误状态码
      const responseData = error.response.data;
      const errorMsg = responseData?.error || `HTTP ${error.response.status}: ${error.response.statusText}`;
      return {
        success: false,
        error: errorMsg,
      };
    } else if (error.request) {
      // 请求已发送但没有收到响应
      return {
        success: false,
        error: '没有收到服务器响应',
      };
    } else {
      // 其他错误
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// 带重试机制的 API 请求（避免 SQLite 锁定问题）
export async function apiRequestWithRetry<T = any>(
  endpoint: string,
  options: RequestInit = {},
  maxAttempts: number = 3,
  cookie?: string
): Promise<{ success: boolean; data?: T; error?: string }> {
  let lastError: string | undefined;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await apiRequest<T>(endpoint, options, cookie);

    if (result.success) {
      // 再次检查数据是否是错误对象（防止状态码是2xx但数据是错误的情况）
      if (result.data && typeof result.data === 'object' && (result.data as any).error) {
        const errorData = result.data as any;
        lastError = errorData.error;
        // 检查是否是数据库锁定错误
        const isLockError =
          lastError?.includes('database is locked') ||
          lastError?.includes('SQLITE_BUSY') ||
          errorData.details?.some((d: string) => d.includes('SQLITE_BUSY') || d.includes('database is locked'));
        
        if (isLockError && attempt < maxAttempts) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        return {
          success: false,
          error: lastError,
        };
      }
      return result;
    }

    // 检查是否是数据库锁定错误
    const isLockError =
      result.error?.includes('database is locked') ||
      result.error?.includes('SQLITE_BUSY');

    if (!isLockError || attempt === maxAttempts) {
      return result;
    }

    // 指数退避延迟
    const delay = Math.pow(2, attempt - 1) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    lastError = result.error;
  }

  return {
    success: false,
    error: lastError,
  };
}

// GET 请求
export async function apiGet<T = any>(
  endpoint: string,
  params?: Record<string, string>,
  cookie?: string
): Promise<{ success: boolean; data?: T; error?: string }> {
  const url = new URL(endpoint, API_CONFIG.BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });
  }

  return apiRequestWithRetry<T>(url.pathname + url.search, {
    method: 'GET',
  }, 3, cookie);
}

// POST 请求
export async function apiPost<T = any>(
  endpoint: string,
  data?: any,
  cookie?: string
): Promise<{ success: boolean; data?: T; error?: string }> {
  return apiRequestWithRetry<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  }, 3, cookie);
}

// PATCH 请求
export async function apiPatch<T = any>(
  endpoint: string,
  data?: any,
  cookie?: string
): Promise<{ success: boolean; data?: T; error?: string }> {
  return apiRequestWithRetry<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  }, 3, cookie);
}

// DELETE 请求
export async function apiDelete<T = any>(
  endpoint: string,
  cookie?: string
): Promise<{ success: boolean; data?: T; error?: string }> {
  return apiRequestWithRetry<T>(endpoint, {
    method: 'DELETE',
  }, 3, cookie);
}

export { API_CONFIG };
