// Supported device types and their SVGs and default wattages:
const deviceTypes = [
  {
    name: "PMFWS",
    svg: `<svg viewBox="0 0 48 48"><rect fill="#bfe1fd" x="6" y="10" width="36" height="20" rx="3"/><rect fill="#999" x="10" y="32" width="28" height="4" rx="1"/><rect x="32" y="34" width="4" height="2" fill="#5cb371"/></svg>`,
    power: 120,
  },
  {
    name: "Tactical Radio",
    svg: `<svg viewBox="0 0 48 48"><rect x="15" y="16" width="18" height="22" rx="4" fill="#95a5a6"/><rect x="18" y="11" width="12" height="7" rx="2" fill="#666"/><rect x="20" y="6" width="8" height="7" rx="1" fill="#85929e"/><circle cx="24" cy="34" r="2" fill="#2c3e50"/></svg>`,
    power: 80,
  },
  {
    name: "Secure Router/Switch",
    svg: `<svg viewBox="0 0 48 48"><rect x="8" y="18" width="32" height="14" rx="3" fill="#dae8fc"/><rect x="12" y="24" width="4" height="4" fill="#5886a5"/><rect x="20" y="24" width="4" height="4" fill="#5886a5"/><rect x="28" y="24" width="4" height="4" fill="#5886a5"/><rect x="36" y="24" width="4" height="4" fill="#5886a5"/></svg>`,
    power: 65,
  },
  {
    name: "IFS",
    svg: `<svg viewBox="0 0 48 48"><rect x="14" y="10" width="20" height="28" rx="4" fill="#d1d8e0"/><rect x="17" y="16" width="14" height="16" fill="#fff"/><circle cx="24" cy="36" r="2" fill="#7b7d7d"/></svg>`,
    power: 150,
  },
  {
    name: "LED Lantern/Field Light",
    svg: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="24" rx="12" ry="8" fill="#ffeb99"/><rect x="21" y="32" width="6" height="8" fill="#919191"/><rect x="22" y="18" width="4" height="8" fill="#fbcd13"/></svg>`,
    power: 20,
  },
  {
    name: "UPS/Power Strip",
    svg: `<svg viewBox="0 0 48 48"><rect x="12" y="12" width="24" height="16" rx="4" fill="#f8c471"/><rect x="18" y="18" width="12" height="4" fill="#fff"/><circle cx="30" cy="26" r="2" fill="#c0392b"/></svg>`,
    power: 160,
  },
  {
    name: "Maxvision Workstation",
    svg: `<svg viewBox="0 0 48 48"><rect x="6" y="17" width="36" height="18" rx="5" fill="#b2bec3"/><rect x="14" y="8" width="20" height="10" rx="2" fill="#6c7a89"/><rect x="14" y="36" width="20" height="4" fill="#444"/><circle cx="36" cy="34" r="3" fill="#6399e1"/></svg>`,
    power: 175,
  },
];

// Storage key for layout
const STORAGE_KEY = "tentLayoutV3";

// State of current tent devices (as array)
let tentDevices = []; // Each: {typeIndex, x, y, id}

function renderPalette() {
    const palette = document.getElementById("palette");
    palette.innerHTML = "";
    deviceTypes.forEach((dev, idx) => {
        const el = document.createElement("div");
        el.className = "palette-device";
        el.draggable = true;
        el.innerHTML = `<div>${dev.svg}</div><div>${dev.name}</div>`;
        el.title = `${dev.name} (${dev.power}W)`;
        el.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("dev-type-index", idx);
        });
        palette.appendChild(el);
    });
}

function renderTent() {
    const tent = document.getElementById("tent-area");
    tent.innerHTML = '<span id="tent-total"></span>';
    tentDevices.forEach((dev, i) => {
        const type = deviceTypes[dev.typeIndex];
        const icon = document.createElement("div");
        icon.className = "device-icon";
        icon.style.left = `${dev.x}px`;
        icon.style.top = `${dev.y}px`;
        icon.setAttribute("data-id", dev.id);
        icon.innerHTML = `
            ${type.svg}
            <div class="remove-btn" title="Remove">&#10006;</div>
            <div style="position:absolute;bottom:-10px;left:0;width:100%;font-size:11px;text-align:center;">${type.power}W</div>
        `;
        // Remove handler
        icon.querySelector(".remove-btn").onclick = function(e) {
            tentDevices = tentDevices.filter(d => d.id !== dev.id);
            renderTent();
        };
        // Drag handler
        icon.onmousedown = function(e) {
            if (e.target.classList.contains("remove-btn")) return;
            let offsetX = e.clientX - icon.offsetLeft;
            let offsetY = e.clientY - icon.offsetTop;
            icon.classList.add("dragging");

            function mousemove(ev) {
                let x = ev.clientX - offsetX;
                let y = ev.clientY - offsetY;
                // Bound inside tent
                x = Math.max(0, Math.min(x, tent.offsetWidth - 48));
                y = Math.max(0, Math.min(y, tent.offsetHeight - 48));
                icon.style.left = `${x}px`;
                icon.style.top = `${y}px`;
                dev.x = x;
                dev.y = y;
            }
            function mouseup() {
                icon.classList.remove("dragging");
                document.removeEventListener("mousemove", mousemove);
                document.removeEventListener("mouseup", mouseup);
            }
            document.addEventListener("mousemove", mousemove);
            document.addEventListener("mouseup", mouseup);
        };
        tent.appendChild(icon);
    });
    updateTentTotal();
}
function updateTentTotal() {
    const tentTotal = document.getElementById("tent-total");
    const total = tentDevices.reduce((sum, dev) => sum + deviceTypes[dev.typeIndex].power, 0);
    tentTotal.textContent = `Total: ${total} W`;
}

// Drop handler for tent area
function setupTentDrop() {
    const tent = document.getElementById("tent-area");
    tent.addEventListener("dragover", (e) => e.preventDefault());
    tent.addEventListener("drop", function(e) {
        e.preventDefault();
        const typeIdx = parseInt(e.dataTransfer.getData("dev-type-index"));
        // Place at mouse position, adjusted for tent relative offset
        const tentRect = tent.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - tentRect.left - 24, tent.offsetWidth - 48));
        const y = Math.max(0, Math.min(e.clientY - tentRect.top - 24, tent.offsetHeight - 48));
        tentDevices.push({
            typeIndex: typeIdx,
            x,
            y,
            id: Date.now() + Math.random() // unique id
        });
        renderTent();
    });
}

// Save and load
function saveLayoutToStorage() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tentDevices));
    alert("Layout saved!");
}
function loadStoredLayout() {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
            tentDevices = JSON.parse(saved);
            renderTent();
            alert("Layout loaded.");
        } else {
            alert("No saved layout.");
        }
    } catch (e) {
        alert("Error loading.");
    }
}

window.onload = () => {
    renderPalette();
    setupTentDrop();
    renderTent();
    document.getElementById('save-layout').onclick = saveLayoutToStorage;
    document.getElementById('load-layout').onclick = loadStoredLayout;
};
