export function addXP(state, amount){

state.xp += amount

localStorage.setItem("xp", state.xp)

document.getElementById("xpValue").innerText = state.xp

}

export function loadXP(state){

const saved = localStorage.getItem("xp")

if(saved){

state.xp = parseInt(saved)

}

document.getElementById("xpValue").innerText = state.xp

}