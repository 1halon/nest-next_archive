FROM node:alpine
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN apk add --no-cache gcc gcompat g++ make yarn
WORKDIR /usr/meet
COPY package.json ./
RUN yarn --frozen-lockfile --ignore-engines --link-duplicates --non-interactive --prod --skip-integrity-check
COPY . .
RUN yarn run build:next
CMD yarn run start