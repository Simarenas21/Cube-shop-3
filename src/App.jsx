import React, { useMemo, useState } from 'react'

const PRODUCT = {
  id: 'cube',
  title: 'Infinity Cube PRO – streso mažinimo žaislas',
  subtitle: 'Suk, lankstyk ir nuramink mintis per kelias sekundes',
  description: 'Kompaktiškas aliuminio lydinio kubas, kurį galima sukti ir lankstyti viena ranka. Tylus mechanizmas, maloni tekstūra, tinka tiek vaikams (7+) tiek suaugusiems.',
  priceCents: 1299,
  oldPriceCents: 1999,
  images: [
    'https://m.media-amazon.com/images/I/61N2b3gO1RL._AC_SL1500_.jpg',
    'https://m.media-amazon.com/images/I/71cF3Tf2puL._AC_SL1500_.jpg',
    'https://m.media-amazon.com/images/I/61ZCtFSEhWL._AC_SL1500_.jpg'
  ],
  colors: [
    { code: 'black', name: 'Juodas' },
    { code: 'silver', name: 'Sidabrinis' },
    { code: 'blue', name: 'Mėlynas' },
  ],
  ceNote: 'CE ženklinimas, be BPA. Netinka vaikams iki 3 m. dėl smulkių detalių.'
}

const SHIPPING = {
  freeFromCents: 2500,
  defaultCents: 249,
  eta: '3–7 d. visoje ES (iš ES sandėlio)',
}

const eur = (cents) => new Intl.NumberFormat('lt-LT', { style: 'currency', currency: 'EUR' }).format(cents/100)

export default function App(){
  const [qty, setQty] = useState(1)
  const [color, setColor] = useState(PRODUCT.colors[0].code)
  const [accepted, setAccepted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const subtotal = useMemo(()=> qty * PRODUCT.priceCents, [qty])
  const shippingCents = useMemo(()=> subtotal >= SHIPPING.freeFromCents || subtotal === 0 ? 0 : SHIPPING.defaultCents, [subtotal])
  const total = subtotal + shippingCents

  async function pay(e){
    e.preventDefault()
    setSubmitted(true)
    const name = e.target.name.value.trim()
    const email = e.target.email.value.trim()
    const phone = e.target.phone.value.trim()
    const address = e.target.address.value.trim()
    const city = e.target.city.value.trim()
    const zip = e.target.zip.value.trim()

    if(!name || !email || !address || !city || !zip || !accepted) return
    try {
      setLoading(true)
      const orderId = nextOrderId()
      const res = await fetch('/api/paysera/checkout', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          amountCents: total,
          email,
          orderId,
          locale: 'lt',
          payer: { name, phone, address, city, zip },
          items: [{ id: PRODUCT.id, title: PRODUCT.title, priceCents: PRODUCT.priceCents, qty, color }]
        })
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error || 'Nepavyko inicijuoti mokėjimo')
      window.location.href = data.pay_url
    } catch(err){
      alert('Mokėjimo klaida: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <header>
        <div className="wrap row">
          <div className="row" style={{gap:12}}>
            <div className="badge">E‑Shop</div>
            <strong>Infinity Cube PRO</strong>
          </div>
          <div className="mini">Greitas pristatymas iš ES sandėlio</div>
        </div>
      </header>

      <main className="wrap grid g2" style={{marginTop:16}}>
        <section className="card p16">
          <div className="gallery">
            {PRODUCT.images.map((src,i)=>(
              <img key={i} src={src} alt={"nuotrauka "+(i+1)} />
            ))}
          </div>
        </section>

        <section className="card p24">
          <h1 style={{margin:'0 0 6px 0'}}>{PRODUCT.title}</h1>
          <div className="muted">{PRODUCT.subtitle}</div>

          <div className="row" style={{marginTop:10}}>
            <div style={{fontSize:24, fontWeight:800}}>{eur(PRODUCT.priceCents)}</div>
            <div className="muted" style={{textDecoration:'line-through'}}>{eur(PRODUCT.oldPriceCents)}</div>
            <span className="badge">Akcija</span>
          </div>

          <p style={{marginTop:12}} className="muted">{PRODUCT.description}</p>

          <div className="hr"></div>

          <div>
            <div className="mini">Spalva</div>
            <div className="chips" style={{marginTop:8}}>
              {PRODUCT.colors.map(c => (
                <button key={c.code} onClick={()=>setColor(c.code)} className={'chip'+(color===c.code?' active':'')}>{c.name}</button>
              ))}
            </div>
          </div>

          <div style={{marginTop:12}}>
            <div className="mini">Kiekis</div>
            <div className="qty" style={{marginTop:8}}>
              <button className="chip" onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button>
              <input className="input" value={qty} onChange={e=>setQty(Math.max(1, parseInt(e.target.value||'1')))} />
              <button className="chip" onClick={()=>setQty(q=>q+1)}>+</button>
            </div>
          </div>

          <div className="row" style={{marginTop:12}}>
            <div><strong>Iš viso: {eur(total)}</strong></div>
            <div className="mini">{shippingCents===0?'Nemokamas pristatymas': `Pristatymas ${eur(shippingCents)}`} <span className="muted">({SHIPPING.eta})</span></div>
          </div>

          <div className="hr"></div>

          <form onSubmit={pay} className="grid2">
            <div>
              <div className="mini">Vardas ir pavardė</div>
              <input className="input" name="name" placeholder="Vardenis Pavardenis" />
              {submitted && !document.querySelector('input[name=name]').value && <div className="warn">Privalomas laukas</div>}
            </div>
            <div>
              <div className="mini">El. paštas</div>
              <input className="input" type="email" name="email" placeholder="vardenis@pastas.lt"
              required
              autoComplete="email"
              onInvalid={(e) => e.target.setCustomValidity('Įveskite galiojantį el. pašto adresą')}
              onInput={(e) => e.target.setCustomValidity('')} />
            </div>
            <div>
              <div className="mini">Telefonas</div>
              <input className="input" name="phone" placeholder="+370 6xx xxxxx" />
            </div>
            <div>
              <div className="mini">Adresas</div>
              <input className="input" name="address" placeholder="Gatvė, namo/buto nr." />
            </div>
            <div>
              <div className="mini">Miestas</div>
              <input className="input" name="city" placeholder="Vilnius" />
            </div>
            <div>
              <div className="mini">Pašto kodas</div>
              <input className="input" name="zip" placeholder="LT-XXXXX" />
            </div>

            <div className="row" style={{gridColumn:'1 / -1'}}>
              <label className="right"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)} /> <span className="mini">Sutinku su pirkimo taisyklėmis</span></label>
              {submitted && !accepted && <span className="warn">Reikia sutikti</span>}
              <button className="btn" disabled={loading}>{loading?'Jungiama…':'Tęsti su Paysera'}</button>
            </div>
          </form>
          <p className="mini" style={{marginTop:8}}>{PRODUCT.ceNote}</p>
        </section>
      </main>

      <div className="wrap" style={{marginTop:8}}>
        <div className="card p16">
          <div className="row">
            <div className="mini">© {new Date().getFullYear()} Drivers development, VšĮ | Į.k. 306766699 | PVM LT100017094418</div>
            <div className="mini">Saugus SSL • 14 d. grąžinimas • ES sąskaita faktūra</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function nextOrderId(){
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth()+1).padStart(2,'0')
  const d = String(now.getDate()).padStart(2,'0')
  return `CUBE-${y}${m}${d}-001` // Pastaba: seka # demonstracinė; tikrą seką tvarkys serveris
}
