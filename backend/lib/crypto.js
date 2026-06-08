const { randomBytes, scryptSync, timingSafeEqual } = require('crypto')

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derivedKey}`
}

function verifyPassword(password, storedPassword) {
  const [salt, storedKey] = String(storedPassword || '').split(':')
  if (!salt || !storedKey) return false
  const derivedKey = scryptSync(password, salt, 64)
  const expectedKey = Buffer.from(storedKey, 'hex')
  if (derivedKey.length !== expectedKey.length) return false
  return timingSafeEqual(derivedKey, expectedKey)
}

function generateTemporaryPassword() {
  return randomBytes(6).toString('base64url')
}

module.exports = { hashPassword, verifyPassword, generateTemporaryPassword }
