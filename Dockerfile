FROM node:latest-alpine
WORKDIR /usr/billtracker

ARG NODE_ENV="production"
ENV NODE_ENV=${NODE_ENV}

COPY package*.json .
RUN npm i

COPY . .
RUN npm run build

EXPOSE 3000
CMD [ "npm", "run", "start" ]
