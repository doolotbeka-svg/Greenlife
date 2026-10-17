import React, { useRef, useState } from 'react';
import { Upload, Trash2, Plus, ArrowUp, ArrowDown, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Slide, PromoCode, Announcement, HeroTexts } from '../types/store';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { uploadImage, ApiError } from '../utils/api';

const inputCls = 'w-full px-3 py-2 bg-white border border-[#CBD7C7] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]';
const labelCls = 'block font-semibold text-[#183325] mb-1 text-xs';
const cardCls = 'bg-[#FAFBF9] border border-[#DFE7DB] rounded-xl p-4 space-y-3';

type L = (ky: string, ru: string) => string;

export function moveItem<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

// Photo picker: upload from the device or paste a link
export const ImageField: React.FC<{
  value: string;
  onChange: (url: string) => void;
  password: string;
  L: L;
  label?: string;
}> = ({ value, onChange, password, L, label }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      onChange(await uploadImage(file, password));
    } catch (err) {
      const code = err instanceof ApiError ? err.code : '';
      setError(
        code === 'too_large'
          ? L('Сүрөт өтө чоң.', 'Фото слишком большое.')
          : L('Сүрөттү жүктөө мүмкүн болгон жок.', 'Не удалось загрузить фото.')
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <label className={labelCls}>{label || L('Сүрөт', 'Фото')}</label>
      <div className="flex gap-3 items-start">
        <div className="w-20 h-20 rounded-lg border border-[#DCE4D8] bg-white overflow-hidden shrink-0 flex items-center justify-center">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-[#8A9A8F]">{L('Жок', 'Нет')}</span>
          )}
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1B4332] hover:bg-[#143427] disabled:opacity-60 text-white rounded-lg text-xs font-semibold"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span>{uploading ? L('Жүктөлүүдө...', 'Загрузка...') : L('Сүрөт жүктөө', 'Загрузить фото')}</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={L('же сүрөттүн шилтемеси', 'или ссылка на фото')}
            className={inputCls}
          />
          {error && <p className="text-[11px] text-red-700">{error}</p>}
        </div>
      </div>
    </div>
  );
};

const RowActions: React.FC<{
  index: number;
  count: number;
  onMove: (delta: number) => void;
  onDelete: () => void;
  L: L;
}> = ({ index, count, onMove, onDelete, L }) => (
  <div className="flex items-center gap-1">
    <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="p-1.5 rounded border border-[#D5E0D2] bg-white disabled:opacity-40" title={L('Жогору', 'Выше')}>
      <ArrowUp className="w-3.5 h-3.5" />
    </button>
    <button type="button" disabled={index === count - 1} onClick={() => onMove(1)} className="p-1.5 rounded border border-[#D5E0D2] bg-white disabled:opacity-40" title={L('Төмөн', 'Ниже')}>
      <ArrowDown className="w-3.5 h-3.5" />
    </button>
    <button type="button" onClick={onDelete} className="p-1.5 rounded border border-red-200 bg-white text-red-600 hover:bg-red-50" title={L('Өчүрүү', 'Удалить')}>
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  </div>
);

export const SlidesEditor: React.FC<{
  slides: Slide[];
  onChange: (slides: Slide[]) => void;
  password: string;
  L: L;
}> = ({ slides, onChange, password, L }) => {
  const update = (i: number, patch: Partial<Slide>) => onChange(slides.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const add = () =>
    onChange([
      ...slides,
      { id: `slide-${Date.now()}`, image: '', titleKy: '', titleRu: '', subtitleKy: '', subtitleRu: '', link: '#catalog', enabled: true },
    ]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#526659]">
        {L(
          'Башкы беттеги чоң сүрөттөр. Бир нече слайд болсо, алар 6 секунд сайын алмашат.',
          'Большие картинки на главной странице. Если слайдов несколько, они меняются каждые 6 секунд.'
        )}
      </p>
      {slides.map((s, i) => (
        <div key={s.id} className={cardCls}>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-[#143427]">
              {L('Слайд', 'Слайд')} {i + 1}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => update(i, { enabled: !s.enabled })}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border ${
                  s.enabled ? 'bg-[#EAF5EC] text-[#245C3F] border-[#BCDDC3]' : 'bg-white text-[#8A9A8F] border-[#D5E0D2]'
                }`}
              >
                {s.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {s.enabled ? L('Көрсөтүлөт', 'Показывается') : L('Жашырылган', 'Скрыт')}
              </button>
              <RowActions index={i} count={slides.length} onMove={(d) => onChange(moveItem(slides, i, d))} onDelete={() => onChange(slides.filter((_, j) => j !== i))} L={L} />
            </div>
          </div>
          <ImageField value={s.image} onChange={(image) => update(i, { image })} password={password} L={L} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{L('Аталышы (KG)', 'Заголовок (KG)')}</label>
              <input className={inputCls} value={s.titleKy} onChange={(e) => update(i, { titleKy: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>{L('Аталышы (RU)', 'Заголовок (RU)')}</label>
              <input className={inputCls} value={s.titleRu} onChange={(e) => update(i, { titleRu: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>{L('Кичине текст (KG)', 'Подпись (KG)')}</label>
              <input className={inputCls} value={s.subtitleKy} onChange={(e) => update(i, { subtitleKy: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>{L('Кичине текст (RU)', 'Подпись (RU)')}</label>
              <input className={inputCls} value={s.subtitleRu} onChange={(e) => update(i, { subtitleRu: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelCls}>{L('Басканда кайда өтөт (шилтеме)', 'Куда ведёт клик (ссылка)')}</label>
            <input className={inputCls} value={s.link || ''} placeholder="#catalog" onChange={(e) => update(i, { link: e.target.value })} />
          </div>
        </div>
      ))}
      <button type="button" onClick={add} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1B4332] hover:bg-[#143427] text-white rounded-lg text-xs font-semibold">
        <Plus className="w-4 h-4" />
        <span>{L('Слайд кошуу', 'Добавить слайд')}</span>
      </button>
    </div>
  );
};

export const PromotionsEditor: React.FC<{
  promoCodes: PromoCode[];
  announcement: Announcement;
  onChangePromoCodes: (codes: PromoCode[]) => void;
  onChangeAnnouncement: (a: Announcement) => void;
  L: L;
}> = ({ promoCodes, announcement, onChangePromoCodes, onChangeAnnouncement, L }) => {
  const update = (i: number, patch: Partial<PromoCode>) =>
    onChangePromoCodes(promoCodes.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const add = () =>
    onChangePromoCodes([
      ...promoCodes,
      { id: `promo-${Date.now()}`, code: '', type: 'percent', value: 10, minOrder: 0, active: true },
    ]);

  return (
    <div className="space-y-6">
      <div className={cardCls}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-serif font-bold text-base text-[#143427]">{L('Жарнак тилкеси', 'Строка объявления')}</h4>
            <p className="text-xs text-[#526659]">
              {L('Сайттын эң үстүндөгү түстүү тилке: акциялар, жаңылыктар.', 'Цветная полоса в самом верху сайта: акции, новости.')}
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#183325] cursor-pointer shrink-0">
            <input type="checkbox" checked={announcement.enabled} onChange={(e) => onChangeAnnouncement({ ...announcement, enabled: e.target.checked })} className="w-4 h-4 accent-[#1B4332]" />
            {L('Күйгүзүү', 'Включить')}
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{L('Текст (KG)', 'Текст (KG)')}</label>
            <input className={inputCls} value={announcement.textKy} placeholder={L('Мисалы: Бардык Sealuxe -20%!', 'Например: Все Sealuxe -20%!')} onChange={(e) => onChangeAnnouncement({ ...announcement, textKy: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>{L('Текст (RU)', 'Текст (RU)')}</label>
            <input className={inputCls} value={announcement.textRu} onChange={(e) => onChangeAnnouncement({ ...announcement, textRu: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={labelCls}>{L('Шилтеме (милдеттүү эмес)', 'Ссылка (необязательно)')}</label>
          <input className={inputCls} value={announcement.link || ''} placeholder="#catalog" onChange={(e) => onChangeAnnouncement({ ...announcement, link: e.target.value })} />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="font-serif font-bold text-base text-[#143427]">{L('Промокоддор', 'Промокоды')}</h4>
          <p className="text-xs text-[#526659]">
            {L(
              'Кардар себетте кодду жазат жана арзандатуу алат. Товардын акциялык баасын товардын формасында «Эски баа» талаасы аркылуу коюңуз.',
              'Покупатель вводит код в корзине и получает скидку. Акционную цену на отдельный товар задайте в форме товара через поле «Старая цена».'
            )}
          </p>
        </div>
        {promoCodes.map((p, i) => (
          <div key={p.id} className={`${cardCls} sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-3 sm:items-end`}>
            <div className="sm:col-span-3">
              <label className={labelCls}>{L('Код', 'Код')}</label>
              <input className={`${inputCls} font-mono uppercase`} value={p.code} onChange={(e) => update(i, { code: e.target.value.toUpperCase().replace(/\s/g, '') })} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{L('Түрү', 'Тип')}</label>
              <select className={inputCls} value={p.type} onChange={(e) => update(i, { type: e.target.value as PromoCode['type'] })}>
                <option value="percent">%</option>
                <option value="fixed">{L('сом', 'сом')}</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{L('Арзандатуу', 'Скидка')}</label>
              <input type="number" min={0} className={inputCls} value={p.value} onChange={(e) => update(i, { value: Number(e.target.value) || 0 })} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{L('Мин. сумма', 'Мин. сумма')}</label>
              <input type="number" min={0} className={inputCls} value={p.minOrder} onChange={(e) => update(i, { minOrder: Number(e.target.value) || 0 })} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{L('Мөөнөтү', 'Действует до')}</label>
              <input type="date" className={inputCls} value={p.expiresAt || ''} onChange={(e) => update(i, { expiresAt: e.target.value || undefined })} />
            </div>
            <div className="sm:col-span-1 flex sm:flex-col items-center gap-2">
              <label className="inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer" title={L('Активдүү', 'Активен')}>
                <input type="checkbox" checked={p.active} onChange={(e) => update(i, { active: e.target.checked })} className="w-4 h-4 accent-[#1B4332]" />
                <span className="sm:hidden">{L('Активдүү', 'Активен')}</span>
              </label>
              <button type="button" onClick={() => onChangePromoCodes(promoCodes.filter((_, j) => j !== i))} className="p-1.5 rounded border border-red-200 bg-white text-red-600 hover:bg-red-50" title={L('Өчүрүү', 'Удалить')}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1B4332] hover:bg-[#143427] text-white rounded-lg text-xs font-semibold">
          <Plus className="w-4 h-4" />
          <span>{L('Промокод кошуу', 'Добавить промокод')}</span>
        </button>
      </div>
    </div>
  );
};

export const TextsEditor: React.FC<{
  heroTexts: HeroTexts;
  onChange: (h: HeroTexts) => void;
  language: Language;
  L: L;
}> = ({ heroTexts, onChange, L }) => {
  const kyT = TRANSLATIONS.ky.hero;
  const ruT = TRANSLATIONS.ru.hero;
  const field = (key: keyof HeroTexts, label: string, placeholder: string, multiline = false) => (
    <div>
      <label className={labelCls}>{label}</label>
      {multiline ? (
        <textarea rows={3} className={inputCls} value={heroTexts[key] || ''} placeholder={placeholder} onChange={(e) => onChange({ ...heroTexts, [key]: e.target.value })} />
      ) : (
        <input className={inputCls} value={heroTexts[key] || ''} placeholder={placeholder} onChange={(e) => onChange({ ...heroTexts, [key]: e.target.value })} />
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#526659]">
        {L(
          'Башкы беттин сол жагындагы тексттер. Бош калса, баштапкы текст көрсөтүлөт (талаада боз түс менен).',
          'Тексты в левой части главной страницы. Если поле пустое, показывается стандартный текст (виден серым в поле).'
        )}
      </p>
      <div className={`${cardCls} grid grid-cols-1 sm:grid-cols-2 gap-3 space-y-0`}>
        {field('badgeKy', L('Кичине жазуу (KG)', 'Метка над заголовком (KG)'), kyT.badge)}
        {field('badgeRu', L('Кичине жазуу (RU)', 'Метка над заголовком (RU)'), ruT.badge)}
        {field('titleKy', L('Негизги аталыш (KG)', 'Главный заголовок (KG)'), kyT.title, true)}
        {field('titleRu', L('Негизги аталыш (RU)', 'Главный заголовок (RU)'), ruT.title, true)}
        {field('subtitleKy', L('Сүрөттөмө (KG)', 'Описание (KG)'), kyT.subtitle, true)}
        {field('subtitleRu', L('Сүрөттөмө (RU)', 'Описание (RU)'), ruT.subtitle, true)}
      </div>
    </div>
  );
};
