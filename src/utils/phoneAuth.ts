const PHONE_AUTH_DOMAIN = 'mural.jtfh.internal'

/**
 * O Firebase Authentication (e-mail/senha) não tem suporte nativo a login
 * por número de telefone. Para permitir que voluntários entrem usando o
 * celular, convertemos o número num e-mail sintético e único (ex:
 * "11987654321@mural.jtfh.internal"). Se o valor já for um e-mail, ele é
 * usado sem alterações.
 */
export function toAuthEmail(identifier: string): string {
  const trimmed = identifier.trim()

  if (trimmed.includes('@')) {
    return trimmed
  }

  const digits = trimmed.replace(/\D/g, '')
  return `${digits}@${PHONE_AUTH_DOMAIN}`
}
