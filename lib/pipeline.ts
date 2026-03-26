import fs from 'fs'
import path from 'path'

// Data lives inside the dashboard itself (dashboard/data/) so the app is
// self-contained and deployable without the pipeline directory.
// The pipeline's result_writer also copies output here via a post-run sync.
const DATA_DIR = path.join(process.cwd(), 'data')
const RUNS_DIR = path.join(DATA_DIR, 'runs')
const FINAL_DIR = path.join(DATA_DIR, 'final')
const STRATEGIES_DIR = path.join(DATA_DIR, 'strategies')

export type RunStatus = 'pending' | 'scraping' | 'enriching' | 'scoring' | 'strategy' | 'processed' | 'competitor' | 'sensitive' | 'done' | 'skipped' | 'error'

export interface DistrictRecord {
  district_name: string
  row_index: number
  website_url: string | null
  status: RunStatus
  output_file: string | null
  skip_reason: string | null
  competitor: string | null
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
  type?: string
  name?: string
  subject_line?: string
  subject_lines?: { A?: string; B?: string; C?: string }
  preview_text?: string
  body: string
  send_day: string | number
  personalization_facts?: string[]
  personalization_elements?: string[]
  cascades_features_mentioned?: string[]
  fact_references?: Record<string, string> | string[]
  cta?: string
  ps_line?: string
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

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

/** Read all run summary JSONs and merge, deduplicating by district_name (latest run wins) */
export function getAllDistricts(): { districts: DistrictRecord[]; lastRun: string | null } {
  if (!fs.existsSync(RUNS_DIR)) return { districts: [], lastRun: null }

  const summaryFiles = fs
    .readdirSync(RUNS_DIR)
    .filter(f => f.endsWith('_summary.json'))
    .sort() // chronological order — last entry wins

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
        // Normalize legacy "done"/"skipped" statuses from old run files
        const status = r.status === 'done' ? 'processed' : r.status === 'skipped' ? 'pending' : r.status
        map.set(r.district_name, { ...r, status: status as RunStatus, slug: slugify(r.district_name) })
      }
    } catch {}
  }

  return { districts: Array.from(map.values()), lastRun }
}

/** Read intel brief markdown for a district */
export function getIntelBrief(slug: string): string | null {
  if (!fs.existsSync(FINAL_DIR)) return null
  const files = fs.readdirSync(FINAL_DIR).filter(f => f.startsWith(slug) && f.endsWith('_intel.md'))
  if (!files.length) return null
  return fs.readFileSync(path.join(FINAL_DIR, files[files.length - 1]), 'utf-8')
}

/** Read strategy JSON for a district */
export function getStrategy(slug: string): Strategy | null {
  const stratPath = path.join(STRATEGIES_DIR, `${slug}.json`)
  if (!fs.existsSync(stratPath)) return null
  try {
    return JSON.parse(fs.readFileSync(stratPath, 'utf-8'))
  } catch {
    return null
  }
}

/** Read SAP markdown table (strategy tab content) */
export function getSAPDoc(slug: string): string | null {
  const sapPath = path.join(STRATEGIES_DIR, `${slug}_sap.md`)
  if (fs.existsSync(sapPath)) return fs.readFileSync(sapPath, 'utf-8')
  // fallback: final/{slug}_strategy.md
  const fallback = path.join(FINAL_DIR, `${slug}_strategy.md`)
  if (fs.existsSync(fallback)) return fs.readFileSync(fallback, 'utf-8')
  return null
}

/** Read full outreach package markdown */
export function getOutreachDoc(slug: string): string | null {
  if (!fs.existsSync(FINAL_DIR)) return null
  const files = fs
    .readdirSync(FINAL_DIR)
    .filter(f => f.startsWith(slug) && f.endsWith('.md') && !f.endsWith('_intel.md'))
    .sort()
  if (!files.length) return null
  return fs.readFileSync(path.join(FINAL_DIR, files[files.length - 1]), 'utf-8')
}

/** Structured contact from contacts JSON */
export interface Contact {
  name: string
  title: string
  email: string
  phone: string
  source_url: string
}

/** Pipeline stage metadata */
export interface StageMeta {
  status: string
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

/** Read structured contacts JSON */
export function getContacts(slug: string): Contact[] {
  const p = path.join(FINAL_DIR, `${slug}_contacts.json`)
  if (!fs.existsSync(p)) return []
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch { return [] }
}

/** Read pipeline run metadata */
export function getRunMeta(slug: string): RunMeta | null {
  const p = path.join(FINAL_DIR, `${slug}_meta.json`)
  if (!fs.existsSync(p)) return null
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch { return null }
}

export function formatRunTimestamp(ts: string | null): string {
  if (!ts) return 'Never'
  // Format: 20260307_031044 → Mar 7, 2026 03:10
  const m = ts.match(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/)
  if (!m) return ts
  const [, y, mo, d, h, min] = m
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[+mo - 1]} ${+d}, ${y} · ${h}:${min}`
}
