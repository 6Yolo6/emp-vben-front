import type { VxeTableGridOptions } from '#/adapter/vxe-table';

/** 列表的字段 */
export function useGridColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'username',
      title: '用户名',
      minWidth: 120,
    },
    {
      field: 'nickname',
      title: '昵称',
      minWidth: 120,
    },
    {
      field: 'primaryTenantName',
      title: '主单位',
      minWidth: 120,
      formatter: ({ cellValue }) => {
        return cellValue || '-';
      },
    },
    {
      field: 'primaryDeptName',
      title: '部门',
      minWidth: 120,
      formatter: ({ cellValue }) => {
        return cellValue || '-';
      },
    },
    {
      field: 'primaryPostNames',
      title: '岗位',
      minWidth: 150,
      formatter: ({ cellValue }) => {
        if (!cellValue || !Array.isArray(cellValue)) return '-';
        return cellValue.join(', ');
      },
    },
    {
      field: 'primaryMainPostName',
      title: '主岗位',
      minWidth: 120,
      formatter: ({ cellValue }) => {
        return cellValue || '-';
      },
    },
    {
      field: 'email',
      title: '邮箱',
      minWidth: 180,
    },
    {
      field: 'mobile',
      title: '手机号',
      minWidth: 130,
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
      minWidth: 160,
      formatter: ({ cellValue }) => {
        if (!cellValue) return '';
        return cellValue.replace('T', ' ').slice(0, 19);
      },
    },
    {
      title: '操作',
      width: 350,
      fixed: 'right',
      slots: { default: 'actions' },
    },
  ];
}
