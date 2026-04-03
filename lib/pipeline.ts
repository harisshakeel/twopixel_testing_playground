import fs from 'fs'
import path from 'path'

// Data lives inside the dashboard itself (dashboard/data/) so the app is
// self-contained and deployable without the pipeline directory.
const DATA_DIR = path.join(process.cwd(), 'data')
const RUNS_DIR = path.join(DATA_DIR, 'runs')
const FINAL_DIR = path.join(DATA_DIR, 'final')
const STRATEGIES_DIR = path.join(DATA_DIR, 'strategies')
const DISTRICTS_DIR = path.join(DATA_DIR, 'districts')

export type RunStatus = 'pending' | 'scraping' | 'enriching' | 'scoring' | 'strategy' | 'processed' | 'competitor' | 'sensitive' | 'done' | 'skipped' | 'error'

export interface CompetitorAnalysis {
  name: string
  status: string
  evidence: string
  used_for: string
}

export interface DistrictRecord {
  district_name: string
  row_index: number
  website_url: string | null
  status: RunStatus
  tier: string | null
  normalized_score: number
  output_file: string | null
  skip_reason: string | null
  competitor: string | null
  competitor_analysis: CompetitorAnalysis[]
  crisis: string | null
  started_at: string | null
  completed_at: string | null
  slug: string
}

export interface RunSummary {
  run_id: string
  timestamp: string
  districts: DistrictRecord[]
}

export interface StrategyEmail {
  email_number?: number
  number?: number
  subject_line?: string
  subject_lines?: { A?: string; B?: string; C?: string }
  body: string
  send_day: string | number
}

export interface Strategy {
  district_name: string
  tier: string
  score?: number
  primary_contact?: { name?: string; title?: string; email?: string; rationale?: string }
  secondary_contact?: { name?: string; title?: string; email?: string } | null
  opening_angle?: string
  emails: StrategyEmail[]
  email_4_if_applicable?: StrategyEmail & { applicable?: boolean | string; timing_signal_used?: string }
  email_5_if_applicable?: StrategyEmail & { applicable?: boolean | string }
  linkedin_touch?: { connection_request?: string; follow_up_comment?: string } | string
  call_script_notes?: {
    opening_reference?: string
    discovery_questions?: string[]
    objection_handlers?: Record<string, string>
  } | string
  strategy_notes?: string
}

/** Structured contact from contacts JSON */
export interface Contact {
  name: string
  title: string
  email: string
  phone: string
  source_url: string
}

/** Pipeline stage metadata (with optional timing) */
export interface StageMeta {
  status: string
  started_at?: string
  ended_at?: string
  duration_s?: number
  [key: string]: unknown
}

/** Full run metadata for a district */
export interface RunMeta {
  district_name: string
  nces: {
    nces_id: string
    enrollment: number
    num_schools: number
    state: string
    district_type: string
    locale: string
    data_year: string
  } | null
  stages: Record<string, StageMeta>
}

/** Per-district manifest (new structure) */
export interface Manifest {
  district_name: string
  slug: string
  website_url: string | null
  row_index: number
  status: RunStatus
  tier: string | null
  normalized_score: number
  competitor_detected: string | null
  crisis_detected: string | null
  skip_reason: string | null
  last_run_ts: string
  last_completed_stage: number
  stages: Record<string, StageMeta>
}

/** URL discovered in Stage 3 */
export interface UrlDiscovered {
  url: string
  title?: string
  description?: string
}

/** Filtered URL from Stage 4 */
export interface UrlFiltered {
  url: string
  category: string
  reason?: string
  is_pdf?: boolean
}

/** Scraping stats from Stage 5 */
export interface ScrapingStats {
  contact_pages: number
  signal_pages: number
  total_chars: number
  pages?: Array<{ url: string; chars: number; source: string }>
}

/** Strategy result from Stage 7 (SAP + scoring) */
export interface StrategyResult {
  district_name: string
  raw_score: number
  normalized_score: number
  tier: string
  matched_signals: Array<{
    signal_index: number
    category: string
    relevance_score: number
    internal_indication: string
    capability_alignment: string
  }>
  sap_markdown: string
  num_emails: number
  interval_days: number
  model_used?: string
}

// ── Helpers ────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

function readJSON<T>(filepath: string): T | null {
  if (!fs.existsSync(filepath)) return null
  try { return JSON.parse(fs.readFileSync(filepath, 'utf-8')) } catch { return null }
}

function readText(filepath: string): string | null {
  if (!fs.existsSync(filepath)) return null
  try { return fs.readFileSync(filepath, 'utf-8') } catch { return null }
}

/** Try new districts/{slug}/{file} path first, fall back to legacy path */
function districtFile(slug: string, filename: string): string {
  return path.join(DISTRICTS_DIR, slug, filename)
}

// ── Core data accessors ───────────────────────────────────────────────

/** Read all run summary JSONs and merge, deduplicating by district_name (latest run wins) */
export function getAllDistricts(): { districts: DistrictRecord[]; lastRun: string | null } {
  if (!fs.existsSync(RUNS_DIR)) return { districts: [], lastRun: null }

  const summaryFiles = fs
    .readdirSync(RUNS_DIR)
    .filter(f => f.endsWith('_summary.json'))
    .sort()

  if (!summaryFiles.length) return { districts: [], lastRun: null }

  const map = new Map<string, DistrictRecord>()
  let lastRun: string | null = null

  for (const file of summaryFiles) {
    try {
      const raw = fs.readFileSync(path.join(RUNS_DIR, file), 'utf-8')
      const records: DistrictRecord[] = JSON.parse(raw)
      const ts = file.replace('run_', '').replace('_summary.json', '')
      lastRun = ts
      for (const r of records) {
        const status = r.status === 'done' ? 'processed' : r.status === 'skipped' ? 'pending' : r.status
        map.set(r.district_name, {
          ...r,
          status: status as RunStatus,
          tier: r.tier ?? null,
          normalized_score: r.normalized_score ?? 0,
          competitor_analysis: r.competitor_analysis ?? [],
          slug: slugify(r.district_name),
        })
      }
    } catch {}
  }

  return { districts: Array.from(map.values()), lastRun }
}

/** Read manifest for a district (new structure) */
export function getManifest(slug: string): Manifest | null {
  return readJSON<Manifest>(districtFile(slug, 'manifest.json'))
}

/** Read intel brief markdown — new path first, then legacy */
export function getIntelBrief(slug: string): string | null {
  return readText(districtFile(slug, '06_intel.md'))
    ?? readText(path.join(FINAL_DIR, `${slug}_intel.md`))
}

/** Read SAP markdown — Stage 7 output */
export function getSAPDoc(slug: string): string | null {
  // New path: 07_sap.md (Stage 7)
  return readText(districtFile(slug, '07_sap.md'))
    // Legacy fallbacks
    ?? readText(districtFile(slug, '08_sap.md'))
    ?? readText(path.join(STRATEGIES_DIR, `${slug}_sap.md`))
    ?? readText(path.join(FINAL_DIR, `${slug}_strategy.md`))
}

/** Read structured contacts — new path first, then legacy */
export function getContacts(slug: string): Contact[] {
  return readJSON<Contact[]>(districtFile(slug, '06_contacts.json'))
    ?? readJSON<Contact[]>(path.join(FINAL_DIR, `${slug}_contacts.json`))
    ?? []
}

/** Read pipeline run metadata — manifest stages first, then legacy meta */
export function getRunMeta(slug: string): RunMeta | null {
  const manifest = getManifest(slug)
  if (manifest) {
    // Build NCES from 02_nces.json
    const nces = readJSON<RunMeta['nces']>(districtFile(slug, '02_nces.json'))
    return {
      district_name: manifest.district_name,
      nces: nces,
      stages: manifest.stages,
    }
  }
  // Legacy fallback
  return readJSON<RunMeta>(path.join(FINAL_DIR, `${slug}_meta.json`))
}

// ── New per-stage accessors ───────────────────────────────────────────

/** Read discovered URLs (Stage 3) */
export function getUrlsDiscovered(slug: string): UrlDiscovered[] {
  return readJSON<UrlDiscovered[]>(districtFile(slug, '03_urls_discovered.json')) ?? []
}

/** Read filtered URLs (Stage 4) */
export function getUrlsFiltered(slug: string): UrlFiltered[] {
  return readJSON<UrlFiltered[]>(districtFile(slug, '04_urls_filtered.json')) ?? []
}

/** Read scraping stats (Stage 5) */
export function getScrapingStats(slug: string): ScrapingStats | null {
  return readJSON<ScrapingStats>(districtFile(slug, '05_scraping.json'))
}

/** Read strategy result (Stage 7) */
export function getStrategyResult(slug: string): StrategyResult | null {
  return readJSON<StrategyResult>(districtFile(slug, '07_strategy.json'))
}

/** Read emails — Stage 8 (was 9), then legacy */
export function getEmails(slug: string): StrategyEmail[] {
  // New path: 08_emails.json (Stage 8 after renumbering)
  const cadence = readJSON<{ emails?: StrategyEmail[] }>(districtFile(slug, '08_emails.json'))
  if (cadence?.emails?.length) return cadence.emails

  // Legacy fallback: emails bundled in strategy JSON
  const strat = readJSON<Strategy>(path.join(STRATEGIES_DIR, `${slug}.json`))
  if (!strat) return []

  const emails = [
    ...(strat.emails ?? []),
    ...(strat.email_4_if_applicable?.applicable !== false && strat.email_4_if_applicable
      ? [strat.email_4_if_applicable] : []),
    ...(strat.email_5_if_applicable?.applicable !== false && strat.email_5_if_applicable
      ? [strat.email_5_if_applicable] : []),
  ]
  return emails
}

// ── Formatting ────────────────────────────────────────────────────────

export function formatRunTimestamp(ts: string | null): string {
  if (!ts) return 'Never'
  const m = ts.match(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/)
  if (!m) return ts
  const [, y, mo, d, h, min] = m
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[+mo - 1]} ${+d}, ${y} · ${h}:${min}`
}
