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
  remark?: string;
  createTime?: string;
  updateTime?: string;
  loginIp?: string;
  loginDate?: string;
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
