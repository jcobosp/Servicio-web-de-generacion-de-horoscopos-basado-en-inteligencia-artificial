// gen-numerology.mjs — Genera el seed estático de la numerología GRATUITA.
//
// Produce `0020_seed_numerology.sql` con una fila por (categoría, número):
//   - life_path: 1-9, 11, 22, 33  (número del camino de vida)
//   - personal_year: 1-9          (año personal)
// El contenido (headline, essence, love, work, advice) se teje con técnicas de
// validación subjetiva (efecto Forer) y lectura en frío, a partir de los temas
// propios de cada número. Determinista y reproducible.
//
// Uso:  node supabase/seed/gen-numerology.mjs
// Luego aplicar el SQL resultante como migración 0020.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Temas centrales de cada número del CAMINO DE VIDA. */
const LIFE_PATH = {
  1: {
    title: 'El Líder',
    keyword: 'independencia',
    essence:
      'Has venido a abrir camino. Dentro de ti late una necesidad real de hacer las cosas a tu manera, y aunque a veces dudas, casi siempre terminas tomando la iniciativa que otros no se atreven a tomar. Tu reto es liderar sin endurecerte.',
    love: 'En el amor necesitas a alguien que admire tu fuerza sin querer apagarla. Te cuesta pedir ayuda, pero cuando bajas la guardia, amas con una lealtad rara.',
    work: 'Brillas cuando diriges, emprendes o trabajas con autonomía. Las jerarquías rígidas te ahogan; el espacio para decidir te enciende.',
    advice: 'Esta semana, da tú el primer paso en eso que llevas tiempo posponiendo. No esperes el permiso de nadie.',
  },
  2: {
    title: 'El Mediador',
    keyword: 'sensibilidad',
    essence:
      'Percibes lo que otros no dicen. Tu don es unir, suavizar, encontrar el punto medio donde los demás solo ven conflicto. A veces te entregas tanto que te olvidas de ti: ahí está tu aprendizaje, poner límites sin dejar de ser amable.',
    love: 'El amor es tu terreno natural. Buscas profundidad y reciprocidad, y sufres cuando das más de lo que recibes. Mereces a alguien que también sepa cuidarte.',
    work: 'Funcionas mejor en equipo que en solitario. La diplomacia, el acompañamiento y los detalles son tu sello.',
    advice: 'Antes de ceder otra vez, pregúntate qué necesitas tú. Tu paz también cuenta.',
  },
  3: {
    title: 'El Comunicador',
    keyword: 'expresión',
    essence:
      'Llevas dentro una chispa que necesita salir: con palabras, color, humor o arte. Cuando te expresas, contagias. Pero cuando te callas para no molestar, esa misma energía se vuelve ansiedad. Tu camino es crear sin miedo al juicio.',
    love: 'Te enamora quien te hace reír y te entiende sin explicaciones. Necesitas chispa; la rutina sin juego te apaga.',
    work: 'Comunicación, creatividad, enseñanza, escena: cualquier lugar donde tu voz importe. Lo gris no es para ti.',
    advice: 'Comparte esa idea o ese mensaje que estás guardando. El mundo necesita oírlo más de lo que crees.',
  },
  4: {
    title: 'El Constructor',
    keyword: 'estabilidad',
    essence:
      'Eres de los que construyen ladrillo a ladrillo lo que otros sueñan en el aire. La constancia, el orden y la palabra cumplida son tu firma. Tu desafío es no volverte tan rígido que te pierdas la espontaneidad de la vida.',
    love: 'Buscas seguridad y compromiso de verdad. Tardas en abrirte, pero cuando lo haces, eres un refugio. La estabilidad es tu forma de decir "te quiero".',
    work: 'Destacas en todo lo que exige método, paciencia y disciplina. Eres la base sobre la que otros se apoyan.',
    advice: 'Permítete una pausa sin sentirte culpable. Descansar también es parte de construir.',
  },
  5: {
    title: 'El Aventurero',
    keyword: 'libertad',
    essence:
      'Naciste para moverte, probar y cambiar. La libertad no es un capricho para ti, es oxígeno. Te aburres rápido y eso te ha hecho versátil como pocos. Tu lección es encontrar compromiso sin sentir que pierdes tus alas.',
    love: 'Necesitas a alguien que camine a tu lado sin atarte. La pasión te atrae; la rutina asfixiante te hace huir.',
    work: 'Lo dinámico, lo variado, lo que implique viajar, vender o reinventarse: ahí floreces. Un trabajo monótono te apaga.',
    advice: 'Canaliza tu inquietud en algo nuevo esta semana. Mejor cambio elegido que cambio impuesto.',
  },
  6: {
    title: 'El Protector',
    keyword: 'responsabilidad',
    essence:
      'Tu corazón se mueve por cuidar. Eres el pilar al que todos acuden, el que sostiene a la familia y a los amigos. Tan generoso que a veces cargas con lo que no te toca. Aprender a cuidarte tanto como cuidas es tu gran reto.',
    love: 'El amor y el hogar son el centro de tu vida. Entregado y leal, das mucho; cuida no convertir el amor en sacrificio.',
    work: 'Sirves de maravilla en todo lo que implique cuidar, sanar, enseñar o crear belleza y armonía.',
    advice: 'Hoy haz algo solo para ti. Llenar tu copa no es egoísmo, es lo que te permite seguir dando.',
  },
  7: {
    title: 'El Sabio',
    keyword: 'introspección',
    essence:
      'Vives con un pie en el mundo y otro en tu interior. Necesitas entender el porqué de las cosas, y eso te hace profundo, intuitivo, a veces solitario. No encajas en lo superficial. Tu camino es confiar en tu sabiduría sin aislarte del afecto.',
    love: 'Te cuesta abrirte, pero buscas una conexión casi espiritual. Necesitas tu espacio; quien lo respete, ganará tu mundo entero.',
    work: 'Investigación, análisis, espiritualidad, todo lo que exija pensar hondo. Lo trivial te agota.',
    advice: 'Confía en esa corazonada que llevas días sintiendo. Tu intuición rara vez se equivoca.',
  },
  8: {
    title: 'El Realizador',
    keyword: 'poder',
    essence:
      'Tienes una ambición sana que no todos comprenden: quieres lograr, prosperar, dejar huella material. Sabes de esfuerzo y de remontar. Tu aprendizaje es recordar que el éxito sin sentido se vacía, y que el dinero es medio, no fin.',
    love: 'Proteges y provees a quien amas. Buscas a alguien a tu altura; cuida que la ambición no te robe tiempo de afecto.',
    work: 'Negocios, finanzas, dirección, grandes metas. Naciste para gestionar recursos y materializar proyectos.',
    advice: 'Define qué significa el éxito para ti, no para los demás. Persigue eso.',
  },
  9: {
    title: 'El Humanista',
    keyword: 'compasión',
    essence:
      'Sientes el dolor del mundo como propio y algo en ti quiere dejarlo un poco mejor. Eres generoso, idealista, de alma vieja. Tu reto es soltar lo que ya cumplió su ciclo y no agotarte salvando a todos menos a ti.',
    love: 'Amas de forma amplia y desprendida. Te atraen las almas heridas; cuida no confundir amor con rescate.',
    work: 'Causas, arte, ayuda, enseñanza: todo lo que trascienda lo personal. Necesitas sentir que tu trabajo importa.',
    advice: 'Suelta algo que ya no te corresponde sostener. Cerrar un ciclo te abrirá espacio para lo nuevo.',
  },
  11: {
    title: 'El Inspirador',
    keyword: 'intuición',
    essence:
      'Eres un número maestro: vibras más alto y más sensible que la media. Tu intuición roza lo visionario y, cuando confías en ella, inspiras a quien te rodea. El reto es sostener esa intensidad sin que la ansiedad o la duda te frenen.',
    love: 'Sientes el amor a flor de piel. Buscas una conexión casi mágica; cuando la encuentras, te entregas por completo.',
    work: 'Liderazgo espiritual, arte, enseñanza, todo lo que ilumine a otros. Tu visión adelantada es tu mayor talento.',
    advice: 'No minimices tu sensibilidad: es tu don, no tu defecto. Confía en lo que percibes.',
  },
  22: {
    title: 'El Gran Constructor',
    keyword: 'maestría',
    essence:
      'Llevas el número del constructor maestro: la capacidad rara de convertir grandes sueños en realidades concretas. Combinas visión e ejecución como pocos. Tu desafío es creerte capaz de lo grande sin que el miedo te haga conformarte con poco.',
    love: 'Buscas un vínculo sólido y con propósito compartido. Cuando confías, construyes un proyecto de vida entero con la otra persona.',
    work: 'Grandes proyectos, empresas, obras que dejen legado. Tienes el poder de materializar lo que otros solo imaginan.',
    advice: 'Piensa en grande esta semana. Tu techo está mucho más alto de lo que te permites soñar.',
  },
  33: {
    title: 'El Maestro del Amor',
    keyword: 'servicio',
    essence:
      'Tuyo es el número más elevado: el del servicio amoroso y la sanación. Tienes una capacidad enorme de dar, guiar y consolar. El reto es servir desde la plenitud y no desde el sacrificio, y recordar que tú también mereces ser sostenido.',
    love: 'Amas con una hondura poco común. Tu entrega sana; cuida no perderte del todo en el otro.',
    work: 'Enseñanza, sanación, acompañamiento, todo lo que eleve a los demás. Tu presencia ya es un regalo.',
    advice: 'Da desde lo que te sobra, no desde lo que te falta. Cuídate para poder cuidar.',
  },
};

/** Temas centrales de cada AÑO PERSONAL (ciclo de 9 años). */
const PERSONAL_YEAR = {
  1: {
    title: 'Año de nuevos comienzos',
    headline: 'Empieza un ciclo nuevo: planta hoy lo que querrás cosechar.',
    essence:
      'Arranca para ti un ciclo de nueve años. Es tiempo de sembrar, decidir y empezar de cero en lo que importa. Puede que sientas un impulso de cambiar de rumbo: hazle caso. Lo que inicies este año marcará la próxima etapa de tu vida.',
    love: 'Buen momento para abrir el corazón a algo nuevo o reescribir las reglas de lo que ya tienes. Toma tú la iniciativa.',
    work: 'Año ideal para emprender, proponer y plantar semillas profesionales. No esperes a estar listo del todo: empieza.',
    advice: 'Da el primer paso de eso que llevas tiempo imaginando. La energía del año te respalda.',
  },
  2: {
    title: 'Año de paciencia y vínculos',
    headline: 'Lo sembrado madura: cultiva relaciones y deja que el tiempo trabaje.',
    essence:
      'Tras el empuje del año pasado, toca calma. Es un año de relaciones, acuerdos y paciencia, donde forzar las cosas las rompe y esperar las madura. Cuida los vínculos: este ciclo se construye más desde el "nosotros" que desde el "yo".',
    love: 'Las relaciones cobran protagonismo. Año fértil para profundizar, comprometerse o sanar lo que estaba en pausa.',
    work: 'Coopera, negocia, teje alianzas. Los frutos llegan por colaboración, no por imposición.',
    advice: 'Ten paciencia con lo que aún no cuaja. Lo que es para ti está madurando bajo la superficie.',
  },
  3: {
    title: 'Año de expansión y disfrute',
    headline: 'Se abre la vida social y creativa: exprésate y disfruta.',
    essence:
      'Llega un año luminoso, social y creativo. Apetece comunicar, disfrutar, ampliar tu círculo y mostrarte al mundo. La energía juega a tu favor para brillar; el único riesgo es dispersarte. Canaliza el entusiasmo y vivirás un año memorable.',
    love: 'Año magnético: atraes y te dejas atraer. Ideal para conocer gente o reavivar la chispa con quien ya está.',
    work: 'Tu creatividad y tu palabra abren puertas. Buen momento para proyectos visibles y para darte a conocer.',
    advice: 'Comparte tu talento sin esconderte. Este año premia a quien se atreve a expresarse.',
  },
  4: {
    title: 'Año de trabajo y cimientos',
    headline: 'Toca arremangarse: construye las bases de lo que viene.',
    essence:
      'Año de esfuerzo y orden. No es el más vistoso, pero sí uno de los más importantes: lo que construyas ahora con disciplina sostendrá los próximos años. Pon estructura, cierra cabos sueltos y cuida tu salud y tus finanzas.',
    love: 'El amor se demuestra con hechos y constancia más que con fuegos artificiales. Construye sobre lo real.',
    work: 'Año de productividad y cimientos. El trabajo duro de hoy se traduce en estabilidad mañana.',
    advice: 'No te frustres si todo va más lento: estás poniendo los pilares. Sé constante.',
  },
  5: {
    title: 'Año de cambio y libertad',
    headline: 'Llega el movimiento: ábrete a lo inesperado.',
    essence:
      'Un año de cambios, oportunidades y libertad. Las cosas se mueven, aparecen opciones nuevas y apetece romper la rutina. Es tiempo de flexibilidad y aventura; lo rígido se tambalea para dejar paso a algo más vivo. Suelta el control y fluye.',
    love: 'Año de pasión y novedad. Puede llegar alguien que te remueva o una nueva etapa con tu pareja. Evita la rutina.',
    work: 'Cambios, viajes, oportunidades inesperadas. Di sí a lo que expanda tu mundo.',
    advice: 'No temas al cambio: este año es tu aliado para reinventarte. Atrévete.',
  },
  6: {
    title: 'Año de amor y hogar',
    headline: 'El corazón y la familia toman el centro de tu vida.',
    essence:
      'Año cálido, centrado en el amor, el hogar y la responsabilidad afectiva. Las relaciones, la familia y tu espacio piden atención y cuidado. Es un buen ciclo para comprometerte, formar hogar o sanar lazos. Da, pero no te olvides de recibir.',
    love: 'Uno de los mejores años para el amor: compromiso, convivencia, boda o reconciliación. El corazón florece.',
    work: 'Brillas en lo que implique cuidar, crear armonía o servir a otros. El ambiente humano importa más que nunca.',
    advice: 'Cuida tus vínculos, pero pon límites sanos. Amar también es no cargar con todo.',
  },
  7: {
    title: 'Año de introspección',
    headline: 'Tiempo de mirar hacia dentro y entender.',
    essence:
      'Año más interior y reflexivo. La vida te invita a parar, estudiar, sanar y reencontrarte contigo. Puede que apetezca menos ruido y más soledad elegida: no es tristeza, es recogimiento. Lo que comprendas este año te transformará por dentro.',
    love: 'Año para la calidad, no la cantidad. Profundizas en pareja o sanas heridas; quien te acompañe debe respetar tu espacio.',
    work: 'Buen momento para formarte, especializarte y replantear tu rumbo desde dentro. Menos prisa, más profundidad.',
    advice: 'Date permiso para parar y escucharte. Las respuestas que buscas están en tu silencio.',
  },
  8: {
    title: 'Año de cosecha y poder',
    headline: 'Llega la recompensa: año de logros y abundancia.',
    essence:
      'Año de cosecha material y reconocimiento. El esfuerzo de los ciclos previos rinde fruto: dinero, ascensos, metas que por fin se concretan. Es tiempo de poder personal y ambición sana. Gestiona bien lo que llega y no temas ocupar tu lugar.',
    love: 'El amor se beneficia de tu seguridad. Cuida dedicar tiempo a quien quieres entre tanto logro.',
    work: 'Año fuerte para el dinero y la carrera: cierres de negocio, ascensos, reconocimiento. Reclama lo que mereces.',
    advice: 'Atrévete a pensar en grande con tus finanzas y metas. Este año premia la ambición.',
  },
  9: {
    title: 'Año de cierre y transformación',
    headline: 'Se cierra un ciclo de nueve años: suelta para renacer.',
    essence:
      'Año de finales y de soltar. Lo que ya cumplió su función se despide para dejar sitio a lo nuevo que llegará el próximo ciclo. Puede haber nostalgia, pero también una enorme liberación. Cierra capítulos con gratitud: estás haciendo limpieza para renacer.',
    love: 'Año de soltar lo que no suma y honrar lo que sí. Lo auténtico se queda; lo gastado se va en paz.',
    work: 'Buen momento para terminar proyectos, cerrar etapas y vaciar la mochila profesional. No empieces grandes cosas todavía.',
    advice: 'Suelta con gratitud lo que termina. El año que viene empiezas de cero: hazle sitio.',
  },
};

function esc(s) {
  return s.replace(/'/g, "''");
}

function rowSql(category, number, content) {
  const json = esc(JSON.stringify(content));
  return `  ('${category}', ${number}, '${json}'::jsonb)`;
}

const rows = [];

for (const [num, t] of Object.entries(LIFE_PATH)) {
  rows.push(
    rowSql('life_path', Number(num), {
      headline: `${num} · ${t.title}`,
      tagline: `Tu vida gira en torno a una palabra: ${t.keyword}.`,
      essence: t.essence,
      love: t.love,
      work: t.work,
      advice: t.advice,
    }),
  );
}

for (const [num, t] of Object.entries(PERSONAL_YEAR)) {
  rows.push(
    rowSql('personal_year', Number(num), {
      headline: t.headline,
      essence: t.essence,
      love: t.love,
      work: t.work,
      advice: t.advice,
    }),
  );
}

const sql = `-- 0020_seed_numerology.sql  (generado por gen-numerology.mjs — no editar a mano)
-- Significados estáticos de la numerología gratuita: camino de vida + año personal.

insert into public.numerology_meanings (category, number, content) values
${rows.join(',\n')}
on conflict (category, number) do update set content = excluded.content;
`;

const out = join(__dirname, '..', 'migrations', '0020_seed_numerology.sql');
writeFileSync(out, sql, 'utf8');
console.log(`Escrito ${out} con ${rows.length} filas.`);
