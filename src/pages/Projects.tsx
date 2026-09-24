import { Link } from 'react-router-dom';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { Icon } from '@/components/atoms/Icon';
import { works } from '@/data/mockData';
import type { WorkTag } from '@/types';

interface Project {
  title: string;
  description: string;
  tag: WorkTag;
  coverId: number;
}

const projects: Project[] = [
  {
    title: '自然之境',
    description: '山川湖海、极光星辰，记录自然的辽阔与壮美',
    tag: 'landscape',
    coverId: 18,
  },
  {
    title: '光影人像',
    description: '以光影勾勒人物轮廓，捕捉情绪的微妙瞬间',
    tag: 'portrait',
    coverId: 8,
  },
  {
    title: '城市脉搏',
    description: '街角与地铁里的众生相，都市生活的真实切片',
    tag: 'street',
    coverId: 17,
  },
  {
    title: '几何之美',
    description: '现代建筑的线条与秩序，极简主义的视觉构成',
    tag: 'architecture',
    coverId: 6,
  },
  {
    title: '日常诗意',
    description: '咖啡与静物之间，寻常日子里的温柔光影',
    tag: 'still',
    coverId: 15,
  },
  {
    title: '永恒黑白',
    description: '褪去色彩，回归光影本质的经典表达',
    tag: 'blackwhite',
    coverId: 11,
  },
];

export function Projects() {
  return (
    <div className="pt-32 pb-20 md:pt-40 md:pb-24">
      <div className="container-main">
        <SectionHeader title="摄影专题" description="系列化创作，探索不同主题的视觉叙事" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const cover = works.find((w) => w.id === project.coverId);
            const count = works.filter((w) => w.tag === project.tag).length;
            return (
              <Link
                key={project.tag}
                to={`/gallery?tag=${project.tag}`}
                className="group card-hover rounded-card bg-bg-card overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
                  {cover && (
                    <img
                      src={cover.imageUrl}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={450}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-h3 font-semibold text-text-primary">{project.title}</h3>
                    <span className="text-caption text-text-muted">{count} 幅</span>
                  </div>
                  <p className="text-body-sm text-text-secondary mt-2 leading-relaxed">
                    {project.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-body-sm text-accent mt-4">
                    查看专题
                    <Icon
                      name="chevron-right"
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
