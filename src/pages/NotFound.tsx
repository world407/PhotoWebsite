import { Button } from '@/components/atoms/Button';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="pt-32 pb-20 md:pt-40 md:pb-24 min-h-[70vh] flex items-center justify-center">
      <div className="container-main text-center">
        <h1 className="text-display font-bold text-text-primary mb-4">404</h1>
        <p className="text-body text-text-secondary mb-8">页面未找到</p>
        <Link to="/">
          <Button variant="accent">返回首页</Button>
        </Link>
      </div>
    </div>
  );
}
