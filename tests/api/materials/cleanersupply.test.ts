import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const searchMock = vi.fn()
vi.mock('duck-duck-scrape', () => ({
  search: searchMock,
  SafeSearchType: { OFF: -2, MODERATE: -1, STRICT: 1 },
}))

const { cleanersupplyScraper } = await import('@/src/server/services/materials/cleanersupply')

beforeEach(() => searchMock.mockReset())
afterEach(() => vi.clearAllMocks())

describe('cleanersupply scraper', () => {
  it('maps DDG hits and filters to the target site', async () => {
    searchMock.mockResolvedValue({
      results: [
        { title: 'Tailor Shears', url: 'https://cleanersupply.ca/tailor-shears' },
        { title: 'Elsewhere', url: 'https://other-site.com/x' },
        { title: 'Chalk', url: 'https://cleanersupply.ca/chalk' },
      ],
    })
    const hits = await cleanersupplyScraper.search('shears')
    expect(hits).toHaveLength(2)
    expect(hits[0]).toMatchObject({
      source: 'cleanersupply',
      title: 'Tailor Shears',
      url: 'https://cleanersupply.ca/tailor-shears',
    })
  })

  it('returns [] when DDG has no results', async () => {
    searchMock.mockResolvedValue({ results: [] })
    expect(await cleanersupplyScraper.search('nothing')).toEqual([])
  })
})
