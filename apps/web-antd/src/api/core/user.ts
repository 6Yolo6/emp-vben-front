import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 * 适配后端接口：/auth/getInfo
 */
export async function getUserInfoApi() {
  const userInfo = await requestClient.get<any>('/auth/getInfo');

  // 将后端返回的用户信息转换为 Vben 期望的格式
  return {
    userId: userInfo.id?.toString() || '',
    username: userInfo.username || '',
    realName: userInfo.nickname || userInfo.username || '',
    avatar: userInfo.avatar || '',
    desc: userInfo.remark || '',
    homePath: '/dashboard',
    roles: userInfo.roles || [],
  } as UserInfo;
}
