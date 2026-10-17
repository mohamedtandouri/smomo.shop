import Image from "next/image"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-50 py-20 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            About <span className="text-[#ff2d55]">SMOMO.</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            We started with a simple vision: to make premium quality products accessible to everyone while delivering an unmatched online shopping experience.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative bg-gray-200">
                <img 
                  src="https://picsum.photos/seed/about/800/600" 
                  alt="Our Team"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
              <p className="text-gray-600 leading-relaxed">
                Founded in 2023, Smomo Shop emerged from a desire to cut through the noise of crowded e-commerce platforms. We noticed that customers were tired of sifting through endless low-quality options to find truly great products.
              </p>
              <p className="text-gray-600 leading-relaxed">
                That's why we meticulously curate our inventory. Every item on our store has been vetted for quality, durability, and value. Our dedicated team works directly with trusted manufacturers to bring you exactly what you need.
              </p>
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#ff2d55] w-5 h-5" />
                  <span className="text-gray-800 font-medium">Curated high-quality products</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#ff2d55] w-5 h-5" />
                  <span className="text-gray-800 font-medium">Exceptional customer service</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#ff2d55] w-5 h-5" />
                  <span className="text-gray-800 font-medium">Fast and reliable shipping worldwide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-20 text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold mb-6">Ready to experience the difference?</h2>
          <p className="text-gray-400 mb-8 text-lg">Join thousands of satisfied customers and discover your next favorite product today.</p>
          <Link 
            href="/store/products" 
            className="inline-flex bg-[#ff2d55] hover:bg-[#e6224c] text-white px-8 py-3 rounded-lg font-bold transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  )
}
