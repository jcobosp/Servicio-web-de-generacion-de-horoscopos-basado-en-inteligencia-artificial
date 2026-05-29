// Generador del contenido ESTÁTICO de compatibilidad gratuita entre signos.
//
// No usa IA: compone los textos a partir de la relación angular entre los dos
// signos (espejo, semisextil, sextil, cuadratura, trígono, quincuncio,
// oposición) y de los rasgos de cada signo, aplicando técnicas de horóscopo
// (efecto Forer, lectura en frío, anclaje emocional) para que el lector se
// sienta identificado. La puntuación (40-95) es coherente con el aspecto:
// trígonos/sextiles altos, cuadraturas/quincuncios bajos, espejo y oposición
// en el medio. Emite un INSERT SQL con las 78 combinaciones.
//
// Uso: node supabase/seed/gen-sign-compatibility.mjs > out.sql

const SIGNS = [
  { slug: 'aries', name: 'Aries', el: 'fuego', mod: 'cardinal', essence: 'el impulso de empezar', loves: 'con pasión inmediata y sin rodeos', strength: 'su coraje', shadow: 'su impaciencia' },
  { slug: 'tauro', name: 'Tauro', el: 'tierra', mod: 'fijo', essence: 'la calma que construye', loves: 'despacio y con los cinco sentidos', strength: 'su lealtad', shadow: 'su terquedad' },
  { slug: 'geminis', name: 'Géminis', el: 'aire', mod: 'mutable', essence: 'la curiosidad que conecta', loves: 'con juego mental y palabras', shadow: 'su dispersión', strength: 'su ingenio' },
  { slug: 'cancer', name: 'Cáncer', el: 'agua', mod: 'cardinal', essence: 'la ternura que protege', loves: 'con entrega y necesidad de nido', strength: 'su capacidad de cuidar', shadow: 'su susceptibilidad' },
  { slug: 'leo', name: 'Leo', el: 'fuego', mod: 'fijo', essence: 'el corazón que brilla', loves: 'a lo grande, con gestos memorables', strength: 'su generosidad', shadow: 'su orgullo' },
  { slug: 'virgo', name: 'Virgo', el: 'tierra', mod: 'mutable', essence: 'el detalle que cuida', loves: 'en los pequeños gestos cotidianos', strength: 'su dedicación', shadow: 'su autocrítica' },
  { slug: 'libra', name: 'Libra', el: 'aire', mod: 'cardinal', essence: 'la armonía que equilibra', loves: 'buscando belleza y equilibrio compartido', strength: 'su diplomacia', shadow: 'su indecisión' },
  { slug: 'escorpio', name: 'Escorpio', el: 'agua', mod: 'fijo', essence: 'la intensidad que transforma', loves: 'todo o nada, hasta el fondo', strength: 'su entrega total', shadow: 'sus celos' },
  { slug: 'sagitario', name: 'Sagitario', el: 'fuego', mod: 'mutable', essence: 'la aventura que expande', loves: 'con libertad y entusiasmo', strength: 'su optimismo', shadow: 'su inquietud' },
  { slug: 'capricornio', name: 'Capricornio', el: 'tierra', mod: 'cardinal', essence: 'la ambición que perdura', loves: 'con compromiso serio y a largo plazo', strength: 'su responsabilidad', shadow: 'su aparente frialdad' },
  { slug: 'acuario', name: 'Acuario', el: 'aire', mod: 'fijo', essence: 'la libertad que reinventa', loves: 'desde la amistad y el espacio propio', strength: 'su originalidad', shadow: 'su distancia emocional' },
  { slug: 'piscis', name: 'Piscis', el: 'agua', mod: 'mutable', essence: 'el sueño que se funde', loves: 'fundiéndose por completo en el otro', strength: 'su sensibilidad', shadow: 'su tendencia a evadirse' },
];

// Distancia angular entre dos signos: 0..6 (0 = mismo signo, 6 = opuestos).
function distance(i, j) {
  const d = Math.abs(i - j);
  return Math.min(d, 12 - d);
}

function elementMod(a, b) {
  if (a === b) return 4;
  const compat =
    (a === 'fuego' && b === 'aire') || (a === 'aire' && b === 'fuego') ||
    (a === 'tierra' && b === 'agua') || (a === 'agua' && b === 'tierra');
  return compat ? 2 : -3;
}

// Jitter determinista (-3..+3) para que haya variedad dentro de cada aspecto.
function jitter(key) {
  let h = 0;
  for (let k = 0; k < key.length; k++) h = (h * 31 + key.charCodeAt(k)) >>> 0;
  return (h % 7) - 3;
}

const BASE = { 0: 78, 1: 60, 2: 85, 3: 47, 4: 90, 5: 49, 6: 72 };

function elementPhrase(A, B) {
  if (A.el === B.el) return `compartís el elemento ${A.el}`;
  const compat =
    (A.el === 'fuego' && B.el === 'aire') || (A.el === 'aire' && B.el === 'fuego') ||
    (A.el === 'tierra' && B.el === 'agua') || (A.el === 'agua' && B.el === 'tierra');
  return compat
    ? `vuestros elementos (${A.el} y ${B.el}) se alimentan`
    : `mezcláis ${A.el} y ${B.el}, dos formas muy distintas de sentir`;
}

// --- Plantillas por aspecto -------------------------------------------------
// Cada una recibe los dos signos y devuelve el bloque de contenido.

function mirror(A) {
  // Mismo signo: A === B.
  return {
    headline: `Dos ${A.name}: mirándose en el mismo espejo`,
    overview: `Cuando dos ${A.name} se encuentran, hay un reconocimiento inmediato: el otro entiende sin que tengas que explicarte, porque comparte ${A.essence}. Es una conexión cómoda y familiar, casi como mirarse al espejo. El reto es que ese espejo también os devuelve vuestros defectos amplificados, y a veces cuesta no chocar justo donde más os parecéis.`,
    love: `En el amor os sentís en casa. Ambos amáis ${A.loves}, así que rara vez tenéis que fingir ser quien no sois. Esa sintonía es un regalo, pero ojo: si los dos esperáis que sea el otro quien dé el primer paso, podéis quedaros esperando. Turnaos en cuidar la chispa.`,
    passion: `La atracción nace de la complicidad: deseáis lo mismo y de la misma forma. Hay entrega y entendimiento, aunque también el riesgo de caer en la rutina por exceso de confianza. Atrévete a sorprender; con otro ${A.name} sabes mejor que nadie qué le enciende.`,
    communication: `Os entendéis con medias palabras, pero compartís también ${A.shadow}, y eso puede convertir una charla en un pulso. Cuando los dos tiráis del mismo lado sois imparables; cuando os empeñáis en tener razón, nadie cede. Escuchar de verdad será vuestra asignatura.`,
    strengths: `Entendimiento instantáneo, valores compartidos y ${A.strength} por partida doble. Pocas parejas se sienten tan "vistas" desde el primer día.`,
    challenges: `Amplificáis vuestros defectos y competís en lo que más os define. Sin espacio propio, la relación puede volverse demasiado intensa o demasiado plana.`,
    advice: `Recordad que parecerse no es lo mismo que completarse. Cultivad pequeñas diferencias y daos aire: lo que os une ya lo tenéis ganado.`,
  };
}

function semisextile(A, B) {
  return {
    headline: `${A.name} y ${B.name}: vecinos que aprenden a destiempo`,
    overview: `${A.name} y ${B.name} sois vecinos en la rueda del zodiaco, y eso se nota: os atraéis por lo que no entendéis del otro. ${cap(A.essence)} se cruza con ${B.essence}, y ${elementPhrase(A, B)}. No es un flechazo evidente, sino una relación que crece a fuego lento, a base de aprender el ritmo ajeno.`,
    love: `El amor aquí pide traducción. ${A.name} ama ${A.loves} y ${B.name}, en cambio, ${B.loves}. Al principio podéis sentir que habláis idiomas distintos, pero si tenéis paciencia descubriréis que cada uno aporta justo lo que al otro le falta. La ternura se construye, no viene de fábrica.`,
    passion: `La química tarda en arrancar, pero cuando lo hace tiene el morbo de lo prohibido y lo desconocido. Os intriga eso que el otro hace y vosotros nunca haríais. Mantened viva esa curiosidad: es vuestro mejor afrodisíaco.`,
    communication: `Pensáis a velocidades distintas, y ahí están la gracia y el roce. ${A.name} aporta ${A.strength} y ${B.name}, ${B.strength}. Si lo tomáis como un intercambio en vez de como una corrección, cada conversación os hará más sabios.`,
    strengths: `Os complementáis en lo cotidiano y os sacáis de vuestra zona de confort. Juntos sois más completos de lo que erais por separado.`,
    challenges: `Los ritmos y las prioridades chocan. Si no traducís lo que necesitáis, ${A.shadow} y ${B.shadow} pueden agrandar la distancia.`,
    advice: `Tratad las diferencias como un mapa, no como un muro. Preguntad más y supondréis menos: ahí está vuestra magia.`,
  };
}

function sextile(A, B) {
  return {
    headline: `${A.name} y ${B.name}: cómplices con química fácil`,
    overview: `Lo vuestro fluye casi sin esfuerzo. ${A.name} y ${B.name} os lleváis como si fuerais amigos de toda la vida, porque ${elementPhrase(A, B)}. Hay risa, estímulo y unas ganas naturales de planear cosas juntos. Es una de esas conexiones que empiezan ligeras y, sin daros cuenta, se vuelven importantes.`,
    love: `En el amor os hacéis la vida fácil. ${cap(A.essence)} se lleva de maravilla con ${B.essence}, y eso se traduce en una relación alegre, sin tantos dramas. ${A.name} ama ${A.loves} y ${B.name} ${B.loves}: dos estilos que, lejos de chocar, se enriquecen.`,
    passion: `La atracción es juguetona y cómplice. Os deseáis desde la confianza y la diversión, sin presiones. No es el incendio más intenso del zodiaco, pero sí uno de los más sostenibles: la chispa se reaviva con una conversación o una escapada improvisada.`,
    communication: `Aquí está vuestro punto fuerte: os entendéis hablando. ${A.name} pone ${A.strength}, ${B.name} pone ${B.strength}, y juntos resolvéis casi todo charlando. Cuidad de no quedaros solo en la superficie ligera: también merecéis las conversaciones hondas.`,
    strengths: `Amistad, humor y proyectos compartidos. Sois esa pareja que además es equipo, y eso se nota en lo bien que respiráis juntos.`,
    challenges: `Tanta facilidad puede haceros evitar los temas incómodos. Si nunca os enfadáis, quizá es que no os estáis diciendo todo.`,
    advice: `No deis por sentado lo fácil. Regad la complicidad con planes nuevos y con verdades dichas a tiempo: tenéis una base envidiable.`,
  };
}

function square(A, B) {
  return {
    headline: `${A.name} y ${B.name}: chispas que encienden y queman`,
    overview: `Aquí saltan chispas, para lo bueno y para lo difícil. ${A.name} y ${B.name} os atraéis con fuerza magnética, pero ${elementPhrase(A, B)} de maneras que chocan. ${cap(A.essence)} tensa con ${B.essence}: o aprendéis a usar esa fricción como motor, o acabáis agotándoos en el mismo punto una y otra vez.`,
    love: `El amor entre vosotros es intenso y desafiante. Os deseáis precisamente por lo que os diferencia, pero ese mismo contraste enciende discusiones. ${A.name} ama ${A.loves}; ${B.name}, en cambio, ${B.loves}. Funcionará si dejáis de querer cambiar al otro y empezáis a admirarlo.`,
    passion: `En lo físico hay fuego del bueno: la tensión se traduce en una atracción casi adictiva. El problema llega cuando la pasión de la cama se cuela en las discusiones del salón. Canalizad esa electricidad antes de que os queme.`,
    communication: `Es vuestro gran reto. ${cap(A.shadow)} se enreda con ${B.shadow} y una conversación tonta puede escalar en segundos. Pero si aprendéis a parar a tiempo, ${A.strength} y ${B.strength} pueden convertir cada choque en un avance real.`,
    strengths: `Os retáis, os despertáis y no os aburrís jamás. Si lo trabajáis, esta tensión os hace crecer más que cualquier relación cómoda.`,
    challenges: `El orgullo, los reproches y la lucha por tener razón. Sin autocontrol, la atracción se convierte en desgaste.`,
    advice: `Elegid las batallas y bajad las armas primero. Lo vuestro no es incompatible: es exigente. Y a veces lo exigente es justo lo que transforma.`,
  };
}

function trine(A, B) {
  return {
    headline: `${A.name} y ${B.name}: almas en la misma frecuencia`,
    overview: `Hay un entendimiento que reconocéis al instante: ${A.name} y ${B.name} compartís el elemento ${A.el}, y eso crea una corriente cálida desde el primer minuto. No necesitáis explicaros; os captáis en ese lenguaje silencioso que pocos entienden. Donde otras parejas sudan, vosotros sentís que casi todo fluye solo.`,
    love: `En el amor parecéis llevaros de toda la vida. ${cap(A.essence)} y ${B.essence} laten al mismo compás, y eso da una calma que reconforta de verdad. ${A.name} ama ${A.loves} y ${B.name} ${B.loves}, y en lugar de chocar, encajáis con una naturalidad que asusta.`,
    passion: `La química surge sin forzarla. No es un incendio repentino, sino una hoguera constante que abriga. Os deseáis desde la confianza, así que la pasión prende más despacio pero dura muchísimo más. El cuerpo sigue, sin esfuerzo, lo que el corazón ya sabe.`,
    communication: `Os entendéis casi sin palabras. ${cap(A.strength)} se suma a ${B.strength} y juntos tomáis decisiones con una fluidez envidiable. El único peligro es la pereza: tan a gusto estáis que podríais dejar de esforzaros. No deis por hecho lo que tenéis.`,
    strengths: `Armonía, confianza y valores compartidos. Sois esa pareja que da paz, la que otros miran pensando "así debería ser".`,
    challenges: `Tanta comodidad puede volverse acomodo. Sin metas nuevas, la relación corre el riesgo de apalancarse en lo conseguido.`,
    advice: `Lo bueno también se riega. Poneos retos juntos y no confundáis calma con dejadez: tenéis un tesoro, cuidadlo.`,
  };
}

function quincunx(A, B) {
  return {
    headline: `${A.name} y ${B.name}: atracción que pide ajuste constante`,
    overview: `${A.name} y ${B.name} sois piezas de puzles distintos que, aun así, se buscan. ${cap(A.essence)} y ${B.essence} casi no tienen puntos en común, y ${elementPhrase(A, B)}. Os fascináis y os desconcertáis a partes iguales: lo vuestro funciona solo si aceptáis que tendréis que reajustaros una y otra vez.`,
    love: `El amor aquí es un aprendizaje continuo. Justo cuando crees entender a ${B.name}, te sorprende; y a ${B.name} le pasa igual contigo. ${A.name} ama ${A.loves} y ${B.name} ${B.loves}: estilos tan diferentes que pedís un esfuerzo de traducción diario. Pero esa rareza también engancha.`,
    passion: `La química es extraña y magnética: os atrae lo que no comprendéis del otro. Puede haber desencuentros en el deseo, momentos de "no estamos sincronizados". Hablarlo sin pudor es lo único que mantiene viva la llama.`,
    communication: `Aquí está el trabajo. Pensáis y sentís de formas casi opuestas, así que los malentendidos son fáciles. ${cap(A.shadow)} y ${B.shadow} no ayudan. Pero si os armáis de paciencia, ${A.strength} y ${B.strength} construyen un puente que pocos saben tender.`,
    strengths: `Os obligáis a creceros y a mirar el mundo con otros ojos. Nadie os enseñará tanto sobre vosotros mismos como el otro.`,
    challenges: `La sensación de ir a destiempo y de no terminar de encajar. Sin aceptación, el cansancio puede más que la fascinación.`,
    advice: `Dejad de intentar encajar a la fuerza. Aceptad la rareza como parte del encanto y negociad lo concreto: ahí ganáis.`,
  };
}

function opposition(A, B) {
  return {
    headline: `${A.name} y ${B.name}: polos opuestos que se imantan`,
    overview: `Sois las dos caras de una misma moneda. ${A.name} y ${B.name} estáis enfrentados en la rueda del zodiaco, y por eso os atraéis como imanes: cada uno tiene justo lo que al otro le falta. ${cap(A.essence)} frente a ${B.essence}. Juntos podéis formar un equilibrio perfecto… o un tira y afloja agotador.`,
    love: `El amor entre opuestos es de los más intensos que existen. Os complementáis tan bien que parecéis encajar como piezas hechas la una para la otra. ${A.name} ama ${A.loves} y ${B.name} ${B.loves}: dos polos que, bien llevados, se equilibran y se calman mutuamente.`,
    passion: `La atracción es pura electricidad: lo opuesto siempre seduce. En lo físico os buscáis con una intensidad magnética que cuesta explicar. Mientras mantengáis ese respeto por la diferencia, el deseo se renueva solo.`,
    communication: `El reto es no tirar cada uno hacia su extremo. ${cap(A.shadow)} y ${B.shadow} pueden convertir lo complementario en una batalla de posturas. Pero si os escucháis, ${A.strength} y ${B.strength} se equilibran y os hacen, juntos, mucho más completos.`,
    strengths: `Os completáis como nadie y os equilibráis en lo que cada uno exagera. La química es innegable y duradera si hay respeto.`,
    challenges: `La tendencia a polarizar: cuanto más tira uno, más tira el otro. Sin punto medio, lo magnético se vuelve cansino.`,
    advice: `Buscad el centro, no la victoria. Vuestra fuerza está en el equilibrio: lo que en el otro te irrita es, en el fondo, lo que viniste a aprender.`,
  };
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TEMPLATES = {
  0: (A) => mirror(A),
  1: (A, B) => semisextile(A, B),
  2: (A, B) => sextile(A, B),
  3: (A, B) => square(A, B),
  4: (A, B) => trine(A, B),
  5: (A, B) => quincunx(A, B),
  6: (A, B) => opposition(A, B),
};

export function buildRows() {
  const rows = [];
  for (let i = 0; i < 12; i++) {
    for (let j = i; j < 12; j++) {
      const A = SIGNS[i];
      const B = SIGNS[j];
      const d = distance(i, j);
      const content = TEMPLATES[d](A, B);
      let score = BASE[d] + elementMod(A.el, B.el) + jitter(`${A.slug}-${B.slug}`);
      score = Math.max(40, Math.min(95, score));
      rows.push({ a: A.slug, b: B.slug, score, content });
    }
  }
  return rows;
}

// Al ejecutarse directamente (no al importarse), imprime el SQL del seed.
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('gen-sign-compatibility.mjs')) {
  const rows = buildRows();
  const values = rows
    .map(
      (r) =>
        `  ('${r.a}', '${r.b}', ${r.score}, $j$${JSON.stringify(r.content)}$j$::jsonb)`,
    )
    .join(',\n');
  const sql = `-- 0016_seed_sign_compatibility.sql (generado por gen-sign-compatibility.mjs)
-- ${rows.length} combinaciones de compatibilidad gratuita entre signos.
insert into public.sign_compatibility (sign_a, sign_b, score, content) values
${values}
on conflict (sign_a, sign_b) do update
  set score = excluded.score, content = excluded.content;
`;
  console.log(sql);
}
