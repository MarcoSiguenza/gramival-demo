let municipalities = [];

function openNewLocationModal() {
    municipalities = [];

    openModal({
        title: "Nueva ubicación",
        body: `
            <div class="form-group">
                <label>Departamento</label>
                <input id="newDept" type="text" placeholder="Ej. Quetzaltenango">
            </div>
            <div class="form-group">
                <label>Municipios</label>
                <div class="flex-gap">
                    <input id="municipalityInput" type="text" placeholder="Ej. Olintepeque">
                    <button id="addMunicipalityBtn" class="btn btn-primary">+</button>
                </div>
                <div id="municipalityList"></div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Precio Urbana</label>
                    <input id="urbanPrice" type="number" min="0">
                </div>
                <div class="form-group">
                    <label>Precio Rural</label>
                    <input id="ruralPrice" type="number" min="0">
                </div>
            </div>
        `,
        footer: `
            <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
            <button id="saveLocationBtn" class="btn btn-primary">Guardar</button>
        `,
        onOpen: (refs) => {
            refs.body.querySelector("#addMunicipalityBtn").addEventListener("click", addMunicipality);
            refs.body.querySelector("#municipalityInput").addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    addMunicipality();
                }
            });
            refs.footer.querySelector("#saveLocationBtn").addEventListener("click", saveLocation);
            renderMunicipalityList();
        }
    });
}

function renderMunicipalityList() {
    const list = document.getElementById("municipalityList");
    if (!list) return;

    list.innerHTML = "";
    list.className = municipalities.length ? "chip-list" : "";

    municipalities.forEach((name, index) => {
        const chip = document.createElement("span");
        chip.className = "pill pill-on chip";
        chip.textContent = name;

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "chip-remove";
        remove.textContent = "×";
        remove.addEventListener("click", () => {
            municipalities.splice(index, 1);
            renderMunicipalityList();
        });

        chip.appendChild(remove);
        list.appendChild(chip);
    });
}

function addMunicipality() {
    const input = document.getElementById("municipalityInput");
    const name = input.value.trim();

    if (!name) {
        input.focus();
        return;
    }

    if (municipalities.some(m => m.toLowerCase() === name.toLowerCase())) {
        setModalError("Ese municipio ya está en la lista.");
        input.select();
        return;
    }

    municipalities.push(name);
    input.value = "";
    input.focus();
    setModalError("");
    renderMunicipalityList();
}

function setZonePrice(dept, zone, price) {
    const row = PRICE_BY_ZONE.find(p => p.dept.toLowerCase() === dept.toLowerCase() && p.zone === zone);
    if (row) {
        row.price = price;
    } else {
        PRICE_BY_ZONE.push({ dept, zone, price });
    }
}

function saveLocation() {
    const deptInput = document.getElementById("newDept");
    const urbanInput = document.getElementById("urbanPrice");
    const ruralInput = document.getElementById("ruralPrice");

    const dept = deptInput.value.trim();
    const urban = Number(urbanInput.value);
    const rural = Number(ruralInput.value);

    if (!dept) {
        setModalError("Escribe el nombre del departamento.");
        deptInput.focus();
        return;
    }

    if (!municipalities.length) {
        setModalError("Agrega al menos un municipio con el botón +.");
        document.getElementById("municipalityInput").focus();
        return;
    }

    if (!urban || urban <= 0) {
        setModalError("El precio urbano debe ser mayor a cero.");
        urbanInput.focus();
        return;
    }

    if (!rural || rural <= 0) {
        setModalError("El precio rural debe ser mayor a cero.");
        ruralInput.focus();
        return;
    }

    const existing = Object.keys(DEPARTMENTS).find(d => d.toLowerCase() === dept.toLowerCase());
    const key = existing || dept;

    const merged = (DEPARTMENTS[key] || []).slice();
    municipalities.forEach(m => {
        if (!merged.some(x => x.toLowerCase() === m.toLowerCase())) merged.push(m);
    });
    DEPARTMENTS[key] = merged;

    setZonePrice(key, "Urbana", urban);
    setZonePrice(key, "Rural", rural);

    closeModal();
    render();
}

function openEditGrassPriceModal(id) {
    const grass = GRASS_TYPES.find(g => g.id === id);
    if (!grass) return;

    openModal({
        title: "Editar precio base",
        body: `
            <div class="form-group">
                <label>Tipo de grama</label>
                <p class="muted">${grass.name}</p>
            </div>
            <div class="form-group">
                <label>Precio por ${grass.unit}</label>
                <input id="grassPrice" type="number" min="0" step="0.01" value="${grass.price}">
            </div>
        `,
        footer: `
            <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
            <button id="saveGrassPriceBtn" class="btn btn-primary">Guardar</button>
        `,
        onOpen: (refs) => {
            const input = refs.body.querySelector("#grassPrice");
            input.select();

            refs.footer.querySelector("#saveGrassPriceBtn").addEventListener("click", () => saveGrassPrice(id));
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    saveGrassPrice(id);
                }
            });
        }
    });
}

function saveGrassPrice(id) {
    const grass = GRASS_TYPES.find(g => g.id === id);
    const input = document.getElementById("grassPrice");
    const price = Number(input.value);

    if (!price || price <= 0) {
        setModalError("El precio debe ser mayor a cero.");
        input.focus();
        return;
    }

    grass.price = price;
    closeModal();
    render();
}