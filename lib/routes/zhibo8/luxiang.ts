import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/luxiang/:category?',
    radar: [
        {
            source: ['zhibo8.cc/:category/luxiang.htm'],
            target: '/luxiang/:category',
        },
    ],
    name: 'Unknown',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const rootUrl = 'https://www.zhibo8.cc';
    const { category = 'nba' } = ctx.req.param();
    const link = `${rootUrl}/${category}/luxiang.htm`;

    const response = await got(link);
    const $ = load(response.data);

    const list = $('.box')
        .toArray()
        .flatMap((item) => {
            item = $(item);
            const dateStr = item.find('h2').text().split(' ')[0];
            return item
                .find('a')
                .toArray()
                .map((item) => {
                    const href = $(item).attr('href');
                    return {
                        title: `${item.previousSibling.data.replace(' | ', '')} ${$(item).text()}`,
                        link: `${rootUrl}${href}`,
                        pubDate: timezone(parseDate(`${href.replace(`/${category}/`, '').slice(0, 4)} ${dateStr}`, 'YYYY M月D日'), +8),
                    };
                });
        });

    return {
        title: $('head title').text(),
        link,
        image: 'https://www.zhibo8.cc/favicon.ico',
        item: list,
    };
}
