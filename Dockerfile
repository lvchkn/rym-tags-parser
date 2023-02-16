FROM ubuntu:focal

RUN apt-get update && apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

RUN npx playwright install --with-deps chromium

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:test"]
