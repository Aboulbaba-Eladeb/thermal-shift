const test=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const ts=require('typescript')
const moduleExports={}
new Function('exports',ts.transpileModule(fs.readFileSync(require.resolve('../app/model.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(moduleExports)
const {size}=moduleExports
const p={hotIn:120,coldIn:20,hotFlow:2,coldFlow:3,hotCp:4.18,coldCp:4.18,target:70,u:600}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8)
test('countercurrent energy balance, log mean and area',()=>{
 const s=size(p,'countercurrent','hot')
 near(s.duty,418);near(s.coldOut,20+100/3);near(s.lmtd,(200/3-50)/Math.log(4/3));near(s.area,418000/(600*s.lmtd))
})
test('either outlet specifies the same operating point',()=>{
 const s=size(p,'countercurrent','hot')
 near(size({...p,target:s.coldOut},'countercurrent','cold').area,s.area)
})
test('parallel flow requires more area at the default target',()=>assert.ok(size(p,'parallel','hot').area>size(p,'countercurrent','hot').area))
test('equal capacity counterflow gives a constant temperature gap',()=>near(size({...p,coldFlow:2},'countercurrent','hot').lmtd,50))
test('counterflow permits outlet crossover while parallel flow rejects a pinch',()=>{
 const cross={...p,coldFlow:2,target:60};near(size(cross,'countercurrent','hot').coldOut,80)
 assert.throws(()=>size(cross,'parallel','hot'));assert.throws(()=>size({...cross,target:70},'parallel','hot'))
})
test('rejects unusable temperatures, capacities and coefficients',()=>{for(const input of [{u:0},{hotCp:-1},{hotIn:NaN},{target:130},{coldIn:-300}])assert.throws(()=>size({...p,...input},'countercurrent','hot'))})
