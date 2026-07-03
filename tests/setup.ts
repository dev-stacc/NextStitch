import { beforeEach } from 'vitest'
import { resetStoreForTests } from '@/src/server/db'
import { setTestUserIdForTests } from '@/src/server/auth-helpers'

// Ensure the memory-backed store is used and cleared before each test, and
// that the auth helper falls back to the in-test override instead of touching
// NextAuth.
delete process.env.DATABASE_URL
process.env.VITEST = process.env.VITEST ?? '1'

export const TEST_USER_ID = 'test-user-alice'
export const OTHER_USER_ID = 'test-user-bob'

beforeEach(() => {
  resetStoreForTests()
  setTestUserIdForTests(TEST_USER_ID)
})
