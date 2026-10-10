// Source: Google Maps Platform Code Assist
import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Phone, Clock, ExternalLink, Layers, CheckCircle2 } from 'lucide-react';
import { SellerSettings } from '../types/store';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface StoreLocationMapProps {
  sellerSettings: SellerSettings;
  language: Language;
}

// Osh Center: Kurmanjan Datka / Lenin street area coordinates
const OSH_COORDINATES = {
  lat: 40.5283,
  lng: 72.7985,
};

export const StoreLocationMap: React.FC<StoreLocationMapProps> = ({ sellerSettings, language }) => {
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(true);
  const [mapType, setMapType] = useState<'interactive' | 'osm'>('interactive');
  const t = TRANSLATIONS[language];

  // Primary API key from env or provisioned demo key
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAZcyIJHLcFte7FlTYSeXIapc3PBbvFYzw';

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${OSH_COORDINATES.lat},${OSH_COORDINATES.lng}&destination_place_id=Osh`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=72.7800%2C40.5180%2C72.8200%2C40.5380&layer=mapnik&marker=${OSH_COORDINATES.lat}%2C${OSH_COORDINATES.lng}`;

  return (
    <section id="location-map" className="py-14 bg-[#F5F8F4] border-t border-[#DFE6DC] text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#2D6A4F] mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{language === 'ky' ? 'Кампанын жайгашкан жери' : 'Расположение склада'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#143427]">
              {language === 'ky' ? 'Ош шаарындагы кампабыз картада' : 'Наш склад и пункт выдачи в г. Ош'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#526659] hidden sm:inline">
              {language === 'ky' ? 'Карта түрү:' : 'Вид карты:'}
            </span>
            <button
              type="button"
              onClick={() => setMapType('interactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                mapType === 'interactive'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'bg-white text-[#2D6A4F] border border-[#CBD7C7]'
              }`}
            >
              Google Maps
            </button>
            <button
              type="button"
              onClick={() => setMapType('osm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                mapType === 'osm'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'bg-white text-[#2D6A4F] border border-[#CBD7C7]'
              }`}
            >
              OpenStreet
            </button>
          </div>
        </div>

        {/* Map Container + Details Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Map Area */}
          <div className="lg:col-span-8 bg-white rounded-2xl overflow-hidden border border-[#D5DFD1] shadow-md h-[420px] sm:h-[480px] relative">
            {mapType === 'interactive' && apiKey ? (
              <APIProvider apiKey={apiKey} language={language}>
                <Map
                  defaultCenter={OSH_COORDINATES}
                  defaultZoom={15}
                  mapId="DEMO_MAP_ID"
                  className="w-full h-full"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  disableDefaultUI={false}
                  gestureHandling="cooperative"
                >
                  <AdvancedMarker
                    position={OSH_COORDINATES}
                    onClick={() => setIsInfoWindowOpen(true)}
                    title={sellerSettings.storeName || 'Greenleaf Osh'}
                  >
                    <Pin
                      background="#1B4332"
                      glyphColor="#74C69D"
                      borderColor="#0E2319"
                      scale={1.25}
                    />
                  </AdvancedMarker>

                  {isInfoWindowOpen && (
                    <InfoWindow
                      position={OSH_COORDINATES}
                      onCloseClick={() => setIsInfoWindowOpen(false)}
                      headerContent={
                        <span className="font-serif font-bold text-[#143427] text-sm">
                          {sellerSettings.storeName || 'Greenleaf Osh'}
                        </span>
                      }
                    >
                      <div className="p-1 space-y-1.5 text-xs text-[#2A3F31] max-w-[220px]">
                        <p className="font-medium text-[#2D6A4F] flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#1B4332]" />
                          <span>{sellerSettings.sellerAddress || 'Кыргызстан, Ош ш., Курманжан Датка көч.'}</span>
                        </p>
                        <p className="text-[11px] text-[#55695C] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#2D6A4F]" />
                          <span>09:00 - 20:00 (күн сайын / ежедневно)</span>
                        </p>
                        <div className="pt-1 flex items-center justify-between border-t border-[#E3ECE1]">
                          <span className="text-[10px] font-bold text-[#2D6A4F]">✓ Акысыз самовывоз</span>
                          <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B4332] hover:text-[#2D6A4F] underline"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>{language === 'ky' ? 'Маршрут' : 'Маршрут'}</span>
                          </a>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            ) : (
              <div className="w-full h-full relative">
                <iframe
                  title="Osh Warehouse Map"
                  src={osmEmbedUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#CBD7C7] text-xs font-semibold text-[#1B4332] shadow-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>{sellerSettings.storeName || 'Greenleaf Osh'}</span>
                </div>
              </div>
            )}

            {/* Quick Badge overlay */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#D5DFD1] text-[11px] font-medium text-[#2D6A4F] shadow-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'ky' ? 'Кампа Ош борборунда' : 'Склад в центре г. Ош'}</span>
            </div>
          </div>

          {/* Quick Info & Working Hours Box */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#D5DFD1] shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="border-b border-[#E7EFE4] pb-4">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#2D6A4F]">
                  {language === 'ky' ? 'Байланыш жана дарек' : 'Адрес и контакты склада'}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#143427] mt-1">
                  {sellerSettings.storeName || 'Greenleaf Osh'}
                </h3>
                <p className="text-xs text-[#4F6456] mt-1 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <span>{sellerSettings.sellerAddress || 'Кыргызстан, Ош ш., Курманжан Датка көчөсү'}</span>
                </p>
              </div>

              <div className="space-y-3.5 text-xs text-[#3E5345]">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-[#143427]">
                      {language === 'ky' ? 'Иштөө тартиби:' : 'График работы:'}
                    </span>
                    <span className="text-[11px]">
                      {language === 'ky' ? 'Дүйшөмбү - Жекшемби: 09:00 - 20:00 (дем алышсыз)' : 'Пн - Вс: с 09:00 до 20:00 (без выходных)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-[#143427]">
                      {language === 'ky' ? 'WhatsApp байланыш:' : 'WhatsApp для заказов:'}
                    </span>
                    <span className="text-[11px] font-mono font-medium">
                      {sellerSettings.whatsappPhone || '+996 770 123 456'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Navigation className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-[#143427]">
                      {language === 'ky' ? 'Жеткирүү шарттары:' : 'Условия получения:'}
                    </span>
                    <span className="text-[11px]">
                      {language === 'ky'
                        ? '• Кампадан өзүңүз алып кетүү: Акысыз\n• Ош шаары: курьер 150 сом (3000 сомдон бекер)\n• Кыргызстан боюнча: 1-2 күн'
                        : '• Самовывоз со склада: Бесплатно\n• Курьер по г. Ош: 150 сом (от 3000 сом бесплатно)\n• Доставка по Кыргызстану: 1-2 дня'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E7EFE4] flex flex-col gap-2">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-[#1B4332] hover:bg-[#143427] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{language === 'ky' ? 'Google Картадан ачуу жана маршрут' : 'Открыть в Google Картах и маршрут'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
