// Custom logger that shows colored output and measures response time
function requestLogger(req, res, next) {
    const start = Date.now();

    // 'finish' fires after the response has been sent
    res.on('finish', () => {
        const duration = Date.now() - start;

        // Color based on status code
        const color =
            res.statusCode >= 500 ? '\x1b[31m' :  // red
                res.statusCode >= 400 ? '\x1b[33m' :  // yellow
                    res.statusCode >= 300 ? '\x1b[36m' :  // cyan
                        '\x1b[32m';                            // green
        const reset = '\x1b[0m';

        console.log(
            `${color}${req.method}${reset} ${req.path} → ` +
            `${color}${res.statusCode}${reset} (${duration}ms) [${req.requestId}]`
        );
    });

    next();
}
module.exports = requestLogger;