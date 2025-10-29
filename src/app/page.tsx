import { getTrackList } from "@/lib/music";
import TrackList from "./components/TrackList";

export default async function Home() {
  const trackList = await getTrackList();

  return <TrackList trackList={trackList} />;
}
