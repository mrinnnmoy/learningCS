// Cursor-based pagination
// cursor = base64(JSON.stringify({ id: lastSeenId }))

function encodeCursor(item) {
    return Buffer.from(JSON.stringify({ id: item.id })).toString('base64');
}

function decodeCursor(cursor) {
    try {
        return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
    } catch {
        return null; // invalid cursor — treat as no cursor (start from beginning)
    }
}

function cursorPaginate(array, query) {
    const limit = Math.min(50, parseInt(query.limit) || 10);
    const cursor = query.cursor;

    let startIdx = 0;
    if (cursor) {
        const decoded = decodeCursor(cursor);
        if (decoded) {
            const found = array.findIndex(item => item.id === decoded.id);
            startIdx = found === -1 ? 0 : found + 1;
        }
    }

    const slice = array.slice(startIdx, startIdx + limit);
    const hasNextPage = startIdx + limit < array.length;
    const nextCursor = hasNextPage && slice.length > 0
        ? encodeCursor(slice[slice.length - 1])
        : null;

    return {
        data: slice,
        meta: {
            count: slice.length,
            limit,
            hasNextPage,
            nextCursor,
            // Convenience: ready-to-use next page URL
            nextUrl: nextCursor ? `?limit=${limit}&cursor=${nextCursor}` : null,
        },
    };
}

module.exports = { cursorPaginate, encodeCursor, decodeCursor };