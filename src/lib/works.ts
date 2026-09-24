import { createContext, useContext } from 'react';
import type { ExifData, Work, WorkTag } from '@/types';
import type { CompressedImage } from './image';

/** 上传页收集的新作品数据（图片为本地压缩结果） */
export interface NewWorkInput {
  title: string;
  description?: string;
  tags: string[];
  location?: string;
  tag: WorkTag;
  exif?: ExifData;
  image: CompressedImage;
}

export interface WorksContextValue {
  /** mock 作品 + 用户作品的合并列表（用户作品在前、按发布时间倒序） */
  works: Work[];
  /** 仅用户上传的作品 */
  userWorks: Work[];
  /** 当前登录用户自己的作品 */
  myWorks: Work[];
  /** IndexedDB 初始加载完成标志 */
  ready: boolean;
  addWork: (input: NewWorkInput) => Promise<Work>;
}

export const WorksContext = createContext<WorksContextValue | undefined>(undefined);

export function useWorks(): WorksContextValue {
  const context = useContext(WorksContext);
  if (!context) {
    throw new Error('useWorks must be used within a WorksProvider');
  }
  return context;
}
