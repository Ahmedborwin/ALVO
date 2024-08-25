FROM node:18-alpine
WORKDIR /usr/project/backend
COPY ./package.json ./
RUN npm install
COPY ./ ./
CMD ["npm" ,"start"]