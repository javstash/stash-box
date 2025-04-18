DO $$
BEGIN
  IF current_setting('is_superuser') = 'on' THEN
    CREATE EXTENSION IF NOT EXISTS pg_cjk_parser;
  END IF;
END$$;

DO
$$BEGIN

CREATE TEXT SEARCH PARSER public.pg_cjk_parser (
    START = prsd2_cjk_start,
    GETTOKEN = prsd2_cjk_nexttoken,
    END = prsd2_cjk_end,
    LEXTYPES = prsd2_cjk_lextype,
    HEADLINE = prsd2_cjk_headline);

CREATE TEXT SEARCH CONFIGURATION public.config_2_gram_cjk (
    PARSER = pg_cjk_parser
);

SET default_text_search_config = 'public.config_2_gram_cjk';

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR asciihword
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR cjk
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR email
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR asciiword
    WITH english_stem;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR entity
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR file
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR float
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR host
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR hword
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR hword_asciipart
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR hword_numpart
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR hword_part
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR int
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR numhword
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR numword
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR protocol
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR sfloat
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR tag
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR uint
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR url
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR url_path
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR version
    WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.config_2_gram_cjk
    ADD MAPPING FOR word
    WITH simple;

EXCEPTION
   WHEN unique_violation THEN
      NULL;  -- ignore error
END;$$;