import { Slot } from "expo-router";
import { Providers } from "../lib/providers/providers";

export default function HomeLayout(): React.JSX.Element {
  return (
    <Providers>
      <Slot />
    </Providers>
  );
}
