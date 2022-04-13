import express, { Express } from 'express';
import cors from 'cors';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

export default app;