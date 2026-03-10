export function initResize(){

if(window.innerWidth < 900) return

const divider = document.getElementById("divider")
const workspace = document.querySelector(".workspace")

if(!divider) return

let isDragging = false

divider.addEventListener("mousedown",()=>{

isDragging = true

})

document.addEventListener("mousemove",(e)=>{

if(!isDragging) return

const containerWidth = workspace.offsetWidth
const offsetLeft = workspace.getBoundingClientRect().left

const pointerX = e.clientX - offsetLeft

const leftWidth = (pointerX/containerWidth)*100
const rightWidth = 100 - leftWidth

workspace.style.gridTemplateColumns =
`${leftWidth}% 6px ${rightWidth}%`

})

document.addEventListener("mouseup",()=>{

isDragging = false

})

}