/* eslint-disable no-unused-vars */
import { LinearGradient } from "expo-linear-gradient";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../Context/ThemeProvider"; //

const { width } = Dimensions.get("window");

const ReturnPolicy = () => {
  // Responsive styles
  const titleFontSize = width < 350 ? 24 : 28;
  const subtitleFontSize = width < 350 ? 18 : 20;
  const bodyFontSize = width < 350 ? 14 : 16;
  const sectionMarginBottom = width < 350 ? 20 : 24;
  const paddingHorizontal = width < 350 ? 16 : 20;
  const sectionSpacing = width < 350 ? 20 : 24;
  const sidePadding = width < 350 ? 16 : 20;
  const { theme, themeStyles } = useTheme();

  const isDark = theme === "dark";

  const benefits = [
    { title: "30-Day Window", description: "Ample time to decide", icon: "🕐" },
    { title: "Free Returns", description: "Across Africa", icon: "🚚" },
    { title: "Premium Support", description: "24/7 assistance", icon: "🎧" },
    { title: "Hassle-Free", description: "Simple process", icon: "✅" },
  ];

  const policySections = [
    {
      title: "Eligibility for Returns",
      icon: "🛡️",
      color: ["#d97706", "#b45309"],
      items: [
        "Items must be returned within 30 days of the delivery date.",
        "Items must be unused, undamaged, and in their original packaging.",
        "Proof of purchase is required for all returns.",
        "Custom or personalized items may not be returned unless defective.",
        'Items marked as "final sale" are not eligible for return.',
      ],
      note: "Your satisfaction is our priority",
    },
    {
      title: "How to Initiate a Return",
      icon: "🔄",
      color: ["#059669", "#047857"],
      steps: [
        "Contact our premium customer service team with your order number.",
        "We will provide you with a prepaid return shipping label.",
        "Pack the item securely with all original accessories.",
        "Ship the item back using our designated courier service.",
        "Track your return through our mobile app or website.",
      ],
    },
    {
      title: "Refunds",
      icon: "💰",
      color: ["#2563eb", "#1d4ed8"],
      items: [
        "Refunds processed within 24 hours of receiving the returned item.",
        "Refunds issued to the original payment method within 3-5 business days.",
        "Shipping charges are non-refundable unless the return is due to our error.",
        "Digital gift cards are non-refundable.",
        "Partial refunds may be issued for items not returned in original condition.",
      ],
    },
    {
      title: "Exchanges",
      icon: "📦",
      color: ["#7c3aed", "#6d28d9"],
      items: [
        "Exchanges processed within 48 hours of receiving the returned item.",
        "Free return shipping for exchange requests within Africa.",
        "Price differences will be charged or refunded accordingly.",
        "Exchanges subject to product availability in your region.",
        "Priority shipping for exchange orders.",
      ],
    },
  ];

  const faqs = [
    {
      q: "How long does it take to process a refund?",
      a: "Refunds are typically processed within 24 hours of receiving the returned item, and appear in your account within 3-5 business days.",
    },
    {
      q: "Do you offer free return shipping?",
      a: "Yes, we offer free return shipping across Africa for all eligible returns.",
    },
    {
      q: "Can I exchange for a different size or color?",
      a: "Absolutely! We facilitate size and color exchanges at no additional cost within Africa.",
    },
    {
      q: "What if my item arrives damaged?",
      a: "Contact us immediately within 48 hours of delivery. We'll arrange a replacement or refund at no cost to you.",
    },
  ];

  const trustBadges = [
    { value: "30 Days", label: "Return Window", color: "#d97706" },
    { value: "Free", label: "African Returns", color: "#059669" },
    { value: "24 Hours", label: "Refund Processing", color: "#2563eb" },
    { value: "100%", label: "Satisfaction Guarantee", color: "#dc2626" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Section */}
        <LinearGradient
          colors={["#0f172a", "#1e293b", "#334155"]}
          style={styles.heroSection}
        >
          <View style={styles.premiumBadge}>
            <Text style={styles.badgeText}>🛡️ Premium Assurance ✨</Text>
          </View>

          <Text style={[styles.heroTitle, { fontSize: titleFontSize + 4 }]}>
            <Text style={styles.gradientText}>Return Policy</Text>
          </Text>
          <Text style={[styles.heroSubtitle, { fontSize: titleFontSize - 4 }]}>
            Premium African Standards
          </Text>

          <Text style={[styles.heroDescription, { fontSize: bodyFontSize }]}>
            We stand behind every authentic African product we sell. Our premium
            return policy ensures your complete satisfaction and peace of mind.
          </Text>

          {/* Benefits Grid */}
          <View style={styles.benefitsGrid}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitCard}>
                <Text style={styles.benefitIcon}>{benefit.icon}</Text>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>
                  {benefit.description}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Policy Sections */}
        <View style={styles.sectionsContainer}>
          {policySections.map((section, index) => (
            <View key={index} style={styles.policySection}>
              {/* Section Header */}
              <LinearGradient
                colors={section.color}
                style={styles.sectionHeader}
              >
                <View style={styles.sectionHeaderContent}>
                  <View style={styles.sectionIcon}>
                    <Text style={styles.iconText}>{section.icon}</Text>
                  </View>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { fontSize: subtitleFontSize },
                    ]}
                  >
                    {section.title}
                  </Text>
                </View>
              </LinearGradient>

              {/* Section Content */}
              <View style={styles.sectionContent}>
                {section.steps ? (
                  <View style={styles.stepsList}>
                    {section.steps.map((step, stepIndex) => (
                      <View key={stepIndex} style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>
                            {stepIndex + 1}
                          </Text>
                        </View>
                        <Text
                          style={[styles.stepText, { fontSize: bodyFontSize }]}
                        >
                          {step}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.itemsList}>
                    {section.items.map((item, itemIndex) => (
                      <View key={itemIndex} style={styles.listItem}>
                        <View style={styles.bulletPoint}>
                          <Text style={styles.bulletText}>🌿</Text>
                        </View>
                        <Text
                          style={[styles.itemText, { fontSize: bodyFontSize }]}
                        >
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {section.note && (
                  <View style={styles.noteContainer}>
                    <Text
                      style={[styles.noteText, { fontSize: bodyFontSize - 1 }]}
                    >
                      {section.note}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Premium Quality Guarantee */}
        <LinearGradient
          colors={["#1f2937", "#374151"]}
          style={styles.guaranteeSection}
        >
          <View style={styles.guaranteeContent}>
            <View style={styles.guaranteeHeader}>
              <View style={styles.guaranteeIcon}>
                <Text style={styles.guaranteeIconText}>🏆</Text>
              </View>
              <View style={styles.guaranteeInfo}>
                <Text
                  style={[
                    styles.guaranteeTitle,
                    { fontSize: subtitleFontSize },
                  ]}
                >
                  Premium African Quality Guarantee
                </Text>
                <Text
                  style={[
                    styles.guaranteeSubtitle,
                    { fontSize: bodyFontSize - 2 },
                  ]}
                >
                  Every product meets our stringent quality standards
                </Text>
              </View>
            </View>
            <View style={styles.guaranteeStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>98%</Text>
                <Text style={styles.statLabel}>Satisfaction Rate</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>24H</Text>
                <Text style={styles.statLabel}>Response Time</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={[styles.faqTitle, { fontSize: titleFontSize }]}>
            Frequently Asked Questions
          </Text>
          <View style={styles.faqList}>
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <View style={styles.questionContainer}>
                  <View style={styles.questionIcon}>
                    <Text style={styles.questionIconText}>Q</Text>
                  </View>
                  <Text
                    style={[styles.questionText, { fontSize: bodyFontSize }]}
                  >
                    {faq.q}
                  </Text>
                </View>
                <Text
                  style={[styles.answerText, { fontSize: bodyFontSize - 1 }]}
                >
                  {faq.a}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={[styles.ctaTitle, { fontSize: subtitleFontSize }]}>
            Need Help With a Return?
          </Text>
          <Text style={[styles.ctaDescription, { fontSize: bodyFontSize }]}>
            Our premium customer support team is here to assist you 24/7 with
            any return or exchange inquiries.
          </Text>
          <View style={styles.ctaButtons}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text
                style={[styles.primaryButtonText, { fontSize: bodyFontSize }]}
              >
                Start a Return →
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text
                style={[styles.secondaryButtonText, { fontSize: bodyFontSize }]}
              >
                Contact Support
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustBadges}>
          {trustBadges.map((badge, index) => (
            <View
              key={index}
              style={[styles.trustBadge, { borderColor: badge.color + "40" }]}
            >
              <Text style={[styles.trustBadgeValue, { color: badge.color }]}>
                {badge.value}
              </Text>
              <Text style={styles.trustBadgeLabel}>{badge.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReturnPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: "center",
  },
  premiumBadge: {
    backgroundColor: "rgba(217, 119, 6, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.5)",
    marginBottom: 20,
  },
  badgeText: {
    color: "#fbbf24",
    fontSize: 14,
    fontWeight: "600",
  },
  heroTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  gradientText: {
    color: "#fbbf24",
  },
  heroSubtitle: {
    color: "#ffffff",
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  heroDescription: {
    color: "#d1d5db",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  benefitCard: {
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    borderRadius: 16,
    padding: 16,
    width: "48%",
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  benefitIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  benefitTitle: {
    color: "#fbbf24",
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 14,
  },
  benefitDescription: {
    color: "#d1d5db",
    fontSize: 12,
    textAlign: "center",
  },
  sectionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  policySection: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  sectionHeader: {
    padding: 20,
  },
  sectionHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  iconText: {
    fontSize: 20,
  },
  sectionTitle: {
    color: "#ffffff",
    fontWeight: "bold",
    flex: 1,
  },
  sectionContent: {
    padding: 20,
  },
  stepsList: {
    marginTop: 10,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(217, 119, 6, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: "#fbbf24",
    fontWeight: "bold",
    fontSize: 14,
  },
  stepText: {
    color: "#d1d5db",
    flex: 1,
    lineHeight: 22,
  },
  itemsList: {
    marginTop: 10,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  bulletPoint: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 12,
  },
  itemText: {
    color: "#d1d5db",
    flex: 1,
    lineHeight: 22,
  },
  noteContainer: {
    marginTop: 20,
    backgroundColor: "rgba(217, 119, 6, 0.2)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  noteText: {
    color: "#fbbf24",
    textAlign: "center",
    fontWeight: "600",
  },
  guaranteeSection: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  guaranteeContent: {
    flexDirection: "column",
  },
  guaranteeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  guaranteeIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "rgba(217, 119, 6, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  guaranteeIconText: {
    fontSize: 28,
  },
  guaranteeInfo: {
    flex: 1,
  },
  guaranteeTitle: {
    color: "#ffffff",
    fontWeight: "bold",
    marginBottom: 4,
  },
  guaranteeSubtitle: {
    color: "rgba(251, 191, 36, 0.7)",
  },
  guaranteeStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fbbf24",
  },
  statLabel: {
    color: "rgba(251, 191, 36, 0.8)",
    fontSize: 12,
    marginTop: 4,
  },
  faqSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  faqTitle: {
    color: "#fbbf24",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  faqList: {
    gap: 16,
  },
  faqItem: {
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  questionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  questionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(217, 119, 6, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  questionIconText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  questionText: {
    color: "#ffffff",
    fontWeight: "bold",
    flex: 1,
  },
  answerText: {
    color: "#d1d5db",
    lineHeight: 20,
    paddingLeft: 36,
  },
  ctaSection: {
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.3)",
  },
  ctaTitle: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  ctaDescription: {
    color: "#d1d5db",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  ctaButtons: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "rgba(217, 119, 6, 0.9)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: "rgba(245, 158, 11, 0.5)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#f59e0b",
    fontWeight: "bold",
  },
  trustBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  trustBadge: {
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    borderRadius: 16,
    padding: 20,
    width: "48%",
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  trustBadgeValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  trustBadgeLabel: {
    color: "#d1d5db",
    fontSize: 12,
    textAlign: "center",
  },
});
