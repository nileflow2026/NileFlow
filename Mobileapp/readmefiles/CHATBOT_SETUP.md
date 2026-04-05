# 🤖 Nile AI Chatbot Implementation Guide

## Overview

A fully functional AI-powered chatbot has been integrated into your NileFlow app, providing users with instant support and assistance directly from the home screen.

## Features Implemented

### 1. **AI Chat Service** (`utils/aiChatService.js`)

- Singleton service managing all AI conversations
- Backend integration for AI responses
- Conversation history tracking
- Suggested replies generation
- Error handling and fallback messages

### 2. **Enhanced Chat Component** (`app/components/AIChat.jsx`)

- Beautiful floating chat widget
- Smooth animations and transitions
- Dark/Light theme support
- Message bubbles with user/assistant distinction
- Loading indicators
- Speech synthesis (text-to-speech)
- Message actions (listen, copy)
- Suggested quick replies on startup
- Responsive design for various screen sizes

### 3. **Home Screen Integration** (`app/(Screens)/Home.jsx`)

- AIChat component displayed as floating action button
- Always accessible from the home screen
- Positioned at bottom-right corner
- Functional icon that opens/closes the chat

## How to Use

### For Users

1. **Open Chat**: Tap the 🤖 "Chat" floating button at the bottom-right of the home screen
2. **Ask Questions**: Type your question or select from suggested replies
3. **Get Responses**: The AI assistant responds to your queries instantly
4. **Listen**: Tap 🔊 to hear responses read aloud
5. **Close Chat**: Tap the ✕ button or click the chat icon again

### For Developers

#### Sending a Message Programmatically

```javascript
import aiChatService from "../../utils/aiChatService";

const response = await aiChatService.sendMessage(
  "Your question here",
  userId,
  "App context",
);
```

#### Getting Conversation History

```javascript
const history = aiChatService.getHistory();
```

#### Clearing History

```javascript
aiChatService.clearHistory();
```

#### Getting Suggested Replies

```javascript
const suggestions = aiChatService.getSuggestedReplies();
```

## Available Features

### Suggested Quick Replies

- 🔍 How to search?
- 💳 Payment options?
- 📦 Track order?
- 🔄 Returns/Exchange?
- ⏰ Delivery time?
- 🎁 Discounts?

### Accessibility Features

- Text-to-speech integration
- High contrast theme support
- Dark/Light mode compatibility
- Large touch targets
- Keyboard navigation support

### Technical Features

- Message persistence in conversation history
- Error handling and user-friendly error messages
- Loading states with visual feedback
- Automatic message scrolling
- Responsive layout on different screen sizes
- Proper keyboard handling (iOS/Android)

## Backend Integration

The chatbot requires the following backend endpoint:

```
POST /api/nilemart/questions/askedquestions
```

### Request Format

```javascript
{
  "userId": "user_id_string",
  "question": "user's question text",
  "conversationHistory": [{role, content, timestamp}, ...],
  "context": "app context description"
}
```

### Expected Response

```javascript
{
  "answer": "AI response text",
  "success": true
}
```

## Customization

### Change Chat Icon

Edit `app/components/AIChat.jsx` - FAB icon property:

```javascript
icon={open ? "close" : "your-icon-name"}
```

### Change Chat Colors

Modify the color constants in `AIChat.jsx`:

- Primary color: `#3b82f6` (blue)
- Dark primary: `#1e40af`
- Adjust in styles or use theme variables

### Change Position

Edit `styles.container` in `AIChat.jsx`:

```javascript
container: {
  bottom: 20,  // Distance from bottom
  right: 16,   // Distance from right
  width: 340,  // Chat window width
  height: 600, // Chat window height
}
```

### Change Suggested Replies

Edit `aiChatService.getSuggestedReplies()` method to customize questions offered to users.

## Dependencies Used

- **react-native-paper**: FAB and UI components
- **expo-speech**: Text-to-speech functionality
- **axios**: API communication
- **@react-native-async-storage**: Data persistence capability

## Testing the Chatbot

1. **Start the app**:

   ```bash
   npm start
   ```

2. **Open home screen** and look for the 🤖 button at bottom-right

3. **Test basic functionality**:
   - Click the button to open chat
   - Type a test message
   - Verify bot responds
   - Test suggested replies
   - Try the speak button

4. **Check console** for any errors:
   - Open development tools
   - Look for API call logs
   - Verify messages are being saved

## Troubleshooting

### Chat not opening

- Check if `AIChat` component is properly imported in Home.jsx
- Verify theme props are passed correctly

### Messages not sending

- Check backend endpoint is accessible
- Verify user object has `_id` or `userId` property
- Check API response format matches expected structure

### Speech not working

- Verify `expo-speech` is installed: `npm list expo-speech`
- Check platform support (may not work in browser/web)
- Grant microphone permissions on device

### Theme not applying

- Ensure `ThemeProvider` wraps the Home component
- Verify `useTheme()` hook is working
- Check dark/light mode settings

## Future Enhancements

1. **Message persistence** - Save chat history to device storage
2. **User preferences** - Remember user settings (muted audio, chat position)
3. **Media support** - Allow image/file uploads in chat
4. **Multi-language** - Integrate with i18n for chatbot responses
5. **Analytics** - Track popular questions and user interactions
6. **Advanced AI** - Integrate with OpenAI/Google Generative AI
7. **Context awareness** - Pass current screen/user state to AI

## File Structure

```
NileFlowApp/
├── utils/
│   └── aiChatService.js        (AI service logic)
├── app/
│   └── components/
│       └── AIChat.jsx          (Chat component)
│   └── (Screens)/
│       └── Home.jsx            (Integrated with chat)
└── api.js                      (API configuration)
```

## Support

For issues or questions about the chatbot implementation:

1. Check the troubleshooting section above
2. Verify all files are in correct locations
3. Check console logs for error messages
4. Ensure backend endpoint is running

---

**Built with enterprise-level code quality and best practices for production use.**
