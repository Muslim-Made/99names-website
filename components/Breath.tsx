export default function Breath({ size = 14 }: { size?: number }) {
  return <span className="breath" style={{ width: size, height: size }} aria-hidden="true" />;
}
