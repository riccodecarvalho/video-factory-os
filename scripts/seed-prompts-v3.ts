/**
 * Script de Seed: Prompts v3 Anti-Repetição + Knowledge Base Libraries
 * 
 * Implementa arquitetura híbrida v2+v4:
 * - Prompts v3 (planejamento e roteiro) com sistema de variação por timestamp
 * - Knowledge Base com bibliotecas de hooks, escaladas, nomes, karma
 */

import { getDb, schema } from "../lib/db";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

// ============================================
// KNOWLEDGE BASE ENTRIES
// ============================================

const KB_ENTRIES = [
    {
        id: uuid(),
        slug: "graciela-hooks-v3",
        name: "Biblioteca de Hooks (15 Tipos)",
        tier: "tier2",
        category: "hooks",
        content: `# BIBLIOTECA DE HOOKS (15 TIPOS - SELEÇÃO POR TIMESTAMP)

## SELEÇÃO AUTOMÁTICA
Usar: (últimos 2 dígitos do timestamp) % 15 = tipo de hook

## 0. IN MEDIA RES TEMPORAL
[Timestamp preciso] + [Acción en curso] + [Stakes específicos] + [Loop opener]
- Hora exacta (las tres y cuarenta y siete)
- Número de personas (47, 120, 8)
- Promesa: "antes de contarte lo que pasó..."

## 1. PUNCH DIRECTO CRUEL
[Diálogo brutal ≤12 palabras] + [Reacción física] + [Contexto mínimo] + [Promesa karma]
- Diálogo entre comillas máximo 12 palabras
- "Manos temblando, corazón detenido"

## 2. RESUMEN ÉPICO CUANTIFICADO
[Injusticia cuantificada] + [Descubrimiento] + [Promesa de karma]
- "Durante quince años... hasta que un día..."

## 3. CARTA/MENSAJE REVELADOR
[Mensaje con timestamp] + [Contenido mensaje] + [Reacción] + [Cambio total]
- Hora de recepción precisa
- Contenido entre comillas máx 15 palabras

## 4. TESTIGO ESCONDIDO
[Protagonista en lugar inesperado] + [Overhearing conversación] + [Verdad revelada]
- Razón creíble para estar cerca
- Diálogo overheard entre comillas

## 5. DESCUBRIMIENTO ACCIDENTAL
[Acción cotidiana] + [Objeto encontrado] + [Implicaciones] + [Mundo invertido]
- Acción mundana (limpiando, buscando llaves)
- Objeto específico (carpeta, teléfono)

## 6. CONFRONTO PÚBLICO MASIVO
[Evento social cuantificado] + [Acción villana] + [Testigos] + [Promesa épica]
- Evento: boda, funeral, cena
- Número exacto: 47 invitados, 120 asistentes

## 7. IRONÍA DRAMÁTICA INICIAL
[Villano confiado] + [Lo que no sabe] + [Protagonista con ventaja] + [Promesa]
- "Lo que él no sabía es que..."

## 8. PREGUNTA IMPOSIBLE
[Pregunta al público] + [Dilema moral] + [Stakes] + ["esto me pasó"]
- "¿Qué harías si descubrieras que...?"

## 9. CONTRASTE TEMPORAL BRUTAL
[ANTES cuantificado] + [DESPUÉS cuantificado] + [Evento cambio] + [Promesa]
- Vida anterior vs vida actual

## 10. SECRETO REVELADO PARCIAL
[Verdad que todos saben menos protagonista] + [Descubrimiento parcial] + [Magnitud]
- "pero la verdad completa era peor"

## 11. ULTIMÁTUM RESPONDIDO
[Ultimátum entre comillas] + [Contexto poder] + [Decisión protagonista] + [Karma]
- Ultimátum máx 15 palabras

## 12. OBJETO SIMBÓLICO INICIAL
[Objeto descrito] + [Significado emocional] + [Usado como arma] + [Promesa justicia]
- Anillo, casa, documento

## 13. FLASH-FORWARD KARMA
[Escena karma futura] + ["pero para entender..."] + [Stakes actuales]
- Mostrar destino villano primero

## 14. SILENCIO CUANTIFICADO
[Acción villana] + [Silencio en segundos] + [Testigos] + [Quiebre silencio]
- "El silencio duró ocho segundos exactos"
`,
        recipeSlug: "graciela-youtube-long",
        isActive: true,
    },
    {
        id: uuid(),
        slug: "graciela-escaladas-v3",
        name: "Biblioteca de Escaladas (12 Tipos)",
        tier: "tier2",
        category: "escaladas",
        content: `# BIBLIOTECA DE ESCALADAS (12 TIPOS - SELEÇÃO POR TIMESTAMP)

## SELEÇÃO AUTOMÁTICA
Usar: (dígitos 11-12 do timestamp) % 12 = tipo de escalada

## 0. LINEAR CLÁSICA
A → B → C → Crisis
- Incidentes crecientes en intensidad
- Distribuição: 15% → 25% → 35% → 45%

## 1. ESPIRAL RECURRENTE
Problema → Pausa → Problema peor → Pausa → Crisis
- Conflicto "vuelve" agravado
- 3-4 micro-tensiones

## 2. DOBLE LÍNEA CONVERGENTE
Conflicto A + Conflicto B (paralelos) → Se cruzan → Explosión
- Dos problemas se revelan conectados

## 3. FALSA VITÓRIA + RECAÍDA
Problema → Resolución aparente → Revelación: es peor → Crisis real
- "Pensé que había ganado, pero..."

## 4. DESCUBRIMIENTOS PROGRESSIVOS (Boneca Russa)
Verdad 1 (25%) → Verdad 2 (50%) → Verdad 3 (75%) → Verdad Final (90%)
- Cada una revela mentira mayor

## 5. PRESIÓN TEMPORAL CRESCENTE
Deadline → Tiempo agotándose → Acciones desesperadas → Clímax en deadline
- Timestamps específicos: "En exactamente cuarenta y siete minutos..."

## 6. ESCALADA SOCIAL PÚBLICA
Privado → Semi-público (familia) → Público (comunidad) → Viral
- 2 personas → 10-20 → 50-200 → masivo

## 7. ESCALADA EMOCIONAL INTENSIVA
Desconfort → Dolor → Rabia → Quiebre → Transformación
- Jornada emocional del protagonista

## 8. TRAICIONES EN CASCATA
Traición 1 (persona A) → Traición 2 (persona B) → Conspiración revelada
- "¿Quién más lo sabía?"

## 9. EFECTO DOMINÓ
Acción pequeña → Consecuencia 1 → Consecuencia 2 → Avalancha
- Butterfly effect dramático

## 10. ESPEJO INVERTIDO
Villano hace X a protagonista → Protagonista sufre → Protagonista hace X de vuelta (mejor)
- Simetría dramática en karma

## 11. ARMADILHA PREPARADA
Protagonista sufre → Decide preparar trampa → Ejecución silenciosa → Villano cae
- Ironía dramática: audiencia ve, villano no
`,
        recipeSlug: "graciela-youtube-long",
        isActive: true,
    },
    {
        id: uuid(),
        slug: "graciela-nomes-v3",
        name: "Biblioteca de Nombres (300+ por Timestamp)",
        tier: "tier3",
        category: "nomes",
        content: `# BIBLIOTECA DE NOMBRES (SELEÇÃO POR TIMESTAMP)

## PROTAGONISTAS FEMENINAS
Usar: (últimos 3 dígitos do timestamp) % 100 = bloque

### Bloques 00-99 (10 nombres cada)
00-09: Adelaida, Adela, Adriana, Agustina, Aída, Alba, Alejandra, Alicia, Amalia, Amelia
10-19: Amparo, Ana, Andrea, Ángela, Angélica, Antonia, Araceli, Ariadna, Aurora, Aurelia
20-29: Bárbara, Beatriz, Benigna, Berenice, Bernardina, Blanca, Brígida, Brunilda, Camila, Cándida
30-39: Caridad, Carlota, Carmela, Carolina, Catalina, Cecilia, Celestina, Clara, Claudia, Clementina
40-49: Concepción, Consuelo, Cristina, Dalia, Daniela, Delfina, Diana, Dolores, Dominga, Domitila
50-59: Edelmira, Elena, Elisa, Elvira, Emilia, Emma, Enriqueta, Ernestina, Esperanza, Estela
60-69: Esther, Eugenia, Eulalia, Eva, Evangelina, Fabiola, Felipa, Fernanda, Florencia, Florinda
70-79: Francisca, Gabriela, Genoveva, Georgina, Gertrudis, Gloria, Graciela, Griselda, Guadalupe, Guillermina
80-89: Helena, Herminia, Hilda, Hortensia, Ignacia, Inés, Irene, Iris, Isabel, Isidora
90-99: Jacinta, Jimena, Josefa, Josefina, Juana, Julia, Juliana, Laura, Leonor, Leticia

### Adicionales (usar dígitos 4-6 para segunda protagonista)
Lidia, Lorena, Lourdes, Lucía, Luisa, Luz, Magdalena, Manuela, Marcela, Margarita,
María, Mariana, Marina, Marta, Matilde, Mercedes, Micaela, Milagros, Mónica, Natividad

## ANTAGONISTAS MASCULINOS
Usar: (dígitos 4-6 do timestamp) % 30

Alejandro, Alberto, Antonio, Carlos, Diego, Eduardo, Enrique, Fernando, Francisco, Gabriel,
Gerardo, Guillermo, Gustavo, Héctor, Ignacio, Javier, Joaquín, Jorge, José, Juan,
Julio, Luis, Manuel, Marcos, Martín, Miguel, Pablo, Pedro, Rafael, Roberto

## ANTAGONISTAS FEMENINAS
Usar: (dígitos 4-6 do timestamp) % 30 + 30 = 30-59

Adela, Amalia, Beatriz, Catalina, Dora, Estela, Eunice, Fabiola, Genoveva, Hilda,
Irma, Lidia, Lilia, Lucinda, Marcelina, Mirtha, Nélida, Noemí, Ofelia, Olga,
Perla, Raquel, Rebeca, Regina, Rosario, Rufina, Sabina, Soledad, Susana, Yolanda

## APODOS REGIONALES (Personajes Secundarios)
Beto (Alberto), Cande (Candelaria), Chayo (Rosario), Chela (Graciela), Chucho (Jesús),
Concha (Concepción), Güicho (Luis), Lalo (Eduardo), Lupe (Guadalupe), Memo (Guillermo)
`,
        recipeSlug: "graciela-youtube-long",
        isActive: true,
    },
    {
        id: uuid(),
        slug: "graciela-karma-v3",
        name: "Biblioteca de Clímax e Karma (10+8 Tipos)",
        tier: "tier2",
        category: "karma",
        content: `# BIBLIOTECA DE CLÍMAX E KARMA

## TIPOS DE CLÍMAX (10 - Seleção: dígitos 9-10 % 10)

0. CONFRONTO PÚBLICO MASIVO - Revelación frente a 50-200+ testigos
1. DESCUBRIMIENTO PRIVADO IRREFUTABLE - Protagonista solo descubre verdad completa
2. REVELACIÓN EN EVENTO SOCIAL - Durante discurso/brindis/momento clave
3. EJECUCIÓN DE ARMADILHA - Villano cae en su propia trampa
4. COLAPSO CON VERDAD - Protagonista dice verdad completa, explosión emocional
5. INVERSIÓN DE PODER SÚBITA - Protagonista revela carta escondida
6. FLAGRANTE CON TESTIGOS - Villano flagrado en acto, testigos revelan presencia
7. DOCUMENTO/GRABACIÓN EXPLOSIVA - Prueba concreta mostrada públicamente
8. CONFESIÓN FORZADA - Villano acorralado confiesa
9. KARMA INSTANTÁNEO PÚBLICO - Karma ocurre en momento de gloria villana

## TIPOS DE KARMA (8 - Seleção: dígitos 7-8 % 8)

0. JUSTICIA LEGAL - Demanda, orden judicial, cárcel, multa
   Satisfacción: 9/10, Irreversible

1. HUMILLACIÓN PÚBLICA - Exposición en evento, redes, comunidad
   Satisfacción: 10/10, Instantáneo

2. PÉRDIDA ECONÓMICA - Herencia perdida, casa vendida, empleo perdido
   Satisfacción: 8/10, Tangible

3. KARMA EMOCIONAL - Abandono, soledad, rechazo de familia
   Satisfacción: 7/10, Profundo y duradero

4. KARMA INDIRECTO - Consecuencias inesperadas, efecto dominó
   Satisfacción: 9/10, Ironía dramática

5. RECHAZO SOCIAL - Comunidad aísla, amigos abandonan, reputación destruída
   Satisfacción: 8/10, Justicia colectiva

6. KARMA FAMILIAR - Hijos rechazan, esposo divorcia, padres desheredan
   Satisfacción: 10/10, Lo más cercano destruye

7. KARMA COMBINADO MÚLTIPLO - 2+ categorías simultáneamente
   Satisfacción: 11/10, Avalancha coordinada

## KARMA EN 4 CAPAS (Ejecutar en Acto 6)

Capa 1 - EMOCIONAL: Confronto, verdad dicha (3-4 párrafos)
Capa 2 - SOCIAL: Humillación pública, testigos específicos (3-4 párrafos)
Capa 3 - MATERIAL: Consecuencia económica/legal cuantificada (2-3 párrafos)
Capa 4 - LEGADO: Impacto duradero, irreversibilidad (2-3 párrafos)
`,
        recipeSlug: "graciela-youtube-long",
        isActive: true,
    },
];

// ============================================
// PROMPT V3 - PLANEJAMENTO
// ============================================

const PROMPT_PLANEJAMENTO_V3 = {
    id: uuid(),
    slug: "graciela.planejamento.v3",
    name: "Graciela - Planejamento v3 (Anti-Repetição)",
    category: "planejamento",
    description: "Planejamento estruturado com sistema de variação por timestamp para evitar repetições",
    systemPrompt: `Eres la PLANIFICADORA NARRATIVA del canal "Verdades de Graciela".

Tu objetivo: Crear el PLAN ESTRUCTURADO de una historia de ficción original.
NO escribas el guión todavía. Solo planifica la estructura con output JSON.

REGLA CRÍTICA DE VARIACIÓN:
- Usarás el timestamp proporcionado para FORZAR variación en todos los componentes
- NUNCA uses los mismos nombres, hooks o estructuras por defecto
- Cada componente se selecciona matemáticamente basado en el timestamp`,
    userTemplate: `# DATOS DE ENTRADA

**Título:** {{ titulo }}
**Tema:** {{ tema }}  
**Brief:** {{ brief }}
**Duración:** {{ duracao }} minutos
**Timestamp:** {{ timestamp }}

---

# SISTEMA DE VARIACIÓN OBLIGATORIA

## Cálculos de Selección (EJECUTAR TODOS)

Con timestamp = {{ timestamp }}:

1. **Hook** = (últimos 2 dígitos) % 15 = tipo de hook (ver KB biblioteca-hooks)
2. **Escalada** = (dígitos 11-12) % 12 = tipo de escalada (ver KB biblioteca-escaladas)
3. **Clímax** = (dígitos 9-10) % 10 = tipo de clímax (ver KB biblioteca-karma)
4. **Karma** = (dígitos 7-8) % 8 = tipo de karma (ver KB biblioteca-karma)
5. **Protagonista** = (últimos 3 dígitos) % 100 = bloque de nombre (ver KB biblioteca-nomes)
6. **Antagonista** = (dígitos 4-6) % 60 = nombre antagonista (ver KB biblioteca-nomes)

---

# DNA DEL CANAL

- Narradora: GRACIELA (mujer madura, 55-65 años, empática, sabia)
- Público: 70-80% mujeres, 40-65+ años
- Fórmula emocional: INDIGNACIÓN → CURIOSIDAD → CATARSIS

---

# ESTRUCTURA DE 7 ACTOS (OBLIGATORIA)

| Acto | % | Contenido |
|------|---|-----------|
| 1 | 8-10% | Hook + Presentación Graciela |
| 2 | 15-18% | Backstory + Señales ignoradas |
| 3 | 12-15% | Humillación épica pública |
| 4 | 12-15% | Descubrimiento + Decisión |
| 5 | 18-22% | Ejecución del plan |
| 6 | 15-18% | Clímax + Karma 4 capas |
| 7 | 8-12% | Epílogo + Legado |

---

# TÉCNICAS NARRATIVAS OBLIGATORIAS

1. **15+ números específicos** (por extenso)
2. **4 revelaciones en capas** (25%, 50%, 75%, 90%)
3. **6-10 micro-tensiones** distribuidas
4. **3-5 objetos simbólicos** con arco completo
5. **Karma en 4 capas** (emocional, social, material, legado)
6. **2-3 frases quotables** para Shorts

---

# OUTPUT: JSON ESTRUCTURADO

\`\`\`json
{
  "metadata": {
    "titulo": "string",
    "duracion_minutos": number,
    "palabras_totales": number,
    "timestamp_usado": "string"
  },
  "seleccion_automatica": {
    "hook_tipo": "número y nombre (ej: 7-IRONÍA DRAMÁTICA)",
    "escalada_tipo": "número y nombre",
    "climax_tipo": "número y nombre",
    "karma_tipo": "número y nombre",
    "calculo_protagonista": "resultado del cálculo",
    "calculo_antagonista": "resultado del cálculo"
  },
  "protagonista": {
    "nombre": "SELECCIONADO POR TIMESTAMP",
    "edad": "55-68",
    "perfil": "string breve",
    "superpoder": "resiliencia/inteligencia/recursos ocultos",
    "arco_transformacion": "de X a Y"
  },
  "antagonista": {
    "nombre": "SELECCIONADO POR TIMESTAMP",
    "relacion": "suegra|hijo|nuera|yerno|esposo|jefe|CEO",
    "filosofia_cruel": "1-2 frases que definen maldad",
    "destino_final": "karma completo"
  },
  "hook_detallado": {
    "framework": "nombre del tipo seleccionado",
    "texto_hook": "~150 palabras, 40 segundos",
    "elementos_obligatorios": {
      "timestamp": "hora específica",
      "numero_testigos": "número específico",
      "stakes_cuantificados": "string",
      "promesa_karma": "string"
    }
  },
  "estructura_7_actos": [
    {
      "acto": 1,
      "titulo": "Hook + Presentación",
      "porcentaje": "8-10%",
      "palabras": "number",
      "contenido_clave": ["punto 1", "punto 2"],
      "mini_climax": "string",
      "revelacion": null
    }
  ],
  "objetos_simbolicos": [
    {
      "objeto": "específico",
      "significado": "historia del objeto",
      "primera_aparicion": "Acto X",
      "uso_como_arma": "cómo villano usa",
      "retorno_karma": "Acto 6 - cómo retorna"
    }
  ],
  "tecnicas_narrativas": {
    "numeros_especificos": ["lista de 15+ números"],
    "revelaciones_4_capas": {
      "capa_1_25%": "problema superficial",
      "capa_2_50%": "patrón revelado",
      "capa_3_75%": "magnitud real",
      "capa_4_90%": "raíz de todo"
    },
    "micro_tensiones": [
      {"posicion": "Acto X, minuto ~XX", "frase": "máx 7 palabras"}
    ],
    "frases_quotables": ["frase 1", "frase 2", "frase 3"]
  },
  "karma_detallado": {
    "capa_1_emocional": "específico",
    "capa_2_social": "específico",
    "capa_3_material": "específico",
    "capa_4_legado": "específico"
  },
  "epilogo": {
    "time_skip": "seis meses/un año/dos años",
    "protagonista_actual": "nuevo rol, paz interior",
    "villano_actual": "karma duradero",
    "leccion_moral": "frase resonante"
  }
}
\`\`\`

---

**GENERA EL PLAN ESTRUCTURADO AHORA.**
**USA EL TIMESTAMP PARA SELECCIONAR TODOS LOS COMPONENTES.**
**SOLO JSON VÁLIDO. SIN MARKDOWN FUERA DEL JSON. SIN EXPLICACIONES.**`,
    model: "claude-sonnet-4-20250514",
    maxTokens: 8192,
    temperature: 0.8,
    kbTiers: JSON.stringify(["tier2"]),
    version: 1,
    isActive: true,
};

// ============================================
// PROMPT V3 - ROTEIRO
// ============================================

const PROMPT_ROTEIRO_V3 = {
    id: uuid(),
    slug: "graciela.roteiro.v3",
    name: "Graciela - Roteiro v3 (Anti-Repetição)",
    category: "roteiro",
    description: "Roteiro narrativo baseado no plan estruturado, formatado para TTS",
    systemPrompt: `Eres GRACIELA, la narradora del canal "Verdades de Graciela" en YouTube.
Tu audiencia son mujeres de 40-65+ años en Latinoamérica.

Tu tarea: Escribir el GUIÓN COMPLETO basándote en el PLAN ESTRUCTURADO que recibiste.
Genera TEXTO NARRATIVO PURO, listo para TTS (Text-to-Speech).

REGLAS ABSOLUTAS:
- NO uses markdown (**, ##, -)
- NO uses diálogo teatral (NOMBRE: "fala")
- NO uses números en cifras (15 → quince)
- NO uses abreviaciones (Dr. → Doctor)
- SI usa diálogo reportado ("Mi suegra dijo que...")`,
    userTemplate: `# PLAN ESTRUCTURADO (del paso anterior)

{{ planejamento }}

---

# ARQUITECTURA DEL GUIÓN

## [0:00-0:40] HOOK PURO
- 100% acción, CERO presentación Graciela
- Ejecutar el hook del plan tal como está diseñado
- Usar todos los elementos obligatorios del plan

## [0:40-1:00] PRESENTACIÓN GRACIELA
"Hola, soy Graciela. Y esta es la historia de [NOMBRE], una mujer de [EDAD] años que [GANCHO]. Pero antes de contarte [PROMESA], verifica si ya estás suscrito al canal."

## [1:00+] HISTORIA EN PRIMERA PERSONA
"Mi nombre es [PROTAGONISTA]. Tengo [EDAD] años..."
→ Narrar como si fueras la protagonista
→ Seguir estructura de 7 actos del plan

## [FINAL] CIERRE GRACIELA
→ Time skip del plan (epílogo)
→ Estado actual protagonista y villano
→ Lección moral
→ CTA: "Si te tocó el corazón, compártela"

---

# REGLAS DE ESCRITURA

## Diálogo REPORTADO (Obligatorio)
✅ "Mi suegra me miró con desprecio y dijo que yo jamás sería suficiente."
❌ SUEGRA: "Jamás serás suficiente."

## Números por EXTENSO
✅ "quince años", "doscientos invitados", "las once y cuarenta y siete"
❌ "15 años", "200 invitados", "11:47"

## Ritmo: BUILD-UP + PUNCH
BUILD-UP (25-35 palabras): Descripción, contexto, tensión cresciente...
PUNCH (5-10 palabras): Pero esa noche, todo cambió.

## CTAs Integrados
- CTA 1 (~1 min): En presentación Graciela
- CTA 2 (~25%): "Déjame un like y cuéntame desde qué ciudad me escuchas"
- CTA 3 (~75%): "No te vayas ahora. Lo mejor está por venir."
- CTA 4 (final): "Compártela con alguien que necesite escucharla"

---

# TÉCNICAS DEL PLAN (EJECUTAR TODAS)

1. **Revelaciones en 4 capas** - usar las del plan
2. **Micro-tensiones** - posicionar las del plan
3. **Objetos simbólicos** - desarrollar arcos completos
4. **Karma 4 capas** - ejecutar en Acto 6
5. **Frases quotables** - insertar con pausas

---

# OUTPUT

Texto narrativo corrido.
Sin markdown, sin headers, sin etiquetas.
Comenzar directamente con el hook.
Terminar con "Hasta la próxima historia."

---

**ESCRIBE EL GUIÓN COMPLETO AHORA.**
**SOLO TEXTO NARRATIVO PURO.**
**MÍNIMO {{ duracao * 130 }} PALABRAS.**`,
    model: "claude-sonnet-4-20250514",
    maxTokens: 16384,
    temperature: 0.7,
    kbTiers: null,
    version: 1,
    isActive: true,
};

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function seedPromptsV3() {
    console.log("🚀 Iniciando seed de Prompts v3 + Knowledge Base...\n");

    const db = getDb();
    const now = new Date().toISOString();

    // 1. Insert Knowledge Base entries
    console.log("📚 Inserindo Knowledge Base entries...");
    for (const kb of KB_ENTRIES) {
        try {
            // Check if exists
            const [existing] = await db.select().from(schema.knowledgeBase).where(eq(schema.knowledgeBase.slug, kb.slug));

            if (existing) {
                console.log(`   ⚠️ KB ${kb.slug} já existe, atualizando...`);
                await db.update(schema.knowledgeBase).set({
                    content: kb.content,
                    updatedAt: now,
                }).where(eq(schema.knowledgeBase.slug, kb.slug));
            } else {
                await db.insert(schema.knowledgeBase).values({
                    ...kb,
                    createdAt: now,
                    updatedAt: now,
                });
                console.log(`   ✅ KB ${kb.slug} inserido`);
            }
        } catch (error) {
            console.log(`   ❌ Erro em ${kb.slug}: ${error}`);
        }
    }

    // 2. Insert Prompt Planejamento v3
    console.log("\n📝 Inserindo Prompt Planejamento v3...");
    try {
        const [existing] = await db.select().from(schema.prompts).where(eq(schema.prompts.slug, PROMPT_PLANEJAMENTO_V3.slug));

        if (existing) {
            console.log("   ⚠️ Prompt já existe, atualizando...");
            await db.update(schema.prompts).set({
                ...PROMPT_PLANEJAMENTO_V3,
                id: existing.id,
                updatedAt: now,
            }).where(eq(schema.prompts.slug, PROMPT_PLANEJAMENTO_V3.slug));
        } else {
            await db.insert(schema.prompts).values({
                ...PROMPT_PLANEJAMENTO_V3,
                createdAt: now,
                updatedAt: now,
            });
        }
        console.log("   ✅ Prompt planejamento.v3 inserido");
    } catch (error) {
        console.log(`   ❌ Erro: ${error}`);
    }

    // 3. Insert Prompt Roteiro v3
    console.log("\n📝 Inserindo Prompt Roteiro v3...");
    try {
        const [existing] = await db.select().from(schema.prompts).where(eq(schema.prompts.slug, PROMPT_ROTEIRO_V3.slug));

        if (existing) {
            console.log("   ⚠️ Prompt já existe, atualizando...");
            await db.update(schema.prompts).set({
                ...PROMPT_ROTEIRO_V3,
                id: existing.id,
                updatedAt: now,
            }).where(eq(schema.prompts.slug, PROMPT_ROTEIRO_V3.slug));
        } else {
            await db.insert(schema.prompts).values({
                ...PROMPT_ROTEIRO_V3,
                createdAt: now,
                updatedAt: now,
            });
        }
        console.log("   ✅ Prompt roteiro.v3 inserido");
    } catch (error) {
        console.log(`   ❌ Erro: ${error}`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Seed concluído!");
    console.log("=".repeat(50));

    process.exit(0);
}

seedPromptsV3().catch(console.error);
