/**
 * Native share helper used by detection reports, disease detail pages and alerts.
 * Prefers the Web Share API and falls back to copying a plain-text summary.
 */

export interface ShareContent {
  title?: string
  text?: string
  url?: string
}

export type ShareStatus = 'shared' | 'copied' | 'failed'

const isAbort = (error: unknown): boolean => {
  const name = (error as { name?: string } | null)?.name;
  return name === 'AbortError' || name === 'NotAllowedError';
};

/** Copy text using the async clipboard API, with a legacy fallback. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

/**
 * Share content through the device share sheet. If the API is unavailable or
 * cancelled, copy the same text to the clipboard instead.
 */
export async function shareContent(content: ShareContent): Promise<ShareStatus> {
  const text = [content.text, content.url].filter(Boolean).join('\n\n');

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: content.title,
        text: content.text,
        url: content.url,
      });
      return 'shared';
    } catch (error) {
      if (isAbort(error)) return 'failed';
      // Fall through to clipboard for unsupported/denied share sheets.
    }
  }

  return (await copyText(text)) ? 'copied' : 'failed';
}
