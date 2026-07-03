import { beforeEach } from 'vitest'
import { resetStoreForTests } from '@/src/server/db'
import { setTestUserIdForTests } from '@/src/server/auth-helpers'

delete process.env.DATABASE_URL
process.env.VITEST = process.env.VITEST ?? '1'

export const TEST_USER_ID = 'test-user-alice'
export const OTHER_USER_ID = 'test-user-bob'

beforeEach(() => {
  resetStoreForTests()
  setTestUserIdForTests(TEST_USER_ID)
})
