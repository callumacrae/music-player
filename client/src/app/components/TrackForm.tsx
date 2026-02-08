import { useEffect, useState } from "react";
import Image from "next/image";
import { PlusIcon } from "@radix-ui/react-icons";
import { TextField, Spinner, Flex, Text, Button } from "@radix-ui/themes";
import * as spotify from "../../lib/players/spotify";
import { addTrack } from "../../lib/db";
import { useRouter } from "next/navigation";

export default function TrackForm({ onAdded }: { onAdded: () => void }) {
  const [link, setLink] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [trackDetails, setTrackDetails] =
    useState<spotify.SpotifyTrackDetails | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  // This is gross, what do instead?
  useEffect(() => {
    if (isFetching) {
      (async () => {
        const url = new URL(link);
        if (url.origin.includes("spotify")) {
          const details = await spotify.getDetailsFromURL(url);

          setIsFetching(false);
          setTrackDetails(details);
        } else {
          throw new Error("link type not supported");
        }
      })();
    }
  }, [isFetching, link]);

  async function addToLibrary() {
    if (!trackDetails) throw new Error("track details unexpectedly undefined");

    setIsAdding(true);
    await addTrack({
      rfidId: null,
      playerId: trackDetails.uri,
      image: trackDetails.image?.url || null,
      name: trackDetails.name,
      artistName: trackDetails.artistName,
    });
    router.refresh();
    onAdded();
  }

  return (
    <>
      <TextField.Root
        value={link}
        onChange={(e) => setLink(e.target.value)}
        onPaste={() => setTimeout(() => setIsFetching(true))}
        disabled={isFetching || !!trackDetails}
        placeholder="Paste play link"
      >
        {isFetching && (
          <TextField.Slot side="right">
            <Spinner />
          </TextField.Slot>
        )}
      </TextField.Root>

      {trackDetails && (
        <Flex gap="4" mt="4" align="center">
          {trackDetails.image && (
            <Image src={trackDetails.image.url} width={48} height={48} alt="" />
          )}
          <Flex direction="column">
            <Text weight="medium">{trackDetails.name}</Text>
            <Text>{trackDetails.artistName}</Text>
          </Flex>
          <Button ml="auto" onClick={addToLibrary} loading={isAdding}>
            <PlusIcon />
            Add
          </Button>
        </Flex>
      )}
    </>
  );
}
