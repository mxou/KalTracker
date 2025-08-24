document.addEventListener("DOMContentLoaded", function () {
  // Boutons modaux
  const open_modal_button = document.querySelector(".open_modal_button");
  const open_logs_button = document.querySelector(".open_logs_button");
  const modal_submit_button = document.querySelector(".modal_submit_button");
  const modal_cancel_button = document.querySelector(".modal_cancel_button");

  //   Clear local storage
  const clear_storage_button = document.querySelector(".clear_storage_button");

  // Choix Kcal ou Prot
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

  const maxKcal = 2500;
  const maxProt = 160;
  let currentKcal = 0;
  let currentProt = 0;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  let choosen = null;
  const TYPE_KCAL = "kcal";
  const TYPE_PROT = "prot";

  function getTodayKey() {
    const today = new Date();
    const localISO = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    return localISO;
  }

  function getStorageData() {
    const stored = JSON.parse(localStorage.getItem("trackerData")) || [];
    return stored;
  }

  open_logs_button.addEventListener("click", function () {
    logs_container.style.display = "block";
    const logsList = document.createElement("ul");
    logsList.classList.add("logs_list");
    const storedLogs = getStorageData();

    // Créer un titre pour la liste
    const titleElement = document.createElement("h2");
    titleElement.textContent = "Historique";
    titleElement.style.color = "#fff";
    titleElement.style.textAlign = "center";
    titleElement.style.margin = "0 0 20px 0";
    titleElement.style.fontSize = "24px";

    storedLogs.forEach((log) => {
      const item = document.createElement("li");
      item.classList.add("log_item");

      // Créer des spans séparés pour chaque information
      const dateSpan = document.createElement("span");
      dateSpan.innerHTML = `Date: <strong>${log.date}</strong>`;

      const kcalSpan = document.createElement("span");
      kcalSpan.innerHTML = `Calories: <strong>${log.kcal}</strong>`;

      const protSpan = document.createElement("span");
      protSpan.innerHTML = `Protéines: <strong>${log.prot}g</strong>`;

      // Ajouter les spans à l'élément li
      item.appendChild(dateSpan);
      item.appendChild(kcalSpan);
      item.appendChild(protSpan);

      logsList.appendChild(item);
    });

    logs_container.innerHTML = ""; // vide l'ancien contenu
    // Ajout du bouton de fermeture
    const closeButton = document.createElement("button");
    closeButton.classList.add("close_logs_button");
    closeButton.addEventListener("click", function () {
      logs_container.style.display = "none";
    });

    logs_container.appendChild(closeButton);

    logs_container.appendChild(titleElement);
    logs_container.appendChild(logsList);
  });

  console.log(getStorageData());
  console.log(getTodayKey());

  function loadTodayData() {
    const stored = JSON.parse(localStorage.getItem("trackerData")) || [];
    const todayData = stored.find((entry) => entry.date === getTodayKey());

    if (todayData) {
      currentKcal = todayData.kcal;
      currentProt = todayData.prot;
    } else {
      // Si aucune donnée n'est trouvée pour aujourd'hui, réinitialiser les compteurs
      currentKcal = 0;
      currentProt = 0;
    }
  }

  function saveTodayData() {
    const stored = JSON.parse(localStorage.getItem("trackerData")) || [];
    const todayKey = getTodayKey();
    const index = stored.findIndex((entry) => entry.date === todayKey);
    const newEntry = { date: todayKey, kcal: currentKcal, prot: currentProt };

    if (index !== -1) {
      stored[index] = newEntry;
    } else {
      stored.push(newEntry);
    }

    localStorage.setItem("trackerData", JSON.stringify(stored));
  }

  // Vérification et réinitialisation chaque jour
  const lastStoredDate = localStorage.getItem("lastDate");
  const todayDate = getTodayKey();

  if (lastStoredDate !== todayDate) {
    // Réinitialisation des compteurs si la date a changé
    currentKcal = 0;
    currentProt = 0;
    localStorage.setItem("lastDate", todayDate); // Enregistrer la nouvelle date
  }

  // Charger et mettre à jour les données
  loadTodayData();
  updateUI();

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

  // Sélection kcal ou prot
  modal_cal_choice.addEventListener("click", function () {
    modal_cal_choice.classList.add("active");
    modal_prot_choice.classList.remove("active");
    choosen = TYPE_KCAL;
  });

  modal_prot_choice.addEventListener("click", function () {
    modal_prot_choice.classList.add("active");
    modal_cal_choice.classList.remove("active");
    choosen = TYPE_PROT;
  });

  // Ouvrir & fermer la modal
  open_modal_button.addEventListener("click", function () {
    modal.style.display = "block";
  });

  modal_cancel_button.addEventListener("click", function () {
    modal.style.display = "none";
    modal_input.value = "";
    modal_cal_choice.classList.remove("active");
    modal_prot_choice.classList.remove("active");
    choosen = null;
  });

  modal_submit_button.addEventListener("click", function () {
    const value = Number(modal_input.value);
    if (!value || !choosen) return;

    if (choosen === TYPE_KCAL) {
      currentKcal += value;
    }

    if (choosen === TYPE_PROT) {
      currentProt += value;
    }

    saveTodayData();
    updateUI();

    // Reset modal
    modal_input.value = "";
    modal.style.display = "none";
    modal_cal_choice.classList.remove("active");
    modal_prot_choice.classList.remove("active");
    choosen = null;
  });

  // Initialisation
  progressCircle.style.strokeDasharray = `${circumference}`;
  progressCircle.style.strokeDashoffset = `${circumference}`;
  progressCircle_prot.style.strokeDasharray = `${circumference}`;
  progressCircle_prot.style.strokeDashoffset = `${circumference}`;
  maxValue.textContent = maxKcal;

  loadTodayData();
  updateUI();

  clear_storage_button.addEventListener("click", function () {
    if (!window.confirm("Clear completement le local storage ?")) return;
    localStorage.clear();
    loadTodayData();
    updateUI();
    console.warn("LOCAL STORAGE CLEARED");
  });

  // DATE ET HEURE
  const tday_date = document.querySelector(".tday_date");
  const tday_hour = document.querySelector(".tday_hour");

  function formatDateFR(date) {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
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
