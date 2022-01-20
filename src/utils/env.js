const env = require('dotenv');
const path = require('path');
const fileNames = ['.env', '.env.local'];

fileNames.forEach(fileName => {
    env.config({ path: path.resolve(process.cwd(), fileName), override: true });
})