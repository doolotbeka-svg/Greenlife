import React from 'react';
import { Quote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ReviewsAndPartners: React.FC = () => {
  const { lang, t } = useLanguage();

  const reviews = [
    {
      author: {
        ru: 'Евгений Романов',
        en: 'Evgeny Romanov',
        ky: 'Евгений Романов'
      },
      role: {
        ru: 'Владелец резиденции',
        en: 'Residence Owner',
        ky: 'Резиденциянын ээси'
      },
      residence: {
        ru: 'Пентхаус в ЖК Lucky, 280 м²',
        en: 'Lucky Penthouse, 280 m²',
        ky: 'Lucky турак жайындагы пентхаус, 280 м²'
      },
      text: {
        ru: 'Работать с Atelier Architectura — это принципиально иной уровень сервиса. Они сразу предложили силовой подрамник под наш 5-метровый остров из мрамора. Фасады из эвкалипта идеально сошлись со стеновыми панелями с точностью до миллиметра. Ни пыли при монтаже, ни срывов сроков.',
        en: 'Partnering with Atelier Architectura represents an entirely different caliber of service. They engineered an invisible subframe for our 5-meter marble island. The fumed eucalyptus fronts aligned with the wall panels down to the sub-millimeter. Clean dust-free installation and prompt delivery.',
        ky: 'Atelier Architectura менен иштешүү — бул кызмат көрсөтүүнүн таптакыр башка деңгээли. Алар биздин 5 метрлик мрамор аралыбыз үчүн дароо бышык подрамник сунушташты. Эвкалипт фасаддары дубал панелдери менен миллиметрине чейин дал келди. Монтаж учурунда чаң болгон жок.'
      }
    },
    {
      author: {
        ru: 'Анна Воронова',
        en: 'Anna Voronova',
        ky: 'Анна Воронова'
      },
      role: {
        ru: 'Основатель Voronova Studio',
        en: 'Founder, Voronova Studio',
        ky: 'Voronova Studio негиздөөчүсү'
      },
      residence: {
        ru: 'Knightsbridge & Миллениум Парк',
        en: 'Knightsbridge & Millennium Park',
        ky: 'Knightsbridge & Миллениум Парк'
      },
      text: {
        ru: 'Как архитектор я крайне придирчива к узлам и зазорам. В Atelier Architectura подкупает собственный мощный конструкторский отдел. Мы передали рабочие концепты, а они выдали безупречную деталировку в CAD с учетом всех скрытых вентканалов и приводов Salice Air.',
        en: 'As an architect, I am exceptionally demanding about junction clearances. What sets Atelier Architectura apart is their formidable in-house engineering team. We provided initial concepts, and they produced flawless production CAD drawings with all concealed ducts and Salice Air mechanisms.',
        ky: 'Архитектор катары мен түйүндөргө жана боштуктарга өтө кылдат карайм. Atelier Architectura ательесинин күчтүү конструктордук бөлүмү бар экендиги кубандырат. Биз концепцияны бердик, алар бардык жашыруун вентканалдарды жана Salice Air механизмдерин эске алуу менен CAD чиймелерин чыгарып беришти.'
      }
    },
    {
      author: {
        ru: 'Дмитрий Смирнов',
        en: 'Dmitry Smirnov',
        ky: 'Дмитрий Смирнов'
      },
      role: {
        ru: 'Частный инвестор',
        en: 'Private Investor',
        ky: 'Жеке инвестор'
      },
      residence: {
        ru: 'Вилла на Новой Риге, 680 м²',
        en: 'Nova Riga Villa, 680 m²',
        ky: 'Новая Рига вилласы, 680 м²'
      },
      text: {
        ru: 'Для меня критически важны были конфиденциальность (подписали строгий NDA без лишних разговоров) и долговечность. Библиотека с потайной дверью работает как швейцарские часы: тяжелая 350-килограммовая створка с книгами открывается одним пальцем абсолютно беззвучно.',
        en: 'For me, mutual discretion (they executed a strict NDA immediately) and longevity were paramount. The library with its concealed pivot bookcase works like a Swiss watch: the 350-kilogram door filled with books glides open effortlessly with a single touch in complete silence.',
        ky: 'Мен үчүн купуялуулук (дароо катуу NDA келишимине кол койдук) жана бышыктык өтө маанилүү болчу. Жашыруун эшиги бар китепкана швейцариялык сааттай иштейт: китептерге толгон 350 килограммдык эшик бир манжанын тийүүсү менен таптакыр дабышсыз ачылат.'
      }
    }
  ];

  const partners = [
    { name: 'Blum', country: { ru: 'Австрия', en: 'Austria', ky: 'Австрия' }, desc: { ru: 'Выдвижные системы Legrabox & Servo-Drive', en: 'Legrabox runners & Servo-Drive electric opening', ky: 'Legrabox тартмалары & Servo-Drive электр жетектери' } },
    { name: 'Salice', country: { ru: 'Италия', en: 'Italy', ky: 'Италия' }, desc: { ru: 'Скрытые торцевые петли Salice Air', en: 'Salice Air concealed end-hung hinges', ky: 'Salice Air жашыруун торцевой илгичтери' } },
    { name: 'Cosentino', country: { ru: 'Испания', en: 'Spain', ky: 'Испания' }, desc: { ru: 'Поверхности Dekton & Silestone', en: 'Dekton & Silestone ultra-compact surfaces', ky: 'Dekton & Silestone ультра-компакттык таштары' } },
    { name: 'Alpi Wood', country: { ru: 'Италия', en: 'Italy', ky: 'Италия' }, desc: { ru: 'Архитектурные натуральные шпоны', en: 'Architectural natural wood veneers', ky: 'Архитектуралык табигый жыгач шпондору' } },
    { name: 'Rubio', country: { ru: 'Бельгия', en: 'Belgium', ky: 'Бельгия' }, desc: { ru: 'Молекулярные эко-масла для дерева', en: 'Molecular wood protection oils', ky: 'Жыгач үчүн экологиялык молекулярдык майлар' } },
    { name: 'Cinetto', country: { ru: 'Италия', en: 'Italy', ky: 'Италия' }, desc: { ru: 'Копланарные раздвижные системы', en: 'Coplanar flush sliding systems', ky: 'Копланардык жылма эшик системалары' } }
  ];

  return (
    <section className="py-28 bg-[#181615] border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Testimonials Block */}
        <div className="max-w-2xl mb-16">
          <div className="text-xs uppercase tracking-[0.2em] text-[#B38E5D] font-medium mb-3">
            {t.reviews.sectionTag}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-light leading-tight">
            {t.reviews.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="p-8 bg-[#1D1B19] border border-white/5 rounded-sm hover:border-[#B38E5D]/30 transition-colors flex flex-col justify-between"
            >
              <div>
                <Quote className="w-8 h-8 text-[#B38E5D]/40 mb-6" />
                <p className="text-sm text-neutral-300 font-light leading-relaxed mb-6 italic">
                  «{rev.text[lang]}»
                </p>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="font-serif text-lg text-white font-normal">
                  {rev.author[lang]}
                </div>
                <div className="text-xs text-[#B38E5D] mt-0.5">
                  {rev.role[lang]}
                </div>
                <div className="text-[11px] font-mono text-neutral-500 mt-1">
                  {rev.residence[lang]}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Partners Strip */}
        <div className="pt-16 border-t border-white/10">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="text-xs uppercase tracking-[0.2em] text-[#B38E5D] font-medium mb-2">
              {t.reviews.partnersTag}
            </div>
            <h3 className="font-serif text-2xl text-white font-light">
              {t.reviews.partnersTitle}
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="p-6 bg-[#141312] border border-white/5 rounded-sm text-center flex flex-col justify-center items-center hover:border-white/20 transition-colors"
              >
                <div className="font-serif text-xl tracking-wider text-white font-medium mb-1">
                  {partner.name}
                </div>
                <div className="text-[10px] font-mono uppercase text-[#B38E5D] tracking-widest mb-2">
                  {partner.country[lang]}
                </div>
                <div className="text-[11px] text-neutral-400 font-light leading-snug">
                  {partner.desc[lang]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
