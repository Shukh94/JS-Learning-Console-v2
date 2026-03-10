export function runUserCode(code){

const logs = []

try{

const fakeConsole = {

log: (...args)=>{
logs.push({
type:"log",
text: args.join(" ")
})
},

warn: (...args)=>{
logs.push({
type:"warn",
text: args.join(" ")
})
},

error: (...args)=>{
logs.push({
type:"error",
text: args.join(" ")
})
}

}

const fn = new Function(
"console",
'"use strict";\n' + code
)

fn(fakeConsole)

return {
logs
}

}

catch(e){

return {
error: e.message
}

}

}