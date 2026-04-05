import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosClient from "../api";

/**
 * AI Chat Service - Intelligent Chatbot with Learning Capability
 * Works offline with local AI + learns from conversations
 * Falls back to backend if available
 */

class AIChatService {
  constructor() {
    this.conversationHistory = [];
    this.isLoading = false;
    this.knowledgeBase = {};
    this.userProfiles = {};
    this.learnedPatterns = {};
  }

  /**
   * Initialize the AI service - load stored data
   */
  async initialize(userId) {
    try {
      // Load knowledge base
      const kb = await AsyncStorage.getItem("nile_knowledge_base");
      this.knowledgeBase = kb
        ? JSON.parse(kb)
        : this._getDefaultKnowledgeBase();

      // Load learned patterns
      const patterns = await AsyncStorage.getItem("nile_learned_patterns");
      this.learnedPatterns = patterns ? JSON.parse(patterns) : {};

      // Load user profile
      const userProfile = await AsyncStorage.getItem(`nile_user_${userId}`);
      this.userProfiles[userId] = userProfile
        ? JSON.parse(userProfile)
        : {
            userId,
            createdAt: new Date().toISOString(),
            conversationCount: 0,
            preferences: {},
            history: [],
          };
    } catch (error) {
      console.log("Error initializing AI service:", error);
      this.knowledgeBase = this._getDefaultKnowledgeBase();
    }
  }

  /**
   * Default knowledge base for e-commerce
   */
  _getDefaultKnowledgeBase() {
    return {
      greetings: [
        "Hello! How can I help you today?",
        "Hi there! What can I assist you with?",
        "Welcome! What do you need help with?",
      ],
      products: {
        keywords: [
          "product",
          "items",
          "catalog",
          "shopping",
          "buy",
          "purchase",
        ],
        responses: [
          "We have a wide variety of products available. Would you like to search for something specific?",
          "I can help you find the perfect product. What are you looking for?",
          "Browse our catalog by category or search for items you're interested in.",
        ],
      },
      orders: {
        keywords: ["order", "tracking", "track", "status", "delivery"],
        responses: [
          "I can help you track your order. Please provide your order number.",
          "To track your order, you can go to Orders section and view the status.",
          "Your order details are available in your account under Orders.",
        ],
      },
      payments: {
        keywords: ["payment", "pay", "price", "cost", "bill", "checkout"],
        responses: [
          "We accept multiple payment methods for your convenience.",
          "You can add your payment method during checkout.",
          "Payment is secure and encrypted for your safety.",
        ],
      },
      shipping: {
        keywords: [
          "shipping",
          "delivery",
          "address",
          "location",
          "where",
          "arrive",
        ],
        responses: [
          "We offer fast and reliable shipping to your location.",
          "Delivery typically takes 3-7 business days.",
          "You can add or change your delivery address during checkout.",
        ],
      },
      returns: {
        keywords: ["return", "exchange", "refund", "policy", "back"],
        responses: [
          "We offer hassle-free returns within 30 days.",
          "To return an item, visit the Return & Exchange section.",
          "Your refund will be processed within 5-7 business days.",
        ],
      },
      help: {
        keywords: ["help", "support", "issue", "problem", "error"],
        responses: [
          "I'm here to help! Can you describe what you need assistance with?",
          "What specific issue are you experiencing?",
          "Let me know how I can make your experience better.",
        ],
      },
    };
  }

  /**
   * Send a message and get intelligent response
   * @param {string} message - User's message
   * @param {string} userId - User ID for tracking
   * @returns {Promise<string>} - AI response
   */
  async sendMessage(message, userId) {
    if (!message.trim()) {
      throw new Error("Message cannot be empty");
    }

    this.isLoading = true;

    try {
      // Initialize if needed
      if (!this.userProfiles[userId]) {
        await this.initialize(userId);
      }

      // Add to conversation history
      this.conversationHistory.push({
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });

      // Try backend first (if available)
      let response = null;
      try {
        const backendResponse = await axiosClient.post(
          "/api/nilemart/questions/askedquestions",
          {
            userId,
            question: message,
            conversationHistory: this.conversationHistory,
          },
        );
        response = backendResponse.data.answer;
      } catch (backendError) {
        console.log("Backend unavailable, using local AI");
      }

      // Fall back to local AI if backend fails
      if (!response) {
        response = this._generateLocalResponse(message, userId);
      }

      // Learn from this interaction
      this._learnFromInteraction(message, response, userId);

      // Add assistant response
      this.conversationHistory.push({
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      });

      // Save user data
      await this._saveUserData(userId);

      return response;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      // Even if everything fails, provide a fallback response
      const fallbackResponse =
        "I'm learning! Can you tell me more about what you need?";
      this.conversationHistory.push({
        role: "assistant",
        content: fallbackResponse,
        timestamp: new Date().toISOString(),
      });
      return fallbackResponse;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Generate response using local AI
   */
  _generateLocalResponse(message, userId) {
    const lowerMsg = message.toLowerCase();

    // Check for learned patterns first
    const learnedResponse = this._checkLearnedPatterns(lowerMsg);
    if (learnedResponse) {
      return learnedResponse;
    }

    // Check for greeting
    if (this._isGreeting(lowerMsg)) {
      return this._getRandomResponse(this.knowledgeBase.greetings);
    }

    // Check for question type using keywords
    for (const [category, data] of Object.entries(this.knowledgeBase)) {
      if (category === "greetings") continue;

      if (
        data.keywords &&
        data.keywords.some((keyword) => lowerMsg.includes(keyword))
      ) {
        return this._getRandomResponse(data.responses);
      }
    }

    // Context-aware response based on conversation
    if (this.conversationHistory.length > 2) {
      return this._generateContextAwareResponse(message);
    }

    // Default intelligent response
    const responses = [
      `That's interesting! Can you tell me more about ${this._extractKeyword(message)}?`,
      `I'm learning about ${this._extractKeyword(message)}. How can I help?`,
      `I understand you're interested in ${this._extractKeyword(message)}. What specifically would you like to know?`,
      `I'll remember that you mentioned ${this._extractKeyword(message)}. How can I assist?`,
    ];

    return this._getRandomResponse(responses);
  }

  /**
   * Learn from interactions and improve
   */
  _learnFromInteraction(userMessage, response, userId) {
    const key = userMessage.toLowerCase().trim();

    // Store user-response pairing for future learning
    if (!this.learnedPatterns[key]) {
      this.learnedPatterns[key] = {
        response,
        frequency: 1,
        lastUsed: new Date().toISOString(),
        userId,
      };
    } else {
      this.learnedPatterns[key].frequency += 1;
      this.learnedPatterns[key].lastUsed = new Date().toISOString();
    }

    // Update user profile
    if (this.userProfiles[userId]) {
      this.userProfiles[userId].conversationCount += 1;
      this.userProfiles[userId].history.push({
        message: userMessage,
        response,
        timestamp: new Date().toISOString(),
      });
    }

    // Save learned patterns periodically
    if (Object.keys(this.learnedPatterns).length % 5 === 0) {
      this._saveLearning();
    }
  }

  /**
   * Check if message matches learned patterns
   */
  _checkLearnedPatterns(lowerMsg) {
    // Find similar patterns
    for (const [pattern, data] of Object.entries(this.learnedPatterns)) {
      if (this._calculateSimilarity(lowerMsg, pattern) > 0.7) {
        return data.response;
      }
    }
    return null;
  }

  /**
   * Simple similarity calculation
   */
  _calculateSimilarity(str1, str2) {
    const words1 = new Set(str1.split(" "));
    const words2 = new Set(str2.split(" "));
    const common = [...words1].filter((word) => words2.has(word)).length;
    return common / Math.max(words1.size, words2.size);
  }

  /**
   * Generate context-aware response
   */
  _generateContextAwareResponse(message) {
    const recentMessages = this.conversationHistory.slice(-4);
    const context = recentMessages.map((m) => m.content).join(" ");

    const responses = [
      `Based on our conversation, I think you're looking for help with that. Let me assist you.`,
      `I see where this is going. Here's what I can help with.`,
      `Following up on what you mentioned, I'd suggest considering customer service for more details.`,
      `That's related to what we discussed. Here's my suggestion.`,
    ];

    return this._getRandomResponse(responses);
  }

  /**
   * Extract main keyword from message
   */
  _extractKeyword(message) {
    const words = message.split(" ");
    return words.length > 0 ? words[words.length - 1] : "that";
  }

  /**
   * Check if message is a greeting
   */
  _isGreeting(lowerMsg) {
    const greetingWords = [
      "hi",
      "hello",
      "hey",
      "greetings",
      "howdy",
      "good",
      "what's up",
    ];
    return greetingWords.some((word) => lowerMsg.includes(word));
  }

  /**
   * Get random response from array
   */
  _getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Save user data to persistent storage
   */
  async _saveUserData(userId) {
    try {
      if (this.userProfiles[userId]) {
        await AsyncStorage.setItem(
          `nile_user_${userId}`,
          JSON.stringify(this.userProfiles[userId]),
        );
      }
    } catch (error) {
      console.log("Error saving user data:", error);
    }
  }

  /**
   * Save learning to persistent storage
   */
  async _saveLearning() {
    try {
      await AsyncStorage.setItem(
        "nile_learned_patterns",
        JSON.stringify(this.learnedPatterns),
      );
      await AsyncStorage.setItem(
        "nile_knowledge_base",
        JSON.stringify(this.knowledgeBase),
      );
    } catch (error) {
      console.log("Error saving learning:", error);
    }
  }

  /**
   * Get conversation history
   * @returns {Array} - Array of message objects
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Get suggested quick replies based on context
   * @returns {Array} - Array of suggested messages
   */
  getSuggestedReplies() {
    return [
      {
        label: "🔍 How to search?",
        message: "How do I search for products?",
      },
      {
        label: "💳 Payment options?",
        message: "What payment methods do you accept?",
      },
      {
        label: "📦 Track order?",
        message: "How do I track my order?",
      },
      {
        label: "🔄 Returns/Exchange?",
        message: "What's your return policy?",
      },
      {
        label: "⏰ Delivery time?",
        message: "How long does delivery take?",
      },
      {
        label: "🎁 Discounts?",
        message: "Are there any ongoing promotions or discounts?",
      },
    ];
  }

  /**
   * Check if chat service is loading
   * @returns {boolean}
   */
  getIsLoading() {
    return this.isLoading;
  }
}

// Export singleton instance
export default new AIChatService();
