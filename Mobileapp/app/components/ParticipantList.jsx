// components/ParticipantList.js
import { FlatList, Text, View } from "react-native";

export default function ParticipantList({ participants }) {
  return (
    <View className="mt-4">
      <Text className="font-semibold">
        Participants ({participants.length})
      </Text>
      <FlatList
        data={participants}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Text>- {item}</Text>}
      />
    </View>
  );
}
