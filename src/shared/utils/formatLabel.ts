const acquisitionChannelMap: Record<string, string> = {
  codef_direct: 'API자동등록',
}

export function formatAcquisitionChannel(value: string | null | undefined): string {
  if (!value) return '-'
  return acquisitionChannelMap[value] ?? value
}
