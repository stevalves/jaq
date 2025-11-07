import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./App.css";

type ApiSettings = {
  number: number;
  length: number;
  lang: string;
};

type FetchState = {
  isLoading: boolean;
  error: string | null;
};

type FormValues = {
  number: string;
  length: string;
  lang: string;
};

const DEFAULT_SETTINGS: ApiSettings = {
  number: 10,
  length: 6,
  lang: "pt-br",
};

function App() {
  const [settings, setSettings] = useState<ApiSettings>(DEFAULT_SETTINGS);
  const [words, setWords] = useState<string[]>([]);
  const [{ isLoading, error }, setFetchState] = useState<FetchState>({
    isLoading: false,
    error: null,
  });
  const [formValues, setFormValues] = useState<FormValues>({
    number: DEFAULT_SETTINGS.number.toString(),
    length: DEFAULT_SETTINGS.length.toString(),
    lang: DEFAULT_SETTINGS.lang,
  });

  useEffect(() => {
    const controller = new AbortController();
    const loadWords = async () => {
      setFetchState({ isLoading: true, error: null });

      const params = new URLSearchParams();
      params.set("number", settings.number.toString());
      params.set("lang", settings.lang);
      params.set("length", settings.length.toString());

      try {
        const response = await fetch(
          `https://random-word-api.herokuapp.com/word?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Não foi possível buscar as palavras agora.");
        }

        const data = (await response.json()) as string[];
        setWords(data);
        setFetchState({ isLoading: false, error: null });
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Algo inesperado aconteceu.";

        setFetchState({ isLoading: false, error: message });
      }
    };

    void loadWords();

    return () => {
      controller.abort();
    };
  }, [settings]);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const number = Number(formValues.number) || DEFAULT_SETTINGS.number;
    const length = Number(formValues.length) || DEFAULT_SETTINGS.length;
    const lang = formValues.lang || DEFAULT_SETTINGS.lang;

    const normalized: ApiSettings = {
      number: Math.min(Math.max(number, 1), 10),
      length: Math.min(Math.max(length, 3), 10),
      lang,
    };

    setFormValues({
      number: normalized.number.toString(),
      length: normalized.length.toString(),
      lang: normalized.lang,
    });

    setSettings(normalized);
  };

  // Re-dispatch the same settings to request a fresh batch with identical filters.
  const handleRefresh = () => {
    setSettings((prev) => ({ ...prev }));
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>Palavras do Dia</h1>
        <p>
          Gere rapidamente cinco palavras aleatórias e personalize a seleção
          ajustando quantidade, tamanho e idioma.
        </p>
      </header>

      <section className="controls">
        <form className="controls__form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="number">Quantidade</label>
            <input
              id="number"
              name="number"
              type="number"
              min={1}
              max={10}
              value={formValues.number}
              onChange={handleInputChange}
              aria-describedby="number-help"
            />
            <span id="number-help" className="field__help">
              Máx. 10 palavras por vez.
            </span>
          </div>

          <div className="field">
            <label htmlFor="length">Número de letras</label>
            <input
              id="length"
              name="length"
              type="number"
              min={3}
              max={10}
              value={formValues.length}
              onChange={handleInputChange}
              aria-describedby="length-help"
            />
            <span id="length-help" className="field__help">
              Entre 3 e 10 letras.
            </span>
          </div>

          <div className="field">
            <label htmlFor="lang">Idioma</label>
            <select
              id="lang"
              name="lang"
              value={formValues.lang}
              onChange={handleInputChange}
            >
              <option value="pt-br">Português (Brasil)</option>
              <option value="en">Inglês</option>
              <option value="es">Espanhol</option>
              <option value="fr">Francês</option>
            </select>
          </div>

          <div className="controls__buttons">
            <button
              className="controls__submit"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Buscando…" : "Atualizar Palavras"}
            </button>
            <button
              className="controls__refresh"
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Surpreenda-me
            </button>
          </div>
        </form>
      </section>

      <section className="words" aria-live="polite">
        {error ? (
          <div className="words__feedback words__feedback--error">{error}</div>
        ) : isLoading ? (
          <div className="words__feedback">Carregando palavras…</div>
        ) : (
          <ul className="word-grid">
            {words.map((word, index) => (
              <li className="word-card" key={`${word}-${index}`}>
                {word}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
