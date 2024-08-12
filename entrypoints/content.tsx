import { options } from '@/storageItems'
import { createRoot } from 'react-dom/client'
import { toast, Toaster } from 'sonner'
import { z } from 'zod'

export default defineContentScript({
  matches: ['*://*.github.com/*/blob/*'],
  main: async () => {
    linkSwitchThreshold = await options.linkSwitchThreshold.getValue()
    permalinkFirst = await options.permalinkFirst.getValue()

    addToaster()
    document.addEventListener('copy', handleCopy)
  },
})

let linkSwitchThreshold: number
let permalinkFirst: boolean
let lastTimeStamp = 0
let copyCount = 0

const appDataScriptQuery = 'script[data-target="react-app.embeddedData"]'
const appDataSchema = z.object({
  payload: z.object({
    refInfo: z.object({
      name: z.string().min(1),
      refType: z.literal('branch'),
    }),
  }),
})

const commitAnchorQuery = 'a[href*="commit/"]'
const commitHashRegex = /[0-9a-f]{40}/

const lineRangeRegex = /#.+$/

const addToaster = () => {
  const toasterContainer = document.createElement('div')
  document.body.appendChild(toasterContainer)

  createRoot(toasterContainer).render(<Toaster />)
}

const getBranchName = () => {
  const appDataScript = document.querySelector(appDataScriptQuery)
  if (appDataScript === null) {
    console.error('Cannot find the app data script element.')
    return null
  }

  const appDataString = appDataScript.textContent
  if (appDataString === null) {
    console.error('App data string was null.')
    return null
  }

  const rawAppData = JSON.parse(appDataString)
  const parseResult = appDataSchema.safeParse(rawAppData)
  if (parseResult.success) {
    const { name } = parseResult.data.payload.refInfo
    return name
  } else {
    console.error('Cannot extract the branch name.')
    return null
  }
}

const getCommitHash = () => {
  const commitAnchor =
    document.querySelector<HTMLAnchorElement>(commitAnchorQuery)
  if (commitAnchor === null) {
    console.error('Cannot find any commit anchor element.')
    return null
  }

  const match = commitHashRegex.exec(commitAnchor.href)
  if (match === null) {
    console.error('Cannot extract the commit hash.')
    return null
  }

  const commitHash = match[0]
  return commitHash
}

const getLineRange = (url: string) => {
  const match = lineRangeRegex.exec(url)
  if (match === null) {
    return ''
  } else {
    return match[0]
  }
}

const handleCopy = (event: ClipboardEvent) => {
  const { clipboardData, timeStamp } = event
  if (clipboardData === null) {
    return
  }

  const selection = document.getSelection()
  if (selection === null) {
    return
  }

  const selected = selection.toString()
  if (selected.length > 0) {
    return
  }

  const { href } = location

  const setUrl = (url: string) => {
    clipboardData.setData('text/uri-list', url)
    clipboardData.setData('text/plain', url)
  }

  const copyLink = () => {
    const url = href
    setUrl(url)
    toast(`Link copied! ${getLineRange(url)}`)
  }

  const copyPermalink = () => {
    const branchName = getBranchName()
    const commitHash = getCommitHash()
    if (branchName === null || commitHash === null) {
      return
    }

    const url = href.replace(branchName, commitHash)
    setUrl(url)
    toast(`Permalink copied! ${getLineRange(url)}`)
  }

  const elapsedTime = timeStamp - lastTimeStamp
  lastTimeStamp = timeStamp

  if (linkSwitchThreshold < elapsedTime) {
    copyCount = 0
  } else {
    copyCount += 1
  }

  const copyActions = permalinkFirst
    ? [copyPermalink, copyLink]
    : [copyLink, copyPermalink]

  const copyAction = copyActions[copyCount % copyActions.length]
  copyAction()

  event.preventDefault()
}
