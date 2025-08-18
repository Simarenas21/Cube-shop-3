import express from 'express'
import crypto from 'crypto'

const router = express.Router()

const PROJECT_ID    = process.env.PAYSERA_PROJECT_ID
const SIGN_PASSWORD = process.env.PAYSERA_SIGN_PASSWORD
const BASE_URL      = process.env.BASE_URL || 'http://localhost:3000'
const P_ENV         = process.env.PAYSERA_ENV || 'sandbox' // production | sandbox

const PAY_URL = P_ENV === 'production'
  ? 'https://bank.paysera.com/pay/'
  : 'https://sandbox.paysera.com/pay/'

let lastDate = ''
let seq = 0
function nextOrderId(){
  const yyyymmdd = new Date().toISOString().slice(0,10).replace(/-/g,'')
  if(yyyymmdd !== lastDate){ lastDate = yyyymmdd; seq = 1 } else { seq += 1 }
  return `CUBE-${yyyymmdd}-${String(seq).padStart(3,'0')}`
}

function toBase64Url(str){
  return Buffer.from(str).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
}
function fromBase64Url(b64){
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  return Buffer.from(b64.replace(/-/g,'+').replace(/_/g,'/') + pad, 'base64').toString('utf8')
}
function encodeParams(params){
  const usp = new URLSearchParams()
  Object.keys(params).sort().forEach(k => {
    if (params[k] !== undefined && params[k] !== null) usp.append(k, String(params[k]))
  })
  return toBase64Url(usp.toString())
}
function sign(data, password){
  return crypto.createHash('md5').update(data + password).digest('hex')
}

// INIT CHECKOUT
router.post('/api/paysera/checkout', express.json(), (req, res) => {
  try {
    if (!PROJECT_ID || !SIGN_PASSWORD) throw new Error('Missing Paysera credentials')

    const { amountCents, email, orderId, locale = 'lt', payer = {} } = req.body
    if (!amountCents || !email) return res.status(400).json({ error: 'amountCents and email are required' })

    const oid = orderId || nextOrderId()

    const params = {
      projectid: PROJECT_ID,
      orderid: oid,
      accepturl:  `${BASE_URL}/paysera/accept`,
      cancelurl:  `${BASE_URL}/paysera/cancel`,
      callbackurl:`${BASE_URL}/paysera/callback`,
      amount:     amountCents,
      currency:   'EUR',
      country:    'LT',
      lang:       locale,
      p_email:    email,
      paytext:    'Drivers development, VšĮ 306766699 – Infinity Cube',
      test:       P_ENV === 'sandbox' ? 1 : 0,
      p_firstname: payer.name || '',
      p_phone:     payer.phone || ''
    }

    const data = encodeParams(params)
    const signature = sign(data, SIGN_PASSWORD)
    const payUrl = `${PAY_URL}?data=${encodeURIComponent(data)}&sign=${signature}`

    res.json({ pay_url: payUrl, order_id: params.orderid })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// REDIRECTS
router.get('/paysera/accept', (req, res) => res.redirect('/?paid=1'))
router.get('/paysera/cancel', (req, res) => res.redirect('/?canceled=1'))

// CALLBACK
router.get('/paysera/callback', (req, res) => {
  try {
    const { data, ss1, sign: signParam } = req.query
    if (!data || !(ss1 || signParam)) return res.status(400).type('text/plain').send('ERROR')

    const mySign = sign(String(data), SIGN_PASSWORD)
    const provided = String(signParam || ss1).toLowerCase()
    if (mySign !== provided) return res.status(400).type('text/plain').send('ERROR')

    const decoded = fromBase64Url(String(data))
    const params = Object.fromEntries(new URLSearchParams(decoded))

    // TODO: čia sutikrinkite sumą/valiutą ir pažymėkite DB kaip apmokėtą.
    // Jei reikia, čia galite generuoti SF PDF ir siųsti el. paštu.

    return res.type('text/plain').send('OK')
  } catch {
    return res.status(400).type('text/plain').send('ERROR')
  }
})

export default router
