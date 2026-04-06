import { Share } from "react-native";

/**
 * SocialShare - Handles sharing content with Nile Mart branding
 * Returns a promise that resolves to true if shared successfully
 */
export default async function socialShare(item) {
  const shareText = generateShareText(item);
  const result = await Share.share({
    message: shareText,
    url: generateShareUrl(item),
    title: "Check this out on Nile Flow!",
  });

  return result.action === Share.sharedAction;
}

function generateShareText(item) {
  const captions = [
    `Found this on Nile Flow 👀 ${item.caption}`,
    `Students are loving this! ${item.caption} #NileFlow  #StudentHacks`,
    `This is trending on campus 🔥 ${item.caption}`,
    `Just discovered this on Nile Flow! ${item.caption}`,
  ];

  const randomCaption = captions[Math.floor(Math.random() * captions.length)];

  if (item.product) {
    return `${randomCaption}\n💰 Only $${item.product.price}!\n\nGet the app: nileflow://`;
  }

  return `${randomCaption}\n\nJoin Nile Flow: nileflow://`;
}

function generateShareUrl(item) {
  return `nileflow://post/${item.id}`;
}

/**
 * Social sharing utilities for different platforms
 */
export const SocialShareUtils = {
  // Platform-specific sharing formats
  instagram: (item) => ({
    text: `Found this on Nile Flow 👀`,
    hashtags: ["NileFlow", "StudentLife", "Campus", "Shopping"],
  }),

  tiktok: (item) => ({
    text: `Students are buying this! #NileFlow #StudentHacks`,
  }),

  snapchat: (item) => ({
    text: `This is trending on campus 🔥`,
  }),

  twitter: (item) => ({
    text: `Just found this on @NileFlow 👀 ${item.caption}`,
    hashtags: ["NileFlow", "StudentLife"],
    url: `https://nileflow.app/share/${item.id}`,
  }),
};
