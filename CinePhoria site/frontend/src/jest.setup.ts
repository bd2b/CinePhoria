import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ([]), // ✅ tableau vide simulé
  }) as any;