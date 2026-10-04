"use client";
import type { Address } from "@/lib/orders";

export const EMPTY_ADDRESS: Address = { name: "", line1: "", line2: "", city: "", region: "", postal: "", country: "" };
export const addressComplete = (a: Address) => !!(a.name && a.line1 && a.city && a.country);

const COUNTRIES = ["Nigeria", "United Kingdom", "United States", "Canada", "United Arab Emirates", "Saudi Arabia", "Qatar", "Malaysia", "Indonesia", "Pakistan", "India", "Bangladesh", "Turkey", "Egypt", "Morocco", "South Africa", "Kenya", "Ghana", "Germany", "France", "Netherlands", "Sweden", "Australia", "New Zealand", "Singapore", "Other"];

export default function AddressFields({ value, onChange, forWhom = "them" }: { value: Address; onChange: (a: Address) => void; forWhom?: string }) {
  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="addr">
      <div className="field span2"><label>Name on the envelope</label><input value={value.name} onChange={set("name")} placeholder={forWhom === "you" ? "Your full name" : "Their full name"} autoComplete="name" /></div>
      <div className="field span2"><label>Address</label><input value={value.line1} onChange={set("line1")} placeholder="Street and number" autoComplete="address-line1" /></div>
      <div className="field span2"><input value={value.line2 || ""} onChange={set("line2")} placeholder="Apartment, floor, landmark (optional)" autoComplete="address-line2" aria-label="Address line 2" /></div>
      <div className="field"><label>City</label><input value={value.city} onChange={set("city")} autoComplete="address-level2" /></div>
      <div className="field"><label>State / region</label><input value={value.region || ""} onChange={set("region")} autoComplete="address-level1" /></div>
      <div className="field"><label>Postcode</label><input value={value.postal || ""} onChange={set("postal")} autoComplete="postal-code" /></div>
      <div className="field"><label>Country</label>
        <select value={value.country} onChange={set("country")} autoComplete="country-name">
          <option value="">Choose…</option>{COUNTRIES.map(c => <option key={c}>{c}</option>)}
        </select></div>
      <div className="field span2"><label>Phone (helps the courier)</label><input value={value.phone || ""} onChange={set("phone")} placeholder="+234 …" autoComplete="tel" inputMode="tel" /></div>
    </div>
  );
}
