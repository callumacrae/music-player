import { Button, DropdownMenu } from "@radix-ui/themes";
import {
  requestAuth as requestAuthSpotify,
  getIsAuthed as getIsAuthedSpotify,
} from "@/lib/players/spotify";
import { useEffect, useState } from "react";
import { CheckCircledIcon } from "@radix-ui/react-icons";

export default function AppLogins() {
  const [isAuthedSpotify, setIsAuthedSpotify] = useState(false);

  useEffect(() => {
    (async () => {
      setIsAuthedSpotify(await getIsAuthedSpotify());
    })();
  }, []);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="outline">Auth</Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="end">
        {isAuthedSpotify ? (
          <DropdownMenu.Item>
            <CheckCircledIcon />
            Authed with Spotify
          </DropdownMenu.Item>
        ) : (
          <DropdownMenu.Item onClick={requestAuthSpotify}>
            Log in with Spotify
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
