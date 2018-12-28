import { Request, Response } from 'express';

export const index = (req: Request, res: Response) => {
  const home = {
    data: 'Welcome'
  };

  res.json(home);
};

export const adminOnly = (req: Request, res: Response) => {
  const admin = {
    data: 'Admin test Route'
  };

  res.json(admin);
};
