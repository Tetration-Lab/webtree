import { STATS } from "@/constants/stats";
import { seedToChoices } from "@/utils/seed";
import {
  Box,
  Button,
  Card,
  Circle,
  CircularProgress,
  HStack,
  Heading,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import _ from "lodash";
import { generatePrivateKey } from "viem/accounts";
import Lottie from "react-lottie-player";
import { createRef, useCallback, useMemo, useState } from "react";
import { Stat, statByIndex } from "@/interfaces/stats";
import TinderCard from "react-tinder-card";
import { useChainId } from "wagmi";
import { Story } from "@/interfaces/story";
import { useQuery } from "@tanstack/react-query";

export const Game = () => {
  const chainId = useChainId();
  const toast = useToast({
    position: "top",
    duration: 5000,
  });

  const [randomness, setRandomness] = useState(generatePrivateKey());

  const { data: cards, isLoading } = useQuery<
    (Story & ReturnType<typeof seedToChoices>[number])[]
  >({
    queryKey: ["choices", randomness],
    queryFn: async () => {
      const response = await fetch(
        `/api/choice?seed=${randomness}&chainId=${chainId}`,
        {
          cache: "force-cache",
        }
      );
      const result: Story[] = await response.json();
      const choices = seedToChoices(randomness);
      return result.map((story, i) => ({
        ...story,
        ...choices[i],
      }));
    },
    cacheTime: 100000,
  });
  const refs = useMemo(
    () => _.range(cards?.length ?? 0).map(() => createRef<HTMLDivElement>()),
    [cards]
  );

  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const [stats, setStats] = useState(_.mapValues(STATS, () => 50));

  const random = () => {
    setRandomness(generatePrivateKey());
    setCurrentCardIndex(0);
  };

  const onSwipe = useCallback(
    (isYes: boolean) => {
      if (cards) {
        const card = cards[currentCardIndex];
        const newStats = { ...stats };
        card.stats.forEach((value, statIndex) => {
          newStats[statByIndex(statIndex)] += value * (isYes ? 1 : -1);
        });
        setStats(newStats);
        setSwiped(true);
        toast.closeAll();
        toast({
          title: card.title,
          description: isYes ? card.yes : card.no,
        });
        setTimeout(() => {
          setSwiped(false);
          setCurrentCardIndex((i) => i + 1);
        }, 1000);
      }
    },
    [cards, currentCardIndex]
  );
  const [swiped, setSwiped] = useState(false);

  return (
    <>
      <HStack>
        {_.entries(STATS).map(([key, stat], i) => {
          const percent = _.clamp(stats[key as Stat], 0, 100);
          const current = cards?.[currentCardIndex]?.stats?.[i] ?? 0;
          return (
            <Stack key={key} align="center">
              <Stack h="100px" justify="end" pos="relative">
                <Box
                  rounded="full"
                  bg="chakra-body-text"
                  w="8px"
                  h="100%"
                  pos="absolute"
                  opacity={0.2}
                />
                <Box
                  rounded="full"
                  bg="chakra-body-text"
                  w="8px"
                  h={`${percent}%`}
                  transition="all 0.3s ease-in-out"
                />
              </Stack>
              <Box boxSize="48px">
                <Lottie path={stat.lottie} speed={0.3} loop play />
              </Box>
              <Text textAlign="center" as="b">
                {stat.name}
              </Text>
              {cards && currentCardIndex < cards.length && (
                <Circle
                  size="12px"
                  bg={
                    swiped
                      ? current > 0
                        ? "green.400"
                        : current < 0
                        ? "red.400"
                        : "chakra-body-text"
                      : "chakra-body-text"
                  }
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
      <Stack minH="400px" pos="relative" justify="center">
        {!cards || isLoading ? (
          <Stack align="center">
            <Box boxSize="64px">
              <Lottie path="/icons/search.json" loop play />
            </Box>
            <Text>Something unexpected is brewing.</Text>
          </Stack>
        ) : (
          <>
            <Text>
              {currentCardIndex >= cards.length ? (
                "Empty"
              ) : (
                <>
                  {currentCardIndex + 1} / {cards.length}
                </>
              )}
            </Text>
            {currentCardIndex <= cards.length && (
              <>
                <Stack pos="relative" h="400px">
                  <Heading
                    pos="absolute"
                    left="200px"
                    top="50%"
                    transform="translateY(-100%)"
                  >
                    Yes
                  </Heading>
                  <Heading
                    pos="absolute"
                    right="200px"
                    top="50%"
                    transform="translateY(-100%)"
                  >
                    No
                  </Heading>
                  {_.reverse(cards).map((card, _i) => {
                    const i = cards.length - _i - 1;
                    return (
                      <TinderCard
                        key={`${randomness}${i}`}
                        swipeRequirementType="velocity"
                        preventSwipe={["up", "down"]}
                        onSwipe={(dir) => onSwipe(dir === "right")}
                      >
                        <Card
                          ref={refs[i]}
                          userSelect="none"
                          pointerEvents={
                            i === currentCardIndex ? "auto" : "none"
                          }
                          transition="all 0.3s ease-in-out"
                          pos="absolute"
                          zIndex={cards.length - i}
                          top={0}
                          left="50%"
                          transform="translateX(-50%)"
                          h="350px"
                          aspectRatio={1 / 1.5}
                          overflowY="auto"
                          border="1.5px solid"
                          borderColor="chakra-body-text"
                        >
                          <Heading>{card.title}</Heading>
                          <Text>{card.description}</Text>
                        </Card>
                      </TinderCard>
                    );
                  })}
                </Stack>
              </>
            )}
          </>
        )}
      </Stack>
      <Button onClick={random}>Random</Button>
    </>
  );
};
