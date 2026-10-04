import { Name } from "@/lib/names";
import NameCard from "./NameCard";
import { Mark } from "./Rays";

/**
 * The envelope. Three states:
 *   closed  — flap down, the recipient's name written on the front
 *   peek    — flap up, the card rising out (the compose preview)
 *   open    — flap up, card fully out (the reveal)
 */
export default function Envelope({ name, to, state = "closed", onClick }: { name: Name; to: string; state?: "closed" | "peek" | "open"; onClick?: () => void }) {
  return (
    <div className={`env ${state}`} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      aria-label={onClick ? `Open the envelope for ${to || "you"}` : undefined}>
      <div className="env-body" />
      <div className="env-card"><NameCard name={name} href={false} rays /></div>
      <div className="env-pocket">
        <div className="env-to"><span>For</span><em>{to || "you"}</em></div>
        <div className="env-stamp"><Mark size={34} /></div>
      </div>
      <div className="env-flap" />
    </div>
  );
}
