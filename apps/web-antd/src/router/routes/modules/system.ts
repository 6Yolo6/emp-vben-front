import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:settings',
      order: 10,
      title: '系统管理',
    },
    name: 'System',
    path: '/system',
    children: [
      {
        name: 'SystemUser',
        path: '/system/user',
        component: () => import('#/views/system/user/index.vue'),
        meta: {
          icon: 'lucide:user',
          title: '用户管理',
        },
      },
      {
        name: 'SystemRole',
        path: '/system/role',
        component: () => import('#/views/system/role/index.vue'),
        meta: {
          icon: 'lucide:shield',
          title: '角色管理',
        },
      },
      {
        name: 'SystemPost',
        path: '/system/post',
        component: () => import('#/views/system/post/index.vue'),
        meta: {
          icon: 'lucide:briefcase',
          title: '岗位管理',
        },
      },
      {
        name: 'SystemDept',
        path: '/system/dept',
        component: () => import('#/views/system/dept/index.vue'),
        meta: {
          icon: 'lucide:building',
          title: '部门管理',
        },
      },
      {
        name: 'SystemMenu',
        path: '/system/menu',
        component: () => import('#/views/system/menu/index.vue'),
        meta: {
          icon: 'lucide:menu',
          title: '菜单管理',
        },
      },
      {
        name: 'SystemTenant',
        path: '/system/tenant',
        component: () => import('#/views/system/tenant/index.vue'),
        meta: {
          icon: 'lucide:building-2',
          title: '租户管理',
        },
      },
      {
        name: 'SystemDictType',
        path: '/system/dict/type',
        component: () => import('#/views/system/dict/type/index.vue'),
        meta: {
          icon: 'lucide:book-open',
          title: '字典管理',
          keepAlive: false,
        },
      },
      {
        name: 'SystemDictData',
        path: '/system/dict/data',
        component: () => import('#/views/system/dict/data/index.vue'),
        meta: {
          hideInMenu: true,
          title: '字典数据',
          keepAlive: false,
        },
      },
      {
        name: 'SystemConfig',
        path: '/system/config',
        component: () => import('#/views/system/config/index.vue'),
        meta: {
          icon: 'lucide:settings-2',
          title: '参数配置',
        },
      },
      {
        name: 'SystemFile',
        path: '/system/file',
        component: () => import('#/views/system/file/index.vue'),
        meta: {
          icon: 'lucide:file',
          title: '文件管理',
        },
      },
      {
        name: 'SystemMessage',
        path: '/system/message',
        component: () => import('#/views/system/message/index.vue'),
        meta: {
          icon: 'lucide:mail',
          title: '站内消息',
        },
      },
      {
        name: 'SystemMessageTemplate',
        path: '/system/message-template',
        component: () => import('#/views/system/message-template/index.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: '消息模板',
        },
      },
    ],
  },
];

export default routes;
