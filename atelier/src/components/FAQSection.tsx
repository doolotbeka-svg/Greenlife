import React, { useState } from 'react';
import { Plus, Minus, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(0);
  const { lang, t } = useLanguage();

  const toggleFAQ = (idx: number) => {
    setOpenId(openId === idx ? null : idx);
  };

  const faqItems = [
    {
      category: { ru: 'Специфика', en: 'Distinction', ky: 'Өзгөчөлүк' },
      question: {
        ru: 'Чем ателье мебели отличается от салонов премиальных брендов и типовых фабрик?',
        en: 'How does a furniture atelier differ from brand showrooms and modular factories?',
        ky: 'Эмерек ательеси дүкөндөрдөн жана катардагы фабрикалардан эмнеси менен айырмаланат?'
      },
      answer: {
        ru: 'Салоны европейских фабрик продают готовые модульные сетки с фиксированным шагом 15–30 см, из-за чего в углах и у потолка неизбежно появляются фальш-планки. Atelier Architectura проектирует мебель с нуля под миллиметры конкретного помещения без ограничений.',
        en: 'European brand showrooms sell pre-determined modular grids with fixed increments of 15–30 cm, inevitably forcing filler strips at walls and ceilings. Atelier Architectura engineers everything from scratch to the exact millimeter of your room without compromises.',
        ky: 'Европалык дүкөндөр 15–30 см өлчөмдөгү даяр модулдук сеткаларды сатышат, ошондуктан дубалдын жана шыптын жанында керексиз тилкелер пайда болот. Atelier Architectura эмеректи конкреттүү бөлмөнүн миллиметрине ылайыктап нөлдөн баштап долбоорлойт.'
      }
    },
    {
      category: { ru: 'Процесс', en: 'Process', ky: 'Процесс' },
      question: {
        ru: 'Как вы гарантируете, что оттенок дерева или эмали совпадет с дизайн-проектом?',
        en: 'How do you guarantee that wood stains or enamel tones match the design concept?',
        ky: 'Жыгачтын же эмалдын түсү дизайн-долбоорго дал келерине кандай кепилдик бересиздер?'
      },
      answer: {
        ru: 'Мы не работаем по каталожным полиграфическим веерам. Перед запуском производства мы делаем индивидуальные «живые» выкрасы на выбранной породе шпона или МДФ в габаритах 40×60 см. Вы утверждаете образец при естественном освещении и подписываете эталон.',
        en: 'We never rely on printed catalog swatches. Prior to production, we manufacture bespoke physical samples (40×60 cm) using the chosen veneer or MDF substrate. You review the sample under natural daylight and execute a master sign-off.',
        ky: 'Биз басма каталогдор менен иштебейбиз. Өндүрүштү баштоодон мурун тандалган шпонго же МДФга 40×60 см өлчөмүндө жекече «тирүү» үлгүлөрдү даярдайбыз. Сиз үлгүнү табигый жарыкта көрүп, эталонго кол коёсуз.'
      }
    },
    {
      category: { ru: 'Контроль', en: 'Quality Control', ky: 'Көзөмөл' },
      question: {
        ru: 'Что такое «контрольная сухая сборка» и зачем она нужна?',
        en: 'What is a "factory dry pre-assembly" and why is it essential?',
        ky: '«Контролдук кургак чогултуу» деген эмне жана ал эмне үчүн керек?'
      },
      answer: {
        ru: 'До нанесения финишных лаков и отправки на объект все элементы гарнитура или панелей на 100% собираются на стапелях в цеху. Конструкторы проверяют равномерность зазоров щупом (допуск до 0.5 мм). Это полностью исключает подгонку на объекте заказчика.',
        en: 'Before final lacquering and transport, the entire cabinetry is 100% pre-assembled on factory jigs. Engineers inspect gap uniformity using thickness feeler gauges (0.5 mm tolerance). This completely eliminates on-site cutting or surprises.',
        ky: 'Акыркы лактарды сүйкөөдөн жана объектке жөнөтүүдөн мурун бардык эмеректер цехтеги стенддерде 100% чогултулат. Конструкторлор боштуктардын бирдейлигин 0.5 мм тактык менен текшеришет. Бул кардардын үйүндө кесүү же оңдоо иштерин жокко чыгарат.'
      }
    },
    {
      category: { ru: 'Архитекторам', en: 'Architects', ky: 'Архитекторлорго' },
      question: {
        ru: 'Какие условия вы предлагаете архитекторам и дизайнерам интерьеров?',
        en: 'What terms do you offer architects and interior designers?',
        ky: 'Архитекторлорго жана дизайнерлерге кандай шарттарды сунуштайсыздар?'
      },
      answer: {
        ru: 'Мы предоставляем персонального ведущего технолога с первого дня проекта, берем на себя полную техническую ответственность за узлы, предоставляем 3D-модели в формате 3ds Max / Corona / Revit и работаем по официальному партнерскому договору.',
        en: 'We assign a dedicated lead technologist from day one, assume complete structural liability for all junction nodes, provide 3D models in 3ds Max / Corona / Revit, and operate under a protected agency agreement.',
        ky: 'Долбоордун биринчи күнүнөн баштап жеке жетектөөчү технологду бекитебиз, бардык түйүндөр үчүн техникалык жоопкерчиликти алабыз, 3ds Max / Corona / Revit моделдерин беребиз жана расмий келишим менен иштейбиз.'
      }
    },
    {
      category: { ru: 'Гарантия', en: 'Warranty', ky: 'Кепилдик' },
      question: {
        ru: 'Какая действует гарантия и как осуществляется сервисное обслуживание?',
        en: 'What warranty is provided and how is maintenance serviced?',
        ky: 'Кепилдик кандай берилет жана сервистик тейлөө кандай жүргүзүлөт?'
      },
      answer: {
        ru: 'Мы предоставляем 5-летнюю комплексную гарантию на все изделия и несущие конструкции, а также пожизненную заводскую гарантию на фурнитуру Blum и Salice. При необходимости наш мастер выезжает в течение 24 часов.',
        en: 'We provide a 5-year comprehensive warranty on all cabinetry and load-bearing structures, along with lifetime factory warranty on Blum and Salice hardware. Service technicians respond within 24 hours.',
        ky: 'Бардык буюмдарга жана конструкцияларга 5 жылдык кепилдик, ошондой эле Blum жана Salice фурнитураларына өмүр бою заводдук кепилдик беребиз. Зарыл болсо, адисибиз 24 саат ичинде келет.'
      }
    }
  ];

  return (
    <section className="py-28 bg-[#141312] border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Title & Quick Services */}
          <div className="lg:col-span-5">
            <div className="text-xs uppercase tracking-[0.2em] text-[#B38E5D] font-medium mb-3">
              {t.faq.sectionTag}
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-white font-light leading-tight mb-6">
              {t.faq.title}
            </h2>
            <p className="text-sm text-neutral-400 font-light leading-relaxed mb-8">
              {t.faq.subtitle}
            </p>

            {/* Quick Services Links */}
            <div className="p-6 bg-[#181615] border border-white/5 rounded-sm">
              <div className="text-xs uppercase font-mono tracking-wider text-[#B38E5D] mb-4">
                {t.faq.quickLinksTitle}
              </div>
              <ul className="space-y-3">
                {t.faq.quickServices.map((qs, i) => (
                  <li key={i}>
                    <a
                      href="#portfolio"
                      className="text-xs text-neutral-300 hover:text-white transition-colors flex items-center justify-between group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">{qs}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#B38E5D] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Accordion */}
          <div className="lg:col-span-7 space-y-4">
            {faqItems.map((item, idx) => {
              const isOpen = openId === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#181615] border border-white/5 rounded-sm overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full text-left p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#B38E5D] tracking-wider block mb-1">
                        {item.category[lang]}
                      </span>
                      <span className="font-serif text-lg text-white font-normal leading-snug">
                        {item.question[lang]}
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-sm bg-white/5 text-[#B38E5D] flex items-center justify-center shrink-0">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 text-sm text-neutral-300 font-light leading-relaxed border-t border-white/5">
                      {item.answer[lang]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
