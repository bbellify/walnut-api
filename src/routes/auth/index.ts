import express, { Request, Response, Router } from 'express';
import { register, getUser } from '../../db/queries';
import { hashPassword, verify } from '../../util/crypto';

const router: Router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send({ error: 'username and password required' });
    }
    const user = await getUser();
    if (!user) {
      const key = await hashPassword(password);
      await register(username, key);

      res
        .status(200)
        .send({ message: 'Registered successfully', user: username });
    } else {
      res.status(400).send({ error: 'Already registered' });
    }
  } catch {
    res.status(500).send({ error: 'Server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await getUser();

    if (user.username === username) {
      const authenticated = await verify(password, user.password);

      if (authenticated) {
        res.status(200).send({ message: 'authenticated successfully' });
      } else {
        res.status(401).send({ message: 'authentication failed' });
      }
    }
  } catch {
    res.status(500).send({ error: 'Server error' });
  }
});

export default router;
