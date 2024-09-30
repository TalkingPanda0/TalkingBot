FROM oven/bun:alpine

USER bun

RUN mkdir /home/bun/talkingbot
WORKDIR /home/bun/talkingbot

COPY package.json bun.lockb tsconfig.json ./

RUN mkdir ./src
COPY src ./src

RUN mkdir ./public
COPY --chown=bun public ./public

RUN bun install --frozen-lockfile --verbose --production

EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/app.ts" ]
