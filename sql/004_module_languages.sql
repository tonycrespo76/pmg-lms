ALTER TABLE pmg_modules
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en';

UPDATE pmg_modules
SET language = CASE
  WHEN LOWER(COALESCE(language, '')) IN ('es', 'español', 'espanol', 'spanish') THEN 'es'
  ELSE 'en'
END
WHERE language IS NULL OR language <> 'en' AND language <> 'es';

CREATE INDEX IF NOT EXISTS pmg_modules_language_idx ON pmg_modules(language);
