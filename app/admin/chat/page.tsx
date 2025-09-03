"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getSampleInquiries } from "@/mock_data/admin-sample"

type Inquiry = { 
  id: string; 
  name: string; 
  email?: string; 
  message: string; 
  channel: string; 
  status: string; 
  createdAt: string; 
  thread?: { from: string; text: string; at: string }[] 
}

export default function ChatInquiriesAdminPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(useMemo(()=>getSampleInquiries(),[]))
  const [selected, setSelected] = useState<Inquiry | null>(inquiries[0] ?? null)
  const [reply, setReply] = useState("")

  const setStatus = (id:string, status: string)=> setInquiries(prev=>prev.map(i=>i.id===id?{...i,status}:i))

  const sendReply = ()=>{
    if(!selected || !reply) return
    const msg = { from:"admin" as const, text: reply, at: new Date().toISOString() }
    setInquiries(prev=>prev.map(i=> i.id===selected.id ? ({...i, thread:[...(i.thread ?? []), msg]}) : i))
    setReply("")
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Chat & Inquiries</CardTitle>
          <CardDescription>View and respond to user messages</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-[320px_1fr] gap-4">
          <aside className="rounded border divide-y">
            {inquiries.map(i=>(
              <button key={i.id} className={"w-full text-left px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 "+(selected?.id===i.id?"bg-neutral-50 dark:bg-neutral-900":"")} onClick={()=>setSelected(i)}>
                <div className="flex items-center justify-between">
                  <div className="font-medium truncate pr-2">{i.name}</div>
                  <span className={"text-xs "+(i.status==="Open"?"text-red-600":"text-green-700")}>{i.status}</span>
                </div>
                <div className="text-xs text-neutral-500 truncate">{i.message}</div>
                <div className="text-[10px] text-neutral-400">{i.channel} • {new Date(i.createdAt).toLocaleString()}</div>
              </button>
            ))}
          </aside>
          <section className="rounded border p-3 grid gap-3">
            {selected ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{selected.name}</div>
                    <div className="text-xs text-neutral-500">{selected.email ?? "—"} • {selected.channel}</div>
                  </div>
                  <select className="rounded border bg-transparent px-2 py-1" value={selected.status} onChange={(e)=>{ setStatus(selected.id, e.target.value); setSelected(s=> s ? ({...s, status: e.target.value}) : s) }}>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="h-64 overflow-auto rounded border p-2 bg-neutral-50 dark:bg-neutral-900">
                  {(selected.thread ?? [{ from:"user" as const, text: selected.message, at: selected.createdAt }]).map((m,idx)=>(
                    <div key={idx} className={"mb-2 flex "+(m.from==="admin"?"justify-end":"justify-start")}>
                      <div className={"max-w-[75%] rounded px-2 py-1 text-sm "+(m.from==="admin"?"bg-green-600 text-white":"bg-white dark:bg-background border")}>
                        <div>{m.text}</div>
                        <div className="text-[10px] opacity-70">{new Date(m.at).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Type a reply..." value={reply} onChange={(e)=>setReply(e.target.value)} />
                  <Button className="bg-red-600 hover:bg-red-700" onClick={sendReply}>Send</Button>
                </div>
                <div className="text-xs text-neutral-500">WhatsApp log viewer can be wired to your automation provider.</div>
              </>
            ) : <div className="text-neutral-500">Select an inquiry</div>}
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
