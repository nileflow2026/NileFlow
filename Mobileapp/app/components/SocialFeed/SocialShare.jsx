import { Share } from "react-native";

import { useSocial } from "../../../Context/SocialContext";

/**
 * SocialShare - Handles sharing content with Nile Mart branding
 * Generates sharable content and earns Miles for users
 */
export default function SocialShare({ item, onShare }) {
  const { earnMiles } = useSocial();

  const shareContent = async () => {
    try {
      const shareText = generateShareText(item);
      const result = await Share.share({
        message: shareText,
        url: generateShareUrl(item),
        title: "Check this out on Nile Mart!",
      });

      if (result.action === Share.sharedAction) {
        // Content was shared successfully
        const milesEarned = earnMiles("SHARE");
        onShare?.(item, milesEarned);

        console.log(`Shared successfully! Earned ${milesEarned} Nile Miles`);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const generateShareText = (item) => {
    const captions = [
      `Found this on Nile Mart 👀 ${item.caption}`,
      `Students are loving this! ${item.caption} #NileMart`,
      `This is trending on campus 🔥 ${item.caption}`,
      `Just discovered this on Nile Mart! ${item.caption}`,
    ];

    // Pick a random caption style
    const randomCaption = captions[Math.floor(Math.random() * captions.length)];

    if (item.product) {
      return `${randomCaption}\n💰 Only $${item.product.price}!\n\nGet the app: nilemart://`;
    }

    return `${randomCaption}\n\nJoin Nile Mart: nilemart://`;
  };

  const generateShareUrl = (item) => {
    // Deep link to the specific content via app scheme
    return `nilemart://post/${item.id}`;
  };

  return shareContent;
}

/**
 * Social sharing utilities for different platforms
 */
export const SocialShareUtils = {
  // Platform-specific sharing formats
  instagram: (item) => ({
    text: `Found this on Nile Mart 👀`,
    hashtags: ["NileMart", "StudentLife", "Campus", "Shopping"],
  }),

  tiktok: (item) => ({
    text: `Students are buying this! #NileMart #StudentHacks`,
  }),

  snapchat: (item) => ({
    text: `This is trending on campus 🔥`,
  }),

  twitter: (item) => ({
    text: `Just found this on @NileMart 👀 ${item.caption}`,
    hashtags: ["NileMart", "StudentLife"],
    url: `https://nilemart.app/share/${item.id}`,
  }),
};
