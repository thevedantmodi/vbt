import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { plaidRouter } from './routes/plaid';
import { accountsRouter } from './routes/accounts';
import { transactionsRouter } from './routes/transactions';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api/plaid', plaidRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/transactions', transactionsRouter);

app.use('/api', errorHandler);

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
