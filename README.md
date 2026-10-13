# JWT-autentisering och tester

## Öppna projektet lokalt

```bash
docker compose up --build -d
```

## Miljövariabler

Projektets miljövariabler:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`

Hemligheter ska lagras säkert och inte checkas in i Git.

## Tester

```bash
npm run test:unit --prefix tests
npm run test:backend --prefix tests
npm run test:frontend --prefix tests
npm test --prefix tests
```

## Säkerhetsfrågor

### 1. Varför kan man läsa en JWT-payload utan signeringsnyckeln, och vad skyddar signaturen?

Payloaden är kodad, inte krypterad. Signaturen gör det möjligt att kontrollera att tokenen inte har ändrats.

### 2. Vad händer om någon stjäl en giltig token? Stoppar signaturen personen?

Personen kan använda den stulna tokenen tills den går ut eller återkallas. Signaturen stoppar inte användning av en stulen token.

### 3. Vad är skillnaden mellan att hasha ett lösenord och att signera en token?

Lösenord hashas med bcrypt innan de sparas, medan JWT-token signeras så att servern kan verifiera att de är giltiga och inte har ändrats.

### 4. Vilken risk finns med localStorage vid en XSS-sårbarhet?

Om sidan har en XSS-sårbarhet kan obehöriga komma åt tokenen i localStorage och använda den för att göra anrop i användarens namn utan användarens godkännande.

### 5. Varför blir en JWT inte automatiskt ogiltig när användaren loggar ut?

Att ta bort tokenen från webbläsaren gör den inte ogiltig på servern. Den kan fortfarande användas tills den går ut, om det inte finns en lösning för återkallning.

### 6. Var ska hemligheter lagras lokalt, i GitHub Actions och på EC2?

Lokalt lagras hemligheter i en `.env`-fil som inte checkas in i Git. GitHub Actions ska använda GitHub Secrets eller säkra miljövariabler. På EC2 ska produktionshemligheter lagras säkert. Riktiga hemligheter ska aldrig publiceras i Git.

## GitHub Actions

https://github.com/popsnoret/bank-playwrite-and-vitest/actions/runs/38135996373
