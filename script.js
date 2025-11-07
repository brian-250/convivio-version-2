// Import Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getDatabase, ref, set, onValue, get, child } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js";

/* ======= CONFIG ======= */
const firebaseConfig = {
  apiKey: "AIzaSyCiNV2kBunUMpARjiX9oMEhGWBtlDaDWfk",
  authDomain: "convivio-notes-version2.firebaseapp.com",
  projectId: "convivio-notes-version2",
  storageBucket: "convivio-notes-version2.firebasestorage.app",
  messagingSenderId: "520633143997",
  appId: "1:520633143997:web:252cc1003a26306cae5dd4",
  databaseURL: "https://convivio-notes-version2-default-rtdb.firebaseio.com/" // 👈 Add this line manually
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ======= SETTINGS ======= */
const SHEET_PATH = "sheets/1";
const ROWS = 40;  // you can make this 190 if you want
const COLS = 4;

/* ======= BUILD THE GRID ======= */
const table = document.getElementById("sheetTable");

function colLabel(n) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function buildSheet(rows, cols) {
  table.innerHTML = "";
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  const corner = document.createElement("th");
  corner.className = "corner";
  headRow.appendChild(corner);

  for (let c = 1; c <= cols; c++) {
    const th = document.createElement("th");
    th.textContent = colLabel(c);
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (let r = 1; r <= rows; r++) {
    const tr = document.createElement("tr");

    const rowHeader = document.createElement("th");
    rowHeader.textContent = r;
    tr.appendChild(rowHeader);

    for (let c = 1; c <= cols; c++) {
      const td = document.createElement("td");
      const cellDiv = document.createElement("div");
      cellDiv.contentEditable = "true";
      cellDiv.className = "cell";
      cellDiv.dataset.row = r;
      cellDiv.dataset.col = c;
      cellDiv.id = `cell-${r}-${c}`;
      td.appendChild(cellDiv);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
}

/* ======= DATABASE SYNC ======= */
function saveCell(r, c, value) {
  const key = `${r}_${c}`;
  const cellRef = ref(db, `${SHEET_PATH}/${key}`);
  set(cellRef, value);
}

function debounce(fn, delay = 400) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function attachListeners() {
  const cells = table.querySelectorAll(".cell");
  cells.forEach((cell) => {
    const r = cell.dataset.row;
    const c = cell.dataset.col;
    const debouncedSave = debounce((val) => saveCell(r, c, val));

    cell.addEventListener("input", () => {
      debouncedSave(cell.textContent);
    });

    cell.addEventListener("blur", () => {
      saveCell(r, c, cell.textContent);
    });
  });
}

function loadSheet() {
  const sheetRef = ref(db, SHEET_PATH);
  onValue(sheetRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    Object.entries(data).forEach(([key, value]) => {
      const [r, c] = key.split("_");
      const cell = document.getElementById(`cell-${r}-${c}`);
      if (cell && cell.textContent !== value) {
        cell.textContent = value;
      }
    });
  });
}

/* ======= RUN ======= */
buildSheet(ROWS, COLS);
attachListeners();
loadSheet();
