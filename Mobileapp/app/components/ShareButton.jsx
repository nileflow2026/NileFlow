// components/ShareButton.js
import { Button, Share } from "react-native";

export default function ShareButton({ orderId }) {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my group order on Nile Mart!\nnilemart://group-order/${orderId}`,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  return <Button title="Share & Save" onPress={handleShare} />;
}
