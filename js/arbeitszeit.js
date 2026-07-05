let currentWorkEntryId = null;
function getWorkEntries() {

    return AppData.arbeitszeit.eintraege;

}
function isWorkRunning() {

    return AppData.arbeitszeit.eingestempelt;

}
function startWork() {

    if (AppData.arbeitszeit.eingestempelt) {
        return false;
    }

    AppData.arbeitszeit.eingestempelt = true;

    AppData.arbeitszeit.start = new Date().toISOString();

    saveAppData();

    return true;

}
function generateWorkEntryId() {

    AppData.arbeitszeit.letzterIndex++;

    return "AZ-" +
        String(AppData.arbeitszeit.letzterIndex).padStart(6, "0");

}
function stopWork() {

    if (!AppData.arbeitszeit.eingestempelt) {
        return false;
    }

    const entry = {

        id: generateWorkEntryId(),

        datum: new Date(AppData.arbeitszeit.start)
            .toISOString()
            .split("T")[0],

        start: AppData.arbeitszeit.start,

        ende: new Date().toISOString()

    };

    AppData.arbeitszeit.eintraege.push(entry);

    AppData.arbeitszeit.eingestempelt = false;

    AppData.arbeitszeit.start = null;

    saveAppData();

    return entry;

}
function calculateWorkDuration(start, ende) {

    const startDate = new Date(start);
    const endDate = new Date(ende);

    const diff = endDate - startDate;

    return Math.floor(diff / 60000);

}
function formatMinutes(minutes) {

    const hours = Math.floor(minutes / 60);

    const mins = minutes % 60;

    return `${hours}h ${String(mins).padStart(2, "0")}m`;

}
function addManualEntry(datum, startUhrzeit, endeUhrzeit) {

    const entry = {

        id: generateWorkEntryId(),

        datum: datum,

        start: `${datum}T${startUhrzeit}:00`,

        ende: `${datum}T${endeUhrzeit}:00`

    };

    AppData.arbeitszeit.eintraege.push(entry);

    saveAppData();

    return entry;

}
function getWorkEntryById(id) {

    return AppData.arbeitszeit.eintraege.find(
        entry => entry.id === id
    ) || null;

}
function deleteWorkEntry(id) {

    const index = AppData.arbeitszeit.eintraege.findIndex(
        entry => entry.id === id
    );

    if (index === -1) {
        return false;
    }

    AppData.arbeitszeit.eintraege.splice(index, 1);

    saveAppData();

    return true;

}
function updateWorkEntry(id, datum, startUhrzeit, endeUhrzeit) {

    const entry = getWorkEntryById(id);

    if (!entry) {
        return false;
    }

    entry.datum = datum;
    entry.start = `${datum}T${startUhrzeit}:00`;
    entry.ende = `${datum}T${endeUhrzeit}:00`;

    saveAppData();

    return true;

}

function calculateMonthlyHours(jahr, monat) {

    let minutes = 0;

    AppData.arbeitszeit.eintraege.forEach(entry => {

        const date = new Date(entry.datum);

        if (
            date.getFullYear() === jahr &&
            date.getMonth() + 1 === monat
        ) {
            minutes += calculateWorkDuration(
                entry.start,
                entry.ende
            );
        }

    });

    return minutes;

}
function saveManualWorkEntry() {
AppData.mitarbeiter.name =
    document.getElementById("azMitarbeiter").value;

AppData.mitarbeiter.personalnummer =
    document.getElementById("azPersonalnummer").value;

saveAppData();
    const datum = document.getElementById("azDatum").value;
    const start = document.getElementById("azStart").value;
    const ende = document.getElementById("azEnde").value;

    if (!datum || !start || !ende) {
        alert("Bitte alle Felder ausfüllen.");
        return;
    }

    if (currentWorkEntryId) {

        updateWorkEntry(
            currentWorkEntryId,
            datum,
            start,
            ende
        );

        currentWorkEntryId = null;

    } else {

        addManualEntry(
            datum,
            start,
            ende
        );

    }

    renderWorkJournal();

    document.getElementById("azDatum").value = "";
    document.getElementById("azStart").value = "";
    document.getElementById("azEnde").value = "";

}
function renderWorkJournal() {

    const container = document.getElementById("workJournal");

    if (!container) return;

    container.innerHTML = "";

    const entries = [...getWorkEntries()];

    if (entries.length === 0) {

        container.innerHTML = "<p>Noch keine Arbeitszeiten vorhanden.</p>";

        return;

    }

    entries.sort((a, b) => new Date(b.datum) - new Date(a.datum));

    entries.forEach(entry => {

        const minutes = calculateWorkDuration(
            entry.start,
            entry.ende
        );

        const card = document.createElement("div");

        card.className = "card";

        card.style.marginBottom = "10px";

        card.innerHTML = `
            <strong>${entry.datum}</strong><br>

            ${entry.start.substring(11,16)}
            -
            ${entry.ende.substring(11,16)}

            <br>

            <span style="color:#4fc3f7">
                ${formatMinutes(minutes)}
            </span>

            <div style="margin-top:10px">

                <button
                    class="btnS"
                    onclick="editWorkEntry('${entry.id}')">

                    ✏️ Bearbeiten

                </button>

                <button
                    class="btnD"
                    onclick="removeWorkEntry('${entry.id}')">

                    🗑 Löschen

                </button>

            </div>
        `;

        container.appendChild(card);

    });

}
function removeWorkEntry(id) {

    if (!confirm("Arbeitszeit wirklich löschen?")) {
        return;
    }

    deleteWorkEntry(id);

    renderWorkJournal();

}
function editWorkEntry(id) {

    const entry = getWorkEntryById(id);

    if (!entry) return;

    currentWorkEntryId = id;

    document.getElementById("azDatum").value = entry.datum;
    document.getElementById("azStart").value = entry.start.substring(11,16);
    document.getElementById("azEnde").value = entry.ende.substring(11,16);

}
function renderMonthlyJournal() {

    const month = Number(document.getElementById("azMonat").value);
    const year = Number(document.getElementById("azJahr").value);

    const container = document.getElementById("workJournal");

    container.innerHTML = "";
    const mitarbeiter = document.getElementById("azMitarbeiter").value || "-";
const personalnummer = document.getElementById("azPersonalnummer").value || "-";

const monate = [
    "Januar","Februar","März","April","Mai","Juni",
    "Juli","August","September","Oktober","November","Dezember"
];

container.innerHTML = `
    <div class="card">

        <h2 style="margin-bottom:15px">
            📄 Arbeitszeitnachweis
        </h2>

        <div><strong>Mitarbeiter:</strong> ${mitarbeiter}</div>
        <div><strong>Personalnummer:</strong> ${personalnummer}</div>
        <div><strong>Monat:</strong> ${monate[month-1]} ${year}</div>

    </div>
`;

    const entries = getWorkEntries()
        .filter(entry => {

            const date = new Date(entry.datum);

            return (
                date.getFullYear() === year &&
                (date.getMonth() + 1) === month
            );

        })
        .sort((a, b) => new Date(a.datum) - new Date(b.datum));

    if (entries.length === 0) {

        container.innerHTML =
            "<p>Für diesen Monat sind keine Arbeitszeiten vorhanden.</p>";

        return;

    }

    let totalMinutes = 0;

    entries.forEach(entry => {

        const minutes = calculateWorkDuration(entry.start, entry.ende);

        totalMinutes += minutes;

        container.innerHTML += `
    <div class="card" style="margin-bottom:8px">

        <div style="display:flex;justify-content:space-between">

            <strong>${entry.datum}</strong>

            <strong>${formatMinutes(minutes)}</strong>

        </div>

        <div style="margin-top:6px;color:#7eb3e0">

            ${entry.start.substring(11,16)}
            bis
            ${entry.ende.substring(11,16)}

        </div>

    </div>

        `;

    });

    container.innerHTML += `

<div class="card" style="margin-top:15px">

    <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        font-size:20px;
        font-weight:700;
    ">

        <span>⏱ Gesamtstunden</span>

        <span style="color:#4fc3f7">

            ${formatMinutes(totalMinutes)}

        </span>

    </div>

</div>

<button
    class="btnP"
    style="width:100%;margin-top:15px;padding:14px"
    onclick="generateWorkJournalPDF()">

    📄 Arbeitszeitnachweis als PDF

</button>
`;

}
function loadEmployeeData() {

    document.getElementById("azMitarbeiter").value =
        AppData.mitarbeiter.name || "";

    document.getElementById("azPersonalnummer").value =
        AppData.mitarbeiter.personalnummer || "";

}
