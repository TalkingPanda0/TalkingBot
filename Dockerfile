FROM oven/bun:alpine
USER bun

RUN mkdir /home/bun/talkingbot
WORKDIR /home/bun/talkingbot

COPY package.json streamlist.proto ./

RUN bun install --frozen-lockfile --verbose --production

RUN mkdir public/
COPY --chown=bun  public ./public

RUN mkdir src/
COPY src ./src

EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/app.ts" ]
