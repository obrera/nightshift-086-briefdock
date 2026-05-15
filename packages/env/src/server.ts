import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    CORS_ORIGINS: z
      .string()
      .default('')
      .transform((val) =>
        val
          .split(',')
          .map((url) => url.trim())
          .filter(Boolean),
      )
      .pipe(z.array(z.string().url())),
    DATABASE_PATH: z.string().default('./data/briefdock.sqlite'),
    GITHUB_REPOS: z
      .string()
      .default('obrera/nightshift-085-relicforge,obrera/nightshift-agents,create-seed/templates')
      .transform((val) =>
        val
          .split(',')
          .map((repo) => repo.trim())
          .filter(Boolean),
      ),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    OPERATOR_PASSCODE: z.string().default('nightshift-086'),
    PORT: z.coerce.number().default(3000),
  },
})
