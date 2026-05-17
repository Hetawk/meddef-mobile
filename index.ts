import "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { registerRootComponent } from "expo";
import { scheduleSplashFailsafe } from "./src/lib/splash";

/** Keep native splash visible until App hides it (with a hard failsafe cap). */
void SplashScreen.preventAutoHideAsync();
scheduleSplashFailsafe();

import App from "./App";

registerRootComponent(App);
