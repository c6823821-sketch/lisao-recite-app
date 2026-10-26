import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { Linking, Platform } from 'react-native';

export interface UpdateManifest {
  version: string;
  versionCode: number;
  downloadUrl: string;
  mirrorDownloadUrl: string;
  sizeBytes?: number;
  sha256?: string;
  notes: string[];
}

export interface DownloadProgress {
  downloadedBytes: number;
  totalBytes: number;
  ratio: number;
}

const VERSION_URLS = [
  'https://raw.githubusercontent.com/c6823821-sketch/lisao-recite-app/main/version.json',
  'https://ghfast.top/https://raw.githubusercontent.com/c6823821-sketch/lisao-recite-app/main/version.json',
];

const RELEASE_PAGE = 'https://github.com/c6823821-sketch/lisao-recite-app/releases/latest';

export const INSTALLED_VERSION = Application.nativeApplicationVersion
  ?? Constants.expoConfig?.version
  ?? '1.0.1';

export const INSTALLED_BUILD = Number(Application.nativeBuildVersion ?? Constants.expoConfig?.android?.versionCode ?? 0);

export function isVersionNewer(candidate: string, installed: string): boolean {
  const left = candidate.split('.').map((part) => Number.parseInt(part, 10) || 0);
  const right = installed.split('.').map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference !== 0) return difference > 0;
  }
  return false;
}

async function fetchJson(url: string): Promise<UpdateManifest> {
  const separator = url.includes('?') ? '&' : '?';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  let value: Partial<UpdateManifest>;
  try {
    const response = await fetch(`${url}${separator}t=${Date.now()}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`更新服务器返回 HTTP ${response.status}`);
    value = await response.json() as Partial<UpdateManifest>;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('检查更新超时，请稍后重试。');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
  if (!value.version || !value.downloadUrl || !value.mirrorDownloadUrl || !Array.isArray(value.notes)) {
    throw new Error('更新清单格式不完整。');
  }
  return {
    version: value.version,
    versionCode: Number(value.versionCode ?? 0),
    downloadUrl: value.downloadUrl,
    mirrorDownloadUrl: value.mirrorDownloadUrl,
    sizeBytes: Number(value.sizeBytes ?? 0) || undefined,
    sha256: value.sha256,
    notes: value.notes.filter((note): note is string => typeof note === 'string' && Boolean(note.trim())),
  };
}

export async function checkForUpdate(): Promise<UpdateManifest | null> {
  let lastError: unknown;
  for (const url of VERSION_URLS) {
    try {
      const manifest = await fetchJson(url);
      return isVersionNewer(manifest.version, INSTALLED_VERSION) ? manifest : null;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('无法连接更新服务器。');
}

export async function openReleasePage(): Promise<void> {
  await Linking.openURL(RELEASE_PAGE);
}

export async function downloadAndInstallApk(
  manifest: UpdateManifest,
  onProgress: (progress: DownloadProgress) => void,
): Promise<void> {
  if (Platform.OS !== 'android') {
    await openReleasePage();
    return;
  }
  if (!FileSystem.documentDirectory) throw new Error('没有可用的本机下载目录。');

  const target = `${FileSystem.documentDirectory}lisao-recite-${manifest.version}.apk`;
  let lastError: unknown;
  for (const url of [manifest.mirrorDownloadUrl, manifest.downloadUrl]) {
    try {
      const download = FileSystem.createDownloadResumable(
        url,
        target,
        {},
        (event) => {
          const total = event.totalBytesExpectedToWrite || manifest.sizeBytes || 0;
          onProgress({
            downloadedBytes: event.totalBytesWritten,
            totalBytes: total,
            ratio: total > 0 ? Math.min(1, event.totalBytesWritten / total) : 0,
          });
        },
      );
      const result = await download.downloadAsync();
      if (!result?.uri) throw new Error('下载没有生成安装包。');
      const contentUri = await FileSystem.getContentUriAsync(result.uri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        type: 'application/vnd.android.package-archive',
        flags: 1,
      });
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('安装包下载失败。');
}
