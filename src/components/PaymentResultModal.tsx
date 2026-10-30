import React from 'react';
import { CheckCircle2, XCircle, Clock, Loader2, MessageSquare } from 'lucide-react';
import { Order } from '../types/store';
import { Language } from '../i18n/translations';
import { useEscapeKey } from '../utils/useEscapeKey';

interface PaymentResultModalProps {
  orderId: string;
  status: Order['paymentStatus'] | 'checking';
  language: Language;
  whatsappPhone: string;
  onClose: () => void;
}

export const PaymentResultModal: React.FC<PaymentResultModalProps> = ({ orderId, status, language, whatsappPhone, onClose }) => {
  const ky = language === 'ky';
  useEscapeKey(true, onClose);

  const view =
    status === 'paid'
      ? {
          icon: <CheckCircle2 className="w-10 h-10 text-[#2D6A4F]" />,
          title: ky ? 'Төлөм ийгиликтүү өттү!' : 'Оплата прошла успешно!',
          text: ky
            ? `#${orderId} буюртмаңыз төлөндү. Жакында биз сиз менен байланышабыз.`
            : `Заказ #${orderId} оплачен. Мы скоро свяжемся с вами.`,
        }
      : status === 'failed'
      ? {
          icon: <XCircle className="w-10 h-10 text-red-600" />,
          title: ky ? 'Төлөм өткөн жок' : 'Оплата не прошла',
          text: ky
            ? `#${orderId} буюртмасы сакталды, бирок төлөнгөн жок. WhatsApp аркылуу жазыңыз же алганда төлөңүз.`
            : `Заказ #${orderId} сохранён, но не оплачен. Напишите нам в WhatsApp или оплатите при получении.`,
        }
      : status === 'checking'
      ? {
          icon: <Loader2 className="w-10 h-10 text-[#2D6A4F] animate-spin" />,
          title: ky ? 'Төлөм текшерилүүдө...' : 'Проверяем оплату...',
          text: ky ? 'Бир нече секунд күтө туруңуз.' : 'Подождите несколько секунд.',
        }
      : {
          icon: <Clock className="w-10 h-10 text-amber-600" />,
          title: ky ? 'Төлөм али ырасталган жок' : 'Оплата ещё не подтверждена',
          text: ky
            ? `Эгер төлөгөн болсоңуз, ырастоо бир аз убакыттан кийин келет. Буюртма: #${orderId}.`
            : `Если вы оплатили, подтверждение придёт чуть позже. Номер заказа: #${orderId}.`,
        };

  const cleanPhone = whatsappPhone.replace(/[^0-9]/g, '');
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        ky ? `Саламатсызбы! Буюртмам #${orderId} боюнча жазып жатам.` : `Здравствуйте! Пишу по заказу #${orderId}.`
      )}`
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 text-center space-y-4 shadow-2xl border border-[#DCE4D8]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center">{view.icon}</div>
        <h2 className="text-xl font-serif font-bold text-[#143427]">{view.title}</h2>
        <p className="text-sm text-[#4D6254]">{view.text}</p>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {status !== 'paid' && status !== 'checking' && waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold rounded-lg"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>WhatsApp</span>
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#1B4332] hover:bg-[#143427] text-white text-xs font-semibold rounded-lg"
          >
            {ky ? 'Жабуу' : 'Закрыть'}
          </button>
        </div>
      </div>
    </div>
  );
};
