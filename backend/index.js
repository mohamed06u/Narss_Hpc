require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const unzipper = require("unzipper");
const shapefile = require("shapefile");
const proj4 = require("proj4");

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("JWT_SECRET is missing from .env");
    process.exit(1);
}


// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());


// =========================
// SERVE FRONTEND
// =========================

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});


// =========================
// UPLOAD FOLDER
// =========================

const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, {
        recursive: true
    });
}


// =========================
// MULTER
// =========================

const upload = multer({
    dest: uploadsDir,

    limits: {
        fileSize: 50 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {
        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        if (extension !== ".zip") {
            return cb(
                new Error("Only ZIP files are allowed.")
            );
        }

        cb(null, true);
    }
});


// =========================
// DATABASE
// =========================

const dbPath = path.join(
    __dirname,
    "database.sqlite"
);

const db = new sqlite3.Database(
    dbPath,
    (err) => {
        if (err) {
            console.error(
                "Database connection error:",
                err.message
            );

            process.exit(1);
        }

        console.log(
            "Connected to SQLite database."
        );
    }
);

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
`);


// =========================
// JWT MIDDLEWARE
// =========================

function authenticateToken(req, res, next) {

    const authHeader =
        req.headers.authorization;

    const token =
        authHeader &&
            authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    jwt.verify(
        token,
        JWT_SECRET,
        (err, user) => {

            if (err) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid or expired token."
                });
            }

            req.user = user;

            next();
        }
    );
}


// =========================
// FIND FILE RECURSIVELY
// =========================

function findFileByExt(dir, ext) {

    const files = fs.readdirSync(dir);

    for (const file of files) {

        const fullPath = path.join(
            dir,
            file
        );

        const stat = fs.statSync(
            fullPath
        );

        if (stat.isDirectory()) {

            const found = findFileByExt(
                fullPath,
                ext
            );

            if (found) {
                return found;
            }

        } else if (
            file.toLowerCase().endsWith(ext)
        ) {

            return fullPath;
        }
    }

    return null;
}


// =========================
// FIND PRJ FILE
// =========================

function findPrjFile(shpPath) {

    if (!shpPath) {
        return null;
    }

    const prjPath = shpPath.replace(
        /\.shp$/i,
        ".prj"
    );

    if (fs.existsSync(prjPath)) {
        return prjPath;
    }

    const directory = path.dirname(
        shpPath
    );

    const files = fs.readdirSync(
        directory
    );

    for (const file of files) {

        if (
            file
                .toLowerCase()
                .endsWith(".prj")
        ) {
            return path.join(
                directory,
                file
            );
        }
    }

    return null;
}


// =========================
// PARSE UTM FROM WKT
// =========================

function getUtmDefinitionFromPrj(prjText) {

    if (!prjText) {
        return null;
    }

    // Try to detect UTM zone

    const zoneMatch = prjText.match(
        /UTM(?:_ZONE)?["\s,=]+([0-9]{1,2})/i
    );

    let zone = null;

    if (zoneMatch) {

        zone = parseInt(
            zoneMatch[1],
            10
        );
    }


    // Try another common WKT format:
    // Transverse_Mercator
    // central_meridian

    if (!zone) {

        const centralMeridianMatch =
            prjText.match(
                /central_meridian["\s,=]+(-?\d+(?:\.\d+)?)/i
            );

        if (centralMeridianMatch) {

            const centralMeridian =
                parseFloat(
                    centralMeridianMatch[1]
                );

            zone = Math.round(
                (centralMeridian + 183) / 6
            );
        }
    }


    // Detect Northern / Southern hemisphere

    let south = false;

    if (/south/i.test(prjText)) {
        south = true;
    }


    // Detect EPSG directly

    const epsgMatch = prjText.match(
        /EPSG["\s:=]+(\d{4,5})/i
    );

    if (epsgMatch) {

        const epsg = parseInt(
            epsgMatch[1],
            10
        );

        if (
            epsg >= 32601 &&
            epsg <= 32660
        ) {
            return `EPSG:${epsg}`;
        }

        if (
            epsg >= 32701 &&
            epsg <= 32760
        ) {
            return `EPSG:${epsg}`;
        }
    }


    // If no UTM information

    if (
        !zone ||
        zone < 1 ||
        zone > 60
    ) {
        return null;
    }

    const epsg = south
        ? 32700 + zone
        : 32600 + zone;

    return `EPSG:${epsg}`;
}


// =========================
// GET CRS FROM PRJ
// =========================

function getSourceProjection(prjPath) {

    if (!prjPath) {
        return null;
    }

    try {

        const prjText =
            fs.readFileSync(
                prjPath,
                "utf8"
            );

        console.log(
            "PRJ:",
            prjText
        );

        const projection =
            getUtmDefinitionFromPrj(
                prjText
            );

        return projection;

    } catch (error) {

        console.error(
            "Failed to read PRJ:",
            error.message
        );

        return null;
    }
}


// =========================
// TRANSFORM COORDINATES
// =========================

function transformCoordinates(
    coordinates,
    sourceProjection
) {

    if (!sourceProjection) {
        return coordinates;
    }

    if (
        typeof coordinates[0] === "number"
    ) {

        const result = proj4(
            sourceProjection,
            "EPSG:4326",
            coordinates
        );

        return [
            result[0],
            result[1]
        ];
    }

    return coordinates.map(
        function (coordinate) {

            return transformCoordinates(
                coordinate,
                sourceProjection
            );
        }
    );
}


// =========================
// TRANSFORM GEOJSON
// =========================

function transformGeoJSON(
    geojson,
    sourceProjection
) {

    if (!sourceProjection) {
        return geojson;
    }

    return {
        ...geojson,

        geometry: geojson.geometry
            ? {
                ...geojson.geometry,

                coordinates:
                    transformCoordinates(
                        geojson.geometry.coordinates,
                        sourceProjection
                    )
            }
            : null
    };
}


// =========================
// HEALTH CHECK
// =========================

app.get(
    "/api/health",
    (req, res) => {

        res.json({
            success: true,
            message: "NARSS HPC API is running."
        });
    }
);


// =========================
// REGISTER
// =========================

app.post(
    "/api/register",
    async (req, res) => {

        const email =
            String(
                req.body.email || ""
            )
                .trim()
                .toLowerCase();

        const password =
            String(
                req.body.password || ""
            );

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "يرجى إدخال البريد الإلكتروني وكلمة المرور."
            });
        }

        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
            });
        }

        try {

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            db.run(
                `INSERT INTO users (email, password)
                 VALUES (?, ?)`,

                [
                    email,
                    hashedPassword
                ],

                function (err) {

                    if (err) {

                        if (
                            err.message.includes(
                                "UNIQUE"
                            )
                        ) {

                            return res.status(409).json({
                                success: false,
                                message:
                                    "البريد الإلكتروني مستخدم بالفعل."
                            });
                        }

                        return res.status(500).json({
                            success: false,
                            message:
                                "حدث خطأ أثناء إنشاء الحساب."
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message:
                            "تم إنشاء الحساب بنجاح."
                    });
                }
            );

        } catch (error) {

            res.status(500).json({
                success: false,
                message:
                    "حدث خطأ في السيرفر."
            });
        }
    }
);


// =========================
// LOGIN
// =========================

app.post(
    "/api/login",
    (req, res) => {

        const email =
            String(
                req.body.email || ""
            )
                .trim()
                .toLowerCase();

        const password =
            String(
                req.body.password || ""
            );

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "يرجى إدخال البريد الإلكتروني وكلمة المرور."
            });
        }

        db.get(
            `SELECT * FROM users WHERE email = ?`,
            [email],

            async (
                err,
                user
            ) => {

                if (err || !user) {

                    return res.status(401).json({
                        success: false,
                        message:
                            "البريد الإلكتروني أو كلمة المرور غير صحيحة."
                    });
                }

                const match =
                    await bcrypt.compare(
                        password,
                        user.password
                    );

                if (!match) {

                    return res.status(401).json({
                        success: false,
                        message:
                            "البريد الإلكتروني أو كلمة المرور غير صحيحة."
                    });
                }

                const token =
                    jwt.sign(
                        {
                            id: user.id,
                            email: user.email
                        },

                        JWT_SECRET,

                        {
                            expiresIn: "24h"
                        }
                    );

                res.json({
                    success: true,
                    message:
                        "تم تسجيل الدخول بنجاح.",
                    token
                });
            }
        );
    }
);


// =========================
// PROFILE
// =========================

app.get(
    "/api/profile",
    authenticateToken,
    (req, res) => {

        res.json({
            success: true,
            user: req.user
        });
    }
);


// =========================
// SHAPEFILE UPLOAD
// =========================

app.post(
    "/api/shapefile/upload",

    authenticateToken,

    upload.single("shapefile"),

    async (req, res) => {

        let zipPath = null;
        let extractPath = null;

        try {

            // CHECK FILE

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please upload a ZIP file."
                });
            }

            zipPath = req.file.path;

            const originalName =
                path.parse(
                    req.file.originalname
                ).name;

            extractPath =
                path.join(
                    uploadsDir,
                    `${Date.now()}_${originalName}`
                );

            fs.mkdirSync(
                extractPath,
                {
                    recursive: true
                }
            );


            // UNZIP

            await fs
                .createReadStream(
                    zipPath
                )
                .pipe(
                    unzipper.Extract({
                        path: extractPath
                    })
                )
                .promise();


            // FIND SHAPEFILES

            const shpPath =
                findFileByExt(
                    extractPath,
                    ".shp"
                );

            const dbfPath =
                findFileByExt(
                    extractPath,
                    ".dbf"
                );

            if (!shpPath) {

                return res.status(400).json({
                    success: false,
                    message:
                        "No .shp file found inside ZIP."
                });
            }

            const prjPath =
                findPrjFile(
                    shpPath
                );


            // READ CRS

            let sourceProjection = null;

            if (prjPath) {

                sourceProjection =
                    getSourceProjection(
                        prjPath
                    );
            }

            console.log(
                "Source projection:",
                sourceProjection || "Unknown"
            );


            // READ SHAPEFILE

            const source =
                await shapefile.open(
                    shpPath,
                    dbfPath || undefined
                );

            const features = [];

            while (true) {

                const result =
                    await source.read();

                if (result.done) {
                    break;
                }

                let feature =
                    result.value;


                // CONVERT UTM → WGS84

                if (
                    sourceProjection &&
                    feature.geometry
                ) {

                    feature =
                        transformGeoJSON(
                            feature,
                            sourceProjection
                        );
                }

                features.push(
                    feature
                );
            }


            // GEOJSON

            const geojson = {
                type: "FeatureCollection",
                features: features
            };


            // CLEAN ZIP

            if (
                fs.existsSync(zipPath)
            ) {

                fs.unlinkSync(zipPath);
            }


            // RESPONSE

            res.json({
                success: true,

                message:
                    "Shapefile uploaded and converted to WGS84 successfully.",

                filename:
                    originalName,

                projection:
                    sourceProjection || "Unknown",

                geojson:
                    geojson
            });

        } catch (error) {

            console.error(
                "Shapefile error:",
                error
            );

            if (
                zipPath &&
                fs.existsSync(zipPath)
            ) {

                fs.unlinkSync(zipPath);
            }

            res.status(500).json({
                success: false,
                message:
                    "Failed to process Shapefile.",
                error:
                    error.message
            });
        }
    }
);


// =========================
// ERROR HANDLER
// =========================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        console.error(err);

        res.status(400).json({
            success: false,
            message:
                err.message ||
                "Something went wrong."
        });
    }
);


// =========================
// SERVER
// =========================

app.listen(
    PORT,
    () => {

        console.log(
            `NARSS HPC Backend running on http://localhost:${PORT}`
        );

        console.log(
            `NARSS HPC Frontend available at http://localhost:${PORT}`
        );
    }
);