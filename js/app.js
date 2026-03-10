/* =================================
IMPORT MODULES
================================= */

import { createEditor } from "./editor.js"
import { runUserCode } from "./consoleCapture.js"
import { runTests } from "./challengeEngine.js"
import { calculateXP } from "./xpSystem.js"
import { save, load } from "./storage.js"
import { setStatus, renderOutput, clearOutput } from "./ui.js"
import { initResize } from "./resize.js"

/* =================================
APP START
================================= */

document.addEventListener("DOMContentLoaded", () => {

/* =================================
STATE
================================= */

let challenges = []

let currentLevel = load("currentLevel",0)
let unlockedLevel = load("unlockedLevel",0)
let userXP = load("userXP",0)

let currentMode = load("mode","challenge")

/* PROJECT SYSTEM */

let currentProject = load("currentProject","default")

let projects = load("projects",{
"default":"// Start coding"
})

let practiceInitialized = false

/* =================================
URL SHARE UTILS
================================= */

function encodeCode(code){

return btoa(unescape(encodeURIComponent(code)))

}

function decodeCode(encoded){

try{

return decodeURIComponent(escape(atob(encoded)))

}
catch{

return null

}

}

/* =================================
DEBOUNCE
================================= */

function debounce(fn,delay=400){

let timer

return function(...args){

clearTimeout(timer)

timer = setTimeout(()=>{

fn.apply(this,args)

},delay)

}

}

/* =================================
EDITOR
================================= */

const editor = createEditor()

initResize()

/* =================================
ERROR HIGHLIGHT
================================= */

let errorLineMarker = null

function highlightErrorLine(line){

if(errorLineMarker !== null){
editor.removeLineClass(errorLineMarker,"background","error-line")
}

errorLineMarker = line

editor.addLineClass(line,"background","error-line")

editor.scrollIntoView({line,ch:0},100)

}

function clearErrorHighlight(){

if(errorLineMarker !== null){

editor.removeLineClass(errorLineMarker,"background","error-line")

errorLineMarker = null

}

}

/* =================================
DOM
================================= */

const runBtn = document.getElementById("runBtn")
const modeBtn = document.getElementById("modeBtn")
const prevBtn = document.getElementById("prevLevel")
const nextBtn = document.getElementById("nextLevel")

const resetBtn = document.getElementById("resetBtn")
const copyBtn = document.getElementById("copyBtn")
const clearBtn = document.getElementById("clearBtn")
const themeBtn = document.getElementById("themeBtn")
const hintBtn = document.getElementById("hintBtn")

const output = document.getElementById("output")
const status = document.getElementById("statusBadge")

const xpValue = document.getElementById("xpValue")
const progressFill = document.getElementById("progressFill")
const levelMap = document.getElementById("levelMap")
const shareBtn = document.getElementById("shareBtn")

const downloadBtn = document.getElementById("downloadBtn")
const uploadBtn = document.getElementById("uploadBtn")
const fileInput = document.getElementById("fileInput")
const formatBtn = document.getElementById("formatBtn")

/* PROJECT DOM */

const projectSelect = document.getElementById("projectSelect")
const newProjectBtn = document.getElementById("newProjectBtn")
const deleteProjectBtn = document.getElementById("deleteProjectBtn")

/* =================================
PROJECT FUNCTIONS
================================= */

function renderProjects(){

projectSelect.innerHTML=""

Object.keys(projects).forEach(name=>{

const option = document.createElement("option")

option.value = name
option.textContent = name

if(name === currentProject){
option.selected = true
}

projectSelect.appendChild(option)

})

}

function loadProject(){

const code = projects[currentProject] || ""

editor.setValue(code)

clearOutput(output)

setStatus(status,"ready","Ready")

}

function saveCurrentProject(){

projects[currentProject] = editor.getValue()

save("projects",projects)

}

/* SWITCH PROJECT */

projectSelect.addEventListener("change",()=>{

saveCurrentProject()

currentProject = projectSelect.value

save("currentProject",currentProject)

loadProject()

})

/* NEW PROJECT */

newProjectBtn.addEventListener("click",()=>{

const name = prompt("Project name")

if(!name) return

projects[name] = ""

currentProject = name

save("projects",projects)
save("currentProject",currentProject)

renderProjects()
loadProject()

})

/* DELETE PROJECT */

deleteProjectBtn.addEventListener("click",()=>{

if(currentProject === "default"){

alert("Default project cannot be deleted")
return

}

delete projects[currentProject]

currentProject = "default"

save("projects",projects)
save("currentProject",currentProject)

renderProjects()
loadProject()

})

/* =================================
LOAD CODE FROM URL
================================= */

const urlParams = new URLSearchParams(window.location.search)

const sharedCode = urlParams.get("code")

if(sharedCode){

const decoded = decodeCode(sharedCode)

if(decoded){

editor.setValue(decoded)

currentMode = "practice"

document.body.classList.add("practice")

modeBtn.innerText = "Switch to Challenge"

setStatus(status,"ready","Shared Code Loaded")

}

}

/* =================================
XP PROGRESS
================================= */

function updateProgress(){

xpValue.innerText = userXP

const percent = Math.min(
(unlockedLevel / challenges.length) * 100,
100
)

progressFill.style.width = percent + "%"

}

/* =================================
LEVEL MAP
================================= */

function renderLevelMap(){

levelMap.innerHTML=""

challenges.forEach((ch,index)=>{

const node = document.createElement("div")

node.className="level-node"

if(index < unlockedLevel) node.classList.add("completed")
if(index === currentLevel) node.classList.add("unlocked")
if(index > unlockedLevel) node.classList.add("locked")

node.innerText=index+1

node.addEventListener("click",()=>{

if(index > unlockedLevel){

output.innerHTML=`
<div style="color:#ff4d4f">
🔒 Level locked<br>
Complete previous level first
</div>
`

setStatus(status,"error","Locked")
return

}

currentLevel=index
save("currentLevel",currentLevel)

loadChallenge()

})

levelMap.appendChild(node)

})

}

/* =================================
LOAD CHALLENGE
================================= */

function loadChallenge(){

const ch = challenges[currentLevel]
if(!ch) return

document.getElementById("exampleContainer").style.display="block"

document.getElementById("challengeTitle").innerText=ch.title
document.getElementById("challengeDesc").innerText=ch.description
document.getElementById("difficultyLabel").innerText="Difficulty: "+ch.difficulty
document.getElementById("exampleBox").innerText=ch.example

document.getElementById("levelIndicator").innerText=
`Level ${currentLevel+1} / ${challenges.length}`

const saved = load("challengeCode_"+currentLevel,null)

editor.setValue(saved || `// ${ch.description}

function ${ch.functionName}(n){

}`)

clearOutput(output)

setStatus(status,"ready","Challenge Mode")

updateProgress()
renderLevelMap()

}

/* =================================
LOAD PRACTICE
================================= */

function loadPractice(){

practiceInitialized=false

document.getElementById("challengeTitle").innerText="Practice Mode"

document.getElementById("challengeDesc").innerText=
"Write JavaScript code. Output updates automatically."

document.getElementById("difficultyLabel").innerText=""

document.getElementById("exampleContainer").style.display="none"

document.getElementById("levelIndicator").innerText=""

loadProject()

setTimeout(()=>{
practiceInitialized=true
},100)

}

/* =================================
RUN CHALLENGE
================================= */

function runChallenge(){

clearErrorHighlight()

const ch = challenges[currentLevel]
const code = editor.getValue()

try{

const fn = new Function(
'"use strict";\n'+
code+
`\nreturn ${ch.functionName}`
)

const userFunc = fn()

if(typeof userFunc !== "function"){
throw new Error("Function not defined")
}

const result = runTests(userFunc,ch.tests)

renderOutput(output,result.results)

if(result.passed === ch.tests.length){

const xpGain = calculateXP(ch.difficulty)

userXP += xpGain
save("userXP",userXP)

if(currentLevel >= unlockedLevel){

unlockedLevel = currentLevel + 1
save("unlockedLevel",unlockedLevel)

}

setStatus(status,"success","Passed")

renderLevelMap()

}
else{
setStatus(status,"error","Failed")
}

save("challengeCode_"+currentLevel,code)

updateProgress()

}

catch(e){

const line = e.stack?.match(/<anonymous>:(\d+):\d+/)

const lineNumber = line ? parseInt(line[1])-1 : null

if(lineNumber !== null){
highlightErrorLine(lineNumber)
}

output.innerHTML=`
<div style="color:#ff4d4f">
❌ ${e.name}: ${e.message}<br>
Line: ${lineNumber ?? "?"}
</div>
`

setStatus(status,"error","Error")

}

}

/* =================================
RUN PRACTICE
================================= */

function runPractice(){

clearErrorHighlight()

const code = editor.getValue().trim()

if(code===""){

output.innerHTML=""

setStatus(status,"ready","Ready")

return

}

const result = runUserCode(code)

if(result.error){

output.innerHTML=`
<div class="console-error">
❌ ${result.error}
</div>
`

setStatus(status,"error","Error")
return

}

output.innerHTML=result.logs.map(log=>{
return `<div class="console-${log.type}">${log.text}</div>`
}).join("")

setStatus(status,"success","Executed")

saveCurrentProject()

}

/* =================================
AUTO RUN PRACTICE
================================= */

const autoRunPractice = debounce(()=>{

if(currentMode !== "practice") return

runPractice()

},500)

/* =================================
RUN ROUTER
================================= */

function runCode(){

if(currentMode==="practice"){
runPractice()
}
else{
runChallenge()
}

}

/* =================================
MODE SWITCH
================================= */

function switchMode(){

if(currentMode==="challenge"){

currentMode="practice"

document.body.classList.add("practice")

modeBtn.innerText="Switch to Challenge"

loadPractice()

}
else{

currentMode="challenge"

document.body.classList.remove("practice")

modeBtn.innerText="Switch to Practice"

loadChallenge()

}

save("mode",currentMode)

}

/* =================================
NAVIGATION
================================= */

prevBtn.addEventListener("click",()=>{

if(currentMode !== "challenge") return

if(currentLevel>0){

currentLevel--

save("currentLevel",currentLevel)

loadChallenge()

}

})

nextBtn.addEventListener("click",()=>{

if(currentMode !== "challenge") return

if(currentLevel + 1 > unlockedLevel){

output.innerHTML=`
<div style="color:#ff4d4f">
🔒 Next level locked
</div>
`

setStatus(status,"error","Locked")
return

}

if(currentLevel < challenges.length - 1){

currentLevel++

save("currentLevel",currentLevel)

loadChallenge()

}

})

/* =================================
UTILITY BUTTONS
================================= */

runBtn.addEventListener("click",runCode)
modeBtn.addEventListener("click",switchMode)

resetBtn.addEventListener("click",()=>{

if(!confirm("Reset progress?")) return

localStorage.clear()

location.reload()

})

copyBtn.addEventListener("click",()=>{

navigator.clipboard.writeText(editor.getValue())

setStatus(status,"success","Copied")

})

formatBtn.addEventListener("click",()=>{

try{

const code = editor.getValue()

const formatted = prettier.format(code,{
 parser:"babel",
 plugins:[prettierPlugins.babel]
})

editor.setValue(formatted)

setStatus(status,"success","Code formatted")

}
catch(e){

console.error(e)

setStatus(status,"error","Format error")

}

})

clearBtn.addEventListener("click",()=>{

if(!confirm("Clear editor and output?")) return

editor.setValue("")
clearOutput(output)

setStatus(status,"ready","Cleared")

})

themeBtn.addEventListener("click",()=>{

document.body.classList.toggle("dark")

})

hintBtn.addEventListener("click",()=>{

if(currentMode !== "challenge") return

const ch = challenges[currentLevel]

output.innerHTML="<strong>Hint:</strong> "+ch.hint

})

shareBtn.addEventListener("click",()=>{

const code = editor.getValue()

if(!code.trim()){

alert("Nothing to share")

return

}

const encoded = encodeCode(code)

const url =
window.location.origin +
window.location.pathname +
"?code=" + encoded

navigator.clipboard.writeText(url)

setStatus(status,"success","Share link copied")

})

/* =================================
EXPORT CODE
================================= */

downloadBtn.addEventListener("click",()=>{

const code = editor.getValue()

if(!code.trim()){

alert("Nothing to export")

return

}

const blob = new Blob([code],{type:"text/javascript"})

const url = URL.createObjectURL(blob)

const a = document.createElement("a")

a.href = url

a.download = "js-console-code.js"

a.click()

URL.revokeObjectURL(url)

setStatus(status,"success","File downloaded")

})

/* =================================
IMPORT CODE
================================= */

uploadBtn.addEventListener("click",()=>{

fileInput.click()

})

fileInput.addEventListener("change",(e)=>{

const file = e.target.files[0]

if(!file) return

const reader = new FileReader()

reader.onload = function(event){

const code = event.target.result

editor.setValue(code)

setStatus(status,"success","File loaded")

}

reader.readAsText(file)

})

/* =================================
LIVE CONSOLE
================================= */

editor.on("change",()=>{

if(currentMode==="practice" && practiceInitialized){

autoRunPractice()

}

})

/* =================================
AUTOCOMPLETE ON TYPING
================================= */

editor.on("keyup",(cm,event)=>{

if(!cm.state.completionActive &&
event.key.length === 1){

CodeMirror.commands.autocomplete(cm,null,{
completeSingle:false
})

}

})

/* =================================
AUTOCOMPLETE AFTER DOT
================================= */

editor.on("inputRead",(cm,change)=>{

if(change.origin !== "+input") return

const lastChar = change.text[0]

if(lastChar === "."){

CodeMirror.commands.autocomplete(cm,null,{
completeSingle:false
})

}

})


/* =================================
KEYBOARD SHORTCUT
================================= */

editor.addKeyMap({

"Ctrl-Enter":runCode,
"Cmd-Enter":runCode

})

/* =================================
FETCH CHALLENGES
================================= */

fetch("../data/challenges.json")

.then(res=>res.json())

.then(data=>{

challenges=data

renderProjects()
renderLevelMap()

if(currentMode==="practice"){

document.body.classList.add("practice")

modeBtn.innerText="Switch to Challenge"

loadPractice()

}
else{

modeBtn.innerText="Switch to Practice"

loadChallenge()

}

})
})