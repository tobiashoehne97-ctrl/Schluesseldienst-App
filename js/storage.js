const STORAGE_KEY = "schluesseldienst_app";

function saveAppData() {
  try {
    const payload = JSON.stringify(AppData);
    localStorage.setItem(STORAGE_KEY, payload);
  } catch (error) {
    console.error("Fehler beim Speichern von AppData:", error);
  }
}

function loadAppData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") {
      return;
    }

    Object.keys(parsed).forEach((key) => {
      if (AppData[key] !== undefined && typeof AppData[key] === "object" && !Array.isArray(AppData[key])) {
        AppData[key] = {
          ...AppData[key],
          ...parsed[key]
        };
      } else {
        AppData[key] = parsed[key];
      }
    });
  } catch (error) {
    console.error("Fehler beim Laden von AppData:", error);
  }
}

function clearAppData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Fehler beim Löschen von AppData:", error);
  }
}

function exportAppData() {
  return JSON.stringify(AppData);
}

function importAppData(json) {
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") {
      return false;
    }

    Object.keys(parsed).forEach((key) => {
      if (AppData[key] !== undefined && typeof AppData[key] === "object" && !Array.isArray(AppData[key])) {
        AppData[key] = {
          ...AppData[key],
          ...parsed[key]
        };
      } else {
        AppData[key] = parsed[key];
      }
    });

    saveAppData();
    return true;
  } catch (error) {
    console.error("Fehler beim Importieren von AppData:", error);
    return false;
  }
}
