function focusOrCreateTab(url) {
    chrome.windows.getAll({ populate: true }, (windows) => {
        const existingTab = windows.map(window => window.tabs)
            .reduce((accumulator, tabs) => accumulator.concat(tabs))
            .find(tab => tab.url === url);
        if (existingTab === undefined) {
            chrome.tabs.create({ url, selected: true });
        } else {
            chrome.tabs.update(existingTab.id, { selected: true });
        }
    });
}

chrome.browserAction.onClicked.addListener(() => {
    const managerUrl = chrome.extension.getURL('manager.html');
    focusOrCreateTab(managerUrl);
});
