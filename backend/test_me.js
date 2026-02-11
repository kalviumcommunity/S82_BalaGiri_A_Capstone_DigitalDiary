const http = require('http');

console.log('Testing /api/auth/me on 127.0.0.1:5001...');

const options = {
    hostname: '127.0.0.1',
    port: 5001,
    path: '/api/auth/me',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error('Problem with request:', e);
});

req.end();
