FROM node:alpine
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN apk add --no-cache gcc gcompat g++ make python2
WORKDIR /usr/app
COPY package.json .
RUN yarn install
COPY . .
RUN npm run webpack
CMD [ "npm", "run", "start" ]