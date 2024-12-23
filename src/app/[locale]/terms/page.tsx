import PageLayout from "@/components/pages/layout";
import Link from "next/link";

export default function TermsPage() {
  return (
    <PageLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Terms of use</h1>
        <p>By using this service, you agree to the following terms and conditions:</p>
        <h3 className="text-xl font-bold text-gray-800 mb-2">1. Purpose</h3>
        <p>This platform facilitates the voluntary delivery of weapons to authorized collection points under the government initiative.
        </p>
        <h3 className="text-xl font-bold text-gray-800 mb-2">2. User Responsibilities</h3>
        <ul>
            <li>Users must provide accurate information.</li>
            <li>Users must not attempt to deliver weapons to unauthorized collection points.</li>
        </ul>
        <h3 className="text-xl font-bold text-gray-800 mb-2">3. Prohibited Activities</h3>
        <p>You agree not to:</p>
        <ul className="list-disc list-inside">
            <li>Misrepresent your identity or ownership of a weapon.</li>
            <li>Use the platform for any illegal activities.</li>
            <li>Violate the privacy of other users.</li>
        </ul>
        <h3 className="text-xl font-bold text-gray-800 mb-2">4. Data Usage</h3>
        <p>Your data is collected and processed in accordance with our <Link href='/privacy-policy'>Privacy Policy</Link>.</p>
        <h3 className="text-xl font-bold text-gray-800 mb-2">5. Liability</h3>
        <p>We are not liable for:</p>
        <ul className="list-disc list-inside">
            <li>Any damages caused by the use of this platform.</li>
            <li>Unauthorized use of the platform due to your negligence.</li>
        </ul>
        <h3 className="text-xl font-bold text-gray-800 mb-2">6. Contact Us</h3>
        <p>Please feel free to contact the platform admin on info@e-syrians.com.</p>
        <p>Latest update: <u>2024-12-23</u></p>
      </div>
    </PageLayout>
  );
}
