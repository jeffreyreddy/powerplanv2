// Preset device types and typical wattages
const deviceTypes = [
    { name: "Laptop", power: 65 },
    { name: "Desktop", power: 150 },
    { name: "Server", power: 400 },
    { name: "Network Switch", power: 50 },
    { name: "Router", power: 30 },
    { name: "Monitor", power: 25 },
];

function addDeviceRow(typeIdx = 0, qty = 1, power = null) {
    const table = document.getElementById('deviceTable').getElementsByTagName('tbody')[0];
    const row = table.insertRow();

    // Device Type dropdown
    const cellType = row.insertCell();
    const selectType = document.createElement('select');
    selectType.onchange = function() {
        const idx = selectType.selectedIndex;
        inputPower.value = deviceTypes[idx].power;
    };
    deviceTypes.forEach((dt, idx) => {
        const opt = document.createElement('option');
        opt.value = dt.name;
        opt.text = dt.name;
        selectType.appendChild(opt);
    });
    selectType.selectedIndex = typeIdx;
    cellType.appendChild(selectType);

    // Quantity input
    const cellQty = row.insertCell();
    const inputQty = document.createElement('input');
    inputQty.type = "number";
    inputQty.min = "1";
    inputQty.value = qty;
    cellQty.appendChild(inputQty);

    // Power input
    const cellPower = row.insertCell();
    const inputPower = document.createElement('input');
    inputPower.type = "number";
    inputPower.min = "1";
    inputPower.value = power !== null ? power : deviceTypes[typeIdx].power;
    cellPower.appendChild(inputPower);

    // Remove button
    const cellRemove = row.insertCell();
    const btnRemove = document.createElement('button');
    btnRemove.type = "button";
    btnRemove.innerText = "Remove";
    btnRemove.onclick = function() {
        table.deleteRow(row.rowIndex - 1);
    };
    cellRemove.appendChild(btnRemove);
}

// Add initial device row
window.onload = function() {
    addDeviceRow();
};

function calculatePowerPlan() {
    const generatorSize = parseInt(document.getElementById('generatorSize').value);

    // Gather device info
    const table = document.getElementById('deviceTable').getElementsByTagName('tbody')[0];
    let totalLoad = 0;
    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows[i];
        const qty = parseInt(row.cells[1].firstChild.value);
        const power = parseInt(row.cells[2].firstChild.value);
        totalLoad += qty * power;
    }

    const percentUsed = ((totalLoad / generatorSize) * 100).toFixed(1);

    // Simple runtime estimate: assume 8 hours at full load
    const fullLoadRuntimeHours = 8;
    const estimatedRuntime = ((generatorSize / totalLoad) * fullLoadRuntimeHours).toFixed(2);

    document.getElementById('results').innerHTML = `
        <h2>Results</h2>
        <p>Total Load: <strong>${totalLoad} W</strong></p>
        <p>Generator Output Used: <strong>${percentUsed}%</strong></p>
        <p>Estimated Runtime: <strong>${estimatedRuntime} hours</strong></p>
    `;
}