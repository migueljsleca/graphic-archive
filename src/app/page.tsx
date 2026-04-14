"use client";

import { useState } from "react";

import DesktopIcons from "@/components/DesktopIcons";
import DraggableAboutNotepad from "@/components/DraggableAboutNotepad";
import DraggableImagePreview from "@/components/DraggableImagePreview";
import DraggablePlayer from "@/components/DraggablePlayer";

export default function Home() {
  const [aboutVisible, setAboutVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [playerOpenVersion, setPlayerOpenVersion] = useState(0);

  const handleOpenAbout = () => {
    setAboutVisible(true);
  };

  const handleOpenThrowback = () => {
    if (!playerVisible) {
      setPlayerOpenVersion((current) => current + 1);
    }

    setPlayerVisible(true);
  };

  return (
    <main className="cutting-mat min-h-screen overflow-hidden">
      <DesktopIcons
        onOpenAbout={handleOpenAbout}
        onOpenImage={() => setImageVisible(true)}
        onOpenThrowback={handleOpenThrowback}
      />
      <DraggableAboutNotepad
        visible={aboutVisible}
        onClose={() => setAboutVisible(false)}
      />
      <DraggableImagePreview
        visible={imageVisible}
        onClose={() => setImageVisible(false)}
      />
      <DraggablePlayer
        openVersion={playerOpenVersion}
        visible={playerVisible}
        onClose={() => setPlayerVisible(false)}
      />
    </main>
  );
}
