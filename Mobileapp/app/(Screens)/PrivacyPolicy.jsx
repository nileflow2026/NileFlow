import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const Section = ({ icon, title, children }) => (
  <View style={styles.section}>
    {icon || title ? (
      <View style={styles.sectionHeader}>
        {icon && <MaterialIcons name={icon} size={20} color="#10B981" />}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    ) : null}
    {children}
  </View>
);

const BulletItem = ({ text }) => (
  <View style={styles.bulletRow}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const SubHeading = ({ text }) => <Text style={styles.subHeading}>{text}</Text>;

const BodyText = ({ children }) => (
  <Text style={styles.bodyText}>{children}</Text>
);

const PrivacyPolicy = () => {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#111827", "#000000", "#111827"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["rgba(15, 23, 42, 0.95)", "rgba(30, 41, 59, 0.95)"]}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#F59E0B" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <Text style={styles.headerSubtitle}>
              Last Updated: December 21, 2025
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Shield Banner */}
          <LinearGradient
            colors={["rgba(5, 150, 105, 0.2)", "rgba(4, 120, 87, 0.1)"]}
            style={styles.banner}
          >
            <View style={styles.bannerIcon}>
              <MaterialIcons name="verified-user" size={36} color="#10B981" />
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Your Privacy Matters</Text>
              <Text style={styles.bannerSubtitle}>
                Nile Flow Africa is committed to protecting your personal data.
              </Text>
            </View>
          </LinearGradient>

          {/* Main Card */}
          <LinearGradient
            colors={["rgba(17, 24, 39, 0.8)", "rgba(0, 0, 0, 0.8)"]}
            style={styles.card}
          >
            {/* 1. Introduction */}
            <Section icon="shield" title="1. Introduction">
              <BodyText>
                At Nile Flow Africa, we take your privacy seriously. This
                Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our platform. Please
                read this policy carefully to understand our practices regarding
                your personal data.
              </BodyText>
            </Section>

            <View style={styles.divider} />

            {/* 2. Information We Collect */}
            <Section icon="storage" title="2. Information We Collect">
              <SubHeading text="Personal Information" />
              <BodyText>
                We collect information that you provide directly to us,
                including:
              </BodyText>
              <BulletItem text="Name and username" />
              <BulletItem text="Email address" />
              <BulletItem text="Phone number" />
              <BulletItem text="Shipping and billing addresses" />
              <BulletItem text="Payment information (processed securely by our payment providers)" />
              <BulletItem text="Profile picture and preferences" />

              <SubHeading text="Usage Information" />
              <BodyText>
                We automatically collect information about your interactions
                with our platform:
              </BodyText>
              <BulletItem text="Browser type and version" />
              <BulletItem text="Device information and IP address" />
              <BulletItem text="Pages visited and time spent on the platform" />
              <BulletItem text="Products viewed and purchased" />
              <BulletItem text="Search queries and preferences" />
              <BulletItem text="Nile Miles activity and redemptions" />

              <SubHeading text="Cookies and Tracking" />
              <BodyText>
                We use cookies, web beacons, and similar technologies to enhance
                your experience, analyze usage patterns, and deliver
                personalized content and advertisements.
              </BodyText>
            </Section>

            <View style={styles.divider} />

            {/* 3. How We Use Your Information */}
            <Section icon="visibility" title="3. How We Use Your Information">
              <BodyText>We use the information we collect to:</BodyText>
              <BulletItem text="Process and fulfill your orders" />
              <BulletItem text="Manage your account and Nile Miles" />
              <BulletItem text="Send order confirmations and updates" />
              <BulletItem text="Provide customer support" />
              <BulletItem text="Personalize your shopping experience" />
              <BulletItem text="Send promotional emails (with your consent)" />
              <BulletItem text="Improve our products and services" />
              <BulletItem text="Detect and prevent fraud" />
              <BulletItem text="Comply with legal obligations" />
              <BulletItem text="Analyze usage trends and optimize our platform" />
            </Section>

            <View style={styles.divider} />

            {/* 4. Information Sharing */}
            <Section
              icon="people"
              title="4. Information Sharing and Disclosure"
            >
              <BodyText>We may share your information with:</BodyText>
              <BulletItem text="Service Providers: Third-party companies that help us operate our platform (payment processors, shipping companies, analytics providers)" />
              <BulletItem text="Business Partners: Trusted partners for marketing and promotional purposes (with your consent)" />
              <BulletItem text="Legal Requirements: When required by law or to protect our rights and safety" />
              <BulletItem text="Business Transfers: In the event of a merger, acquisition, or sale of assets" />
              <BodyText>
                We do not sell your personal information to third parties for
                their marketing purposes.
              </BodyText>
            </Section>

            <View style={styles.divider} />

            {/* 5. Data Security */}
            <Section icon="lock" title="5. Data Security">
              <BodyText>
                We implement industry-standard security measures to protect your
                personal information, including encryption, secure servers, and
                regular security audits. However, no method of transmission over
                the internet is 100% secure, and we cannot guarantee absolute
                security. We encourage you to use strong passwords and keep your
                account credentials confidential.
              </BodyText>
            </Section>

            <View style={styles.divider} />

            {/* 6. Your Rights and Choices */}
            <Section icon="help-outline" title="6. Your Rights and Choices">
              <BodyText>You have the right to:</BodyText>
              <BulletItem text="Access: Request a copy of your personal data" />
              <BulletItem text="Correction: Update or correct inaccurate information" />
              <BulletItem text="Deletion: Request deletion of your account and data" />
              <BulletItem text="Opt-Out: Unsubscribe from marketing emails at any time" />
              <BulletItem text="Data Portability: Request your data in a portable format" />
              <BulletItem text="Object: Object to certain processing of your data" />
              <BodyText>
                To exercise these rights, please contact us at{" "}
                <Text style={styles.link}>privacy@nileflowafrica.com</Text>
              </BodyText>
            </Section>

            <View style={styles.divider} />

            {/* 7. Children's Privacy */}
            <Section title="7. Children's Privacy">
              <BodyText>
                Our services are not intended for children under 13 years of
                age. We do not knowingly collect personal information from
                children. If you become aware that a child has provided us with
                personal information, please contact us immediately, and we will
                take steps to delete such information.
              </BodyText>
            </Section>

            <View style={styles.divider} />

            {/* 8. International Data Transfers */}
            <Section icon="public" title="8. International Data Transfers">
              <BodyText>
                Your information may be transferred to and processed in
                countries other than your own. We ensure that appropriate
                safeguards are in place to protect your data in accordance with
                this Privacy Policy and applicable laws.
              </BodyText>
            </Section>

            <View style={styles.divider} />

            {/* 9. Data Retention */}
            <Section title="9. Data Retention">
              <BodyText>
                We retain your personal information for as long as necessary to
                fulfill the purposes outlined in this policy, comply with legal
                obligations, resolve disputes, and enforce our agreements. When
                we no longer need your information, we will securely delete or
                anonymize it.
              </BodyText>
            </Section>

            <View style={styles.divider} />

            {/* 10. Third-Party Links */}
            <Section title="10. Third-Party Links">
              <BodyText>
                Our platform may contain links to third-party websites. We are
                not responsible for the privacy practices of these external
                sites. We encourage you to review their privacy policies before
                providing any personal information.
              </BodyText>
            </Section>

            <View style={styles.divider} />

            {/* 11. Changes to This Policy */}
            <Section title="11. Changes to This Privacy Policy">
              <BodyText>
                We may update this Privacy Policy from time to time to reflect
                changes in our practices or legal requirements. We will notify
                you of significant changes by posting the updated policy on this
                page and updating the "Last Updated" date. We encourage you to
                review this policy periodically.
              </BodyText>
            </Section>

            <View style={styles.divider} />

            {/* 12. Contact Us */}
            <Section title="12. Contact Us">
              <BodyText>
                If you have any questions, concerns, or requests regarding this
                Privacy Policy or our data practices, please contact us:
              </BodyText>
              <LinearGradient
                colors={["rgba(5, 150, 105, 0.15)", "rgba(217, 119, 6, 0.1)"]}
                style={styles.contactBox}
              >
                <Text style={styles.contactItem}>
                  Email:{" "}
                  <Text style={styles.link}>privacy@nileflowafrica.com</Text>
                </Text>
                <Text style={styles.contactItem}>Phone: +254 703 115 359</Text>
                <Text style={styles.contactItem}>
                  Address: Kilimani, Nairobi, Kenya
                </Text>
                <Text
                  style={[
                    styles.contactItem,
                    { marginTop: 8, fontSize: 12, color: "#6B7280" },
                  ]}
                >
                  Data Protection Officer:{" "}
                  <Text style={styles.link}>dpo@nileflowafrica.com</Text>
                </Text>
              </LinearGradient>
            </Section>
          </LinearGradient>

          {/* Consent Notice */}
          <LinearGradient
            colors={["rgba(5, 150, 105, 0.15)", "rgba(4, 120, 87, 0.05)"]}
            style={styles.consentBox}
          >
            <Text style={styles.consentText}>
              By using Nile Flow Africa, you consent to the collection, use, and
              disclosure of your information as described in this Privacy
              Policy. If you do not agree with this policy, please do not use
              our services.
            </Text>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(245, 158, 11, 0.2)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: width < 350 ? 18 : 20,
    fontWeight: "bold",
    color: "#FCD34D",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    gap: 12,
  },
  bannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
    padding: 20,
    gap: 0,
  },
  section: {
    paddingVertical: 16,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: width < 350 ? 15 : 17,
    fontWeight: "700",
    color: "#6EE7B7",
  },
  subHeading: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F59E0B",
    marginTop: 8,
    marginBottom: 2,
  },
  bodyText: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 14,
    color: "#10B981",
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 22,
  },
  link: {
    color: "#10B981",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  contactBox: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    gap: 4,
    marginTop: 8,
  },
  contactItem: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 22,
  },
  consentBox: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  consentText: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 20,
    textAlign: "center",
  },
});

export default PrivacyPolicy;
