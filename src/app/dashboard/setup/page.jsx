'use client'

import { useState, useRef } from 'react'
import { useRequireUser } from '@/hooks/use-user'
import { useStock } from '@/hooks/useStock'
import { useToast } from '@/components/Toast'
import { Upload, Plus, AlertCircle, CheckCircle2, Table, LayoutGrid, HelpCircle } from 'lucide-react'

// Custom robust client-side CSV parser
function parseCSV(text) {
  const lines = text.split(/\r?\n/)
  if (lines.length === 0) return []

  // Extract headers
  const headers = lines[0]
    .split(',')
    .map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''))

  const result = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const fields = []
    let current = ''
    let inQuotes = false

    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex]
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim().replace(/^["']|["']$/g, ''))
        current = ''
      } else {
        current += char
      }
    }
    fields.push(current.trim().replace(/^["']|["']$/g, ''))

    const row = {}
    headers.forEach((header, index) => {
      // Standardize headers
      let key = header
      if (header.includes('sku')) key = 'sku'
      else if (header.includes('name') || header.includes('title')) key = 'name'
      else if (header.includes('qty') || header.includes('quantity') || header.includes('stock')) key = 'qty'
      else if (header.includes('reorder') || header.includes('threshold') || header.includes('level')) key = 'reorder'

      row[key] = fields[index] || ''
    })

    result.push(row)
  }
  return result
}

export default function SetupPage() {
  const { session } = useRequireUser()
  const { locations, items, loading, error, orgId, addLocation } = useStock()
  const toast = useToast()

  // Location Form State
  const [newLocName, setNewLocName] = useState('')
  const [newLocCode, setNewLocCode] = useState('')
  const [locFormLoading, setLocFormLoading] = useState(false)

  // CSV Import State
  const [targetLocId, setTargetLocId] = useState('')
  const [parsedRows, setParsedRows] = useState([])
  const [importLoading, setImportLoading] = useState(false)
  const [importStatus, setImportStatus] = useState(null) // { type: 'success'|'error', msg: '' }
  const fileInputRef = useRef(null)

  // Handle Location Creation
  const handleCreateLocation = async (e) => {
    e.preventDefault()
    if (!newLocName || !newLocCode) return

    setLocFormLoading(true)

    try {
      await addLocation(newLocName, newLocCode.toUpperCase())
      toast.success('Location added', `"${newLocName}" is now active.`)
      setNewLocName('')
      setNewLocCode('')
    } catch (err) {
      console.error(err)
      toast.error('Failed to add location', err.message)
    } finally {
      setLocFormLoading(false)
    }
  }

  // Handle CSV Upload & Parse
  const handleCSVUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Belt-and-braces size check. The `max` attribute on <input> is
    // a hint, not a guarantee — older browsers and drag-and-drop
    // bypass it. 5MB matches the limit in the file picker.
    const MAX_BYTES = 5 * 1024 * 1024
    if (file.size > MAX_BYTES) {
      setImportStatus({
        type: 'error',
        msg: `File is ${(file.size / 1024 / 1024).toFixed(1)}MB. Max is 5MB.`,
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      const parsed = parseCSV(text)
      setParsedRows(parsed)
      setImportStatus(null)

      if (locations.length > 0 && !targetLocId) {
        setTargetLocId(locations[0].id)
      }
    }
    reader.readAsText(file)
  }

  // Commit Import to database
  const handleCommitImport = async () => {
    if (!orgId || !targetLocId || parsedRows.length === 0) return

    setImportLoading(true)
    setImportStatus(null)

    let successCount = 0
    let failureCount = 0

    try {
      for (const row of parsedRows) {
        const sku = (row.sku || '').trim()
        const name = (row.name || '').trim()
        const qty = parseInt(row.qty || '0', 10) || 0
        const reorder = parseInt(row.reorder || '0', 10) || 0

        if (!sku || !name) {
          failureCount++
          continue
        }

        // 1. Get or Create Item
        let itemId = null

        // Find existing item locally first
        const existing = items.find((i) => i.sku.toLowerCase() === sku.toLowerCase())
        if (existing) {
          itemId = existing.id
        } else {
          // POST /api/stock with kind:'item' inserts the row. The
          // (orgId, sku) unique index means a duplicate insert 409s;
          // we then refetch by sku to recover the existing item's id.
          try {
            const newItem = await fetch('/api/stock', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ kind: 'item', name, sku }),
            }).then((r) => {
              if (!r.ok) throw new Error(`HTTP ${r.status}`)
              return r.json()
            })
            itemId = newItem.id
          } catch (insertErr) {
            // 409 → unique conflict on (org_id, sku). Refetch via
            // the items list and reuse the existing row's id.
            try {
              const res = await fetch('/api/stock?kind=items', {
                credentials: 'include',
              })
              const all = (await res.json()) ?? []
              const match = all.find(
                (i) => i.sku && i.sku.toLowerCase() === sku.toLowerCase()
              )
              if (match) itemId = match.id
            } catch {
              // fall through, itemId stays null → row is skipped
            }
            if (!itemId) {
              failureCount++
              continue
            }
          }
        }

        if (!itemId) {
          failureCount++
          continue
        }

        // 2. Upsert stock level via PATCH /api/stock (which is
        // already an onConflictDoUpdate keyed on (locationId, itemId)).
        try {
          await fetch('/api/stock', {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              kind: 'level',
              locationId: targetLocId,
              itemId,
              qty,
              reorderLevel: reorder,
            }),
          }).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`)
          })
          successCount++
        } catch (stockErr) {
          console.error('Stock levels insert failed:', stockErr)
          failureCount++
        }
      }

      setImportStatus({
        type: 'success',
        msg: `Successfully imported ${successCount} items. ${failureCount > 0 ? `Failed on ${failureCount} rows.` : ''}`,
      })
      setParsedRows([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      console.error(err)
      setImportStatus({
        type: 'error',
        msg: `Import failed: ${err.message}`,
      })
    } finally {
      setImportLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-border border-t-brand animate-spin" />
          <span className="text-sm text-ink-3">Loading setup panel…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* The OrgMissingDialog is mounted by the dashboard layout
          (see M-4 in the security audit) so it's not duplicated here. */}

      {/* Database load error banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl">
          <p className="text-sm font-semibold">Database error</p>
          <p className="text-xs mt-0.5">{error}</p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight">
          Setup &amp; Import
        </h1>
        <p className="text-sm text-ink-2 mt-1">
          Initialize your storefront layouts, register branch codes, and import inventory.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Location Management */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Active Locations List */}
          <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wider mb-4 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-brand" />
              Locations ({locations.length})
            </h2>

            {locations.length === 0 ? (
              <p className="text-xs text-ink-3">No locations registered yet.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                {locations.map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate bg-slate/20">
                    <span className="text-xs font-semibold text-ink">{l.name}</span>
                    <span className="text-[10px] font-mono bg-slate text-ink-3 px-2 py-0.5 rounded font-bold">
                      {l.code}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Location Form */}
          <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-4.5 h-4.5 text-brand" />
              Add Location
            </h2>

            <form onSubmit={handleCreateLocation} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="locName" className="text-xs font-medium text-ink-2">Name</label>
                <input
                  id="locName"
                  type="text"
                  placeholder="e.g. Downtown"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="locCode" className="text-xs font-medium text-ink-2">Code</label>
                <input
                  id="locCode"
                  type="text"
                  placeholder="e.g. DT-01"
                  value={newLocCode}
                  onChange={(e) => setNewLocCode(e.target.value)}
                  className="px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={locFormLoading}
                className="w-full bg-brand hover:bg-brand-dark text-white text-xs font-semibold py-2 px-3 rounded-xl transition-colors shadow-sm disabled:opacity-50 mt-1"
              >
                {locFormLoading ? 'Adding...' : 'Create Location'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: CSV Uploader & Spreadsheet Preview */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-card flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-ink uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-brand" />
              CSV Inventory Import
            </h2>

            {/* Selector & Drag Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="importLoc" className="text-xs font-semibold text-ink-3 uppercase tracking-wider">
                  Target Location
                </label>
                <select
                  id="importLoc"
                  value={targetLocId}
                  onChange={(e) => setTargetLocId(e.target.value)}
                  className="bg-white border border-border rounded-xl text-xs px-3 py-2.5 text-ink font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
                  disabled={locations.length === 0}
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.code})
                    </option>
                  ))}
                  {locations.length === 0 && (
                    <option value="">No locations available</option>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="csvFile" className="text-xs font-semibold text-ink-3 uppercase tracking-wider">
                  Select CSV File
                </label>
                <input
                  id="csvFile"
                  type="file"
                  accept=".csv,text/csv"
                  // 5MB cap. Larger CSVs are almost always user error
                  // (or an attack trying to OOM the browser via the
                  // FileReader.readAsText path). Server-side rate
                  // limiting on the import endpoint would be the next
                  // layer; right now we cap at the browser.
                  // (5 * 1024 * 1024 = 5242880)
                  max="5242880"
                  onChange={handleCSVUpload}
                  ref={fileInputRef}
                  disabled={locations.length === 0}
                  className="text-xs border border-border rounded-xl bg-slate/10 px-3 py-2 focus:outline-none cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-brand-light file:text-brand hover:file:bg-brand-mid"
                />
                <p className="text-[10px] text-ink-3">
                  CSV only, max 5MB. Headers on the first line.
                </p>
              </div>
            </div>

            {/* CSV Guideline Box */}
            <div className="p-3 bg-slate rounded-xl border border-border/80 text-[11px] text-ink-2">
              <p className="font-semibold text-ink flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-brand" />
                CSV Format Instructions
              </p>
              <p className="mt-1">
                Your CSV file must include headers on the first line. The columns can be in any order but should map to the following names:
              </p>
              <ul className="list-disc list-inside mt-1 font-mono text-[10px] text-brand-dark flex flex-wrap gap-x-4 gap-y-1">
                <li>sku (e.g. "BEER-01")</li>
                <li>name (e.g. "Draft IPA")</li>
                <li>qty (e.g. "24")</li>
                <li>reorder (e.g. "6")</li>
              </ul>
            </div>

            {/* Status alerts */}
            {importStatus && (
              <div className={`p-3.5 rounded-xl border flex items-start gap-2 text-xs ${
                importStatus.type === 'success' 
                  ? 'bg-green-bg border-green-100 text-green' 
                  : 'bg-red-50 border-red-100 text-red-600'
              }`}>
                {importStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span className="font-medium text-ink">{importStatus.msg}</span>
              </div>
            )}

            {/* Preview Section */}
            {parsedRows.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <Table className="w-4 h-4 text-brand" />
                    Preview Rows ({parsedRows.length})
                  </h3>
                  <button
                    onClick={handleCommitImport}
                    disabled={importLoading}
                    className="inline-flex items-center bg-brand hover:bg-brand-dark text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                  >
                    {importLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                    ) : null}
                    Commit Import
                  </button>
                </div>

                <div className="border border-border rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-border bg-slate/40 font-semibold text-ink-3 uppercase tracking-wider">
                        <th className="px-4 py-2.5">SKU</th>
                        <th className="px-4 py-2.5">Name</th>
                        <th className="px-4 py-2.5 text-center">Qty</th>
                        <th className="px-4 py-2.5 text-center">Reorder</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parsedRows.map((row, i) => {
                        const hasErr = !row.sku || !row.name
                        return (
                          <tr key={i} className={`hover:bg-slate/5 ${hasErr ? 'bg-red-50/20' : ''}`}>
                            <td className="px-4 py-2 font-mono font-semibold text-ink-2">
                              {row.sku || <span className="text-red-500 italic">Missing</span>}
                            </td>
                            <td className="px-4 py-2 text-ink font-medium">
                              {row.name || <span className="text-red-500 italic">Missing</span>}
                            </td>
                            <td className="px-4 py-2 text-center text-ink-2 font-mono">
                              {row.qty || '0'}
                            </td>
                            <td className="px-4 py-2 text-center text-ink-2 font-mono">
                              {row.reorder || '0'}
                            </td>
                            <td className="px-4 py-2">
                              {hasErr ? (
                                <span className="text-[10px] text-red font-semibold">Will Skip</span>
                              ) : (
                                <span className="text-[10px] text-green font-semibold">Valid</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
