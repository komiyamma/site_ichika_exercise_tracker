const WORKOUT_STORAGE_KEY = 'ichikaWorkoutLogEntries';

let entryFormElement;
let entryListElement;
let totalCountElement;
let filterDateInputElement;
let clearFilterButtonElement;
let dateInputElement;
let typeInputElement;
let minutesInputElement;
let valueInputElement;
let noteInputElement;

function getTodayString() {
    const today = new Date();
    return today.toISOString().slice(0, 10);
}

function generateEntryId() {
    return `${Date.now()}${Math.floor(Math.random() * 10000)}`;
}

function loadEntriesFromStorage() {
    const raw = localStorage.getItem(WORKOUT_STORAGE_KEY);
    if (raw) {
        return JSON.parse(raw);
    }
    return [];
}

function saveEntriesToStorage(entries) {
    localStorage.setItem(WORKOUT_STORAGE_KEY, JSON.stringify(entries));
}

function initializePage() {
    assignElementReferences();
    attachEventListeners();
    dateInputElement.value = getTodayString();
    renderEntryTable();
}

function assignElementReferences() {
    entryFormElement = document.getElementById('entry-form');
    entryListElement = document.getElementById('list');
    totalCountElement = document.getElementById('total-count');
    filterDateInputElement = document.getElementById('filter-date');
    clearFilterButtonElement = document.getElementById('clear-filter');
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
}

function handleFormSubmit(event) {
    if (!dateInputElement || !typeInputElement || !minutesInputElement || !valueInputElement || !noteInputElement) {
        return;
    }

    event.preventDefault();

    const entry = {};
    entry.id = generateEntryId();
    entry.date = dateInputElement.value;
    entry.type = typeInputElement.value;
    entry.minutes = parseInt(minutesInputElement.value, 10) || 0;
    entry.value = parseInt(valueInputElement.value, 10) || 0;
    entry.note = noteInputElement.value.trim();
    entry.createdAt = Date.now();

    if (!entry.type || !entry.date) {
        alert('Type and date are required.');
        return;
    }

    const entries = loadEntriesFromStorage();
    entries.push(entry);
    saveEntriesToStorage(entries);

    entryFormElement.reset();
    dateInputElement.value = getTodayString();
    renderEntryTable();
}

function handleFilterClearButtonClick() {
    filterDateInputElement.value = '';
    renderEntryTable();
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
    const filteredEntries = [];
    for (const entry of entries) {
        if (entry.id !== entryId) {
            filteredEntries.push(entry);
        }
    }
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
