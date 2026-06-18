import { useEffect, useState } from "react";
import { Loader2, Search, User } from "lucide-react";
import { searchUsers } from "../services/social";

export default function UserSearchBar({ userId, onSelect, onSearchActive }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userId || query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const users = await searchUsers(userId, query);
        setResults(users);
        setOpen(true);
      } catch (err) {
        setError(err.message || "Recherche impossible.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, userId]);

  const handleSelect = (user) => {
    onSelect?.(user);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="user-search">
      <div className="user-search__input-wrap">
        <Search size={18} className="user-search__icon" />
        <input
          type="text"
          className={`input user-search__input${loading ? " user-search__input--busy" : ""}`}
          placeholder="Rechercher un utilisateur (nom ou email)…"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            if (value.trim().length >= 2) onSearchActive?.();
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
          spellCheck={false}
        />
        {loading && <Loader2 size={16} className="user-search__spinner" aria-hidden />}
      </div>

      {error && <p className="form-error">{error}</p>}

      {open && results.length > 0 && (
        <ul className="user-search__results">
          {results.map((user) => (
            <li key={user.user_id}>
              <button type="button" className="user-search__item" onClick={() => handleSelect(user)}>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="user-search__avatar" />
                ) : (
                  <span className="user-search__avatar user-search__avatar--placeholder">
                    <User size={16} />
                  </span>
                )}
                <span>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && query.trim().length >= 2 && results.length === 0 && !error && (
        <p className="user-search__empty">Aucun utilisateur trouvé.</p>
      )}
    </div>
  );
}
