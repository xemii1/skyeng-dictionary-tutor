require('../utils/env');

const { auth } = require('./auth');
const axios = require('axios');
const dayjs = require('dayjs');

async function fetchWord() {
	const currentUser = await auth();

	const wordsets = await axios.get(`https://api.words.skyeng.ru/api/for-vimbox/v1/wordsets.json?studentId=${currentUser.id}&pageSize=200&page=1`)

	const inProgressWordSets = wordsets.data.data.filter(wordset => wordset.progress < 100);
	const wordSetIndex = Math.floor(Math.random() * inProgressWordSets.length);
	const wordSetId = inProgressWordSets[wordSetIndex].id;
	const words = await axios.get(`https://api.words.skyeng.ru/api/for-training/v1/wordsets/${wordSetId}/words.json?wordsetId=${wordSetId}&pageSize=100`);

	const inProgressWords = words.data.data.filter(word => !word.isLearned);
	const inProgressWordsIds = inProgressWords.map(word => word.meaningId);
	const userMeanings = await axios.get(`https://api.words.skyeng.ru/api/for-mobile/v1/words.json?studentId=${currentUser.id}&meaningIds=${inProgressWordsIds.join(',')}`);

	const meaningsIds = userMeanings.data.map((item) => item.meaningId);
	const meaningsData = await axios.get(`https://dictionary.skyeng.ru/api/for-mobile/v1/meanings?ids=${meaningsIds.join(',')}`);
	const meaning = meaningsData.data[Math.floor(Math.random() * meaningsData.data.length)];

	/*await axios.post(`https://api.words.skyeng.ru/api/v1/words/synchronize`, {
		currentDateTime: dayjs().format('YYYY-MM-DDTHH:mm:ssZ'),
		words: [{...userMeanings.data[0], correctAnswersNumber: 5 }]
	});*/
	console.log(meaningsData)
	console.log(userMeanings);

	return {
		id: meaning.id,
		enText: meaning.text,
		ruText: meaning.translation.text
	}
}

async function learnWord(meaningId) {
	const currentUser = await auth();

	const userMeaning = await axios.get(`https://api.words.skyeng.ru/api/for-mobile/v1/words.json?studentId=${currentUser.id}&meaningIds=${meaningId}`);

	await axios.post(`https://api.words.skyeng.ru/api/v1/words/synchronize`, {
		currentDateTime: dayjs().format('YYYY-MM-DDTHH:mm:ssZ'),
		words: [{...userMeaning.data[0], correctAnswersNumber: userMeaning.data[0].correctAnswersNumber + 1 }]
	});
}

module.exports = {
	fetchWord,
	learnWord
}