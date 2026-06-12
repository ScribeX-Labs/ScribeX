const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface UploadResult {
  id: string;
  filename: string;
  file_url: string;
  transcription_job_name: string;
}

export interface TranscriptionStatus {
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  transcript_uri?: string;
  failure_reason?: string;
}

export interface SubscriptionInfo {
  user_id: string;
  subscription: {
    tier: 'free' | 'pro';
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  };
  limits: {
    file_size: number;
    duration: number;
    file_size_display?: string;
    duration_display?: string;
    display: { file_size: string; duration: string };
  };
}

export interface ConversationTurn {
  question: string;
  answer: string;
  timestamp?: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === 'string') detail = body.detail;
    } catch {
      // keep the generic message
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

function jsonInit(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export const api = {
  uploadMedia(userId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    return request<UploadResult>(`/upload-media/?user_id=${userId}`, {
      method: 'POST',
      body: form,
    });
  },

  transcriptionStatus(userId: string, docId: string) {
    return request<TranscriptionStatus>(`/transcription-status/${userId}/${docId}`);
  },

  transcription(userId: string, docId: string) {
    return request<{ results: { transcripts: { transcript: string }[] } }>(
      `/transcription/${userId}/${docId}`,
    );
  },

  refreshMediaUrl(userId: string, fileUrl: string) {
    return request<{ id: string; new_file_url: string }>(
      '/update-media-url',
      jsonInit('POST', { user_id: userId, file_url: fileUrl }),
    );
  },

  aiUpload(params: { text: string; file_id: string; user_id: string; file_type: string }) {
    return request<{ text_id: string }>('/ai/upload', jsonInit('POST', params));
  },

  aiAsk(params: {
    text_id: string;
    question: string;
    user_id: string;
    file_id: string;
    file_type: string;
  }) {
    return request<{ answer: string; text_id: string }>('/ai/ask', jsonInit('POST', params));
  },

  aiHistory(textId: string, params: { user_id: string; file_id: string; file_type: string }) {
    const qs = new URLSearchParams(params);
    return request<{ conversation: ConversationTurn[] }>(
      `/ai/conversation/${textId}?${qs.toString()}`,
    );
  },

  async getSubscription(userId: string) {
    const info = await request<SubscriptionInfo>(`/subscriptions/${userId}`);
    // older server builds only send the flat *_display fields
    info.limits.display ??= {
      file_size: info.limits.file_size_display ?? `${Math.round(info.limits.file_size / 1024 / 1024)} MB`,
      duration: info.limits.duration_display ?? `${Math.round(info.limits.duration / 60)} minutes`,
    };
    return info;
  },

  setSubscription(userId: string, tier: 'free' | 'pro', idToken: string) {
    return request<SubscriptionInfo & { message: string }>(`/subscriptions/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ tier }),
    });
  },
};
