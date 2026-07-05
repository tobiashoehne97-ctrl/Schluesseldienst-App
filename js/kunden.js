const existingCustomer = customerExists(
    customerData.vorname,
    customerData.nachname,
    customerData.strasse
);

if (existingCustomer) {
    return existingCustomer;
}
function generateCustomerId(){

    AppData.kunden.letzterIndex++;

    return "KD-" +
        String(AppData.kunden.letzterIndex).padStart(6,"0");

}
function createCustomer(customerData) {

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