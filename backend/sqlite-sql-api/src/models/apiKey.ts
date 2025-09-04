export class ApiKey {
  id: number;
  provider: string;
  key_value: string;
  active: boolean;
  created_at: string;
  updated_at: string;

  constructor(
    id: number,
    provider: string,
    key_value: string,
    active: boolean,
    created_at: string,
    updated_at: string
  ) {
    this.id = id;
    this.provider = provider;
    this.key_value = key_value;
    this.active = active;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}