import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mysql from "mysql2/promise";
import { validateAmount } from "./validateAmount.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const port = process.env.PORT || 3001;

const secret = process.env.JWT_SECRET;

if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
  throw new Error("JWT_SECRET måste vara minst 32 byte");
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Koppla till databasen
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "bank",
  port: Number(process.env.DB_PORT || 3306),
});

async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

function requireAuth(req, res, next) {
  const authorization = req.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token saknas eller har fel format",
    });
  }

  const token = authorization.slice(7);

  let payload;

  try {
    payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
      issuer: "banken",
      audience: "banken-api",
    });
  } catch {
    return res.status(401).json({
      message: "Ogiltig eller utgången token",
    });
  }

  if (!payload || typeof payload !== "object" || typeof payload.sub !== "string") {
    return res.status(401).json({
      message: "Ogiltigt användar-id",
    });
  }

  const userId = Number(payload.sub);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return res.status(401).json({
      message: "Ogiltigt användar-id",
    });
  }

  req.userId = userId;
  next();
}

app.post("/users", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password || password.length < 8) {
    return res.status(400).json({
      message: "Användarnamn krävs och lösenordet måste vara minst 8 tecken.",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const results = await query("INSERT INTO users (username, password) VALUES (?, ?)", [username, passwordHash]);

  const userId = results.insertId;

  await query("INSERT INTO accounts (userId, amount) VALUES (?, ?)", [userId, 0]);

  res.status(201).json({
    id: userId,
    username: username,
  });
});

app.post("/sessions", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Användarnamn och lösenord krävs",
    });
  }

  const results = await query("SELECT * FROM users WHERE username = ?", [username]);

  const user = results[0];

  if (!user) {
    return res.status(401).json({
      message: "Fel användarnamn eller lösenord",
    });
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  if (!passwordIsCorrect) {
    return res.status(401).json({
      message: "Fel användarnamn eller lösenord",
    });
  }

  const token = jwt.sign({ sub: String(user.id) }, secret, {
    algorithm: "HS256",
    issuer: "banken",
    audience: "banken-api",
    expiresIn: "15m",
  });

  res.json({ token });
});

app.post("/me/accounts", requireAuth, async (req, res) => {
  const accounts = await query("SELECT * FROM accounts WHERE userId = ?", [req.userId]);

  const account = accounts[0];

  res.json({
    amount: Number(account.amount),
  });
});

app.post("/me/accounts/transactions", requireAuth, async (req, res) => {
  const amount = Number(req.body.amount);

  if (!validateAmount(amount)) {
    return res.status(400).json({
      message: "Beloppet måste vara större än 0.",
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [accounts] = await connection.execute("SELECT * FROM accounts WHERE userId = ?", [req.userId]);

    const account = accounts[0];

    if (!account) {
      await connection.rollback();

      return res.status(404).json({
        message: "Kontot hittades inte",
      });
    }

    await connection.execute("UPDATE accounts SET amount = amount + ? WHERE id = ?", [amount, account.id]);

    await connection.execute("INSERT INTO transactions (accountId, amount) VALUES (?, ?)", [account.id, amount]);

    const [updatedAccounts] = await connection.execute("SELECT * FROM accounts WHERE id = ?", [account.id]);

    await connection.commit();

    res.json({
      amount: Number(updatedAccounts[0].amount),
    });
  } catch (error) {
    await connection.rollback();

    console.error(error);

    res.status(500).json({
      message: "Kunde inte genomföra insättningen",
    });
  } finally {
    connection.release();
  }
});

app.post("/me/transactions", requireAuth, async (req, res) => {
  const transactions = await query(
    `SELECT transactions.id, transactions.amount, transactions.createdAt
     FROM transactions
     JOIN accounts ON transactions.accountId = accounts.id
     WHERE accounts.userId = ?
     ORDER BY transactions.createdAt DESC`,
    [req.userId],
  );

  res.json({
    transactions: transactions.map((transaction) => ({
      id: transaction.id,
      amount: Number(transaction.amount),
      createdAt: transaction.createdAt,
    })),
  });
});

// Starta servern
app.listen(port, () => {
  console.log(`Bankens backend körs på http://localhost:${port}`);
});
