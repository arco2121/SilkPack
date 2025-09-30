if(document.querySelectorAll(".full"))
{
    document.querySelectorAll(".full").forEach(full => {
        full.addEventListener("click",()=>{
            full.style.animation = "diappear 0.5s ease forwards"
            setTimeout(()=> {
                full.remove()
            },510)
        })
    })
}