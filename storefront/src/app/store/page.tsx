import Link from "next/link"
import { PrismaClient } from "@prisma/client"
import { Truck, ShieldCheck, Headset, ArrowRight, Star, ShoppingBag } from "lucide-react"

const prisma = new PrismaClient()

export default async function StorefrontHomePage() {
  const featuredProducts = await prisma.product.findMany({
    take: 4,
    orderBy: { createdAt: 'desc' }
  })

  const mostViewedProducts = await prisma.product.findMany({
    take: 4,
    orderBy: { views: 'desc' }
  })

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] font-sans selection:bg-[#ff2d55] selection:text-white">
      {/* Dynamic Hero Section */}
      <section className="relative overflow-hidden bg-white">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-200/30 blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#ff2d55]/5 blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: '5s' }} />
        
        <div className="container mx-auto px-4 max-w-6xl py-12 md:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* Left Content */}
            <div className="max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-[#ff2d55] text-xs font-semibold mb-5 shadow-sm">
                <Star className="w-3 h-3 fill-[#ff2d55]" />
                <span>Premium E-Commerce Experience</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-5">
                Elevate Your <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff2d55] to-rose-400">
                  Lifestyle.
                </span>
              </h1>
              <p className="text-base md:text-lg text-gray-500 mb-8 leading-relaxed">
                Discover our curated collection of premium products. Experience fast shipping, secure payments, and unparalleled quality.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link 
                  href="/store/products" 
                  className="group relative inline-flex items-center justify-center bg-[#ff2d55] text-white px-6 py-3 rounded-full font-medium text-sm overflow-hidden transition-transform hover:scale-105 shadow-[0_4px_15px_rgb(255,45,85,0.3)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Shop Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-[#ff2d55] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link 
                  href="/store/categories" 
                  className="inline-flex items-center justify-center bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-full font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  Browse Categories
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" /> In Stock
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" /> 24h Delivery
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]" /> Secure Checkout
                </div>
              </div>
            </div>

            {/* Right Image Container */}
            <div className="relative w-full aspect-square md:aspect-auto md:h-[450px] animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-100 to-pink-50 rounded-[2rem] transform rotate-2 scale-105 -z-10 shadow-inner" />
              <img 
                src="/hero_products.png" 
                alt="Premium Products" 
                className="w-full h-full object-cover rounded-[2rem] shadow-xl ring-1 ring-gray-900/5"
              />
              
              {/* Floating Badge */}
              <div className="absolute -bottom-4 -left-4 md:bottom-8 md:-left-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-[#ff2d55] font-bold text-sm border border-rose-100">
                    10k+
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 mb-0.5">Happy Customers</p>
                    <div className="flex text-yellow-400">
                      <Star className="fill-current w-3 h-3" /><Star className="fill-current w-3 h-3" /><Star className="fill-current w-3 h-3" /><Star className="fill-current w-3 h-3" /><Star className="fill-current w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-[#fafafa]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Trending Now</h2>
              <p className="text-gray-500 text-sm md:text-base font-light">Discover the most loved products by our community this week.</p>
            </div>
            <Link href="/store/products" className="group inline-flex items-center gap-1.5 text-[#ff2d55] font-medium text-sm hover:text-rose-600 transition-colors bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-full">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[1.5rem] border border-dashed border-gray-200 shadow-sm">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-base">No products found. Add some from the dashboard!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Link href={`/store/products/${product.id}`} key={product.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 relative">
                  {/* Badge */}
                  <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold text-gray-800 shadow-sm border border-gray-100">
                    New
                  </div>
                  
                  <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
                    <img 
                      src={product.imageUrl || `https://picsum.photos/seed/${product.id}/400/400`} 
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                      <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-medium text-xs transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md">
                        Quick View
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 text-base mb-1.5 truncate group-hover:text-[#ff2d55] transition-colors">{product.name}</h3>
                    <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed font-light">Experience the ultimate combination of form and function with this premium product.</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                      <button className="w-8 h-8 rounded-full bg-gray-50 text-gray-700 flex items-center justify-center group-hover:bg-[#ff2d55] group-hover:text-white transition-all shadow-sm border border-gray-100 group-hover:border-transparent">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Most Viewed Products */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Most Viewed</h2>
              <p className="text-gray-500 text-sm md:text-base font-light">The products everyone is talking about.</p>
            </div>
            <Link href="/store/products?sort=popular" className="group inline-flex items-center gap-1.5 text-[#ff2d55] font-medium text-sm hover:text-rose-600 transition-colors bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-full">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {mostViewedProducts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-[1.5rem] border border-dashed border-gray-200 shadow-sm">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-base">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mostViewedProducts.map((product) => (
                <Link href={`/store/products/${product.id}`} key={product.id} className="group flex flex-col bg-gray-50 rounded-2xl overflow-hidden shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 relative">
                  {/* Badge */}
                  <div className="absolute top-3 left-3 z-10 bg-[#ff2d55]/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold text-white shadow-sm border border-[#ff2d55]">
                    Hot
                  </div>
                  
                  <div className="relative aspect-[4/5] bg-white overflow-hidden">
                    <img 
                      src={product.imageUrl || `https://picsum.photos/seed/${product.id}/400/400`} 
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                      <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-medium text-xs transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md">
                        Quick View
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 text-base mb-1.5 truncate group-hover:text-[#ff2d55] transition-colors">{product.name}</h3>
                    <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed font-light">Explore this highly sought-after product.</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
                      <button className="w-8 h-8 rounded-full bg-white text-gray-700 flex items-center justify-center group-hover:bg-[#ff2d55] group-hover:text-white transition-all shadow-sm border border-gray-200 group-hover:border-transparent">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Value Props / Features */}
      <section className="py-20 bg-white border-t border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gray-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center mb-12 max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">Why Choose Us</h2>
            <p className="text-gray-500 text-sm md:text-base font-light">We are committed to providing you with the best shopping experience possible.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-5 group-hover:-translate-y-1.5 group-hover:shadow-md group-hover:shadow-rose-100/50 transition-all duration-300">
                <Truck className="w-7 h-7 text-[#ff2d55]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Express Shipping</h3>
              <p className="text-gray-500 font-light text-sm leading-relaxed">Enjoy free express delivery on all orders over $50. Track your package in real-time.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-5 group-hover:-translate-y-1.5 group-hover:shadow-md group-hover:shadow-rose-100/50 transition-all duration-300">
                <ShieldCheck className="w-7 h-7 text-[#ff2d55]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-500 font-light text-sm leading-relaxed">Your data is completely safe with us. We use industry-standard encryption for all transactions.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-5 group-hover:-translate-y-1.5 group-hover:shadow-md group-hover:shadow-rose-100/50 transition-all duration-300">
                <Headset className="w-7 h-7 text-[#ff2d55]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-500 font-light text-sm leading-relaxed">Our dedicated support team is always ready to help you with any questions. We're just a message away.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter / CTA */}
      <section className="py-24 relative overflow-hidden bg-gray-950 text-white">
        {/* Abstract Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[120%] bg-[#ff2d55] opacity-10 blur-[100px] transform rotate-12" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl text-center relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-gray-300 font-medium text-xs mb-5 border border-white/10 uppercase tracking-widest">Newsletter</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Join The Club</h2>
          <p className="text-gray-400 text-sm md:text-base mb-10 max-w-lg mx-auto font-light leading-relaxed">
            Subscribe to our newsletter and get <span className="text-white font-medium">15% off</span> your first order, plus exclusive early access to new arrivals.
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 bg-white/5 p-1.5 rounded-2xl sm:rounded-full border border-white/10">
            <input 
              type="email" 
              placeholder="Enter your email address..." 
              className="flex-1 px-5 py-3 bg-transparent border-none focus:ring-0 outline-none text-white placeholder-gray-500 font-light text-sm"
              required
            />
            <button type="submit" className="px-6 py-3 bg-[#ff2d55] text-white rounded-xl sm:rounded-full font-medium text-sm hover:bg-rose-500 transition-colors shadow-md">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
