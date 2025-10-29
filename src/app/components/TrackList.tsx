"use client";

import { useState } from "react";
import { PlusIcon } from "@radix-ui/react-icons";
import { Popover, Button, Flex, Heading, Text } from "@radix-ui/themes";
import Image from "next/image";
import { Track } from "@/lib/db";
import AppLogins from "./AppLogins";
import TrackForm from "./TrackForm";

export default function TrackList({ trackList }: { trackList: Track[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <>
      <Flex mb="4" gap="4">
        <Heading mr="auto">music</Heading>

        <AppLogins />

        <Popover.Root open={isAddOpen} onOpenChange={setIsAddOpen}>
          <Popover.Trigger>
            <Button>
              <PlusIcon />
              Add track
            </Button>
          </Popover.Trigger>

          <Popover.Content width="400px" align="end">
            <TrackForm onAdded={() => setIsAddOpen(false)} />
          </Popover.Content>
        </Popover.Root>
      </Flex>

      <Flex direction="column" gap="3">
        {trackList.map((track) => (
          <Flex key={track.id} gap="4" align="center">
            {track.image && (
              <Image src={track.image} width={36} height={36} alt="" />
            )}
            <Text weight="medium">{track.name}</Text>
            <Text color="gray">{track.artistName}</Text>
          </Flex>
        ))}
        {!trackList.length && <Text>No tracks found (yet)</Text>}
      </Flex>
    </>
  );
}
