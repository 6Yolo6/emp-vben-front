export interface Post {
  id?: number;
  postCode: string;
  postName: string;
  postSort?: number;
  status?: number;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface PostPageParams {
  pageNum?: number;
  pageSize?: number;
  postName?: string;
  postCode?: string;
  status?: number;
}

export interface PostPageResult {
  records: Post[];
  totalRow: number;
  pageNum: number;
  pageSize: number;
}
