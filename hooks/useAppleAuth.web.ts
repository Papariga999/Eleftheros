// Web stub — Apple Sign-In is iOS native only.
export const isAppleAuthAvailable = false;

interface Options { onSuccess: () => void; onError: (msg: string) => void }
export async function signInWithApple(_opts: Options): Promise<void> { return; }
