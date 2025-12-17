/**
 * Script para enriquecer Knowledge Bases com conteúdo do prompt-planejamento-v4-FINAL
 * 
 * Objetivo: Adicionar PRINCIPIO e EJECUCIÓN a cada hook/escalada/karma
 * mantendo o formato compacto do KB atual
 */

import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

async function main() {
    const db = getDb();

    // ============================================
    // 1. HOOKS ENRIQUECIDOS (15 tipos)
    // ============================================
    const hooksEnriquecidos = `# BIBLIOTECA DE HOOKS (15 TIPOS)

## SELEÇÃO AUTOMÁTICA
Usar: (últimos 2 dígitos do timestamp) % 15 = tipo de hook

---

## 0. IN MEDIA RES TEMPORAL
**FÓRMULA:** [Timestamp preciso] + [Acción en curso] + [Stakes específicos] + [Loop opener]
**ELEMENTOS:**
- Hora exacta (las tres y cuarenta y siete)
- Número de personas (47, 120, 8)
- Años de relación/edad (quince años)
- Lugar específico (hospital, boda, cena)
- Promesa: "antes de contarte lo que pasó..."
**PRINCIPIO:** Comenzar en momento de máxima tensión, NO en contexto.
**EJECUCIÓN:** 1ª frase: timestamp+lugar → 2ª: acción dramática → 3ª: stakes → 4ª: loop opener

---

## 1. PUNCH DIRECTO CRUEL
**FÓRMULA:** [Diálogo brutal ≤12 palabras] + [Reacción física] + [Contexto mínimo] + [Promesa karma]
**ELEMENTOS:**
- Diálogo máximo 12 palabras entre comillas
- Sentimiento físico (manos temblando, corazón detenido)
- Número de testigos
- Relación temporal (después de X años)
**PRINCIPIO:** El diálogo por sí solo comunica crueldad. Golpe emocional inmediato.
**EJECUCIÓN:** 1ª frase: diálogo cruel → 2ª: impacto físico → 3ª: contexto mínimo → 4ª: promesa karma

---

## 2. RESUMEN ÉPICO CUANTIFICADO
**FÓRMULA:** [Injusticia cuantificada] + [Descubrimiento/virada] + [Promesa de karma]
**ELEMENTOS:**
- Tiempo de sufrimiento (quince años, tres décadas)
- Acción del villano específica
- Elemento revelador (documento, grabación)
- Consecuencia prometida
**PRINCIPIO:** Setup → Punch → Twist. Tres párrafos condensan toda la jornada.
**EJECUCIÓN:** Párrafo 1: injusticia (3-4 frases) → Párrafo 2: virada (2-3) → Párrafo 3: promesa (2)

---

## 3. CARTA/MENSAJE REVELADOR
**FÓRMULA:** [Mensaje con timestamp] + [Contenido mensaje] + [Reacción] + [Cambio total]
**ELEMENTOS:**
- Hora de recepción precisa
- Contenido entre comillas máx 15 palabras
- Estado emocional antes
- Número que cuantifica stakes
**PRINCIPIO:** Mensajes son portales de revelación. Timing + contenido = suspense.

---

## 4. TESTIGO ESCONDIDO
**FÓRMULA:** [Protagonista en lugar inesperado] + [Overhearing conversación] + [Verdad revelada]
**ELEMENTOS:**
- Razón creíble para estar escondido
- Diálogo overheard entre comillas
- Número de personas en conversación
**PRINCIPIO:** Audiencia y protagonista descubren juntos. Genera complicidad.

---

## 5. DESCUBRIMIENTO ACCIDENTAL
**FÓRMULA:** [Acción cotidiana] + [Objeto encontrado] + [Implicaciones] + [Mundo invertido]
**ELEMENTOS:**
- Acción mundana (limpiando, buscando llaves)
- Objeto específico (carpeta, teléfono)
- Cuantificación de engaño (tiempo, dinero)
**PRINCIPIO:** Lo ordinario revela lo extraordinario. Contraste amplifica impacto.

---

## 6. CONFRONTO PÚBLICO MASIVO
**FÓRMULA:** [Evento social cuantificado] + [Acción villana] + [Testigos] + [Promesa épica]
**ELEMENTOS:**
- Tipo de evento (boda, funeral, cena)
- Número exacto (47 invitados, 120 asistentes)
- Acción humillante específica
- Silencio/reacción colectiva
**PRINCIPIO:** Humillación pública = máximo impacto. Testigos amplifican vergüenza.

---

## 7. IRONÍA DRAMÁTICA INICIAL
**FÓRMULA:** [Villano confiado] + [Lo que no sabe] + [Protagonista con ventaja] + [Promesa]
**ELEMENTOS:**
- Creencia del villano (piensa que ganó)
- Información que protagonista posee
- Elemento de sorpresa guardado
**PRINCIPIO:** Audiencia sabe más que personajes. Genera anticipación y satisfacción.

---

## 8. PREGUNTA IMPOSIBLE
**FÓRMULA:** [Pregunta al público] + [Dilema moral] + [Stakes] + ["esto me pasó"]
**ELEMENTOS:**
- Pregunta en segunda persona
- Dos opciones igualmente terribles
- Validación: esto es real
**PRINCIPIO:** Envolver audiencia en dilema moral. Genera empatía previa.

---

## 9. CONTRASTE TEMPORAL BRUTAL
**FÓRMULA:** [ANTES cuantificado] + [DESPUÉS cuantificado] + [Evento cambio] + [Promesa]
**ELEMENTOS:**
- Vida anterior (años, estabilidad)
- Vida actual (contraste brutal)
- Timestamp del cambio
**PRINCIPIO:** Contraste amplifica tragedia. Audiencia siente la pérdida.

---

## 10. SECRETO REVELADO PARCIAL
**FÓRMULA:** [Verdad que todos saben menos protagonista] + [Descubrimiento parcial] + [Magnitud]
**ELEMENTOS:**
- Cuánto tiempo fue engañado
- Quién sabía (número)
- Loop: "pero la verdad completa era peor"
**PRINCIPIO:** Revelación en capas. Primera engancha, promesa de más mantiene.

---

## 11. ULTIMÁTUM RESPONDIDO
**FÓRMULA:** [Ultimátum entre comillas] + [Contexto poder] + [Decisión protagonista] + [Karma]
**ELEMENTOS:**
- Ultimátum máx 15 palabras
- Por qué villano pensaba tener poder
- Respuesta inesperada del protagonista
**PRINCIPIO:** Ultimátums revelan carácter. Respuesta inesperada = catarsis.

---

## 12. OBJETO SIMBÓLICO INICIAL
**FÓRMULA:** [Objeto descrito] + [Significado emocional] + [Usado como arma] + [Promesa justicia]
**ELEMENTOS:**
- Objeto específico (anillo, casa, documento)
- Historia del objeto
- Cómo será clave en karma
**PRINCIPIO:** Objetos cargan emoción. Chekhov's Gun: lo introducido retorna con peso.

---

## 13. FLASH-FORWARD KARMA
**FÓRMULA:** [Escena karma futura] + ["pero para entender..."] + [Stakes actuales]
**ELEMENTOS:**
- Escena de justicia específica
- Cuantificación de cambio (meses/años)
- Loop temporal
**PRINCIPIO:** Mostrar destino villano primero genera anticipación del "cómo".

---

## 14. SILENCIO CUANTIFICADO
**FÓRMULA:** [Acción villana] + [Silencio en segundos] + [Testigos] + [Quiebre silencio]
**ELEMENTOS:**
- Duración exacta (ocho segundos, medio minuto)
- Personas presentes (número exacto)
- Quién/qué rompe el silencio
**PRINCIPIO:** Silencio = tensión máxima. Cuantificarlo amplifica peso dramático.`;

    await db.update(schema.knowledgeBase)
        .set({
            content: hooksEnriquecidos,
            updatedAt: new Date().toISOString()
        })
        .where(eq(schema.knowledgeBase.slug, 'graciela-hooks-v3'));

    console.log('✅ [1/3] hooks-v3 enriquecido com PRINCIPIO e EJECUCIÓN');

    // ============================================
    // 2. ESCALADAS ENRIQUECIDAS (12 tipos)
    // ============================================
    const escaladasEnriquecidas = `# BIBLIOTECA DE ESCALADAS (12 TIPOS)

## SELEÇÃO AUTOMÁTICA
Usar: (dígitos 11-12 do timestamp) % 12 = tipo de escalada

---

## 0. LINEAR CLÁSICA
**CURVA:** A → B → C → Crisis
**PRINCIPIO:** Incidentes crecientes en intensidad. Cada uno peor que anterior.
**DISTRIBUCIÓN:**
- Acto 2 (15%): Incidente pequeño (test de límites)
- Acto 3 (25%): Incidente mediano (patrón emerge)
- Acto 4 (35%): Incidente grande (línea cruzada)
- Acto 5 (45%): Crisis (punto de quiebre)
**MICRO-TENSIONES:** 4 totales, después de cada incidente

---

## 1. ESPIRAL RECURRENTE
**CURVA:** Problema → Pausa → Problema peor → Pausa → Crisis
**PRINCIPIO:** Conflicto "vuelve" agravado. Protagonista piensa que acabó, pero resurge.
**DISTRIBUCIÓN:**
- Actos 2-3: Conflicto + primera pausa falsa
- Acto 4: Resurge agravado
- Acto 5: Crisis final
**MICRO-TENSIONES:** 3-4 totales, en cada "resurge"

---

## 2. DOBLE LÍNEA CONVERGENTE
**CURVA:** Conflicto A paralelo + Conflicto B → Se cruzan → Explosión
**PRINCIPIO:** Dos problemas que parecen separados se revelan conectados.
**DISTRIBUCIÓN:**
- Acto 2: Introduce conflicto A
- Acto 3: Introduce conflicto B
- Acto 4: Pista de conexión
- Acto 5: Revelación de conspiración
**MICRO-TENSIONES:** En cada línea (2 por línea = 4 totales)

---

## 3. FALSA VITÓRIA + RECAÍDA
**CURVA:** Problema → Resolución aparente → Revelación: es peor → Crisis real
**PRINCIPIO:** Protagonista piensa que ganó. Luego descubre trampa más profunda.
**DISTRIBUCIÓN:**
- Actos 2-3: Construcción de conflicto
- Acto 4 (1ª mitad): Solución aparente
- Acto 4 (2ª mitad): Revelación de trampa
- Acto 5: Crisis verdadera
**MICRO-TENSIONES:** En momento de "falsa victoria" y "recaída"

---

## 4. DESCUBRIMIENTOS PROGRESSIVOS (Boneca Russa)
**CURVA:** Verdad 1 (25%) → Verdad 2 (50%) → Verdad 3 (75%) → Verdad Final (90%)
**PRINCIPIO:** Cada verdad revela que la anterior era solo la punta del iceberg.
**DISTRIBUCIÓN:**
- Acto 2: Primera verdad (pequeña)
- Acto 3: Segunda verdad (mediana, implica alguien cercano)
- Acto 4: Tercera verdad (grande, conspiración)
- Acto 5: Verdad final (devastadora)
**MICRO-TENSIONES:** En cada revelación (4 totales)

---

## 5. PRESIÓN TEMPORAL CRESCENTE
**CURVA:** Deadline establecido → Tiempo agotándose → Acciones desesperadas → Clímax en deadline
**PRINCIPIO:** Reloj visible aumenta tensión. Cada decisión tiene peso de tiempo.
**DISTRIBUCIÓN:**
- Acto 2: Deadline establecido (evento, fecha límite)
- Acto 3: Primera mitad del tiempo consumida
- Acto 4: Últimos momentos, acciones desesperadas
- Acto 5: Clímax ocurre exacto en deadline
**MICRO-TENSIONES:** A cada reducción de tiempo (5-6 totales)

---

## 6. ESCALADA SOCIAL PÚBLICA
**CURVA:** Privado → Semi-público (familia) → Público (comunidad) → Viral
**PRINCIPIO:** Cada nivel aumenta testigos y vergüenza. Stakes sociales crecientes.
**DISTRIBUCIÓN:**
- Acto 2: Conflicto entre 2 personas
- Acto 3: Familia enterada (10-20 personas)
- Acto 4: Comunidad enterada (50-200)
- Acto 5: Público masivo (evento, viral)
**MICRO-TENSIONES:** En cada salto de nivel

---

## 7. ESCALADA EMOCIONAL INTENSIVA
**CURVA:** Desconfort → Dolor → Rabia → Quiebre → Transformación
**PRINCIPIO:** Jornada emocional del protagonista. Cada fase más intensa.
**DISTRIBUCIÓN:**
- Acto 2: Desconfort (algo está mal)
- Acto 3: Dolor (confirmación)
- Acto 4: Rabia (decisión de actuar)
- Acto 5: Quiebre + Transformación
**MICRO-TENSIONES:** En cada transición emocional

---

## 8. TRAICIONES EN CASCATA
**CURVA:** Traición 1 (persona A) → Traición 2 (persona B) → Conspiración revelada
**PRINCIPIO:** "¿Quién más lo sabía?" Cada traición revela cómplice.
**DISTRIBUCIÓN:**
- Acto 2: Primera traición (la más obvia)
- Acto 3: Segunda traición (alguien de confianza)
- Acto 4: Conexión revelada
- Acto 5: Conspiración completa expuesta

---

## 9. EFECTO DOMINÓ
**CURVA:** Acción pequeña → Consecuencia 1 → Consecuencia 2 → Avalancha
**PRINCIPIO:** Butterfly effect dramático. Decisión menor escala incontrolablemente.
**DISTRIBUCIÓN:**
- Acto 2: Acción inicial (parece menor)
- Acto 3: Primera consecuencia inesperada
- Acto 4: Segunda consecuencia (peor)
- Acto 5: Avalancha de consecuencias

---

## 10. ESPEJO INVERTIDO
**CURVA:** Villano hace X → Protagonista sufre → Protagonista hace X mejor → Villano sufre
**PRINCIPIO:** Simetría dramática en karma. Lo que villano hizo, regresa amplificado.
**DISTRIBUCIÓN:**
- Actos 2-3: Villano ejecuta su plan cruel
- Acto 4: Protagonista planea respuesta simétrica
- Acto 5: Ejecución perfecta, karma espejo

---

## 11. ARMADILHA PREPARADA
**CURVA:** Protagonista sufre → Decide preparar trampa → Ejecución silenciosa → Villano cae
**PRINCIPIO:** Ironía dramática: audiencia ve la trampa, villano no.
**DISTRIBUCIÓN:**
- Acto 2: Sufrimiento que motiva venganza
- Acto 3: Preparación de la trampa (audiencia sabe)
- Acto 4: Villano camina hacia la trampa
- Acto 5: Trampa se cierra`;

    await db.update(schema.knowledgeBase)
        .set({
            content: escaladasEnriquecidas,
            updatedAt: new Date().toISOString()
        })
        .where(eq(schema.knowledgeBase.slug, 'graciela-escaladas-v3'));

    console.log('✅ [2/3] escaladas-v3 enriquecido com CURVA, PRINCIPIO e MICRO-TENSIONES');

    // ============================================
    // 3. KARMA ENRIQUECIDO (10 clímax + 8 karma + 4 camadas)
    // ============================================
    const karmaEnriquecido = `# BIBLIOTECA DE CLÍMAX E KARMA

## TIPOS DE CLÍMAX (10 - Seleção: dígitos 9-10 % 10)

### 0. CONFRONTO PÚBLICO MASIVO
**SETUP:** Evento social + testigos 50-200+ + reputación villano importante + prueba lista
**MOMENTO:** Protagonista toma palabra públicamente → Revelación frente a todos → Reacción colectiva
**SATISFACCIÓN:** 10/10 - Máximo impacto dramático

### 1. DESCUBRIMIENTO PRIVADO IRREFUTABLE
**SETUP:** Protagonista solo + prueba concreta + villano inconsciente del descubrimiento
**MOMENTO:** Documento/foto/grabación encontrado → Comprensión total → Decisión tomada en silencio
**SATISFACCIÓN:** 8/10 - Íntimo pero poderoso

### 2. REVELACIÓN EN EVENTO SOCIAL
**SETUP:** Evento con significado (boda, cumpleaños) + audiencia relevante + timing perfecto
**MOMENTO:** Revelación durante discurso/brindis → Uso de tecnología → Reacción en oleadas
**SATISFACCIÓN:** 10/10 - Combina público + momento simbólico

### 3. EJECUCIÓN DE ARMADILHA
**SETUP:** Trampa preparada en actos anteriores + villano confiado + testigos estratégicos
**MOMENTO:** Villano cae en trampa → Revelación de que fue planeada → Ironía dramática completa
**SATISFACCIÓN:** 9/10 - Catarsis de venganza inteligente

### 4. COLAPSO CON VERDAD
**SETUP:** Tensión acumulada + protagonista llegó al límite + audiencia (opcional)
**MOMENTO:** Protagonista dice TODA la verdad → Explosión emocional → Liberación
**SATISFACCIÓN:** 8/10 - Catarsis emocional pura

### 5. INVERSIÓN DE PODER SÚBITA
**SETUP:** Villano aparentemente ganando + protagonista con carta oculta + momento crítico
**MOMENTO:** Protagonista revela ventaja → Poder se invierte instantáneamente
**SATISFACCIÓN:** 9/10 - Twist satisfactorio

### 6. FLAGRANTE CON TESTIGOS
**SETUP:** Villano en acto + testigos en posición + protagonista orquestando
**MOMENTO:** Villano flagrado → Testigos revelan presencia → Sin escape posible
**SATISFACCIÓN:** 9/10 - Justicia innegable

### 7. DOCUMENTO/GRABACIÓN EXPLOSIVA
**SETUP:** Prueba concreta obtenida + momento público preparado + audiencia clave
**MOMENTO:** Prueba mostrada → Contenido devastador → Reacción en tiempo real
**SATISFACCIÓN:** 10/10 - Prueba irrefutable

### 8. CONFESIÓN FORZADA
**SETUP:** Villano acorralado + sin salida + testigos
**MOMENTO:** Villano forzado a confesar → Palabras que no puede retirar
**SATISFACCIÓN:** 8/10 - Villano se condena solo

### 9. KARMA INSTANTÁNEO PÚBLICO
**SETUP:** Villano en momento de aparente victoria/gloria + karma preparado
**MOMENTO:** En exacto momento de gloria, karma ocurre → Contraste máximo
**SATISFACCIÓN:** 10/10 - Timing perfecto

---

## TIPOS DE KARMA (8 - Seleção: dígitos 7-8 % 8)

### 0. JUSTICIA LEGAL
Demanda, orden judicial, cárcel, multa, pérdida de custodia
**Satisfacción:** 9/10 | **Característica:** Irreversible, oficial

### 1. HUMILLACIÓN PÚBLICA
Exposición en evento, redes, comunidad, reputación destruída
**Satisfacción:** 10/10 | **Característica:** Instantáneo, masivo

### 2. PÉRDIDA ECONÓMICA
Herencia perdida, casa vendida, negocio destruído, empleo perdido
**Satisfacción:** 8/10 | **Característica:** Tangible, duradero

### 3. KARMA EMOCIONAL
Abandono, soledad, rechazo de familia, vacío existencial
**Satisfacción:** 7/10 | **Característica:** Profundo, interno

### 4. KARMA INDIRECTO
Consecuencias inesperadas, efecto dominó, lo que causó regresa
**Satisfacción:** 9/10 | **Característica:** Ironía dramática

### 5. RECHAZO SOCIAL
Comunidad aísla, amigos abandonan, grupos expulsan
**Satisfacción:** 8/10 | **Característica:** Justicia colectiva

### 6. KARMA FAMILIAR
Hijos rechazan, esposo divorcia, padres desheredan
**Satisfacción:** 10/10 | **Característica:** Lo más cercano destruye

### 7. KARMA COMBINADO
2+ categorías simultáneamente - avalancha coordinada
**Satisfacción:** 11/10 | **Característica:** Devastador, completo

---

## KARMA EM 4 CAMADAS (Executar no Acto 6-7)

**Capa 1 - EMOCIONAL:** Confronto direto, verdad dicha (3-4 párrafos)
**Capa 2 - SOCIAL:** Humillación pública, testigos específicos (3-4 párrafos)  
**Capa 3 - MATERIAL:** Consecuencia económica/legal cuantificada (2-3 párrafos)
**Capa 4 - LEGADO:** Impacto duradero, irreversibilidad (2-3 párrafos)`;

    await db.update(schema.knowledgeBase)
        .set({
            content: karmaEnriquecido,
            updatedAt: new Date().toISOString()
        })
        .where(eq(schema.knowledgeBase.slug, 'graciela-karma-v3'));

    console.log('✅ [3/3] karma-v3 enriquecido com SETUP, MOMENTO e SATISFACCIÓN');

    console.log('\n🎉 Todos os KBs enriquecidos com sucesso!');
}

main().catch(console.error);
