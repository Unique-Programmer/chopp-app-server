export const expireParseByHours = (expireIn: string, minimum: number = 1) => {
    const count = parseInt(expireIn.replace(/[^\d]/g, ''));
    const scaling = expireIn.split(`${count}`)[1];

    if (!count || !scaling) {
        return minimum;
    }

    const MILLISECONDS_IN_HOUR = 3600000;
    const expiresMapByHours = {
        d: 24,
        h: 1,
        m: 0.166,
    }

    return count * expiresMapByHours[scaling] * MILLISECONDS_IN_HOUR;
};