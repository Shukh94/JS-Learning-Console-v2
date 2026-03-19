export function createEditor(){

return CodeMirror.fromTextArea(
document.getElementById("editor"),
{
mode:"javascript",
lineNumbers:true
})

}