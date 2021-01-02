
export function handleRequest(req) {
  if (
    req.resourceType() == 'script' ||
    req.resourceType() == 'stylesheet' ||
    req.resourceType() == 'font' ||
    req.resourceType() == 'image'
  )
    req.abort()
  else
    req.continue()
}
