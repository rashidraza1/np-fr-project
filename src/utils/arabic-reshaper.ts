
/**
 * A very minimal Arabic reshaper to handle joined forms in PDF.
 * This is a simplified version for common characters.
 */

const mapping: { [key: string]: [string, string, string, string] } = {
    // Unicode: [Isolated, End, Middle, Initial]
    '\u0627': ['\uFE8D', '\uFE8E', '\uFE8E', '\uFE8D'], // Alif
    '\u0628': ['\uFE8F', '\uFE90', '\uFE92', '\uFE91'], // Ba
    '\u062A': ['\uFE95', '\uFE96', '\uFE98', '\uFE97'], // Ta
    '\u062B': ['\uFE99', '\uFE9A', '\uFE9C', '\uFE9B'], // Tha
    '\u062C': ['\uFE9D', '\uFE9E', '\uFEA0', '\uFE9F'], // Jim
    '\u062D': ['\uFEA1', '\uFEA2', '\uFEA4', '\uFEA3'], // Hha
    '\u062E': ['\uFEA5', '\uFEA6', '\uFEA8', '\uFEA7'], // Kha
    '\u062F': ['\uFEA9', '\uFEAA', '\uFEAA', '\uFEA9'], // Dal
    '\u0630': ['\uFEAB', '\uFEAC', '\uFEAC', '\uFEAB'], // Thal
    '\u0631': ['\uFEAD', '\uFEAE', '\uFEAE', '\uFEAD'], // Ra
    '\u0632': ['\uFEAF', '\uFEB0', '\uFEB0', '\uFEAF'], // Zayn
    '\u0633': ['\uFEB1', '\uFEB2', '\uFEB4', '\uFEB3'], // Sin
    '\u0634': ['\uFEB5', '\uFEB6', '\uFEB8', '\uFEB7'], // Shin
    '\u0635': ['\uFEB9', '\uFEBA', '\uFEBC', '\uFEBB'], // Sad
    '\u0636': ['\uFEBD', '\uFEBE', '\uFEC0', '\uFEBF'], // Dad
    '\u0637': ['\uFEC1', '\uFEC2', '\uFEC4', '\uFEC3'], // Tah
    '\u0638': ['\uFEC5', '\uFEC6', '\uFEC8', '\uFEC7'], // Zah
    '\u0639': ['\uFEC9', '\uFECA', '\uFECC', '\uFECB'], // Ain
    '\u063A': ['\uFECD', '\uFECE', '\uFED0', '\uFECF'], // Ghain
    '\u0641': ['\uFED1', '\uFED2', '\uFED4', '\uFED3'], // Fa
    '\u0642': ['\uFED5', '\uFED6', '\uFED8', '\uFED7'], // Qaf
    '\u0643': ['\uFED9', '\uFEDA', '\uFEDC', '\uFEDB'], // Kaf
    '\u0644': ['\uFEDD', '\uFEDE', '\uFEE0', '\uFEDF'], // Lam
    '\u0645': ['\uFEE1', '\uFEE2', '\uFEE4', '\uFEE3'], // Mim
    '\u0646': ['\uFEE5', '\uFEE6', '\uFEE8', '\uFEE7'], // Nun
    '\u0647': ['\uFEE9', '\uFEEA', '\uFEEC', '\uFEEB'], // Ha
    '\u0648': ['\uFEED', '\uFEEE', '\uFEEE', '\uFEED'], // Waw
    '\u064A': ['\uFEF1', '\uFEF2', '\uFEF4', '\uFEF3'], // Ya
    '\u0649': ['\uFEEF', '\uFEF0', '\uFEF0', '\uFEEF'], // Alef Maksura
    '\u0626': ['\uFE89', '\uFE8A', '\uFE8C', '\uFE8B'], // Yeh with Hamza
    '\u0622': ['\uFE81', '\uFE82', '\uFE82', '\uFE81'], // Alif Madda
    '\u0623': ['\uFE83', '\uFE84', '\uFE84', '\uFE83'], // Alif Hamza Above
    '\u0624': ['\uFE85', '\uFE86', '\uFE86', '\uFE85'], // Waw Hamza Above
    '\u0625': ['\uFE87', '\uFE88', '\uFE88', '\uFE87'], // Alif Hamza Below
    '\u0629': ['\uFE93', '\uFE94', '\uFE94', '\uFE93'], // Teh Marbuta
};

const connectsLeft = (char: string) => {
    return mapping[char] && !['\u0627', '\u062F', '\u0630', '\u0631', '\u0632', '\u0648', '\u0622', '\u0623', '\u0625', '\u0624'].includes(char);
};

const connectsRight = (char: string) => {
    return !!mapping[char];
};

export const reshapeArabic = (text: string) => {
    if (!text) return text;
    let result = "";
    for (let i = 0; i < text.length; i++) {
        const prev = text[i - 1];
        const curr = text[i];
        const next = text[i + 1];

        if (mapping[curr]) {
            const right = connectsLeft(prev);
            const left = connectsRight(next);

            if (right && left) result += mapping[curr][2]; // Middle
            else if (right) result += mapping[curr][1]; // End
            else if (left) result += mapping[curr][3]; // Initial
            else result += mapping[curr][0]; // Isolated
        } else {
            result += curr;
        }
    }
    // Reverse for RTL if the library doesn't handle it
    return result.split('').reverse().join('');
};
