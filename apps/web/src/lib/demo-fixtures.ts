/**
 * Resultados de ejemplo (fixtures) del MODO DEMOSTRACIÓN.
 *
 * Cuando `VITE_DEMO_MODE` está activo, la app no llama nunca a la IA (Gemini):
 * cada Edge Function de generación se intercepta (ver `lib/demo.ts`) y se
 * resuelve con uno de estos resultados precargados y deterministas. Así
 * cualquiera puede probar TODAS las funcionalidades (gratuitas y premium) con
 * el usuario de demostración sin generar coste alguno.
 *
 * Los textos siguen el estilo de la plataforma (validación subjetiva / Forer),
 * pero son fijos: no dependen de Gemini ni de la fecha.
 */
import { ZODIAC, ZODIAC_SIGNS, type ZodiacSign } from '@/lib/zodiac';
import type { Area, HoroscopeResponse, Scope } from '@/features/horoscope/types';
import type { DailyEnergyResponse } from '@/features/daily-energy/types';
import type { AstroEventsResponse } from '@/features/astro-events/types';
import type { NatalResponse, FullNatalResponse } from '@/features/natal/types';
import type { CompatResponse } from '@/features/compatibility/types';
import type { ReportResponse } from '@/features/reports/types';
import type { TarotResponse } from '@/features/tarot/types';
import type { AdvancedTarotResponse } from '@/features/tarot/advanced-types';
import type { NumerologyResponse } from '@/features/numerology/types';

const now = () => new Date().toISOString();
const uid = () => `demo-${Math.random().toString(36).slice(2, 10)}`;

/** Posición eclíptica simple (sin elemento). */
function place(sign: ZodiacSign, degInSign: number) {
  const idx = ZODIAC_SIGNS.indexOf(sign);
  return {
    sign,
    sign_name: ZODIAC[sign].name,
    longitude: idx * 30 + degInSign,
    deg_in_sign: degInSign,
  };
}

/** Posición eclíptica con elemento (compatibilidad). */
function placeEl(sign: ZodiacSign, degInSign: number) {
  return { ...place(sign, degInSign), element: ZODIAC[sign].element };
}

const safeSign = (s: unknown): ZodiacSign =>
  ZODIAC_SIGNS.includes(s as ZodiacSign) ? (s as ZodiacSign) : 'leo';

// ---------------------------------------------------------------------------
// Horóscopo (diario / semanal / mensual, por signo y área)
// ---------------------------------------------------------------------------

const SCOPE_FRAME: Record<Scope, { word: string; horizon: string }> = {
  daily: { word: 'hoy', horizon: 'la jornada de hoy' },
  weekly: { word: 'esta semana', horizon: 'los próximos siete días' },
  monthly: { word: 'este mes', horizon: 'las próximas semanas' },
};

const AREA_BODY: Record<Area, (sign: string, frame: string) => string> = {
  general: (sign, h) =>
    `${sign}, ${h} se abre con una claridad que llevabas tiempo buscando. Hay una parte de ti que ya intuye hacia dónde quiere ir, aunque todavía no te atrevas a decirlo en voz alta. Confía en esa voz: rara vez se equivoca contigo. Un pequeño gesto que considerabas insignificante terminará abriéndote una puerta inesperada.`,
  love: (sign, h) =>
    `En el terreno afectivo, ${sign}, ${h} trae sinceridad. Si tienes pareja, una conversación pendiente os acercará más de lo que imaginas; si estás soltero/a, alguien de tu entorno te mira de una forma que aún no has sabido leer. Permítete mostrarte tal y como eres: justo eso es lo que resulta magnético en ti.`,
  health: (sign, h) =>
    `Tu cuerpo te está pidiendo equilibrio, ${sign}. Durante ${h} notarás que descansar bien y moverte un poco cada día te devuelve una energía que creías perdida. No se trata de grandes propósitos, sino de cuidarte en lo pequeño. Escúchate antes de llegar al límite.`,
  money: (sign, h) =>
    `En lo económico, ${sign}, ${h} favorece el orden sobre el impulso. Revisa esos gastos que dabas por sentados: ahí hay un margen que puede sorprenderte. Una idea que tenías aparcada podría convertirse en una fuente real de ingresos si te atreves a darle forma.`,
  work: (sign, h) =>
    `En lo profesional, ${sign}, ${h} te coloca en el lugar adecuado en el momento adecuado. Tu esfuerzo reciente empieza a hacerse visible para quien debe verlo. No minimices tus logros: nómbralos. Una colaboración inesperada puede impulsar un proyecto que te importa.`,
};

const LUCKY_COLORS = ['Dorado', 'Turquesa', 'Coral', 'Lavanda', 'Verde esmeralda'];

function horoscopeFixture(body: Record<string, unknown>): HoroscopeResponse {
  const sign = safeSign(body.sun_sign);
  const scope = (body.scope as Scope) ?? 'daily';
  const area = (body.area as Area) ?? 'general';
  const frame = SCOPE_FRAME[scope] ?? SCOPE_FRAME.daily;
  const name = ZODIAC[sign].name;
  const idx = ZODIAC_SIGNS.indexOf(sign);
  return {
    status: 'ok',
    cached: true,
    period_start: now().slice(0, 10),
    content: {
      headline: `${name}, ${frame.word} el cielo se inclina a tu favor`,
      body: AREA_BODY[area](name, frame.horizon),
      lucky_number: ((idx * 7) % 9) + 1,
      lucky_color: LUCKY_COLORS[idx % LUCKY_COLORS.length]!,
      mood_emoji: '✨',
      keyword: 'Confianza',
      premium_hook:
        'Tu carta natal completa revela por qué vives estos ciclos justo ahora. Descúbrelo con Premium.',
      disclaimer: 'Contenido de demostración con fines de entretenimiento.',
    },
  };
}

// ---------------------------------------------------------------------------
// Energía del día (por signo)
// ---------------------------------------------------------------------------

function dailyEnergyFixture(body: Record<string, unknown>): DailyEnergyResponse {
  const sign = safeSign(body.sun_sign);
  const name = ZODIAC[sign].name;
  const idx = ZODIAC_SIGNS.indexOf(sign);
  return {
    status: 'ok',
    cached: true,
    date: now().slice(0, 10),
    content: {
      headline: `${name}, hoy tu energía fluye con intención`,
      body: `Amaneces con una mezcla interesante de calma y determinación, ${name}. No es un día para forzar, sino para dejar que las cosas caigan en su sitio. Notarás que cuando dejas de empujar, el camino se despeja solo. Aprovecha la mañana para lo que requiere concentración y reserva la tarde para los demás.`,
      vibe: 'Serena y magnética',
      energy_level: ((idx * 3) % 6) + 5,
      mood_emoji: '🌟',
      focus: 'Terminar eso que dejaste a medias',
      caution: 'No te disperses en conversaciones que no llevan a ningún sitio',
      premium_hook:
        'Tu numerología revela tu ciclo personal de este año. Ábrelo con Premium.',
    },
  };
}

// ---------------------------------------------------------------------------
// Eventos astrológicos (mes en curso)
// ---------------------------------------------------------------------------

function astroEventsFixture(): AstroEventsResponse {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = (n: number) => new Date(y, m, n).toISOString().slice(0, 10);
  return {
    status: 'ok',
    cached: true,
    month: `${y}-${String(m + 1).padStart(2, '0')}`,
    events: [
      {
        id: uid(),
        event_date: day(6),
        kind: 'new_moon',
        title: 'Luna nueva: un lienzo en blanco',
        description:
          'La Luna nueva marca un punto de partida. Es el momento ideal para sembrar intenciones discretas, esas que no necesitas contarle a nadie todavía. Escribe lo que quieres atraer y deja que el ciclo trabaje contigo.',
        is_premium: false,
      },
      {
        id: uid(),
        event_date: day(15),
        kind: 'venus_ingress',
        title: 'Venus cambia de signo: el afecto se reordena',
        description:
          'El paso de Venus suaviza la forma en que te relacionas y en la que te dejas querer. Una reconciliación o un acercamiento que parecía improbable encuentra ahora su momento.',
        is_premium: false,
      },
      {
        id: uid(),
        event_date: day(21),
        kind: 'full_moon',
        title: 'Luna llena: lo que estaba oculto sale a la luz',
        description:
          'La Luna llena ilumina aquello que venías ignorando. No temas a lo que se revele: es justo la información que necesitabas para tomar una decisión que llevas tiempo posponiendo.',
        is_premium: false,
      },
      {
        id: uid(),
        event_date: day(24),
        kind: 'mercury_ingress',
        title: 'Mercurio estrena signo: las ideas aceleran',
        description:
          'Tu mente se vuelve más ágil y curiosa. Es un buen tramo para estudiar, negociar y poner por escrito eso que rondaba tu cabeza.',
        is_premium: false,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Carta natal básica (Sol / Luna / Ascendente)
// ---------------------------------------------------------------------------

function natalFixture(): NatalResponse {
  return {
    status: 'ok',
    cached: true,
    chart: {
      sun: place('leo', 19),
      moon: place('escorpio', 12),
      ascendant: place('sagitario', 5),
      moon_approximate: false,
      has_time: true,
      place: 'Madrid, España',
      interpretation: {
        intro:
          'Tu carta dibuja a alguien que brilla de puertas afuera pero que siente todo con una intensidad que pocos sospechan. Hay en ti una contradicción fértil: la necesidad de ser visto/a y el deseo de proteger tu mundo interior.',
        sun:
          'Con el Sol en Leo, tu esencia busca expresarse, crear y dejar huella. No estás hecho/a para pasar desapercibido/a: cuando te permites liderar desde el corazón, los demás te siguen sin que tengas que pedirlo.',
        moon:
          'La Luna en Escorpio te da una vida emocional profunda y leal. Amas con todo o no amas; y aunque rara vez lo muestras, sientes las cosas a una profundidad que a ti mismo/a te sorprende.',
        ascendant:
          'Tu Ascendente en Sagitario te envuelve en un aura optimista y aventurera. La gente te percibe como alguien libre, honesto/a y con ganas de más, aunque por dentro estés midiendo cada paso.',
        synthesis:
          'La combinación de un Sol que quiere brillar, una Luna que siente en profundidad y un Ascendente que busca horizontes te convierte en alguien magnético: cálido/a por fuera, inmenso/a por dentro. Tu reto es no esconder esa hondura tras la sonrisa.',
        premium_hook:
          'Esto es solo el principio. Tu carta natal completa añade los diez planetas, las doce casas y los aspectos que explican tu historia entera.',
      },
      created_at: now(),
    },
  };
}

// ---------------------------------------------------------------------------
// Carta natal completa (premium)
// ---------------------------------------------------------------------------

function fullNatalFixture(): FullNatalResponse {
  const planet = (
    body: string,
    name: string,
    symbol: string,
    sign: ZodiacSign,
    deg: number,
    house: number,
    retrograde = false,
  ) => ({ ...place(sign, deg), body, name, symbol, house, retrograde });

  return {
    status: 'ok',
    cached: true,
    chart: {
      planets: [
        planet('sun', 'Sol', '☉', 'leo', 19, 9),
        planet('moon', 'Luna', '☽', 'escorpio', 12, 12),
        planet('mercury', 'Mercurio', '☿', 'virgo', 3, 10),
        planet('venus', 'Venus', '♀', 'cancer', 27, 8),
        planet('mars', 'Marte', '♂', 'geminis', 14, 7),
        planet('jupiter', 'Júpiter', '♃', 'sagitario', 8, 1),
        planet('saturn', 'Saturno', '♄', 'piscis', 22, 4, true),
        planet('uranus', 'Urano', '♅', 'acuario', 1, 3, true),
        planet('neptune', 'Neptuno', '♆', 'capricornio', 25, 2),
        planet('pluto', 'Plutón', '♇', 'escorpio', 4, 12, true),
      ],
      ascendant: place('sagitario', 5),
      midheaven: place('virgo', 18),
      houses: ZODIAC_SIGNS.slice(8)
        .concat(ZODIAC_SIGNS.slice(0, 8))
        .map((sign, i) => ({ house: i + 1, sign, sign_name: ZODIAC[sign].name })),
      aspects: [
        { a: 'sun', b: 'jupiter', a_name: 'Sol', b_name: 'Júpiter', type: 'trine', type_name: 'Trígono', symbol: '△', angle: 120, orb: 1.2 },
        { a: 'moon', b: 'venus', a_name: 'Luna', b_name: 'Venus', type: 'sextile', type_name: 'Sextil', symbol: '✶', angle: 60, orb: 2.1 },
        { a: 'sun', b: 'saturn', a_name: 'Sol', b_name: 'Saturno', type: 'square', type_name: 'Cuadratura', symbol: '□', angle: 90, orb: 3.0 },
        { a: 'mercury', b: 'mars', a_name: 'Mercurio', b_name: 'Marte', type: 'opposition', type_name: 'Oposición', symbol: '☍', angle: 180, orb: 1.8 },
      ],
      place: 'Madrid, España',
      interpretation: {
        identity:
          'Eres una persona de presencia luminosa con un mundo interior mucho más complejo de lo que aparentas. Tu Sol en Leo en la casa 9 te empuja a buscar sentido, a viajar (física o mentalmente) y a inspirar a otros con tu visión.',
        emotional:
          'Tu Luna en Escorpio en la casa 12 te otorga una sensibilidad casi psíquica. Procesas las emociones en privado, en capas profundas, y solo cuando confías de verdad permites que alguien entre en ese territorio.',
        love:
          'Con Venus en Cáncer, amas desde el cuidado y la memoria: recuerdas los detalles, construyes hogar. Necesitas seguridad emocional para entregarte, pero cuando lo haces, tu lealtad es total.',
        vocation:
          'Mercurio en Virgo junto al Medio Cielo te da una mente analítica y orientada al servicio. Brillas en aquello que mezcla criterio, precisión y un propósito mayor que tú mismo/a.',
        shadow:
          'La cuadratura Sol-Saturno habla de una vieja sensación de no ser suficiente. Tu reto vital es dejar de demostrar y empezar a permitirte: la autoexigencia que te impulsa también puede frenarte.',
        year_ahead:
          'El tránsito de Júpiter activa tu sector de la expansión personal: es un año para decir que sí a lo que te hace crecer, aunque dé un poco de vértigo.',
        summary:
          'En conjunto, tu carta describe a alguien llamado/a a integrar luz y profundidad: brillar sin renunciar a tu hondura, liderar sin dejar de sentir. Cuando unes ambas, eres imparable.',
      },
      created_at: now(),
    },
  };
}

// ---------------------------------------------------------------------------
// Compatibilidad avanzada (premium)
// ---------------------------------------------------------------------------

function compatibilityFixture(body: Record<string, unknown>): CompatResponse {
  const a = (body.person_a as Record<string, unknown>) ?? {};
  const b = (body.person_b as Record<string, unknown>) ?? {};
  const labelA = (a.label as string) || 'Persona A';
  const labelB = (b.label as string) || 'Persona B';
  return {
    status: 'ok',
    cached: true,
    report: {
      label_a: labelA,
      label_b: labelB,
      score: 84,
      placements_a: {
        sun: placeEl('leo', 19),
        moon: placeEl('escorpio', 12),
        mercury: placeEl('virgo', 3),
        venus: placeEl('cancer', 27),
        mars: placeEl('geminis', 14),
        ascendant: placeEl('sagitario', 5),
        moon_approximate: false,
      },
      placements_b: {
        sun: placeEl('aries', 8),
        moon: placeEl('tauro', 21),
        mercury: placeEl('piscis', 16),
        venus: placeEl('geminis', 2),
        mars: placeEl('leo', 25),
        ascendant: placeEl('libra', 11),
        moon_approximate: false,
      },
      aspects: [
        { a: 'sun', b: 'mars', a_name: 'Sol de ' + labelA, b_name: 'Marte de ' + labelB, type: 'trine', type_name: 'Trígono', harmonious: true, orb: 1.4 },
        { a: 'venus', b: 'venus', a_name: 'Venus de ' + labelA, b_name: 'Venus de ' + labelB, type: 'sextile', type_name: 'Sextil', harmonious: true, orb: 2.6 },
        { a: 'moon', b: 'sun', a_name: 'Luna de ' + labelA, b_name: 'Sol de ' + labelB, type: 'square', type_name: 'Cuadratura', harmonious: false, orb: 3.1 },
      ],
      interpretation: {
        connection:
          `Lo vuestro engancha desde el primer minuto. Hay una chispa innegable entre ${labelA} y ${labelB}: os reís de lo mismo, os retáis y os admiráis casi sin querer. La atracción no es solo física, es de curiosidad mutua.`,
        emotional:
          'En lo emocional os movéis a velocidades distintas, y precisamente ahí está la enseñanza. Uno necesita tiempo para abrirse; el otro va de frente. Si respetáis ese ritmo, la confianza que construís es de las que duran.',
        love:
          'En el amor sois complementarios: donde uno aporta intensidad, el otro aporta ligereza. Vuestros Venus se llevan bien, lo que augura ternura y un deseo que no se apaga con la rutina.',
        friction:
          'El roce aparece cuando el orgullo se cruza con la necesidad de tener razón. La cuadratura entre vuestras luminarias puede convertir una tontería en un pulso. La clave: ceder no es perder.',
        longterm:
          'A largo plazo tenéis material de sobra para construir algo sólido, siempre que cuidéis la comunicación. Sois de los que crecen juntos en lugar de estancarse.',
        advice:
          'Hablad de lo que sentís antes de que se convierta en reproche. Vuestra mayor fuerza es que, incluso discutiendo, no queréis estar lejos el uno del otro.',
      },
      created_at: now(),
    },
  };
}

// ---------------------------------------------------------------------------
// Reportes mensual / anual (premium)
// ---------------------------------------------------------------------------

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function reportFixture(body: Record<string, unknown>): ReportResponse {
  const kind = (body.kind as 'monthly' | 'annual') ?? 'monthly';
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  const periodLabel = kind === 'monthly' ? `${MONTHS_ES[m]} de ${y}` : `${y}`;
  const periodStart =
    kind === 'monthly'
      ? `${y}-${String(m + 1).padStart(2, '0')}-01`
      : `${y}-01-01`;

  const bodyPos = (
    b: string,
    name: string,
    symbol: string,
    sign: ZodiacSign,
    deg: number,
    retro = false,
  ) => ({ ...place(sign, deg), body: b, name, symbol, retrograde: retro });

  const interpretation: Record<string, string> =
    kind === 'monthly'
      ? {
          headline: `${periodLabel}: un mes para reordenar prioridades`,
          overview:
            'Empiezas el mes con la sensación de que algo está a punto de cambiar, y no te equivocas. Los primeros días te piden cerrar asuntos pendientes; a partir de la mitad, el ritmo se acelera y aparecen oportunidades que llevabas tiempo esperando.',
          love:
            'En el amor, la palabra del mes es honestidad. Una conversación sincera despeja malentendidos y os acerca. Si estás soltero/a, alguien de tu pasado reaparece con una mirada nueva.',
          work:
            'En lo profesional, tu esfuerzo empieza a dar frutos visibles. No es momento de cambiar de rumbo, sino de consolidar. Una persona con más experiencia se convierte en aliada.',
          wellbeing:
            'Tu cuerpo agradecerá que bajes una marcha. Duerme mejor, muévete más y reduce el ruido. La calma no es pereza: es estrategia.',
          key_moments:
            'Alrededor del día 15, una noticia te obliga a decidir rápido; confía en tu instinto. Hacia el final del mes, una pequeña celebración te recuerda lo lejos que has llegado.',
          advice:
            'No confundas movimiento con progreso. Este mes, hacer menos cosas pero mejor te llevará más lejos que llenarte la agenda.',
        }
      : {
          headline: `${periodLabel}: el año en que dejas de pedir permiso`,
          overview:
            'Este es un año bisagra. Lo que siembres en los primeros meses marcará el tono de todo lo demás. Hay una madurez nueva en ti que te permite tomar decisiones que antes posponías por miedo.',
          first_half:
            'La primera mitad del año va de construir cimientos: orden, hábitos, relaciones que suman. Puede que no sea espectacular, pero es el suelo firme sobre el que despegarás después.',
          second_half:
            'La segunda mitad acelera. Llegan reconocimientos, viajes o un cambio que te saca de la zona conocida. Estarás preparado/a porque habrás hecho el trabajo previo.',
          love:
            'En lo afectivo, el año te invita a relaciones más auténticas. Lo superficial deja de interesarte; buscas (y encuentras) profundidad.',
          career:
            'Profesionalmente, es un año de salto. Una puerta que parecía cerrada se abre cuando dejas de insistir en la equivocada. Apuesta por lo que se te da bien de verdad.',
          growth:
            'Tu mayor crecimiento vendrá de soltar el control. Aprenderás que confiar —en ti y en el proceso— no te hace vulnerable, te hace libre.',
          advice:
            'Este año, elige la versión valiente de cada decisión. Dentro de doce meses, te alegrarás de haberlo hecho.',
        };

  return {
    status: 'ok',
    cached: true,
    report: {
      kind,
      period_start: periodStart,
      period_label: periodLabel,
      place: 'Madrid, España',
      natal: {
        bodies: [
          bodyPos('sun', 'Sol', '☉', 'leo', 19),
          bodyPos('moon', 'Luna', '☽', 'escorpio', 12),
          bodyPos('mercury', 'Mercurio', '☿', 'virgo', 3),
          bodyPos('venus', 'Venus', '♀', 'cancer', 27),
          bodyPos('mars', 'Marte', '♂', 'geminis', 14),
          bodyPos('jupiter', 'Júpiter', '♃', 'sagitario', 8),
          bodyPos('saturn', 'Saturno', '♄', 'piscis', 22, true),
        ],
        ascendant: place('sagitario', 5),
        midheaven: place('virgo', 18),
        has_time: true,
        has_angles: true,
      },
      transits: [
        bodyPos('jupiter', 'Júpiter', '♃', 'cancer', 11),
        bodyPos('saturn', 'Saturno', '♄', 'aries', 2),
        bodyPos('mars', 'Marte', '♂', 'leo', 20),
      ],
      aspects: [
        { transit: 'jupiter', transit_name: 'Júpiter', natal: 'venus', natal_name: 'Venus', type: 'trine', type_name: 'Trígono', harmonious: true, orb: 1.5 },
        { transit: 'saturn', transit_name: 'Saturno', natal: 'sun', natal_name: 'Sol', type: 'square', type_name: 'Cuadratura', harmonious: false, orb: 2.2 },
        { transit: 'mars', transit_name: 'Marte', natal: 'sun', natal_name: 'Sol', type: 'conjunction', type_name: 'Conjunción', harmonious: true, orb: 0.9 },
      ],
      interpretation,
      created_at: now(),
    },
  };
}

// ---------------------------------------------------------------------------
// Tarot simple (gratuito)
// ---------------------------------------------------------------------------

const TAROT_POOL: Array<{ id: string; name: string; arcana: 'major' | 'minor'; meaning: string }> = [
  { id: 'the-star', name: 'La Estrella', arcana: 'major', meaning: 'Esperanza renovada y fe en que lo que viene será mejor. Es momento de curar y confiar.' },
  { id: 'the-sun', name: 'El Sol', arcana: 'major', meaning: 'Claridad, éxito y alegría sincera. Aquello que te preocupaba se ilumina y se resuelve.' },
  { id: 'the-wheel', name: 'La Rueda de la Fortuna', arcana: 'major', meaning: 'Un giro del destino se pone en marcha. Lo que parecía estancado, vuelve a moverse a tu favor.' },
  { id: 'strength', name: 'La Fuerza', arcana: 'major', meaning: 'Tu poder está en la calma, no en la imposición. Dominas la situación desde la serenidad.' },
  { id: 'the-lovers', name: 'Los Enamorados', arcana: 'major', meaning: 'Una elección importante del corazón. Escucha lo que de verdad quieres, no lo que se espera de ti.' },
  { id: 'the-magician', name: 'El Mago', arcana: 'major', meaning: 'Tienes todas las herramientas para lograrlo. Es momento de pasar de la idea a la acción.' },
];

function tarotFixture(body: Record<string, unknown>): TarotResponse {
  const spread = (body.spread as 'one_card' | 'three_cards') ?? 'one_card';
  const question = (body.question as string) ?? null;
  const positions =
    spread === 'three_cards'
      ? ['Pasado', 'Presente', 'Futuro']
      : ['El mensaje del día'];
  const cards = positions.map((position, i) => {
    const card = TAROT_POOL[i]!;
    return {
      id: card.id,
      name: card.name,
      arcana: card.arcana,
      reversed: i === 1,
      position,
      meaning: card.meaning,
    };
  });
  return {
    status: 'ok',
    id: uid(),
    created_at: now(),
    spread,
    question,
    content: {
      cards,
      summary:
        'Las cartas coinciden en un mensaje claro: estás saliendo de una etapa de duda hacia otra de claridad. Lo que viene pide confianza y un primer paso valiente. No tienes que tenerlo todo resuelto, solo empezar.',
      premium_hook:
        'Una tirada de Cruz Celta de diez cartas profundizaría muchísimo más en tu situación. Disponible en Premium.',
    },
  };
}

// ---------------------------------------------------------------------------
// Tarot avanzado (premium)
// ---------------------------------------------------------------------------

const CELTIC_POSITIONS = [
  'Situación actual', 'El desafío', 'Raíz / pasado', 'Pasado reciente',
  'Lo que puede ser', 'Futuro inmediato', 'Tú mismo/a', 'Tu entorno',
  'Esperanzas y miedos', 'El desenlace',
];
const HORSESHOE_POSITIONS = [
  'Pasado', 'Presente', 'Influencias ocultas', 'Obstáculos',
  'Tu entorno', 'Consejo', 'Resultado probable',
];

function advancedTarotFixture(body: Record<string, unknown>): AdvancedTarotResponse {
  const spread = (body.spread as 'celtic_cross' | 'horseshoe') ?? 'celtic_cross';
  const question = (body.question as string) ?? null;
  const positions = spread === 'celtic_cross' ? CELTIC_POSITIONS : HORSESHOE_POSITIONS;
  const cards = positions.map((position, i) => {
    const src = TAROT_POOL[i % TAROT_POOL.length]!;
    return {
      id: `${src.id}-${i}`,
      name: src.name,
      arcana: src.arcana,
      reversed: i % 3 === 0,
      position,
      meaning: `${src.meaning} En la posición «${position}», te invita a observar este aspecto concreto de tu situación.`,
    };
  });
  return {
    status: 'ok',
    id: uid(),
    created_at: now(),
    spread,
    question,
    content: {
      cards,
      overview:
        'La tirada dibuja un momento de transición consciente. No estás perdido/a: estás reorganizándote. Las cartas centrales muestran que el verdadero desafío no es externo, sino la vieja creencia de que debes hacerlo todo solo/a.',
      synthesis:
        'El hilo que une toda la lectura es la liberación. Sueltas un peso que cargabas por costumbre y, al hacerlo, descubres una energía nueva. El entorno te acompaña más de lo que crees; déjate ayudar.',
      advice:
        'Da el paso que vienes posponiendo, pero hazlo desde la calma, no desde la prisa. El desenlace es favorable siempre que actúes con honestidad contigo mismo/a.',
    },
    billing: 'included',
  };
}

// ---------------------------------------------------------------------------
// Numerología avanzada (premium)
// ---------------------------------------------------------------------------

function numerologyFixture(body: Record<string, unknown>): NumerologyResponse {
  const focus = (body.focus as string) ?? null;
  const d = new Date();
  return {
    status: 'ok',
    id: uid(),
    created_at: now(),
    numbers: {
      life_path: 8,
      personal_year: 3,
      personal_month: 5,
      birthday: 3,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    },
    focus,
    content: {
      headline: 'Camino de vida 8: nacido/a para construir y liderar',
      portrait:
        'Tu número rector, el 8, habla de poder personal, ambición sana y capacidad de materializar. No has venido a este mundo a quedarte en segundo plano: tienes un don natural para convertir ideas en realidades tangibles y para gestionar lo que otros consideran demasiado grande.',
      purpose:
        'Tu propósito gira en torno al equilibrio entre lo material y lo espiritual. Aprenderás que el verdadero éxito no es solo acumular, sino usar lo que logras para construir algo que te trascienda.',
      strengths:
        'Tienes resiliencia, visión estratégica y una determinación que impone respeto. Cuando te propones algo, es solo cuestión de tiempo. Los demás confían en ti porque transmites solidez.',
      cycle:
        'Estás en un año personal 3: un ciclo de expresión, creatividad y vida social. Después de un periodo de esfuerzo, el universo te pide soltar, comunicar y disfrutar. Di que sí a lo que te ilusione.',
      love:
        'En el amor necesitas a alguien que admire tu fuerza sin sentirse a la sombra. Tu reto es mostrar vulnerabilidad: bajar la guardia no te resta poder, te hace cercano/a.',
      advice: focus
        ? `Sobre lo que te preocupa («${focus}»), los números son claros: tienes más control del que crees. Da un paso firme y concreto esta semana.`
        : 'Confía en tu capacidad de materializar, pero recuerda descansar. Tu energía es un recurso valioso: adminístrala como administras todo lo demás.',
    },
    billing: 'included',
  };
}

// ---------------------------------------------------------------------------
// Registro de fixtures por nombre de Edge Function
// ---------------------------------------------------------------------------

export const DEMO_FIXTURES: Record<
  string,
  (body: Record<string, unknown>) => unknown
> = {
  'generate-horoscope': horoscopeFixture,
  'generate-daily-energy': dailyEnergyFixture,
  'generate-astro-events': astroEventsFixture,
  'generate-natal-chart': natalFixture,
  'generate-full-natal-chart': fullNatalFixture,
  'generate-compatibility': compatibilityFixture,
  'generate-report': reportFixture,
  'generate-tarot-reading': tarotFixture,
  'generate-advanced-tarot': advancedTarotFixture,
  'generate-numerology': numerologyFixture,
};

/**
 * Funciones deshabilitadas en demo (pagos, portal, borrado de cuenta): no se
 * ejecutan; devuelven un error amable que la UI muestra al usuario.
 */
export const DEMO_DISABLED_FUNCTIONS = new Set<string>([
  'create-checkout-session',
  'create-portal-session',
  'create-compatibility-payment',
  'create-advanced-tarot-payment',
  'create-numerology-payment',
  'delete-account',
]);
