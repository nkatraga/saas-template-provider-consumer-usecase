import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for the platform.",
};

// [Template] — Generic privacy policy page. Replace "[App Name]" and contact email with your own.

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: February 20, 2026
        </p>

        <div className="prose prose-neutral max-w-none space-y-6 text-foreground">
          <p>
            This Privacy Policy describes how we collect, use, and protect your
            personal information when you use [App Name] (&quot;the
            Platform&quot;), available as a web application and mobile
            application.
          </p>

          <h2 className="text-xl font-semibold mt-8">
            1. Information We Collect
          </h2>

          <h3 className="text-lg font-medium mt-4">Account Information</h3>
          <p>When you create an account, we collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name and optional display name</li>
            <li>Email address</li>
            <li>Phone number (optional)</li>
            <li>Password (stored in encrypted/hashed form only)</li>
            <li>Account role (provider or consumer)</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">
            Provider Profile Information
          </h3>
          <p>
            Providers who create a public directory profile may additionally
            provide:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Business name and bio</li>
            <li>Description of services and years of experience</li>
            <li>Services offered and booking formats</li>
            <li>Pricing range</li>
            <li>Location (city, state, zip code, and coordinates)</li>
            <li>Profile photos and business photos</li>
            <li>Business policies (payment, cancellation, etc.)</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">
            Booking and Scheduling Data
          </h3>
          <p>When using the scheduling features, we collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Booking dates, times, and durations</li>
            <li>Rescheduling and exchange requests, including messages</li>
            <li>Notes added by providers or consumers</li>
          </ul>

          <h3 className="text-lg font-medium mt-4">Reviews</h3>
          <p>
            Consumers may submit ratings and written reviews of their providers.
            These may be displayed publicly on provider profiles.
          </p>

          <h3 className="text-lg font-medium mt-4">Device Information</h3>
          <p>
            If you enable push notifications, we store a device push token to
            deliver notifications to your device. We do not collect device
            identifiers, IP addresses, or precise real-time location data.
          </p>

          <h2 className="text-xl font-semibold mt-8">
            2. How We Use Your Information
          </h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide and operate the Platform</li>
            <li>
              Facilitate booking, rescheduling, and exchanges between users
            </li>
            <li>Display provider profiles in the public directory</li>
            <li>Send booking reminders and notifications via email and push</li>
            <li>Process payments and manage subscriptions</li>
            <li>Verify your identity and secure your account</li>
            <li>Improve the Platform through usage analytics</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">
            3. Information Shared With Other Users
          </h2>
          <p>
            <strong>Provider profiles:</strong> Providers who opt into the public
            directory make their profile information (name, bio, location,
            services, pricing, ratings, and reviews) visible to anyone.
          </p>
          <p>
            <strong>Within a provider&apos;s roster:</strong> Providers control
            what consumer information is visible to other consumers, including
            names, email addresses, and phone numbers. These visibility settings
            are configured by each provider.
          </p>
          <p>
            <strong>Booking exchanges:</strong> When consumers participate in
            booking exchanges, limited information (booking times and service
            details) is shared between the consumers involved.
          </p>

          <h2 className="text-xl font-semibold mt-8">
            4. Third-Party Services
          </h2>
          <p>
            We use the following third-party services that may receive some of
            your data:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Stripe</strong> &mdash; Payment processing. Stripe handles
              all payment card data directly and is PCI-DSS compliant. We do not
              store your card information.
            </li>
            <li>
              <strong>Cloudinary</strong> &mdash; Image hosting for profile
              photos and business images.
            </li>
            <li>
              <strong>Google Calendar</strong> &mdash; Optional calendar sync for
              providers who choose to connect their Google account.
            </li>
            <li>
              <strong>Google Places</strong> &mdash; Location lookup when
              providers set their business address.
            </li>
            <li>
              <strong>Expo Push Notifications</strong> &mdash; Delivery of push
              notifications to mobile devices.
            </li>
            <li>
              <strong>PostHog</strong> &mdash; Anonymous usage analytics to help
              us improve the Platform.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">5. Data Storage</h2>
          <p>
            Your data is stored in a secure PostgreSQL database hosted by Neon.
            Passwords are hashed using industry-standard encryption (bcrypt).
            Authentication tokens on mobile devices are stored in encrypted
            device storage (iOS Keychain / Android Keystore). All data is
            transmitted over HTTPS.
          </p>

          <h2 className="text-xl font-semibold mt-8">6. Data Retention</h2>
          <p>
            We retain your personal data for as long as your account is active.
            If you delete your account, your personal data and associated records
            (bookings, exchanges, reviews, and consumer profiles) will be
            permanently deleted from our systems.
          </p>

          <h2 className="text-xl font-semibold mt-8">
            7. Children&apos;s Privacy
          </h2>
          <p>
            The Platform is not intended for use by children under the age of 13.
            We do not knowingly collect personal information from children under
            13. If you believe a child under 13 has provided us with personal
            information, please contact us so we can delete the data.
          </p>

          <h2 className="text-xl font-semibold mt-8">8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate information in your profile</li>
            <li>Delete your account and associated data</li>
            <li>
              Opt out of the public provider directory at any time (providers)
            </li>
            <li>
              Control what information is visible to consumers (providers)
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">
            9. Cookies and Tracking
          </h2>
          <p>
            The web application uses essential cookies for authentication
            (session management). We use PostHog for anonymous usage analytics.
            We do not use advertising cookies or third-party tracking pixels.
          </p>

          <h2 className="text-xl font-semibold mt-8">10. Security</h2>
          <p>
            We take reasonable measures to protect your data, including password
            hashing, encrypted token storage, HTTPS encryption for all data in
            transit, and role-based access controls. However, no method of
            electronic transmission or storage is 100% secure.
          </p>

          <h2 className="text-xl font-semibold mt-8">
            11. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of significant changes by posting the updated policy within the
            Platform. Your continued use of the Platform after changes are posted
            constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-xl font-semibold mt-8">12. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or wish to exercise
            your data rights, please contact us at:{" "}
            <a
              href="mailto:support@example.com"
              className="text-primary hover:underline"
            >
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
