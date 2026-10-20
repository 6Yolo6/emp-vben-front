import { requestClient } from '#/api/request';

export namespace MailApi {
  /** 邮件配置 */
  export interface MailConfigVO {
    id: number;
    configName: string;
    smtpHost: string;
    smtpPort: number;
    username: string;
    password?: string;
    fromName?: string;
    sslEnable: number;
    isDefault: number;
    status: number;
    createTime?: string;
    updateTime?: string;
  }

  export interface MailConfigDTO {
    id?: number;
    configName: string;
    smtpHost: string;
    smtpPort: number;
    username: string;
    password: string;
    fromName?: string;
    sslEnable: number;
    isDefault: number;
    status: number;
  }

  /** 邮件发送 */
  export interface MailSendDTO {
    toEmails: string[];
    ccEmails?: string[];
    bccEmails?: string[];
    subject: string;
    content: string;
    isHtml: boolean;
    attachments?: string[];
    configId?: number;
  }

  /** 模板邮件发送 */
  export interface MailTemplateSendDTO {
    templateCode: string;
    toEmails: string[];
    ccEmails?: string[];
    bccEmails?: string[];
    variables?: Record<string, any>;
    attachments?: string[];
    configId?: number;
  }

  /** 邮件日志 */
  export interface MailLogVO {
    id: number;
    configId: number;
    templateId?: number;
    toEmails: string;
    ccEmails?: string;
    bccEmails?: string;
    subject: string;
    content: string;
    attachments?: string;
    sendStatus: number;
    errorMessage?: string;
    retryCount: number;
    sendTime?: string;
    createTime: string;
  }

  /** 邮件模板 */
  export interface MailTemplateVO {
    id: number;
    templateCode: string;
    templateName: string;
    subject: string;
    content: string;
    templateType: number;
    variables?: string;
    status: number;
    createTime?: string;
    updateTime?: string;
  }

  export interface MailTemplateDTO {
    id?: number;
    templateCode: string;
    templateName: string;
    subject: string;
    content: string;
    templateType: number;
    variables?: string;
    status: number;
  }

  export interface PageParams {
    pageNum: number;
    pageSize: number;
    configName?: string;
    status?: number;
  }

  export interface PageResult<T> {
    records: T[];
    totalRow: number;
    pageNumber: number;
    pageSize: number;
  }
}

/** 邮件配置管理 */
export async function getMailConfigPageApi(params: MailApi.PageParams) {
  return requestClient.get<MailApi.PageResult<MailApi.MailConfigVO>>(
    '/system/mail/config/page',
    { params },
  );
}

export async function getMailConfigApi(id: number) {
  return requestClient.get<MailApi.MailConfigVO>(`/system/mail/config/${id}`);
}

export async function createMailConfigApi(data: MailApi.MailConfigDTO) {
  return requestClient.post<boolean>('/system/mail/config', data);
}

export async function updateMailConfigApi(data: MailApi.MailConfigDTO) {
  return requestClient.put<boolean>('/system/mail/config', data);
}

export async function deleteMailConfigApi(id: number) {
  return requestClient.delete<boolean>(`/system/mail/config/${id}`);
}

export async function testMailConfigApi(id: number, toEmail: string) {
  return requestClient.post<boolean>('/system/mail/config/test', null, {
    params: { id, toEmail },
  });
}

/** 邮件发送 */
export async function sendMailApi(data: MailApi.MailSendDTO) {
  return requestClient.post<boolean>('/system/mail/send', data);
}

export async function sendTemplateMailApi(data: MailApi.MailTemplateSendDTO) {
  return requestClient.post<boolean>('/system/mail/send/template', data);
}

export async function sendMailAsyncApi(data: MailApi.MailSendDTO) {
  return requestClient.post<void>('/system/mail/send/async', data);
}

export async function retryMailApi(logId: number) {
  return requestClient.post<boolean>(`/system/mail/retry/${logId}`);
}

/** 邮件日志查询 */
export async function getMailLogPageApi(params: any) {
  return requestClient.get<MailApi.PageResult<MailApi.MailLogVO>>(
    '/system/mail/log/page',
    { params },
  );
}

/** 邮件模板管理 */
export async function getMailTemplatePageApi(params: MailApi.PageParams) {
  return requestClient.get<MailApi.PageResult<MailApi.MailTemplateVO>>(
    '/system/mail/template/page',
    { params },
  );
}

export async function getMailTemplateApi(id: number) {
  return requestClient.get<MailApi.MailTemplateVO>(
    `/system/mail/template/${id}`,
  );
}

export async function getMailTemplateListApi() {
  return requestClient.get<MailApi.MailTemplateVO[]>(
    '/system/mail/template/list',
  );
}

export async function createMailTemplateApi(data: MailApi.MailTemplateDTO) {
  return requestClient.post<boolean>('/system/mail/template', data);
}

export async function updateMailTemplateApi(data: MailApi.MailTemplateDTO) {
  return requestClient.put<boolean>('/system/mail/template', data);
}

export async function deleteMailTemplateApi(id: number) {
  return requestClient.delete<boolean>(`/system/mail/template/${id}`);
}
