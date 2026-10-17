FROM oven/bun:alpine
USER bun

RUN mkdir /home/bun/talkingbot
WORKDIR /home/bun/talkingbot

COPY bun.lock package.json tsconfig.json vite.config.ts ./

RUN bun install --frozen-lockfile --verbose --production

RUN mkdir public/
COPY --chown=bun  public ./public

RUN mkdir src/
COPY src ./src

RUN bun run build

EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "start" ]
