FROM oven/bun:1.2.6-alpine:WORKDIR 
USER bun

RUN mkdir /home/bun/talkingbot
WORKDIR /home/bun/talkingbot

COPY package.json ./

RUN bun install --frozen-lockfile --verbose --production

RUN mkdir public/
COPY --chown=bun  public ./public

RUN mkdir src/
COPY src ./src

EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/app.ts" ]
