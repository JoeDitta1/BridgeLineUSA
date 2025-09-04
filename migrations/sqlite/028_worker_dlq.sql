-- Worker DLQ table for persistent failures
create table if not exists worker_dlq (
  id integer primary key autoincrement,
  queue_id integer, -- reference to quote_sync_queue.id when available
  payload_json text not null,
  error_text text,
  attempts integer default 0,
  created_at datetime default (datetime('now')),
  updated_at datetime default (datetime('now'))
);

create index if not exists idx_worker_dlq_queue on worker_dlq (queue_id);
