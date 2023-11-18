import { Card, HStack, Heading, Stack, Text } from "@chakra-ui/react";
import INFO from "../../constants/info.json";
import { useMemo, useState } from "react";
import _ from "lodash";
import TinderCard from "react-tinder-card";

export const Facts = () => {
  const [currentIndex, setCurrentIndex] = useState(
    _.random(0, INFO.length - 1)
  );

  const facts = useMemo(() => {
    // return current fact, previous fact, and next fact
    const nextIndex = currentIndex === INFO.length - 1 ? 0 : currentIndex + 1;
    return [INFO[currentIndex], INFO[nextIndex]];
  }, [currentIndex]);
  const [swiped, setSwiped] = useState(false);

  const onSwiped = () => {
    setSwiped(true);
    setTimeout(() => {
      setSwiped(false);
      setCurrentIndex((e) => (e + 1) % INFO.length);
    }, 500);
  };

  return (
    <Stack pos="relative" h="100px">
      {_.reverse(facts).map((fact, _i) => {
        const i = _i === 0 ? 1 : 0;
        return (
          <TinderCard onSwipe={() => onSwiped()} key={fact.topic}>
            <Card
              as={Stack}
              w="sm"
              position="absolute"
              top={0}
              left="50%"
              pointerEvents={i === 0 ? "auto" : "none"}
              opacity={i === 0 ? 1 : swiped && i === 1 ? 1 : 0}
              transition="opacity 0.5s ease-in-out"
              transform="translateX(-50%)"
              userSelect="none"
            >
              <HStack justify="center">
                <Heading fontSize="lg">{fact.topic}</Heading>
              </HStack>
              <Text>{fact.info}</Text>
            </Card>
          </TinderCard>
        );
      })}
    </Stack>
  );
};
