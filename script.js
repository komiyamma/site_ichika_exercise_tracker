const WORKOUT_STORAGE_KEY = 'ichikaWorkoutLogEntries';

let entryFormElement;
let entryListElement;
let totalCountElement;
let filterDateInputElement;
let clearFilterButtonElement;
let debugClearStorageButtonElement;
let dateInputElement;
let typeInputElement;
let minutesInputElement;
let valueInputElement;
let noteInputElement;

function padToTwoDigits(value) {
    return String(value).padStart(2, '0');
}

function formatDateForInput(value) {
    const year = value.slice(0, 4);
    const month = value.slice(4, 6);
    const day = value.slice(6, 8);
    return `${year}-${month}-${day}`;
}

function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = padToTwoDigits(today.getMonth() + 1);
    const day = padToTwoDigits(today.getDate());
    return `${year}${month}${day}`;
}

function generateEntryId() {
    return String(Date.now());
}

function loadEntriesFromStorage() {
    const raw = localStorage.getItem(WORKOUT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

function saveEntriesToStorage(entries) {
    localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(entries));
}

function initializePage() {
    assignElementReferences();
    attachEventListeners();
    dateInputElement.value = formatDateForInput(getTodayString());
    renderEntryTable();
}

function assignElementReferences() {
    entryFormElement = document.getElementById('entry-form');
    entryListElement = document.getElementById('list');
    totalCountElement = document.getElementById('total-count');
    filterDateInputElement = document.getElementById('filter-date');
    clearFilterButtonElement = document.getElementById('clear-filter');
    debugClearStorageButtonElement = document.getElementById('debug-clear-storage');
    dateInputElement = document.getElementById('date');
    typeInputElement = document.getElementById('type');
    minutesInputElement = document.getElementById('minutes');
    valueInputElement = document.getElementById('value');
    noteInputElement = document.getElementById('note');
}

function attachEventListeners() {
    entryFormElement.addEventListener('submit', handleFormSubmit);
    filterDateInputElement.addEventListener('change', renderEntryTable);
    clearFilterButtonElement.addEventListener('click', handleFilterClearButtonClick);
    entryListElement.addEventListener('click', handleEntryListClick);
    debugClearStorageButtonElement.addEventListener('click', handleDebugClearStorageClick);
}

function handleFormSubmit(event) {
    event.preventDefault();

    const entry = {
        id: generateEntryId(),
        date: dateInputElement.value,
        type: typeInputElement.value,
        minutes: parseInt(minutesInputElement.value, 10) || 0,
        value: parseInt(valueInputElement.value, 10) || 0,
        note: noteInputElement.value.trim(),
        createdAt: Date.now()
    };

    if (!entry.type || !entry.date) {
        alert('Type and date are required.');
        return;
    }

    const entries = loadEntriesFromStorage();
    entries.push(entry);
    saveEntriesToStorage(entries);

    entryFormElement.reset();
    dateInputElement.value = formatDateForInput(getTodayString());
    renderEntryTable();
}

function handleFilterClearButtonClick() {
    filterDateInputElement.value = '';
    renderEntryTable();
}

function handleDebugClearStorageClick() {
    const message = 'localStorage に保存した全ての記録を削除します。よろしいですか？';
    if (!window.confirm(message)) {
        return;
    }

    localStorage.removeItem(WORKOUT_STORAGE_KEY);
    filterDateInputElement.value = '';
    renderEntryTable();
    window.alert('データを削除しました。');
}

function handleEntryListClick(event) {
    let currentElement = event.target;
    while (currentElement && currentElement !== entryListElement) {
        const entryId = currentElement.getAttribute ? currentElement.getAttribute('data-id') : null;
        if (entryId) {
            removeEntryById(entryId);
            return;
        }
        currentElement = currentElement.parentElement;
    }
}

function removeEntryById(entryId) {
    const entries = loadEntriesFromStorage();
    const filteredEntries = entries.filter(entry => entry.id !== entryId);
    saveEntriesToStorage(filteredEntries);
    renderEntryTable();
}

function renderEntryTable() {
    const entries = loadEntriesFromStorage();
    const selectedDate = filterDateInputElement.value;
    const filteredEntries = [];

    for (const entry of entries) {
        if (!selectedDate || entry.date === selectedDate) {
            filteredEntries.push(entry);
        }
    }

    filteredEntries.sort((a, b) => {
        return b.createdAt - a.createdAt;
    });

    totalCountElement.textContent = String(filteredEntries.length);

    let tableHtml = '';
    for (const currentEntry of filteredEntries) {
        tableHtml += `<tr>
    <td>${currentEntry.date}</td>
    <td>${currentEntry.type}</td>
    <td class="text-end">${currentEntry.minutes || ''}</td>
    <td class="text-end">${currentEntry.value || ''}</td>
    <td>${currentEntry.note || ''}</td>
    <td class="text-end">
        <button class="btn btn-sm btn-outline-danger" data-id="${currentEntry.id}">Delete</button>
    </td>
</tr>`;
    }

    entryListElement.innerHTML = tableHtml;
}

document.addEventListener('DOMContentLoaded', initializePage);
