import {
  Card,
  HStack,
  Heading,
  Icon,
  IconButton,
  Modal,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
  chakra,
  useToast,
} from "@chakra-ui/react";
import { SwipableCard } from "../Game/SwipableCard";
import { useCallback, useEffect, useState } from "react";
import { TUTORIAL } from "@/constants/tutorial";
import _ from "lodash";
import { FaX } from "react-icons/fa6";
import { MotionBox } from "../MotionBox";

export const TutorialModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const toast = useToast({
    position: "top",
    duration: 5000,
    render: ({ title, description, id, onClose }) => (
      <Card as={Stack} key={id} maxW="xl">
        <HStack justify="space-between">
          <Heading fontSize="lg">{title}</Heading>
          <IconButton
            icon={<Icon as={FaX} />}
            aria-label="close"
            onClick={onClose}
            variant="outline"
            size="xs"
          />
        </HStack>
        <Text>{description}</Text>
      </Card>
    ),
  });

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const onSwipe = useCallback(
    (isYes: boolean) => {
      const card = TUTORIAL[currentCardIndex];
      toast.closeAll();
      toast({
        title: card.title,
        description: isYes ? card.yes : card.no,
      });
      setTimeout(() => {
        setCurrentCardIndex((i) => i + 1);
      }, 1000);
    },
    [TUTORIAL, currentCardIndex]
  );
  const [showDruid, setShowDruid] = useState<boolean>(false);
  useEffect(() => {
    if (currentCardIndex === TUTORIAL.length - 1) setShowDruid(true);
    if (currentCardIndex >= TUTORIAL.length) {
      onClose();
    }
  }, [currentCardIndex]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay backdropFilter="blur(6px)" />
      <ModalContent
        bg="transparent"
        shadow="none"
        as={Stack}
        align="center"
        pos="relative"
      >
        <MotionBox
          pos="absolute"
          h="500px"
          w="100%"
          initial={{
            left: "150%",
          }}
          animate={{
            left: showDruid ? "110%" : "1000%",
            transform: showDruid ? "rotate(-30deg)" : "rotate(0deg)",
          }}
          bgImg="/images/druid.png"
          bgSize="cover"
        />
        <HStack justify="center">
          <Heading>Tutorial</Heading>
        </HStack>
        <Stack textAlign="center">
          <Text>You can swipe left or right to answer the question.</Text>
          <Text>
            Swipe left for <chakra.span as="b">"No"</chakra.span> and right for
            <chakra.span as="b">"Yes"</chakra.span>.
          </Text>
        </Stack>
        <Text>
          {currentCardIndex + 1}/{TUTORIAL.length}
        </Text>
        <Stack align="center" h="400px" pos="relative">
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
          {TUTORIAL.slice(0)
            .reverse()
            .map((card, _i) => {
              const i = TUTORIAL.length - _i - 1;

              return (
                <SwipableCard
                  key={`${card.title}${i}`}
                  card={card}
                  onSwipe={onSwipe}
                  pointerEvents={i === currentCardIndex ? "auto" : "none"}
                  zIndex={TUTORIAL.length - i}
                />
              );
            })}
        </Stack>
      </ModalContent>
    </Modal>
  );
};
