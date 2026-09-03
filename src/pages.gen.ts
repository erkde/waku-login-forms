// deno-fmt-ignore-file
// biome-ignore format: generated types do not need formatting
// prettier-ignore
import type { PathsForPages, GetConfigResponse, SearchCodecsForPages } from 'waku/router';

// prettier-ignore
import type { getConfig as File_LoginClientAction_getConfig } from './pages/login/client-action';
// prettier-ignore
import type { getConfig as File_LoginNativeHtml_getConfig } from './pages/login/native-html';
// prettier-ignore
import type { getConfig as File_LoginOnsubmit_getConfig } from './pages/login/onsubmit';
// prettier-ignore
import type { getConfig as File_LoginServerAction_getConfig } from './pages/login/server-action';

// prettier-ignore
type Page =
| ({ path: '/login/client-action' } & GetConfigResponse<typeof File_LoginClientAction_getConfig>)
| ({ path: '/login/native-html' } & GetConfigResponse<typeof File_LoginNativeHtml_getConfig>)
| ({ path: '/login/onsubmit' } & GetConfigResponse<typeof File_LoginOnsubmit_getConfig>)
| ({ path: '/login/server-action' } & GetConfigResponse<typeof File_LoginServerAction_getConfig>);

// prettier-ignore
type Layout =
| { path: '/' };

// prettier-ignore
declare module 'waku/router' {
  interface RouteConfig {
    paths: PathsForPages<Page>;
  }
  interface CreatePagesConfig {
    pages: Page;
    layouts: Layout;
  }
  interface SearchCodecsConfig extends SearchCodecsForPages<Page> {}
}
