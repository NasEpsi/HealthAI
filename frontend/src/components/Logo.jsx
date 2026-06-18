import logoImg from "@logo";

const SIZES = { xs: 36, sm: 56, md: 96, lg: 140 };

export default function Logo({ size = "md", centered = false }) {
  const height = SIZES[size] ?? SIZES.md;

  return (
    <div className={`logo${centered ? " logo--centered" : ""}`}>
      <img
        src={logoImg}
        alt="HealthAI Coach"
        className="logo__brand"
        style={{ height, width: "auto" }}
      />
    </div>
  );
}
