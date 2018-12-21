import { Request, Response } from 'express';

/**
 * GET /
 * Home page.
 */
export let index = (req: Request, res: Response) => {
  const home = {
    data: 'Welcome'
  };

  res.json(home);
};
