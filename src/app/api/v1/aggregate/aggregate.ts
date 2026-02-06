import { RawTrace } from "@/types/raw-trace";

const CODES = new Set([
  "Backspace",
  "Delete",
  "Enter",
  "Space",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Period",
  "Minus",
  "Equal",
  null,
]);

/**
 * Determine if a keydown event matches a user input event based on their values.
 *
 * @param keydownTrace The keydown trace event.
 * @param inputTrace The user input trace event.
 * @returns True if the keydown event corresponds to the user input event, false otherwise.
 *
 * IMPORTANT:
 * - This function is **only valid when `inputTrace` represents a UserEvent**
 *
 * Pairing rules:
 * - Normal characters: keydown.value === input.value
 * - Backspace / Delete: keydown.value === "Backspace" | "Delete" && input.value === ""
 * - Enter: keydown.value === "Enter" && input.value === "\n"
 *
 */
function matchesKeydownWithUserInput(
  keydownTrace: RawTrace,
  inputTrace: RawTrace
): boolean {
  if (keydownTrace.url !== inputTrace.url) return false;

  const keydownValue = keydownTrace.event_value;
  const inputValue = inputTrace.event_value;

  const keydownState = keydownTrace.event_state;
  const inputState = inputTrace.event_state;

  // if (keydownValue == null) return false;

  return (
    keydownValue === inputValue ||
    (
      (keydownValue === "Backspace" || keydownValue === "Delete") &&
      inputValue === null &&
      inputState === keydownState?.slice(0, -1)
    ) ||
    (keydownValue === "Enter" && inputValue === "\n")
  );
}

function matchesKeydownWithAPIInput(
  keydownTrace: RawTrace,
  inputTrace: RawTrace
): boolean {
  if (keydownTrace.url !== inputTrace.url) return false;

  const value = keydownTrace.event_value;
  const state = inputTrace.event_state;
  const code = keydownTrace.code;

  if (value == null || state == null) return false;

  /**
   *  value == Space
   *  code
   *  - Backspace
   *  - Period
   *  - Space
   *  - Enter
   *  - Delete
   *  - ArrowLeft
   *  - ArrowRight
   *  - CapsLock
   *  - Tab
   */
  // const tail = value === " " ? state.slice(-1) : state.slice(-2);
  // const tail = CODES.has(code) ? state.slice(-1) : state.slice(-2);
  // if (tail.includes(value)) {
  if (state.slice(-1) === value) {
    return true;
  }

  return false;
}

export function aggregateLocalContext(traces: RawTrace[], lastTraces: RawTrace[]) : RawTrace[] {
  const results: RawTrace[] = [];

  let lastFlush: RawTrace | null = null;

  let prev = lastTraces?.[0] ?? null;
  let prev2 = lastTraces?.[1] ?? null;
  let prev3 = lastTraces?.[2] ?? null;

  const flush = (t: RawTrace) => {
    if (t.event_type === "keydown") {
      const LENGTH = 1;
      if (t.start_position == null || t.end_position == null) {
        t.start_position = lastFlush?.end_position != null ? lastFlush.end_position : 0;
        t.end_position = t?.start_position != null ? t.start_position  + LENGTH : 0;
        if (t.event_value === "Backspace") {
          t.start_position = lastFlush?.end_position != null ? lastFlush.end_position : 0;
          t.end_position = t.start_position && t.start_position > 0 ? t.start_position - LENGTH : 0;
        }
      }
      if (t.event_value && t.event_value.length > 0 && t.event_state === "") {
        if (t.event_value === "Backspace") {
          t.event_state = lastFlush?.event_state?.slice(0, -1) || "";
          t.event_value = lastFlush?.event_state?.slice(-LENGTH) || null;
        }
        else if (t.event_value.length === LENGTH) {
          t.event_state = lastFlush?.event_state + t.event_value;
        }
        else {
          t.event_state = lastFlush?.event_state || "";
        }
      }
    }
    results.push(t);
    lastFlush = t;
  };

  for (let i = 0; i < traces.length; i++) {
    let defaultFlushTrace = true;
    const trace = traces[i];
    
    const next1: RawTrace | null = traces[i + 1] ?? null;
    const next2: RawTrace | null = traces[i + 2] ?? null;
    const next3: RawTrace | null = traces[i + 3] ?? null;

    // instruction: keydown is main event, input events are auxiliary
    // keystoke insert value may be multiple characters, provide start_position
    // keystoke delete provide start_position and end_position
    // input suggestion

    // here assume keydown auxiliary one input,
    // but also can be multiple
    if (trace.event_type === "keydown") {
      if (prev && prev.event_type === "ki") {
        prev.event_type = "keydown";

        let isBackspace = false;
        let eventStateChanged = false;
        let eventPositionChanged = false;

        if (prev.event_value === "Backspace" && prev.event_state === "") {
          prev.end_position = prev.start_position ? prev.start_position - 1 : null;
          isBackspace = true;
          eventPositionChanged = true;
        }

        if (next1) {
          if (next1.event_type === "input") {
            if (next1.source === "UserEvent" && matchesKeydownWithUserInput(prev, next1) && !isBackspace) {
              // TODO
              prev.event_state = eventStateChanged ? prev.event_state : next1.event_state;
              eventStateChanged = true;
            }

            if (next1.source === "API" && matchesKeydownWithAPIInput(prev, next1)) {
              prev.event_state = eventStateChanged ? prev.event_state : next1.event_state;
              eventStateChanged = true;
            }
          }

          // Match with API UserEvent
          if (next1.event_type === "keystroke") {
            if (next1.element_type === "insert") {
              if (!eventPositionChanged && next1.start_position && next1.event_value && next1.event_value.slice(-1) === prev.event_value) {
                prev.start_position = next1.start_position - 1 + next1.event_value.length - prev.event_value.length;
                prev.end_position = prev.start_position + prev.event_value.length;
                eventPositionChanged = true;
              }
            }
            else if (next1.element_type === "delete") {
              if (!eventPositionChanged && prev.event_value === "Backspace") {
                prev.start_position = next1.start_position;
                if (next1.start_position === next1.end_position && next1.start_position) {
                  prev.end_position = next1.start_position - 1;
                }
                else {
                  prev.end_position = next1.end_position;
                }
                eventPositionChanged = true;
              }
            }
          }
        }

        if (next2) {
          if (next2.event_type === "input") {
            if (next2.source === "UserEvent" && matchesKeydownWithUserInput(prev, next2) && !isBackspace) {
              prev.event_state = eventStateChanged ? prev.event_state : next2.event_state;
              eventStateChanged = true;
            }

            if (next2.source === "API" && matchesKeydownWithAPIInput(prev, next2)) {
                prev.event_state = eventStateChanged ? prev.event_state : next2.event_state;
                eventStateChanged = true;
            }
          }

          if (next2.event_type === "keystroke") {
            if (next2.element_type === "insert") {
              if (!eventPositionChanged && next2.start_position && next2.event_value && next2.event_value.slice(-1) === prev.event_value) {
                prev.start_position = next2.start_position - 1 + next2.event_value.length - prev.event_value.length;
                prev.end_position = prev.start_position + prev.event_value.length;
                eventPositionChanged = true;
              }
            }
            else if (next2.element_type === "delete") {
              if (!eventPositionChanged && prev.event_value === "Backspace") {
                prev.start_position = next2.start_position;
                if (next2.start_position === next2.end_position && next2.start_position) {
                  prev.end_position = next2.start_position - 1;
                }
                else {
                  prev.end_position = next2.end_position;
                }
                eventPositionChanged = true;
              }
            }
          }
        }

        if (next3) {
          if (next3.event_type === "input") {
            if (next3.source === "UserEvent" && matchesKeydownWithUserInput(prev, next3) && !isBackspace) {
              prev.event_state = eventStateChanged ? prev.event_state : next3.event_state;
              eventStateChanged = true;
            }

            if (next3.source === "API" && matchesKeydownWithAPIInput(prev, next3)) {
              prev.event_state = eventStateChanged ? prev.event_state : next3.event_state;
              eventStateChanged = true;
            }
          }

          if (next3.event_type === "keystroke") {
            if (next3.element_type === "insert") {
              if (!eventPositionChanged && next3.start_position && next3.event_value && next3.event_value.slice(-1) === prev.event_value) {
                prev.start_position = next3.start_position - 1 + next3.event_value.length - prev.event_value.length;
                prev.end_position = prev.start_position + prev.event_value.length;
                eventPositionChanged = true;
              }
            }
            else if (next3.element_type === "delete") {
              if (!eventPositionChanged && prev.event_value === "Backspace") {
                prev.start_position = next3.start_position;
                if (next3.start_position === next3.end_position && next3.start_position) {
                  prev.end_position = next3.start_position - 1;
                }
                else {
                  prev.end_position = next3.end_position;
                }
                eventPositionChanged = true;
              }
            }
          }
        }

        if (prev2) {
          if (prev2.event_type === "input") {
            if (prev2.source === "UserEvent" && matchesKeydownWithUserInput(prev, prev2) && !isBackspace) {
              prev.event_state = eventStateChanged ? prev.event_state : prev2.event_state;
              eventStateChanged = true;
            }

            if (prev2.source === "API" && matchesKeydownWithAPIInput(prev, prev2)) {
                prev.event_state = eventStateChanged ? prev.event_state : prev2.event_state;
                eventStateChanged = true;
            }
          }
        }

        if (prev3) {
          if (prev3.event_type === "input") {
            if (prev3.source === "UserEvent" && matchesKeydownWithUserInput(prev, prev3) && !isBackspace) {
              prev.event_state = eventStateChanged ? prev.event_state : prev3.event_state;
              eventStateChanged = true;
            }

            if (prev3.source === "API" && matchesKeydownWithAPIInput(prev, prev3)) {
                prev.event_state = eventStateChanged ? prev.event_state : prev3.event_state;
                eventStateChanged = true;
            }
          }
        }

        flush(prev);
      }

      // keydown -> ki
      trace.event_type = "ki";
      trace.origin_value = trace.event_state;
      if (trace.code === "Backspace") {
        trace.end_position = trace.start_position ? trace.start_position - 1 : null;
      }
      else if (trace.code === "Delete") {
        trace.end_position = trace.start_position ? trace.start_position + 1 : null;
      }
      else if (trace.code === "Tab") {

      }
      else if (trace.code === "Enter") {

      }
      else {
        if (trace.start_position != null && trace.event_value != null) {
          trace.end_position = trace.start_position + trace.event_value.length;
        }
      }
    }
    else if (trace.event_type === "input") {
      if (prev && prev.event_type === "ki") {
        prev.event_type = "keydown";

        let isBackspace = false;
        let eventStateChanged = false;
        let eventPositionChanged = false;

        if (prev.event_value === "Backspace" && prev.event_state === "") {
          prev.end_position = prev.start_position ? prev.start_position - 1 : null;
          isBackspace = true;
          eventPositionChanged = true;
        }

        if (
          trace.source === "UserEvent" &&
          matchesKeydownWithUserInput(prev, trace) &&
          !isBackspace
        ) {
          prev.event_state = eventStateChanged ? prev.event_state : trace.event_state;
          eventStateChanged = true;
        }
        if (trace.source === "API" && matchesKeydownWithAPIInput(prev, trace)) {
          prev.event_state = eventStateChanged ? prev.event_state : trace.event_state;
          eventStateChanged = true;
        }

        // must go around the context, to fill the missing attributes
        if (next1) {
          if (next1.event_type === "input" ) {
            if (next1.source === "UserEvent" && matchesKeydownWithUserInput(prev, next1) && !isBackspace) {
              prev.event_state = eventStateChanged ? prev.event_state : next1.event_state;
              eventStateChanged = true;
            }

            if (next1.source === "API" && matchesKeydownWithAPIInput(prev, next1)) {
              prev.event_state = eventStateChanged ? prev.event_state : next1.event_state;
              eventStateChanged = true;
            }
          }

          // Match with API UserEvent
          if (next1.event_type === "keystroke") {
            if (next1.element_type === "insert") {
              if (!eventPositionChanged && next1.start_position && next1.event_value && next1.event_value.slice(-1) === prev.event_value) {
                prev.start_position = next1.start_position - 1 + next1.event_value.length - prev.event_value.length;
                prev.end_position = prev.start_position + prev.event_value.length;
                eventPositionChanged = true;
              }
            }
            else if (next1.element_type === "delete") {
              if (!eventPositionChanged && prev.event_value === "Backspace") {
                prev.start_position = next1.start_position;
                if (next1.start_position === next1.end_position && next1.start_position) {
                  prev.end_position = next1.start_position - 1;
                }
                else {
                  prev.end_position = next1.end_position;
                }
                eventPositionChanged = true;
              }
            }
          }
        }

        if (next2) {
          if (next2.event_type === "input") {
            if (next2.source === "UserEvent" && matchesKeydownWithUserInput(prev, next2) && !isBackspace) {
              prev.event_state = eventStateChanged ? prev.event_state : next2.event_state;
              eventStateChanged = true;
            }

            if (next2.source === "API" && matchesKeydownWithAPIInput(prev, next2)) {
                prev.event_state = eventStateChanged ? prev.event_state : next2.event_state;
                eventStateChanged = true;
            }
          }

          if (next2.event_type === "keystroke") {
            if (!eventPositionChanged && next2.element_type === "insert") {
              if (next2.start_position && next2.event_value && next2.event_value.slice(-1) === prev.event_value) {
                prev.start_position = next2.start_position - 1 + next2.event_value.length - prev.event_value.length;
                prev.end_position = prev.start_position + prev.event_value.length;
                eventPositionChanged = true;
              }
            }
            else if (next2.element_type === "delete") {
              if (!eventPositionChanged && prev.event_value === "Backspace") {
                prev.start_position = next2.start_position;
                if (next2.start_position === next2.end_position && next2.start_position) {
                  prev.end_position = next2.start_position - 1;
                }
                else {
                  prev.end_position = next2.end_position;
                }
                eventPositionChanged = true;
              }
            }
          }
        }

        if (next3) {
          if (next3.event_type === "input") {
            if (next3.source === "UserEvent" && matchesKeydownWithUserInput(prev, next3) && !isBackspace) {
              prev.event_state = eventStateChanged ? prev.event_state : next3.event_state;
              eventStateChanged = true;
            }

            if (next3.source === "API" && matchesKeydownWithAPIInput(prev, next3)) {
              prev.event_state = eventStateChanged ? prev.event_state : next3.event_state;
              eventStateChanged = true;
            }
          }

          if (next3.event_type === "keystroke") {
            if (next3.element_type === "insert") {
              if (!eventPositionChanged && next3.start_position && next3.event_value && next3.event_value.slice(-1) === prev.event_value) {
                prev.start_position = next3.start_position - 1 + next3.event_value.length - prev.event_value.length;
                prev.end_position = prev.start_position + prev.event_value.length;
                eventPositionChanged = true;
              }
            }
            else if (next3.element_type === "delete") {
              if (!eventPositionChanged && prev.event_value === "Backspace") {
                prev.start_position = next3.start_position;
                if (next3.start_position === next3.end_position && next3.start_position) {
                  prev.end_position = next3.start_position - 1;
                }
                else {
                  prev.end_position = next3.end_position;
                }
                eventPositionChanged = true;
              }
            }
          }
        }

        if (prev2) {
          if (prev2.event_type === "input") {
            if (prev2.source === "UserEvent" && matchesKeydownWithUserInput(prev, prev2) && !isBackspace) {
              prev.event_state = eventStateChanged ? prev.event_state : prev2.event_state;
              eventStateChanged = true;
            }

            if (prev2.source === "API" && matchesKeydownWithAPIInput(prev, prev2)) {
              prev.event_state = eventStateChanged ? prev.event_state : prev2.event_state;
              eventStateChanged = true;
            }
          }

          if (prev2.event_type === "keystroke") {
          }
        }

        if (prev3) {
          if (prev3.event_type === "input") {
            if (prev3.source === "UserEvent" && matchesKeydownWithUserInput(prev, prev3) && !isBackspace) {
              prev.event_state = eventStateChanged ? prev.event_state : prev3.event_state;
              eventStateChanged = true;
            }

            if (prev3.source === "API" && matchesKeydownWithAPIInput(prev, prev3)) {
              prev.event_state = eventStateChanged ? prev.event_state : prev3.event_state;
              eventStateChanged = true;
            }
          }

          if (prev3.event_type === "keystroke") {
          }
        }

        flush(prev);
      }
    }
    else {
      if (prev && prev.event_type === "ki") {
        prev.event_type = "keydown";

        let isBackspace = false;
        let eventStateChanged = false;
        let eventPositionChanged = false;

        if (prev.event_value === "Backspace" && prev.event_state === "") {
          prev.end_position = prev.start_position ? prev.start_position - 1 : null;
          isBackspace = true;
          eventPositionChanged = true;
        }

        // need to address after event_state filled
        // this trace will not be input, keydown
        if (trace.event_type === "keystroke") {
          if (trace.element_type === "insert") {
            if (!eventPositionChanged && trace.start_position && trace.event_value && trace.event_value.slice(-1) === prev.event_value) {
              prev.start_position = trace.start_position - 1 + trace.event_value.length - prev.event_value.length;
              prev.end_position = prev.start_position + prev.event_value.length;
              eventPositionChanged = true;
            }
          }
          else if (trace.element_type === "delete") {
            if (!eventPositionChanged && prev.event_value === "Backspace") {
              prev.start_position = trace.start_position;
              if (trace.start_position === trace.end_position && trace.start_position) {
                prev.end_position = trace.start_position - 1;
              }
              else {
                prev.end_position = trace.end_position;
              }
              eventPositionChanged = true;
            }
          }
        }

        if (next1) {
          if (next1.event_type === "input") {
            if (next1.source === "UserEvent" && matchesKeydownWithUserInput(prev, next1) && !isBackspace) {
              prev.event_state = eventStateChanged ? prev.event_state : next1.event_state;
              eventStateChanged = true;
            }

            if (next1.source === "API" && matchesKeydownWithAPIInput(prev, next1)) {
              prev.event_state = eventStateChanged ? prev.event_state : next1.event_state;
              eventStateChanged = true;
            }
          }

          if (next1.event_type === "keystroke") {
            if (next1.element_type === "insert") {
              if (!eventPositionChanged && next1.start_position && next1.event_value && next1.event_value.slice(-1) === prev.event_value) {
                prev.start_position = next1.start_position - 1 + next1.event_value.length - prev.event_value.length;
                prev.end_position = prev.start_position + prev.event_value.length;
                eventPositionChanged = true;
              }
            }
            else if (next1.element_type === "delete") {
              if (!eventPositionChanged && prev.event_value === "Backspace") {
                prev.start_position = next1.start_position;
                if (next1.start_position === next1.end_position && next1.start_position) {
                  prev.end_position = next1.start_position - 1;
                }
                else {
                  prev.end_position = next1.end_position;
                }
                eventPositionChanged = true;
              }
            }
          }
        }

        if (next2) {
          if (next2.event_type === "input") {
            if (next2.source === "UserEvent" && matchesKeydownWithUserInput(prev, next2) && !isBackspace) {
              prev.event_state = eventStateChanged ? prev.event_state : next2.event_state;
              eventStateChanged = true;
            }

            if (next2.source === "API" && matchesKeydownWithAPIInput(prev, next2)) {
                prev.event_state = eventStateChanged ? prev.event_state : next2.event_state;
                eventStateChanged = true;
            }
          }

          if (next2.event_type === "keystroke") {
            if (next2.element_type === "insert") {
              if (!eventPositionChanged && next2.start_position && next2.event_value && next2.event_value.slice(-1) === prev.event_value) {
                prev.start_position = next2.start_position - 1 + next2.event_value.length - prev.event_value.length;
                prev.end_position = prev.start_position + prev.event_value.length;
                eventPositionChanged = true;
              }
            }
            else if (next2.element_type === "delete") {
              if (!eventPositionChanged && prev.event_value === "Backspace") {
                prev.start_position = next2.start_position;
                if (next2.start_position === next2.end_position && next2.start_position) {
                  prev.end_position = next2.start_position - 1;
                }
                else {
                  prev.end_position = next2.end_position;
                }
                eventPositionChanged = true;
              }
            }
          }
        }

        if (next3) {
          if (next3.event_type === "input") {
            if (next3.source === "UserEvent" && matchesKeydownWithUserInput(prev, next3) && !isBackspace) {
              prev.event_state = eventStateChanged ? prev.event_state : next3.event_state;
              eventStateChanged = true;
            }

            if (next3.source === "API" && matchesKeydownWithAPIInput(prev, next3)) {
              prev.event_state = eventStateChanged ? prev.event_state : next3.event_state;
              eventStateChanged = true;
            }
          }

          if (next3.event_type === "keystroke") {
            if (next3.element_type === "insert") {
              if (!eventPositionChanged && next3.start_position && next3.event_value && next3.event_value.slice(-1) === prev.event_value) {
                prev.start_position = next3.start_position - 1 + next3.event_value.length - prev.event_value.length;
                prev.end_position = prev.start_position + prev.event_value.length;
                eventPositionChanged = true;
              }
            }
            else if (next3.element_type === "delete") {
              if (!eventPositionChanged && prev.event_value === "Backspace") {
                prev.start_position = next3.start_position;
                if (next3.start_position === next3.end_position && next3.start_position) {
                  prev.end_position = next3.start_position - 1;
                }
                else {
                  prev.end_position = next3.end_position;
                }
                eventPositionChanged = true;
              }
            }
          }
        }

        if (prev2) {
          if (prev2.event_type === "input") {
            if (prev2.source === "UserEvent" && matchesKeydownWithUserInput(prev, prev2) && !isBackspace) {
              prev.event_state = eventStateChanged ? prev.event_state : prev2.event_state;
              eventStateChanged = true;
            }

            if (prev2.source === "API" && matchesKeydownWithAPIInput(prev, prev2)) {
              prev.event_state = eventStateChanged ? prev.event_state : prev2.event_state;
              eventStateChanged = true;
            }
          }

          if (prev2.event_type === "keystroke") {
            if (prev2.element_type === "insert") {
              if (!eventPositionChanged && prev2.start_position && prev2.event_value && prev2.event_value.slice(-1) === prev.event_value) {
                prev.start_position = prev2.start_position - 1 + prev2.event_value.length - prev.event_value.length;
                prev.end_position = prev.start_position + prev.event_value.length;
                eventPositionChanged = true;
              }
            }
            else if (prev2.element_type === "delete") {
              if (!eventPositionChanged && prev.event_value === "Backspace") {
                prev.start_position = prev2.start_position;
                if (prev2.start_position === prev2.end_position && prev2.start_position) {
                  prev.end_position = prev2.start_position - 1;
                }
                else {
                  prev.end_position = prev2.end_position;
                }
                eventPositionChanged = true;
              }
            }
          }
        }

        if (prev3) {
          if (prev3.event_type === "input") {
            if (prev3.source === "UserEvent" && matchesKeydownWithUserInput(prev, prev3) && !isBackspace) {
              prev.event_state = eventStateChanged ? prev.event_state : prev3.event_state;
              eventStateChanged = true;
            }

            if (prev3.source === "API" && matchesKeydownWithAPIInput(prev, prev3)) {
              prev.event_state = eventStateChanged ? prev.event_state : prev3.event_state;
              eventStateChanged = true;
            }
          }

          if (prev3.event_type === "keystroke") {
            if (prev3.element_type === "insert") {
              if (!eventPositionChanged && prev3.start_position && prev3.event_value && prev3.event_value.slice(-1) === prev.event_value) {
                prev.start_position = prev3.start_position - 1 + prev3.event_value.length - prev.event_value.length;
                prev.end_position = prev.start_position + prev.event_value.length;
                eventPositionChanged = true;
              }
            }
            else if (prev3.element_type === "delete") {
              if (!eventPositionChanged && prev.event_value === "Backspace") {
                prev.start_position = prev3.start_position;
                if (prev3.start_position === prev3.end_position && prev3.start_position) {
                  prev.end_position = prev3.start_position - 1;
                }
                else {
                  prev.end_position = prev3.end_position;
                }
                eventPositionChanged = true;
              }
            }
          }
        }

        flush(prev);
      }

      if (trace.event_type === "navigation") {
        if (prev && prev.event_type === "navigation" && prev.url === trace.url) {
          // don't flush duplicate navigation
          defaultFlushTrace = false;
        }
      }

      if (trace.event_type === "keystroke") {
        defaultFlushTrace = false;
      }

      // flush other events
      if (defaultFlushTrace) {
        flush(trace);
      }
    }

    // Update last traces for next iteration
    prev3 = prev2;
    prev2 = prev;
    prev = trace;
  }

  return results;
}

export function aggregateGlobalContext(traces: RawTrace[]): RawTrace[] {
  const mutationKey = (t: RawTrace): string =>
    `${t.user_id ?? ""}::${t.session_id ?? ""}::${t.tag ?? ""}`;

  const latestMap = new Map<string, RawTrace>();
  const results: RawTrace[] = [];

  for (const trace of traces) {
    if (trace.source !== "Mutation") continue;

    const key = mutationKey(trace);
    const existing = latestMap.get(key);

    if (!existing) {
      latestMap.set(key, trace);
    } else {
      const existingTs = existing.timestamp ?? -Infinity;
      const currentTs = trace.timestamp ?? -Infinity;

      if (currentTs >= existingTs) {
        latestMap.set(key, trace);
      }
    }
  }

  for (const trace of traces) {
    if (trace.source === "Mutation") {
      const key = mutationKey(trace);
      const latest = latestMap.get(key);
      if (latest?.id === trace.id) {
        trace.event_type = trace.author == "AI" ? "ai_response" : "user_query";
        results.push(trace);
      }
    }
    else if (trace.event_value === "Backspace") {
      trace.event_value = trace.origin_value?.slice(-1) || "Delete";
      results.push(trace);
    }
    else {
      results.push(trace);
    }
  }

  return results;
}
