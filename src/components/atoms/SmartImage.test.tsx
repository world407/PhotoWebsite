import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { SmartImage } from './SmartImage';

describe('SmartImage', () => {
  it('正常渲染 img 并透传属性', () => {
    const { getByAltText } = render(
      <SmartImage src="https://example.com/a.jpg" alt="作品标题" loading="lazy" />,
    );
    const img = getByAltText('作品标题');
    expect(img.tagName).toBe('IMG');
    expect(img.getAttribute('src')).toBe('https://example.com/a.jpg');
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  it('加载失败时展示默认作品图降级，且原 img 已卸载', () => {
    const { getByAltText, getByRole, queryByAltText } = render(
      <SmartImage src="https://example.com/broken.jpg" alt="裂图作品" />,
    );
    fireEvent.error(getByAltText('裂图作品'));

    expect(queryByAltText('裂图作品')).toBeNull();
    const fallback = getByRole('img');
    expect(fallback.textContent).toContain('图片加载失败');
  });

  it('fallbackText 模式展示首字圆形占位', () => {
    const { getByAltText, queryByAltText, getByText } = render(
      <SmartImage src="https://example.com/avatar.jpg" alt="林风" fallbackText="林" />,
    );
    fireEvent.error(getByAltText('林风'));

    expect(queryByAltText('林风')).toBeNull();
    expect(getByText('林')).toBeInTheDocument();
  });

  it('自定义 fallback 节点优先', () => {
    const { getByAltText, getByText } = render(
      <SmartImage
        src="https://example.com/x.jpg"
        alt="装饰图"
        fallback={<div>自定义占位</div>}
      />,
    );
    fireEvent.error(getByAltText('装饰图'));
    expect(getByText('自定义占位')).toBeInTheDocument();
  });

  it('src 切换后从失败态恢复为 img', () => {
    const { getByAltText, queryByAltText, rerender } = render(
      <SmartImage src="https://example.com/old.jpg" alt="图" />,
    );
    fireEvent.error(getByAltText('图'));
    expect(queryByAltText('图')).toBeNull();

    rerender(<SmartImage src="https://example.com/new.jpg" alt="图" />);
    expect(getByAltText('图').getAttribute('src')).toBe('https://example.com/new.jpg');
  });
});
