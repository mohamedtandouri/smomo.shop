export default function ShippingReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 border border-gray-200 rounded-xl shadow-sm">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shipping & Returns</h1>
        
        <div className="prose prose-blue max-w-none text-gray-600">
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Shipping Options</h2>
          <p>
            We offer various shipping options to meet your needs. All orders are processed within 1-2 business days (excluding weekends and holidays) after receiving your order confirmation email.
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li><strong>Standard Shipping:</strong> 3-5 business days. Free for orders over $50.</li>
            <li><strong>Express Shipping:</strong> 1-2 business days. Calculated at checkout.</li>
            <li><strong>International Shipping:</strong> 7-14 business days. Rates vary by destination.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">2. Order Tracking</h2>
          <p>
            When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">3. Return Policy</h2>
          <p>
            We accept returns up to 30 days after delivery, if the item is unused and in its original condition. We will refund the full order amount minus the shipping costs for the return.
          </p>
          <p className="mt-4">
            In the event that your order arrives damaged in any way, please email us as soon as possible at support@smomoshop.com with your order number and a photo of the item's condition. We address these on a case-by-case basis but will try our best to work towards a satisfactory solution.
          </p>
        </div>
      </div>
    </div>
  )
}
