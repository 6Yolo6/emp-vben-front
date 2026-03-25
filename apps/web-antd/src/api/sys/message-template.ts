import { requestClient } from '#/api/request';

export namespace MessageTemplateApi {
  export interface MessageTemplateVO {
    id: number;
    templateCode: string;
    templateName: string;
    title: string;
    content: string;
    messageType: number;
    variables?: string;
    version: number;
    status: number;
    remark?: string;
    createTime: string;
    updateTime: string;
  }

  export interface MessageTemplateDTO {
    templateCode: string;
    templateName: string;
    title: string;
    content: string;
    messageType: number;
    variables?: string;
    status?: number;
    remark?: string;
  }

  export interface TemplateVariable {
    key: string;
    name: string;
    type: string;
    description?: string;
  }

  export interface TemplateWithVariables extends MessageTemplateVO {
    parsedVariables?: TemplateVariable[];
  }

  export interface PageResult<T> {
    records: T[];
    total: number;
    totalRow: number;
  }

  // 预定义的模板变量映射
  export const TEMPLATE_VARIABLES_MAP: Record<string, TemplateVariable[]> = {
    'password-reset': [
      { key: 'newPassword', name: '新密码', type: 'string', description: '重置后的新密码' },
      { key: 'resetLink', name: '重置链接', type: 'string', description: '密码重置链接' },
      { key: 'expiryTime', name: '过期时间', type: 'string', description: '重置链接过期时间' },
    ],
    'PASSWORD_RESET': [
      { key: 'newPassword', name: '新密码', type: 'string', description: '重置后的新密码' },
      { key: 'expiryTime', name: '过期时间', type: 'string', description: '重置链接或新密码的过期时间' },
    ],
    'account-create': [
      { key: 'username', name: '用户名', type: 'string', description: '新创建的用户名' },
      { key: 'password', name: '密码', type: 'string', description: '初始密码' },
      { key: 'loginUrl', name: '登录地址', type: 'string', description: '系统登录地址' },
    ],
    'USER_REGISTER': [
      { key: 'userName', name: '用户名', type: 'string', description: '注册用户的用户名' },
      { key: 'loginUrl', name: '登录地址', type: 'string', description: '系统登录地址' },
    ],
    'account-lock': [
      { key: 'reason', name: '锁定原因', type: 'string', description: '账户被锁定的原因' },
      { key: 'contactAdmin', name: '联系管理员', type: 'string', description: '管理员联系方式' },
    ],
    'ACCOUNT_LOCK': [
      { key: 'reason', name: '锁定原因', type: 'string', description: '账户被锁定的原因' },
      { key: 'contactAdmin', name: '联系管理员', type: 'string', description: '管理员联系方式' },
    ],
    'order-notify': [
      { key: 'orderNo', name: '订单号', type: 'string', description: '订单编号' },
      { key: 'orderAmount', name: '订单金额', type: 'string', description: '订单总金额' },
      { key: 'orderTime', name: '下单时间', type: 'string', description: '订单创建时间' },
      { key: 'deliveryTime', name: '预计送达', type: 'string', description: '预计送达时间' },
    ],
    'ORDER_NOTIFY': [
      { key: 'orderNo', name: '订单号', type: 'string', description: '订单编号' },
      { key: 'orderAmount', name: '订单金额', type: 'string', description: '订单总金额（含货币符号）' },
      { key: 'orderTime', name: '下单时间', type: 'string', description: '订单创建时间' },
      { key: 'deliveryTime', name: '预计送达', type: 'string', description: '预计送达时间' },
    ],
    'alert-notify': [
      { key: 'alertType', name: '告警类型', type: 'string', description: '告警类型名称' },
      { key: 'alertLevel', name: '告警级别', type: 'string', description: '严重程度（高/中/低）' },
      { key: 'alertTime', name: '告警时间', type: 'string', description: '告警发生时间' },
      { key: 'alertContent', name: '告警内容', type: 'string', description: '具体告警信息' },
    ],
    'ALERT_NOTIFY': [
      { key: 'alertType', name: '告警类型', type: 'string', description: '告警类型名称' },
      { key: 'alertLevel', name: '告警级别', type: 'string', description: '严重程度（严重/重要/普通/提示）' },
      { key: 'alertTime', name: '告警时间', type: 'string', description: '告警发生时间' },
      { key: 'alertContent', name: '告警内容', type: 'string', description: '具体告警信息' },
    ],
    'TASK_ASSIGN': [
      { key: 'taskName', name: '任务名称', type: 'string', description: '分配给您的任务名称' },
      { key: 'taskDescription', name: '任务描述', type: 'string', description: '任务的具体描述' },
      { key: 'priority', name: '优先级', type: 'string', description: '任务优先级（高/中/低）' },
      { key: 'deadline', name: '截止时间', type: 'string', description: '任务完成的截止日期' },
    ],
    'APPROVAL_NOTIFY': [
      { key: 'processName', name: '流程名称', type: 'string', description: '审批流程的名称' },
      { key: 'applicant', name: '申请人', type: 'string', description: '提交审批申请的人员名称' },
      { key: 'applyTime', name: '申请时间', type: 'string', description: '提交申请的时间' },
      { key: 'deadline', name: '审批截止时间', type: 'string', description: '必须完成审批的截止时间' },
    ],
    'SYSTEM_MAINTENANCE': [
      { key: 'maintenanceTime', name: '维护时间', type: 'string', description: '系统维护开始的具体时间' },
      { key: 'duration', name: '维护时长', type: 'string', description: '预计维护需要的时长' },
      { key: 'details', name: '维护说明', type: 'string', description: '关于维护的详细说明' },
    ],
    'ACCOUNT_EXPIRE': [
      { key: 'expireDate', name: '过期日期', type: 'string', description: '账户过期的具体日期' },
      { key: 'daysLeft', name: '剩余天数', type: 'string', description: '账户有效期剩余的天数' },
      { key: 'renewUrl', name: '续费链接', type: 'string', description: '账户续费的链接地址' },
    ],
    'MESSAGE_CONFIRM': [
      { key: 'userName', name: '收信人姓名', type: 'string', description: '消息接收者的名称' },
      { key: 'senderName', name: '发送人姓名', type: 'string', description: '消息发送者的名称' },
      { key: 'messageContent', name: '消息内容', type: 'string', description: '需要确认的消息内容' },
      { key: 'confirmDeadline', name: '确认截止时间', type: 'string', description: '需要确认消息的截止时间' },
    ],
  };
}

/**
 * 分页查询消息模板
 */
export async function getMessageTemplatePageApi(params: {
  templateCode?: string;
  templateName?: string;
  status?: number;
  pageNum: number;
  pageSize: number;
}) {
  return requestClient.get<MessageTemplateApi.PageResult<MessageTemplateApi.MessageTemplateVO>>(
    '/system/message/template/page',
    { params },
  );
}

/**
 * 获取消息模板详情
 */
export async function getMessageTemplateDetailApi(id: number) {
  return requestClient.get<MessageTemplateApi.MessageTemplateVO>(
    `/system/message/template/${id}`,
  );
}

/**
 * 创建消息模板
 */
export async function createMessageTemplateApi(data: MessageTemplateApi.MessageTemplateDTO) {
  return requestClient.post('/system/message/template', data);
}

/**
 * 更新消息模板
 */
export async function updateMessageTemplateApi(id: number, data: MessageTemplateApi.MessageTemplateDTO) {
  return requestClient.put(`/system/message/template/${id}`, data);
}

/**
 * 删除消息模板
 */
export async function deleteMessageTemplateApi(id: number) {
  return requestClient.delete(`/system/message/template/${id}`);
}

/**
 * 更新模板状态
 */
export async function updateTemplateStatusApi(id: number, status: number) {
  return requestClient.put(`/system/message/template/${id}/status`, null, {
    params: { status },
  });
}

/**
 * 获取所有启用的消息模板列表（用于下拉选择）
 */
export async function getMessageTemplateListApi() {
  return requestClient.get<MessageTemplateApi.MessageTemplateVO[]>(
    '/system/message/template/list',
    { params: { status: 1 } },
  );
}

/**
 * 解析模板变量
 * @param templateCode 模板编码
 * @param variables 变量字符串
 */
export function parseTemplateVariables(
  templateCode: string,
  variables?: string,
): MessageTemplateApi.TemplateVariable[] {
  // 先从预定义映射中查找
  const predefinedVariables = MessageTemplateApi.TEMPLATE_VARIABLES_MAP[templateCode];
  if (predefinedVariables) {
    return predefinedVariables;
  }

  // 如果有 JSON 格式的变量字符串，解析它
  if (variables) {
    try {
      const parsed = JSON.parse(variables);
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (typeof parsed === 'object') {
        // 将对象键转换为变量数组
        return Object.keys(parsed).map((key) => ({
          key,
          name: parsed[key].name || key,
          type: parsed[key].type || 'string',
          description: parsed[key].description || '',
        }));
      }
    } catch (e) {
      console.warn('Failed to parse template variables:', e);
    }
  }

  return [];
}

/**
 * 获取模板的变量列表
 * @param template 模板对象
 */
export function getTemplateVariablesList(
  template: MessageTemplateApi.MessageTemplateVO,
): MessageTemplateApi.TemplateVariable[] {
  return parseTemplateVariables(template.templateCode, template.variables);
}

/**
 * 根据模板发送消息
 */
export async function sendMessageByTemplateApi(data: {
  templateId: number;
  receiverType: number;
  receiverIds?: number[];
  receiverRoleIds?: number[];
  variables?: Record<string, string>;
}) {
  return requestClient.post('/system/message/send/template', data);
}

// 别名导出
export { getMessageTemplatePageApi as getTemplatePageApi };
export { getMessageTemplateDetailApi as getTemplateDetailApi };
export { createMessageTemplateApi as createTemplateApi };
export { updateMessageTemplateApi as updateTemplateApi };
export { deleteMessageTemplateApi as deleteTemplateApi };
export { updateTemplateStatusApi as updateStatusApi };
export { sendMessageByTemplateApi as sendByTemplateApi };
