import { Button, Card, Heading, Stack, Text } from "@chakra-ui/react";
import { AppHeader } from "./common";

export const Welcome = ({ onPlay }: { onPlay: () => void }) => {
  return (
    <>
      <AppHeader title="Welcome!" />
      <Card as={Stack}>
        <Heading>Web Tree 🌳</Heading>
        <Text>Are you ready for your new home?</Text>
        <Button onClick={onPlay}>Connect & Play</Button>
      </Card>
    </>
  );
};
