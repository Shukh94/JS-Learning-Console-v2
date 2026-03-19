import { createEditor } from "./editor.js"

const editor = createEditor()

/* DOM */

const runBtn = document.getElementById("runBtn")
const formatBtn = document.getElementById("formatBtn")
const hintBtn = document.getElementById("hintBtn")

const copyBtn = document.getElementById("copyBtn")
const clearBtn = document.getElementById("clearBtn")
const resetBtn = document.getElementById("resetBtn")
const shareBtn = document.getElementById("shareBtn")
const exportBtn = document.getElementById("exportBtn")
const importBtn = document.getElementById("importBtn")

const themeBtn = document.getElementById("themeBtn")
const modeBtn = document.getElementById("modeBtn")

const consoleEl = document.getElementById("console")
const statusEl = document.getElementById("status")

const fileInput = document.getElementById("fileInput")

/* =====================
RUN
===================== */

runBtn.onclick = () => {

const code = editor.getValue()

consoleEl.innerHTML = ""

try {

const logs = []

const originalLog = console.log

console.log = (...args) => {
logs.push(args.join(" "))
}

new Function(code)()

console.log = originalLog

consoleEl.innerHTML =
logs.map(l => `<div>${l}</div>`).join("")

statusEl.innerText = "Executed"

}

catch(e){

consoleEl.innerHTML = `<div style="color:#ff4d4f">${e.message}</div>`

statusEl.innerText = "Error"

}

}

/* =====================
FORMAT
===================== */

formatBtn.onclick = () => {

try{

const formatted =
prettier.format(editor.getValue(),{
parser:"babel",
plugins:[prettierPlugins.babel]
})

editor.setValue(formatted)

statusEl.innerText="Formatted"

}catch{

statusEl.innerText="Format error"

}

}

/* =====================
HINT
===================== */

hintBtn.onclick = () => {

consoleEl.innerHTML =
"<div>Hint system coming soon</div>"

}

/* =====================
COPY
===================== */

copyBtn.onclick = () => {

navigator.clipboard.writeText(editor.getValue())

statusEl.innerText="Copied"

}

/* =====================
CLEAR
===================== */

clearBtn.onclick = () => {

editor.setValue("")
consoleEl.innerHTML=""

statusEl.innerText="Cleared"

}

/* =====================
RESET
===================== */

resetBtn.onclick = () => {

if(!confirm("Reset everything?")) return

localStorage.clear()
location.reload()

}

/* =====================
SHARE
===================== */

shareBtn.onclick = () => {

const code = editor.getValue()

const encoded =
btoa(unescape(encodeURIComponent(code)))

const url =
location.origin +
location.pathname +
"?code=" + encoded

navigator.clipboard.writeText(url)

statusEl.innerText="Share link copied"

}

/* =====================
EXPORT
===================== */

exportBtn.onclick = () => {

const blob =
new Blob([editor.getValue()],{
type:"text/javascript"
})

const url = URL.createObjectURL(blob)

const a = document.createElement("a")

a.href = url
a.download = "code.js"

a.click()

}

/* =====================
IMPORT
===================== */

importBtn.onclick = () => {

fileInput.click()

}

fileInput.onchange = (e) => {

const file = e.target.files[0]

if(!file) return

const reader = new FileReader()

reader.onload = (ev) => {

editor.setValue(ev.target.result)

}

reader.readAsText(file)

}

/* =====================
THEME
===================== */

themeBtn.onclick = () => {

document.body.classList.toggle("dark")

}

/* =====================
MODE
===================== */

let practice = false

modeBtn.onclick = () => {

practice = !practice

if(practice){

modeBtn.innerText="Challenge"

statusEl.innerText="Practice mode"

}
else{

modeBtn.innerText="Practice"

statusEl.innerText="Challenge mode"

}

}