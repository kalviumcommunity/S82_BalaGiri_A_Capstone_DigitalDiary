const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');
const DiaryEntry = require('./models/diaryentry');

const verify = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        const user = await User.findOne().sort({ createdAt: -1 });
        if (!user) {
            console.log("No users found.");
            return;
        }

        console.log("\n--- LATEST USER ---");
        console.log("ID:", user._id);
        console.log("Email:", user.email);
        console.log("KDF Salt:", user.kdfSalt);
        console.log("Validator Hash:", user.validatorHash);
        console.log("Encrypted Master Key:", user.encryptedMasterKey);
        console.log("Master Key IV:", user.masterKeyIV);

        if (user.password && user.password.length < 50) {
            console.log("WARNING: Password field looks short (plaintext?) - ", user.password);
        } else {
            console.log("Password Field (Hashed AuthToken):", user.password.substring(0, 20) + "...");
        }

        const entry = await DiaryEntry.findOne({ user: user._id }).sort({ createdAt: -1 });
        if (!entry) {
            console.log("\nNo diary entries found for this user.");
        } else {
            console.log("\n--- LATEST ENTRY ---");
            console.log("Title (Ciphertext):", entry.title);
            console.log("Content (Ciphertext):", entry.content);
            console.log("IV:", entry.iv);
            console.log("Entry Salt:", entry.entrySalt);

            // Basic heuristic check
            const isBase64 = (str) => {
                try {
                    return btoa(atob(str)) == str;
                } catch (err) {
                    return false;
                }
            };

            // Note: Our ciphertext might include colons for IV:Ciphertext packing in title/mood
            // But content should be pure Base64
            // Let's just visually inspect via logs
        }

    } catch (err) {
        console.error("Verification Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("\nDisconnected.");
    }
};

verify();
