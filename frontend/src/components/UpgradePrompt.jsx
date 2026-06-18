import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function UpgradePrompt({ title, message }) {
  return (
    <div className="upgrade-prompt">
      <Sparkles size={20} className="upgrade-prompt__icon" aria-hidden />
      <div className="upgrade-prompt__body">
        <p className="upgrade-prompt__title">{title}</p>
        <p className="upgrade-prompt__text">{message}</p>
      </div>
      <Link to="/abonnements" className="btn btn--primary btn--sm">
        Voir les offres
      </Link>
    </div>
  );
}
