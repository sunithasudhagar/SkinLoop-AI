/**
 * Dedicated YouCam API Service Module
 * Implements official Perfect Corp YouCam S2S v2.0 API specifications:
 * - File API: POST /s2s/v2.0/file + presigned PUT upload
 * - AI Skin Analysis: POST /s2s/v2.0/task/skin-analysis + polling GET /s2s/v2.0/task/skin-analysis/{task_id}
 * - AI Look Virtual Try-On: POST /s2s/v2.0/task/look-vto + polling GET /s2s/v2.0/task/look-vto/{task_id}
 * - Look Templates: GET /s2s/v2.0/task/template/look-vto
 */

export interface YouCamScoreFeature {
  raw_score?: number;
  ui_score: number;
  output_mask_name?: string;
  [key: string]: any;
}

export interface YouCamRawScoreInfo {
  all?: number;
  skin_age?: number;
  hd_wrinkle?: YouCamScoreFeature;
  hd_pore?: YouCamScoreFeature;
  hd_texture?: YouCamScoreFeature;
  hd_acne?: YouCamScoreFeature;
  oiliness?: YouCamScoreFeature;
  moisture?: YouCamScoreFeature;
  radiance?: YouCamScoreFeature;
  redness?: YouCamScoreFeature;
  dark_circle?: YouCamScoreFeature;
  eyebag?: YouCamScoreFeature;
  hd_skin_type?: {
    skin_type?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface YouCamSkinAnalysisOutput {
  taskId: string;
  status: 'success';
  scoreInfo: YouCamRawScoreInfo;
  outputUrl?: string;
  rawResponse?: any;
}

export interface YouCamTryOnOutput {
  taskId: string;
  status: 'success';
  outputUrl: string;
  templateId: string;
}

export interface YouCamConfigStatus {
  isConfigured: boolean;
  keyConfigured: boolean;
  keySource: 'YOUCAM_API_KEY' | 'none';
  baseUrl: string;
  endpoints: {
    fileUpload: string;
    skinAnalysis: string;
    lookVto: string;
    lookVtoTemplates: string;
  };
  maxFileSizeBytes: number;
  supportedMimeTypes: string[];
}

export class YouCamService {
  private static readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  private static readonly SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private static readonly DEFAULT_BASE_URL = 'https://yce-api-01.makeupar.com';
  private static readonly POLLING_TIMEOUT_MS = 35000; // 35 seconds max
  private static readonly POLLING_INTERVAL_MS = 1500; // 1.5 seconds

  /**
   * Resolves the server-side API key.
   * Standardized canonical environment variable: YOUCAM_API_KEY.
   * Accepts fallback to YOUTHCAM_API_KEY if previously configured.
   * Never exposes this key outside the server.
   */
  private static getApiKey(): { key: string | null; source: 'YOUCAM_API_KEY' | 'none' } {
    if (process.env.YOUCAM_API_KEY && process.env.YOUCAM_API_KEY.trim().length > 8) {
      return { key: process.env.YOUCAM_API_KEY.trim(), source: 'YOUCAM_API_KEY' };
    }
    if (process.env.YOUTHCAM_API_KEY && process.env.YOUTHCAM_API_KEY.trim().length > 8) {
      return { key: process.env.YOUTHCAM_API_KEY.trim(), source: 'YOUCAM_API_KEY' };
    }
    return { key: null, source: 'none' };
  }

  private static getBaseUrl(customBaseUrl?: string): string {
    const raw = customBaseUrl || process.env.YOUCAM_BASE_URL || process.env.YOUTHCAM_BASE_URL || process.env.YOUCAM_ENDPOINT || this.DEFAULT_BASE_URL;
    // Regional handling: If user provides portal link https://yce.makeupar.com/ai-api, map to official S2S host
    if (raw.includes('yce.makeupar.com') || raw.includes('/ai-api')) {
      return 'https://yce-api-01.makeupar.com';
    }
    // Strip trailing slashes or subpaths if full endpoint was passed
    if (raw.includes('/s2s/v2.0') || raw.includes('/v1/')) {
      try {
        const u = new URL(raw);
        return `${u.protocol}//${u.host}`;
      } catch {
        return this.DEFAULT_BASE_URL;
      }
    }
    return raw.replace(/\/+$/, '');
  }

  /**
   * Safe status check that never exposes credentials.
   */
  public static getStatus(): YouCamConfigStatus {
    const { key } = this.getApiKey();
    const baseUrl = this.getBaseUrl();
    return {
      isConfigured: Boolean(key),
      keyConfigured: Boolean(key),
      keySource: key ? 'YOUCAM_API_KEY' : 'none',
      baseUrl,
      endpoints: {
        fileUpload: `${baseUrl}/s2s/v2.0/file`,
        skinAnalysis: `${baseUrl}/s2s/v2.0/task/skin-analysis`,
        lookVto: `${baseUrl}/s2s/v2.0/task/look-vto`,
        lookVtoTemplates: `${baseUrl}/s2s/v2.0/task/template/look-vto`,
      },
      maxFileSizeBytes: this.MAX_FILE_SIZE_BYTES,
      supportedMimeTypes: this.SUPPORTED_MIME_TYPES,
    };
  }

  /**
   * Validates and parses image input (base64 data URI or buffer).
   */
  public static parseAndValidateImage(imageBase64OrBuffer: string | Buffer): {
    buffer: Buffer;
    mimeType: string;
    size: number;
    filename: string;
  } {
    let buffer: Buffer;
    let mimeType = 'image/jpeg';
    let filename = `face_${Date.now()}.jpg`;

    if (Buffer.isBuffer(imageBase64OrBuffer)) {
      buffer = imageBase64OrBuffer;
    } else if (typeof imageBase64OrBuffer === 'string') {
      if (imageBase64OrBuffer.startsWith('data:')) {
        const match = imageBase64OrBuffer.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (!match) {
          throw new Error('Invalid image base64 format. Expected data URI with base64 payload.');
        }
        mimeType = match[1].toLowerCase();
        const base64Data = match[2];
        buffer = Buffer.from(base64Data, 'base64');
      } else {
        buffer = Buffer.from(imageBase64OrBuffer, 'base64');
      }
    } else {
      throw new Error('Image data must be a base64 string or binary Buffer.');
    }

    const size = buffer.length;

    if (size === 0) {
      throw new Error('Uploaded image file is empty (0 bytes).');
    }

    if (size > this.MAX_FILE_SIZE_BYTES) {
      throw new Error(
        `Uploaded image exceeds maximum allowed limit of ${this.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB. (Actual size: ${(size / (1024 * 1024)).toFixed(2)}MB)`
      );
    }

    // Normalize mime type
    if (mimeType === 'image/jpg') mimeType = 'image/jpeg';
    if (!this.SUPPORTED_MIME_TYPES.includes(mimeType) && !imageBase64OrBuffer.toString().startsWith('data:image/svg')) {
      throw new Error(
        `Unsupported image format: ${mimeType}. Please provide JPEG, PNG, or WebP.`
      );
    }

    // Verify binary magic numbers when buffer is >= 4 bytes
    if (size >= 4 && !imageBase64OrBuffer.toString().startsWith('data:image/svg')) {
      const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8;
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
      const isWebp = buffer.toString('ascii', 0, 4) === 'RIFF' && size >= 12 && buffer.toString('ascii', 8, 12) === 'WEBP';

      if (!isJpeg && !isPng && !isWebp) {
        throw new Error('Invalid image binary: Header does not match recognized JPEG, PNG, or WebP magic signatures.');
      }

      if (isJpeg) mimeType = 'image/jpeg';
      else if (isPng) mimeType = 'image/png';
      else if (isWebp) mimeType = 'image/webp';
    }

    const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
    filename = `face_${Date.now()}.${ext}`;

    return { buffer, mimeType, size, filename };
  }

  /**
   * Uploads file to YouCam S2S v2.0 File API:
   * 1. POST /s2s/v2.0/file -> returns file_id & presigned requests.url
   * 2. PUT binary buffer to requests[0].url
   */
  public static async uploadFile(
    buffer: Buffer,
    mimeType: string,
    filename: string
  ): Promise<string> {
    const { key } = this.getApiKey();
    if (!key) {
      throw new Error('YOUCAM_API_KEY is not configured on the server.');
    }

    const baseUrl = this.getBaseUrl();
    const registerUrl = `${baseUrl}/s2s/v2.0/file`;

    const registerPayload = {
      files: [
        {
          content_type: mimeType,
          file_name: filename,
          file_size: buffer.length,
        },
      ],
    };

    const registerRes = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerPayload),
      signal: AbortSignal.timeout(15000),
    });

    if (!registerRes.ok) {
      const errBody = await registerRes.text();
      throw new Error(
        `YouCam File API initialization failed (HTTP ${registerRes.status}): ${errBody.slice(0, 300)}`
      );
    }

    const registerData = (await registerRes.json()) as any;
    const fileEntry = registerData?.data?.files?.[0];
    if (!fileEntry || !fileEntry.file_id) {
      throw new Error('YouCam File API did not return a valid file_id.');
    }

    const fileId = fileEntry.file_id;
    const uploadRequest = fileEntry.requests?.[0];
    if (!uploadRequest || !uploadRequest.url) {
      throw new Error('YouCam File API did not return an upload destination URL.');
    }

    const uploadUrl = uploadRequest.url;
    const uploadMethod = uploadRequest.method || 'PUT';

    // Step 2: Upload binary directly to presigned URL (Do not send Bearer token to S3)
    const uploadRes = await fetch(uploadUrl, {
      method: uploadMethod,
      headers: {
        'Content-Type': mimeType,
      },
      body: new Uint8Array(buffer),
      signal: AbortSignal.timeout(20000),
    });

    if (!uploadRes.ok) {
      const uploadErr = await uploadRes.text();
      throw new Error(
        `Failed to transfer image to YouCam storage (HTTP ${uploadRes.status}): ${uploadErr.slice(0, 200)}`
      );
    }

    return fileId;
  }

  /**
   * Submits and polls YouCam Skin Analysis task:
   * 1. POST /s2s/v2.0/task/skin-analysis
   * 2. Polls GET /s2s/v2.0/task/skin-analysis/{task_id}
   */
  public static async analyzeSkin(
    imageInput: { fileId?: string; fileBuffer?: Buffer; mimeType?: string; filename?: string; imageUrl?: string },
    options?: {
      customBaseUrl?: string;
      dstActions?: string[];
    }
  ): Promise<YouCamSkinAnalysisOutput> {
    const { key } = this.getApiKey();
    if (!key) {
      throw new Error('YOUCAM_API_KEY is not configured on the server.');
    }

    let fileId = imageInput.fileId;

    // If binary buffer provided, upload it first to obtain fileId
    if (!fileId && imageInput.fileBuffer && imageInput.mimeType && imageInput.filename) {
      fileId = await this.uploadFile(
        imageInput.fileBuffer,
        imageInput.mimeType,
        imageInput.filename
      );
    }

    if (!fileId && !imageInput.imageUrl) {
      throw new Error('Neither file_id nor image_url was provided for skin analysis.');
    }

    const baseUrl = this.getBaseUrl(options?.customBaseUrl);
    const taskInitUrl = `${baseUrl}/s2s/v2.0/task/skin-analysis`;

    // Standard documented concerns supported by YouCam AI Skin Analysis (SD)
    const dstActions = options?.dstActions || [
      'wrinkle',
      'pore',
      'texture',
      'acne',
      'redness',
      'oiliness',
      'moisture',
      'firmness',
      'radiance',
      'eye_bag',
      'dark_circle_v2',
    ];

    const taskPayload: any = {
      dst_actions: dstActions,
      format: 'json',
      miniserver_args: {
        enable_mask_overlay: true,
      },
    };

    if (fileId) {
      taskPayload.src_file_id = fileId;
    } else if (imageInput.imageUrl) {
      taskPayload.src_file_url = imageInput.imageUrl;
    }

    // Step 1: Initiate task with 15s timeout
    const initRes = await fetch(taskInitUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskPayload),
      signal: AbortSignal.timeout(15000),
    });

    if (!initRes.ok) {
      const errText = await initRes.text();
      throw new Error(
        `YouCam Skin Analysis initiation failed (HTTP ${initRes.status}): ${errText.slice(0, 300)}`
      );
    }

    const initData = (await initRes.json()) as any;
    const taskId = initData?.data?.task_id;
    if (!taskId) {
      throw new Error('YouCam Skin Analysis API did not return a task_id.');
    }

    // Step 2: Poll task status
    const pollUrl = `${baseUrl}/s2s/v2.0/task/skin-analysis/${taskId}`;
    const startTime = Date.now();

    while (Date.now() - startTime < this.POLLING_TIMEOUT_MS) {
      await new Promise((resolve) => setTimeout(resolve, this.POLLING_INTERVAL_MS));

      const pollRes = await fetch(pollUrl, {
        headers: {
          'Authorization': `Bearer ${key}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!pollRes.ok) {
        const pollErr = await pollRes.text();
        throw new Error(
          `Error polling YouCam Skin Analysis task ${taskId} (HTTP ${pollRes.status}): ${pollErr.slice(0, 200)}`
        );
      }

      const pollData = (await pollRes.json()) as any;
      const taskStatus = pollData?.data?.task_status;

      if (taskStatus === 'success') {
        const result = pollData?.data?.result;
        let scoreInfo: YouCamRawScoreInfo = {};

        // If score_info is returned as a direct JSON object
        if (result?.score_info && typeof result.score_info === 'object') {
          scoreInfo = result.score_info;
        } else if (typeof result?.score_info === 'string' && result.score_info.startsWith('http')) {
          // If score_info is a URL to a json artifact
          try {
            const scoreRes = await fetch(result.score_info);
            if (scoreRes.ok) {
              scoreInfo = await scoreRes.json();
            }
          } catch (e) {
            console.warn('Could not fetch external score_info url:', e);
          }
        }

        return {
          taskId,
          status: 'success',
          scoreInfo,
          outputUrl: result?.output_url,
          rawResponse: pollData,
        };
      } else if (taskStatus === 'error') {
        const errorMsg =
          pollData?.data?.error?.message ||
          pollData?.data?.message ||
          pollData?.message ||
          'YouCam engine encountered an error analyzing the face photo.';
        throw new Error(`YouCam Skin Analysis task failed: ${errorMsg}`);
      }
      // If taskStatus is 'running' or 'pending', loop continues
    }

    throw new Error(
      `YouCam Skin Analysis timed out after ${this.POLLING_TIMEOUT_MS / 1000} seconds. The task may still be processing.`
    );
  }

  /**
   * Fetches available Look VTO templates from YouCam API:
   * GET /s2s/v2.0/task/template/look-vto
   */
  public static async getLookTemplates(): Promise<any[]> {
    const { key } = this.getApiKey();
    if (!key) {
      throw new Error('YOUCAM_API_KEY is not configured on the server.');
    }

    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}/s2s/v2.0/task/template/look-vto`;

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${key}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch YouCam Look templates (HTTP ${res.status}): ${err.slice(0, 200)}`);
    }

    const data = (await res.json()) as any;
    return data?.data?.templates || data?.templates || [];
  }

  /**
   * AI Look Virtual Try-On execution:
   * 1. POST /s2s/v2.0/task/look-vto with src_file_id and template_id
   * 2. Polls GET /s2s/v2.0/task/look-vto/{task_id}
   */
  public static async applyVirtualMakeup(
    imageInput: { fileId?: string; fileBuffer?: Buffer; mimeType?: string; filename?: string; imageUrl?: string },
    templateId: string
  ): Promise<YouCamTryOnOutput> {
    const { key } = this.getApiKey();
    if (!key) {
      throw new Error('YOUCAM_API_KEY is not configured on the server.');
    }

    let fileId = imageInput.fileId;
    if (!fileId && imageInput.fileBuffer && imageInput.mimeType && imageInput.filename) {
      fileId = await this.uploadFile(
        imageInput.fileBuffer,
        imageInput.mimeType,
        imageInput.filename
      );
    }

    if (!fileId && !imageInput.imageUrl) {
      throw new Error('Neither file_id nor image_url was provided for Virtual Try-On.');
    }

    const baseUrl = this.getBaseUrl();
    const taskInitUrl = `${baseUrl}/s2s/v2.0/task/look-vto`;

    const payload: any = {
      template_id: templateId,
    };
    if (fileId) {
      payload.src_file_id = fileId;
    } else {
      payload.src_file_url = imageInput.imageUrl;
    }

    const initRes = await fetch(taskInitUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!initRes.ok) {
      const errText = await initRes.text();
      throw new Error(
        `YouCam Look VTO initiation failed (HTTP ${initRes.status}): ${errText.slice(0, 300)}`
      );
    }

    const initData = (await initRes.json()) as any;
    const taskId = initData?.data?.task_id;
    if (!taskId) {
      throw new Error('YouCam Look VTO API did not return a task_id.');
    }

    // Poll status
    const pollUrl = `${baseUrl}/s2s/v2.0/task/look-vto/${taskId}`;
    const startTime = Date.now();

    while (Date.now() - startTime < this.POLLING_TIMEOUT_MS) {
      await new Promise((resolve) => setTimeout(resolve, this.POLLING_INTERVAL_MS));

      const pollRes = await fetch(pollUrl, {
        headers: {
          'Authorization': `Bearer ${key}`,
        },
      });

      if (!pollRes.ok) {
        const pollErr = await pollRes.text();
        throw new Error(
          `Error polling YouCam Look VTO task ${taskId} (HTTP ${pollRes.status}): ${pollErr.slice(0, 200)}`
        );
      }

      const pollData = (await pollRes.json()) as any;
      const taskStatus = pollData?.data?.task_status;

      if (taskStatus === 'success') {
        const outputUrl =
          pollData?.data?.result?.output_url ||
          pollData?.data?.output_url ||
          pollData?.result?.output_url;

        if (!outputUrl) {
          throw new Error('YouCam VTO succeeded but returned no output_url.');
        }

        return {
          taskId,
          status: 'success',
          outputUrl,
          templateId,
        };
      } else if (taskStatus === 'error') {
        const errorMsg =
          pollData?.data?.error?.message ||
          pollData?.data?.message ||
          'YouCam engine encountered an error rendering the virtual try-on.';
        throw new Error(`YouCam Look VTO task failed: ${errorMsg}`);
      }
    }

    throw new Error(
      `YouCam Look VTO timed out after ${this.POLLING_TIMEOUT_MS / 1000} seconds.`
    );
  }
}
