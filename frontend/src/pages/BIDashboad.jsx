export default function BIDashboard() {
  const EMBED_URL = "COLLE_ICI_L_URL_EMBED_POWERBI";

  return (
    <div>
      <h1>Tableau de bord Power BI</h1>

      <div className="card">
        <iframe
          title="Power BI HealthAI Dashboard"
          src={EMBED_URL}
          className="bi-frame"
          frameBorder="0"
          allowFullScreen={true}
        />
      </div>
    </div>
  );
}