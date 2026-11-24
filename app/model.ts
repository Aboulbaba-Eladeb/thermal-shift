export type Arrangement = 'countercurrent' | 'parallel'
export type Target = 'hot' | 'cold'
export type Inputs = { hotIn:number; coldIn:number; hotFlow:number; coldFlow:number; hotCp:number; coldCp:number; target:number; u:number }

export function size(p:Inputs, arrangement:Arrangement, target:Target) {
  if (!Object.values(p).every(Number.isFinite)) throw Error('Complete each input to calculate the area.')
  if (Math.min(p.hotFlow,p.coldFlow,p.hotCp,p.coldCp,p.u)<=0) throw Error('Flow rates, heat capacities and U must be positive.')
  if (Math.min(p.hotIn,p.coldIn,p.target)<=-273.15) throw Error('Temperatures must exceed absolute zero.')
  if (p.hotIn<=p.coldIn) throw Error('The hot inlet must be warmer than the cold inlet.')
  const hotCapacity=p.hotFlow*p.hotCp, coldCapacity=p.coldFlow*p.coldCp
  const duty=target==='hot'?hotCapacity*(p.hotIn-p.target):coldCapacity*(p.target-p.coldIn)
  if (duty<=0) throw Error('Choose a cooler hot outlet or a warmer cold outlet to transfer heat.')
  const hotOut=target==='hot'?p.target:p.hotIn-duty/hotCapacity
  const coldOut=target==='cold'?p.target:p.coldIn+duty/coldCapacity
  const counter=arrangement==='countercurrent'
  const gap1=p.hotIn-(counter?coldOut:p.coldIn)
  const gap2=hotOut-(counter?p.coldIn:coldOut)
  if (Math.min(gap1,gap2)<=0) throw Error('The streams reach or cross at one end. Reduce the requested duty or change the flow arrangement.')
  const lmtd=gap1===gap2?gap1:(gap1-gap2)/(Math.abs(gap1-gap2)<gap2/2?Math.log1p((gap1-gap2)/gap2):Math.log(gap1)-Math.log(gap2))
  const area=1000*duty/(p.u*lmtd)
  if (![duty,area,lmtd].every(Number.isFinite)) throw Error('Inputs exceed the calculation range.')
  return {hotOut,coldOut,duty,lmtd,area,gap1,gap2}
}
