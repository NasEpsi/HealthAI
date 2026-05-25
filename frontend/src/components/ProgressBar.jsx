export default function ProgressBar({ current, total = 4 }) {
  return (
    <div className="progress-bar">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`progress-bar__segment${i < current ? " progress-bar__segment--active" : ""}`}
        />
      ))}
    </div>
  );
}
