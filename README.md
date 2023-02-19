## RYM tags parser

Trying to make as few requests as possible in order not to put pressure on the servers.

### Prepare local environment

Create .env file in the app's root directory.

Use .env.example as a reference.

Run `npm i` and `npm run build`.

#### Run locally:

Start the app and the compose stack:

```bash
docker compose up
npm run start
```

#### Run tests:

Ensure the compose stack is not running, then run the tests:

```bash
npm run test
```
