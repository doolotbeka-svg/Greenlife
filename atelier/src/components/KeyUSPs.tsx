import React from 'react';
import { Layers, Ruler, CheckCircle2, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const KeyUSPs: React.FC = () => {
  const { t } = useLanguage();

  const icons = [Ruler, Layers, CheckCircle2, Sparkles];

  return (
    <section className="py-24 bg-[#181615] border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <div className="text-xs uppercase tracking-[0.2em] text-[#B38E5D] font-medium mb-3">
            {t.usps.sectionTag}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-light leading-tight">
            {t.usps.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.usps.list.map((usp, idx) => {
            const IconComponent = icons[idx] || Ruler;
            return (
              <div 
                key={usp.index}
                className="p-8 bg-[#1F1D1B] border border-white/5 rounded-sm hover:border-[#B38E5D]/40 transition-colors group relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-mono text-xs text-[#B38E5D] tracking-widest font-semibold">
                      {usp.index}
                    </span>
                    <IconComponent className="w-5 h-5 text-neutral-400 group-hover:text-[#B38E5D] transition-colors" />
                  </div>
                  <h3 className="font-serif text-xl text-white font-normal mb-3 leading-snug">
                    {usp.title}
                  </h3>
                  <p className="text-sm text-neutral-400 font-light leading-relaxed">
                    {usp.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                  Atelier Architectura
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
