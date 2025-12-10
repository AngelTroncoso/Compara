import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink, Info, Bell, Check } from 'lucide-react';
import { SearchResult } from '../types';

interface ResultsDisplayProps {
  result: SearchResult | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const [alertSet, setAlertSet] = useState(false);

  if (!result) return null;

  const { text, groundingMetadata } = result;

  const handleSetAlert = () => {
    // In a real app, this would open a modal or call an API
    setAlertSet(true);
    setTimeout(() => setAlertSet(false), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Action Bar inside Card */}
        <div className="bg-blue-50/50 px-6 py-3 border-b border-blue-100 flex justify-end">
          <button
            onClick={handleSetAlert}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              alertSet 
                ? 'bg-green-100 text-green-700' 
                : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 hover:border-blue-300'
            }`}
          >
            {alertSet ? (
              <>
                <Check className="w-4 h-4" />
                Alerta Activada
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Crear Alerta de Precio
              </>
            )}
          </button>
        </div>

        <div className="p-6 md:p-8">
          <div className="prose prose-lg prose-blue max-w-none prose-table:border-collapse prose-table:w-full prose-th:bg-gray-50 prose-th:p-4 prose-td:p-4 prose-td:border-t prose-tr:hover:bg-gray-50/50">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-6 rounded-lg border border-gray-200 shadow-sm">
                    <table className="w-full text-sm text-left" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs tracking-wider" {...props} />,
                th: ({node, ...props}) => <th className="px-6 py-4 whitespace-nowrap" {...props} />,
                td: ({node, ...props}) => <td className="px-6 py-4 text-gray-600" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-800 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4 flex items-center gap-2" {...props} />,
                p: ({node, ...props}) => <p className="text-gray-600 leading-relaxed mb-4" {...props} />,
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Grounding Sources */}
      {groundingMetadata?.groundingChunks && groundingMetadata.groundingChunks.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Fuentes Verificadas (Google Search)
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groundingMetadata.groundingChunks.map((chunk, index) => {
              if (chunk.web) {
                return (
                  <a
                    key={index}
                    href={chunk.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className="mt-1 bg-blue-100 text-blue-600 p-1.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ExternalLink className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">
                        {chunk.web.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {new URL(chunk.web.uri).hostname}
                      </p>
                    </div>
                  </a>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};