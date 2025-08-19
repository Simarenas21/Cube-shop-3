import React, { useEffect, useMemo, useState } from "react";

// Trumpas sąrašas; prireikus galiu įkelti pilną ~240 šalių JSON
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
  // keli populiarūs už ES ribų:
  { iso2: "US", name: "JAV", dial: "1" },
  { iso2: "CA", name: "Kanada", dial: "1" },
  { iso2: "CH", name: "Šveicarija", dial: "41" }
];

const flagEmoji = (iso2) =>
  iso2.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

export default function PhoneInput({
  name = "phone",
  required = false,
  defaultCountry = "LT",
  initialLocal = "",
  onChange
}) {
  const [country, setCountry] = useState(
    COUNTRIES.find((c) => c.iso2 === defaultCountry) || COUNTRIES[0]
  );
  const [local, setLocal] = useState(initialLocal);

  // Pilna reikšmė formos siuntimui (pvz., +37061234567)
  const full = useMemo(
    () => `+${country.dial}${(local || "").replace(/\D/g, "")}`,
    [country, local]
  );

  useEffect(() => {
    onChange && onChange(full);
  }, [full, onChange]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
      <select
        aria-label="Šalis"
        value={country.iso2}
        onChange={(e) => setCountry(COUNTRIES.find((c) => c.iso2 === e.target.value))}
        className="input"
        style={{ padding: 10, borderRadius: 10 }}
      >
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
          {COUNTRIES.filter((c) => !["LT", "LV", "EE"].includes(c.iso2)).map((c) => (
            <option key={c.iso2} value={c.iso2}>
              {flagEmoji(c.iso2)} {c.name} (+{c.dial})
            </option>
          ))}
        </optgroup>
      </select>

      <input
        className="input"
        type="tel"
        inputMode="numeric"
        pattern="[0-9 ]*"
        placeholder="Likę skaičiai (be šalies kodo)"
        value={local}
        onChange={(e) => setLocal(e.target.value.replace(/[^\d ]/g, ""))}
        required={required}
        autoComplete="tel-national"
        style={{ padding: 10, borderRadius: 10 }}
      />

      {/* Paslėptas pilnas numeris formos submitui */}
      <input type="hidden" name={name} value={full} />
      <div style={{ gridColumn: "1 / -1", fontSize: 12, color: "#64748b" }}>
        Pilnas numeris: <code>{full}</code>
      </div>
    </div>
  );
}
