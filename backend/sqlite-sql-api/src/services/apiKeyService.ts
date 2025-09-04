import { Database } from 'sqlite3';
import { ApiKey } from '../models/apiKey';

export class ApiKeyService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async createApiKey(provider: string, keyValue: string): Promise<ApiKey> {
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const result = await new Promise<ApiKey>((resolve, reject) => {
      this.db.run(
        'INSERT INTO api_keys (provider, key_value, created_at, updated_at) VALUES (?, ?, ?, ?)',
        [provider, keyValue, createdAt, updatedAt],
        function (this: Database, err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, provider, key_value: keyValue, active: 1, created_at: createdAt, updated_at: updatedAt });
          }
        }
      );
    });

    return result;
  }

  public async getApiKey(id: number): Promise<ApiKey | null> {
    return new Promise<ApiKey | null>((resolve, reject) => {
      this.db.get('SELECT * FROM api_keys WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? { ...row } : null);
        }
      });
    });
  }

  public async updateApiKey(id: number, updates: Partial<ApiKey>): Promise<void> {
    const updatedAt = new Date().toISOString();
    const { provider, key_value, active } = updates;

    const fields = [];
    const values = [];

    if (provider) {
      fields.push('provider = ?');
      values.push(provider);
    }
    if (key_value) {
      fields.push('key_value = ?');
      values.push(key_value);
    }
    if (active !== undefined) {
      fields.push('active = ?');
      values.push(active);
    }

    fields.push('updated_at = ?');
    values.push(updatedAt);
    values.push(id);

    await new Promise<void>((resolve, reject) => {
      this.db.run(
        `UPDATE api_keys SET ${fields.join(', ')} WHERE id = ?`,
        values,
        function (this: Database, err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  public async deleteApiKey(id: number): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.db.run('DELETE FROM api_keys WHERE id = ?', [id], function (this: Database, err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public async getAllApiKeys(): Promise<ApiKey[]> {
    return new Promise<ApiKey[]>((resolve, reject) => {
      this.db.all('SELECT * FROM api_keys', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}