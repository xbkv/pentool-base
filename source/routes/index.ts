import express, { Request, Response } from "express";
import * as dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    res.render('search', {
        title: 'りなぺんの嫌がらせツール',
    });
});

export default router;