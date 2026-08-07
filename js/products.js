function openProductModal(id) {
    const product = id ? CATALOG.find(c => c.id === id) : null;
    if (id && !product) return;

    openModal({
        title: product ? "Editar producto" : "Nuevo producto o servicio",
        body: `
            <div class="form-group">
                <label>Nombre</label>
                <input id="productName" type="text" placeholder="Ej. Nivelacion de terreno">
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Unidad</label>
                    <select id="productUnit">
                        ${UNITS.map(u => `<option>${u}</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Precio base</label>
                    <input id="productPrice" type="number" min="0" step="0.01">
                </div>
            </div>
            <div class="form-group">
                <label>Estado</label>
                <select id="productStatus">
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                </select>
            </div>
        `,
        footer: `
            <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
            <button id="saveProductBtn" class="btn btn-primary">Guardar</button>
        `,
        onOpen: (refs) => {
            if (product) {
                refs.body.querySelector("#productName").value = product.name;
                refs.body.querySelector("#productUnit").value = product.unit;
                refs.body.querySelector("#productPrice").value = product.price;
                refs.body.querySelector("#productStatus").value = product.active ? "activo" : "inactivo";
            }

            refs.footer.querySelector("#saveProductBtn").addEventListener("click", () => saveProduct(id));

            refs.body.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && e.target.tagName === "INPUT") {
                    e.preventDefault();
                    saveProduct(id);
                }
            });
        }
    });
}

function saveProduct(id) {
    const nameInput = document.getElementById("productName");
    const priceInput = document.getElementById("productPrice");

    const name = nameInput.value.trim();
    const unit = document.getElementById("productUnit").value;
    const price = Number(priceInput.value);
    const active = document.getElementById("productStatus").value === "activo";

    if (!name) {
        setModalError("Escribe el nombre del producto o servicio.");
        nameInput.focus();
        return;
    }

    if (CATALOG.some(c => c.id !== id && c.name.toLowerCase() === name.toLowerCase())) {
        setModalError("Ya existe un producto con ese nombre.");
        nameInput.select();
        return;
    }

    if (!price || price <= 0) {
        setModalError("El precio debe ser mayor a cero.");
        priceInput.focus();
        return;
    }

    if (id) {
        const product = CATALOG.find(c => c.id === id);
        product.name = name;
        product.unit = unit;
        product.price = price;
        product.active = active;
    } else {
        CATALOG.push({ id: uid("p"), name, unit, price, active });
    }

    closeModal();
    render();
}