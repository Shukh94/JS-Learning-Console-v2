export function runCode(code){

let logs=[]

const oldLog=console.log

console.log=(...args)=>{

logs.push(args.join(" "))

}

try{

new Function(code)()

}catch(e){

logs.push("Error: "+e.message)

}

console.log=oldLog

return logs

}