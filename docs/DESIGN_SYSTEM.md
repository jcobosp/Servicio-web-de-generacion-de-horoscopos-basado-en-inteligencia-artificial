# DESIGN_SYSTEM.md — Sistema de diseño visual

## 1. Filosofía visual

- **Base neutra + acentos místicos.** Fondo blanco/casi blanco para que el contenido respire y la web no parezca un sitio "esotérico años 90". Las cards y elementos clave aportan color, brillo y profundidad.
- **Moderno, premium, juvenil.** Pensado para captar millennials/Z, no para parecer una sección de horóscopo de periódico antiguo.
- **Mística sutil, no abrumadora.** Estrellas, gradientes y degradados son acentos, nunca dominan. La tipografía y el espacio en blanco hacen el trabajo principal.
- **Color es información:** cada signo tiene su paleta, cada plan tiene su tratamiento. El color guía la lectura.

## 2. Paleta base

```ts
// apps/web/src/styles/colors.ts
export const palette = {
  // Neutros
  white: '#FFFFFF',
  cloud: '#F9FAFB',     // fondo de cards alternativo
  mist:  '#F3F4F6',     // separadores suaves
  ink:   '#0F172A',     // texto principal
  graphite: '#334155',  // texto secundario
  silver:   '#94A3B8',  // texto terciario, placeholders

  // Marca (cosmos)
  cosmos:    '#4338CA', // violeta oscuro, hero, brand
  cosmosAlt: '#6366F1', // violeta medio, links
  aurora:    '#A78BFA', // violeta claro, decoración
  gold:      '#F59E0B', // CTA premium, acentos
  starlight: '#FCD34D', // hover sobre gold

  // Estado
  success: '#10B981',
  warning: '#F59E0B',
  danger:  '#EF4444',
};
```

### Premium tiene su propio tratamiento
- CTA premium: gradiente `from-amber-400 via-amber-500 to-yellow-600`, sombra dorada.
- Badge "PREMIUM": chip con icono ✨ y fondo `bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-900`.
- No abusar del dorado en pantallas free para que el contraste haga efecto.

## 3. Colores por signo del zodiaco

Cada signo tiene 4 colores: `primary`, `secondary`, `gradientFrom`, `gradientTo`. Se usan en sus cards, fondos de página de signo, badges, etc. Justificación: tradicionalmente cada signo se asocia a un elemento (Fuego, Tierra, Aire, Agua) y a colores específicos en astrología occidental.

```ts
// apps/web/src/lib/zodiac.ts
export const signColors = {
  aries:       { primary: '#DC2626', secondary: '#FEE2E2', from: '#EF4444', to: '#F97316' }, // Fuego
  tauro:       { primary: '#16A34A', secondary: '#DCFCE7', from: '#22C55E', to: '#84CC16' }, // Tierra
  geminis:     { primary: '#EAB308', secondary: '#FEF9C3', from: '#FACC15', to: '#FCD34D' }, // Aire
  cancer:      { primary: '#0EA5E9', secondary: '#E0F2FE', from: '#38BDF8', to: '#A5F3FC' }, // Agua
  leo:         { primary: '#F59E0B', secondary: '#FEF3C7', from: '#FBBF24', to: '#F97316' }, // Fuego
  virgo:       { primary: '#65A30D', secondary: '#ECFCCB', from: '#84CC16', to: '#A3E635' }, // Tierra
  libra:       { primary: '#EC4899', secondary: '#FCE7F3', from: '#F472B6', to: '#F9A8D4' }, // Aire
  escorpio:    { primary: '#7C2D12', secondary: '#FED7AA', from: '#9A3412', to: '#C2410C' }, // Agua (rojo profundo)
  sagitario:   { primary: '#9333EA', secondary: '#F3E8FF', from: '#A855F7', to: '#C084FC' }, // Fuego (púrpura)
  capricornio: { primary: '#1F2937', secondary: '#E5E7EB', from: '#374151', to: '#6B7280' }, // Tierra (gris/marrón)
  acuario:     { primary: '#06B6D4', secondary: '#CFFAFE', from: '#22D3EE', to: '#67E8F9' }, // Aire
  piscis:      { primary: '#3B82F6', secondary: '#DBEAFE', from: '#60A5FA', to: '#A5B4FC' }, // Agua
} as const;
```

Tipografía y forma del icono también se diferencian — cada signo tiene su glifo (♈♉♊♋♌♍♎♏♐♑♒♓).

## 4. Tipografía

- **Display / titulares:** "Fraunces" (Google Fonts) — serif con personalidad, transmite misticismo.
- **Cuerpo:** "Inter" — sans serif limpio para texto largo.
- **Mono (poco uso):** "JetBrains Mono" — solo para fechas/horas técnicas.

```js
// tailwind.config.ts → theme.extend.fontFamily
fontFamily: {
  display: ['"Fraunces"', 'serif'],
  sans:    ['"Inter"', 'system-ui', 'sans-serif'],
  mono:    ['"JetBrains Mono"', 'monospace'],
}
```

Escala (mobile-first):
| Token | Tamaño | Uso |
|---|---|---|
| `text-xs` 12px | etiquetas, metadatos |
| `text-sm` 14px | texto secundario |
| `text-base` 16px | cuerpo |
| `text-lg` 18px | cuerpo grande |
| `text-xl` 20px | subsecciones |
| `text-2xl` 24px | títulos de card |
| `text-3xl` 30px | títulos de página móvil |
| `text-4xl md:text-5xl` 36/48px | hero móvil/escritorio |
| `text-5xl md:text-7xl` 48/72px | hero principal |

## 5. Espaciado y radios

- Tailwind `spacing` por defecto + estos extras: 18 (4.5rem), 22, 26.
- **Radios:** `rounded-2xl` (cards), `rounded-xl` (botones), `rounded-full` (chips, avatars).
- **Sombras:** `shadow-sm` ambiente, `shadow-md` card hover, `shadow-xl` modal. Para acentos místicos:
  ```css
  .shadow-glow-cosmos { box-shadow: 0 8px 32px -8px rgba(99,102,241,.45); }
  .shadow-glow-gold   { box-shadow: 0 8px 32px -8px rgba(245,158,11,.45); }
  ```

## 6. Componentes base

### `<Card />`
```tsx
<Card padding="lg" tone="default | sign | premium" hoverable>
```
- `default`: fondo blanco, borde 1px `border-slate-200`, sombra `shadow-sm`. Hover sube a `shadow-md` + traslada `-translate-y-0.5`.
- `sign`: fondo `bg-white` + borde con gradiente del signo + glow del color secundario.
- `premium`: borde dorado, esquina con badge ✨ PREMIUM, fondo blanco con sutil shimmer.

### `<Button />`
Variantes: `primary` (cosmos), `secondary` (outline), `ghost`, `premium` (gradiente dorado), `danger`. Tamaños `sm | md | lg`.

### `<SignCard />`
Card cuadrada con glifo grande, nombre, fechas del signo, gradiente de fondo `from-{signFrom} to-{signTo}` (opacidad 80%, texto blanco). Es el bloque que aparece en la home en grid de 12.

### `<HoroscopeResultCard />`
Card de resultado con:
- Encabezado: glifo del signo + nombre + fecha del scope.
- "Mood del día": chip con emoji.
- Cuerpo: texto generado.
- Datos rápidos: número de la suerte, color de la suerte, palabra clave.
- Footer: upsell card (solo si free).

### `<UpsellCard />`
Card al final de resultados free. Fondo `bg-gradient-to-br from-amber-50 to-orange-50`, borde dorado discreto, copy intrigante, CTA "Descubrir lo que no se cuenta →". Copys en `docs/MARKETING_STRATEGY.md`.

### `<NavBar />`
- Sticky (`sticky top-0 z-50`).
- Fondo `bg-white/80 backdrop-blur-md` con borde inferior.
- Comportamiento: al scrollear hacia abajo > 100px, se hace más compacta (logo más pequeño, padding reducido). Al scrollear hacia arriba, vuelve.
- Items: Logo · Horóscopo (dropdown: diario/semanal/mensual) · Tarot · Carta Natal · Premium · [Usuario]
- Usuario sin sesión: botones "Iniciar sesión" + "Registro" (primary).
- Usuario con sesión: avatar + dropdown con perfil, suscripción, cerrar sesión. Badge dorado ✨ si premium.

### `<Footer />`
3 columnas en escritorio, 1 en móvil:
- Marca + descripción corta + redes sociales (placeholder).
- Producto: enlaces a funcionalidades principales.
- Legal: aviso legal, privacidad, cookies, T&C, contacto.
- Línea inferior: © 2026 Zodiaq · TFM Jesús Cobos Pozo.

## 7. Layout de página tipo

```
┌─────────────────────────────────────────┐
│ NavBar (sticky)                         │
├─────────────────────────────────────────┤
│                                         │
│   Hero / titular grande                 │
│                                         │
│   ┌──────┐  ┌──────┐  ┌──────┐         │
│   │ Card │  │ Card │  │ Card │         │
│   └──────┘  └──────┘  └──────┘         │
│                                         │
│   [Upsell premium si free]              │
│                                         │
│   [Anuncio AdSense si free, opcional]   │
│                                         │
├─────────────────────────────────────────┤
│ Footer                                  │
└─────────────────────────────────────────┘
```

- Ancho máximo de contenido: `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`.
- Padding vertical entre secciones: `py-12 md:py-20`.

## 8. Microinteracciones

- Hover en card: traslada -2px + sombra crece. Transición 200ms `ease-out`.
- Botón primario: levísimo brillo al hover.
- Generación de horóscopo: skeleton animado con shimmer mientras carga.
- Streak badge: rebota cuando sube de número.
- Toasts: entran deslizando desde arriba a la derecha.

## 9. Accesibilidad

- Contraste mínimo AA en todos los textos.
- `aria-label` en iconos sin texto.
- Foco visible (`focus-visible:ring-2 ring-cosmos-500`).
- Navegación por teclado funcional en todas las páginas.
- Reducir motion: respetar `prefers-reduced-motion`.

## 10. Estados vacíos y de error

- Empty: ilustración minimal (línea + estrella) + frase amable + CTA.
- Error: misma estética, sin alarmismo. "Las estrellas están descansando..."
- Loading: skeletons que respetan el layout final (evita layout shift).
