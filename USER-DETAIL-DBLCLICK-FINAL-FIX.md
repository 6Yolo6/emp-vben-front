# 用户详情双击事件最终修复

## 修复时间
2025-10-28

## 问题分析

经过多次尝试，发现 Vben 封装的 `useVbenVxeGrid` 需要使用特定的方式来绑定事件。

### 尝试过的方法

1. ❌ **在 gridOptions 中直接配置 `cellDblclick`**
   ```typescript
   gridOptions: {
     cellDblclick: handleRowDblClick,
   }
   ```
   - 不生效

2. ❌ **在模板中使用 `@cell-dblclick`**
   ```vue
   <Grid @cell-dblclick="handleRowDblClick">
   ```
   - 不生效

3. ❌ **使用 `gridEvents` 对象**
   ```typescript
   const gridEvents = {
     cellDblclick: handleRowDblClick,
   };
   ```
   - 不生效

### 最终解决方案

✅ **在 gridOptions 中使用 `onCellDblclick`（Vue 3 的事件绑定方式）**

```typescript
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useGridColumns(),
    height: 'auto',
    keepSource: true,
    // 使用 on + 事件名首字母大写 的方式
    onCellDblclick: handleRowDblclick,
    // ...
  },
});
```

## 关键点

1. **Vue 3 事件绑定规则**
   - 在对象中绑定事件时，使用 `on` + 事件名（首字母大写）
   - 例如：`cellDblclick` → `onCellDblclick`

2. **事件处理函数**
   ```typescript
   function handleRowDblClick(params: any) {
     console.log('双击事件参数:', params);
     const row = params.row || params;
     handleViewDetail(row);
   }
   ```

3. **获取完整用户数据**
   ```typescript
   async function handleViewDetail(row: any) {
     try {
       const userDetail = await getUserDetailApi(row.id);
       detailModalApi.setData(userDetail).open();
     } catch (error) {
       console.error('获取用户详情失败:', error);
       message.error('获取用户详情失败');
     }
   }
   ```

## 修改的文件

- `emp-vben-admin/apps/web-antd/src/views/system/user/index.vue`

## 测试步骤

1. 打开用户管理页面
2. 双击任意用户行
3. 应该打开用户详情弹窗
4. 控制台应该输出双击事件参数
5. 弹窗应该显示用户的所有单位信息

## Vue 3 事件绑定规则参考

在 Vue 3 中，当在对象中绑定事件时：

| VxeTable 事件名 | gridOptions 中的属性名 |
|----------------|----------------------|
| `cell-click` | `onCellClick` |
| `cell-dblclick` | `onCellDblclick` |
| `row-click` | `onRowClick` |
| `checkbox-change` | `onCheckboxChange` |

规则：`on` + 事件名转为驼峰格式（首字母大写）

## 相关文档

- [Vue 3 事件处理文档](https://vuejs.org/guide/essentials/event-handling.html)
- [VxeTable 事件文档](https://vxetable.cn/#/grid/api)
- [用户详情查看功能文档](./USER-DETAIL-VIEW-COMPLETED.md)
