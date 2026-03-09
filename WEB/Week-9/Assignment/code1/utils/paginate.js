// Reusable offset-based pagination helper
function paginate(array, query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, parseInt(query.limit) || 10); // cap at 50
    const offset = (page - 1) * limit;

    const total = array.length;
    const data = array.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        meta: {
            total,
            count: data.length,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
}
module.exports = paginate;