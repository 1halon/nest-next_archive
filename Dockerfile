FROM node:alpine
ENV NODE_OPTIONS="--max-old-space-size=8192"
RUN apk add --no-cache gcc gcompat g++ make python2
WORKDIR /usr/app
