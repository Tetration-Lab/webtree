import {
  Box,
  Card,
  Img,
  Input,
  Stack,
  StackProps,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface DruidChat {
  text: string;
}

export const DruidChat = ({ ...props }: StackProps) => {
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
      <Box transform="translate(-40%, 20%)" pos="relative">
        <Img src="/images/druid.png" />
      </Box>
      {(response || isThinking) && (
        <Card
          position="absolute"
          top="100px"
          right={"50%"}
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
        left="10%"
        transform="translateY(10%)"
        roundedTop="xl"
        roundedBottom="none"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            {...register("text")}
            placeholder="Chitchat with the druid!"
            border="none"
            bg="gray.600"
          />
        </form>
      </Card>
    </Stack>
  );
};
