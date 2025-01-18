ARG POSTGRES_VERSION=17
FROM postgres:$POSTGRES_VERSION AS build
ARG POSTGRES_VERSION=17
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-server-dev-$POSTGRES_VERSION gcc make icu-devtools libicu-dev

RUN mkdir -p /root/parser
WORKDIR /root/parser
COPY pg_cjk_parser.c /root/parser/
COPY pg_cjk_parser.control /root/parser/
COPY Makefile /root/parser/
COPY pg_cjk_parser--0.0.1.sql /root/parser/
COPY zht2zhs.h /root/parser/
RUN make clean && make USE_PGXS=1 install

FROM postgres:17.2-bookworm

ARG POSTGRES_VERSION=17
COPY --from=build /root/parser/pg_cjk_parser.bc /usr/lib/postgresql/$POSTGRES_VERSION/lib/bitcode
COPY --from=build /root/parser/pg_cjk_parser.so /usr/lib/postgresql/$POSTGRES_VERSION/lib
COPY --from=build /root/parser/pg_cjk_parser--0.0.1.sql /usr/share/postgresql/$POSTGRES_VERSION/extension
COPY --from=build /root/parser/pg_cjk_parser.control /usr/share/postgresql/$POSTGRES_VERSION/extension

RUN buildDeps='git make build-essential postgresql-server-dev-17 wget libicu-dev' \
		&& apt update && apt install -y $buildDeps --no-install-recommends --reinstall ca-certificates \
		&& git clone https://github.com/evirma/pg_bktree.git /usr/local/src/bktree \
  	&& cd /usr/local/src/bktree \
		&& make USE_PGXS=1 && make USE_PGXS=1 install \
		&& cd .. \
		&& wget https://github.com/pgbigm/pg_bigm/archive/refs/tags/v1.2-20240606.tar.gz \
		&& tar zxf v1.2-20240606.tar.gz \
		&& cd pg_bigm-1.2-20240606 \
		&& make USE_PGXS=1 && make USE_PGXS=1 install \
		&& echo shared_preload_libraries='pg_bigm' >> /var/lib/postgresql/data/postgresql.conf \
		&& cd .. \
		&& rm -rf pg_bigm-1.2-20240606 \
		&& rm -rf bktree \
		&& apt purge -y --auto-remove $buildDeps \
		&& apt clean 

EXPOSE 5432
CMD docker-entrypoint.sh postgres
