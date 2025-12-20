# [1.1.0-rc.15](https://github.com/janovix/auth/compare/v1.1.0-rc.14...v1.1.0-rc.15) (2025-12-20)


### Features

* **signup:** add 10s countdown before redirect to login after signup ([2fe25ce](https://github.com/janovix/auth/commit/2fe25ce7fb39588e0fdcc87d94e8e008a8f93efa))

# [1.1.0-rc.14](https://github.com/janovix/auth/compare/v1.1.0-rc.13...v1.1.0-rc.14) (2025-12-20)


### Features

* **auth:** improve verify email UI and signup verification message ([e8314ff](https://github.com/janovix/auth/commit/e8314ff26626f2125807e7150d4e2cae7e13c1a9))

# [1.1.0-rc.13](https://github.com/janovix/auth/compare/v1.1.0-rc.12...v1.1.0-rc.13) (2025-12-20)


### Bug Fixes

* add __name polyfill for next-themes esbuild compatibility ([98336f6](https://github.com/janovix/auth/commit/98336f6c0f064a72b633fafb949d91c93d967269))

# [1.1.0-rc.12](https://github.com/janovix/auth/compare/v1.1.0-rc.11...v1.1.0-rc.12) (2025-12-20)


### Features

* add email verification UI support ([0e6178e](https://github.com/janovix/auth/commit/0e6178e31eeeb9f4468b31881e6a5016174aa8d3))

# [1.1.0-rc.11](https://github.com/janovix/auth/compare/v1.1.0-rc.10...v1.1.0-rc.11) (2025-12-20)


### Features

* **auth:** add 60s cooldown timer on password reset request ([bca6da2](https://github.com/janovix/auth/commit/bca6da21820778f29b055b56a563d772b602eff5))

# [1.1.0-rc.10](https://github.com/janovix/auth/compare/v1.1.0-rc.9...v1.1.0-rc.10) (2025-12-20)


### Features

* add Turnstile widget to password recovery form ([609b15d](https://github.com/janovix/auth/commit/609b15d1226500a35b7e6338f18353831e10d27b))

# [1.1.0-rc.9](https://github.com/janovix/auth/compare/v1.1.0-rc.8...v1.1.0-rc.9) (2025-12-19)


### Bug Fixes

* update password reset to use Better Auth client methods ([76c9938](https://github.com/janovix/auth/commit/76c99380108bc800cc04f31f8efa34be877601dd))

# [1.1.0-rc.8](https://github.com/janovix/auth/compare/v1.1.0-rc.7...v1.1.0-rc.8) (2025-12-19)


### Bug Fixes

* **middleware:** validate session with auth service ([e8e7c80](https://github.com/janovix/auth/commit/e8e7c802be91e1e8e271c724444f051ab8b4eaf2))

# [1.1.0-rc.7](https://github.com/janovix/auth/compare/v1.1.0-rc.6...v1.1.0-rc.7) (2025-12-18)


### Features

* add redirect_to param and NEXT_PUBLIC_AUTH_REDIRECT_URL support ([ccef396](https://github.com/janovix/auth/commit/ccef3960ca09ee2279742f9de27c30fce1f45d55))

# [1.1.0-rc.6](https://github.com/janovix/auth/compare/v1.1.0-rc.5...v1.1.0-rc.6) (2025-12-17)


### Bug Fixes

* logout feature ([ae343cc](https://github.com/janovix/auth/commit/ae343cc0c2edac6515703a1d70797b93bfeae844))

# [1.1.0-rc.5](https://github.com/janovix/auth/compare/v1.1.0-rc.4...v1.1.0-rc.5) (2025-12-17)


### Bug Fixes

* response from success signin match ([9a128f3](https://github.com/janovix/auth/commit/9a128f3984ede41805eda33a482d2b7a11ab3887))

# [1.1.0-rc.4](https://github.com/janovix/auth/compare/v1.1.0-rc.3...v1.1.0-rc.4) (2025-12-17)


### Bug Fixes

* improved sdk avoiding code splitting ([6a01429](https://github.com/janovix/auth/commit/6a01429f57f52775828d3c440b4f6b56f8c8df8e))

# [1.1.0-rc.3](https://github.com/janovix/auth/compare/v1.1.0-rc.2...v1.1.0-rc.3) (2025-12-17)


### Bug Fixes

* problems with auth sdk initialization ([4086778](https://github.com/janovix/auth/commit/4086778b80629ee46af27fb95a4aceb21e87f23a))

# [1.1.0-rc.2](https://github.com/janovix/auth/compare/v1.1.0-rc.1...v1.1.0-rc.2) (2025-12-17)


### Bug Fixes

* **storybook:** add https:// to build-storybook.mjs env fallbacks ([fc38019](https://github.com/janovix/auth/commit/fc380199f45fc7ebd67fb89f0a6c7add224ba1ff))

# [1.1.0-rc.1](https://github.com/janovix/auth/compare/v1.0.0...v1.1.0-rc.1) (2025-12-17)


### Bug Fixes

* **auth:** ensure SDK initialization before component rendering ([af33986](https://github.com/janovix/auth/commit/af33986a5ad04003efa5d0cbf53c997d8639b05b))
* **auth:** use auth-svc.janovix.workers.dev for dev/preview environments ([1b55b37](https://github.com/janovix/auth/commit/1b55b3780646eae003e48fbb809d574a91119cc0))
* **config:** require https:// protocol and remove fallbacks for clearer errors ([25a8e15](https://github.com/janovix/auth/commit/25a8e15fff93189e63f191ae19c47b0bc375e907))
* integrate device detection hook and update component logic ([18a14df](https://github.com/janovix/auth/commit/18a14df66ce7361d4366ee4c2ca448cb5f3b7c29))
* **storybook:** add https:// to default env vars for Chromatic builds ([cf9f880](https://github.com/janovix/auth/commit/cf9f8802a4b8c871c054df2b70e4e0d8497c4644))
* **storybook:** install webpack as dev dependency for DefinePlugin ([c5253f9](https://github.com/janovix/auth/commit/c5253f9c9031db3f648d5f733e09bcdefb7b788c))
* **storybook:** set AUTH_CORE_BASE_URL environment variables for Storybook builds ([9015436](https://github.com/janovix/auth/commit/9015436bb962c493029db33473970f658e9b905d))


### Features

* Add animated background and loading skeleton to login page ([0014170](https://github.com/janovix/auth/commit/0014170e5c83b577c34f5235020d1daece2c81fa))
* Add auth pages and components ([6374275](https://github.com/janovix/auth/commit/6374275d8b6b270937e0d54c11188d213c0c307f))
* Add error handling and improve tests for auth components ([f7b60f6](https://github.com/janovix/auth/commit/f7b60f647f238846c5367dfb467ac31e23c8e65e))
* Add login animation and two-column layout ([f8443d5](https://github.com/janovix/auth/commit/f8443d548bd741ac83a9aa292b0f4545c6ada3d4))
* Add minimal scrollbar styling to globals.css ([3671a68](https://github.com/janovix/auth/commit/3671a680f9967b3cab65c5809e55700b5d39a6d5))
* Add real-time password validation to auth forms ([80b4fec](https://github.com/janovix/auth/commit/80b4fecd1cf590519f72bb4061879f8abba5926e))
* Add Storybook stories for UI components and pages ([52e2c6b](https://github.com/janovix/auth/commit/52e2c6bdef093850fa880543c0f9398303fc09a2))
* Add tests for auth components and utilities ([4d1b7c9](https://github.com/janovix/auth/commit/4d1b7c9fe227f4b3ad6f65b7360d4952cf4c70cd))
* **auth:** add Next.js middleware for session management and route protection ([b39ac7b](https://github.com/janovix/auth/commit/b39ac7ba2e9ce8df106f8104b26938c9cd64855e))
* **auth:** enhance LoginView with session handling and redirection ([6eeff25](https://github.com/janovix/auth/commit/6eeff25c6ac0f62eba8135df2436ca4865003ffb))
* **auth:** implement Next.js 16 proxy for session management and enhance AccountView with server-side session fetching ([b54a560](https://github.com/janovix/auth/commit/b54a56063a77ac0147b5e891db76839ca8b5b230))
* **auth:** implement SessionHydrator for improved session management in AccountView ([2e9f843](https://github.com/janovix/auth/commit/2e9f843b3db6909d79cac008eaf5c7395d25fb6d))
* **auth:** integrate @algenium/auth-next SDK for auth operations ([c0c3de2](https://github.com/janovix/auth/commit/c0c3de2ef508edd59b45a45496d22e07f4ca805d))
* Configure build env vars and dynamic rendering ([9a0180a](https://github.com/janovix/auth/commit/9a0180a044e9076acf73af2874eb0290f2e8f786))
* Mock next/navigation for Storybook ([9383c12](https://github.com/janovix/auth/commit/9383c1250511db9c89ffa786cfe60aadc805347b))
* updated layout and visuals, added animated background ([27b1314](https://github.com/janovix/auth/commit/27b1314acf502c5754f313ced16e3526df5e929a))

# [1.0.0-rc.15](https://github.com/janovix/auth/compare/v1.0.0-rc.14...v1.0.0-rc.15) (2025-12-17)


### Features

* Add minimal scrollbar styling to globals.css ([3671a68](https://github.com/janovix/auth/commit/3671a680f9967b3cab65c5809e55700b5d39a6d5))
* Configure build env vars and dynamic rendering ([9a0180a](https://github.com/janovix/auth/commit/9a0180a044e9076acf73af2874eb0290f2e8f786))

# [1.0.0-rc.14](https://github.com/janovix/auth/compare/v1.0.0-rc.13...v1.0.0-rc.14) (2025-12-17)


### Bug Fixes

* **storybook:** add https:// to default env vars for Chromatic builds ([cf9f880](https://github.com/janovix/auth/commit/cf9f8802a4b8c871c054df2b70e4e0d8497c4644))

# [1.0.0-rc.13](https://github.com/janovix/auth/compare/v1.0.0-rc.12...v1.0.0-rc.13) (2025-12-17)


### Bug Fixes

* **config:** require https:// protocol and remove fallbacks for clearer errors ([25a8e15](https://github.com/janovix/auth/commit/25a8e15fff93189e63f191ae19c47b0bc375e907))

# [1.0.0-rc.12](https://github.com/janovix/auth/compare/v1.0.0-rc.11...v1.0.0-rc.12) (2025-12-17)


### Bug Fixes

* **auth:** ensure SDK initialization before component rendering ([af33986](https://github.com/janovix/auth/commit/af33986a5ad04003efa5d0cbf53c997d8639b05b))

# [1.0.0-rc.11](https://github.com/janovix/auth/compare/v1.0.0-rc.10...v1.0.0-rc.11) (2025-12-17)


### Features

* **auth:** integrate @algenium/auth-next SDK for auth operations ([c0c3de2](https://github.com/janovix/auth/commit/c0c3de2ef508edd59b45a45496d22e07f4ca805d))

# [1.0.0-rc.10](https://github.com/janovix/auth/compare/v1.0.0-rc.9...v1.0.0-rc.10) (2025-12-17)


### Features

* Add Storybook stories for UI components and pages ([52e2c6b](https://github.com/janovix/auth/commit/52e2c6bdef093850fa880543c0f9398303fc09a2))
* Mock next/navigation for Storybook ([9383c12](https://github.com/janovix/auth/commit/9383c1250511db9c89ffa786cfe60aadc805347b))

# [1.0.0-rc.9](https://github.com/janovix/auth/compare/v1.0.0-rc.8...v1.0.0-rc.9) (2025-12-17)


### Features

* Add real-time password validation to auth forms ([80b4fec](https://github.com/janovix/auth/commit/80b4fecd1cf590519f72bb4061879f8abba5926e))

# [1.0.0-rc.8](https://github.com/janovix/auth/compare/v1.0.0-rc.7...v1.0.0-rc.8) (2025-12-17)


### Bug Fixes

* integrate device detection hook and update component logic ([18a14df](https://github.com/janovix/auth/commit/18a14df66ce7361d4366ee4c2ca448cb5f3b7c29))


### Features

* Add animated background and loading skeleton to login page ([0014170](https://github.com/janovix/auth/commit/0014170e5c83b577c34f5235020d1daece2c81fa))
* Add login animation and two-column layout ([f8443d5](https://github.com/janovix/auth/commit/f8443d548bd741ac83a9aa292b0f4545c6ada3d4))
* updated layout and visuals, added animated background ([27b1314](https://github.com/janovix/auth/commit/27b1314acf502c5754f313ced16e3526df5e929a))

# [1.0.0-rc.7](https://github.com/janovix/auth/compare/v1.0.0-rc.6...v1.0.0-rc.7) (2025-12-16)


### Features

* **auth:** implement SessionHydrator for improved session management in AccountView ([2e9f843](https://github.com/janovix/auth/commit/2e9f843b3db6909d79cac008eaf5c7395d25fb6d))

# [1.0.0-rc.6](https://github.com/janovix/auth/compare/v1.0.0-rc.5...v1.0.0-rc.6) (2025-12-16)


### Features

* **auth:** add Next.js middleware for session management and route protection ([b39ac7b](https://github.com/janovix/auth/commit/b39ac7ba2e9ce8df106f8104b26938c9cd64855e))

# [1.0.0-rc.5](https://github.com/janovix/auth/compare/v1.0.0-rc.4...v1.0.0-rc.5) (2025-12-16)


### Features

* **auth:** implement Next.js 16 proxy for session management and enhance AccountView with server-side session fetching ([b54a560](https://github.com/janovix/auth/commit/b54a56063a77ac0147b5e891db76839ca8b5b230))


# [1.0.0-rc.4](https://github.com/algtools/next-template/compare/v1.0.0-rc.3...v1.0.0-rc.4) (2025-12-14)


### Features

* Add core functionality ([1cfb1d8](https://github.com/algtools/next-template/commit/1cfb1d8bb6bd41aa3e7d2808b143d41c56d183dd))

# [1.0.0-rc.3](https://github.com/algtools/next-template/compare/v1.0.0-rc.2...v1.0.0-rc.3) (2025-12-13)


### Bug Fixes

* update CI workflow to skip Chromatic publishing on 'dev' branch ([17b1390](https://github.com/algtools/next-template/commit/17b1390591887196d224e5b7e6f214b824b93372))

# [1.0.0-rc.2](https://github.com/algtools/next-template/compare/v1.0.0-rc.1...v1.0.0-rc.2) (2025-12-13)


### Features

* integrate storybook ([72c57c8](https://github.com/algtools/next-template/commit/72c57c8bc2114ba1bfa9e993f479edf5198ec87c))

# 1.0.0-rc.1 (2025-12-13)


### Bug Fixes

* adding cf build script ([e4304da](https://github.com/algtools/next-template/commit/e4304dae686a6cabe53f20a6a88d73f6d6d1dbbe))


### Features

* add TodoApp component with local storage support and UI enhancements ([dd9a9e6](https://github.com/algtools/next-template/commit/dd9a9e68c5bccca24531aa595efd47143bc59ba4))
* Integrate SWR for data fetching and update TodoApp ([ee15a61](https://github.com/algtools/next-template/commit/ee15a6143cea5dacef562c97ee6ed7cd8f7241e6))

# 1.0.0 (2025-12-14)


### Bug Fixes

* adding cf build script ([e4304da](https://github.com/algtools/next-template/commit/e4304dae686a6cabe53f20a6a88d73f6d6d1dbbe))
* update CI workflow to skip Chromatic publishing on 'dev' branch ([17b1390](https://github.com/algtools/next-template/commit/17b1390591887196d224e5b7e6f214b824b93372))


### Features

* Add core functionality ([1cfb1d8](https://github.com/algtools/next-template/commit/1cfb1d8bb6bd41aa3e7d2808b143d41c56d183dd))
* add TodoApp component with local storage support and UI enhancements ([dd9a9e6](https://github.com/algtools/next-template/commit/dd9a9e68c5bccca24531aa595efd47143bc59ba4))
* integrate storybook ([72c57c8](https://github.com/algtools/next-template/commit/72c57c8bc2114ba1bfa9e993f479edf5198ec87c))
* Integrate SWR for data fetching and update TodoApp ([ee15a61](https://github.com/algtools/next-template/commit/ee15a6143cea5dacef562c97ee6ed7cd8f7241e6))

# Changelog

All notable changes to this project will be documented in this file.
