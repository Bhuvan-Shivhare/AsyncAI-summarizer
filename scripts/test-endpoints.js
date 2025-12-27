const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testEndpoints() {
    console.log('🚀 Starting Backend Endpoint Test...\n');

    try {
        // 1. Test Health Check
        console.log('--- 1. Testing /health ---');
        const healthRes = await axios.get(`${BASE_URL}/health`);
        console.log('Status:', healthRes.status);
        console.log('Response:', healthRes.data);
        console.log(' Health Check Passed\n');

        // 2. Test Submit Job
        console.log('--- 2. Testing /submit ---');
        const submitRes = await axios.post(`${BASE_URL}/submit`, {
            text: "Machine learning is a field of inquiry devoted to understanding and building methods that 'learn', that is, methods that leverage data to improve performance on some set of tasks."
        });
        console.log('Status:', submitRes.status);
        console.log('Response:', submitRes.data);

        const jobId = submitRes.data.jobId;
        console.log(`Job Submitted! ID: ${jobId}\n`);

        // 3. Test Status Polling
        console.log(`--- 3. Testing /status/${jobId} ---`);
        let status = 'queued';
        let attempts = 0;
        const maxAttempts = 10;

        while ((status === 'queued' || status === 'processing') && attempts < maxAttempts) {
            attempts++;
            console.log(`Polling status (Attempt ${attempts})...`);
            const statusRes = await axios.get(`${BASE_URL}/status/${jobId}`);
            status = statusRes.data.status;
            console.log('Current Status:', status);

            if (status === 'completed' || status === 'failed') break;

            // Wait 2 seconds before next poll
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        if (status !== 'completed' && status !== 'failed') {
            console.log('Polling timed out. Check if worker is running.\n');
        } else {
            console.log(` Job reached final status: ${status}\n`);
        }

        // 4. Test Result Retrieval
        console.log(`--- 4. Testing /result/${jobId} ---`);
        const resultRes = await axios.get(`${BASE_URL}/result/${jobId}`);
        console.log('Status:', resultRes.status);
        console.log('Response Summary:', resultRes.data.summary ? (resultRes.data.summary.substring(0, 100) + '...') : 'No summary');
        console.log(' Result Retrieval Finished\n');

        console.log(' All endpoint tests completed!');

    } catch (error) {
        console.error(' Test failed!');
        if (error.response) {
            console.error('Response Error:', error.response.status, error.response.data);
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

testEndpoints();
