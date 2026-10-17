export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 border border-gray-200 rounded-xl shadow-sm">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
          <p>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <p>
            At Smomo Shop, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, and safeguard the data you provide to us.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Information We Collect</h2>
          <p>
            When you visit our store or make a purchase, we may collect the following information:
          </p>
          <ul className="list-disc pl-5">
            <li>Personal identification information (Name, email address, phone number, etc.)</li>
            <li>Shipping and billing addresses</li>
            <li>Payment information (processed securely through our payment providers)</li>
            <li>Browsing data and cookies to improve your shopping experience</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">How We Use Your Information</h2>
          <p>
            We use the collected information for various purposes, including:
          </p>
          <ul className="list-disc pl-5">
            <li>Processing and fulfilling your orders</li>
            <li>Communicating with you about your order status</li>
            <li>Providing customer support</li>
            <li>Improving our website and services</li>
            <li>Sending promotional emails (only if you have opted in)</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Data Security</h2>
          <p>
            We implement a variety of security measures to maintain the safety of your personal information. Your personal data is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Contact Us</h2>
          <p>
            If you have any questions regarding this Privacy Policy, you may contact us using the information on our Contact Us page.
          </p>
        </div>
      </div>
    </div>
  )
}
