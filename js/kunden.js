let currentCustomerId = null;
function generateCustomerId(){

    AppData.kunden.letzterIndex++;

    return "KD-" +
        String(AppData.kunden.letzterIndex).padStart(6,"0");

}
function createCustomer(customerData) {

    const existingCustomer = customerExists(
    customerData.vorname,
    customerData.nachname,
    customerData.strasse
);

if (existingCustomer) {
    return existingCustomer;
}

    const customer = {
        id: generateCustomerId(),

        typ: customerData.typ || "privat",

        vorname: customerData.vorname || "",

        nachname: customerData.nachname || "",

        firma: customerData.firma || "",

        strasse: customerData.strasse || "",

        plz: customerData.plz || "",

        ort: customerData.ort || "",

        telefon: customerData.telefon || "",

        email: customerData.email || "",

        erstelltAm: new Date().toISOString(),

        letzterBesuch: null
    };

    AppData.kunden.liste.push(customer);

    saveAppData();

    if (typeof EventBus !== "undefined") {
        EventBus.publish("kunde:created", customer);
    }

    return customer;
}
function customerExists(vorname, nachname, strasse) {

    return AppData.kunden.liste.find(customer => {

        return (
            customer.vorname.trim().toLowerCase() === vorname.trim().toLowerCase() &&
            customer.nachname.trim().toLowerCase() === nachname.trim().toLowerCase() &&
            customer.strasse.trim().toLowerCase() === strasse.trim().toLowerCase()
        );

    }) || null;

}
function getCustomerById(id) {

    return AppData.kunden.liste.find(customer => customer.id === id) || null;

}
function findCustomers(searchText) {

    if (!searchText) {
        return AppData.kunden.liste;
    }

    const search = searchText.trim().toLowerCase();

    return AppData.kunden.liste.filter(customer => {

        return (

            customer.id.toLowerCase().includes(search) ||

            customer.vorname.toLowerCase().includes(search) ||

            customer.nachname.toLowerCase().includes(search) ||

            customer.firma.toLowerCase().includes(search) ||

            customer.telefon.toLowerCase().includes(search) ||

            customer.ort.toLowerCase().includes(search)

        );

    });

}
function getAllCustomers() {

    return [...AppData.kunden.liste];

}
function updateCustomer(id, updatedData) {

    const customer = getCustomerById(id);

    if (!customer) {
        return false;
    }

    Object.assign(customer, updatedData);

    saveAppData();

    if (typeof EventBus !== "undefined") {
        EventBus.publish("kunde:updated", customer);
    }

    return true;

}
function deleteCustomer(id) {

    const index = AppData.kunden.liste.findIndex(
        customer => customer.id === id
    );

    if (index === -1) {
        return false;
    }

    const deletedCustomer = AppData.kunden.liste[index];

    AppData.kunden.liste.splice(index, 1);

    saveAppData();

    if (typeof EventBus !== "undefined") {
        EventBus.publish("kunde:deleted", deletedCustomer);
    }

    return true;

}
function testCustomerModule() {

    console.clear();

    console.log("===== TEST KUNDENMODUL =====");

    // Kunde anlegen
    const kunde = createCustomer({
        vorname: "Max",
        nachname: "Mustermann",
        strasse: "Musterstraße 1",
        plz: "92224",
        ort: "Amberg",
        telefon: "01701234567"
    });

    console.log("Kunde erstellt:", kunde);

    // Kunde suchen
    console.log("Suche:", findCustomers("Mustermann"));

    // Kunde bearbeiten
    updateCustomer(kunde.id, {
        telefon: "099999999",
        email: "max@test.de"
    });

    console.log("Nach Update:", getCustomerById(kunde.id));

    // Alle Kunden
    console.log("Alle Kunden:", getAllCustomers());

    // Kunde löschen
    deleteCustomer(kunde.id);

    console.log("Nach Löschen:", getCustomerById(kunde.id));

    console.log("===== TEST ENDE =====");

}
function saveCustomer() {

    const customerData = {

        vorname: document.getElementById("kundeVorname").value,

        nachname: document.getElementById("kundeNachname").value,

        firma: document.getElementById("kundeFirma").value,

        strasse: document.getElementById("kundeStrasse").value,

        plz: document.getElementById("kundePlz").value,

        ort: document.getElementById("kundeOrt").value,

        telefon: document.getElementById("kundeTelefon").value,

        email: document.getElementById("kundeEmail").value

    };

    if (currentCustomerId) {

        updateCustomer(currentCustomerId, customerData);

        currentCustomerId = null;

    } else {

        createCustomer(customerData);

    }

    renderCustomerList();

    clearCustomerForm();

}
function clearCustomerForm() {

    document.getElementById("kundeVorname").value = "";
    document.getElementById("kundeNachname").value = "";
    document.getElementById("kundeFirma").value = "";
    document.getElementById("kundeStrasse").value = "";
    document.getElementById("kundePlz").value = "";
    document.getElementById("kundeOrt").value = "";
    document.getElementById("kundeTelefon").value = "";
    document.getElementById("kundeEmail").value = "";

}
function renderCustomerList() {

    const container = document.getElementById("customerList");

    if (!container) return;

    container.innerHTML = "";

    const customers = getAllCustomers();

    if (customers.length === 0) {

        container.innerHTML = "<p>Noch keine Kunden vorhanden.</p>";
        return;

    }

    customers.forEach(customer => {

        const card = document.createElement("div");

        card.className = "card";
        card.style.marginBottom = "10px";

        card.innerHTML = `
    <strong>${customer.nachname}, ${customer.vorname}</strong><br>
    ${customer.strasse}<br>
    ${customer.plz} ${customer.ort}<br>
    📞 ${customer.telefon}

    <div style="margin-top:12px;display:flex;gap:10px">

        <button class="btnS"
            onclick="editCustomer('${customer.id}')">
            ✏️ Bearbeiten
        </button>

        <button class="btnD"
            onclick="removeCustomer('${customer.id}')">
            🗑 Löschen
        </button>

    </div>
`;
        

        container.appendChild(card);

    });

}
function removeCustomer(id) {

    if (!confirm("Kunde wirklich löschen?")) {
        return;
    }

    deleteCustomer(id);

    renderCustomerList();

}
function editCustomer(id) {

    const customer = getCustomerById(id);

    if (!customer) return;

    currentCustomerId = id;

    document.getElementById("kundeVorname").value = customer.vorname;
    document.getElementById("kundeNachname").value = customer.nachname;
    document.getElementById("kundeFirma").value = customer.firma;
    document.getElementById("kundeStrasse").value = customer.strasse;
    document.getElementById("kundePlz").value = customer.plz;
    document.getElementById("kundeOrt").value = customer.ort;
    document.getElementById("kundeTelefon").value = customer.telefon;
    document.getElementById("kundeEmail").value = customer.email;

}