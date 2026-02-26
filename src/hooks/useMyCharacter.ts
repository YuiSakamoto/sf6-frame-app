import { useMemo } from "react";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useDataStore } from "@/stores/useDataStore";

export function useMyCharacter() {
  const myCharacterSlug = useSettingsStore((s) => s.myCharacterSlug);
  const setMyCharacter = useSettingsStore((s) => s.setMyCharacter);
  const characters = useDataStore((s) => s.characters);

  const myCharacter = useMemo(
    () => characters.find((c) => c.slug === myCharacterSlug) ?? null,
    [characters, myCharacterSlug],
  );

  return {
    myCharacter,
    myCharacterSlug,
    setMyCharacter,
    isSet: myCharacterSlug !== null,
  };
}
