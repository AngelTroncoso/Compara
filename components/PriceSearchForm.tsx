import React, { useState, useRef } from 'react';
import { Search, MapPin, ShoppingBag, Loader2, Camera, X, Image as ImageIcon, DollarSign, SlidersHorizontal, Globe, Sparkles } from 'lucide-react';
import { SearchParams } from '../types';
import { identifyProductFromImage } from '../services/gemini';

interface PriceSearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

const CURRENCIES = [
  { code: 'USD', name: 'Dólar Estadounidense ($)', country: 'EE.UU.' },
  { code: 'EUR', name: 'Euro (€)', country: 'Unión Europea' },
  { code: 'MXN', name: 'Peso Mexicano ($)', country: 'México' },
  { code: 'COP', name: 'Peso Colombiano ($)', country: 'Colombia' },
  { code: 'ARS', name: 'Peso Argentino ($)', country: 'Argentina' },
  { code: 'CLP', name: 'Peso Chileno ($)', country: 'Chile' },
  { code: 'PEN', name: 'Sol Peruano (S/)', country: 'Perú' },
  { code: 'BRL', name: 'Real Brasileño (R$)', country: 'Brasil' },
  { code: 'GBP', name: 'Libra Esterlina (£)', country: 'Reino Unido' },
  { code: 'JPY', name: 'Yen Japonés (¥)', country: 'Japón' },
  { code: 'CAD', name: 'Dólar Canadiense ($)', country: 'Canadá' },
  { code: 'AUD', name: 'Dólar Australiano ($)', country: 'Australia' },
  { code: 'CNY', name: 'Yuan Chino (¥)', country: 'China' },
  { code: 'INR', name: 'Rupia India (₹)', country: 'India' },
  { code: 'KRW', name: 'Won Surcoreano (₩)', country: 'Corea del Sur' },
  { code: 'CHF', name: 'Franco Suizo (Fr)', country: 'Suiza' },
  { code: 'UYU', name: 'Peso Uruguayo ($)', country: 'Uruguay' },
  { code: 'DOP', name: 'Peso Dominicano ($)', country: 'Rep. Dominicana' },
  { code: 'GTQ', name: 'Quetzal (Q)', country: 'Guatemala' },
  { code: 'CRC', name: 'Colón Costarricense (₡)', country: 'Costa Rica' },
  { code: 'BOB', name: 'Boliviano (Bs.)', country: 'Bolivia' },
  { code: 'PYG', name: 'Guaraní (₲)', country: 'Paraguay' },
  { code: 'VEF', name: 'Bolívar (Bs.)', country: 'Venezuela' },
].sort((a, b) => a.code.localeCompare(b.code));

export const PriceSearchForm: React.FC<PriceSearchFormProps> = ({ onSearch, isLoading }) => {
  const [item, setItem] = useState('');
  const [location, setLocation] = useState('');
  const [currency, setCurrency] = useState('USD');
  
  // Image state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Price Filter state
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [priceScale, setPriceScale] = useState<number>(1000);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        setSelectedImage(result);
        const matches = result.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64 = matches[2];
          setImageMimeType(mimeType);
          setImageBase64(base64);

          // Auto-analyze image to get product name
          setIsAnalyzing(true);
          try {
            const detectedProduct = await identifyProductFromImage(base64, mimeType);
            if (detectedProduct) {
              setItem(detectedProduct.trim());
            }
          } catch (error) {
            console.error("Failed to identify product", error);
          } finally {
            setIsAnalyzing(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImageBase64(null);
    setImageMimeType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePriceScaleChange = (scale: number) => {
    setPriceScale(scale);
    if (maxPrice > scale) {
      setMaxPrice(scale);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((item.trim() || imageBase64) && location.trim()) {
      onSearch({ 
        item, 
        location,
        currency,
        imageBase64: imageBase64 || undefined,
        imageMimeType: imageMimeType || undefined,
        minPrice: showPriceFilter && minPrice !== '' ? Number(minPrice) : undefined,
        maxPrice: showPriceFilter ? maxPrice : undefined
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search className="w-6 h-6" />
          Comparador de Precios Global
        </h2>
        <p className="text-blue-100 mt-2 text-sm">
          Edición Avanzada: Multimodal, Tendencias y Conversión de Moneda.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        {/* Section 1: Product & Image */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="item" className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <ShoppingBag className="w-4 h-4 text-gray-500" />
              ¿Qué estás buscando?
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="item"
                  type="text"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder={isAnalyzing ? "Identificando producto..." : "Nombre del producto o descripción..."}
                  disabled={isAnalyzing}
                  className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white outline-none ${isAnalyzing ? 'pl-10 text-gray-400' : ''}`}
                />
                {isAnalyzing && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                )}
                {!isAnalyzing && item && selectedImage && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500 animate-in zoom-in duration-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
                className={`px-4 py-3 rounded-lg border transition-colors flex items-center gap-2 ${
                  selectedImage ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600'
                }`}
                title="Subir foto del producto"
              >
                <Camera className="w-5 h-5" />
                <span className="hidden sm:inline">Foto</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {isAnalyzing && (
              <p className="text-xs text-blue-600 animate-pulse">
                Analizando imagen para detectar marca y modelo...
              </p>
            )}
          </div>

          {selectedImage && (
            <div className="relative inline-block mt-2 animate-in fade-in zoom-in duration-300">
              <img 
                src={selectedImage} 
                alt="Product preview" 
                className={`h-24 w-24 object-cover rounded-lg border border-gray-200 shadow-sm transition-opacity ${isAnalyzing ? 'opacity-50' : 'opacity-100'}`}
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Section 2: Location & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-500" />
                ¿Dónde estás?
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Madrid, Ciudad de México..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <Globe className="w-4 h-4 text-gray-500" />
                Moneda
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white outline-none appearance-none cursor-pointer"
                style={{backgroundImage: 'none'}} 
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} - {curr.country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Price Filter */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mb-4"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showPriceFilter ? 'Ocultar Filtro de Presupuesto' : 'Definir Presupuesto / Rango'}
            </button>

            {showPriceFilter && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-200 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    Rango ({currency})
                  </label>
                  
                  <div className="flex gap-1">
                    {[100, 1000, 5000].map((scale) => (
                      <button
                        key={scale}
                        type="button"
                        onClick={() => handlePriceScaleChange(scale)}
                        className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                          priceScale === scale 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {scale < 1000 ? `<${scale}` : `<${scale/1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="relative pt-1">
                    <input
                      type="range"
                      min="0"
                      max={priceScale}
                      step={priceScale / 100}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0 {currency}</span>
                      <span className="font-semibold text-blue-600">Máx: {maxPrice} {currency}</span>
                      <span>{priceScale}+ {currency}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                     <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Mínimo ({currency})</label>
                      <input
                        type="number"
                        min="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Máximo ({currency})</label>
                      <input
                        type="number"
                        min="0"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 text-sm font-semibold text-blue-700 bg-blue-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isAnalyzing || (!item.trim() && !imageBase64) || !location.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 transform active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Buscando ofertas...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Buscar Mejor Precio
            </>
          )}
        </button>
      </form>
    </div>
  );
};
