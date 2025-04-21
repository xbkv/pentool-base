export function generateTimestamp(): number {
    return Math.floor(Date.now() / 1000);
}

export function generateFixedString(): string {
    return Math.random().toString(36).substring(2, 34);
}