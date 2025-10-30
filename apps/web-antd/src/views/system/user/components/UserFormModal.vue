<script lang="ts" setup>
import { computed, ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  message,
  Collapse as ACollapse,
  CollapsePanel as ACollapsePanel,
  FormItem as AFormItem,
  Select as ASelect,
  TreeSelect as ATreeSelect,
  Checkbox as ACheckbox,
  RadioGroup as ARadioGroup,
  Radio as ARadio,
  Button as AButton,
  Switch as ASwitch,
} from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createUserApi,
  getDeptTreeApi,
  getPostListApi,
  getUserDetailApi,
  updateUserApi,
} from '#/api';
import { getDeptTreeByTenantApi } from '#/api/sys/dept';
import { getPostListByTenantApi } from '#/api/sys/post';
import { getTenantListApi } from '#/api/sys/tenant';

defineOptions({
  name: 'UserFormModal',
});

const emit = defineEmits(['success']);
const formData = ref<any>();

const tenantOptions = ref<any[]>([]);
const tenantConfigs = ref<any[]>([]); // 单位配置列表
const activeTenantKeys = ref<number[]>([]); // 展开的单位面板

// 为每个租户配置缓存数据
const tenantDataCache = ref<Map<number, { deptTree: any[]; postOptions: any[]; loading: boolean }>>(new Map());

const getTitle = computed(() => {
  return formData.value?.id ? '编辑用户' : '新增用户';
});

// 加载指定租户的数据
async function loadTenantData(tenantId: number) {
  // 检查缓存
  if (tenantDataCache.value.has(tenantId)) {
    const cached = tenantDataCache.value.get(tenantId)!;
    if (!cached.loading && cached.deptTree.length > 0) {
      return; // 已加载，直接返回
    }
  }
  
  // 设置加载状态
  tenantDataCache.value.set(tenantId, {
    deptTree: [],
    postOptions: [],
    loading: true
  });
  
  try {
    // 并行加载部门和岗位数据
    const [deptTree, postOptions] = await Promise.all([
      getDeptTreeByTenantApi(tenantId),
      getPostListByTenantApi(tenantId)
    ]);
    
    // 更新缓存
    tenantDataCache.value.set(tenantId, {
      deptTree,
      postOptions,
      loading: false
    });
  } catch (error) {
    console.error(`加载租户 ${tenantId} 的数据失败:`, error);
    tenantDataCache.value.set(tenantId, {
      deptTree: [],
      postOptions: [],
      loading: false
    });
  }
}

// 加载租户列表
async function loadTenantList() {
  try {
    const tenants = await getTenantListApi();
    tenantOptions.value = tenants;
  } catch (error) {
    console.error('加载租户列表失败:', error);
  }
}

// 获取指定租户的部门树
function getTenantDeptTree(tenantId: number | undefined): any[] {
  if (!tenantId) return [];
  
  const cached = tenantDataCache.value.get(tenantId);
  return cached?.deptTree || [];
}

// 获取指定租户的岗位列表
function getTenantPostOptions(tenantId: number | undefined): any[] {
  if (!tenantId) return [];
  
  const cached = tenantDataCache.value.get(tenantId);
  return cached?.postOptions || [];
}

// 获取某个单位的已选岗位选项（用于该单位的主岗位选择）
function getSelectedPostOptions(config: any) {
  if (!config.postIds || config.postIds.length === 0) {
    return [];
  }
  const tenantPosts = getTenantPostOptions(config.tenantId);
  return tenantPosts.filter((post: any) =>
    config.postIds.includes(post.id),
  );
}

// 添加单位配置
function addTenantConfig() {
  const newConfig = {
    tenantId: undefined,
    isPrimary: tenantConfigs.value.length === 0, // 第一个默认为主单位
    deptId: undefined,
    postIds: [],
    mainPostId: undefined, // 该单位的主岗位
    status: 1, // 默认在职
  };
  tenantConfigs.value.push(newConfig);
  activeTenantKeys.value.push(tenantConfigs.value.length - 1);
}

// 删除单位配置
function removeTenantConfig(index: number) {
  if (tenantConfigs.value.length <= 1) {
    message.warning('至少保留一个单位配置');
    return;
  }
  tenantConfigs.value.splice(index, 1);
  // 如果删除的是主单位，将第一个设为主单位
  const hasPrimary = tenantConfigs.value.some((c) => c.isPrimary);
  if (!hasPrimary) {
    tenantConfigs.value[0].isPrimary = true;
  }
}

// 主单位变更
function onPrimaryChange(index: number) {
  // 只能有一个主单位
  tenantConfigs.value.forEach((config, i) => {
    if (i !== index) {
      config.isPrimary = false;
    }
  });
}

// 监听租户配置变化，自动加载数据
watch(() => tenantConfigs.value, (newConfigs) => {
  // 为每个配置的租户加载数据
  newConfigs.forEach(config => {
    if (config.tenantId) {
      loadTenantData(config.tenantId);
    }
  });
}, { deep: true, immediate: true });

// 表单配置
const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  wrapperClass: 'grid-cols-2',
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      fieldName: 'id',
      dependencies: {
        triggerFields: [''],
        show: () => false,
      },
    },
    {
      fieldName: 'username',
      label: '用户名',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入用户名',
      },
      dependencies: {
        triggerFields: ['id'],
        componentProps: (values: any) => ({
          disabled: !!values.id,
        }),
      },
    },
    {
      fieldName: 'password',
      label: '密码',
      component: 'InputPassword',
      rules: 'required',
      componentProps: {
        placeholder: '请输入密码',
      },
      dependencies: {
        triggerFields: ['id'],
        show: (values: any) => !values.id,
      },
    },
    {
      fieldName: 'nickname',
      label: '昵称',
      component: 'Input',
      rules: 'required',
      componentProps: {
        placeholder: '请输入昵称',
      },
    },
    {
      fieldName: 'email',
      label: '邮箱',
      component: 'Input',
      componentProps: {
        placeholder: '请输入邮箱',
      },
    },
    {
      fieldName: 'mobile',
      label: '手机号',
      component: 'Input',
      componentProps: {
        placeholder: '请输入手机号',
      },
    },
    {
      fieldName: 'sex',
      label: '性别',
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '未知', value: 0 },
          { label: '男', value: 1 },
          { label: '女', value: 2 },
        ],
      },
      defaultValue: 0,
      dependencies: {
        triggerFields: ['id'],
        show: (values: any) => !values.id, // 只在新增时显示
      },
    },
    {
      fieldName: 'remark',
      label: '备注',
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入备注',
        rows: 3,
      },
      formItemClass: 'col-span-2',
    },
  ],
  showDefaultActions: false,
});

// Modal
const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }

    // 验证单位配置
    if (tenantConfigs.value.length === 0) {
      message.error('请至少配置一个单位');
      return;
    }

    // 验证每个单位配置
    for (let i = 0; i < tenantConfigs.value.length; i++) {
      const config = tenantConfigs.value[i];
      if (!config.tenantId) {
        message.error(`单位 ${i + 1} 未选择单位`);
        return;
      }
    }

    // 验证是否有主单位
    const hasPrimary = tenantConfigs.value.some((c) => c.isPrimary);
    if (!hasPrimary) {
      message.error('请设置一个主单位');
      return;
    }

    modalApi.lock();
    try {
      const data = await formApi.getValues();
      console.log('表单提交数据（处理前）:', data);

      // 编辑时，只提交 UserUpdateDTO 中定义的字段
      if (formData.value?.id) {
        const updateData: any = {
          nickname: data.nickname,
          email: data.email,
          mobile: data.mobile,
          remark: data.remark,
          tenants: tenantConfigs.value,
        };

        await updateUserApi(formData.value.id, updateData);
      } else {
        // 新增时提交 UserCreateDTO 中定义的字段
        const createData: any = {
          username: data.username,
          nickname: data.nickname,
          password: data.password,
          email: data.email,
          mobile: data.mobile,
          sex: data.sex,
          remark: data.remark,
          tenants: tenantConfigs.value,
        };

        await createUserApi(createData);
      }

      await modalApi.close();
      emit('success');
      message.success('操作成功');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      formData.value = undefined;
      return;
    }

    modalApi.lock();
    try {
      // 加载租户列表
      await loadTenantList();

      // 加载用户数据
      const data = modalApi.getData();
      if (data && data.id) {
        formData.value = await getUserDetailApi(data.id);
        console.log('加载的用户详情:', formData.value);

        // 检查是否有租户配置
        if (formData.value.tenants && formData.value.tenants.length > 0) {
          // 加载租户配置
          tenantConfigs.value = formData.value.tenants.map((t: any) => ({
            tenantId: t.tenantId,
            isPrimary: t.isPrimary,
            deptId: t.deptId,
            postIds: t.postIds || [],
            mainPostId: t.mainPostId,
            status: t.status || 1,
          }));
          // 展开所有租户面板
          activeTenantKeys.value = tenantConfigs.value.map((_, i) => i);
        } else {
          // 如果没有租户配置，初始化一个空配置
          tenantConfigs.value = [];
        }

        // 编辑时不加载密码字段
        const { password, tenants, ...formValues } = formData.value;
        // 设置到 values
        await formApi.setValues(formValues);
      } else {
        // 新增用户时，初始化空配置
        tenantConfigs.value = [];
      }
    } finally {
      modalApi.unlock();
    }
  },
});
</script>

<template>
  <Modal :title="getTitle" class="w-2/3">
    <div class="mx-4">
      <!-- 基本信息 -->
      <div class="mb-4">
        <h3 class="mb-2 text-base font-medium">基本信息</h3>
        <Form />
      </div>

      <!-- 单位配置 -->
      <div class="mb-4">
        <div class="mb-2 flex items-center justify-between">
          <h3 class="text-base font-medium">单位配置</h3>
          <a-button type="primary" size="small" @click="addTenantConfig">
            + 添加单位
          </a-button>
        </div>

        <!-- 单位配置列表 -->
        <div
          v-if="tenantConfigs.length === 0"
          class="rounded border border-dashed border-red-300 bg-red-50 py-8 text-center"
        >
          <p class="text-red-500">请至少配置一个单位</p>
          <p class="mt-2 text-sm text-gray-500">
            点击上方"添加单位"按钮进行配置
          </p>
        </div>

        <a-collapse v-else v-model:activeKey="activeTenantKeys" class="mb-2">
          <a-collapse-panel
            v-for="(config, index) in tenantConfigs"
            :key="index"
            :header="`单位 ${index + 1}${config.isPrimary ? ' (主单位)' : ''}`"
          >
            <template #extra>
              <a-button
                type="text"
                danger
                size="small"
                @click.stop="removeTenantConfig(index)"
              >
                删除
              </a-button>
            </template>

            <div class="grid grid-cols-3 gap-x-4 gap-y-3">
              <!-- 第一行：单位、部门、主单位 -->
              <a-form-item label="单位" required class="mb-0">
                <a-select
                  v-model:value="config.tenantId"
                  placeholder="请选择单位"
                  :options="tenantOptions"
                  :field-names="{ label: 'tenantName', value: 'id' }"
                  size="small"
                />
              </a-form-item>

              <a-form-item label="部门" class="mb-0">
                <a-tree-select
                  v-model:value="config.deptId"
                  placeholder="请先选择单位"
                  :tree-data="getTenantDeptTree(config.tenantId)"
                  :field-names="{
                    label: 'deptName',
                    value: 'id',
                    children: 'children',
                  }"
                  :disabled="!config.tenantId"
                  allow-clear
                  size="small"
                />
              </a-form-item>

              <a-form-item label="主单位" class="mb-0">
                <a-checkbox
                  v-model:checked="config.isPrimary"
                  @change="onPrimaryChange(index)"
                >
                  设为主单位
                </a-checkbox>
              </a-form-item>

              <!-- 第二行：岗位（跨2列）、状态 -->
              <a-form-item label="岗位" class="col-span-2 mb-0">
                <a-select
                  v-model:value="config.postIds"
                  mode="multiple"
                  placeholder="请先选择单位"
                  :options="getTenantPostOptions(config.tenantId)"
                  :field-names="{ label: 'postName', value: 'id' }"
                  :disabled="!config.tenantId"
                  size="small"
                />
              </a-form-item>

              <a-form-item label="状态" class="mb-0">
                <a-radio-group v-model:value="config.status" size="small">
                  <a-radio :value="1">在职</a-radio>
                  <a-radio :value="2">辞职</a-radio>
                  <a-radio :value="3">调出</a-radio>
                  <a-radio :value="4">退休</a-radio>
                </a-radio-group>
              </a-form-item>

              <!-- 第三行：主岗位（跨3列） -->
              <a-form-item
                label="主岗位"
                class="col-span-3 mb-0"
                help="从该单位的岗位中选择一个作为主岗位"
              >
                <a-select
                  v-model:value="config.mainPostId"
                  placeholder="请先选择岗位，然后选择主岗位"
                  :options="getSelectedPostOptions(config)"
                  :field-names="{ label: 'postName', value: 'id' }"
                  :disabled="!config.postIds || config.postIds.length === 0"
                  allow-clear
                  size="small"
                />
              </a-form-item>
            </div>
          </a-collapse-panel>
        </a-collapse>
      </div>
    </div>
  </Modal>
</template>
