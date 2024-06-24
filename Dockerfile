FROM node:18.18.2-buster-slim AS builder
WORKDIR /usr/src/app

copy . .

RUN apt-get update && apt-get install -y git
RUN npm install

RUN npm run build

CMD mkdir diskbak && cp -rf ./dist/* ./distbak