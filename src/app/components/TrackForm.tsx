import { TextField, Spinner } from "@radix-ui/themes";
import { useEffect, useState } from "react";

export default function TrackForm() {
  const [link, setLink] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  // This is disgusting and i need help
  useEffect(() => {
    if (isFetching) {
      console.log(link);
    }
  }, [isFetching, link]);

  return (
    <div>
      <TextField.Root
        value={link}
        onChange={(e) => setLink(e.target.value)}
        onPaste={() => setTimeout(() => setIsFetching(true))}
        disabled={isFetching}
        placeholder="Paste play link"
      >
        {isFetching && (
          <TextField.Slot side="right">
            <Spinner />
          </TextField.Slot>
        )}
      </TextField.Root>
    </div>
  );
}
