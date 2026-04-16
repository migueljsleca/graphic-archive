"use client";

import { useEffect, useRef, useState } from "react";

import DesktopIcons from "@/components/DesktopIcons";
import DraggableAboutNotepad from "@/components/DraggableAboutNotepad";
import DraggableEditorialWindow from "@/components/DraggableEditorialWindow";
import DraggableImagePreview from "@/components/DraggableImagePreview";
import DraggablePostersWindow from "@/components/DraggablePostersWindow";
import DraggablePlayer from "@/components/DraggablePlayer";
import DraggableSettingsWindow from "@/components/DraggableSettingsWindow";
import GraphicArchiveTitle from "@/components/GraphicArchiveTitle";

type TitleControls = {
  weight: number;
  slant: number;
  elementShape: number;
  style: "double" | "single";
};

type SettingsMode = "cursor" | "manual";

export default function Home() {
  const [postersVisible, setPostersVisible] = useState(false);
  const [socialMediaVisible, setSocialMediaVisible] = useState(false);
  const [editorialVisible, setEditorialVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [playerOpenVersion, setPlayerOpenVersion] = useState(0);
  const [titleControls, setTitleControls] = useState<TitleControls>({
    weight: 527,
    slant: -3.5,
    elementShape: 48.5,
    style: "single",
  });
  const [settingsMode, setSettingsMode] = useState<SettingsMode>("cursor");
  const nextWindowZRef = useRef(107);
  const [windowZ, setWindowZ] = useState({
    posters: 101,
    socialMedia: 102,
    editorial: 103,
    about: 104,
    image: 105,
    settings: 106,
    player: 107,
  });

  const bringWindowToFront = (windowName: keyof typeof windowZ) => {
    nextWindowZRef.current += 1;
    setWindowZ((current) => ({
      ...current,
      [windowName]: nextWindowZRef.current,
    }));
  };

  useEffect(() => {
    if (settingsMode !== "cursor") {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const xProgress = Math.min(Math.max(event.clientX / window.innerWidth, 0), 1);
      const yProgress = Math.min(
        Math.max(event.clientY / window.innerHeight, 0),
        1,
      );
      const averageProgress = (xProgress + yProgress) / 2;

      setTitleControls({
        weight: Math.round(100 + xProgress * 800),
        slant: Math.round(-8 * averageProgress * 10) / 10,
        elementShape: Math.round(yProgress * 1000) / 10,
        style: titleControls.style,
      });
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [settingsMode, titleControls.style]);

  const handleOpenAbout = () => {
    setAboutVisible(true);
    bringWindowToFront("about");
  };

  const handleOpenSocialMedia = () => {
    setSocialMediaVisible(true);
    bringWindowToFront("socialMedia");
  };

  const handleOpenEditorial = () => {
    setEditorialVisible(true);
    bringWindowToFront("editorial");
  };

  const handleOpenPosters = () => {
    setPostersVisible(true);
    bringWindowToFront("posters");
  };

  const handleOpenImage = () => {
    setImageVisible(true);
    bringWindowToFront("image");
  };

  const handleOpenThrowback = () => {
    if (!playerVisible) {
      setPlayerOpenVersion((current) => current + 1);
    }

    setPlayerVisible(true);
    bringWindowToFront("player");
  };

  const handleOpenSettings = () => {
    setSettingsVisible(true);
    bringWindowToFront("settings");
  };

  return (
    <main className="cutting-mat min-h-screen overflow-hidden">
      <GraphicArchiveTitle
        onOpenSettings={handleOpenSettings}
        controls={titleControls}
      />
      <DesktopIcons
        onOpenPosters={handleOpenPosters}
        onOpenSocialMedia={handleOpenSocialMedia}
        onOpenEditorial={handleOpenEditorial}
        onOpenAbout={handleOpenAbout}
        onOpenImage={handleOpenImage}
        onOpenThrowback={handleOpenThrowback}
      />
      <DraggablePostersWindow
        apiPath="/api/posters"
        title="posters + misc"
        visible={postersVisible}
        onClose={() => setPostersVisible(false)}
        onFocus={() => bringWindowToFront("posters")}
        zIndex={windowZ.posters}
      />
      <DraggablePostersWindow
        apiPath="/api/social-media-graphics"
        title="social media graphics"
        visible={socialMediaVisible}
        onClose={() => setSocialMediaVisible(false)}
        onFocus={() => bringWindowToFront("socialMedia")}
        zIndex={windowZ.socialMedia}
      />
      <DraggableEditorialWindow
        visible={editorialVisible}
        onClose={() => setEditorialVisible(false)}
        onFocus={() => bringWindowToFront("editorial")}
        zIndex={windowZ.editorial}
      />
      <DraggableAboutNotepad
        visible={aboutVisible}
        onClose={() => setAboutVisible(false)}
        onFocus={() => bringWindowToFront("about")}
        zIndex={windowZ.about}
      />
      <DraggableImagePreview
        visible={imageVisible}
        onClose={() => setImageVisible(false)}
        onFocus={() => bringWindowToFront("image")}
        zIndex={windowZ.image}
      />
      <DraggableSettingsWindow
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onFocus={() => bringWindowToFront("settings")}
        zIndex={windowZ.settings}
        controls={titleControls}
        onControlsChange={setTitleControls}
        mode={settingsMode}
        onModeChange={setSettingsMode}
      />
      <DraggablePlayer
        openVersion={playerOpenVersion}
        visible={playerVisible}
        onClose={() => setPlayerVisible(false)}
        onFocus={() => bringWindowToFront("player")}
        zIndex={windowZ.player}
      />
    </main>
  );
}
