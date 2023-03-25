## RYM tags parser

**Trying to make as few requests as possible in order not to put pressure on the servers.**

### How to run locally

Create .env file in the app's root directory (use .env.example as a reference).

Start the compose stack:

```bash
 docker compose up
```

Then run `npm i` and either of the following options:

- `npm run local` - run with ts-node
- `npm run local:watch` - run in watch mode with nodemon and ts-node.

#### Run tests:

Ensure the compose stack is **not** running, then run the tests:

```bash
npm run test
```
