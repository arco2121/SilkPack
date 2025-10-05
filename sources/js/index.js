const beforeUnload = (e,collega) => {
    e.preventDefault()
    document.querySelector(".struct").style.animation = "disappear 0.3s forwards ease"
    document.body.style.animation = "appearBackground 0.2s ease"
    setTimeout(()=>{
        window.location.href = collega
    },700)
}

document.querySelectorAll("a").forEach(collegamento => {
    collegamento.addEventListener("click", (e)=>{
        beforeUnload(e,collegamento.href)
    })
})
document.querySelectorAll("form").forEach(collegamento => {
    collegamento.addEventListener("submit", (e)=>{
        beforeUnload(e,collegamento.action)
    })
})
document.getElementById("webs-search").addEventListener("change",(e) => {
    beforeUnload(e,'/explore/?search=' + document.getElementById("webs-search").value)
})