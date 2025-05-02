import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import path from "node:path";
import fs from 'fs';
import cookieParser from "cookie-parser";
import expressLayouts from "express-ejs-layouts";
import * as dotenv from "dotenv";

import indexRouter from "./routes/index";
import conferenceRouter from './routes/conference';
import joinedRouter from "./routes/joined";

import yayApiRouter from "./routes/api/yay-api";
import botApiRouter from "./routes/api/bot-api";
import agoraApiRouter from './routes/api/agora-api';
import musicApiRouter from './routes/api/sound-api';

// dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const PORT: string | number = process.env.PORT || 3000

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.set("views", path.join(__dirname, "../source/views/ejs"));
app.set("view engine", "ejs");
app.set("layout", "layout"); 

app.use((req: Request, res: Response, next: NextFunction) => {
    const manifestPath = path.join(__dirname, '../dist/public/manifest.json');
    res.locals.manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
    const manifestPath: string = path.join(__dirname, '../dist/public/manifest.json');
    try {
      res.locals.manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    } catch (err) {
      console.error('[manifest] 読み込み失敗:', err);
      res.locals.manifest = {}; // fallback
    }
    next();
});

app.use("/", indexRouter);
app.use("/conference", conferenceRouter);
app.use("/joined", joinedRouter);
// api
app.use("/yay-api", yayApiRouter);
app.use("/api/bot-api", botApiRouter);
app.use("/api/agora-api", agoraApiRouter);
app.use("/api/music-api", musicApiRouter);

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});