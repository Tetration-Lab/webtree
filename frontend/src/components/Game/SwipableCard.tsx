import { Story } from "@/interfaces/story";
import { Card, CardProps, Heading, Text } from "@chakra-ui/react";
import TinderCard from "react-tinder-card";

export const SwipableCard = ({
  card,
  onSwipe,
  ...props
}: {
  card: Story;
  onSwipe: (isYes: boolean) => void;
} & CardProps) => {
  return (
    <TinderCard
      swipeRequirementType="velocity"
      preventSwipe={["up", "down"]}
      onSwipe={(dir) => onSwipe(dir === "right")}
    >
      <Card
        userSelect="none"
        transition="all 0.3s ease-in-out"
        pos="absolute"
        top={0}
        left="50%"
        transform="translateX(-50%)"
        h="350px"
        aspectRatio={1 / 1.5}
        overflowY="auto"
        border="1.5px solid"
        borderColor="chakra-body-text"
        {...props}
      >
        <Heading>
          {card.emoji} {card.title}
        </Heading>
        <Text>{card.description}</Text>
      </Card>
    </TinderCard>
  );
};
