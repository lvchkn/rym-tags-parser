#FROM mcr.microsoft.com/playwright:v1.30.0-focal
FROM ubuntu:focal

ENV NODE_ENV=testing
#ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
#ENV PLAYWRIGHT_BROWSERS_PATH=0

RUN apt-get update && apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

RUN npx playwright install --with-deps chromium

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]
