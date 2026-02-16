const path = require('path');
const { storage } = require('./backend/utils/storageService');

// Mock request and callback objects
const mockReq = {};
const mockCallback = (err, result) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Result:', result);
    }
};

// Helper function to test filename generation
const testFilename = (filename) => {
    console.log(`Testing filename: ${filename}`);
    const mockFile = {
        fieldname: 'photos',
        originalname: filename
    };

    // Access the filename function directly from the storage engine
    // output of multer.diskStorage has 'getFilename' which calls our function but it's internal.
    // However, the object returned by multer.diskStorage has a `getFilename` method.
    // actually, let's just inspect the engine implementation.
    // The engine returned by multer.diskStorage has `_handleFile`, `_removeFile`.
    // It seems we can't easily unit test the configured engine without mocking multer internals or just testing the logic function if we extracted it.

    // Since we didn't extract the function, let's try to verify via code inspection or by creating a temporary test file in the backend utils if possible? No, we can't easily require the internal function.

    // Wait, let's look at how we CAN test it.
    // We can copy the logic into this script to verify the REGEX at least.

    const isEncrypted = /^[a-zA-Z0-9]+\.(enc|audio\.enc)$/.test(filename);
    if (isEncrypted) {
        console.log('  -> Detected as ENCRYPTED. Result would be:', filename);
    } else {
        console.log('  -> Detected as NORMAL. Result would be: (randomized)');
    }
    console.log('---');
};

console.log('--- STORAGE LOGIC VERIFICATION ---');

testFilename('test_image.jpg'); // Should be normal
testFilename('aBc123xyz.enc'); // Should be encrypted
testFilename('audioFile123.audio.enc'); // Should be encrypted
testFilename('malicious..enc'); // Should be normal (two dots) - wait, my regex allows dots? No, ^[a-zA-Z0-9]+ means only alphanumeric before the dot.
testFilename('hack.js.enc'); // Should be normal (has .js)
testFilename('validId123.enc'); // Should be encrypted

