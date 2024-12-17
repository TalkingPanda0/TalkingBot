FROM oven/bun:alpine
USER bun

RUN mkdir /home/bun/talkingbot
WORKDIR /home/bun/talkingbot

COPY package.json tsconfig.json ./

RUN bun install --frozen-lockfile --verbose --production

COPY src .

COPY --chown=bun public .

EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/app.ts" ]
