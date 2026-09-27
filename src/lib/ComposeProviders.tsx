import type { ComponentType, ReactNode } from 'react';

interface ComposeProvidersProps {
  /** 从最外层到最内层依次排列的 Provider 组件列表 */
  providers: ComponentType<{ children: ReactNode }>[];
  children: ReactNode;
}

/**
 * 以数组形式嵌套 Provider，替代多层 JSX 金字塔：
 * <ComposeProviders providers={[A, B]}>{children}</ComposeProviders>
 * 等价于 <A><B>{children}</B></A>
 */
export function ComposeProviders({ providers, children }: ComposeProvidersProps) {
  return providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, children);
}
