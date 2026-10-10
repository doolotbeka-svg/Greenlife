import React, { useState } from 'react';
import { X, CheckCircle, Sparkles, Shield, Gift, ArrowRight, UserCheck } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { Product } from '../types/store';
import { useEscapeKey } from '../utils/useEscapeKey';

interface PartnerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPartner: boolean;
  partnerId: string;
  onSavePartnerId: (id: string) => void;
  onAddFranchiseKit: (product: Product) => void;
}

export const PartnerRegistrationModal: React.FC<PartnerRegistrationModalProps> = ({
  isOpen,
  onClose,
  isPartner,
  partnerId,
  onSavePartnerId,
  onAddFranchiseKit,
}) => {
  const [existingId, setExistingId] = useState(partnerId || '');
  const [activeTab, setActiveTab] = useState<'benefits' | 'enter_id'>('benefits');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const franchiseProduct = PRODUCTS.find((p) => p.category === 'franchise');

  const handleApplyExistingId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingId.trim()) {
      setErrorMessage('Пожалуйста, введите корректный номер ID партнера.');
      return;
    }
    setErrorMessage('');
    onSavePartnerId(existingId.trim().toUpperCase());
    setRegisteredSuccess(true);
    setTimeout(() => {
      setRegisteredSuccess(false);
      onClose();
    }, 1200);
  };

  const handleGenerateDemoId = () => {
    const randomId = `GL-${Math.floor(100000 + Math.random() * 900000)}`;
    setExistingId(randomId);
    onSavePartnerId(randomId);
    setRegisteredSuccess(true);
    setTimeout(() => {
      setRegisteredSuccess(false);
      onClose();
    }, 1200);
  };

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
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#2D6A4F]">
                Клуб Greenleaf
              </span>
              <h2 className="text-xl font-serif font-bold text-[#143427]">
                Партнерская программа и франшиза
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

        {/* Tab switcher */}
        <div className="flex border-b border-[#E3EAE0] bg-[#FAFBF9] px-6">
          <button
            type="button"
            onClick={() => setActiveTab('benefits')}
            className={`py-3 text-xs sm:text-sm font-medium border-b-2 mr-6 transition-colors ${
              activeTab === 'benefits'
                ? 'border-[#2D6A4F] text-[#143427] font-semibold'
                : 'border-transparent text-[#62776A] hover:text-[#143427]'
            }`}
          >
            Привилегии партнерства
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('enter_id')}
            className={`py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'enter_id'
                ? 'border-[#2D6A4F] text-[#143427] font-semibold'
                : 'border-transparent text-[#62776A] hover:text-[#143427]'
            }`}
          >
            Активировать ID партнера
          </button>
        </div>

        {/* Tab 1: Benefits */}
        {activeTab === 'benefits' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#E9F3EB] text-[#2D6A4F] flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#143427]">
                    Скидка до 50% на всю жизнь
                  </h4>
                  <p className="text-xs text-[#526659] mt-0.5">
                    Без обязательных ежемесячных закупок и подтверждения квалификации. Вы покупаете товары напрямую по оптовой цене завода.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#E9F3EB] text-[#2D6A4F] flex items-center justify-center shrink-0 mt-0.5">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#143427]">
                    Кешбэк-купон на 88 000 рублей
                  </h4>
                  <p className="text-xs text-[#526659] mt-0.5">
                    При покупке стартового бизнес-набора на ваш счет начисляются электронные купоны для оплаты части будущих заказов.
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#E9F3EB] text-[#2D6A4F] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#143427]">
                    Баллы PV и маркетинговые выплаты
                  </h4>
                  <p className="text-xs text-[#526659] mt-0.5">
                    Каждая покупка вашей семьи или приглашенных партнеров генерирует накопительные PV баллы, конвертируемые в вознаграждение.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-[#E3EAE0] flex flex-col sm:flex-row gap-3">
              {franchiseProduct && (
                <button
                  type="button"
                  onClick={() => {
                    onAddFranchiseKit(franchiseProduct);
                    onClose();
                  }}
                  className="flex-1 py-3 px-4 bg-[#1B4332] hover:bg-[#143427] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>Купить стартовый набор партнера</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('enter_id')}
                className="py-3 px-4 bg-white border border-[#CBD7C7] hover:bg-[#F2F6F1] text-[#143427] text-xs font-semibold rounded-lg transition-colors"
              >
                У меня уже есть номер ID
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Enter existing ID */}
        {activeTab === 'enter_id' && (
          <div className="p-6 sm:p-8 space-y-6">
            {registeredSuccess ? (
              <div className="p-6 bg-[#EDF7EF] border border-[#C5E5CC] rounded-xl text-center text-[#1B4332] space-y-2">
                <CheckCircle className="w-8 h-8 text-[#2D6A4F] mx-auto" />
                <h3 className="font-bold text-base">ID партнера успешно активирован!</h3>
                <p className="text-xs text-[#476652]">
                  Теперь каталог отображает оптовые цены со скидкой 50% и начислением баллов PV.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplyExistingId} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#183325] uppercase tracking-wider mb-2">
                    Введите ваш номер ID дистрибьютора Greenleaf:
                  </label>
                  <input
                    type="text"
                    required
                    value={existingId}
                    onChange={(e) => {
                      setExistingId(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Например: GL-884920"
                    className="w-full px-4 py-3 text-sm bg-white border border-[#CBD7C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] font-mono"
                  />
                  {errorMessage && (
                    <p className="text-xs text-red-600 font-medium mt-1.5">{errorMessage}</p>
                  )}
                  <p className="text-xs text-[#62776A] mt-1.5">
                    Укажите персональный номер, выданный при оформлении партнерского договора или регистрационного набора.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#1B4332] hover:bg-[#143427] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Активировать скидку 50%</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateDemoId}
                    className="py-3 px-4 bg-[#F2F6F1] hover:bg-[#E6EFE4] text-[#1B4332] text-xs font-semibold rounded-lg transition-colors border border-[#CBD7C7]"
                    title="Для тестирования магазина с партнерскими ценами"
                  >
                    Тестовый ID партнера
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
