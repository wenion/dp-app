// import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { RawTrace, RawTraceInsert } from "@/types/raw-trace";
import { Trace } from "@/types/trace";

const trim = (v?: string | null) => (v ?? "").trim();

export function getPageType(url: string): "AI" | "editor" | "other" {
  const u = url.toLowerCase();

  // ---------- AI tools ----------
  if (
    u.includes("chatgpt.com") ||
    u.includes("openai.com") ||
    u.includes("claude.ai") ||
    u.includes("perplexity.ai") ||
    u.includes("notellm") ||
    u.includes("gemini.google.com") ||
    u.includes("copilot.microsoft.com")
  ) {
    return "AI";
  }

  // ---------- Editors / writing tools ----------
  if (
    u.includes("docs.google.com") ||
    u.includes("notion.so") ||
    u.includes("notion.site") ||
    u.includes("office.com") ||
    u.includes("word.office.com") ||
    u.includes("overleaf.com") ||
    u.includes("medium.com") ||
    u.includes("quillbot.com")
  ) {
    return "editor";
  }

  return "other";
}

// type TransformationResult = {
//   inserted: number;
//   errors: PostgrestSingleResponse<null>["error"][];
// };

/* Transform RawTraces To Traces */
export function transformation(
  traces: RawTraceInsert[],
  version: string,
) {
  return traces.map((trace) => {
    let event_type = trace.event_type;
    let element_text: string | null = null;
    let page_type: "AI" | "editor" | "other" = getPageType(trace.url ?? "");
    let author = trace.author;
    let event_id = trace.event_id;
    let container_id =
        trace.container_id !== null
          ? String(trace.container_id)
          : null;

    if (trace.event_type === "pointerdown") {
      event_type = "click";
      author = "human";
      if (trace.tag === "INPUT") {
        element_text = trim(trace.label) ||
          trim(trace.placeholder) ||
          trim(trace.name);
      }
      else if (trace.tag === "TEXTAREA") {
        element_text = trim(trace.label) ||
          trim(trace.placeholder) ||
          trim(trace.name) ||
          trim(trace.text_content);
      }
      else if (trace.tag === "SELECT") {
        element_text = trim(trace.label) ||
          trim(trace.value_label) ||
          trim(trace.name) ||
          trim(trace.text_content);
      }
      else if (trace.tag === "BUTTON" || trace.tag === "A") {
        element_text = trim(trace.label) ||
          trim(trace.value_label) ||
          trim(trace.name) ||
          trim(trace.text_content);
      }
      else {
        element_text = trim(trace.label) || trim(trace.text_content);
      }
    }
    else if (trace.event_type === "keydown") {
      const startPosition = trace.start_position;
      const endPosition = trace.end_position;
      const value = trace.event_value;
      const state = trace.event_state;

      if (value && value.length > 1) {
        if (value === "Enter") {
          event_type = "insert";
        }
        else {
          event_type = "keydown";
        }
      }
      else if (value && value.length === 1) {
        if ((startPosition != null) && (state?.slice(startPosition, startPosition + 1) === value)) {
          event_type = "insert";
        }
        else {
          event_type = "delete";
        }
      }
    }
    else if (trace.event_type === "mutation") {
      event_type = author == "AI" ? "ai_response" : "user_query";
      event_id = trace.name ?? null;
      container_id = trace.session_id;
    }
    else if (trace.event_type === "keystroke") {
      event_type = trace.element_type ? trace.element_type : "keystroke";
      element_text = trace.key;
    }
    else if (trace.event_type === "copy") {
    }
    else if (trace.event_type === "cut") {
    }
    else if (trace.event_type === "paste") {
    }

    const transformed: Trace = {
      event_type: event_type,
      user_id: trace.user_id,

      url: trace.url ?? null,
      page_type: page_type,
      author: author,
      message: trace.message ?? null,

      cursor_position: trace.start_position ?? null,
      end_position: trace.end_position ?? null,
      event_value: trace.event_value ?? null,

      tag_name: trace.tag ?? null,
      element_text: element_text,

      offset_x: trace.client_x ?? null,
      offset_y: trace.client_y ?? null,
      width: trace.width ?? null,
      height: trace.height ?? null,

      x_path: trace.x_path ?? null,
      container_id: container_id,

      event_state: trace.event_state ?? null,
      event_id: event_id,

      event_time:
        trace.timestamp != null
          ? new Date(trace.timestamp).toISOString()
          : null,

      version
    };

    return transformed;

  });
}
