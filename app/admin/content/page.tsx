"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

type Blog = { title: string; image?: string; tags: string[]; content: string }
type FAQ = { q: string; a: string }
type Policy = { key: string; content: string }
type Banner = { title: string; link?: string; start?: string; end?: string; image?: string }

export default function ContentAdminPage() {
  const [blog, setBlog] = useState<Blog>({ title: "", tags: [], content: "" })
  const [faqList, setFaqList] = useState<FAQ[]>([{ q: "What is Dehli Mirch?", a: "Authentic spices and condiments." }])
  const [policies, setPolicies] = useState<Policy[]>([
    { key: "Return Policy", content: "You may return within 7 days..." },
    { key: "Privacy Policy", content: "We respect your privacy..." },
    { key: "Terms of Service", content: "By using this site..." },
  ])
  const [banner, setBanner] = useState<Banner>({ title: "" })

  const addFAQ = ()=> setFaqList(prev=>[...prev, { q:"", a:"" }])
  const removeFAQ = (i:number)=> setFaqList(prev=>prev.filter((_,idx)=>idx!==i))

  const previewBanner = (e: React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0]; if(!file) return
    const reader = new FileReader()
    reader.onload = ()=> setBanner(b=>({...b, image: reader.result as string }))
    reader.readAsDataURL(file)
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Manager</CardTitle>
          <CardDescription>Blogs, FAQs, Policies, and Homepage Banners</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <section className="grid md:grid-cols-2 gap-4">
            <div className="rounded border p-3 grid gap-2">
              <h3 className="font-semibold">Blog Editor</h3>
              <Input placeholder="Title" value={blog.title} onChange={(e)=>setBlog(b=>({...b,title:e.target.value}))}/>
              <Input placeholder="Tags (| separated)" value={blog.tags.join("|")} onChange={(e)=>setBlog(b=>({...b,tags:e.target.value.split("|").filter(Boolean)}))}/>
              <Textarea rows={8} placeholder="Content (rich text coming soon)" value={blog.content} onChange={(e)=>setBlog(b=>({...b,content:e.target.value}))}/>
              <Button className="bg-red-600 hover:bg-red-700 w-fit">Save Post</Button>
            </div>
            <div className="rounded border p-3 grid gap-2">
              <h3 className="font-semibold">Homepage Banner</h3>
              <Input placeholder="Title" value={banner.title} onChange={(e)=>setBanner(b=>({...b,title:e.target.value}))}/>
              <Input placeholder="Link URL" value={banner.link ?? ""} onChange={(e)=>setBanner(b=>({...b,link:e.target.value}))}/>
              <div className="grid grid-cols-2 gap-2">
                <Input type="datetime-local" value={banner.start ?? ""} onChange={(e)=>setBanner(b=>({...b,start:e.target.value}))}/>
                <Input type="datetime-local" value={banner.end ?? ""} onChange={(e)=>setBanner(b=>({...b,end:e.target.value}))}/>
              </div>
              <Input type="file" accept="image/*" onChange={previewBanner}/>
              {banner.image && <img src={banner.image || "/placeholder.svg"} alt="Banner preview" className="mt-2 h-20 w-full rounded object-cover border" />}
              <Button variant="outline" className="w-fit">Schedule</Button>
            </div>
          </section>

          <section className="rounded border p-3 grid gap-3">
            <h3 className="font-semibold">FAQs</h3>
            {faqList.map((f,i)=>(
              <div key={i} className="grid md:grid-cols-[1fr_1fr_auto] gap-2">
                <Input placeholder="Question" value={f.q} onChange={(e)=>setFaqList(prev=>prev.map((x,idx)=> idx===i ? {...x,q:e.target.value} : x))}/>
                <Input placeholder="Answer" value={f.a} onChange={(e)=>setFaqList(prev=>prev.map((x,idx)=> idx===i ? {...x,a:e.target.value} : x))}/>
                <Button variant="outline" onClick={()=>removeFAQ(i)}>Remove</Button>
              </div>
            ))}
            <Button variant="outline" onClick={addFAQ}>Add FAQ</Button>
          </section>

          <section className="rounded border p-3 grid gap-3">
            <h3 className="font-semibold">Policy Pages</h3>
            {policies.map((p, i)=>(
              <div key={p.key} className="grid gap-2">
                <div className="font-medium">{p.key}</div>
                <Textarea rows={5} value={p.content} onChange={(e)=>setPolicies(prev=>prev.map((x,idx)=> idx===i ? {...x,content:e.target.value} : x))}/>
              </div>
            ))}
            <Button className="bg-green-600 hover:bg-green-700 w-fit">Save Policies</Button>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
