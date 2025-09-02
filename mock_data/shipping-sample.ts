export const sampleShippingMethods = [
  {
    name: "Home Delivery",
    type: "home_delivery",
    isActive: true,
    locations: [
      {
        city: "Lahore",
        state: "Punjab",
        country: "Pakistan",
        shippingFee: 0,
        tcsFee: 0,
        estimatedDays: 1,
        isAvailable: true
      }
    ],
    defaultShippingFee: 0,
    defaultTcsFee: 0,
    defaultEstimatedDays: 1,
    freeShippingThreshold: 0,
    description: "Free home delivery within Lahore city limits",
    restrictions: ["Cash on delivery only", "Within city limits"]
  },
  {
    name: "TCS Express",
    type: "tcs",
    isActive: true,
    locations: [
      {
        city: "Karachi",
        state: "Sindh",
        country: "Pakistan",
        shippingFee: 200,
        tcsFee: 100,
        estimatedDays: 2,
        isAvailable: true
      },
      {
        city: "Islamabad",
        state: "Federal",
        country: "Pakistan",
        shippingFee: 250,
        tcsFee: 150,
        estimatedDays: 2,
        isAvailable: true
      },
      {
        city: "Peshawar",
        state: "Khyber Pakhtunkhwa",
        country: "Pakistan",
        shippingFee: 300,
        tcsFee: 200,
        estimatedDays: 3,
        isAvailable: true
      }
    ],
    defaultShippingFee: 300,
    defaultTcsFee: 200,
    defaultEstimatedDays: 3,
    freeShippingThreshold: 1000,
    description: "TCS courier service for locations outside Lahore",
    restrictions: ["Cash on delivery only", "Subject to TCS terms"]
  }
]

