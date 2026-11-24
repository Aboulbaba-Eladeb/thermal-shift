'use client'
import {useState} from 'react'
import {size, type Inputs, type Arrangement, type Target} from './model'

const initial={hotIn:'120',coldIn:'20',hotFlow:'2',coldFlow:'3',hotCp:'4.18',coldCp:'4.18',target:'70',u:'600'}
type Key=keyof Inputs
const format=(v:number)=>v!==0&&(Math.abs(v)<0.01||Math.abs(v)>=1e6)?v.toExponential(2):v.toLocaleString('en-US',{maximumFractionDigits:2})
function Profile({hot,cold,counter}:{hot:number[];cold:number[];counter:boolean}) {
  const lo=Math.min(...cold), hi=Math.max(...hot)
  const y=(t:number)=>148-(t-lo)/(hi-lo)*116
  return <figure><figcaption>Stream temperatures</figcaption><div className="legend"><span>● Hot stream</span><span>◆ Cold stream</span></div>
    <svg viewBox="0 0 460 185" role="img" aria-label={'Hot stream '+hot.map(format).join(' to ')+' °C. Cold stream '+cold.map(format).join(' to ')+' °C along the hot flow direction.'}>
      {[0,.5,1].map(f=><g key={f}><path d={'M76 '+(148-116*f)+'h306'} stroke="#56516f" strokeDasharray="3 6"/><text x="62" y={152-116*f} textAnchor="end">{format(lo+(hi-lo)*f)}°</text></g>)}
      {[hot,cold].map((temps,i)=><g key={i} stroke={i?'#b6acff':'#ff955c'} strokeWidth="3"><path d={'M76 '+y(temps[0])+' L382 '+y(temps[1])} strokeDasharray={i?'7 4':undefined}/>{temps.map((t,j)=><circle key={j} cx={j?382:76} cy={y(t)} r="4" fill="#17132a"/>)}</g>)}
      <text x="76" y="174" textAnchor="middle">0%</text><text x="382" y="174" textAnchor="middle">100%</text>
    </svg><p>Cumulative heat duty along hot flow. Cold flow runs {counter?'right to left':'left to right'}.</p></figure>
}
export default function Calculator() {
  const [raw,setRaw]=useState(initial)
  const [arr,setArr]=useState<Arrangement>('countercurrent')
  const [target,setTarget]=useState<Target>('hot')
  const p=Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,v.trim()===''?NaN:Number(v)])) as Inputs
  let result:ReturnType<typeof size>|undefined, issue=''
  try {result=size(p,arr,target)}catch(e){issue=e instanceof Error?e.message:'Invalid inputs.'}
  function field(key:Key,label:string,unit:string) {
    return <label className="field" key={key}><span>{label}</span><span className="box"><input type="number" step="any" aria-label={label} value={raw[key]} onChange={e=>setRaw({...raw,[key]:e.target.value})}/><small>{unit}</small></span></label>
  }
  function reset(){setRaw(initial);setArr('countercurrent');setTarget('hot')}
  function switchTarget(next:Target) {
    if(next===target)return
    if(result)setRaw({...raw,target:String(Number((next==='hot'?result.hotOut:result.coldOut).toPrecision(12)))})
    setTarget(next)
  }
  return <><header><div className="frame flex items-center justify-between gap-4"><b className="brand"><i>≋</i> Thermal Shift</b><a href="#method">Sizing method</a></div></header>
    <main className="frame"><div className="hero"><div><h1>Heat exchanger<br/><em>sizing studio.</em></h1><p>Balance two streams and find the heat transfer area for your outlet target.</p></div><img src="/exchanger-detail.webp" alt="Cutaway of a horizontal tube bundle inside a heat exchanger"/></div>
    <div className="workspace"><section className="controls"><div className="sectionhead"><h2>Operating conditions</h2><button className="reset" onClick={reset}>Reset</button></div>
      <h3>Flow arrangement</h3><div className="choices">{(['countercurrent','parallel'] as const).map(a=><button key={a} aria-pressed={arr===a} onClick={()=>setArr(a)}>{a==='parallel'?'⇉ Parallel':'⇄ Countercurrent'}</button>)}</div>
      <div className="streams">{(['hot','cold'] as const).map(s=><fieldset key={s}><legend className={s}>{s==='hot'?'Hot':'Cold'} stream</legend>{field(s+'In' as Key,'Inlet temperature','°C')}{field(s+'Flow' as Key,'Mass flow','kg/s')}{field(s+'Cp' as Key,'Specific heat','kJ/kg·K')}</fieldset>)}</div>
      <div className="targets"><label className="field"><span>Specified outlet</span><select value={target} onChange={e=>switchTarget(e.target.value as Target)}><option value="hot">Hot stream</option><option value="cold">Cold stream</option></select></label>{field('target','Target temperature','°C')}</div>{field('u','Overall heat transfer coefficient, U','W/m²·K')}
    </section>
    <section className="report" aria-label="Sizing results"><h2>Sizing results</h2>{issue?<p className="alert" role="status">{issue}</p>:result&&<><div className="primary"><span>Required surface area</span><strong>{format(result.area)} <small>m²</small></strong></div>
      <dl><div><dt>Heat duty</dt><dd>{format(result.duty)} kW</dd></div><div><dt>Log mean ΔT</dt><dd>{format(result.lmtd)} K</dd></div><div><dt>{target==='hot'?'Cold':'Hot'} outlet</dt><dd>{format(target==='hot'?result.coldOut:result.hotOut)} °C</dd></div></dl>
      <Profile hot={[p.hotIn,result.hotOut]} cold={arr==='countercurrent'?[result.coldOut,p.coldIn]:[p.coldIn,result.coldOut]} counter={arr==='countercurrent'}/></>}</section></div>
    <details id="method"><summary>Sizing method &amp; assumptions</summary><p>The duty follows Q = ṁcₚ|ΔT| for each stream. The required area is A = Q/(U ΔTₗₘ), using watts for Q. The log mean uses the two local terminal temperature differences. Equal terminal differences use their common value.</p><p>This model assumes steady, single-phase flow, constant heat capacities and U, and negligible heat loss. It describes ideal parallel or countercurrent flow. Multipass shell-and-tube sizing requires a geometry-specific correction.</p><a href="https://web.mit.edu/16.unified/www/SPRING/thermodynamics/notes/node131.html">MIT heat exchanger notes</a></details></main>
    <footer className="frame">Built by <a href="https://eladebaboulbaba.com">eladebaboulbaba.com</a></footer></>
}
