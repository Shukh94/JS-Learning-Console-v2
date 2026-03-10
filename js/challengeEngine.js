export function runTests(userFunc,tests){

let passed=0

let results=[]

tests.forEach((t,i)=>{

const actual=userFunc(t.input)

const ok=actual===t.expected

if(ok) passed++

results.push({
index:i+1,
expected:t.expected,
actual,
ok
})

})

return{
passed,
results
}

}