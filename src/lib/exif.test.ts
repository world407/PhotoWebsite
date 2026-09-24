import { describe, it, expect } from 'vitest';
import { getExifFields } from './exif';
import type { Work } from '@/types';

function makeWork(exif: Work['exif']): Work {
  return {
    id: 1,
    title: 'test',
    author: 'a',
    likes: 0,
    tag: 'nature',
    aspectRatio: 1.5,
    imageUrl: 'https://example.com/x.jpg',
    exif,
  };
}

describe('getExifFields', () => {
  it('无 exif 时返回空数组', () => {
    expect(getExifFields(makeWork(undefined))).toEqual([]);
  });

  it('过滤空字符串与 undefined，只保留有值字段', () => {
    const fields = getExifFields(
      makeWork({
        camera: 'Sony A7M4',
        lens: '',
        aperture: undefined,
        shutterSpeed: '1/200',
        iso: 400,
        focalLength: '35mm',
        film: '',
      }),
    );
    const keys = fields.map((f) => f.key);
    expect(keys).toEqual(['camera', 'shutterSpeed', 'iso', 'focalLength']);
  });

  it('保留 film（胶片）字段', () => {
    const fields = getExifFields(makeWork({ film: 'Kodak Portra 400' }));
    expect(fields).toContainEqual({ key: 'film', label: '胶片', value: 'Kodak Portra 400' });
  });

  it('iso 为 0 时仍作为有效数值保留', () => {
    const fields = getExifFields(makeWork({ iso: 0 }));
    expect(fields.map((f) => f.key)).toContain('iso');
  });
});
