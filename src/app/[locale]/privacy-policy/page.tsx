import PageLayout from "@/components/pages/layout";

export default function PrivacyPage() {
  return (
    <PageLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Privacy Policy
        </h1>
        <p>We value your privacy and are committed to protecting your personal information.</p>
        <h3 className="text-xl font-bold text-gray-800 mb-2">1. Data Collection</h3>
        <p>We collect the following information:</p>
        <ul className="list-disc list-inside">
            <li>Personal information</li>
            <li>Weapons information</li>
        </ul>
        <h3 className="text-xl font-bold text-gray-800 mb-2">2. Data Usage</h3>
        <p>The information you provide is used to:</p>
        <ul className="list-disc list-inside">
            <li>Facilitate the secure collection of weapons.</li>
            <li>Improve our services</li>
            <li>Ensure compliance with government regulations.</li>
        </ul>
        <h3 className="text-xl font-bold text-gray-800 mb-2">3. Data Sharing</h3>
        <p>We do not share your information with third parties except:.</p>
        <ul className="list-disc list-inside">
            <li>Government agencies</li>
            <li>Law enforcement</li>
        </ul>
        <h3 className="text-xl font-bold text-gray-800 mb-2">4. Data Protection</h3>
        <p>We implement encryption and secure storage to protect your data from unauthorized access. Especially the national id is stored in two forms:</p>
        <ul className="list-disc list-inside">
            <li>Encrypted: to decrypt it when needed by authorized government personnel.</li>
            <li>Hashed: to calculate the id hash when needed to query it.</li>
        </ul>
        <h3 className="text-xl font-bold text-gray-800 mb-2">5. Data Retention</h3>
        <p>Your data will be retained only as long as necessary for the purpose of the initiative or as required by law. Storing citizens data on this platform is templorarily until the government decide to migrate it or destroy it.</p>
        <h3 className="text-xl font-bold text-gray-800 mb-2">6. Contact Us</h3>
        <p>Please feel free to contact the platform admin on info@e-syrians.com.</p>
        <p>Latest update: <u>2024-12-23</u></p>
      </div>
    </PageLayout>
  );
}
