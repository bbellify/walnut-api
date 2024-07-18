import express, { Request, Response, Router } from 'express';
import { register } from '../../db/queries';

const router: Router = express.Router();

// TODO: should block requests to this endpoint if already registered
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    await register(username, password);
    res
      .status(200)
      .send({ message: 'Registered successfully', user: username });
  } catch {
    res.status(500).send({ error: 'Server error' });
  }
});

export default router;
