import { Router } from "express";
import dotenv from 'dotenv'

dotenv.config();
const router = Router();

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  const response = await fetch(`http://localhost:${process.env.PORT}/yay-api/v2/calls/conferences/${id}`);
  const json = await response.json();
  const conference = json.data.conference_call;

  res.render("conference", { conference });
});

router.post("/:id/join", async (req, res) => {
  const conference_call_id = req.params.id;
  const count = Number(req.body.count || 1);

  res.render("joined", { conference_call_id, count });
});

export default router;