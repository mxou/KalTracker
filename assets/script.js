document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const open_modal_button = document.querySelector(".open_modal_button");
  const open_logs_button = document.querySelector(".open_logs_button");
  const modal_submit_button = document.querySelector(".modal_submit_button");
  const modal_cancel_button = document.querySelector(".modal_cancel_button");
  const clear_storage_button = document.querySelector(".clear_storage_button");
  const modal_cal_choice = document.querySelector(".modal_cal_choice");
  const modal_prot_choice = document.querySelector(".modal_prot_choice");
  const modal_input = document.querySelector(".modal_input");
  const modal = document.querySelector(".modal");
  const logs_container = document.querySelector(".logs_container");
  const data_cal = document.querySelector(".data_cal");
  const data_prot = document.querySelector(".data_prot");
  const progressCircle = document.getElementById("progressCircle");
  const bg_progress_circle = document.getElementById("bg_progress_circle");
  const progressCircle_prot = document.getElementById("progressCircle_prot");
  const bg_progress_circle_prot = document.getElementById("bg_progress_circle_prot");
  const currentValue = document.getElementById("currentValue");
  const maxValue = document.getElementById("maxValue");
  const tday_date = document.querySelector(".tday_date");
  const tday_hour = document.querySelector(".tday_hour");

  const maxKcal = 2500;
  const maxProt = 160;
  let currentKcal = 0;
  let currentProt = 0;
  let choosen = null;
  const TYPE_KCAL = "kcal";
  const TYPE_PROT = "prot";
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  // IndexedDB setup
  let db;
  const request = indexedDB.open("KalTrackerDB", 1);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => console.log("Service Worker enregistré!", reg))
      .catch((err) => console.error("Erreur d'enregistrement SW:", err));
  }

  request.onupgradeneeded = function (event) {
    db = event.target.result;
    db.createObjectStore("trackerData", { keyPath: "date" });
  };

  request.onsuccess = function (event) {
    db = event.target.result;
    loadTodayData(updateUI);
  };

  request.onerror = function () {
    console.error("Erreur d'ouverture de IndexedDB");
  };

  function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }

  function saveTodayData() {
    const tx = db.transaction("trackerData", "readwrite");
    const store = tx.objectStore("trackerData");
    const todayData = { date: getTodayKey(), kcal: currentKcal, prot: currentProt };
    store.put(todayData);
    tx.oncomplete = () => console.log("Données du jour enregistrées !");
  }

  function loadTodayData(callback) {
    const tx = db.transaction("trackerData", "readonly");
    const store = tx.objectStore("trackerData");
    const request = store.get(getTodayKey());
    request.onsuccess = () => {
      const todayData = request.result;
      currentKcal = todayData ? todayData.kcal : 0;
      currentProt = todayData ? todayData.prot : 0;
      callback();
    };
  }

  function loadAllLogs(callback) {
    const tx = db.transaction("trackerData", "readonly");
    const store = tx.objectStore("trackerData");
    const logs = [];
    store.openCursor().onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        logs.push(cursor.value);
        cursor.continue();
      } else {
        callback(logs);
      }
    };
  }

  function updateUI() {
    // Kcal
    const kcalPercent = currentKcal / maxKcal;
    progressCircle.style.strokeDashoffset = circumference * (1 - kcalPercent);
    data_cal.textContent = `${currentKcal} Kcal`;
    currentValue.textContent = currentKcal;

    if (currentKcal >= maxKcal * 0.95) {
      progressCircle.style.stroke = "red";
      bg_progress_circle.style.stroke = "#5b0000";
    } else if (currentKcal >= maxKcal * 0.8) {
      progressCircle.style.stroke = "orange";
    } else {
      progressCircle.style.stroke = "green";
    }

    // Protéines
    const protPercent = currentProt / maxProt;
    progressCircle_prot.style.strokeDashoffset = circumference * (1 - protPercent);
    data_prot.textContent = `${currentProt} g`;

    if (currentProt >= maxProt * 0.9) {
      progressCircle_prot.style.stroke = "#5ebf34";
    } else if (currentProt >= maxProt * 0.7) {
      progressCircle_prot.style.stroke = "#bbbf34";
    } else if (currentProt >= maxProt * 0.5) {
      progressCircle_prot.style.stroke = "#e05334";
    } else {
      progressCircle_prot.style.stroke = "#e62545";
    }
  }

  // Modale choix
  modal_cal_choice.addEventListener("click", () => {
    modal_cal_choice.classList.add("active");
    modal_prot_choice.classList.remove("active");
    choosen = TYPE_KCAL;
  });
  modal_prot_choice.addEventListener("click", () => {
    modal_prot_choice.classList.add("active");
    modal_cal_choice.classList.remove("active");
    choosen = TYPE_PROT;
  });

  // Modale open/close
  open_modal_button.addEventListener("click", () => (modal.style.display = "block"));
  modal_cancel_button.addEventListener("click", () => {
    modal.style.display = "none";
    modal_input.value = "";
    modal_cal_choice.classList.remove("active");
    modal_prot_choice.classList.remove("active");
    choosen = null;
  });

  modal_submit_button.addEventListener("click", () => {
    const value = Number(modal_input.value);
    if (!value || !choosen) return;

    if (choosen === TYPE_KCAL) currentKcal += value;
    if (choosen === TYPE_PROT) currentProt += value;

    saveTodayData();
    updateUI();

    modal_input.value = "";
    modal.style.display = "none";
    modal_cal_choice.classList.remove("active");
    modal_prot_choice.classList.remove("active");
    choosen = null;
  });

  // Logs
  open_logs_button.addEventListener("click", () => {
    logs_container.style.display = "block";
    loadAllLogs((logs) => {
      const logsList = document.createElement("ul");
      logsList.classList.add("logs_list");

      const titleElement = document.createElement("h2");
      titleElement.textContent = "Historique";
      titleElement.style.color = "#fff";
      titleElement.style.textAlign = "center";
      titleElement.style.margin = "0 0 20px 0";
      titleElement.style.fontSize = "24px";

      logs.forEach((log) => {
        const item = document.createElement("li");
        item.classList.add("log_item");
        item.innerHTML = `Date: <strong>${log.date}</strong> | Calories: <strong>${log.kcal}</strong> | Protéines: <strong>${log.prot}g</strong>`;
        logsList.appendChild(item);
      });

      const closeButton = document.createElement("button");
      closeButton.textContent = "Fermer";
      closeButton.addEventListener("click", () => (logs_container.style.display = "none"));

      logs_container.innerHTML = "";
      logs_container.appendChild(closeButton);
      logs_container.appendChild(titleElement);
      logs_container.appendChild(logsList);
    });
  });

  // Clear DB
  clear_storage_button.addEventListener("click", () => {
    if (!window.confirm("Supprimer toutes les données ?")) return;
    const tx = db.transaction("trackerData", "readwrite");
    tx.objectStore("trackerData").clear().onsuccess = () => {
      console.warn("Toutes les données ont été supprimées !");
      currentKcal = 0;
      currentProt = 0;
      updateUI();
    };
  });

  // Cercles progress
  progressCircle.style.strokeDasharray = `${circumference}`;
  progressCircle.style.strokeDashoffset = `${circumference}`;
  progressCircle_prot.style.strokeDasharray = `${circumference}`;
  progressCircle_prot.style.strokeDashoffset = `${circumference}`;
  maxValue.textContent = maxKcal;

  // Date & heure
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  function formatDateFR(date) {
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  }

  function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    tday_hour.textContent = `${hours}h${minutes}m`;
  }

  tday_date.textContent = formatDateFR(new Date());
  updateTime();
  setInterval(updateTime, 10000);
});
