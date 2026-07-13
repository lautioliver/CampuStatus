export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function parseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const body = await parseJson(response);

  if (!response.ok) {
    throw new ApiError(
      (body as { error?: string }).error ?? `Error ${response.status}`,
      response.status,
      (body as { code?: string }).code
    );
  }

  return body as T;
}

export function fetchZones() {
  return request<{ zones: unknown[] }>('/api/zones');
}

export function submitVote(zoneId: string, levelId: string) {
  return request<{ zone: unknown; acceptedLevel: unknown }>(`/api/zones/${zoneId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ levelId }),
  });
}
