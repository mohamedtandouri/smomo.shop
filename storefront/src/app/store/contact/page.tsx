import { Mail, MapPin, Phone } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question, feedback, or need assistance? Our team is here to help. Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Get in Touch</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 text-[#ff2d55] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Our Location</h4>
                    <p className="text-gray-600 text-sm">123 Smomo Street, Suite 456<br/>Tech City, TC 10010</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 text-[#ff2d55] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Email Us</h4>
                    <p className="text-gray-600 text-sm">support@smomoshop.com<br/>sales@smomoshop.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 text-[#ff2d55] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Call Us</h4>
                    <p className="text-gray-600 text-sm">+1 (555) 123-4567<br/>Mon-Fri, 9am-6pm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff2d55] focus:border-[#ff2d55] outline-none transition-all" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff2d55] focus:border-[#ff2d55] outline-none transition-all" placeholder="Doe" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff2d55] focus:border-[#ff2d55] outline-none transition-all" placeholder="john@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff2d55] focus:border-[#ff2d55] outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
                </div>

                <button type="button" className="w-full sm:w-auto px-8 py-3 bg-[#ff2d55] text-white font-bold rounded-lg hover:bg-[#e6224c] transition-colors shadow-lg shadow-[#ff2d55]/20">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
