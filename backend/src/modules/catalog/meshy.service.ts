import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { createReadStream, existsSync } from 'fs';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';

type MeshyTaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELED';

type JobPhase = 'preview' | 'refine' | 'image';
type JobSource = 'text' | 'image';

export type LocalMeshyJobStatus = 'queued' | 'processing' | 'done' | 'failed';

interface MeshyTask {
  id: string;
  status: MeshyTaskStatus;
  progress?: number;
  model_urls?: { glb?: string };
  thumbnail_url?: string;
  task_error?: { message?: string };
}

interface LocalJob {
  id: string;
  userId: string;
  prompt: string;
  style: string;
  source: JobSource;
  phase: JobPhase;
  previewTaskId: string | null;
  refineTaskId: string | null;
  /** Meshy image / multi-image task id */
  imageTaskId: string | null;
  /** Poll multi-image vs single-image Meshy endpoint */
  imageApi: 'image' | 'multi';
  status: LocalMeshyJobStatus;
  progress: number;
  /** Same-origin API path for Three.js preview */
  previewUrl: string | null;
  thumbnailUrl: string | null;
  localFile: string | null;
  error: string | null;
  createdAt: number;
}

const MESHY_HOST = 'https://api.meshy.ai';
const JOB_TTL_MS = 2 * 60 * 60 * 1000;
const IMAGE_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png']);

/** MERGE Design Studio — style defaults for photo/multi-view texturing */
const STYLE_TEXTURE_PROMPTS: Record<string, string> = {
  Watch:
    'Ultra-premium mechanical wristwatch, hard-surface industrial product design, clean symmetrical watch case, separate polished metal bezel, visibly separate transparent sapphire crystal with realistic thickness, separate dial, separate hour and minute hands, detailed side crown, four clean lugs, clearly visible bracelet-to-case mechanical connections and spring-bar areas, articulated metal bracelet with individually defined links and clasp, separate case back, realistic luxury watch proportions, precise mechanical construction, polished metal PBR surfaces, transparent glass, sharp clean edges, high-detail geometry, clean topology, segmented parts, no floating parts, no fused bracelet links, no melted geometry, no distorted dial, no duplicate parts, no random ornaments, no asymmetry',
  Jewelry:
    'Ultra-premium fine jewelry, hard-surface luxury product, clean symmetrical geometry, sharp controlled edges, separate stones and settings where visible, polished precious metal PBR, realistic reflections, clean topology, no melted surfaces, no floating parts, no random ornaments, accurate proportions',
  'Luxury coin':
    'Ultra-premium commemorative luxury coin, hard-surface mint product, sharp rim and edge, crisp relief engraving, separate rim and face geometry where possible, polished precious metal PBR, clean topology, no melted relief, no distorted symbols, accurate proportions',
  Ring:
    'Ultra-premium luxury ring, hard-surface jewelry product, clean shank and setting, sharp controlled edges, polished precious metal PBR, clean topology, no melted geometry, no floating parts, accurate finger proportions',
  Pendant:
    'Ultra-premium luxury pendant, hard-surface jewelry product, clean bail and body, sharp edges, polished precious metal PBR, clean topology, no melted surfaces, no floating parts, accurate proportions',
  Sculpture:
    'Ultra-premium sculpture object, clean defined surfaces, high-detail geometry, polished or matte luxury materials, clean topology, no melted blobs, no floating parts, accurate proportions',
};

@Injectable()
export class MeshyService {
  private readonly logger = new Logger(MeshyService.name);
  private readonly jobs = new Map<string, LocalJob>();
  private readonly meshyDir =
    process.env.UPLOAD_DIR
      ? join(process.env.UPLOAD_DIR, 'meshy')
      : join(process.cwd(), 'uploads', 'meshy');

  private apiKey() {
    const key = process.env.MESHY_API_KEY?.trim();
    if (!key) {
      throw new ServiceUnavailableException(
        'Meshy AI is not configured. Set MESHY_API_KEY on the server.',
      );
    }
    return key;
  }

  private prune() {
    const now = Date.now();
    for (const [id, job] of this.jobs) {
      if (now - job.createdAt > JOB_TTL_MS) {
        if (job.localFile && existsSync(job.localFile)) {
          void unlink(job.localFile).catch(() => undefined);
        }
        this.jobs.delete(id);
      }
    }
  }

  /** `openapiPath` e.g. `/openapi/v2/text-to-3d` or `/openapi/v1/image-to-3d` */
  private async meshyFetch<T>(openapiPath: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${MESHY_HOST}${openapiPath}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.apiKey()}`,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
    const text = await res.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    if (!res.ok) {
      const msg =
        typeof body === 'object' && body && 'message' in body
          ? String((body as { message: unknown }).message)
          : `Meshy API error (${res.status})`;
      this.logger.warn(`Meshy ${openapiPath} failed: ${msg}`);
      throw new BadRequestException(msg);
    }
    return body as T;
  }

  private buildPrompt(prompt: string, style: string) {
    const base = prompt.trim().slice(0, 480);
    const stylePart = style.trim() ? ` Style: ${style.trim()}.` : '';
    const luxury =
      ' Luxury product, precious metals, ultra high detail, sharp edges, accurate proportions, studio lighting, clean watertight topology, photorealistic materials.';
    return `${base}.${stylePart}${luxury}`.slice(0, 600);
  }

  /** Combine user prompt + style studio standard for Meshy texture_prompt */
  private buildTexturePrompt(style: string, userPrompt = '') {
    const styleKey = style.trim();
    const styleDefault =
      STYLE_TEXTURE_PROMPTS[styleKey] ||
      'Luxury product, precious metals, ultra high detail, photorealistic metal materials, sharp clean edges, clean topology, segmented parts, no melted geometry, no floating parts, no asymmetry';
    const custom = userPrompt.trim();
    const combined = custom
      ? `${custom}. ${styleDefault}`
      : styleDefault;
    return combined.slice(0, 600);
  }

  private fileToDataUri(file: Express.Multer.File) {
    const mime = (file.mimetype || '').toLowerCase();
    if (!IMAGE_MIMES.has(mime)) {
      throw new BadRequestException('Only JPG and PNG images are supported');
    }
    if (!file.buffer?.length) {
      throw new BadRequestException('Image file is required');
    }
    if (file.buffer.length > 10 * 1024 * 1024) {
      throw new BadRequestException('Each image must be 10MB or smaller');
    }
    const normalized = mime === 'image/jpg' ? 'image/jpeg' : mime;
    return `data:${normalized};base64,${file.buffer.toString('base64')}`;
  }

  /** Higher-quality Meshy defaults (more credits / slightly slower). */
  private static readonly HIGH_POLY = 100_000;
  private static readonly TEXTURE_RES = '4k';

  private localPreviewPath(jobId: string) {
    return `/api/catalog/meshy/files/${jobId}`;
  }

  private async persistGlb(job: LocalJob, remoteGlbUrl: string) {
    await mkdir(this.meshyDir, { recursive: true });
    const dest = join(this.meshyDir, `${job.id}.glb`);
    const res = await fetch(remoteGlbUrl);
    if (!res.ok) {
      throw new BadRequestException(
        `Could not download Meshy GLB (${res.status})`,
      );
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 100) {
      throw new BadRequestException('Downloaded Meshy file looks empty');
    }
    await writeFile(dest, buf);
    job.localFile = dest;
    job.previewUrl = this.localPreviewPath(job.id);
    this.logger.log(`Saved Meshy GLB for job ${job.id} (${buf.length} bytes)`);
  }

  async startGenerate(userId: string, prompt: string, style: string) {
    this.prune();
    if (!prompt?.trim()) throw new BadRequestException('Prompt is required');

    const fullPrompt = this.buildPrompt(prompt, style);
    const created = await this.meshyFetch<{ result: string }>(
      '/openapi/v2/text-to-3d',
      {
        method: 'POST',
        body: JSON.stringify({
          mode: 'preview',
          prompt: fullPrompt,
          ai_model: 'latest',
          target_formats: ['glb'],
          should_remesh: true,
          topology: 'triangle',
          target_polycount: MeshyService.HIGH_POLY,
        }),
      },
    );

    const job: LocalJob = {
      id: randomUUID(),
      userId,
      prompt: prompt.trim(),
      style: style.trim(),
      source: 'text',
      phase: 'preview',
      previewTaskId: created.result,
      refineTaskId: null,
      imageTaskId: null,
      imageApi: 'image',
      status: 'processing',
      progress: 5,
      previewUrl: null,
      thumbnailUrl: null,
      localFile: null,
      error: null,
      createdAt: Date.now(),
    };
    this.jobs.set(job.id, job);
    return this.publicJob(job);
  }

  /**
   * Photo / multi-view → 3D (1–4 images).
   * Uses Meshy Multi-Image to 3D for better side/back geometry on watches, jewelry, etc.
   */
  async startGenerateFromImages(
    userId: string,
    files: Express.Multer.File[],
    style = '',
    prompt = '',
  ) {
    this.prune();
    const list = (files ?? []).filter((f) => f?.buffer?.length);
    if (!list.length) {
      throw new BadRequestException('At least one JPG or PNG photo is required');
    }
    if (list.length > 4) {
      throw new BadRequestException('Maximum 4 reference photos (front / back / left / right)');
    }

    const imageUrls = list.map((f) => this.fileToDataUri(f));
    const texturePrompt = this.buildTexturePrompt(style, prompt);

    const created = await this.meshyFetch<{ result: string }>(
      '/openapi/v1/multi-image-to-3d',
      {
        method: 'POST',
        body: JSON.stringify({
          image_urls: imageUrls,
          ai_model: 'latest',
          enable_pbr: true,
          should_remesh: true,
          should_texture: true,
          texture_resolution: MeshyService.TEXTURE_RES,
          target_formats: ['glb'],
          target_polycount: MeshyService.HIGH_POLY,
          texture_prompt: texturePrompt,
        }),
      },
    );

    const job: LocalJob = {
      id: randomUUID(),
      userId,
      prompt: prompt.trim() || `[multi-image-to-3d ×${list.length}]`,
      style: style.trim(),
      source: 'image',
      phase: 'image',
      previewTaskId: null,
      refineTaskId: null,
      imageTaskId: created.result,
      imageApi: 'multi',
      status: 'processing',
      progress: 5,
      previewUrl: null,
      thumbnailUrl: null,
      localFile: null,
      error: null,
      createdAt: Date.now(),
    };
    this.jobs.set(job.id, job);
    return this.publicJob(job);
  }

  /** @deprecated use startGenerateFromImages — kept for older clients sending a single file */
  async startGenerateFromImage(
    userId: string,
    file: Express.Multer.File,
    style = '',
    prompt = '',
  ) {
    return this.startGenerateFromImages(userId, file ? [file] : [], style, prompt);
  }

  async getJob(userId: string, jobId: string) {
    this.prune();
    const job = this.jobs.get(jobId);
    if (!job || job.userId !== userId) {
      throw new NotFoundException('Meshy job not found');
    }
    if (job.status === 'done' || job.status === 'failed') {
      return this.publicJob(job);
    }

    try {
      if (job.phase === 'image' && job.imageTaskId) {
        await this.syncImage(job);
      } else if (job.phase === 'preview' && job.previewTaskId) {
        await this.syncPreview(job);
      } else if (job.phase === 'refine' && job.refineTaskId) {
        await this.syncRefine(job);
      }
    } catch (err) {
      job.status = 'failed';
      job.error =
        err instanceof Error ? err.message : 'Meshy generation failed';
    }

    this.jobs.set(job.id, job);
    return this.publicJob(job);
  }

  /** Resolve a finished Meshy GLB on disk for attaching to a catalog item. */
  resolveOwnedGlbPath(userId: string, jobId: string) {
    const id = jobId.replace(/\.glb$/i, '').trim();
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      throw new BadRequestException('Invalid Meshy job id');
    }
    const job = this.jobs.get(id);
    if (job && job.userId !== userId) {
      throw new NotFoundException('Meshy job not found');
    }
    const filePath = job?.localFile ?? join(this.meshyDir, `${id}.glb`);
    if (!existsSync(filePath)) {
      throw new NotFoundException(
        'Meshy model file not found. Generate again, then add the item.',
      );
    }
    return filePath;
  }

  /** Stream a stored GLB for in-app preview (UUID filename is unguessable). */
  getStoredFile(jobIdOrName: string) {
    const id = jobIdOrName.replace(/\.glb$/i, '');
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      throw new NotFoundException('Model not found');
    }
    const job = this.jobs.get(id);
    const filePath = job?.localFile ?? join(this.meshyDir, `${id}.glb`);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Model file not found');
    }
    return {
      filePath,
      mimeType: 'model/gltf-binary',
      filename: `merge-stars-meshy-${id.slice(0, 8)}.glb`,
      stream: createReadStream(filePath),
    };
  }

  private async syncImage(job: LocalJob) {
    const path =
      job.imageApi === 'multi'
        ? `/openapi/v1/multi-image-to-3d/${job.imageTaskId}`
        : `/openapi/v1/image-to-3d/${job.imageTaskId}`;
    const task = await this.meshyFetch<MeshyTask>(path);
    const p = typeof task.progress === 'number' ? task.progress : 0;
    job.progress = Math.max(5, Math.min(99, Math.round(5 + p * 0.94)));

    if (task.status === 'FAILED' || task.status === 'CANCELED') {
      job.status = 'failed';
      job.error =
        task.task_error?.message ||
        (job.imageApi === 'multi'
          ? 'Multi-view image-to-3D generation failed'
          : 'Image-to-3D generation failed');
      return;
    }
    if (task.status !== 'SUCCEEDED') {
      job.status = 'processing';
      return;
    }

    const glb = task.model_urls?.glb;
    if (!glb) {
      job.status = 'failed';
      job.error = 'Meshy returned no GLB model URL';
      return;
    }
    await this.finishWithRemoteGlb(job, glb, task.thumbnail_url ?? undefined);
  }

  private async syncPreview(job: LocalJob) {
    const task = await this.meshyFetch<MeshyTask>(
      `/openapi/v2/text-to-3d/${job.previewTaskId}`,
    );
    const p = typeof task.progress === 'number' ? task.progress : 0;
    job.progress = Math.max(5, Math.min(55, Math.round(5 + p * 0.5)));

    if (task.status === 'FAILED' || task.status === 'CANCELED') {
      job.status = 'failed';
      job.error = task.task_error?.message || 'Preview generation failed';
      return;
    }
    if (task.status !== 'SUCCEEDED') {
      job.status = 'processing';
      return;
    }

    const refined = await this.meshyFetch<{ result: string }>(
      '/openapi/v2/text-to-3d',
      {
        method: 'POST',
        body: JSON.stringify({
          mode: 'refine',
          preview_task_id: job.previewTaskId,
          ai_model: 'latest',
          enable_pbr: true,
          texture_resolution: MeshyService.TEXTURE_RES,
          target_formats: ['glb'],
          texture_prompt: job.style
            ? `${job.style}, luxury precious metal, photorealistic PBR, ultra sharp surface detail`
            : 'Luxury precious metal, photorealistic PBR, ultra sharp surface detail',
        }),
      },
    );
    job.phase = 'refine';
    job.refineTaskId = refined.result;
    job.progress = 58;
    job.thumbnailUrl = task.thumbnail_url ?? job.thumbnailUrl;
    job.status = 'processing';
  }

  private async finishWithRemoteGlb(
    job: LocalJob,
    remoteUrl: string,
    thumb?: string,
  ) {
    await this.persistGlb(job, remoteUrl);
    job.status = 'done';
    job.progress = 100;
    job.thumbnailUrl = thumb ?? job.thumbnailUrl;
    job.error = null;
  }

  private async syncRefine(job: LocalJob) {
    const task = await this.meshyFetch<MeshyTask>(
      `/openapi/v2/text-to-3d/${job.refineTaskId}`,
    );
    const p = typeof task.progress === 'number' ? task.progress : 0;
    job.progress = Math.max(58, Math.min(99, Math.round(58 + p * 0.42)));

    if (task.status === 'FAILED' || task.status === 'CANCELED') {
      if (job.previewTaskId) {
        const preview = await this.meshyFetch<MeshyTask>(
          `/openapi/v2/text-to-3d/${job.previewTaskId}`,
        );
        const glb = preview.model_urls?.glb;
        if (glb) {
          await this.finishWithRemoteGlb(
            job,
            glb,
            preview.thumbnail_url ?? undefined,
          );
          return;
        }
      }
      job.status = 'failed';
      job.error = task.task_error?.message || 'Refine generation failed';
      return;
    }
    if (task.status !== 'SUCCEEDED') {
      job.status = 'processing';
      return;
    }

    const glb = task.model_urls?.glb;
    if (!glb) {
      job.status = 'failed';
      job.error = 'Meshy returned no GLB model URL';
      return;
    }
    await this.finishWithRemoteGlb(job, glb, task.thumbnail_url ?? undefined);
  }

  private publicJob(job: LocalJob) {
    return {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      previewUrl: job.previewUrl,
      downloadUrl: job.previewUrl,
      thumbnailUrl: job.thumbnailUrl,
      phase: job.phase,
      source: job.source,
      error: job.error,
    };
  }
}
