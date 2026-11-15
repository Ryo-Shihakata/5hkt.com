// 旧ドメイン（5hkt.com / www.5hkt.com）へのアクセスを ryo.md へ恒久転送する。
// パスとクエリはそのまま引き継ぐ。ryo.md と *.pages.dev はそのまま配信する。
//
// REDIRECT は ryo.md が実際に開ける（Pages のカスタムドメインが active）ことを
// 確かめてから true にする。先に true にすると、5hkt.com が開けない転送先へ飛ぶ。
const REDIRECT = false;
const OLD_HOSTS = new Set(['5hkt.com', 'www.5hkt.com']);

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (REDIRECT && OLD_HOSTS.has(url.hostname)) {
    url.hostname = 'ryo.md';
    url.protocol = 'https:';
    url.port = '';
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
