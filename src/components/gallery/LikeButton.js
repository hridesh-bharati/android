// src/components/gallery/LikeButton.js
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const REACTIONS = [
  { name: "Like", icon: "👍", color: "#2078f4" },
  { name: "Love", icon: "❤️", color: "#f33e58" },
  { name: "Care", icon: "🥰", color: "#f7b125" },
];

export default function LikeButton({ isLiked, onClick, userReaction = null }) {
  const [showPanel, setShowPanel] = useState(false);
  const activeReaction = REACTIONS.find((r) => r.name === userReaction);

  return (
    <View style={{ position: 'relative' }}>
      {showPanel && (
        <View style={styles.panel}>
          {REACTIONS.map((r) => (
            <TouchableOpacity key={r.name} onPress={() => { onClick(r.name); setShowPanel(false); }} style={styles.reactionIcon}>
              <Text style={{ fontSize: 18 }}>{r.icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => !showPanel && onClick(activeReaction ? null : "Like")}
        onLongPress={() => setShowPanel(true)}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: 15 }}>{activeReaction ? activeReaction.icon : "👍"}</Text>
        <Text style={[styles.text, activeReaction && { color: activeReaction.color }]}>
          {activeReaction ? activeReaction.name : "Like"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { position: 'absolute', bottom: 40, left: 0, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 4, borderWidth: 1, borderColor: '#e2e8f0', elevation: 5, gap: 4 },
  reactionIcon: { padding: 4 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10 },
  text: { fontSize: 11, fontWeight: '800', color: '#64748b' }
});