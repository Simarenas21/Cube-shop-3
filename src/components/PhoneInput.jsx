import React, { useEffect, useMemo, useState } from "react";

/** Minimalus šalių sąrašas (EU + populiarios). Jei reikia visų — tiesiog
 *  PRIDĖKITE į šį masyvą daugiau įrašų (ISO2, pavadinimas, kodas).
 *  Pavyzdžiui, { iso2: 'LT', name: 'Lietuva', dial: '370' }.
 */
const COUNTRIES = [
  { iso2: "LT", name: "Lietuva", dial: "370" },
  { iso2: "LV", name: "Latvija", dial: "371" },
  { iso2: "EE", name: "Estija", dial: "372" },
  { iso2: "PL", name: "Lenkija", dial: "48" },
  { iso2: "DE", name: "Vokietija", dial: "49" },
  { iso2: "SE", name: "Švedija", dial: "46" },
  { iso2: "NO", name: "Norvegija", dial: "47" },
  { iso2: "FI", name: "Suomija", dial: "358" },
  { iso2: "DK", name: "Danija", dial: "45" },
  { iso2: "IE", name: "Airija", dial: "353" },
  { iso2: "GB", name: "Jungtinė Karalystė", dial: "44" },
  { iso2: "FR", name: "Prancūzija", dial: "33" },
  { iso2: "ES", name: "Ispanija", dial: "34" },
  { iso2: "IT", name: "Italija", dial: "39" },
  { iso2: "PT", name: "Portugalija", dial: "351" },
  { iso2: "NL", name: "Nyderlandai", dial: "31" },
  { iso2: "BE", name: "Belgija", dial: "32" },
  { iso2: "CZ", name: "Čekija", dial: "420" },
  { iso2: "SK", name: "Slovakija", dial: "421" },
  { iso2: "HU", name: "Vengrija", dial: "36" },
  { iso2: "AT", name: "Austrija", dial: "43" },
  { iso2: "RO", name: "Rumunija", dial: "40" },
  { iso2: "BG", name: "Bulgarija", dial: "359" },
  { iso2: "GR", name: "Graikija", dial: "30" },
  { iso2: "HR", name: "Kroatija", dial: "385" },
  { iso2: "SI", name: "Slovėnija", dial: "386" },
  { iso2: "LU", name: "Liuksemburgas", dial: "352" },
  { iso2: "MT", name: "Malta", dial: "356" },
  { iso2: "CY", name: "Kipras", dial: "357" },
  // Populiarios ne ES:
  { iso2: "US", name: "JAV", dial: "1" },
  { iso2: "CA", name: "Kanada", dial: "1" },
  { iso2: "AU", name: "Australija", dial: "61" },
  { iso2: "NZ", name: "Naujoji Zelandija", dial: "64" },
  { iso2: "CH", name: "Šveicarija", dial: "41" },
  { iso2: "IS", name: "Islandija", dial: "354" },
  { iso2: "UA", name: "Ukraina", dial: "380" },
  { iso2: "TR", name: "Turkija", dial: "90" },
  { iso2: "IL", name: "Izraelis", dial: "972" },
  { iso2: "AE", name: "JAE", dial: "971" },
  { iso2: "IN", name: "Indija", dial: "91" },
  { iso2: "SG", name: "Singapūras", dial: "65" },
  { iso2: "HK", name: "Honkongas", dial: "852" },
  { iso2: "JP", name: "Japonija", dial: "81" },
  { iso2: "KR", name: "Pietų Korėja", dial: "82" },
  { iso2: "TH", name: "Tailandas", dial: "66" },
  { iso2: "VN", name: "Vietnamas", dial: "84" },
  { iso2: "MY", name: "Malaizija", dial: "60" },
  { iso2: "PH", name: "Filipinai", dial: "63" },
  { iso2: "ID", name: "Indonezija", dial: "62" },
  { iso2: "MX", name: "Meksika", dial: "52" },
  { iso2: "BR", name: "Brazilija", dial: "55" },
  { iso2: "AR", name: "Argentina", dial: "54" },
  { iso2: "CL", name: "Čilė", dial: "56" },
  { iso2: "ZA", name: "Pietų Afrika", dial: "27" },
  { iso2: "EG", name: "Egiptas", dial: "20" },
  { iso2: "MA", name: "Marokas", dial: "212" },
];

const flagEmoji = (iso2) =>
  iso2
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

export default function PhoneInput({
  name = "phone",
  required = false,
  defaultCountry = "LT",
  initialLocal = "",
  onChange, // gaus pilną numerį, pvz. +37061234567
}) {
  const [country, setCountry] = useState(
    COUNTRIES.find((c) => c.iso2 === defaultCountry) || COUNTRIES[0]
  );
  const [local, setLocal] = useState(initialLocal);

  // Pilnas numeris formos siuntimui
  const full = useMemo(
    () => `+${country.dial}${(local || "").replace(/\D/g, "")}`,
    [country, local]
  );

  useEffect(() => {
    onChange && onChange(full);
  }, [full, onChange]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
      {/* Šalies pasirinkimas su kodu */}
      <label style={{ gridColumn: "1 / -1", fontSize: 12, color: "#64748b" }}>
        Telefonas
      </label>
      <select
        aria-label="Šalis"
        value={country.iso2}
        onChange={(e) =>
          setCountry(COUNTRIES.find((c) => c.iso2 === e.target.value))
        }
        className="input"
        style={{ padding: "10px", borderRadius: 10 }}
      >
        {/* Baltijos šalys viršuje */}
        <optgroup label="Baltijos šalys">
          {["LT", "LV", "EE"].map((cc) => {
            const c = COUNTRIES.find((x) => x.iso2 === cc);
            return (
              c && (
                <option key={c.iso2} value={c.iso2}>
                  {flagEmoji(c.iso2)} {c.name} (+{c.dial})
                </option>
              )
            );
          })}
        </optgroup>
        <optgroup label="Kitos">
          {COUNTRIES.filter((c) => !["LT", "LV", "EE"].includes(c.iso2)).map(
            (c) => (
              <option key={c.iso2} value={c.iso2}>
                {flagEmoji(c.iso2)} {c.name} (+{c.dial})
              </option>
            )
          )}
        </optgroup>
      </select>

      {/* Likę skaičiai */}
      <input
        className="input"
        type="tel"
        inputMode="numeric"
        pattern="[0-9 ]*"
        placeholder="Likę skaičiai (be šalies kodo)"
        value={local}
        onChange={(e) => {
          // leidžiam tik skaičius ir tarpus (tarpuose patogiau rinkti)
          const val = e.target.value.replace(/[^\d ]/g, "");
          setLocal(val);
        }}
        required={required}
        autoComplete="tel-national"
        style={{ padding: "10px", borderRadius: 10 }}
      />

      {/* Paslėptas laukas formos siuntimui – pilna reikšmė kaip +XXX... */}
      <input type="hidden" name={name} value={full} />
      <div style={{ gridColumn: "1 / -1", fontSize: 12, color: "#64748b" }}>
        Pilnas numeris: <code>{full}</code>
      </div>
    </div>
  );
}
