import type { Work } from '@/types';

export interface ExifField {
  key: 'camera' | 'lens' | 'film' | 'aperture' | 'shutterSpeed' | 'iso' | 'focalLength';
  label: string;
  value: string | number;
}

/**
 * Returns the full list of non-empty EXIF fields for a work.
 * Shared by ExifPanel (Photo Detail) and Lightbox to guarantee consistent display
 * (including the `film` field).
 */
export function getExifFields(work: Work): ExifField[] {
  if (!work.exif) return [];
  const exif = work.exif;
  const fields: ExifField[] = [
    { key: 'camera', label: '相机', value: exif.camera ?? '' },
    { key: 'lens', label: '镜头', value: exif.lens ?? '' },
    { key: 'film', label: '胶片', value: exif.film ?? '' },
    { key: 'aperture', label: '光圈', value: exif.aperture ?? '' },
    { key: 'shutterSpeed', label: '快门', value: exif.shutterSpeed ?? '' },
    { key: 'iso', label: 'ISO', value: exif.iso ?? '' },
    { key: 'focalLength', label: '焦段', value: exif.focalLength ?? '' },
  ];
  return fields.filter((f) => f.value !== '' && f.value !== undefined && f.value !== null);
}
