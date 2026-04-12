// The job worker runs a blocking pop loop.
// BLPOP blocks until an item appears in the list, then returns it.
// This is more efficient than polling with LPOP.
const startWorker = async (redis) => {
    console.log('🔧 Job worker started. Waiting for jobs...');

    while (true) {
        try {
            // BLPOP returns [listName, value] or null on timeout
            // 0 = block indefinitely
            const result = await redis.blpop('queue:jobs', 0);
            if (!result) continue;

            const [, rawJob] = result;
            const job = JSON.parse(rawJob);

            console.log(`\n⚙️  Processing job ${job.jobId} (type: ${job.type})`);

            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 500));

            // Store the result — available for 1 hour
            const jobResult = {
                jobId: job.jobId,
                type: job.type,
                payload: job.payload,
                status: 'completed',
                processedAt: new Date().toISOString(),
                result: `Processed ${job.type} successfully`,
            };

            await redis.set(
                `job:result:${job.jobId}`,
                JSON.stringify(jobResult),
                'EX', 3600
            );

            console.log(`✅ Job ${job.jobId} completed`);
        } catch (err) {
            // Don't crash the worker on individual job errors
            console.error('Worker error:', err.message);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

module.exports = { startWorker };