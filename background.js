let timerState = {
    running: false,
    task: null,
    endTime: 0
};

let popupWindow = null;

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'pomodoroTimer') {
        timerComplete();
    }
});

function timerComplete() {
    timerState.running = false;

    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon128.png',
        title: 'pomo.dor.o',
        message: `Time's up for task: ${timerState.task}`,
        priority: 2
    });

    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    chrome.action.setBadgeText({ text: 'END' });
}

chrome.action.onClicked.addListener(() => {
    openAppWindow();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startTimer') {
        startTimer(message.task, message.duration);
        sendResponse({ success: true });
    } else if (message.action === 'pauseTimer') {
        pauseTimer();
        sendResponse({ success: true });
    } else if (message.action === 'resumeTimer') {
        resumeTimer();
        sendResponse({ success: true });
    } else if (message.action === 'cancelTimer') {
        cancelTimer();
        sendResponse({ success: true });
    } else if (message.action === 'getTimerState') {
        sendResponse({ timerState });
    } else if (message.action === 'openPopup') {
        openAppWindow();
        sendResponse({ success: true });
    }

    return true; // Keep the message channel open for async response
});

function openAppWindow() {
    if (popupWindow) {
        try {
            chrome.windows.get(popupWindow.id, (window) => {
                if (window) {
                    chrome.windows.remove(popupWindow.id);
                }
            });
        } catch (e) {
        }
    }

    chrome.windows.create({
        url: chrome.runtime.getURL('popup.html'),
        type: 'popup',
        width: 750,
        height: 380,
        focused: true,
        state: 'normal'
    }, (window) => {
        popupWindow = window;
    });
}