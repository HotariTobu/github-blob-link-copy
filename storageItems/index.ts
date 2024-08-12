export const options = {
  linkSwitchThreshold: storage.defineItem('sync:linkSwitchThreshold', {
    fallback: 500,
  }),
  permalinkFirst: storage.defineItem('sync:permalinkFirst', {
    fallback: false,
  }),
} as const
