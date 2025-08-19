// src/components/PhoneInput.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

// Šalių sąrašas (plėsk pagal poreikį)
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
  // keli dažnesni už ES ribų
  { iso2: "US", name: "JAV", dial: "1" },
  { iso2: "CA", name: "Kanada", dial: "1" },
  { iso2: "CH", name: "Šveicarija", dial: "41" }
];

// 🇱🇹 vėliavos emoji iš ISO2
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
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  // Pilna reikšmė formos siuntimui (pvz., +37061234567)
  const full = useMemo(
    () => `+${country.dial}${(local || "").replace(/\D/g, "")}`,
    [country, local]
  );

  useEffect(() => {
    onChange && onChange(full);
  }, [full, onChange]);

  // uždaryti meniu paspaudus šalia
  useEffect(() => {
    function onDocClick(e) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Label’ai
  const selectedLabel = `${flagEmoji(country.iso2)} (+${country.dial}) `; // ✅ tik vėliava ir kodas
  const optionLabel = (c) => `${flagEmoji(c.iso2)} ${c.name} (+${c.dial})`;

  return (
    // Kairė – trumpas mygtukas; dešinė – ilgas įvedimo laukas
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 8 }}>
      {/* Custom dropdown (trumpas trigger’is, platus meniu) */}
      <div ref={boxRef} style={{ position: "relative" }}>
        <button
          type="button"
          className="input"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          // Trumpas mygtukas uždarytas:
          style={{
            width: 64,            // ✅ trumputis
            minWidth: 56,
            textAlign: "center",  // ✅ centruojam vėliavą
            padding: "10px 8px",
            borderRadius: 10
          }}
          // Pilnas pavadinimas „title“ (hover) ir screen reader’iui:
          title={optionLabel(country)}
          aria-label={optionLabel(country)}
        >
          {selectedLabel}
        </button>

        {open && (
          <div
            role="listbox"
            tabIndex={-1}
            style={{
              position: "absolute",
              zIndex: 20,
              marginTop: 4,
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              boxShadow: "0 10px 24px rgba(2,8,23,0.08)",
              // ✅ meniu platus, nepriklausomai nuo trumpo mygtuko:
              width: 320,
              maxWidth: "90vw",
              maxHeight: 300,
              overflowY: "auto"
            }}
          >
            <Group label="Baltijos šalys">
              {["LT", "LV", "EE"].map((cc) => {
                const c = COUNTRIES.find((x) => x.iso2 === cc);
                if (!c) return null;
                return (
                  <Option
                    key={c.iso2}
                    active={country.iso2 === c.iso2}
                    label={optionLabel(c)}
                    onSelect={() => {
                      setCountry(c);
                      setOpen(false);
                    }}
                  />
                );
              })}
            </Group>

            <Group label="Kitos">
              {COUNTRIES.filter((c) => !["LT", "LV", "EE"].includes(c.iso2)).map((c) => (
                <Option
                  key={c.iso2}
                  active={country.iso2 === c.iso2}
                  label={optionLabel(c)}
                  onSelect={() => {
                    setCountry(c);
                    setOpen(false);
                  }}
                />
              ))}
            </Group>
          </div>
        )}
      </div>

      {/* Likę skaičiai – ilgas laukas */}
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

      {/* Debug info – jei nereikia, galima ištrinti */}
      <div style={{ gridColumn: "1 / -1", fontSize: 12, color: "#64748b" }}>
        Pilnas numeris: <code>{full}</code>
      </div>
    </div>
  );
}

// Paprasti pagalbiniai komponentai
function Group({ label, children }) {
  return (
    <div style={{ padding: "6px 6px 10px" }}>
      <div style={{ fontSize: 12, color: "#64748b", padding: "4px 8px" }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Option({ label, active, onSelect }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onSelect}
      className="input"
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid transparent",
        background: active ? "#f1f5f9" : "#fff",
        cursor: "pointer"
      }}
    >
      {label}
    </button>
  );
}
