import express, { Request, Response, Router } from 'express';
import { getUser } from '../../db/queries';

const router: Router = express.Router();

router.get('/getUser', async (req: Request, res: Response) => {
  try {
    const user = await getUser();
    res.send(user);
  } catch {
    res.status(500).send({ error: 'Server error' });
  }
});

export default router;
