function fillOptions(select, values, placeholder) {
    select.innerHTML = "";

    const first = document.createElement("option");
    first.value = "";
    first.textContent = placeholder;
    select.appendChild(first);

    values.forEach(value => {
        const option = document.createElement("option");
        option.textContent = value;
        select.appendChild(option);
    });
}

function openFreightModal(id) {
    const freight = id ? FREIGHT.find(f => f.id === id) : null;
    if (id && !freight) return;

    openModal({
        title: freight ? "Editar tarifa de flete" : "Nueva tarifa de flete",
        body: `
            <div class="grid-2">
                <div class="form-group">
                    <label>Departamento</label>
                    <select id="freightDept"></select>
                </div>
                <div class="form-group">
                    <label>Municipio</label>
                    <select id="freightMuni"></select>
                </div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Zona</label>
                    <select id="freightZone">
                        <option>Urbana</option>
                        <option>Rural</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Precio del flete</label>
                    <input id="freightPrice" type="number" min="0" step="0.01">
                </div>
            </div>
        `,
        footer: `
            <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
            <button id="saveFreightBtn" class="btn btn-primary">Guardar</button>
        `,
        onOpen: (refs) => {
            const deptSelect = refs.body.querySelector("#freightDept");
            const muniSelect = refs.body.querySelector("#freightMuni");

            fillOptions(deptSelect, Object.keys(DEPARTMENTS), "Selecciona");
            fillOptions(muniSelect, [], "Selecciona un departamento");

            deptSelect.addEventListener("change", () => {
                fillOptions(muniSelect, DEPARTMENTS[deptSelect.value] || [], "Selecciona");
            });

            if (freight) {
                deptSelect.value = freight.dept;
                fillOptions(muniSelect, DEPARTMENTS[freight.dept] || [], "Selecciona");
                muniSelect.value = freight.muni;
                refs.body.querySelector("#freightZone").value = freight.zone;
                refs.body.querySelector("#freightPrice").value = freight.price;
            }

            refs.footer.querySelector("#saveFreightBtn").addEventListener("click", () => saveFreight(id));
        }
    });
}

function saveFreight(id) {
    const deptSelect = document.getElementById("freightDept");
    const muniSelect = document.getElementById("freightMuni");
    const priceInput = document.getElementById("freightPrice");

    const dept = deptSelect.value;
    const muni = muniSelect.value;
    const zone = document.getElementById("freightZone").value;
    const price = Number(priceInput.value);

    if (!dept) {
        setModalError("Selecciona un departamento.");
        deptSelect.focus();
        return;
    }

    if (!muni) {
        setModalError("Selecciona un municipio.");
        muniSelect.focus();
        return;
    }

    if (!price || price <= 0) {
        setModalError("El precio debe ser mayor a cero.");
        priceInput.focus();
        return;
    }

    if (FREIGHT.some(f => f.id !== id && f.dept === dept && f.muni === muni && f.zone === zone)) {
        setModalError("Ya existe una tarifa para esa combinación.");
        return;
    }

    if (id) {
        const freight = FREIGHT.find(f => f.id === id);
        freight.dept = dept;
        freight.muni = muni;
        freight.zone = zone;
        freight.price = price;
    } else {
        FREIGHT.push({ id: uid("f"), dept, muni, zone, price });
    }

    closeModal();
    render();
}

function openDeleteFreightModal(id) {
    const freight = FREIGHT.find(f => f.id === id);
    if (!freight) return;

    confirmModal({
        title: "Eliminar tarifa",
        message: `Vas a eliminar la tarifa de ${freight.muni}, ${freight.dept} - Zona ${freight.zone}.`,
        detail: "Las cotizaciones ya guardadas no se modifican.",
        confirmLabel: "Eliminar",
        onConfirm: () => deleteFreight(id)
    });
}

function deleteFreight(id) {
    const index = FREIGHT.findIndex(f => f.id === id);
    if (index === -1) return;

    FREIGHT.splice(index, 1);
    closeModal();
    render();
}