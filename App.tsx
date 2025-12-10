import React, { useState } from 'react';
import { PriceSearchForm } from './components/PriceSearchForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { searchProductPrices } from './services/gemini';
import { SearchParams, SearchResult } from './types';
import { Tag, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Pass the entire params object including image data
      const data = await searchProductPrices(params);
      setResult(data);
    } catch (err: any) {
      setError(
        err.message || "Ocurrió un error al buscar los precios. Por favor, intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">PriceComp <span className="text-blue-600 text-xs uppercase tracking-wider ml-1 bg-blue-50 px-2 py-1 rounded-full">Hackathon Ed.</span></h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            Powered by Google Gemini 2.5 Flash
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
        
        {/* Intro Section */}
        {!result && !isLoading && !error && (
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
              Encuentra el mejor precio.
              <span className="block text-blue-600">Local, Online y Multimodal.</span>
            </h1>
            <p className="text-lg text-gray-600">
              Sube una foto o escribe el nombre. Analizamos tendencias y encontramos ofertas Ahorrador, Conveniencia y Valor.
            </p>
          </div>
        )}

        {/* Search Form */}
        <section className="relative z-10">
          <PriceSearchForm onSearch={handleSearch} isLoading={isLoading} />
        </section>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Error de Búsqueda</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        <section>
          <ResultsDisplay result={result} />
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} PriceComp. Utilizando Gemini 2.5 Flash, Multimodal & Search Grounding.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;