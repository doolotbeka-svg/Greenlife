import React from 'react';
import { Cpu, Wind, Hammer, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ProductionStandards: React.FC = () => {
  const { t } = useLanguage();
  const icons = [Cpu, Wind, Hammer, ShieldCheck];

  return (
    <section id="standards" className="py-28 bg-[#141312] border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-7">
            <div className="text-xs uppercase tracking-[0.2em] text-[#B38E5D] font-medium mb-3">
              {t.standards.sectionTag}
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-light leading-tight">
              {t.standards.title}
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm text-neutral-400 font-light leading-relaxed">
              {t.standards.subtitle}
            </p>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.standards.zones.map((zone, idx) => {
            const Icon = icons[idx] || Cpu;
            return (
              <div
                key={idx}
                className="p-8 bg-[#191716] border border-white/5 rounded-sm hover:border-[#B38E5D]/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono text-[#B38E5D] uppercase tracking-wider">
                      {zone.country}
                    </span>
                    <Icon className="w-5 h-5 text-neutral-400" />
                  </div>
                  <h3 className="font-serif text-xl text-white font-normal mb-3">
                    {zone.title}
                  </h3>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">
                    {zone.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 text-[11px] font-mono text-neutral-500">
                  {t.standards.toleranceLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
