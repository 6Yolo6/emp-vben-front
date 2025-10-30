import type { VxeGridProps } from '#/adapter/vxe-table';

export function useGridColumns(): VxeGridProps['columns'] {
  return [
    {
      type: 'seq',
      width: 60,
      title: '序号',
    },
    {
      field: 'tenantCode',
      title: '租户编码',
      width: 150,
    },
    {
      field: 'tenantName',
      title: '租户名称',
      width: 200,
    },
    {
      field: 'tenantType',
      title: '租户类型',
      width: 120,
    },
    {
      field: 'contactName',
      title: '联系人',
      width: 120,
    },
    {
      field: 'contactPhone',
      title: '联系电话',
      width: 150,
    },
    {
      field: 'contactEmail',
      title: '联系邮箱',
      width: 200,
    },
    {
      field: 'expireTime',
      title: '过期时间',
      width: 180,
    },
    {
      field: 'accountLimit',
      title: '账号限制',
      width: 100,
    },
    {
      field: 'status',
      title: '状态',
      width: 100,
      slots: { default: 'status' },
    },
    {
      field: 'createTime',
      title: '创建时间',
      width: 180,
    },
    {
      field: 'action',
      title: '操作',
      width: 200,
      fixed: 'right',
      slots: { default: 'action' },
    },
  ];
}
