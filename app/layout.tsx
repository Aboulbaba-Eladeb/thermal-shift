import type {Metadata} from 'next'
import type {ReactNode} from 'react'
import './globals.css'
export const metadata:Metadata={title:'Thermal Shift · Heat exchanger sizing',description:'Size a heat exchanger from two stream balances and the log mean temperature difference.'}
export default function Layout({children}:{children:ReactNode}) {return <html lang="en"><body>{children}</body></html>}
