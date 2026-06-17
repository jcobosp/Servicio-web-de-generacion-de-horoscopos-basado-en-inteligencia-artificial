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
    `${sign}, ${h} se abre con una claridad que llevabas tiempo buscando. Hay una parte de ti que ya intuye hacia dónde quiere ir, aunque todavía no te atrevas a decirlo en voz alta por miedo a equivocarte. Confía en esa voz interior: rara vez se equivoca contigo, y justo ahora te está señalando un camino que tu razón aún duda en aceptar. ` +
    `Notarás que las cosas empiezan a ordenarse casi sin que tengas que forzarlas; lo que durante semanas parecía atascado encuentra de pronto su sitio. Un pequeño gesto que considerabas insignificante —una llamada, un mensaje, una decisión mínima— terminará abriéndote una puerta inesperada. ` +
    `No te exijas tenerlo todo resuelto: tu fortaleza estos días está en mantener la calma mientras los demás se agitan. Quien te conoce de verdad reconoce esa firmeza tranquila que te caracteriza, y precisamente eso es lo que hará que alguien acuda a ti en busca de apoyo. Date permiso para recibir tanto como das.`,
  love: (sign, h) =>
    `En el terreno afectivo, ${sign}, ${h} trae una verdad que pedía salir. Si tienes pareja, una conversación pendiente os acercará mucho más de lo que imaginas: eso que no os atrevíais a nombrar, una vez dicho, deja de pesar y se convierte en complicidad. No temas mostrar lo que sientes, porque la otra persona lleva tiempo esperando exactamente esa señal. ` +
    `Si estás soltero/a, alguien de tu entorno te mira de una forma que aún no has sabido leer; quizá lo tienes tan cerca que no lo habías considerado. Presta atención a los detalles pequeños, a quién se ríe de verdad contigo y a quién recuerda lo que dijiste de pasada. ` +
    `Permítete mostrarte tal y como eres, con tus contradicciones incluidas: esa autenticidad que a veces escondes por prudencia es justo lo que resulta magnético en ti. El amor, estos días, premia a quien se atreve a ser sincero antes que perfecto.`,
  health: (sign, h) =>
    `Tu cuerpo te está pidiendo equilibrio, ${sign}, y lo hace con señales que conviene no ignorar. Durante ${h} notarás que descansar bien, beber más agua y moverte un poco cada día te devuelve una energía que creías perdida. No se trata de imponerte grandes propósitos imposibles de sostener, sino de cuidarte en lo pequeño y cotidiano. ` +
    `Hay una tensión acumulada —más mental que física— que llevas arrastrando sin darte cuenta; este es buen momento para soltarla con algo tan simple como una caminata, respirar hondo o desconectar de las pantallas un rato. Tu mente y tu cuerpo están más conectados de lo que sueles admitir. ` +
    `Escúchate antes de llegar al límite: ese cansancio que minimizas es en realidad una petición de pausa. Cuidarte no es un lujo ni una pérdida de tiempo, es la base desde la que todo lo demás funciona mejor.`,
  money: (sign, h) =>
    `En lo económico, ${sign}, ${h} favorece el orden por encima del impulso. Revisa esos gastos pequeños que dabas por sentados: ahí, en lo que parece insignificante, hay un margen que puede sorprenderte cuando lo sumas. No es momento de grandes apuestas ni de decisiones precipitadas, sino de poner claridad sobre los números y recuperar el control. ` +
    `Una idea que tenías aparcada —algo que se te da bien y que otros valoran— podría convertirse en una fuente real de ingresos si te atreves a darle forma en lugar de seguir dejándola para «más adelante». El universo recompensa estos días a quien pasa de la intención a la acción concreta. ` +
    `Si esperabas una respuesta sobre un asunto material, llega con buen tono. Mantén la prudencia, pero no la confundas con miedo: hay oportunidades reales para quien sabe distinguir entre gastar y, de verdad, invertir en sí mismo.`,
  work: (sign, h) =>
    `En lo profesional, ${sign}, ${h} te coloca en el lugar adecuado en el momento adecuado. Tu esfuerzo reciente, ese que a veces sentías que nadie notaba, empieza a hacerse visible para quien debe verlo. No minimices tus logros ni los disfraces de suerte: nómbralos, defiéndelos, ocupa el espacio que te has ganado. ` +
    `Una colaboración inesperada puede impulsar un proyecto que te importa de verdad; mantente abierto/a a propuestas que al principio parezcan fuera de tu zona habitual, porque ahí se esconde un crecimiento que llevabas tiempo necesitando. Tu capacidad para ver lo que otros pasan por alto será hoy tu mayor ventaja. ` +
    `Si has estado dudando entre seguir como estás o dar un paso, las señales se inclinan hacia el movimiento. No tienes que cambiarlo todo de golpe: basta con un gesto firme que demuestre —sobre todo a ti mismo/a— que vas en serio con lo que quieres.`,
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
      body: `Amaneces con una mezcla interesante de calma y determinación, ${name}. No es un día para forzar las cosas, sino para dejar que caigan en su sitio con su propio ritmo. Notarás que, cuando dejas de empujar y confías un poco más, el camino se despeja solo y aparecen soluciones que ayer no veías. ` +
        `Tu energía hoy es de las que atraen sin esfuerzo: las personas se acercan, las conversaciones se dan, las puertas se entreabren. Aprovecha las primeras horas, cuando tu mente está más despejada, para todo lo que requiera concentración o decisiones importantes; reserva la tarde para los demás, para lo afectivo y lo que se cocina a fuego lento. ` +
        `Hay un asunto que llevas rondando en la cabeza y que hoy puede empezar a desbloquearse si te permites dar el primer paso, por pequeño que sea. Confía en tu instinto: hoy es más fino y certero de lo habitual.`,
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
          'La Luna nueva marca el inicio de un nuevo ciclo lunar y, con él, un punto de partida simbólico que conviene aprovechar. La energía de estos días invita a sembrar intenciones discretas, esas que todavía no necesitas contarle a nadie y que crecen mejor en la intimidad. Tómate un momento de silencio para escribir lo que quieres atraer en las próximas semanas: el simple hecho de nombrarlo ya pone las cosas en marcha. Es también un buen tramo para soltar lo que pesa y hacer espacio: cuesta sembrar en una tierra llena de lo viejo. Deja que el ciclo trabaje contigo en lugar de en tu contra.',
        is_premium: false,
      },
      {
        id: uid(),
        event_date: day(15),
        kind: 'venus_ingress',
        title: 'Venus cambia de signo: el afecto se reordena',
        description:
          'El paso de Venus a un nuevo signo suaviza y reordena la forma en que te relacionas, en la que expresas cariño y, sobre todo, en la que te permites recibirlo. Durante este tránsito, los gestos pequeños pesan más que las grandes declaraciones: un mensaje a tiempo, una mirada, una atención sincera. Una reconciliación o un acercamiento que parecía improbable encuentra ahora la temperatura justa para darse. Es buen momento para perdonar viejos roces, para acercarte a quien echabas de menos y para rodearte de belleza en lo cotidiano. En lo material, Venus también favorece los placeres sencillos y las decisiones tomadas desde el disfrute, no desde la culpa.',
        is_premium: false,
      },
      {
        id: uid(),
        event_date: day(21),
        kind: 'full_moon',
        title: 'Luna llena: lo que estaba oculto sale a la luz',
        description:
          'La Luna llena lleva un ciclo a su punto culminante e ilumina, a veces sin pedir permiso, aquello que venías ignorando. Las emociones se intensifican y lo que estaba bajo la superficie sale a flote: por eso es habitual sentirse más sensible o más lúcido de lo normal en estos días. No temas a lo que se revele, porque suele ser justo la información que necesitabas para tomar una decisión que llevas tiempo posponiendo. Es una fase de cosecha y de cierre: se ve con claridad qué ha dado fruto y qué conviene soltar. Evita reaccionar en caliente; deja que la primera oleada de emoción pase y quédate con lo que la Luna te ha mostrado.',
        is_premium: false,
      },
      {
        id: uid(),
        event_date: day(24),
        kind: 'mercury_ingress',
        title: 'Mercurio estrena signo: las ideas aceleran',
        description:
          'Con Mercurio estrenando signo, tu mente se vuelve más ágil, curiosa y rápida para conectar ideas que antes parecían inconexas. Es uno de los mejores tramos del mes para estudiar, negociar, firmar acuerdos y poner por escrito eso que llevaba semanas rondándote la cabeza. La comunicación fluye: las conversaciones difíciles se vuelven más fáciles y encuentras las palabras justas en el momento oportuno. Aprovecha este impulso mental para ordenar pendientes, retomar un proyecto creativo o aprender algo nuevo. Eso sí, tanta actividad mental puede saturar: reserva ratos de silencio para que las mejores ideas, que casi siempre llegan cuando paras, tengan sitio donde aparecer.',
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
          'Tu carta natal dibuja a alguien que brilla de puertas afuera pero que siente todo con una intensidad que pocos llegan a sospechar. Hay en ti una contradicción fértil, que lejos de ser un problema es tu mayor riqueza: la necesidad de ser visto/a y reconocido/a conviviendo con un deseo profundo de proteger tu mundo interior y reservarlo solo para quien se lo gana. Quien te trata por encima ve seguridad y calidez; quien te conoce de verdad descubre una hondura que no esperaba. Entender ese doble registro es la llave para entenderte.',
        sun:
          'Con el Sol en Leo, tu esencia busca expresarse, crear y dejar huella allá donde pasas. No estás hecho/a para pasar desapercibido/a, aunque a veces lo intentes por prudencia: cuando te permites liderar desde el corazón —no desde el ego, sino desde la generosidad— los demás te siguen de forma natural, sin que tengas que pedirlo. Tu calidez es contagiosa y tu lealtad, una vez dada, es total. Tu reto es no depender en exceso del reconocimiento ajeno: tu luz no necesita aplausos para ser real.',
        moon:
          'La Luna en Escorpio te otorga una vida emocional profunda, intensa y absolutamente leal. Amas con todo o no amas; sientes los vínculos en capas que llegan muy hondo, y aunque rara vez lo muestras abiertamente, percibes lo que ocurre bajo la superficie de las personas con una intuición casi inquietante. Necesitas confiar para abrirte, y cuando lo haces no hay medias tintas. Aprender a soltar el control emocional y a perdonar —incluida a ti mismo/a— es uno de los grandes aprendizajes de esta posición.',
        ascendant:
          'Tu Ascendente en Sagitario te envuelve en un aura optimista, cálida y con ganas de horizonte. La gente te percibe como alguien libre, honesto/a, divertido/a y con sed de más, aunque por dentro estés midiendo cada paso con más cautela de la que aparentas. Esa primera impresión tuya abre puertas y desarma a la gente. Tu desafío es que el exterior aventurero y el interior intenso de tu Luna dialoguen en lugar de tirar cada uno por su lado.',
        synthesis:
          'La combinación de un Sol que quiere brillar, una Luna que siente en profundidad y un Ascendente que busca horizontes te convierte en alguien profundamente magnético: cálido/a y luminoso/a por fuera, inmenso/a y complejo/a por dentro. Tu mayor reto vital es no esconder esa hondura tras la sonrisa, no rebajar lo que sientes para que los demás estén cómodos. Cuando integras tu necesidad de brillar con tu capacidad de sentir, dejas de elegir entre ser visto/a o ser verdadero/a: te conviertes en ambas cosas a la vez, y ahí reside tu poder.',
        premium_hook:
          'Esto es solo el principio. Tu carta natal completa añade los diez planetas, las doce casas y los aspectos entre ellos, los que explican por qué repites ciertos patrones, dónde está tu vocación y qué te depara el año. Ábrela con Premium.',
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
          'Eres una persona de presencia luminosa con un mundo interior mucho más complejo y matizado de lo que dejas ver a primera vista. Tu Sol en Leo en la casa 9 te empuja a buscar sentido, a expandir tus horizontes —ya sea viajando, estudiando o cuestionándote el porqué de las cosas— y a inspirar a otros con tu visión y tu entusiasmo. No te conformas con vivir en piloto automático: necesitas que lo que haces signifique algo. Esa búsqueda de propósito, unida a tu carisma natural, te convierte en alguien a quien los demás miran cuando hace falta una dirección. Tu identidad se construye dando, enseñando y mostrando un camino, más que acumulando para ti.',
        emotional:
          'Tu Luna en Escorpio en la casa 12 te otorga una sensibilidad que roza lo psíquico: captas lo que los demás callan y procesas tus propias emociones en privado, en capas profundas a las que ni tú mismo/a accedes siempre del todo. Hay en ti una vida interior intensa, casi secreta, que rara vez compartes y que solo abres a quien se ha ganado por completo tu confianza. Esta posición pide aprender a no cargar con emociones que no son tuyas y a no encerrarte cuando duele. Cuando honras tu necesidad de soledad y recogimiento sin caer en el aislamiento, esta Luna se convierte en una fuente extraordinaria de intuición y sanación, para ti y para los demás.',
        love:
          'Con Venus en Cáncer en la casa 8, amas desde el cuidado, la memoria y la entrega total. Recuerdas los detalles, construyes hogar allá donde estás y proteges con fiereza a quien quieres. Necesitas seguridad emocional real antes de entregarte, porque para ti el amor no es un juego ligero sino una fusión profunda: cuando te abres, lo haces sin red. Eso te hace inmensamente leal, pero también vulnerable al miedo a la pérdida y a los celos. Tu aprendizaje en el amor pasa por confiar sin necesitar controlar, y por permitir que te cuiden tanto como tú cuidas.',
        vocation:
          'Mercurio en Virgo junto al Medio Cielo te regala una mente analítica, precisa y orientada al servicio, capaz de ver el detalle que a todos se les escapa. Profesionalmente brillas en aquello que combina criterio, rigor y un propósito mayor que tú mismo/a: ayudar, mejorar, ordenar, enseñar. Te tomas en serio lo que haces y los demás lo notan, lo que te abre puertas hacia posiciones de responsabilidad. El riesgo es el perfeccionismo y la autocrítica: no todo necesita estar impecable para tener valor. Cuando pones tu exigencia al servicio de algo que amas, en lugar de usarla para castigarte, tu carrera despega.',
        shadow:
          'La cuadratura Sol-Saturno es uno de los hilos más importantes de tu carta: habla de una vieja sensación, casi siempre heredada de la infancia, de no ser suficiente, de tener que demostrar para merecer. Esa herida es justamente la que te ha hecho tan responsable, tan capaz y tan resistente, pero también puede frenarte y hacerte vivir desde la exigencia constante. Tu reto vital es dejar de demostrar y empezar a permitirte; entender que tu valor no depende de tus logros. A medida que haces las paces con Saturno, esa autoexigencia se transforma en autodisciplina sana y madura, y descubres una libertad que antes te negabas.',
        year_ahead:
          'El tránsito de Júpiter por tu carta activa el sector de la expansión personal y las oportunidades: es un periodo para decir que sí a lo que te hace crecer, aunque dé un poco de vértigo. Pueden llegar viajes, formación, un golpe de suerte o el impulso para retomar un sueño aparcado. Júpiter premia la valentía, no la cautela excesiva. Eso sí, con tu Saturno conviene no prometer más de lo que puedes sostener: crece, pero con los pies en el suelo. Es un año para sembrar grande y, a la vez, ordenar bien lo sembrado.',
        summary:
          'En conjunto, tu carta describe a alguien llamado/a a integrar luz y profundidad: a brillar sin renunciar a tu hondura, a liderar sin dejar de sentir, a darte a los demás sin perderte a ti mismo/a. Tus mayores tensiones —entre mostrarte y protegerte, entre exigirte y permitirte— no son defectos a corregir, sino el motor de tu evolución. Cuando unes tu Sol luminoso, tu Luna profunda y tu mente precisa al servicio de un propósito que amas, eres sencillamente imparable. Tu vida es el proceso de aprender a creerte lo que ya eres.',
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
          `Lo vuestro engancha desde el primer minuto. Hay una chispa innegable entre ${labelA} y ${labelB}: os reís de lo mismo, os retáis, os admiráis casi sin querer y os cuesta dejar de hablar cuando empezáis. La atracción no es solo física —que la hay—, sino de curiosidad mutua: cada uno representa para el otro un mundo por descubrir. El trígono entre el Sol de ${labelA} y el Marte de ${labelB} explica esa facilidad para entusiasmaros juntos y para empujar en la misma dirección cuando os lo proponéis. Es una conexión de las que se notan en el cuerpo y en la conversación a partes iguales.`,
        emotional:
          'En lo emocional os movéis a velocidades distintas, y precisamente ahí está la gran enseñanza de esta relación. Uno de vosotros necesita tiempo, señales y seguridad para abrirse del todo; el otro va más de frente y se frustra ante lo que percibe como muros. Ninguno de los dos está equivocado: simplemente sentís en idiomas diferentes. Si aprendéis a traducir —si quien va rápido aprende a esperar y quien va lento aprende a dar pistas—, la confianza que construís es de las que de verdad duran. La intimidad emocional será vuestro terreno de crecimiento más importante.',
        love:
          'En el amor sois profundamente complementarios: donde uno aporta intensidad y compromiso, el otro aporta ligereza, aire y juego. Esa diferencia, bien llevada, evita que la relación caiga ni en el drama ni en la rutina. Vuestros Venus se llevan especialmente bien (ese sextil habla de gustos compartidos y de ternura natural), lo que augura cariño en lo cotidiano y un deseo que no se apaga fácilmente con el tiempo. Sabéis cuidaros y, sobre todo, sabéis volver a encenderos. El reto es no dar por sentado lo que funciona: seguir eligiéndoos en lo pequeño.',
        friction:
          'El roce aparece, casi siempre, cuando el orgullo se cruza con la necesidad de tener razón. La cuadratura entre vuestras luminarias (la Luna de uno con el Sol del otro) puede convertir una tontería en un pulso de egos en cuestión de segundos: los dos sois capaces de mantener un enfado más por principio que por convicción. La clave es entender que ceder no es perder, y que tener razón importa mucho menos que estar bien juntos. Cuando aprendáis a parar a tiempo, a pedir perdón sin que se os caigan los anillos y a no acumular reproches, estas fricciones se quedarán en anécdotas.',
        longterm:
          'A largo plazo tenéis material de sobra para construir algo sólido y duradero, siempre que cuidéis la comunicación y no deis la relación por hecha. Sois de los que pueden crecer juntos en lugar de estancarse: os retáis lo justo para no aburriros y os sostenéis lo suficiente para sentiros en casa. Los proyectos compartidos —un hogar, un viaje, una meta común— os unen especialmente, porque ambos disfrutáis avanzando hacia algo. El tiempo, en vuestro caso, juega a favor: lo que hoy es atracción, con trabajo, puede convertirse en una de esas complicidades que dan envidia sana.',
        advice:
          'Hablad de lo que sentís antes de que se convierta en reproche acumulado: vuestra mayor trampa es el silencio orgulloso. Reservaos momentos solo para vosotros, sin pantallas ni prisas, donde podáis reconectar de verdad. Y recordad, en cada discusión, cuál es vuestra mayor fuerza: que incluso enfadados, ninguno de los dos quiere estar lejos del otro. Apoyaos en eso. Cuando dudéis, elegid la ternura antes que la razón.',
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
            'Empiezas el mes con la sensación de que algo está a punto de cambiar, y no te equivocas. Los primeros días te piden cerrar asuntos pendientes y poner orden en lo que habías ido dejando para «cuando tuvieras tiempo»: ese tiempo es ahora. A partir de la mitad del mes, el ritmo se acelera notablemente y empiezan a aparecer oportunidades que llevabas tiempo esperando, algunas casi sin buscarlas. El tránsito de Júpiter en buen aspecto con tu Venus abre una ventana favorable para lo material y lo afectivo, mientras que la tensión de Saturno con tu Sol te recuerda que el éxito de este mes pasa por la constancia, no por los atajos. Es un mes de cosecha para quien sembró, y de siembra para quien sabe esperar.',
          love:
            'En el amor, la palabra del mes es honestidad. Una conversación sincera —de esas que llevabas posponiendo por miedo a cómo sentaría— despeja malentendidos y os acerca mucho más de lo que imaginas. Si tienes pareja, es buen momento para reavivar la complicidad con planes nuevos y para dejar de dar por sentado lo cotidiano. Si estás soltero/a, alguien de tu pasado podría reaparecer con una mirada distinta, o alguien muy cercano revelarse de pronto bajo otra luz. No fuerces nada: este mes el amor premia la autenticidad por encima de la estrategia. Muéstrate como eres y deja que el resto se ordene solo.',
          work:
            'En lo profesional, tu esfuerzo de los últimos meses empieza a dar frutos visibles y, lo más importante, visibles para quien debe verlos. No es momento de cambiar de rumbo ni de empezar de cero, sino de consolidar lo construido y de reclamar el reconocimiento que te has ganado. Una persona con más experiencia —un mentor, un superior, alguien que ya pasó por donde tú estás— se convierte en aliada inesperada: déjate aconsejar. Cuida los detalles y los plazos durante la primera quincena; en la segunda, atrévete a proponer esa idea que tienes guardada. La firmeza tranquila será tu mejor carta.',
          wellbeing:
            'Tu cuerpo agradecerá que bajes una marcha en algún momento del mes. Duerme mejor, muévete más, hidrátate y reduce el ruido —el digital también—. Hay un cansancio acumulado, más mental que físico, que conviene atender antes de que se convierta en irritabilidad o en bloqueo. La calma no es pereza ni pérdida de tiempo: es estrategia, es lo que te permite rendir cuando de verdad importa. Reservar pequeños rituales de cuidado, por simples que sean, marcará la diferencia entre llegar agotado/a a fin de mes o llegar entero/a.',
          key_moments:
            'Alrededor del día 15, una noticia o una propuesta te obligará a decidir más rápido de lo que te gustaría; confía en tu instinto, que este mes está especialmente afinado, y no te dejes presionar por terceros. La luna llena de mitad de mes traerá claridad emocional sobre un asunto que arrastrabas. Y hacia el final del mes, una pequeña celebración, un cierre o un agradecimiento inesperado te recordará lo lejos que has llegado sin apenas darte cuenta. Anota esas fechas: son los pivotes sobre los que girará todo lo demás.',
          advice:
            'No confundas movimiento con progreso. Este mes, hacer menos cosas pero mejor te llevará mucho más lejos que llenarte la agenda hasta no poder respirar. Elige tres prioridades de verdad y protégelas de todo lo demás. Aprende a decir que no sin culpa: cada «no» a lo que te dispersa es un «sí» a lo que te importa. Si tienes que quedarte con una sola idea, que sea esta: la firmeza tranquila vence a la prisa.',
        }
      : {
          headline: `${periodLabel}: el año en que dejas de pedir permiso`,
          overview:
            'Este es, sin exagerar, un año bisagra. Lo que siembres en los primeros meses marcará el tono de todo lo demás, así que merece la pena empezar con intención en lugar de dejarse llevar. Hay una madurez nueva en ti, fruto de todo lo vivido, que te permite tomar decisiones que antes posponías por miedo o por costumbre. Los grandes tránsitos del año dibujan una historia de afianzamiento y, luego, de despegue: Saturno te pide responsabilidad y estructura en los asuntos centrales de tu vida, mientras que Júpiter, en la segunda parte, abre las puertas que tanto Saturno habrá ayudado a merecer. No es un año para vivir en piloto automático: es un año para elegir, conscientemente, quién quieres ser.',
          first_half:
            'La primera mitad del año va de construir cimientos: ordenar las finanzas, instaurar hábitos sostenibles, depurar las relaciones para quedarte con las que de verdad suman y soltar las que pesan. Puede que no sea la etapa más espectacular ni la más vistosa de cara a los demás, y es posible que en algún momento te impacientes pensando que no avanzas. No te dejes engañar: este es el suelo firme, el trabajo silencioso sobre el que despegarás después. Todo lo que consolides ahora será lo que te sostenga cuando lleguen las oportunidades grandes.',
          second_half:
            'La segunda mitad del año cambia de marcha y acelera. Llegan reconocimientos, viajes, una mudanza, un nuevo proyecto o un cambio que te saca de la zona conocida y te obliga a crecer. La diferencia respecto a otras veces es que esta vez estarás preparado/a, porque habrás hecho el trabajo previo durante los primeros meses. Júpiter favorece la expansión, así que conviene decir que sí a lo que te ilusione aunque dé vértigo. Será una etapa de mayor visibilidad y de cosecha: lo que parecía lento de pronto florece todo junto.',
          love:
            'En lo afectivo, el año entero te invita a relaciones más auténticas y profundas. Lo superficial deja de interesarte casi sin que lo decidas; buscas —y, lo importante, encuentras— verdad, presencia y reciprocidad. Si tienes pareja, es un año para llevar la relación a un nivel más maduro y comprometido, dejando atrás dinámicas viejas. Si estás soltero/a, podrías conocer a alguien que llega para quedarse, probablemente cuando dejes de buscar desde la carencia y empieces a hacerlo desde la plenitud. El amor, este año, te pide que primero hagas las paces contigo.',
          career:
            'Profesionalmente, es un año de salto cualitativo. Una puerta que parecía cerrada se abre justo cuando dejas de insistir en la equivocada y reorientas tu energía hacia lo que de verdad se te da bien. Apuesta por tus fortalezas reales, no por lo que crees que «deberías» hacer. Puede llegar un ascenso, un cambio de empresa, el impulso para un proyecto propio o un reconocimiento que llevabas tiempo mereciendo. Saturno premia tu seriedad y tu constancia; Júpiter amplía el alcance de lo que logres. La combinación es excelente para construir algo duradero.',
          growth:
            'Tu mayor crecimiento personal del año vendrá, paradójicamente, de soltar el control. Aprenderás —a veces por las buenas, a veces por las menos buenas— que confiar, en ti y en el proceso, no te hace más vulnerable sino más libre. Las situaciones que escapen a tu plan serán precisamente las que más te enseñen. A medida que avance el año descubrirás que mereces lo bueno sin tener que ganártelo a base de agotarte, y esa será la lección más transformadora de todas: pasar de la exigencia a la confianza.',
          advice:
            'Este año, ante cada bifurcación, elige la versión valiente de la decisión, no la cómoda. Dentro de doce meses, cuando mires atrás, te alegrarás muchísimo de haberlo hecho y apenas recordarás los miedos que hoy te frenan. Construye despacio en la primera mitad y atrévete a más en la segunda. Y, sobre todo, deja de pedir permiso para ser quien ya eres: el único permiso que necesitabas siempre fue el tuyo.',
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
  { id: 'the-star', name: 'La Estrella', arcana: 'major', meaning: 'La Estrella es una de las cartas más luminosas de la baraja: anuncia esperanza renovada, calma y una fe serena en que lo que viene será mejor que lo que dejas atrás. Después de una etapa difícil, llega un momento de curación y de respirar hondo. Te recuerda que la luz que buscas fuera ya está dentro de ti. Confía, sánate y deja que tu intuición vuelva a guiarte.' },
  { id: 'the-sun', name: 'El Sol', arcana: 'major', meaning: 'El Sol irradia claridad, éxito y una alegría sincera y sin condiciones. Aquello que te preocupaba se ilumina y, al verlo con luz plena, deja de asustarte y empieza a resolverse. Es una carta de vitalidad, de logros que se hacen visibles y de relaciones que florecen. Te invita a mostrarte tal y como eres, sin máscaras, porque justo ahora tu autenticidad es lo que atrae lo bueno.' },
  { id: 'the-wheel', name: 'La Rueda de la Fortuna', arcana: 'major', meaning: 'La Rueda de la Fortuna anuncia que un giro del destino se pone en marcha. Lo que parecía estancado vuelve a moverse, y esta vez a tu favor. Es el recordatorio de que todo es cíclico: si vienes de una mala racha, el ciclo cambia; si vienes de una buena, aprovéchala con humildad. No todo está bajo tu control, y precisamente soltar esa necesidad de controlarlo todo es lo que permite que la suerte fluya hacia ti.' },
  { id: 'strength', name: 'La Fuerza', arcana: 'major', meaning: 'La Fuerza enseña que tu verdadero poder no está en la imposición ni en el grito, sino en la calma, la paciencia y la dulzura firme. Dominas la situación desde la serenidad, no desde la lucha. Esta carta habla de coraje interior, de templar los impulsos y de gobernar tus miedos con cariño en lugar de con violencia. Tienes mucha más fortaleza de la que crees: el reto es usarla con suavidad.' },
  { id: 'the-lovers', name: 'Los Enamorados', arcana: 'major', meaning: 'Los Enamorados representan una elección importante del corazón, una encrucijada en la que debes escoger con honestidad. Más allá del amor romántico, hablan de alinear lo que haces con tus valores más profundos. Escucha lo que de verdad quieres, no lo que se espera de ti ni lo que resulta cómodo. Las decisiones tomadas desde la verdad de tu corazón, aunque cuesten, son las que después no se lamentan.' },
  { id: 'the-magician', name: 'El Mago', arcana: 'major', meaning: 'El Mago confirma que tienes ya todas las herramientas que necesitas para lograr lo que te propones; nada externo te falta, solo decidirte. Es la carta de la acción consciente, de pasar de la idea a la realidad, de manifestar con voluntad y enfoque. Te recuerda tu propio poder creador: lo que pienses, digas y hagas estos días tiene una fuerza especial. Concéntrate, da el primer paso y observa cómo lo que era un proyecto empieza a tomar forma.' },
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
        'Las cartas coinciden en un mensaje notablemente claro: estás saliendo de una etapa de duda y desgaste hacia otra de claridad y renovación. El pasado pesó, sí, pero ya cumplió su función de enseñarte; lo que viene pide menos análisis y más confianza, y sobre todo un primer paso valiente que llevas tiempo posponiendo. No necesitas tenerlo todo resuelto ni todas las respuestas antes de moverte: solo empezar, dar ese gesto concreto que tu intuición ya conoce. La baraja te recuerda que tienes las herramientas y la fuerza interior; lo único que faltaba era permitirte usarlas. Avanza con calma pero avanza: el camino se aclara al caminarlo.',
      premium_hook:
        'Una tirada de Cruz Celta de diez cartas profundizaría muchísimo más en tu situación, revelando raíces, influencias ocultas y desenlace. Disponible en Premium.',
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
      meaning: `${src.meaning} En la posición «${position}» de la tirada, esta carta cobra un matiz especial: te invita a observar precisamente este aspecto de tu situación y a comprender qué papel juega en el conjunto de la historia que las cartas están narrando sobre ti.`,
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
        'La tirada dibuja, en su conjunto, un momento de transición consciente y profunda. No estás perdido/a, aunque a veces lo sientas así: estás reorganizándote por dentro, soltando una versión vieja de ti para dejar sitio a la que viene. Las cartas que ocupan el centro de la lectura muestran con claridad que el verdadero desafío no es externo ni depende de los demás, sino de una vieja creencia que arrastras: la idea de que debes poder con todo tú solo/a, sin pedir ayuda y sin derecho a fallar. Las posiciones del pasado explican de dónde viene ese patrón; las del futuro confirman que estás justo en el punto de poder cambiarlo. Hay movimiento, hay dirección, y hay mucha más fuerza de tu lado de la que reconoces.',
      synthesis:
        'El hilo que une toda la lectura, de principio a fin, es la liberación. A lo largo de la tirada se repite el mismo mensaje desde distintos ángulos: estás soltando un peso que cargabas más por costumbre que por necesidad real, y al hacerlo descubres una energía nueva, casi olvidada. Las cartas de tu entorno señalan que las personas a tu alrededor te acompañan y te quieren bien mucho más de lo que tú percibes; tu tendencia a aislarte cuando las cosas se complican te ha hecho sentir más solo/a de lo que estás. Déjate ayudar, déjate ver. El conjunto apunta a un cierre de ciclo sano: lo que termina, termina para que algo mejor tenga sitio.',
      advice:
        'El consejo central de la tirada es claro: da el paso que vienes posponiendo, pero hazlo desde la calma y la confianza, no desde la prisa ni el miedo. No se trata de lanzarte sin pensar, sino de dejar de esperar el momento perfecto que nunca llega. Apóyate en quienes te rodean en lugar de cargarlo todo en silencio, y sé honesto/a contigo mismo/a sobre lo que de verdad quieres, aunque incomode. El desenlace que muestran las cartas finales es francamente favorable, siempre que actúes con autenticidad y sin traicionar lo que sientes. Confía: las cartas no te empujarían hacia ahí si no estuvieras preparado/a.',
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
        'Tu número rector, el 8, habla de poder personal, ambición sana y una extraordinaria capacidad de materializar lo que imaginas. No has venido a este mundo a quedarte en segundo plano, por mucho que a veces la modestia o el miedo te empujen a ello: tienes un don natural para convertir ideas en realidades tangibles y para gestionar con soltura aquello que otros consideran demasiado grande o demasiado complicado. El 8 es el número del equilibrio entre dar y recibir, entre el esfuerzo y la recompensa, y simboliza el dominio del mundo material. Las personas con este camino de vida suelen ser referentes, gestores naturales y figuras de autoridad allá donde van, aunque su gran lección sea aprender a ejercer ese poder con generosidad y no desde el miedo a perderlo.',
      purpose:
        'Tu propósito vital gira en torno al equilibrio entre lo material y lo espiritual, dos planos que el 8 está llamado a reconciliar en lugar de oponer. A lo largo de tu vida aprenderás —probablemente a través de algún revés importante— que el verdadero éxito no consiste solo en acumular logros, dinero o reconocimiento, sino en usar todo lo que consigues para construir algo que te trascienda y que beneficie también a otros. Cuando el 8 trabaja solo para sí, se vacía; cuando trabaja para un propósito mayor, se vuelve imparable. Tu misión es demostrar, con tu propio ejemplo, que se puede tener éxito sin perder el alma.',
      strengths:
        'Entre tus mayores fortalezas están la resiliencia, la visión estratégica y una determinación que, sencillamente, impone respeto. Te levantas de las caídas con una capacidad que asombra a quienes te rodean, y cuando te propones algo de verdad, conseguirlo es solo cuestión de tiempo y de constancia. Tienes un olfato natural para la organización, los negocios y el liderazgo, y los demás tienden a confiar en ti porque transmites solidez y seguridad incluso en medio del caos. Sabes ver el panorama completo sin perder de vista el detalle práctico, una combinación poco común que te convierte en alguien a quien acudir cuando hay que tomar decisiones difíciles.',
      cycle:
        'Numerológicamente, estás transitando un año personal 3: un ciclo luminoso de expresión, creatividad, comunicación y vida social. Después de un periodo más exigente y orientado al esfuerzo, el universo te pide ahora soltar un poco las riendas, comunicar lo que llevas dentro, socializar y, sobre todo, disfrutar del camino. Es un año excelente para proyectos creativos, para ampliar tu círculo, para darte a conocer y para recuperar la alegría en lo cotidiano. Di que sí a lo que te ilusione, aunque tu lado pragmático del 8 quiera control: este ciclo florece cuando te permites jugar. Cuidado con dispersarte en mil frentes; canaliza esa energía expansiva en una o dos cosas que de verdad te llenen.',
      love:
        'En el amor necesitas a alguien que admire tu fuerza y tu ambición sin sentirse jamás a tu sombra; una pareja segura de sí misma, capaz de caminar a tu lado como igual y no detrás de ti. Tu mayor reto afectivo es atreverte a mostrar vulnerabilidad: el 8 tiende a blindarse, a no pedir ayuda, a confundir control con amor. Sin embargo, bajar la guardia con quien se lo ha ganado no te resta ni un ápice de poder; al contrario, te hace cercano/a, humano/a y profundamente querible. Aprende a recibir cariño con la misma generosidad con la que lo das, y a dejar que te cuiden sin sentir que pierdes el mando.',
      advice: focus
        ? `Sobre lo que te preocupa («${focus}»), los números son claros y se alinean a tu favor: tienes mucho más control sobre la situación del que tu mente ansiosa te hace creer. El 8 te recuerda que tu poder está en la acción concreta, no en la rumiación. Define un único objetivo claro respecto a este tema y da, esta misma semana, un paso firme y tangible hacia él, por pequeño que sea. El movimiento genera claridad; la espera, solo más dudas. Confía en tu capacidad probada de materializar: ya has superado cosas más difíciles que esta.`
        : 'Confía plenamente en tu capacidad de materializar lo que te propones, pero no descuides el otro platillo de la balanza: el descanso y el disfrute. Tu energía y tu determinación son recursos valiosísimos, y como tales debes administrarlos con la misma inteligencia con la que administras todo lo demás. No tienes que demostrar tu valía agotándote; tu valor es intrínseco, no depende de tu rendimiento. Permítete delegar, celebrar tus logros antes de correr hacia el siguiente y recibir tanto como das. Ese equilibrio es, precisamente, la maestría del 8.',
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
