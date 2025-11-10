<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Image, message, Modal, Radio, Space, Tag, Upload } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteFileBatchApi,
  deleteFileApi,
  downloadFileUrl,
  getFilePageApi,
  uploadFileApi,
  uploadImageApi,
  type FileApi,
} from '#/api/sys/file';

const AButton = Button;
const AImage = Image;
const ARadioGroup = Radio.Group;
const ARadioButton = Radio.Button;
const ASpace = Space;
const ATag = Tag;
const AUpload = Upload;

defineOptions({
  name: 'SystemFile',
});

// 上传配置
const uploadStorageType = ref<number>(0); // 默认本地存储
const showUploadModal = ref(false);
const uploadType = ref<'file' | 'image'>('file');
const uploading = ref(false);

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

// 判断是否为图片
function isImage(fileType: string): boolean {
  return fileType && fileType.startsWith('image/');
}

// 显示上传对话框
function showUpload(type: 'file' | 'image') {
  uploadType.value = type;
  showUploadModal.value = true;
}

// 上传文件
async function handleUpload(file: File) {
  uploading.value = true;
  try {
    if (uploadType.value === 'image') {
      await uploadImageApi(file, uploadStorageType.value);
    } else {
      await uploadFileApi(file, uploadStorageType.value);
    }
    message.success('上传成功');
    showUploadModal.value = false;
    gridApi.query();
  } catch (error: any) {
    message.error(error.message || '上传失败');
  } finally {
    uploading.value = false;
  }
  return false; // 阻止默认上传行为
}

// 下载文件
function handleDownload(record: FileApi.FileVO) {
  window.open(`${downloadFileUrl(record.id)}?download=true`, '_blank');
}

// 删除
function handleDelete(record: FileApi.FileVO) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除文件"${record.originalName}"吗？`,
    onOk: async () => {
      await deleteFileApi(record.id);
      message.success('删除成功');
      gridApi.query();
    },
  });
}

// 批量删除
function handleBatchDelete() {
  const records = gridApi.getCheckboxRecords();
  if (records.length === 0) {
    message.warning('请选择要删除的数据');
    return;
  }

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${records.length} 个文件吗？`,
    onOk: async () => {
      const ids = records.map((r: FileApi.FileVO) => r.id);
      await deleteFileBatchApi(ids);
      message.success('删除成功');
      gridApi.query();
    },
  });
}

// 表格配置
const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { type: 'checkbox', width: 50 },
      {
        title: '预览',
        field: 'preview',
        width: 100,
        slots: { default: 'preview' },
      },
      {
        title: '文件名称',
        field: 'fileName',
        minWidth: 200,
      },
      {
        title: '原始文件名',
        field: 'originalName',
        minWidth: 200,
      },
      {
        title: '文件大小',
        field: 'fileSize',
        width: 120,
        slots: { default: 'fileSize' },
      },
      {
        title: '文件类型',
        field: 'fileType',
        width: 120,
        slots: { default: 'fileType' },
      },
      {
        title: '存储类型',
        field: 'storageType',
        width: 100,
        slots: { default: 'storageType' },
      },
      {
        title: '上传时间',
        field: 'createTime',
        width: 180,
      },
      {
        title: '操作',
        field: 'action',
        width: 150,
        fixed: 'right',
        slots: { default: 'action' },
      },
    ],
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }) => {
          const result = await getFilePageApi({
            pageNum: page.currentPage,
            pageSize: page.pageSize,
          });
          console.log('文件列表数据:', result);
          return {
            total: result.totalRow || 0,
            items: result.records || [],
          };
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    toolbarConfig: {
      custom: true,
      refresh: true,
      zoom: true,
      slots: {
        buttons: 'toolbar-buttons',
      },
    },
  },
});
</script>

<template>
  <Page
    auto-content-height
    description="系统文件管理，支持文件上传、下载和删除"
    title="文件管理"
  >
    <Grid>
      <template #toolbar-buttons>
        <a-space>
          <a-button type="primary" @click="showUpload('file')">
            上传文件
          </a-button>
          <a-button @click="showUpload('image')">上传图片</a-button>
          <a-button danger @click="handleBatchDelete">批量删除</a-button>
        </a-space>
      </template>

      <template #preview="{ row }">
        <a-image
          v-if="isImage(row.fileType)"
          :preview="{ src: row.fileUrl }"
          :src="row.thumbnailUrl || row.fileUrl"
          class="h-12 w-12 rounded object-cover"
        />
        <div
          v-else
          class="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded text-xs"
        >
          {{ row.fileExt?.toUpperCase() }}
        </div>
      </template>

      <template #fileSize="{ row }">
        {{ formatFileSize(row.fileSize) }}
      </template>

      <template #fileType="{ row }">
        <a-tag v-if="isImage(row.fileType)" color="blue">图片</a-tag>
        <a-tag v-else color="default">{{ row.fileExt }}</a-tag>
      </template>

      <template #storageType="{ row }">
        <a-tag v-if="row.storageType === 0" color="green">本地</a-tag>
        <a-tag v-else-if="row.storageType === 1" color="blue">MinIO</a-tag>
        <a-tag v-else color="default">未知</a-tag>
      </template>

      <template #action="{ row }">
        <a-space>
          <a-button size="small" type="link" @click="handleDownload(row)">
            下载
          </a-button>
          <a-button danger size="small" type="link" @click="handleDelete(row)">
            删除
          </a-button>
        </a-space>
      </template>
    </Grid>

    <!-- 上传对话框 -->
    <Modal
      :open="showUploadModal"
      :title="uploadType === 'image' ? '上传图片' : '上传文件'"
      @cancel="showUploadModal = false"
    >
      <div class="space-y-4">
        <div>
          <div class="mb-2 text-sm font-medium">选择存储类型</div>
          <a-radio-group v-model:value="uploadStorageType">
            <a-radio-button :value="0">本地存储</a-radio-button>
            <a-radio-button :value="1">MinIO</a-radio-button>
          </a-radio-group>
        </div>
        <div>
          <a-upload
            :accept="uploadType === 'image' ? 'image/*' : undefined"
            :before-upload="handleUpload"
            :multiple="true"
            :show-upload-list="true"
          >
            <a-button :loading="uploading" type="primary">选择文件</a-button>
          </a-upload>
        </div>
      </div>
      <template #footer>
        <a-button @click="showUploadModal = false">关闭</a-button>
      </template>
    </Modal>
  </Page>
</template>
