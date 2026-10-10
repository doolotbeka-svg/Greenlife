import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export function createGeminiRouter() {
  const router = express.Router();

  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  router.post('/chat', async (req, res) => {
    const { message, language = 'ky', history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Helper for friendly domain-specific responses if API is busy or unconfigured
    const getFallbackAnswer = (userQuery: string, lang: string): string => {
      const q = userQuery.toLowerCase();

      if (lang === 'ky') {
        if (q.includes('пластин') || q.includes('кир жуу') || q.includes('kardli')) {
          return 'Kardli нано-эко пластиналары (1250 сом, 64 даана) — 6 кг кадимки порошокту алмаштырат! Курамында 0% фосфат, 0% хлор, кокос майы жана өсүмдүк ферменттери бар. Муздак сууда 10 секундда эрийт, балдардын кийимине жана сезимтал териге толук коопсуз. Ош кампасында бар!';
        }
        if (q.includes('сыворотк') || q.includes('sealuxe') || q.includes('бет') || q.includes('косметик')) {
          return 'Sealuxe Youth Hydra пептид сывороткасы (4200 сом, 50 мл) — Швейцариянын Matrixyl комплекси жана жез трипептиддери менен терини клеткалык деңгээлде жашартат, бырыштарды жазат. 14 күндө сезилерлик лифтинг берет. Ош шаарындагы кампада бар!';
        }
        if (q.includes('идиш') || q.includes('гель') || q.includes('ilife') || q.includes('жемиш')) {
          return 'iLife концентрат эко-гели (850 сом, 1000 мл, 1:5 өлчөмүндө аралаштырылат) — жүгөрү канты жана алоэ экстракты менен жасалган. Идиштерди, жада калса балдардын бөтөлкөлөрүн жана алма-жемиштерди жууганга арналган. 6-8 айга жетет!';
        }
        if (q.includes('тиш') || q.includes('паста') || q.includes('carich')) {
          return 'Carich деңиз балырларынан жасалган тиш пастасы (590 сом, 200 г) — фторсуз, зыяндуу химиясыз. Бүйлөнүн каноосун алгачкы күндөрдөн токтотот жана оозду 12 саат сергитет. Halal сертификаты бар!';
        }
        if (q.includes('жеткирүү') || q.includes('доставк') || q.includes('ош') || q.includes('адрес') || q.includes('кампа')) {
          return 'Биздин кампа Кыргызстан, Ош шаары, Курманжан Датка көчөсүндө жайгашкан. Кампадан өзүңүз алып кетүү — Акысыз! Ош шаары боюнча курьер — 150 сом (3000 сомдон жогору акысыз). Кыргызстандын бардык аймактарына такси/почта менен 1-2 күндө жетет.';
        }
        if (q.includes('50%') || q.includes('оптом') || q.includes('арзан') || q.includes('франшиз') || q.includes('кейс') || q.includes('бизнес')) {
          return 'Greenleaf заводунан 50% арзандатуу менен түз алуу үчүн расмий өнөктөштүк старттык кейсин (38 000 сом) сунуштайбыз. Сизге өмүр бою 50% заводдук арзандатуу, баланска 88 000 сомдук кэшбэк-ваучер жана продукция топтому берилет. WhatsApp аркылуу толук маалымат алсаңыз болот!';
        }
        return 'Саламатсызбы! Greenleaf Osh эко-дүкөнүндө Sealuxe косметикасы, Kardli нано-пластиналары, iLife эко-гели жана Carich гигиенасы Ош шаарындагы кампада бар. Буюртманы сайттан же WhatsApp аркылуу 1 клик менен бере аласыз!';
      } else {
        if (q.includes('пластин') || q.includes('стирк') || q.includes('порошок') || q.includes('kardli')) {
          return 'Эко-пластины для стирки Kardli (1250 сом, 64 шт.) заменяют до 6 кг обычного порошка! 0% фосфатов, 0% хлора, гипоаллергенно, подходят для детского белья с первых дней жизни. Растворяются за 10 секунд в холодной воде. В наличии на складе в г. Ош!';
        }
        if (q.includes('сыворотк') || q.includes('sealuxe') || q.includes('косметик') || q.includes('лицо')) {
          return 'Пептидная сыворотка Sealuxe Youth Hydra (4200 сом, 50 мл) — швейцарские биотехнологии клеточного омоложения с пептидами Matrixyl и трипептидами меди. Заметный лифтинг за 14 дней. В наличии со склада в г. Ош!';
        }
        if (q.includes('посуд') || q.includes('гель') || q.includes('ilife') || q.includes('фрукт')) {
          return 'Эко-гель iLife для посуды и фруктов (850 сом, 1000 мл концентрат 1:5) — на основе кукурузного сахара и экстракта алоэ. Безопасен для мытья детских бутылочек, фруктов и зелени. Хватает на 6–8 месяцев!';
        }
        if (q.includes('зубн') || q.includes('паст') || q.includes('carich')) {
          return 'Морская зубная паста Carich (590 сом, 200 г) — на экстракте бурых водорослей без фтора и абразивов. Быстро снимает кровоточивость десен, надолго освежает дыхание. Имеет сертификат Halal!';
        }
        if (q.includes('доставк') || q.includes('ош') || q.includes('адрес') || q.includes('склад') || q.includes('где')) {
          return 'Наш склад расположен в Кыргызстане, г. Ош (ул. Курманжан Датка). Самовывоз со склада — бесплатно. Курьер по г. Ош — 150 сом (от 3000 сом бесплатно). Быстрая отправка по всему Кыргызстану (Бишкек, Джалал-Абад и др.) за 1-2 дня.';
        }
        if (q.includes('50%') || q.includes('опт') || q.includes('скидк') || q.includes('франшиз') || q.includes('бизнес')) {
          return 'Для покупок напрямую у производителя со скидкой 50% мы оформляем дистрибьюторский номер Greenleaf (стартовый кейс 38 000 сом). Вы получаете пожизненную клубную оптовую цену, кэшбэк-ваучер на 88 000 сом и флагманскую продукцию. Свяжитесь в WhatsApp для консультации!';
        }
        return 'Здравствуйте! В нашем складе в г. Ош в наличии оригинальная эко-продукция Greenleaf: косметика Sealuxe, нано-пластины Kardli, средства для дома iLife и гигиена Carich. Вы можете оформить заказ в 1 клик через WhatsApp или добавить товары в корзину на сайте.';
      }
    };

    if (!ai) {
      res.json({ reply: getFallbackAnswer(message, language) });
      return;
    }

    const systemInstruction = `
You are the official smart AI assistant and consultant for the "Greenleaf Osh" eco-product warehouse store located in Osh, Kyrgyzstan (Кыргызстан, Ош шаары, ул. Курманжан Датка).
100% original products from Greenleaf Corporation factory (Suzhou).

Store info:
- Location: Osh city, Kyrgyzstan (ул. Курманжан Датка).
- Pickup in Osh is Free (Акысыз). Courier in Osh: 150 KGS (Free >= 3000 KGS). Kyrgyzstan-wide: 250 KGS (Free >= 5000 KGS).
- Products: Sealuxe Serum (4200 сом), Kardli Laundry (1250 сом), iLife Dish Gel (850 сом), Carich Toothpaste (590 сом), Carich Pads (690 сом), Nilrich Cordyceps (4800 сом), Greenleaf Case (38000 сом).
- Answer in Kyrgyz if user asks in Kyrgyz, or Russian if in Russian.
- Keep responses friendly, helpful, and concise (2-4 paragraphs).
`;

    const contents = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-4)) {
        if (item.sender === 'user') {
          contents.push({ role: 'user', parts: [{ text: item.text }] });
        } else if (item.sender === 'bot') {
          contents.push({ role: 'model', parts: [{ text: item.text }] });
        }
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    // Try Gemini models with resilience and fast timeout fallback
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini timeout')), 2500)
        );

        const apiPromise = ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const response: any = await Promise.race([apiPromise, timeoutPromise]);

        if (response?.text) {
          res.json({ reply: response.text });
          return;
        }
      } catch (err: any) {
        lastError = err;
        // Continue to try fallback model or local domain answer
      }
    }

    console.warn('Gemini models unavailable, returning expert knowledge response. Error:', lastError?.message);
    // Return domain expert answer seamlessly
    res.json({ reply: getFallbackAnswer(message, language) });
  });

  return router;
}
