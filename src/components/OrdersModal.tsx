import React from 'react';
import { X, Package, CheckCircle2, Printer } from 'lucide-react';
import { Order } from '../types/store';
import { Language, Currency, TRANSLATIONS, formatPrice } from '../i18n/translations';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  language: Language;
  currency: Currency;
}

export const OrdersModal: React.FC<OrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  language,
  currency,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#DCE4D8] my-8 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E3EAE0] flex items-center justify-between bg-[#F8FAF7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#E6F2E8] text-[#2D6A4F] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#2D6A4F]">
                {t.orders.historyTitle}
              </span>
              <h2 className="text-xl font-serif font-bold text-[#143427]">
                {t.orders.myOrdersTitle}
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
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="font-serif text-lg font-bold text-[#143427]">
                {t.orders.emptyTitle}
              </p>
              <p className="text-xs text-[#5E7164]">
                {t.orders.emptyDesc}
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const totalAmount = order.totalRetail || (order.isPartner && order.totalPartner ? order.totalPartner : 0);
              return (
                <div
                  key={order.id}
                  className="bg-[#FAFBF9] border border-[#E1E8DE] rounded-xl p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E7EFE4]">
                    <div>
                      <span className="font-mono font-bold text-[#143427] text-sm sm:text-base">
                        {t.orders.orderNum}{order.id}
                      </span>
                      <span className="text-xs text-[#6B8071] ml-3">{order.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#2D6A4F] font-semibold bg-[#EAF5EC] px-2.5 py-1 rounded-md border border-[#C6E2CB]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.orders.statusProcessing}</span>
                    </div>
                  </div>

                  {/* Delivery and recipient details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#4F6456]">
                    <div>
                      <span className="text-[#7A8E80] block">{t.orders.recipient}</span>
                      <span className="font-medium text-[#183124]">
                        {order.customerName} ({order.phone})
                      </span>
                    </div>
                    <div>
                      <span className="text-[#7A8E80] block">{t.orders.address}</span>
                      <span className="font-medium text-[#183124]">{order.address}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 pt-2 border-t border-[#EAEFE8]">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#7A8E80]">
                      {t.orders.itemsList}
                    </span>
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => {
                        const itemName = (language === 'ky' && item.product.nameKy) ? item.product.nameKy : item.product.name;
                        return (
                          <div key={idx} className="flex justify-between text-xs text-[#2C4133]">
                            <span className="truncate max-w-xs sm:max-w-md">
                              {itemName} × {item.quantity} {t.cart.itemsCount}
                            </span>
                            <span className="font-mono tabular-nums font-medium">
                              {formatPrice((order.isPartner ? item.product.partnerPrice : item.product.retailPrice) * item.quantity, currency)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E7EFE4] text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-[#2D6A4F] font-semibold font-mono tabular-nums">
                        +{order.totalPv} PV
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#143427] text-sm font-mono tabular-nums">
                        {t.orders.totalSum} {formatPrice(totalAmount, currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="p-1.5 text-[#5E7164] hover:text-[#143427] hover:bg-[#EEF3EC] rounded"
                        title={language === 'ky' ? 'Басып чыгаруу' : 'Печать квитанции'}
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
