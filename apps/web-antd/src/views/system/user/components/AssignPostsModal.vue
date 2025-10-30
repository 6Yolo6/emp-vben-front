<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Checkbox, message, Spin } from 'ant-design-vue';

import { getPostListApi } from '#/api/sys/post';
import { assignUserPostsApi, getUserPostsApi } from '#/api/sys/user';

defineOptions({
  name: 'AssignPostsModal',
});

const emit = defineEmits(['success']);

const CheckboxGroup = Checkbox.Group;

const loading = ref(false);
const postList = ref<any[]>([]);
const selectedPosts = ref<number[]>([]);
const userData = ref<any>();

// 加载数据
async function loadData() {
  try {
    loading.value = true;
    const [posts, userPosts] = await Promise.all([
      getPostListApi(),
      getUserPostsApi(userData.value.id),
    ]);
    postList.value = posts;
    selectedPosts.value = userPosts;
  } catch (error) {
    console.error('加载数据失败:', error);
    message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

// Modal
const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    modalApi.lock();
    try {
      await assignUserPostsApi(userData.value.id, selectedPosts.value);
      await modalApi.close();
      emit('success');
      message.success('分配成功');
    } catch (error) {
      console.error('分配失败:', error);
      message.error('分配失败');
    } finally {
      modalApi.unlock();
    }
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      userData.value = undefined;
      postList.value = [];
      selectedPosts.value = [];
      return;
    }

    const data = modalApi.getData();
    if (data) {
      userData.value = data;
      await loadData();
    }
  },
});
</script>

<template>
  <Modal title="分配岗位" class="w-1/3">
    <div class="p-4">
      <Spin :spinning="loading">
        <CheckboxGroup v-model:value="selectedPosts" class="post-list">
          <div v-for="post in postList" :key="post.id" class="post-item">
            <Checkbox :value="post.id">
              {{ post.postName }}
              <span class="post-code">({{ post.postCode }})</span>
            </Checkbox>
          </div>
        </CheckboxGroup>
      </Spin>
    </div>
  </Modal>
</template>

<style scoped>
.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.post-item {
  padding: 8px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  transition: all 0.3s;
}

.post-item:hover {
  background-color: #fafafa;
}

.post-code {
  margin-left: 8px;
  font-size: 12px;
  color: #999;
}
</style>
