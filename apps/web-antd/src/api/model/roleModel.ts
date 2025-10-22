export interface Role {
  id?: number;
  roleName: string;
  roleKey: string;
  roleSort?: number;
  dataScope?: number;
  menuCheckStrictly?: boolean;
  deptCheckStrictly?: boolean;
  status?: number;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface RolePageParams {
  pageNum?: number;
  pageSize?: number;
  roleName?: string;
  roleKey?: string;
  status?: number;
}

export interface RolePageResult {
  records: Role[];
  totalRow: number;
  pageNum: number;
  pageSize: number;
}
