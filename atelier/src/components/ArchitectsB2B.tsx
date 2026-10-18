import React, { useState } from 'react';
import { Download, FileCode, CheckCircle2, UserCheck, Shield, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ArchitectsB2B: React.FC = () => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [b2bFormSubmitted, setB2bFormSubmitted] = useState(false);
  const { t } = useLanguage();

  const [b2bFormData, setB2bFormData] = useState({
    studioName: '',
    architectName: '',
    phone: '',
    email: '',
    activeProject: ''
  });

  const handleDownloadLibrary = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 5000);
  };

  const handleB2bSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setB2bFormSubmitted(true);
  };

  const featureIcons = [UserCheck, Shield, FileCode];

  return (
    <section id="architects" className="py-28 bg-[#141312] border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: B2B Program Benefits */}
          <div className="lg:col-span-7">
            <div className="text-xs uppercase tracking-[0.2em] text-[#B38E5D] font-medium mb-3">
              {t.architects.sectionTag}
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-light leading-tight mb-8">
              {t.architects.title}
            </h2>

            <p className="text-base text-neutral-300 font-light leading-relaxed mb-10 max-w-xl">
              {t.architects.subtitle}
            </p>

            <div className="space-y-6">
              {t.architects.features.map((feat, idx) => {
                const IconComponent = featureIcons[idx] || UserCheck;
                return (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="p-2.5 bg-white/5 text-[#B38E5D] rounded-sm shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-base mb-1">
                        {feat.title}
                      </h4>
                      <p className="text-xs text-neutral-400 font-light leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3D Library Download Trigger */}
            <div className="mt-10 p-6 bg-[#1A1816] border border-white/10 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-white">
                  {t.architects.libraryTitle}
                </div>
                <div className="text-xs text-neutral-400 font-mono mt-0.5">
                  {t.architects.libraryDesc}
                </div>
              </div>

              <button
                onClick={handleDownloadLibrary}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B38E5D] hover:bg-[#9E7C4F] text-white text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors whitespace-nowrap cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t.architects.downloadBtn}</span>
              </button>
            </div>

            {downloadSuccess && (
              <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs rounded-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{t.architects.downloadSuccess}</span>
              </div>
            )}
          </div>

          {/* Right Column: Specifier B2B Lead Form */}
          <div className="lg:col-span-5 bg-[#1A1816] border border-white/10 p-8 rounded-sm">
            <h3 className="font-serif text-2xl text-white font-normal mb-2">
              {t.architects.formTitle}
            </h3>
            <p className="text-xs text-neutral-400 font-light mb-6 leading-relaxed">
              {t.architects.formDesc}
            </p>

            {b2bFormSubmitted ? (
              <div className="p-6 bg-white/5 border border-[#B38E5D]/40 rounded-sm text-center py-10">
                <CheckCircle2 className="w-10 h-10 text-[#B38E5D] mx-auto mb-3" />
                <h4 className="font-serif text-xl text-white font-normal mb-2">
                  {t.architects.successTitle}
                </h4>
                <p className="text-xs text-neutral-300 font-light leading-relaxed">
                  {t.architects.successDesc}
                </p>
              </div>
            ) : (
              <form onSubmit={handleB2bSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    {t.architects.studioNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Studio Architecture"
                    value={b2bFormData.studioName}
                    onChange={(e) => setB2bFormData({ ...b2bFormData, studioName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#141312] border border-white/10 rounded-sm text-sm text-white focus:outline-none focus:border-[#B38E5D] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                      {t.architects.nameLabel}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Alex"
                      value={b2bFormData.architectName}
                      onChange={(e) => setB2bFormData({ ...b2bFormData, architectName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#141312] border border-white/10 rounded-sm text-sm text-white focus:outline-none focus:border-[#B38E5D] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                      {t.architects.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+7 999 000-00-00"
                      value={b2bFormData.phone}
                      onChange={(e) => setB2bFormData({ ...b2bFormData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#141312] border border-white/10 rounded-sm text-sm text-white focus:outline-none focus:border-[#B38E5D] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    {t.architects.emailLabel}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="info@studio.com"
                    value={b2bFormData.email}
                    onChange={(e) => setB2bFormData({ ...b2bFormData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#141312] border border-white/10 rounded-sm text-sm text-white focus:outline-none focus:border-[#B38E5D] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                    {t.architects.activeProjectLabel}
                  </label>
                  <input
                    type="text"
                    placeholder="Residence 240 m²"
                    value={b2bFormData.activeProject}
                    onChange={(e) => setB2bFormData({ ...b2bFormData, activeProject: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#141312] border border-white/10 rounded-sm text-sm text-white focus:outline-none focus:border-[#B38E5D] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-[#B38E5D] hover:bg-[#9E7C4F] text-white text-xs uppercase tracking-[0.15em] font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.architects.submitBtn}</span>
                </button>

                <p className="text-[11px] text-neutral-500 text-center font-light leading-tight">
                  {t.architects.privacyNote}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
