export function renderCategories(state, loadChallenge){

const catEl = document.getElementById("categoryList")

catEl.innerHTML=""

state.categories.forEach(cat=>{

/* CATEGORY TITLE */

const title = document.createElement("div")
title.className = "category"
title.innerText = cat.name

catEl.appendChild(title)

/* CHALLENGES */

cat.challenges.forEach(ch=>{

const item = document.createElement("div")

item.className = "challenge"

item.innerText = ch.title

item.onclick = ()=> loadChallenge(ch)

catEl.appendChild(item)

})

})

}