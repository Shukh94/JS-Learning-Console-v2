export function createEditor(){

const editor = CodeMirror.fromTextArea(
document.getElementById("codeArea"),
{
mode:"javascript",
lineNumbers:true,
theme:"default",

extraKeys:{

"Ctrl-Space":"autocomplete",

Tab:function(cm){

const cursor = cm.getCursor()
const line = cm.getLine(cursor.line)
const beforeCursor = line.slice(0,cursor.ch)

/* SNIPPETS */

const snippets = {

log:"console.log();",

for:`for(let i = 0; i < 10; i++){
    
}`,

func:`function name(){

}`,

if:`if(condition){

}`

}

/* DETECT WORD */

const match = beforeCursor.match(/[a-zA-Z_]+$/)

if(!match){
cm.execCommand("defaultTab")
return
}

const word = match[0]

if(snippets[word]){

const start = cursor.ch - word.length

cm.replaceRange(
snippets[word],
{line:cursor.line,ch:start},
{line:cursor.line,ch:cursor.ch}
)

return
}

/* DEFAULT TAB */

cm.execCommand("defaultTab")

}

}

}
)

return editor

}