DO $$
BEGIN
  IF current_setting('is_superuser') = 'on' THEN
    CREATE EXTENSION IF NOT EXISTS pg_bigm;
  END IF;
END$$;

-- From #35, use GIN and switch back to default

DROP INDEX scene_search_ts_idx;
CREATE INDEX scene_search_ts_idx ON scene_search USING gist (
    (
        to_tsvector('config_2_gram_cjk', COALESCE(scene_date, '')) ||
        to_tsvector('config_2_gram_cjk', studio_name) ||
        to_tsvector('config_2_gram_cjk', COALESCE(performer_names, '')) ||
        to_tsvector('config_2_gram_cjk', scene_title) ||
        to_tsvector('config_2_gram_cjk', COALESCE(scene_code, ''))
    )
);

-- From #2, gin_bigm_ops instead of gin_trgm_ops

DROP INDEX name_trgm_idx;
DROP INDEX name_bigm_idx;
CREATE INDEX name_bigm_idx ON "performers" USING GIN ("name" gin_bigm_ops);

-- From #12, gin_bigm_ops instead of gin_trgm_ops

DROP INDEX disambiguation_trgm_idx;
DROP INDEX disambiguation_bigm_idx;
CREATE INDEX disambiguation_bigm_idx ON "performers" USING GIN ("disambiguation" gin_bigm_ops);
DROP INDEX performer_alias_trgm_idx;
DROP INDEX performer_alias_bigm_idx;
CREATE INDEX performer_alias_bigm_idx ON "performer_aliases" USING GIN ("alias" gin_bigm_ops);

-- From #35 with the regex function around the scene title removed

CREATE OR REPLACE FUNCTION update_scene() RETURNS TRIGGER AS $$
BEGIN
IF (NEW.title != OLD.title OR NEW.date != OLD.date OR NEW.studio_id != OLD.studio_id OR COALESCE(NEW.code, '') != COALESCE(OLD.code, '')) THEN
UPDATE scene_search
SET
    scene_title = NEW.title,
    scene_date = NEW.date,
    studio_name = SUBQUERY.studio_name,
    scene_code = NEW.code
FROM (
    SELECT S.id as sid, T.name || ' ' || CASE WHEN TP.name IS NOT NULL THEN (TP.name) ELSE '' END AS studio_name
    FROM scenes S
    JOIN studios T ON S.studio_id = T.id
    LEFT JOIN studios TP ON T.parent_studio_id = TP.id
) SUBQUERY
WHERE scene_id = NEW.id
AND scene_id = SUBQUERY.sid;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql; --The trigger used to update a table.

-- From #35 with the regex function around the scene title removed

CREATE OR REPLACE FUNCTION insert_scene() RETURNS TRIGGER AS $$
BEGIN
INSERT INTO scene_search (scene_id, scene_title, scene_date, studio_name, scene_code)
SELECT
    NEW.id,
    NEW.title,
    NEW.date,
    T.name || ' ' || CASE WHEN TP.name IS NOT NULL THEN (TP.name) ELSE '' END,
    NEW.code
FROM studios T
LEFT JOIN studios TP ON T.parent_studio_id = TP.id
WHERE T.id = NEW.studio_id;
RETURN NULL;
END;
$$ LANGUAGE plpgsql; --The trigger used to update a table.


TRUNCATE TABLE scene_search;

-- From #35 with the regex function around the scene title removed

INSERT INTO scene_search
SELECT
    S.id as scene_id,
    S.title AS scene_title,
    S.date::TEXT AS scene_date,
    T.name || ' ' || CASE WHEN TP.name IS NOT NULL THEN (TP.name) ELSE '' END AS studio_name,
    ARRAY_TO_STRING(ARRAY_CAT(ARRAY_AGG(P.name), ARRAY_AGG(PS.as)), ' ', '') AS performer_names,
    S.code as scene_code
FROM scenes S
LEFT JOIN scene_performers PS ON PS.scene_id = S.id
LEFT JOIN performers P ON PS.performer_id = P.id
LEFT JOIN studios T ON T.id = S.studio_id
LEFT JOIN studios TP ON T.parent_studio_id = TP.id
GROUP BY S.id, S.title, T.name, TP.name;

