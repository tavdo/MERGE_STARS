/**
 * Generate Meshy 3D (preview + refine) for Master Catalog items missing a GLB.
 * Run on VPS: node scripts/generate-master-meshy.js
 */
const { Client } = require('pg')
const fs = require('fs')
const fsp = require('fs/promises')
const path = require('path')
const crypto = require('crypto')

const MESHY = 'https://api.meshy.ai'
const POLL_MS = 8000
const PREVIEW_TIMEOUT_MS = 12 * 60 * 1000
const REFINE_TIMEOUT_MS = 18 * 60 * 1000

const HOUSE_STYLE = {
  jewelry: 'Jewelry',
  watch: 'Watch',
  perfume: 'Luxury perfume bottle',
  luxury: 'Luxury coin',
  football: 'Sports medal',
  gifts: 'Luxury coin',
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function promptFor(row) {
  const style = HOUSE_STYLE[row.house] || 'Luxury product'
  return {
    prompt: `MERGE STARS ${row.title}, ${row.house} house, standalone luxury collectible object, centered product, no person, no environment`,
    style,
  }
}

async function meshy(apiKey, openPath, init) {
  const res = await fetch(`${MESHY}${openPath}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  const text = await res.text()
  let body = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }
  if (!res.ok) {
    const msg =
      body && typeof body === 'object' && body.message
        ? body.message
        : `Meshy ${res.status}`
    throw new Error(msg)
  }
  return body
}

async function pollTask(apiKey, taskId, timeoutMs) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const task = await meshy(apiKey, `/openapi/v2/text-to-3d/${taskId}`)
    process.stdout.write(
      `  ${task.status} ${task.progress ?? 0}%\n`,
    )
    if (task.status === 'SUCCEEDED') return task
    if (task.status === 'FAILED' || task.status === 'CANCELED') {
      throw new Error(task.task_error?.message || task.status)
    }
    await sleep(POLL_MS)
  }
  throw new Error('Meshy poll timeout')
}

async function download(url, dest) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`download ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 100) throw new Error('empty download')
  await fsp.mkdir(path.dirname(dest), { recursive: true })
  await fsp.writeFile(dest, buf)
  return buf.length
}

async function main() {
  const apiKey = process.env.MESHY_API_KEY?.trim()
  if (!apiKey) throw new Error('MESHY_API_KEY missing')
  const uploadRoot = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  const { rows } = await client.query(
    `select id, title, house, model3d_url, image_url
     from catalog_items
     where ownership = 'MASTER_CATALOG'
     order by created_at asc`,
  )

  const todo = rows.filter((r) => !r.model3d_url)
  console.log(`Master items: ${rows.length}, need 3D: ${todo.length}`)

  let ok = 0
  let fail = 0
  for (const row of todo) {
    const { prompt, style } = promptFor(row)
    console.log(`\n=== ${row.house} / ${row.title} (${row.id})`)
    try {
      const created = await meshy(apiKey, '/openapi/v2/text-to-3d', {
        method: 'POST',
        body: JSON.stringify({
          mode: 'preview',
          prompt: `${prompt}. Style: ${style}. Luxury product, precious metals, ultra high detail, sharp edges, clean watertight topology.`,
          ai_model: 'latest',
          target_formats: ['glb'],
          should_remesh: true,
          topology: 'triangle',
          target_polycount: 50000,
        }),
      })
      const previewId = created.result
      const preview = await pollTask(apiKey, previewId, PREVIEW_TIMEOUT_MS)
      let glbUrl = preview.model_urls?.glb
      let thumb = preview.thumbnail_url

      try {
        const refined = await meshy(apiKey, '/openapi/v2/text-to-3d', {
          method: 'POST',
          body: JSON.stringify({
            mode: 'refine',
            preview_task_id: previewId,
            ai_model: 'latest',
            enable_pbr: true,
            texture_resolution: '2k',
            target_formats: ['glb'],
            texture_prompt: `${style}, luxury precious metal, photorealistic PBR, ultra sharp surface detail`,
          }),
        })
        const refinedTask = await pollTask(apiKey, refined.result, REFINE_TIMEOUT_MS)
        if (refinedTask.model_urls?.glb) {
          glbUrl = refinedTask.model_urls.glb
          thumb = refinedTask.thumbnail_url || thumb
        }
      } catch (err) {
        console.log(`  refine skipped: ${err.message}`)
      }

      if (!glbUrl) throw new Error('no GLB url')

      const dir = path.join(uploadRoot, 'catalog', row.id)
      const glbName = `model-${crypto.randomUUID()}.glb`
      const glbBytes = await download(glbUrl, path.join(dir, glbName))
      let imageName = row.image_url
      if (thumb && !row.image_url) {
        imageName = `img-${crypto.randomUUID()}.png`
        await download(thumb, path.join(dir, imageName))
      }
      await client.query(
        `update catalog_items
         set model3d_url = $1, model3d_format = 'glb',
             image_url = coalesce(image_url, $2),
             updated_at = now()
         where id = $3`,
        [glbName, imageName, row.id],
      )
      ok += 1
      console.log(`  saved ${glbName} (${glbBytes} bytes)`)
    } catch (err) {
      fail += 1
      console.error(`  FAILED: ${err.message}`)
    }
    await sleep(2000)
  }

  console.log(`\nDone. ok=${ok} fail=${fail}`)
  await client.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
