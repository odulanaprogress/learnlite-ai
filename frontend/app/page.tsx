import Header from "../components/layout/Header";
import IngestPicker from "../components/ingest/IngestPicker";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <IngestPicker />
      </main>
    </>
  );
}