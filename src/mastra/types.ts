/**
 * 共享的类型定义文件
 */

export interface TududiRuntimeContext {
  registry?: Map<string, string>;
}

/**
 * 从 runtime context 中安全地获取 TUDUDI_COOKIE
 */
export function getTududiCookie(runtimeContext: any): string {
  const registry = runtimeContext?.registry as Map<string, string> | undefined;
  return registry?.get('TUDUDI_COOKIE') || '';
}
