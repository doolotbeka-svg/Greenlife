import React from 'react';
import { UserCheck, Sparkles, Check, Calculator, ArrowRight } from 'lucide-react';

interface PartnerBannerProps {
  isPartner: boolean;
  partnerId: string;
  onTogglePartnerMode: () => void;
  onOpenPartnerModal: () => void;
  onOpenCalculator: () => void;
}

export const PartnerBanner: React.FC<PartnerBannerProps> = ({
  isPartner,
  partnerId,
  onTogglePartnerMode,
  onOpenPartnerModal,
  onOpenCalculator,
}) => {
  return (
    <div className="bg-[#EBF3EC] border-b border-[#D4E3D5] py-3.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left: Mode description */}
        <div className="flex items-center gap-3 text-[#1B4332]">
          <div className="w-8 h-8 rounded-full bg-[#D8F3DC] flex items-center justify-center shrink-0 text-[#2D6A4F]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-[#143427]">
              {isPartner
                ? `Режим партнера Greenleaf активен`
                : 'Покупайте со скидкой до 50% по клубной цене'}
            </span>
            <span className="hidden sm:inline text-[#4A6354] ml-2">
              {isPartner
                ? `ID: ${partnerId || 'GL-884920'} · Цены отображаются со скидкой дистрибьютора + начисление баллов PV`
                : 'Станьте партнером корпорации Greenleaf и экономьте семейный бюджет на эко-товарах'}
            </span>
          </div>
        </div>

        {/* Right: Interactive controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onTogglePartnerMode}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isPartner
                ? 'bg-[#1B4332] text-white hover:bg-[#143427] shadow-sm'
                : 'bg-white text-[#1B4332] border border-[#BACDBA] hover:bg-[#F2F7F2]'
            }`}
          >
            {isPartner ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#74C69D]" />
                <span>Клубная цена (-50%)</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>Включить цены партнера</span>
              </>
            )}
          </button>

          {!isPartner ? (
            <button
              type="button"
              onClick={onOpenPartnerModal}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#2D6A4F] hover:text-[#1B4332] underline underline-offset-4"
            >
              <span>Как получить клубную карту?</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCalculator}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#2D6A4F] hover:text-[#1B4332] underline underline-offset-4"
            >
              <Calculator className="w-3 h-3" />
              <span>Калькулятор PV</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
