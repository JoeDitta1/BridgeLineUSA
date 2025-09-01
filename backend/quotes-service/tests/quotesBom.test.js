import request from 'supertest';
import express from 'express';
import quotesBomRoutes from '../backend/routes/quotesBomRoutes.js';
import { db } from '../backend/db.js';

const app = express();
app.use(express.json());
app.use('/api', quotesBomRoutes);

describe('POST /api/quotes/:id/bom/accept', () => {
  beforeAll(() => {
    db.exec('CREATE TABLE IF NOT EXISTS quote_bom (id INTEGER PRIMARY KEY, quote_id INTEGER, material TEXT, size TEXT, grade TEXT, thickness_or_wall TEXT, length TEXT, qty INTEGER, unit TEXT, notes TEXT)');
  });

  afterAll(() => {
    db.exec('DROP TABLE IF EXISTS quote_bom');
    db.close();
  });

  it('should accept a BOM and return the number of added rows', async () => {
    const response = await request(app)
      .post('/api/quotes/1/bom/accept')
      .send({
        rows: [
          { material: 'Steel', size: '10x10', grade: 'A', thickness_or_wall: '5mm', length: '2m', qty: 10, unit: 'pcs', notes: 'Test note' }
        ]
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, added: 1 });
  });

  it('should return 200 and added: 0 when no rows are provided', async () => {
    const response = await request(app)
      .post('/api/quotes/1/bom/accept')
      .send({});

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, added: 0 });
  });
});