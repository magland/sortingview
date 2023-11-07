
import { BOOKMARK_BUTTON } from './PlaybackBookmarkButton'
import { CROP_BUTTON } from './PlaybackCropWindowButton'
import { SYNC_BUTTON } from './PlaybackSyncWindowButton'

export type PlaybackOptionalButtons = typeof SYNC_BUTTON | typeof CROP_BUTTON | typeof BOOKMARK_BUTTON

// TODO: Re-export the buttons?
// TODO: This should be an index file?
