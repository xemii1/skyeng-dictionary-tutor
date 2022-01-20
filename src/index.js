process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const express = require('express');
const app = express();

app.use(express.json());

const { fetchWord, learnWord } = require('./skyeng/index');

app.get('/words/random', async (req, res) => {
    const word = await fetchWord();
    res.json(word);
});

app.post('/words:learn', async (req, res) => {
    await learnWord(req.body.meaningId);
    res.json({ success: true })
})

app.listen(8080, () => {
    console.log('server started on 8080 port');
})