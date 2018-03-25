document.addEventListener('DOMContentLoaded', () => {
    const cookieElement = document.getElementById('cookie');
    chrome.cookies.get({
        url: 'https://signin.simple.com',
        name: 'sfst',
    }, (cookie) => {
        cookieElement.textContent = cookie ? cookie.value : 'Not found';
    });
});
