import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { useApiBase } from "@/context/ApiContext";
import {
  fetchRemoteVersion,
  getLocalAppVersion,
  isRemoteVersionNewer,
  openApkDownload,
  type RemoteVersionInfo,
} from "@/lib/appUpdate";

const DISMISS_KEY = "meddef_update_dismissed_v1";

type UpdateState = {
  visible: boolean;
  remote: RemoteVersionInfo | null;
  localVersion: string;
};

export function useAppUpdateCheck(enabled = true) {
  const { baseUrl, ready } = useApiBase();
  const [state, setState] = useState<UpdateState>({
    visible: false,
    remote: null,
    localVersion: getLocalAppVersion(),
  });
  const prompted = useRef(false);

  const promptUpdate = useCallback(
    async (remote: RemoteVersionInfo) => {
      const dismissed = await AsyncStorage.getItem(DISMISS_KEY);
      if (dismissed === remote.version) return;

      Alert.alert(
        "Update available",
        `MedDef ${remote.version} is available (you have ${getLocalAppVersion()}).${
          remote.releaseNotes ? `\n\n${remote.releaseNotes}` : ""
        }`,
        [
          {
            text: "Later",
            style: "cancel",
            onPress: () => {
              void AsyncStorage.setItem(DISMISS_KEY, remote.version);
            },
          },
          {
            text: "Download",
            onPress: () => {
              void openApkDownload(baseUrl, remote);
            },
          },
        ],
      );
    },
    [baseUrl],
  );

  useEffect(() => {
    if (!enabled || !ready || prompted.current) return;
    prompted.current = true;

    (async () => {
      const localVersion = getLocalAppVersion();
      const remote = await fetchRemoteVersion(baseUrl);
      if (!remote || !isRemoteVersionNewer(localVersion, remote.version)) {
        setState((s) => ({ ...s, localVersion }));
        return;
      }
      setState({ visible: true, remote, localVersion });
      await promptUpdate(remote);
    })();
  }, [baseUrl, enabled, ready, promptUpdate]);

  return state;
}
