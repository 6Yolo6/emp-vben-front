/**
 * 消息通知 Composable
 * 管理 WebSocket 消息推送和未读消息数量
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { message as antMessage, notification } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { getWebSocketClient, initWebSocket, closeWebSocket, type WebSocketMessage } from '#/utils/websocket';
import { getUnreadCountApi } from '#/api/sys/message';
import { useAccessStore } from '@vben/stores';

// 全局未读消息数量
export const unreadCount = ref(0);

// 是否已初始化
let isInitialized = false;

/**
 * 使用消息通知
 */
export function useMessageNotification() {
  const router = useRouter();
  const accessStore = useAccessStore();

  /**
   * 初始化 WebSocket 连接
   */
  function initConnection() {
    if (isInitialized) {
      console.log('[MessageNotification] 已初始化，跳过');
      return;
    }

    const token = accessStore.accessToken;
    if (!token) {
      console.log('[MessageNotification] 未找到 token，跳过初始化');
      return;
    }

    console.log('[MessageNotification] 初始化 WebSocket 连接');
    
    // 初始化 WebSocket
    const wsClient = initWebSocket(token);
    
    // 订阅消息
    const unsubscribe = wsClient.onMessage(handleMessage);
    
    // 加载初始未读数量
    loadUnreadCount();
    
    isInitialized = true;

    // 组件卸载时取消订阅
    onUnmounted(() => {
      unsubscribe();
    });
  }

  /**
   * 处理 WebSocket 消息
   */
  function handleMessage(msg: WebSocketMessage) {
    console.log('[MessageNotification] 收到消息:', msg);
    
    switch (msg.type) {
      case 'message':
        // 新消息推送
        handleNewMessage(msg.data);
        break;
      case 'unread_count':
        // 未读数量更新
        unreadCount.value = msg.data;
        break;
      case 'error':
        // 错误消息
        antMessage.error(msg.data.message || '发生错误');
        break;
    }
  }

  /**
   * 处理新消息
   */
  function handleNewMessage(messageData: any) {
    // 更新未读数量
    unreadCount.value++;
    
    // 显示通知
    notification.info({
      message: messageData.title || '新消息',
      description: messageData.content || '',
      duration: 4.5,
      onClick: () => {
        // 点击通知跳转到消息页面
        router.push('/system/message');
      },
    });
    
    // 播放提示音（可选）
    playNotificationSound();
  }

  /**
   * 加载未读消息数量
   */
  async function loadUnreadCount() {
    try {
      const count = await getUnreadCountApi();
      unreadCount.value = count;
      console.log('[MessageNotification] 未读消息数量:', count);
    } catch (error) {
      console.error('[MessageNotification] 加载未读数量失败:', error);
    }
  }

  /**
   * 播放通知提示音
   */
  function playNotificationSound() {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.log('[MessageNotification] 播放提示音失败:', error);
      });
    } catch (error) {
      console.log('[MessageNotification] 播放提示音失败:', error);
    }
  }

  /**
   * 关闭连接
   */
  function closeConnection() {
    console.log('[MessageNotification] 关闭 WebSocket 连接');
    closeWebSocket();
    isInitialized = false;
  }

  /**
   * 刷新未读数量
   */
  function refreshUnreadCount() {
    loadUnreadCount();
  }

  // 自动初始化
  onMounted(() => {
    initConnection();
  });

  return {
    unreadCount,
    initConnection,
    closeConnection,
    refreshUnreadCount,
  };
}
