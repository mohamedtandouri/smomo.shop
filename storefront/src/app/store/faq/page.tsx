export default function FAQPage() {
  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay."
    },
    {
      question: "How long will it take to receive my order?",
      answer: "Orders are typically processed within 1-2 business days. Standard shipping takes 3-5 business days, while express shipping takes 1-2 business days depending on your location."
    },
    {
      question: "Can I return or exchange an item?",
      answer: "Yes, we offer a 30-day return policy for unused items in their original packaging. Please visit our Shipping & Returns page for more details."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by destination and will be calculated at checkout."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you will receive a confirmation email with a tracking number and a link to track your package."
    }
  ]

  return (
    <div className="container mx-auto px-4 py-16 min-h-[70vh]">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">Frequently Asked Questions</h1>
        <p className="text-gray-600 text-center mb-12 text-lg">
          Find answers to common questions about our products, shipping, and returns.
        </p>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
