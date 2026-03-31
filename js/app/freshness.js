export function parseContentDate(dateText) {
    if (typeof dateText !== 'string' || dateText.trim() === '') return null;

    const normalized = dateText.trim().match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
    if (normalized) {
        const [, year, month, day] = normalized;
        return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const parsed = new Date(dateText);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isRecentContent(dateText, featured = false) {
    const itemDate = parseContentDate(dateText);
    if (!itemDate) return featured;

    const now = new Date();
    const itemMidnight = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.abs((nowMidnight - itemMidnight) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 || featured;
}
