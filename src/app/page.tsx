import { getTrackList } from "@/lib/db";
import TrackList from "./components/TrackList";

export default async function Home() {
  const trackList = await getTrackList();

  return <TrackList trackList={trackList} />;
}
