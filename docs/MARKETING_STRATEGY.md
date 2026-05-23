# MARKETING_STRATEGY.md — Conversión y copys

## 1. Principios

- **El producto vende la curiosidad, no el producto.** El copy no dice "suscríbete para acceder a más funciones": insinúa que hay algo importante que el lector se está perdiendo *sobre sí mismo*.
- **Open loops:** dejar preguntas abiertas que la versión premium resuelve.
- **Específico > genérico:** "lo que tu Luna en Libra está pidiendo que escuches" gana a "información premium".
- **Coste sentimental, no monetario:** el copy menciona poco el precio. Cuando lo hace, lo hace en marco "menos que un café al día".
- **Escasez sutil, no falsa:** evitar countdowns falsos. Sí usar "tu lectura más completa del año" en reportes anuales.
- **Pruebas sociales reales o sin números inventados.** Mejor "miles de usuarios consultan su carta natal cada mes" que cifras concretas falsas.

## 2. Funnel freemium → premium

```
Landing → curiosidad por su signo → registro → horóscopo diario gratis
   → ver upsell card al final → click → página /premium
   → ver beneficios y CTA → Stripe Checkout → premium
```

Puntos de fricción a minimizar:
- **Registro:** 4 campos máximo. Una pantalla. Email + contraseña + nombre + fecha. T&C como checkboxes.
- **Pago:** Stripe Checkout hosted (sin formulario propio).
- **Acceso post-pago:** webhook actualiza `subscriptions`, frontend revalida la query y desbloquea inmediatamente.

## 3. Tipos de "upsell card" según contexto

Después del resultado de cada funcionalidad **gratuita** hay una card de upsell. El copy se adapta a la funcionalidad que el usuario acaba de consumir.

### Después del horóscopo diario
```
✨ Lo que las estrellas no te están contando aún

Tu lectura diaria es solo la superficie. Tu carta natal completa
revela por qué tus relaciones, tu vocación y tus bloqueos siguen
ese mismo patrón — y qué se mueve este año.

[ Ver mi carta natal completa → ]   ·   desde 4,99€/mes
```

### Después del horóscopo semanal
```
✨ Tu semana, ampliada al detalle que importa

Hay un movimiento astrológico esta semana que te toca de cerca
y que tu lectura gratuita solo insinúa. Descúbrelo en el reporte
mensual personalizado por tu carta natal.

[ Desbloquear mi reporte mensual → ]
```

### Después del horóscopo mensual
```
✨ Tu año, antes de que te sorprenda

En 30 días pasan cosas. En 365 cambia tu vida. El reporte anual
premium analiza cada tránsito sobre tu carta natal y te dice cuándo
mover ficha — y cuándo esperar.

[ Quiero mi reporte anual → ]
```

### Después de carta natal básica
```
✨ Acabas de ver la portada

Sol, Luna y Ascendente son el principio. Tu carta completa
incluye 10 planetas, 12 casas y los aspectos entre ellos.
Es el mapa que explica por qué eres tú.

[ Ver mi carta natal completa → ]
```

### Después de tarot simple
```
✨ Una carta dice algo. Diez lo cuentan todo.

La cruz celta es la tirada que los profesionales usan para
leer una situación a fondo: pasado, presente, obstáculo,
deseo, salida.

[ Tirada profesional 10 cartas → ]
```

### Después de energía del día / eventos
```
✨ Esta energía te afecta MÁS por tu carta

La luna llena de hoy cae sobre tu Casa X — y eso significa
algo distinto para cada persona. Suscríbete y recibe alertas
personalizadas por tránsito.

[ Personalizar mis alertas → ]
```

> El campo `premium_hook` generado por Gemini en cada respuesta puede sustituir o reforzar el body de la card cuando aplique, para que la intriga esté alineada con lo que el lector acaba de leer.

## 4. CTAs (textos de botón)

Buenos (probados en copy de SaaS y de astrología):
- "Ver mi carta completa"
- "Descubrir lo que falta"
- "Quiero saber más"
- "Activar premium"
- "Empezar mi lectura profunda"

Malos (evitar):
- "Suscribirse" (frío)
- "Comprar" (transaccional)
- "Más información" (vago)
- "Continuar" (no comunica valor)

## 5. Página `/premium` (pricing)

Estructura:
1. **Hero:** Una frase grande emocional. *"Llevas años leyendo el horóscopo. Es hora de que el horóscopo te lea a ti."*
2. **Subtítulo:** Una promesa concreta. "Carta natal completa, compatibilidad, tarot avanzado, reportes mensuales y anuales personalizados."
3. **Plan mensual vs anual** (anual marcado como "Ahorra X%, mejor opción"). Card del anual ligeramente más grande, con badge "Recomendado".
4. **Tabla comparativa Free vs Premium** (no más de 8 filas). Free a la izquierda con cosas como ✅, premium a la derecha con ✨ y filas que solo aparecen en premium con un toque dorado.
5. **Sección "Lo que vas a descubrir"** con 3-4 testimonios anonimizados (en TFM podemos usar ejemplos genéricos o quitar).
6. **FAQ:** ¿Cómo cancelo? ¿Hay devolución? ¿Cómo se cobra? ¿Funciona si no creo en el horóscopo?
7. **CTA final repetido.**
8. **Tranquilizadores:** Pago seguro con Stripe · Cancela cuando quieras · Sin permanencia.

## 6. Onboarding del registro

Tras el registro, en lugar de tirar al usuario a la home, pasar por un **microonboarding de 2 pasos**:

1. *"Hola {nombre}. He calculado tu signo: {sign}. ¿Quieres añadir tu hora y lugar de nacimiento para personalizar más tus lecturas?"* → Opcional, claramente "puedes saltarlo".
2. *"Aquí tienes tu primer horóscopo del día como {sign}. Verás más como este cada día."* → muestra el horóscopo diario inmediatamente.

Esto enseña el valor antes de pedir nada.

## 7. Sistema de rachas (gamificación)

- Badge en NavBar con número de días.
- Cuando el usuario llega a 3, 7, 14, 30 días → microcelebración (toast + animación):
  - 3 días: *"3 días contigo. Empiezas a ver patrones."*
  - 7 días: *"Una semana completa. Tus estrellas te están leyendo de vuelta."*
  - 14 días: *"14 días. Llevas una práctica."*
  - 30 días: *"30 días. Esto ya es tuyo."*
- Si rompe la racha: mensaje suave, no culpabilizador. *"Bienvenida de vuelta. Tu racha vuelve a 1, pero las estrellas no se han ido."*

## 8. Email marketing (opcional, solo si el usuario opta-in)

- Email de bienvenida con su horóscopo del día y CTA suave a premium.
- Email semanal: "Tu semana en una frase".
- Email de eventos astrológicos importantes ("Mercurio retrógrado empieza mañana").
- Email premium-only: reporte mensual entregado por mail.

Implementable con Supabase + un proveedor (Resend, MailerSend). **Fuera del alcance principal del TFM**; se menciona en "siguientes pasos".

## 9. Banner / barra de oferta (no obligatorio)

Una barra superior fina y discreta antes de la NavBar para promos puntuales: *"Plan anual: 2 meses gratis · Termina el 31/12"*. Si se usa, mantenerlo elegante (no rojo brillante intermitente).

## 10. Frases "intriga" para titulares de la home

Banco para usar en hero, secciones y cards introductorias:

- "Tu horóscopo, como nunca te lo han contado."
- "El horóscopo escrito por inteligencia artificial entiende lo que tú ya sabías."
- "Cada día, una lectura nueva. Cada lectura, algo que te suena de algo."
- "No predecimos el futuro. Te ayudamos a leer el presente."
- "El cosmos es enorme. Tu carta natal lo hace personal."
