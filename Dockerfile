# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.1.22
# install dependencies into temp directory
# this will cache them and speed up future builds
USER bun

RUN mkdir /home/bun/talkingbot
WORKDIR /home/bun/talkingbot

COPY package.json bun.lockb tsconfig.json ./

RUN mkdir ./src
COPY src ./src

RUN mkdir ./public
COPY public ./public

RUN bun install --frozen-lockfile --verbose

EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "src/app.ts" ]
