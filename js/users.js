function openUserModal(id) {
    const user = id ? USERS.find(u => u.id === id) : null;
    if (id && !user) return;

    openModal({
        title: user ? "Editar usuario" : "Nuevo usuario",
        body: `
            <div class="form-group">
                <label>Nombre completo</label>
                <input id="userName" type="text" placeholder="Ej. Maria Lopez">
            </div>
            <div class="form-group">
                <label>Correo</label>
                <input id="userEmail" type="email" placeholder="correo@demo.com">
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Rol</label>
                    <select id="userRole">
                        ${ROLES.map(r => `<option>${r}</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select id="userStatus">
                        <option>Activo</option>
                        <option>Inactivo</option>
                    </select>
                </div>
            </div>
        `,
        footer: `
            <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
            <button id="saveUserBtn" class="btn btn-primary">Guardar</button>
        `,
        onOpen: (refs) => {
            if (user) {
                refs.body.querySelector("#userName").value = user.name;
                refs.body.querySelector("#userEmail").value = user.email;
                refs.body.querySelector("#userRole").value = user.role;
                refs.body.querySelector("#userStatus").value = user.status;
            }

            refs.footer.querySelector("#saveUserBtn").addEventListener("click", () => saveUser(id));

            refs.body.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && e.target.tagName === "INPUT") {
                    e.preventDefault();
                    saveUser(id);
                }
            });
        }
    });
}

function saveUser(id) {
    const nameInput = document.getElementById("userName");
    const emailInput = document.getElementById("userEmail");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const role = document.getElementById("userRole").value;
    const status = document.getElementById("userStatus").value;

    if (!name) {
        setModalError("Escribe el nombre del usuario.");
        nameInput.focus();
        return;
    }

    if (!email.includes("@") || !email.includes(".")) {
        setModalError("Escribe un correo valido.");
        emailInput.focus();
        return;
    }

    if (USERS.some(u => u.id !== id && u.email.toLowerCase() === email)) {
        setModalError("Ya existe un usuario con ese correo.");
        emailInput.select();
        return;
    }

    if (id) {
        const user = USERS.find(u => u.id === id);
        const previousName = user.name;

        user.name = name;
        user.email = email;
        user.role = role;
        user.status = status;

        if (previousName !== name) applyUserRename(previousName, name);
    } else {
        USERS.push({ id: uid("u"), name, email, role, status });
    }

    if (role === "Vendedor" && !VENDORS.includes(name)) VENDORS.push(name);

    closeModal();
    showToast(id ? "Usuario actualizado" : "Usuario creado");
    render();
}

function applyUserRename(previousName, name) {
    const index = VENDORS.indexOf(previousName);
    if (index !== -1) VENDORS[index] = name;

    state.quotes.forEach(q => {
        if (q.vendor === previousName) q.vendor = name;
        q.history.forEach(h => {
            if (h.user === previousName) h.user = name;
        });
    });

    if (state.filters.vendor === previousName) state.filters.vendor = name;
    if (state.user && state.user.name === previousName) state.user.name = name;
}