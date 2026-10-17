"use client"

import Link from "next/link"

interface StorefrontFooterProps {
  storeName?: string
  contactEmail?: string | null
  contactPhone?: string | null
  primaryColor?: string
}

export function StorefrontFooter({
  storeName = "Smomo",
  contactEmail = "support@smomo.shop",
  contactPhone = "+1 (555) 123-4567",
  primaryColor = "#ff2d55"
}: StorefrontFooterProps) {
  return (
    <footer className="bg-gray-950 pt-16 pb-8 border-t border-gray-900 text-gray-400 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {storeName.toUpperCase()}<span style={{ color: primaryColor }}>.</span>
            </h3>
            <p className="text-sm leading-relaxed max-w-xs font-light text-gray-400">
              Your ultimate destination for premium lifestyle products. We combine quality, affordability, and exceptional customer service.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:text-white transition-all hover:-translate-y-1"><span className="text-[10px] font-semibold">FB</span></a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:text-white transition-all hover:-translate-y-1"><span className="text-[10px] font-semibold">TW</span></a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:text-white transition-all hover:-translate-y-1"><span className="text-[10px] font-semibold">IG</span></a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:text-white transition-all hover:-translate-y-1"><span className="text-[10px] font-semibold">YT</span></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Explore</h4>
            <ul className="space-y-2.5 text-sm font-light">
              <li><Link href="/store" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gray-700 transition-colors" style={{ backgroundColor: primaryColor }}></span> Home</Link></li>
              <li><Link href="/store/products" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gray-700 transition-colors" style={{ backgroundColor: primaryColor }}></span> All Products</Link></li>
              <li><Link href="/store/categories" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gray-700 transition-colors" style={{ backgroundColor: primaryColor }}></span> Categories</Link></li>
              <li><Link href="/store/about" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gray-700 transition-colors" style={{ backgroundColor: primaryColor }}></span> About Us</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Support</h4>
            <ul className="space-y-2.5 text-sm font-light">
              <li><Link href="/store/contact" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gray-700 transition-colors" style={{ backgroundColor: primaryColor }}></span> Contact Us</Link></li>
              <li><Link href="/store/faq" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gray-700 transition-colors" style={{ backgroundColor: primaryColor }}></span> FAQs</Link></li>
              <li><Link href="/store/shipping" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gray-700 transition-colors" style={{ backgroundColor: primaryColor }}></span> Shipping & Returns</Link></li>
              <li><Link href="/store/privacy" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-gray-700 transition-colors" style={{ backgroundColor: primaryColor }}></span> Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Contact</h4>
            <ul className="space-y-3 text-sm font-light">
              {contactEmail && (
                <li className="flex gap-2">
                  <span className="font-medium" style={{ color: primaryColor }}>Email:</span>
                  <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">{contactEmail}</a>
                </li>
              )}
              {contactPhone && (
                <li className="flex gap-2">
                  <span className="font-medium" style={{ color: primaryColor }}>Phone:</span>
                  <span className="hover:text-white transition-colors cursor-default">{contactPhone}</span>
                </li>
              )}
              <li className="flex gap-2">
                <span className="font-medium" style={{ color: primaryColor }}>Support:</span>
                <span className="leading-relaxed">Available Mon - Fri, 9am - 6pm</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-900 pt-6 flex flex-col md:flex-row items-center justify-between text-xs">
          <p className="font-light text-gray-500">&copy; {new Date().getFullYear()} <span className="text-gray-300 font-medium">{storeName}</span>. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0 font-medium text-gray-700 tracking-wide">
            <span className="hover:text-gray-400 cursor-pointer transition-colors">VISA</span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">MASTERCARD</span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">PAYPAL</span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">APPLE PAY</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
