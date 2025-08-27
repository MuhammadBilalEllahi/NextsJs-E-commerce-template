"use client"

import { useEffect, useMemo, useState } from "react"
import { getAllBlogs, type Blog } from "@/mock_data/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function BlogsAdminPage() {
  const [posts, setPosts] = useState<Blog[]>([])
  const [q, setQ] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState<Partial<Blog>>({ title: "", excerpt: "", image: "", tags: [] })

  useEffect(() => {
    ;(async () => {
      setPosts(await getAllBlogs())
    })()
  }, [])

  const filtered = useMemo(() => posts.filter((p) => p.title.toLowerCase().includes(q.toLowerCase())), [posts, q])

  const addPost = () => {
    if (!draft.title || !draft.excerpt) return
    const slug = String(draft.title).toLowerCase().replace(/\s+/g, "-")
    const post: Blog = {
      slug,
      title: draft.title as string,
      excerpt: draft.excerpt as string,
      content: draft.content || "",
      image: draft.image || "/blog-concept.png",
      tags: (draft.tags as string[])?.length ? (draft.tags as string[]) : ["General"],
    }
    setPosts((prev) => [post, ...prev])
    setShowForm(false)
    setDraft({ title: "", excerpt: "", image: "", tags: [] })
  }

  const remove = (slug: string) => setPosts((prev) => prev.filter((p) => p.slug !== slug))

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Blogs</h2>
        <div className="flex items-center gap-2">
          <Input placeholder="Search posts" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Close" : "Add Post"}
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="mb-4 rounded-lg border p-4">
          <h3 className="font-semibold mb-2">New Post</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Title" value={draft.title ?? ""} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
            <Input placeholder="Image URL" value={draft.image ?? ""} onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))} />
            <Textarea placeholder="Excerpt" value={draft.excerpt ?? ""} onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))} />
            <Textarea placeholder="Content" value={draft.content ?? ""} onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))} />
          </div>
          <div className="mt-3">
            <Button className="bg-red-600 hover:bg-red-700" onClick={addPost}>Save Post</Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900/40">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Tags</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.slug} className="border-t">
                <td className="p-3">{p.title}</td>
                <td className="p-3">{p.tags.join(", ")}</td>
                <td className="p-3">
                  <button className="text-red-600 hover:underline" onClick={() => remove(p.slug)}>Remove</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-neutral-500">No posts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-neutral-500">Note: Placeholder only; connect to your CMS to persist.</p>
    </div>
  )
}
