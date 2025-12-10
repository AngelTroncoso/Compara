import { GoogleGenAI } from "@google/genai";
import { SearchResult, SearchParams } from "../types";

// Initialize the Gemini API client
// The API key is obtained from the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function searchProductPrices(params: SearchParams): Promise<SearchResult> {
  const { item, location, imageBase64, imageMimeType, minPrice, maxPrice } = params;

  // Construct price range string if parameters exist
  const priceRangeInfo = (minPrice !== undefined || maxPrice !== undefined)
    ? `\n* **PRESUPUESTO / RANGO OBJETIVO:** ${minPrice ? minPrice : '0'} - ${maxPrice ? maxPrice : 'Sin límite'} (Moneda local)`
    : '';

  const promptText = `
Eres un Asistente de Comparación de Precios Online y Local experto, diseñado para la competición de hackatones. Tu tarea es encontrar, analizar, y presentar el mejor valor de un artículo específico, combinando datos técnicos, análisis financiero y una presentación clara y útil para el usuario.

**Directrices de Ejecución Avanzadas:**

1.  **Entrada Multimodal (Creatividad):** Si la entrada del usuario incluye una imagen, tu primer paso es identificar el producto exacto (Marca, Modelo, Especificaciones) antes de comenzar la búsqueda de precios.
2.  **Búsqueda Exhaustiva:** Utiliza la herramienta de búsqueda para obtener precios actualizados en las principales tiendas online y cadenas físicas relevantes para la [CIUDAD/UBICACIÓN] del usuario.
3.  **Filtrado por Presupuesto:** Has recibido un RANGO OBJETIVO de precios. Prioriza estrictamente las opciones que encajen en este rango. Si todas las opciones exceden el presupuesto máximo, indícalo claramente y muestra las más cercanas.
4.  **Análisis de Tendencia (Impacto):** Incluye una estimación de tendencia, indicando si el precio actual es un **'Buen Momento para Comprar'** o **'Esperar'**. Esto se basará en una comparación del precio actual con el precio promedio histórico percibido.
5.  **Criterio de Selección Híbrido (Profundidad Técnica):** De todos los resultados, selecciona y etiqueta las tres (3) mejores opciones según los siguientes filtros estrictos:
    * **🥇 Opción "Ahorrador":** El precio final más bajo encontrado a nivel general, idealmente dentro del presupuesto.
    * **🥈 Opción "Conveniencia":** El mejor equilibrio entre precio y **proximidad a la ubicación del usuario** o el costo/tiempo de envío más rápido.
    * **🥉 Opción "Valor":** La mejor opción que incluya un valor agregado (ej. mejor garantía, alto descuento sobre precio de lista, o gran reputación de la tienda).

**Variables Clave del Usuario:**
* **ARTÍCULO_A_BUSCAR:** ${item} ${imageBase64 ? '(Ver imagen adjunta)' : ''}
* **CIUDAD/UBICACIÓN:** ${location}${priceRangeInfo}

**Estructura de la Respuesta (Formato Refinado):**

1.  **Título:** 🏷️ Comparación de Precios para **[ARTÍCULO_A_BUSCAR]**
2.  **Análisis Financiero:** Presenta el resultado del análisis de tendencia (Buen Momento/Esperar).
3.  **Tabla de Resultados:** Presenta las 3 opciones principales en esta tabla, usando el 'Tipo de Filtro' para la etiqueta de Ranking.

| Tipo de Filtro | Tienda | Precio Encontrado | Enlace Directo | Proximidad/Envío |
| :---: | :--- | :--- | :--- | :--- |
| **Ahorrador** | [Nombre Tienda] | [Precio - Moneda] | [Enlace] | [Dato de Proximidad/Envío] |
| **Conveniencia** | [Nombre Tienda] | [Precio - Moneda] | [Enlace] | [Dato de Proximidad/Envío] |
| **Valor** | [Nombre Tienda] | [Precio - Moneda] | [Enlace] | [Dato de Proximidad/Envío] |

4.  **Resumen y Justificación (Párrafo de Conclusión):** Un breve análisis de por qué estas tres opciones específicas representan la mejor oferta en sus respectivas categorías (Ahorrador, Conveniencia, Valor).
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
      text: response.text || "No se pudo generar una respuesta textual.",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata,
    };
  } catch (error) {
    console.error("Error fetching prices:", error);
    throw error;
  }
}