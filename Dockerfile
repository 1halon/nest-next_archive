FROM node:alpine
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN apk add --no-cache dgcc gcompat g++ make
WORKDIR /usr/meet
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
CMD npm run start