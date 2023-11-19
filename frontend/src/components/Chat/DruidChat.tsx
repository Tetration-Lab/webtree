import {
  Box,
  Card,
  HStack,
  Icon,
  IconButton,
  Img,
  Input,
  Stack,
  StackProps,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaMoneyBill } from "react-icons/fa6";

interface DruidChat {
  text: string;
}

export const DruidChat = ({
  toggleDonation,
  ...props
}: { toggleDonation: () => void } & StackProps) => {
  const [isThinking, setIsThinking] = useState(false);
  const [response, setResponse] = useState<string | null>("wassup");
  const { register, handleSubmit, reset } = useForm<DruidChat>();
  const onSubmit = async (data: DruidChat) => {
    try {
      setIsThinking(true);
      reset();
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      setResponse(await response.text());
    } catch (error) {
      setResponse(null);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <Stack pos="absolute" overflowY="hidden" {...props}>
      <Box transform="translate(20%, 20%)" pos="relative">
        <Img src="/images/druid.png" />
      </Box>
      {(response || isThinking) && (
        <Card
          position="absolute"
          top="100px"
          right={"5%"}
          maxW="xs"
          p={2}
          maxH="100px"
          overflowY="auto"
        >
          {isThinking ? <Text>...</Text> : <Text>{response}</Text>}
        </Card>
      )}
      <Card
        p={2}
        pos="absolute"
        bottom={0}
        right="10%"
        transform="translateY(10%)"
        roundedTop="xl"
        roundedBottom="none"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <HStack>
            <Input
              {...register("text")}
              placeholder="Chitchat with the druid!"
              border="none"
              bg="gray.600"
            />
            <IconButton
              icon={<Icon as={FaMoneyBill} />}
              aria-label="donate"
              onClick={toggleDonation}
            />
          </HStack>
        </form>
      </Card>
    </Stack>
  );
};
