export interface ApiKey {
  id: number;
  provider: string;
  key_value: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyInput {
  provider: string;
  key_value: string;
  active?: boolean; // optional, defaults to true
}