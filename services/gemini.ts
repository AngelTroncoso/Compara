import { GoogleGenAI } from "@google/genai";
import { SearchResult, SearchParams } from "../types";

// Initialize the Gemini API client
// The API key is obtained from the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function identifyProductFromImage(imageBase64: string, imageMimeType: string): Promise<string> {
  const promptText = "Analiza la imagen adjunta. Identifica el producto, la marca y el modelo exactos. Genera una cadena de texto optimizada para la búsqueda que incluya solo la información relevante (producto, marca, modelo, especificación clave), ignorando el fondo, para un comparador de precios. Responde ÚNICAMENTE con la cadena de texto identificada, sin introducciones.";

  try {
    const parts: any[] = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: imageMimeType,
        }
      },
      { text: promptText }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
    });

    return response.text || "";
  } catch (error) {
    console.error("Error identifying product from image:", error);
    return "";
  }
}

export async function searchProductPrices(params: SearchParams): Promise<SearchResult> {
  const { item, location, imageBase64, imageMimeType, minPrice, maxPrice, currency } = params;

  // Construct context strings
  const budgetContext = (minPrice !== undefined || maxPrice !== undefined)
    ? `Presupuesto objetivo: ${minPrice || 0} - ${maxPrice || 'Flexible'} ${currency || 'Moneda Local'}.`
    : `Presupuesto: Analizar mejores opciones costo-beneficio sin límite estricto predefinido.`;
    
  const currencyContext = currency ? `IMPORTANTE: Convierte y presenta TODOS los precios en ${currency}.` : 'Presenta precios en la moneda local.';

  const promptText = `
Actúa como un Estratega de Business Analytics experto en Retail y E-commerce.
Estás encargado de evaluar el mercado para la siguiente solicitud de compra:

**DATOS DEL CASO:**
* **Producto:** ${item} ${imageBase64 ? '(referencia visual adjunta)' : ''}
* **Ubicación del Cliente:** ${location}
* **Restricción Financiera:** ${budgetContext}
* **Requisito de Moneda:** ${currencyContext}

**TAREA:**
1.  **Refinamiento de Consulta (Prompt Refiner):**
    *   Analiza la entrada: '${item}'.
    *   Actúa como un prompt-refiner y genera una lista de 5 consultas alternativas que incluyan sinónimos, especificaciones técnicas clave y variaciones de marca comunes para ese producto en '${location}', garantizando así una búsqueda más amplia y precisa en la red.
2.  **Investigación de Mercado:**
    *   Utiliza Google Search ejecutando las consultas refinadas para generar una "Lista de Ofertas" actualizadas (online y locales cercanas) que incluyan precio, envío y disponibilidad.
3.  **Evaluación Analítica:**
    *   Procesa esa lista en el contexto de la ubicación del usuario y su presupuesto.
4.  **Selección Estratégica:**
    *   Aplica la siguiente lógica de negocio para determinar las ofertas ganadoras:
    *   **Criterio 'Ahorrador':** La oferta que minimiza el coste total (Precio + Envío).
    *   **Criterio 'Conveniencia':** La oferta que optimiza el tiempo de entrega o distancia física a [${location}].
    *   **Criterio 'Valor':** La oferta que maximiza las especificaciones/calidad dentro del rango de precio (Best Value for Money).

**FORMATO DEL INFORME (SALIDA REQUERIDA):**

# 📊 Análisis de Mercado: ${item}

## 🔍 Estrategia de Búsqueda
[Lista breve de las variaciones de búsqueda utilizadas para asegurar cobertura total]

## 📝 Resumen Ejecutivo y Justificación
[Escribe un resumen profesional justificando cuál es la **Mejor Opción General** y por qué, basándote en los datos encontrados.]

## 🏆 Matriz de Decisión

| Estrategia | Tienda / Vendedor | Precio Final (${currency || 'Est.'}) | Logística / Envío | Enlace / Fuente |
| :--- | :--- | :--- | :--- | :--- |
| **💰 Ahorrador** | [Nombre] | [Precio] | [Detalles Envío] | [Link] |
| **🚀 Conveniencia**| [Nombre] | [Precio] | [Tiempo/Distancia] | [Link] |
| **⭐ Valor** | [Nombre] | [Precio] | [Factor Diferencial] | [Link] |

## 📉 Análisis de Tendencia de Precios
[Breve análisis sobre si el precio actual es competitivo históricamente o si se recomienda esperar.]
`;

  try {
    const parts: any[] = [];
    
    // Add image if available
    if (imageBase64 && imageMimeType) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: imageMimeType,
        }
      });
    }

    // Add text prompt
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType and responseSchema are NOT allowed when using googleSearch
      },
    });

    return {
      text: response.text || "No se pudo generar el análisis de mercado.",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata,
    };
  } catch (error) {
    console.error("Error fetching prices:", error);
    throw error;
  }
}
