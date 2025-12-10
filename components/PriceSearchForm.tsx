import React, { useState, useRef } from 'react';
import { Search, MapPin, ShoppingBag, Loader2, Camera, X, Image as ImageIcon, DollarSign, SlidersHorizontal } from 'lucide-react';
import { SearchParams } from '../types';

interface PriceSearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export const PriceSearchForm: React.FC<PriceSearchFormProps> = ({ onSearch, isLoading }) => {
  const [item, setItem] = useState('');
  const [location, setLocation] = useState('');
  
  // Image state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  
  // Price Filter state
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [priceScale, setPriceScale] = useState<number>(1000); // Determines the max value of the slider

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImage(result); // This is the full data URL for preview
        
        // Extract base64 content and mime type for API
        const matches = result.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          setImageMimeType(matches[1]);
          setImageBase64(matches[2]);
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
    // Adjust max price if it exceeds new scale
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
          Comparador de Precios Hackathon
        </h2>
        <p className="text-blue-100 mt-2 text-sm">
          Edición Avanzada: Multimodal, Tendencias y Filtros Dinámicos.
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
              <input
                id="item"
                type="text"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                placeholder="Nombre del producto o descripción..."
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white outline-none"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
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
          </div>

          {/* Image Preview */}
          {selectedImage && (
            <div className="relative inline-block mt-2 animate-in fade-in zoom-in duration-300">
              <img 
                src={selectedImage} 
                alt="Product preview" 
                className="h-24 w-24 object-cover rounded-lg border border-gray-200 shadow-sm"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 rounded-b-lg text-center truncate">
                Imagen analizable
              </div>
            </div>
          )}

          {/* Section 2: Location */}
          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-500" />
              ¿Dónde estás?
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej. Madrid, Ciudad de México, 28001..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white outline-none"
              required
            />
          </div>

          {/* Section 3: Price Filter (Collapsible/Optional) */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mb-4"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showPriceFilter ? 'Ocultar Filtro de Precio' : 'Filtrar por Rango de Precio'}
            </button>

            {showPriceFilter && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-200 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    Rango de Presupuesto
                  </label>
                  
                  {/* Scale Selector */}
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

                {/* Slider UI */}
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
                      <span>0</span>
                      <span className="font-semibold text-blue-600">Máx: {maxPrice}</span>
                      <span>{priceScale}+</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                     <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
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
                      <label className="block text-xs text-gray-500 mb-1">Máximo (Límite)</label>
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
          disabled={isLoading || (!item.trim() && !imageBase64) || !location.trim()}
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