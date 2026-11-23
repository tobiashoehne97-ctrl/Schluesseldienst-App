const AppData = {
    arbeitszeit: {
    eingestempelt: false,
    start: null,

    eintraege: [],

    letzterIndex: 0
},

    auftraege: [],

    archiv: [],

    kunden: {
    liste: [],
    letzterIndex: 0
},
    mitarbeiter: {
    name: "",
    personalnummer: ""
},
    dokumente: [],

    statistik: {
        umsatzHeute: 0,
        dokumenteHeute: 0,
        arbeitszeitHeute: 0
    }
};

// Explizit freigeben: Notdienst- und Workflow-Module greifen über window.AppData zu.
// Beide Zugriffe müssen dieselbe Datenstruktur verwenden.
window.AppData = AppData;
