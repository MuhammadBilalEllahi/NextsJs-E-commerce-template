export type SampleProduct = {
  id: string; title: string; description: string; price: number; quantity: number; sku: string; type: string;
  ingredients: string; instructions: string; categories: string[]; tags: string[]; discount?: number; image?: string
}
export function getSampleProducts(): SampleProduct[] {
  return [
    { id:"p-kashmiri", title:"Kashmiri Mirch Powder", description:"Vibrant red, mild heat.", price:6.99, quantity:120, sku:"KM-100", type:"Spice", ingredients:"Chili", instructions:"Use to color curries", categories:["Spices","Chili"], tags:["mild","red"], discount:10, image:"/kashmiri-mirch.png" },
    { id:"p-garam", title:"Garam Masala", description:"Fragrant blend.", price:8.49, quantity:60, sku:"GM-200", type:"Blend", ingredients:"Coriander, Cumin, Clove", instructions:"Finish curries", categories:["Spices"], tags:["blend"], image:"/garam-masala.png" },
  ]
}

export function getSampleCategories() {
  return [
    { id:"c-spices", name:"Spices", filters:[{ name:"Spice Level", values:["Mild","Medium","Hot"] }, { name:"Weight", values:["100g","250g","1kg"] }] },
    { id:"c-pickles", name:"Pickles", parent:"Condiments", filters:[{ name:"Type", values:["Mango","Lemon"] }] },
  ]
}

export function getSampleOrders() {
  return [
    { id:"DM123456", customer:"Rahul Singh", total:39.98, status:"Completed", payment:"COD", date:"2025-08-01", items:2, tracking:"TRK123" },
    { id:"DM123355", customer:"Ayesha Khan", total:19.99, status:"Processing", payment:"JazzCash", date:"2025-07-20", items:1, tracking:"TRK122" },
    { id:"DM123290", customer:"Bilal Ahmed", total:12.49, status:"Pending", payment:"Easypaisa", date:"2025-07-19", items:1 },
  ]
}

export function getSampleCustomers() {
  return [
    { id:"u1", name:"Ayesha Khan", email:"ayesha@example.com", orders:5, total:129.45, tags:["VIP"] },
    { id:"u2", name:"Rahul Singh", email:"rahul@example.com", orders:3, total:64.22, tags:["wholesale"] },
    { id:"u3", name:"Bilal Ahmed", email:"bilal@example.com", orders:1, total:12.49, tags:[] },
  ]
}

export function getSampleCoupons() {
  return [
    { code:"HEAT10", type:"percent", amount:10, starts:"2025-07-01T00:00", ends:"2025-08-31T23:59", restrict:"Spices" },
    { code:"PICKLE5", type:"fixed", amount:5 },
  ]
}

export function getSampleInquiries() {
  return [
    { id:"q1", name:"Sana", email:"sana@example.com", message:"Is Kashmiri mirch very spicy?", channel:"Chat", status:"Open", createdAt:new Date().toISOString(), thread:[{from:"user", text:"Hello!", at:new Date().toISOString()}] },
    { id:"q2", name:"Imran", message:"I want to order via WhatsApp", channel:"WhatsApp", status:"Closed", createdAt:new Date().toISOString() },
  ]
}

export function getSamplePayments() {
  return [
    { id:"pay_1", method:"JazzCash", status:"Paid", amount:19.99, date:"2025-07-20", orderId:"DM123355" },
    { id:"pay_2", method:"Easypaisa", status:"Failed", amount:12.49, date:"2025-07-19", orderId:"DM123290" },
    { id:"pay_3", method:"COD", status:"Paid", amount:39.98, date:"2025-08-01", orderId:"DM123456" },
  ]
}

export function getSampleAnalytics() {
  return {
    revenueByMonth: [
      { month:"Mar", total:2450 },
      { month:"Apr", total:2750 },
      { month:"May", total:3225 },
      { month:"Jun", total:4100 },
      { month:"Jul", total:4860 },
      { month:"Aug", total:5200 },
    ],
    ordersByStatus: [
      { status:"Pending", count:5 },
      { status:"Processing", count:12 },
      { status:"Completed", count:64 },
      { status:"Refunded", count:3 },
    ],
    topProducts: [
      { id:"p-garam", title:"Garam Masala 200g", units:320 },
      { id:"p-kashmiri", title:"Kashmiri Mirch 100g", units:260 },
      { id:"p-pickle", title:"Mango Pickle 500g", units:210 },
    ],
    lowStock: [
      { id:"p-garam", title:"Garam Masala 200g", qty:6 },
      { id:"p-pickle", title:"Mango Pickle 500g", qty:3 },
    ],
  }
}
