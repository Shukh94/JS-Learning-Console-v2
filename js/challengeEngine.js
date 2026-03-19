export function runTests(fn,tests){

let passed=0
let results=[]

tests.forEach(t=>{

let r

try{
r=fn(t.input)
}catch{
r="error"
}

const ok=r===t.expected

if(ok) passed++

results.push({
input:t.input,
expected:t.expected,
result:r,
ok
})

})

return {passed,results}

}