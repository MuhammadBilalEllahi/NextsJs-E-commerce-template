"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProfilePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <form
        className="grid sm:grid-cols-2 gap-4 max-w-2xl"
        onSubmit={(e) => {
          e.preventDefault()
          alert("Saved")
        }}
      >
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" defaultValue="Dehli Mirch Lover" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue="fan@example.com" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="bio">Bio</Label>
          <Input id="bio" placeholder="Tell us your spice story..." />
        </div>
        <Button className="sm:col-span-2 bg-red-600 hover:bg-red-700">Save</Button>
      </form>
    </div>
  )
}
