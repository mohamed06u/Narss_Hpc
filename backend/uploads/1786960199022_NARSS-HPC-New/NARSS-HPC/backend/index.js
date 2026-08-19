require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("JWT_SECRET is missing from .env");
    process.exit(1);
}

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, "database.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
        process.exit(1);
    }

    console.log("Connected to SQLite database.");
});

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
`);

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token."
            });
        }

        req.user = user;
        next();
    });
}

app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "NARSS HPC API is running." });
});

app.post("/api/register", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "يرجى إدخال البريد الإلكتروني وكلمة المرور."
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            [email, hashedPassword],
            function (err) {
                if (err) {
                    if (err.message.includes("UNIQUE")) {
                        return res.status(409).json({
                            success: false,
                            message: "البريد الإلكتروني مستخدم بالفعل."
                        });
                    }

                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: "حدث خطأ أثناء إنشاء الحساب."
                    });
                }

                res.status(201).json({
                    success: true,
                    message: "تم إنشاء الحساب بنجاح."
                });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "حدث خطأ في السيرفر."
        });
    }
});

app.post("/api/login", (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "يرجى إدخال البريد الإلكتروني وكلمة المرور."
        });
    }

    db.get(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, user) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "حدث خطأ في قاعدة البيانات."
                });
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "البريد الإلكتروني أو كلمة المرور غير صحيحة."
                });
            }

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return res.status(401).json({
                    success: false,
                    message: "البريد الإلكتروني أو كلمة المرور غير صحيحة."
                });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.json({
                success: true,
                message: "تم تسجيل الدخول بنجاح.",
                token
            });
        }
    );
});

app.get("/api/profile", authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

app.listen(PORT, () => {
    console.log(`NARSS HPC Backend running on http://localhost:${PORT}`);
});
