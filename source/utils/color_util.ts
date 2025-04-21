import { Color, Result } from "./types";

const colors: Color = {
    black: '\u001b[30m',
    red: '\u001b[31m',
    green: '\u001b[32m',
    yellow: '\u001b[33m',
    blue: '\u001b[34m',
    magenta: '\u001b[35m',
    cyan: '\u001b[36m',
    white: '\u001b[37m',
    reset: '\u001b[0m'
};

const results: Result = {
    error: "[×] ",
    success: "[○] ",
    warning: "[⚠] "
};

function getColor(color: string): string {
    return colors[color.toLowerCase()] || colors.reset;
}

function setColor(color: string, message: string, type: number): string {
    let prefix: string = "";
    if (type === -1) {
        prefix = getColor(color) + results.error;
    } else if (type === 0) {
        prefix = getColor(color) + results.warning;
    } else if (type === 1) {
        prefix = getColor(color) + results.success;
    }

    return prefix + colors.white + message + colors.reset;
}

export { setColor, colors };