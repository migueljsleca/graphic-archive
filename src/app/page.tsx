import DesktopIcons from "@/components/DesktopIcons";
import DraggablePlayer from "@/components/DraggablePlayer";

export default function Home() {
  return (
    <main className="cutting-mat min-h-screen overflow-hidden">
      <DesktopIcons />
      <DraggablePlayer />
    </main>
  );
}
