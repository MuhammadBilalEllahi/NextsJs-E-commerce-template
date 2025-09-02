"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CitySelect } from "@/components/ui/city-select"

export default function AddressesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Addresses</h1>
      <form
        className="grid sm:grid-cols-2 gap-4 max-w-2xl"
        onSubmit={(e) => {
          e.preventDefault()
          alert("Saved address")
        }}
      >
        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" placeholder="Street address" />
        </div>
        <div>
          <CitySelect
            value=""
            onChange={() => {}}
          />
        </div>
        <div>
          <Label htmlFor="postal">Postal Code</Label>
          <Input id="postal" />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" defaultValue="Pakistan" />
        </div>
        <Button className="sm:col-span-2 bg-red-600 hover:bg-red-700">Save</Button>
      </form>
    </div>
  )
}
