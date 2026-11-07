import { join } from 'node:path'
import { readFile, writeFile, rm } from 'node:fs/promises'
import url from 'node:url'

const SCHEMA_URL =
  'https://ograf.ebu.io/v1/specification/json-schemas/graphics/schema.json'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

// Turns a built single-file template into an OGraf graphic:
// <name>.ograf.json + graphic.mjs
export async function writeOgraf({ name, templatePath, outPath, appPkg }) {
  const indexPath = join(outPath, 'index.html')
  const html = await readFile(indexPath, 'utf8')
  const runtime = await readFile(join(__dirname, 'ograf-graphic.js'), 'utf8')

  // Escape "</script" so the HTML string can't break out if inlined in a page.
  const htmlString = JSON.stringify(html).replace(/<\/script/gi, '<\\/script')
  await writeFile(
    join(outPath, 'graphic.mjs'),
    runtime.replace(
      'const HTML = __OGRAF_HTML__',
      () => `const HTML = ${htmlString}`,
    ),
    'utf8',
  )

  let manifest = {}
  try {
    manifest = JSON.parse(await readFile(join(templatePath, 'manifest.json')))
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }

  await writeFile(
    join(outPath, `${name}.ograf.json`),
    JSON.stringify(createManifest({ name, manifest, appPkg }), null, 2),
    'utf8',
  )

  await rm(indexPath)
}

function createManifest({ name, manifest, appPkg }) {
  const {
    name: displayName,
    width,
    height,
    schema,
    previewData,
    description,
    author,
    stepCount,
  } = manifest

  const resolution = {}
  if (width) resolution.width = { exact: width }
  if (height) resolution.height = { exact: height }

  return {
    $schema: SCHEMA_URL,
    id: [appPkg.name, name].filter(Boolean).map(slug).join('-'),
    version: appPkg.version,
    name: displayName || name,
    description,
    author: toAuthor(author ?? appPkg.author),
    main: 'graphic.mjs',
    supportsRealTime: true,
    supportsNonRealTime: false,
    stepCount: stepCount ?? 1,
    schema: toJsonSchema(schema, previewData),
    renderRequirements: Object.keys(resolution).length
      ? [{ resolution }]
      : undefined,
  }
}

// Converts our `{ key: { type, label } }` schema to JSON Schema (with GDD types).
// https://superflytv.github.io/GraphicsDataDefinition/
// nxt's OGraf importer passes unknown keys through, so nxt-only keys such as
// `widget`, `placeholder` and `helpText` are kept on the property.
export function toJsonSchema(schema, previewData) {
  if (!schema) {
    return { type: 'object', properties: {} }
  }

  return toObjectSchema(schema, previewData)
}

// JSON Schema lists required fields on the parent, not `required: true` on each field.
function toObjectSchema(fields, previewData) {
  const properties = {}
  const required = []

  for (const [key, field] of Object.entries(fields)) {
    properties[key] = toProperty(key, field, previewData)
    if (field.required === true) {
      required.push(key)
    }
  }

  return required.length
    ? { type: 'object', properties, required }
    : { type: 'object', properties }
}

function toProperty(key, field, previewData) {
  const { type, label, defaultValue, ...rest } = field
  const property = { ...rest, type, title: label ?? rest.title ?? key }

  if (typeof property.required === 'boolean') {
    delete property.required
  }

  if (defaultValue !== undefined) {
    property.default ??= defaultValue
  }

  if (type === 'image') {
    property.type = 'string'
    property.gddType = 'file-path/image-path'
  } else if (type === 'color') {
    property.type = 'string'
    property.gddType = 'color-rrggbb'
    property.pattern = '^#[0-9a-f]{6}$'
  } else if (type === 'integer') {
    // nxt has no integer type and drops the field.
    property.type = 'number'
  } else if (type === 'object') {
    // nxt rejects objects without `properties`.
    Object.assign(property, toObjectSchema(rest.properties ?? {}))
  } else if (type === 'array') {
    property.items = rest.items
      ? toItems(rest.items)
      : inferItems(key, previewData)
  } else if (!JSON_TYPES.includes(type)) {
    property.type = 'string'
  }

  // nxt ignores `multi-line` and uses the `widget` key kept above instead.
  if ((rest.widget?.type ?? rest.widget) === 'textarea') {
    property.gddType = 'multi-line'
  }

  return property
}

function toItems(items) {
  return items.type === 'object'
    ? { ...items, ...toObjectSchema(items.properties ?? {}) }
    : items
}

// OGraf requires a full schema for array items, so infer it from the preview data.
function inferItems(key, previewData = {}) {
  for (const data of Object.values(previewData)) {
    const item = data?.[key]?.[0]
    if (item != null) {
      return inferSchema(item)
    }
  }
  return { type: 'string' }
}

function inferSchema(value) {
  if (Array.isArray(value)) {
    return {
      type: 'array',
      items: value.length ? inferSchema(value[0]) : { type: 'string' },
    }
  }

  if (value && typeof value === 'object') {
    const properties = {}
    for (const [key, val] of Object.entries(value)) {
      properties[key] = inferSchema(val)
    }
    return { type: 'object', properties }
  }

  return { type: JSON_TYPES.includes(typeof value) ? typeof value : 'string' }
}

// The OGraf author only allows name, email and url.
function toAuthor(author) {
  if (typeof author === 'string') {
    // npm shorthand: "Name <email> (url)"
    const [, name, email, url] =
      author.match(/^([^<(]*?)\s*(?:<([^>]*)>)?\s*(?:\(([^)]*)\))?$/) || []
    return name ? { name, email, url } : undefined
  }

  if (author?.name) {
    return { name: author.name, email: author.email, url: author.url }
  }
}

const JSON_TYPES = ['string', 'number', 'integer', 'boolean', 'array', 'object']

const slug = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
