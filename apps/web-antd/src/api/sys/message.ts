import { requestClient } from '#/api/request';

export namespace MessageApi {
  export interface MessageVO {
    id: number;
    title: string;
    content: string;
    messageType: number;
    senderId: number;
    senderName: string;
    createTime: string;
    isRead: number;
    readTime?: string;
  }

  export interface MessageSendDTO {
    title: string;
    content: string;
    messageType: number;
    receiverType: number;
    receiverIds?: number[];
    receiverRoleIds?: number[];
  }

  export interface PageResult<T> {
    records: T[];
    total: number;
    totalRow: number;
  }
}

/**
 * 获取我的消息列表
 */
export async function getMyMessagePageApi(params: {
  isRead?: number;
  pageNum: number;
  pageSize: number;
}) {
  return requestClient.get<MessageApi.PageResult<MessageApi.MessageVO>>(
    '/system/message/my/page',
    { params },
  );
}

/**
 * 获取未读消息数量
 */
export async function getUnreadCountApi() {
  return requestClient.get<number>('/system/message/unread/count');
}

/**
 * 标记消息为已读
 */
export async function markAsReadApi(messageId: number) {
  return requestClient.put(`/system/message/read/${messageId}`);
}

/**
 * 批量标记为已读
 */
export async function batchMarkAsReadApi(messageIds: number[]) {
  return requestClient.put('/system/message/read/batch', messageIds);
}

/**
 * 删除消息
 */
export async function deleteMessageApi(messageId: number) {
  return requestClient.delete(`/system/message/delete/${messageId}`);
}

/**
 * 发送消息
 */
export async function sendMessageApi(data: MessageApi.MessageSendDTO) {
  return requestClient.post('/system/message/send', data);
}

/**
 * 获取消息详情
 */
export async function getMessageByIdApi(messageId: number) {
  return requestClient.get<number>(`/system/message/getMessage/${messageId}`);
}
