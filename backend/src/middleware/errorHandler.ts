import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err.response?.data) {
    const plaidError = err.response.data;
    return res.status(err.response.status || 500).json({
      error: {
        ...plaidError,
        status_code: err.response.status,
      },
    });
  }
  console.error(err.message || err);
  res.status(500).json({ error: { error_message: err.message || 'Internal server error' } });
}
