/** 用户租户配置 */
export interface UserTenant {
  tenantId: number;
  tenantName?: string;
  isPrimary?: boolean;
  deptId?: number;
  deptName?: string;
  roleIds?: number[];
  roleNames?: string[];
  postIds?: number[];
  postNames?: string[];
  mainPostId?: number;
  mainPostName?: string;
  status?: number;
}

export interface User {
  id?: number;
  username: string;
  nickname?: string;
  password?: string;
  email?: string;
  mobile?: string;
  sex?: number;
  avatar?: string;
  status?: number;
  deptId?: number;
  postIds?: number[];
  roleIds?: number[];
  mainPostId?: number;
  mainPostName?: string;
  tenants?: UserTenant[];
  remark?: string;
  createTime?: string;
  updateTime?: string;
  loginIp?: string;
  loginDate?: string;
  // 主单位信息（用于列表显示）
  primaryTenantName?: string;
  primaryDeptName?: string;
  primaryPostNames?: string[];
  primaryMainPostName?: string;
  primaryStatus?: number;
  primaryStatusName?: string;
}

export interface UserPageParams {
  pageNum?: number;
  pageSize?: number;
  username?: string;
  nickname?: string;
  mobile?: string;
  status?: number;
  deptId?: number;
}

export interface UserPageResult {
  records: User[];
  totalRow: number;
  pageNum: number;
  pageSize: number;
}

export interface LoginParams {
  username: string;
  password: string;
  captcha?: string;
}

export interface LoginResult {
  token: string;
  userInfo: User;
}
