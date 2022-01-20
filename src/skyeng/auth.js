const axios = require('axios');
const { parse } = require('node-html-parser');

const parseSetCookie = (value) => value.split('; ')
    .map(keyValue => keyValue.split('='))
    .reduce((result, keyValue) => ({...result, [keyValue[0]]: keyValue[1]}), {});

const setToken = (token) => {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
}

const auth = async () => {
    const loginPage = await axios.get('https://id.skyeng.ru/login')
    const tree = parse(loginPage.data);
    let cookie = loginPage.headers['set-cookie'][0];
    const csrfToken = tree.querySelector('input[name="csrfToken"]').getAttribute('value');
    const loginSubmit = await axios.post(
        'https://id.skyeng.ru/ru/frame/login-submit',
        new URLSearchParams({ csrfToken, redirect: 'https://skyeng.ru', username: process.env.SKYENG_LOGIN, password: process.env.SKYENG_PW }),
        {
            headers: {
                Cookie: cookie
            },
        });

    cookie = `session_global=${parseSetCookie(loginSubmit.headers['set-cookie'][0]).session_global}; global_id=${parseSetCookie(loginSubmit.headers['set-cookie'][2]).global_id}`
    const auth = await axios.post('https://id.skyeng.ru/user-api/v1/auth/jwt', {}, {
        headers: {
            Cookie: cookie
        }
    });

    cookie = auth.headers['set-cookie'][0];
    const globalToken = parseSetCookie(cookie).token_global;

    setToken(globalToken);

    const users = await axios.post('https://api-student.skyeng.ru/api/v2/users', {})
    return users.data.users[0];
};

module.exports = {
    auth
}