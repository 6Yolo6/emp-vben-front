export interface Menu {
  id?: number;
  parentId?: number;
  menuName: string;
  menuType: string; // M=目录, C=菜单, F=按钮
  icon?: string;
  path?: string;
  component?: string;
  perms?: string;
  orderNum?: number;
  visible?: number;
  status?: number;
  remark?: string;
  createTime?: string;
  updateTime?: string;
  children?: Menu[];
}

export interface MenuTreeNode extends Menu {
  children?: MenuTreeNode[];
}
