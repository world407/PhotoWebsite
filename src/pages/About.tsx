import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { StatItem } from '@/components/molecules/StatItem';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { heroStats } from '@/data/mockData';

const directions = [
  {
    icon: 'image' as const,
    title: '风光与自然',
    desc: '记录山川湖海的辽阔与自然的瞬息万变',
  },
  {
    icon: 'user' as const,
    title: '人像与情绪',
    desc: '以光影勾勒人物，捕捉真实而细腻的情绪',
  },
  {
    icon: 'map-pin' as const,
    title: '城市与人文',
    desc: '在街头与日常中寻找城市的温度与故事',
  },
  {
    icon: 'eye' as const,
    title: '观察与表达',
    desc: '关注构图、色彩与瞬间，追求克制而有力量的画面',
  },
];

export function About() {
  return (
    <div className="pt-32 pb-20 md:pt-40 md:pb-24">
      <div className="container-main">
        <SectionHeader title="关于影·迹" description="一个关于光影与时间的视觉叙事空间" />

        <section className="rounded-card bg-bg-card p-6 md:p-8">
          <h3 className="text-h3 font-semibold text-text-primary">摄影理念</h3>
          <div className="mt-4 space-y-4 text-body text-text-secondary leading-relaxed">
            <p>
              光影是时间的切片。我们相信，好的摄影不在于器材，而在于观察——在寻常中发现不寻常，在瞬间里留住永恒。
            </p>
            <p>
              影·迹关注构图、色彩与情绪，追求克制而有力量的画面，让每一张照片都成为值得回味的叙事。这里汇集了来自不同创作者的摄影作品，涵盖风光、人像、街拍、建筑与静物等多个方向。
            </p>
          </div>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 mt-12">
          {heroStats.map((stat, i) => (
            <StatItem key={stat.label} value={stat.value} label={stat.label} delay={i * 80} />
          ))}
        </div>

        <section className="mt-14">
          <h3 className="text-h3 font-semibold text-text-primary">创作方向</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
            {directions.map((direction) => (
              <div key={direction.title} className="rounded-card bg-bg-card p-6">
                <Icon name={direction.icon} size={24} className="text-accent" />
                <h4 className="text-body font-semibold text-text-primary mt-4">{direction.title}</h4>
                <p className="text-caption text-text-secondary mt-2 leading-relaxed">{direction.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-14 flex flex-wrap gap-4">
          <Link to="/gallery">
            <Button variant="accent" size="md">
              浏览作品库
              <Icon name="chevron-right" size={18} />
            </Button>
          </Link>
          <Link to="/photographers">
            <Button variant="outline" size="md">
              认识摄影师
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
