<script lang="ts" setup>
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Descriptions, DescriptionsItem, Tag } from 'ant-design-vue';

import type { MessageApi } from '#/api/sys/message';

const ADescriptions = Descriptions;
const ADescriptionsItem = DescriptionsItem;
const ATag = Tag;

defineOptions({ name: 'MessageDetailModal' });

const messageData = ref<MessageApi.MessageVO>();

const [Modal, modalApi] = useVbenModal({
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      messageData.value = undefined;
      return;
    }

    const data = modalApi.getData();
    console.log('MessageDetailModal 接收到的数据:', data);
    if (data) {
      messageData.value = data;
      console.log('messageData.value 已设置:', messageData.value);
    }
  },
});

const messageTypeMap: Record<number, { text: string; color: string }> = {
  1: { text: '系统通知', color: 'blue' },
  2: { text: '业务消息', color: 'green' },
  3: { text: '预警消息', color: 'red' },
};

const messageType = computed(() => {
  if (!messageData.value) return { text: '', color: '' };
  return messageTypeMap[messageData.value.messageType] || { text: '未知', color: 'default' };
});

const readStatus = computed(() => {
  if (!messageData.value) return { text: '', color: '' };
  return messageData.value.isRead === 1
    ? { text: '已读', color: 'success' }
    : { text: '未读', color: 'warning' };
});

/** 格式化时间 */
function formatDateTime(dateTime: string | undefined): string {
  if (!dateTime) return '';
  // 将 ISO 格式时间转换为 YYYY-MM-DD HH:mm:ss
  return dateTime.replace('T', ' ').slice(0, 19);
}
</script>

<template>
  <Modal title="消息详情" class="w-[800px]">
    
    <div v-if="messageData" class="p-4">
      <ADescriptions bordered :column="1">
        <ADescriptionsItem label="消息标题">
          {{ messageData.title }}
        </ADescriptionsItem>
        <ADescriptionsItem label="消息类型">
          <ATag :color="messageType.color">
            {{ messageType.text }}
          </ATag>
        </ADescriptionsItem>
        <ADescriptionsItem label="发送人">
          {{ messageData.senderName }}
        </ADescriptionsItem>
        <ADescriptionsItem label="状态">
          <ATag :color="readStatus.color">
            {{ readStatus.text }}
          </ATag>
        </ADescriptionsItem>
        <ADescriptionsItem label="发送时间">
          {{ formatDateTime(messageData.createTime) }}
        </ADescriptionsItem>
        <ADescriptionsItem v-if="messageData.readTime" label="阅读时间">
          {{ formatDateTime(messageData.readTime) }}
        </ADescriptionsItem>
        <ADescriptionsItem label="消息内容">
          <div class="whitespace-pre-wrap">{{ messageData.content }}</div>
        </ADescriptionsItem>
      </ADescriptions>
    </div>
    <div v-else class="p-4 text-red-500">
      没有消息数据
    </div>
  </Modal>
</template>
