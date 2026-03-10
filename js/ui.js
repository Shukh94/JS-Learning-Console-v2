export function setStatus(statusEl,type,text){

statusEl.className="status "+type
statusEl.innerText=text

}

export function renderOutput(container,results){

let html=""

results.forEach(r=>{

html+=`
<div>
Test ${r.index} :
Expected ${r.expected},
Got ${r.actual}
${r.ok?"✔":"❌"}
</div>
`

})

container.innerHTML=html

}

export function clearOutput(container){

container.innerHTML=""

}