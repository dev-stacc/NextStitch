import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const searchMock = vi.fn()
vi.mock('duck-duck-scrape', () => ({
  search: searchMock,
  SafeSearchType: { OFF: -2, MODERATE: -1, STRICT: 1 },
}))

const { laughingMoonScraper } = await import('@/src/server/services/patterns/laughing_moon')

beforeEach(() => searchMock.mockReset())
afterEach(() => vi.clearAllMocks())

describe('laughing_moon scraper', () => {
  it('maps DDG results on the target site into hits', async () => {
    searchMock.mockResolvedValue({
      results: [
        { title: 'LM160 Croquet Dress 1860s', url: 'https://www.laughingmoonmercantile.com/product-page/160' },
        { title: 'Elsewhere', url: 'https://other-site.com/x' },
        { title: 'LM111 Civil War Gown', url: 'https://www.laughingmoonmercantile.com/product-page/111' },
      ],
    })
    const hits = await laughingMoonScraper.search('dress')
    expect(hits).toHaveLength(2)
    expect(hits[0]).toMatchObject({
      source: 'laughing_moon',
      title: 'LM160 Croquet Dress 1860s',
      url: 'https://www.laughingmoonmercantile.com/product-page/160',
    })
  })

  it('honours maxResults', async () => {
    searchMock.mockResolvedValue({
      results: Array.from({ length: 20 }, (_, i) => ({
        title: `LM${i}`,
        url: `https://www.laughingmoonmercantile.com/p/${i}`,
      })),
    })
    const hits = await laughingMoonScraper.search('anything', 3)
    expect(hits).toHaveLength(3)
  })

  it('returns [] when DDG has no results', async () => {
    searchMock.mockResolvedValue({ results: [] })
    expect(await laughingMoonScraper.search('nothing')).toEqual([])
  })
})
