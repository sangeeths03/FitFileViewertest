export function formatSpeed(val) {
    return (
        (Number(val) * 3.6).toFixed(2) +
        ' km/h / ' +
        (Number(val) * 2.23694).toFixed(2) +
        ' mph'
    );
}

export function formatArray(val, digits = 2) {
    if (Array.isArray(val))
        return val.map((v) => Number(v).toFixed(digits)).join(', ');
    if (typeof val === 'string' && val.includes(','))
        return val
            .split(',')
            .map((v) => Number(v).toFixed(digits))
            .join(', ');
    return val;
}