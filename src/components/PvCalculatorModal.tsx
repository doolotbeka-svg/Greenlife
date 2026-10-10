import React, { useState } from 'react';
import { X, Calculator, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { Product } from '../types/store';
import { useEscapeKey } from '../utils/useEscapeKey';

interface PvCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivatePartner: () => void;
  onAddFranchiseKit: (product: Product) => void;
}

export const PvCalculatorModal: React.FC<PvCalculatorModalProps> = ({
  isOpen,
  onClose,
  onActivatePartner,
  onAddFranchiseKit,
}) => {
  const [familyMembers, setFamilyMembers] = useState(3);
  const [monthlyBudget, setMonthlyBudget] = useState(4500);

  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  // Greenleaf calculations:
  // Concentrated products last 3-5 times longer than supermarket analogs + 50% wholesale discount
  const supermarketYearly = monthlyBudget * 12;
  const greenleafYearly = Math.round(supermarketYearly * 0.48);
  const yearlySavings = supermarketYearly - greenleafYearly;
  const yearlyPv = Math.round((greenleafYearly / 85) * 1.1); // approx 1 PV per ~80-90 rubles wholesale
  const voucherReturn = 88000; // voucher in franchise pack

  const franchiseProduct = PRODUCTS.find((p) => p.category === 'franchise');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#DCE4D8] my-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E3EAE0] flex items-center justify-between bg-[#F8FAF7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#E6F2E8] text-[#2D6A4F] flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#2D6A4F]">
                Маркетинговый анализ Greenleaf
              </span>
              <h2 className="text-xl font-serif font-bold text-[#143427]">
                Калькулятор семейной экономии и баллов PV
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white text-[#5E7164] hover:text-[#143427] flex items-center justify-center border border-[#D5E0D2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Sliders */}
          <div className="space-y-5 bg-[#FAFBF9] p-5 rounded-xl border border-[#E3EAE0]">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-[#183325] mb-2">
                <span>Количество человек в семье:</span>
                <span className="font-mono text-sm text-[#2D6A4F] font-bold tabular-nums">
                  {familyMembers} {familyMembers === 1 ? 'человек' : familyMembers < 5 ? 'человека' : 'человек'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={familyMembers}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFamilyMembers(val);
                  setMonthlyBudget(val * 1500);
                }}
                className="w-full accent-[#2D6A4F] h-2 bg-[#D5E0D1] rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-[#183325] mb-2">
                <span>Текущие траты на бытовую химию, гигиену и косметику в месяц:</span>
                <span className="font-mono text-sm text-[#2D6A4F] font-bold tabular-nums">
                  {monthlyBudget.toLocaleString('ru-RU')} сом / мес
                </span>
              </div>
              <input
                type="range"
                min="1500"
                max="20000"
                step="500"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                className="w-full accent-[#2D6A4F] h-2 bg-[#D5E0D1] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Results Comparison Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#F8FAF7] border border-[#E3ECE0] rounded-xl p-4 text-center">
              <span className="text-[11px] uppercase tracking-wide text-[#65796D] font-semibold block mb-1">
                Обычные траты в супермаркетах
              </span>
              <span className="font-mono text-lg font-bold text-[#7A8E80] line-through block tabular-nums">
                {supermarketYearly.toLocaleString('ru-RU')} сом / год
              </span>
              <span className="text-[11px] text-[#7A8E80] mt-1 block">
                С переплатой за химию и воду
              </span>
            </div>

            <div className="bg-[#EAF5EC] border border-[#BEDEC4] rounded-xl p-4 text-center relative overflow-hidden">
              <span className="text-[11px] uppercase tracking-wide text-[#2D6A4F] font-semibold block mb-1">
                С клубной картой Greenleaf
              </span>
              <span className="font-mono text-xl font-bold text-[#143427] block tabular-nums">
                {greenleafYearly.toLocaleString('ru-RU')} сом / год
              </span>
              <span className="text-xs text-[#2D6A4F] font-semibold mt-1 block">
                Экономия: {yearlySavings.toLocaleString('ru-RU')} сом
              </span>
            </div>

            <div className="bg-[#F8FAF7] border border-[#E3ECE0] rounded-xl p-4 text-center">
              <span className="text-[11px] uppercase tracking-wide text-[#65796D] font-semibold block mb-1">
                Накопление баллов в год
              </span>
              <span className="font-mono text-xl font-bold text-[#2D6A4F] block tabular-nums">
                +{yearlyPv} PV
              </span>
              <span className="text-[11px] text-[#556F5E] mt-1 block">
                Баллы для карьерного роста
              </span>
            </div>
          </div>

          {/* Partnership Summary Card */}
          <div className="bg-[#FAFBF9] border border-[#E3EAE0] rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#183325]">
              Что дает статус Партнера / Франшиза Greenleaf:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#3C5243]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>Пожизненная оптовая скидка 50%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>Ваучер на кэшбэк {voucherReturn.toLocaleString('ru-RU')} сом</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>Накопление PV без сгорания</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>Право открытия фирменного СЦ / магазина</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onActivatePartner();
                onClose();
              }}
              className="flex-1 py-3 px-4 bg-[#1B4332] hover:bg-[#143427] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#74C69D]" />
              <span>Активировать клубные цены (-50%)</span>
            </button>

            {franchiseProduct && (
              <button
                type="button"
                onClick={() => {
                  onAddFranchiseKit(franchiseProduct);
                  onClose();
                }}
                className="flex-1 py-3 px-4 bg-white hover:bg-[#F2F6F1] text-[#1B4332] border border-[#BACDBA] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>Заказать стартовый набор (+275 PV)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
