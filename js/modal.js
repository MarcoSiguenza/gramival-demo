const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalFooter = document.getElementById("modalFooter");
const modalCloseBtn = document.getElementById("modalCloseBtn");

function openModal({
    title = "",
    body = "",
    footer = ""
}){
    modalTitle.textContent = title;
    modalBody.innerHTML = body;
    modalFooter.innerHTML = footer;
    modalOverlay.classList.remove("hidden");
}

function closeModal(){
    modalOverlay.classList.add("hidden");
    modalBody.innerHTML="";
    modalFooter.innerHTML="";
}

modalCloseBtn.addEventListener(
    "click",
    closeModal
);

modalOverlay.addEventListener(
    "click",
    e=>{
        if(e.target===modalOverlay){
            closeModal();
        }
    }
);