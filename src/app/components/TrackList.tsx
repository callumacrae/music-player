"use client";

import { PlusIcon } from "@radix-ui/react-icons";
import { Popover, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { Track } from "@/lib/music";
import TrackForm from "./TrackForm";

export default function TrackList({ trackList }: { trackList: Track[] }) {
  return (
    <>
      <Flex justify="between" mb={'4'}>
        <Heading>music</Heading>

        <Popover.Root>
          <Popover.Trigger>
            <Button>
              <PlusIcon />
              Add
            </Button>
          </Popover.Trigger>

          <Popover.Content width="400px" align="end">
            <TrackForm />
          </Popover.Content>
        </Popover.Root>
      </Flex>

      {trackList.map((track) => (
        <div key={track.id}>{track.playerId}</div>
      ))}
      {!trackList.length && <Text>No tracks found (yet)</Text>}
    </>
  );
}
