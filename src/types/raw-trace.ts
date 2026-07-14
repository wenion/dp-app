export type RawTraceRow = {
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

export type UserEvent = {
  eventType?: string; // API url
  tag?: string; // API Method
  elementType?: string; // API Subtype

  // url?: string;
  name?: string;
  placeholder?: string;
  textContent?: string;
  //clientX: selectionStart for input[select event]
  //clientX: scrollX for scroll and wheel
  clientX?: number;
  //selectionEnd for input[select event]
  //scrollY for scroll and wheel
  clientY?: number;
  width?: number;
  height?: number;
  xpath?: string;

  valueName?: string; // for input change
  originValue?: string; // avoid circular structure
  valueType?: string; // typeof value
  // for select element
  valueIndex?: number;
  valueLabel?: string;

  // "backward"/"forward" for select event and selection
  direction?: string;

  label?: string;
  timestamp: number;

  code?: string; // for keyboard event
  key?: string; // for keyboard event

  message?: string;
  eventValue?: string;
  eventState?: string;
  eventId?: string;
  startPosition?: number;
  endPosition?: number;

  // sessionId?: string;
  // tabId?: number;
  // streamId?: number;
  author?: string;
  containerId?: number;
  // source: TraceSource;
};

export type TraceContext = {
  sessionId: string;
  sessionStart: number;
  sessionEnd?: number;

  tabId: number;
  windowId: number;

  url: string;
};

export type RawTrace = UserEvent & TraceContext;
