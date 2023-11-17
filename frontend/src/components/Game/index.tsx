import { STATS } from "@/constants/stats";
import { seedToChoices } from "@/utils/seed";
import {
  Box,
  Button,
  Card,
  Circle,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import _ from "lodash";
import { generatePrivateKey } from "viem/accounts";
import Lottie from "react-lottie-player";
import { createRef, useCallback, useMemo, useState } from "react";
import { Stat, statByIndex } from "@/interfaces/stats";
import TinderCard from "react-tinder-card";

export const Game = () => {
  const [randomness, setRandomness] = useState(generatePrivateKey());

  const cards = useMemo(() => seedToChoices(randomness), [randomness]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const [stats, setStats] = useState(_.mapValues(STATS, () => 50));

  const refs = useMemo(
    () =>
      _.range(cards.length).map(() =>
        createRef<{ restoreCard: () => Promise<void> }>()
      ),
    [cards]
  );

  const random = () => {
    setRandomness(generatePrivateKey());
    setCurrentCardIndex(0);
  };

  const onSwipe = useCallback(
    (isYes: boolean) => {
      const card = cards[currentCardIndex];
      const newStats = { ...stats };
      card.stats.forEach((value, statIndex) => {
        newStats[statByIndex(statIndex)] += value * (isYes ? 1 : -1);
      });
      setStats(newStats);
      setCurrentCardIndex((i) => i + 1);
    },
    [cards, currentCardIndex]
  );

  return (
    <>
      <HStack>
        {_.entries(STATS).map(([key, stat]) => {
          const percent = _.clamp(stats[key as Stat], 0, 100);
          return (
            <Stack key={key} align="center">
              <Box boxSize="120px" pos="relative">
                <Lottie
                  path={stat.lottie}
                  speed={0.3}
                  loop
                  play
                  goTo={1}
                  style={{
                    position: "absolute",
                    clipPath: `inset(${percent}% 0 0 0)`,
                    transition: "all 0.3s ease-in-out",
                  }}
                />
                <Lottie
                  path={stat.lottie}
                  speed={0.3}
                  loop
                  play
                  goTo={1}
                  style={{
                    opacity: 0.3,
                  }}
                />
              </Box>
              <Text textAlign="center" as="b">
                {stat.name}
              </Text>
              {currentCardIndex < cards.length && (
                <Circle
                  size="14px"
                  bg="primary.500"
                  opacity={
                    cards[currentCardIndex].minus.includes(key as Stat) ||
                    cards[currentCardIndex].plus.includes(key as Stat)
                      ? 1
                      : 0
                  }
                  transition="all 0.3s ease-in-out"
                />
              )}
            </Stack>
          );
        })}
      </HStack>
      <Text>
        {currentCardIndex} / {cards.length}
      </Text>
      {currentCardIndex <= cards.length &&
        cards.map((_card, i) => (
          <TinderCard
            key={i}
            ref={refs[i] as any}
            swipeRequirementType="velocity"
            preventSwipe={["up", "down"]}
            onSwipe={(dir) => onSwipe(dir === "right")}
          >
            <Card
              as={Stack}
              userSelect="none"
              opacity={i === currentCardIndex ? 1 : 0}
              display={i === currentCardIndex ? "block" : "none"}
              transition="all 0.3s ease-in-out"
            >
              <Text>
                Card {currentCardIndex} of {randomness}
              </Text>
            </Card>
          </TinderCard>
        ))}
      <Button
        onClick={() => refs[currentCardIndex - 1]?.current?.restoreCard()}
      >
        Restore
      </Button>
      <Button onClick={random}>Random</Button>
    </>
  );
};
