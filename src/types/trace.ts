export type TraceRow = {
  id: number;
  created_at: string; // timestamptz (ISO 8601)

  event_type: string | null;
  user_id: string | null; // uuid

  url: string | null;
  page_type: string | null;
  author: string | null;
  message: string | null;

  cursor_position: number | null;
  end_position: number | null;
  event_value: string | null;

  tag_name: string | null;
  element_text: string | null;

  offset_x: number | null;
  offset_y: number | null;
  width: number | null;
  height: number | null;

  x_path: string | null;
  container_id: string | null;
  event_state: string | null;
  event_id: string | null;
  event_time: string | null; // timestamptz → ISO string
  version: string | null;
  session_id: string | null;
  sequence: string | null;
};
