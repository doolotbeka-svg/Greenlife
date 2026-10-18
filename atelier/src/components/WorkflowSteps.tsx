import React from 'react';
import { Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const WorkflowSteps: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="workflow" className="py-28 bg-[#181615] border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <div className="text-xs uppercase tracking-[0.2em] text-[#B38E5D] font-medium mb-3">
            {t.workflow.sectionTag}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-light leading-tight">
            {t.workflow.title}
          </h2>
          <p className="text-sm text-neutral-400 font-light mt-4 leading-relaxed">
            {t.workflow.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.workflow.steps.map((s) => (
            <div
              key={s.step}
              className="p-8 bg-[#1D1B19] border border-white/5 rounded-sm hover:border-[#B38E5D]/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xl text-[#B38E5D] font-light">
                    {s.step}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#B38E5D]" />
                    <span>{s.duration}</span>
                  </div>
                </div>

                <h3 className="font-serif text-xl text-white font-normal mb-3 leading-snug">
                  {s.title}
                </h3>

                <p className="text-xs text-neutral-300 font-light leading-relaxed mb-4">
                  {s.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 text-[11px] text-neutral-400 leading-snug">
                <span className="text-[#B38E5D] font-mono">{t.workflow.resultLabel}</span> {s.details}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
