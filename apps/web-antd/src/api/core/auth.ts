import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
    userInfo?: any;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 * 适配后端返回格式：{ code: 200, data: { token: string, userInfo: {...} } }
 */
export async function loginApi(data: AuthApi.LoginParams) {
  const result = await requestClient.post<{ token: string; userInfo: any }>(
    '/auth/login',
    data,
  );
  // 将后端返回的 token 转换为 accessToken
  return {
    accessToken: result.token,
    userInfo: result.userInfo,
  };
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return requestClient.post('/auth/logout');
}

/**
 * 获取用户权限码
 * 从用户菜单中提取权限码
 * TODO: 后端需要实现 /system/menu/user-tree 接口
 */
export async function getAccessCodesApi() {
  try {
    // 调用后端接口: /system/menu/tree/user
    const menus = await requestClient.get<any[]>('/system/menu/tree/user');
    // 从菜单中提取权限码（perms字段）
    const codes: string[] = [];
    const extractPerms = (menuList: any[]) => {
      menuList.forEach((menu) => {
        if (menu.perms) {
          codes.push(menu.perms);
        }
        if (menu.children && menu.children.length > 0) {
          extractPerms(menu.children);
        }
      });
    };
    extractPerms(menus);
    return codes;
  } catch (error) {
    console.error('获取权限码失败:', error);
    return [];
  }
}
