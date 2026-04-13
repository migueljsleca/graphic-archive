"use client";

import { useState } from "react";

import DesktopIcons from "@/components/DesktopIcons";
import DraggablePlayer from "@/components/DraggablePlayer";

export default function Home() {
  const [playerVisible, setPlayerVisible] = useState(true);

  return (
    <main className="cutting-mat min-h-screen overflow-hidden">
      <DesktopIcons onOpenThrowback={() => setPlayerVisible(true)} />
      <DraggablePlayer
        visible={playerVisible}
        onClose={() => setPlayerVisible(false)}
      />
    </main>
  );
}
