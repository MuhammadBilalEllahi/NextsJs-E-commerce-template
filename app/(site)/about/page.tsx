export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <img
          src="/family-spice-shop.png"
          alt="Family-owned spice shop"
          className="w-full rounded-lg object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold">Our Story</h1>
          <p className="mt-4 text-neutral-700 dark:text-neutral-300">
            From Dehli&apos;s bustling bazaars to your kitchen, Dehli Mirch celebrates tradition with a modern twist.
          </p>
        </div>
      </div>
    </div>
  )
}
