FROM node:12

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENTRYPOINT ["npm", "run", "examples/lighthouse.js", "--"]

CMD ["-p", "7979"]
