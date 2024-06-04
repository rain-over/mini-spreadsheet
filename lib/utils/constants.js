export const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const colRowRegex = /[A-Z]+|[0-9]+/g;
export const lettersRegex = /[A-Z]+/;
// export const numbersRegex = /^[0-9]+$/;
export const numbersRegex = /^-?\d+(,\d+)*(\.\d+(e\d+)?)?$/;
export const operatorsRegex = /([*\/+\-])/;
export const valueInParenthesisRegex = /\(([^)]+)\)/;
