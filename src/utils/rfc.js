// ============================================================
//  Generador de RFC para persona física (13 caracteres)
//  Estructura:  AAAA YYMMDD HHH  →  4 letras + fecha + homoclave(3)
//    - 4 letras: salen del nombre (reglas de abajo)
//    - fecha:    año(2) mes(2) día(2) de nacimiento
//    - homoclave: 2 caracteres calculados + 1 dígito verificador
//  Nota: el RFC oficial lo asigna el SAT; este generador aplica el
//  algoritmo público, con fines académicos.
// ============================================================

// Palabras que el SAT considera inconvenientes: se cambia la 4ª letra por X
const PALABRAS_INCONVENIENTES = [
    'BUEI', 'BUEY', 'CACA', 'CACO', 'CAGA', 'CAGO', 'CAKA', 'CAKO', 'COGE', 'COGI', 'COJA', 'COJE',
    'COJI', 'COJO', 'COLA', 'CULO', 'FALO', 'FETO', 'GETA', 'GUEI', 'GUEY', 'JETA', 'JOTO', 'KACA',
    'KACO', 'KAGA', 'KAGO', 'KAKA', 'KAKO', 'KOGE', 'KOGI', 'KOJA', 'KOJE', 'KOJI', 'KOJO', 'KOLA',
    'KULO', 'LILO', 'LOCA', 'LOCO', 'LOKA', 'LOKO', 'MAME', 'MAMO', 'MEAR', 'MEAS', 'MEON', 'MIAR',
    'MION', 'MOCO', 'MOKO', 'MULA', 'MULO', 'NACA', 'NACO', 'PEDA', 'PEDO', 'PENE', 'PIPI', 'PITO',
    'POPO', 'PUTA', 'PUTO', 'QULO', 'RATA', 'ROBA', 'ROBE', 'ROBO', 'RUIN', 'SENO', 'TETA', 'VACA',
    'VAGA', 'VAGO', 'VAKA', 'VUEI', 'VUEY', 'WUEI', 'WUEY'
];

// Partículas que se ignoran en los apellidos (DE LA CRUZ → CRUZ)
const PARTICULAS = ['DA', 'DAS', 'DE', 'DEL', 'DER', 'DI', 'DIE', 'DD', 'EL', 'LA', 'LOS', 'LAS', 'LE', 'LES', 'MAC', 'MC', 'VAN', 'VON', 'Y'];

// Nombres que se saltan si la persona tiene otro nombre después
const NOMBRES_COMUNES = ['JOSE', 'J', 'J.', 'MARIA', 'MA', 'MA.'];

// Mayúsculas, sin acentos (conservando la Ñ), solo letras/números/espacio/&
function normalizar(texto) {
    return (texto || '')
        .toUpperCase()
        .replace(/Ñ/g, '#')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/#/g, 'Ñ')
        .replace(/[^A-ZÑ0-9& ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Quita partículas; si todo eran partículas, deja el texto original
function sinParticulas(texto) {
    const palabras = texto.split(' ').filter(Boolean);
    const utiles = palabras.filter((p) => !PARTICULAS.includes(p));
    return utiles.length ? utiles : palabras;
}

// La Ñ cuenta como X en las 4 letras
const letra = (c) => (c === 'Ñ' || !c ? 'X' : c);

function primeraVocalInterna(palabra) {
    const m = palabra.slice(1).match(/[AEIOU]/);
    return m ? m[0] : 'X';
}

// ---------- Paso 1: las 4 letras ----------
function obtenerLetras(nombre, paterno, materno) {
    const n = normalizar(nombre);
    const p = normalizar(paterno);
    const m = normalizar(materno);

    let palabrasNombre = sinParticulas(n);
    if (palabrasNombre.length > 1 && NOMBRES_COMUNES.includes(palabrasNombre[0])) {
        palabrasNombre = palabrasNombre.slice(1);
    }
    const nom = palabrasNombre[0] || '';
    const pat = p ? sinParticulas(p)[0] : '';
    const mat = m ? sinParticulas(m)[0] : '';

    let cuatro;
    if (pat && mat && pat.length > 2) {
        cuatro = letra(pat[0]) + primeraVocalInterna(pat) + letra(mat[0]) + letra(nom[0]);
    } else if (pat && mat) {
        // apellido paterno de 1 o 2 letras
        cuatro = letra(pat[0]) + letra(mat[0]) + letra(nom[0]) + letra(nom[1]);
    } else {
        // solo un apellido: 2 letras del apellido + 2 letras del nombre
        const unico = pat || mat;
        cuatro = letra(unico[0]) + letra(unico[1]) + letra(nom[0]) + letra(nom[1]);
    }

    if (PALABRAS_INCONVENIENTES.includes(cuatro)) {
        cuatro = cuatro.slice(0, 3) + 'X';
    }
    return cuatro;
}

// ---------- Paso 2: la fecha AAMMDD ----------
function obtenerFecha(fecha) {
    const yy = String(fecha.getFullYear()).slice(-2);
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return yy + mm + dd;
}

// ---------- Paso 3: homoclave (2 caracteres) ----------
// Valor numérico de cada carácter del nombre completo
const TABLA_NOMBRE = (() => {
    const t = { ' ': '00', '&': '10', 'Ñ': '40' };
    '0123456789'.split('').forEach((c, i) => (t[c] = String(i).padStart(2, '0')));
    'ABCDEFGHI'.split('').forEach((c, i) => (t[c] = String(11 + i)));
    'JKLMNOPQR'.split('').forEach((c, i) => (t[c] = String(21 + i)));
    'STUVWXYZ'.split('').forEach((c, i) => (t[c] = String(32 + i)));
    return t;
})();

const TABLA_HOMOCLAVE = '123456789ABCDEFGHIJKLMNPQRSTUVWXYZ'; // 34 caracteres

function obtenerHomoclave(nombre, paterno, materno) {
    const completo = normalizar([paterno, materno, nombre].filter(Boolean).join(' '));
    // Se antepone un 0 y se convierte cada carácter en 2 dígitos
    const numeros = '0' + completo.split('').map((c) => TABLA_NOMBRE[c] ?? '00').join('');

    let suma = 0;
    for (let i = 0; i < numeros.length - 1; i++) {
        suma += parseInt(numeros.substring(i, i + 2), 10) * parseInt(numeros[i + 1], 10);
    }
    const ultimos3 = suma % 1000;
    const cociente = Math.floor(ultimos3 / 34);
    const residuo = ultimos3 % 34;
    return TABLA_HOMOCLAVE[cociente] + TABLA_HOMOCLAVE[residuo];
}

// ---------- Paso 4: dígito verificador ----------
const TABLA_VERIFICADOR = (() => {
    const t = { '&': 24, ' ': 37, 'Ñ': 38 };
    '0123456789'.split('').forEach((c, i) => (t[c] = i));
    'ABCDEFGHIJKLMN'.split('').forEach((c, i) => (t[c] = 10 + i));
    'OPQRSTUVWXYZ'.split('').forEach((c, i) => (t[c] = 25 + i));
    return t;
})();

function obtenerVerificador(rfc12) {
    let suma = 0;
    for (let i = 0; i < 12; i++) {
        suma += (TABLA_VERIFICADOR[rfc12[i]] ?? 0) * (13 - i);
    }
    const residuo = suma % 11;
    if (residuo === 0) return '0';
    const digito = 11 - residuo;
    return digito === 10 ? 'A' : String(digito);
}

// ---------- Función principal ----------
export function generarRFC({ nombre, paterno, materno, fechaNacimiento }) {
    if (!nombre?.trim() || !paterno?.trim() || !(fechaNacimiento instanceof Date) || isNaN(fechaNacimiento)) {
        throw new Error('Captura nombre, apellido paterno y fecha de nacimiento.');
    }
    const base =
        obtenerLetras(nombre, paterno, materno) +
        obtenerFecha(fechaNacimiento) +
        obtenerHomoclave(nombre, paterno, materno);
    return base + obtenerVerificador(base);
}
