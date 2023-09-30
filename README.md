## RYM tags parser

**Trying to make as few requests as possible in order not to put pressure on the servers.**

### How to run locally

1. Create .env file in the app's root directory (use .env.example as a reference).

1. Start the compose stack:

   ```bash
   docker compose up
   ```

1. Run the following commands:

   ```bash
   npm i
   npm run start
   ```

#### Run tests:

Ensure the compose stack is **not** running, then run the tests:

```bash
npm run test
```
