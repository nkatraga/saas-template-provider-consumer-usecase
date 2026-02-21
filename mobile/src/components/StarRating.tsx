import { View, Pressable, StyleSheet } from "react-native";
import { Star } from "lucide-react-native";
import { colors, spacing } from "../lib/theme";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 20,
  interactive = false,
  onRate,
}: StarRatingProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starNum = i + 1;
        const filled = starNum <= rating;
        const star = (
          <Star
            key={i}
            size={size}
            color={filled ? "#f59e0b" : colors.border}
            fill={filled ? "#f59e0b" : "transparent"}
          />
        );
        if (interactive && onRate) {
          return (
            <Pressable key={i} onPress={() => onRate(starNum)} hitSlop={4}>
              {star}
            </Pressable>
          );
        }
        return star;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.xs,
  },
});
