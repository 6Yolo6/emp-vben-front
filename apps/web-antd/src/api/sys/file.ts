import type { PageResult } from '#/api/model';
import { requestClient } from '#/api/request';

export namespace FileApi {
  // 文件查询DTO
  export interface FileQueryDTO {
    fileName?: string;
    originalName?: string;
    fileType?: string;
    storageType?: number;
    pageNum?: number;
    pageSize?: number;
  }

  // 文件VO
  export interface FileVO {
    id: number;
    fileName: string;
    originalName: string;
    filePath: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    fileExt: string;
    storageType: number;
    thumbnailUrl?: string;
    md5: string;
    status: number;
    remark?: string;
    createBy: number;
    createTime: string;
  }
}

/**
 * 分页查询文件
 */
export async function getFilePageApi(params: FileApi.FileQueryDTO) {
  return requestClient.get<PageResult<FileApi.FileVO>>('/system/file/page', {
    params,
  });
}

/**
 * 根据ID查询文件
 */
export async function getFileByIdApi(id: number) {
  return requestClient.get<FileApi.FileVO>(`/system/file/${id}`);
}

/**
 * 上传文件
 */
export async function uploadFileApi(file: File, storageType?: number) {
  const formData = new FormData();
  formData.append('file', file);
  if (storageType !== undefined) {
    formData.append('storageType', storageType.toString());
  }

  return requestClient.post<FileApi.FileVO>('/system/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 上传图片（生成缩略图）
 */
export async function uploadImageApi(file: File, storageType?: number) {
  const formData = new FormData();
  formData.append('file', file);
  if (storageType !== undefined) {
    formData.append('storageType', storageType.toString());
  }

  return requestClient.post<FileApi.FileVO>('/system/file/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 下载文件URL
 */
export function downloadFileUrl(id: number) {
  return `/api/system/file/download/${id}`;
}

/**
 * 删除文件
 */
export async function deleteFileApi(id: number) {
  return requestClient.delete<void>(`/system/file/${id}`);
}

/**
 * 批量删除文件
 */
export async function deleteFileBatchApi(ids: number[]) {
  return requestClient.delete<void>('/system/file/batch', { data: ids });
}
