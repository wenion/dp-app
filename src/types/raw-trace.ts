export type RawTrace = {
  id: number;
  created_at: string; // timestamptz → ISO string

  // source & identity
  source: string;
  session_id: string | null;
  user_id: string | null; // uuid

  // event metadata
  event_type: string | null;
  event_id: string | null;
  timestamp: number | null;

  // DOM / UI context
  url: string | null;
  tag: string | null;
  element_type: string | null;
  name: string | null;
  placeholder: string | null;
  text_content: string | null;
  x_path: string | null;
  container_id: number | null;

  // geometry / position
  client_x: number | null;
  client_y: number | null;
  width: number | null;
  height: number | null;

  // value / state
  value_name: string | null;
  origin_value: string | null;
  value_type: string | null;
  value_index: number | null;
  value_label: string | null;
  direction: string | null;

  // keyboard
  code: string | null;
  key: string | null;

  // message & state
  label: string | null;
  message: string | null;
  event_value: string | null;
  event_state: string | null;
  start_position: number | null;
  end_position: number | null;

  // attribution
  author: string | null;
};
