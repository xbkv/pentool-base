import express, { Request, Response } from "express";
import * as dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    const conference_call_id = req.query.conference_call_id;

    if (!conference_call_id) {
        res.status(400).send("conference_call_id is required");
    } else {
        res.render('joined', {
            title: '参加完了',
            conference_call_id,
        });
    }
});


export default router;