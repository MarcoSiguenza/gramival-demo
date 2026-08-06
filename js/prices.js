let municipalities = [];
function openNewLocationModal() {
    openModal({
        title: "Nueva ubicación",
        body: `
            <div class="form-group">
                <label>Departamento</label>
                <input
                    id="newDept"
                    type="text"
                    placeholder="Ej. Quetzaltenango"
                >
            </div>
            <div class="form-group">
                <label>Municipio</label>
                <div class="flex-gap">
                    <input
                        id="municipalityInput"
                        type="text"
                        placeholder="Ej. Olintepeque"
                    >
                    <button
                        id="addMunicipalityBtn"
                        class="btn btn-primary"
                    >
                        +
                    </button>
                </div>
                <div id="municipalityList"></div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Precio Urbana</label>
                    <input
                        id="urbanPrice"
                        type="number"
                        min="0"
                    >
                </div>
                <div class="form-group">

                    <label>Precio Rural</label>
                    <input
                        id="ruralPrice"
                        type="number"
                        min="0"
                    >
                </div>
            </div>
        `,
        footer: `
            <button class="btn btn-secondary" onclick="closeModal()">
                Cancelar
            </button>
            <button class="btn btn-primary">
                Guardar
            </button>
        `
    });
}