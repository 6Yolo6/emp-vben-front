export interface Dept {
  id?: number;
  parentId?: number;
  ancestors?: string;
  deptName: string;
  orderNum?: number;
  leader?: string;
  phone?: string;
  email?: string;
  status?: number;
  remark?: string;
  createTime?: string;
  updateTime?: string;
  children?: Dept[];
}

export interface DeptTreeNode extends Dept {
  children?: DeptTreeNode[];
}
