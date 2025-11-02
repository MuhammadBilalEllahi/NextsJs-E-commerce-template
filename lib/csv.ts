export function parseCSVProducts(text: string) {
  // naive CSV parsing: first line headers, comma-separated; supports pipe '|' lists.
  const lines = text.trim().split(/\r?\n/)
  const [headerLine, ...rows] = lines
  const headers = headerLine.split(",").map(h=>h.trim().toLowerCase())
  return rows.map((line)=> {
    const cols = splitCSV(line)
    const rec: Record<string,string> = {}
    headers.forEach((h, i)=> rec[h] = (cols[i] ?? "").trim())
    return {
      id: "p"+Math.random().toString(36).slice(2,8),
      title: rec["title"] || "Untitled",
      description: rec["description"] || "",
      price: Number(rec["price"] || 0),
      quantity: Number(rec["quantity"] || 0),
      sku: rec["sku"] || "",
      type: rec["type"] || "Spice",
      ingredients: rec["ingredients"] || "",
      instructions: rec["instructions"] || "",
      categories: (rec["categories"] || "").split("|").filter(Boolean),
      tags: (rec["tags"] || "").split("|").filter(Boolean),
      discount: Number(rec["discount"] || 0),
      image: rec["image"] || "",
    }
  })
}

function splitCSV(line: string) {
  // handle quoted commas
  const out: string[] = []
  let cur = ""
  let inQuotes = false
  for (let i=0; i<line.length; i++) {
    const ch = line[i]
    if (ch === '"' ) {
      if (inQuotes && line[i+1] === '"') { cur += '"'; i++; continue }
      inQuotes = !inQuotes
      continue
    }
    if (ch === "," && !inQuotes) { out.push(cur); cur = ""; continue }
    cur += ch
  }
  out.push(cur)
  return out
}

export function downloadCSV(rows: (string|number)[][], filename: string) {
  const csv = rows.map(r => r.map(cell => {
    const s = String(cell ?? "")
    return (s.includes(",") || s.includes('"') || s.includes("\n")) ? `"${s.replace(/"/g,'""')}"` : s
  }).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
